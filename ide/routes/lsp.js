import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';
import { resolve } from 'path';

/**
 * Attach Lua Language Server WebSocket proxy to the HTTP server.
 *
 * Spawns lua-language-server per WebSocket connection and bridges
 * JSON-RPC messages between the WebSocket and the process stdio.
 * Intercepts workspace/configuration requests to inject Love2D settings.
 */
export function attachLspProxy(httpServer, lsPath, projectPath) {
  if (!lsPath) {
    console.log('  LSP:     disabled (lsPath not configured in config.json)');
    return;
  }

  // Resolve Love2D API library path
  const loveApiLib = resolve(lsPath, '../../../love2d-api/library');

  // Settings to send when server asks for workspace/configuration
  const luaSettings = {
    'Lua.workspace.library': [loveApiLib],
    'Lua.runtime.version': 'LuaJIT',
    'Lua.diagnostics.globals': ['love'],
  };

  const wss = new WebSocketServer({ server: httpServer, path: '/lsp' });

  wss.on('connection', (ws) => {
    const lsProc = spawn(lsPath, [], {
      cwd: projectPath || undefined,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    if (!lsProc.pid) {
      console.error('LSP: Failed to spawn lua-language-server');
      ws.close();
      return;
    }

    // Track pending workspace/configuration request IDs from the server
    const configRequestIds = new Set();

    lsProc.stderr.on('data', (chunk) => {
      console.error('LSP stderr:', chunk.toString());
    });

    function sendToLsp(jsonStr) {
      const frame = `Content-Length: ${Buffer.byteLength(jsonStr)}\r\n\r\n${jsonStr}`;
      if (lsProc.stdin.writable) {
        lsProc.stdin.write(frame);
      }
    }

    // Buffer for incomplete LSP messages from stdout
    let stdoutBuf = '';

    lsProc.stdout.on('data', (chunk) => {
      stdoutBuf += chunk.toString();

      while (true) {
        const headerEnd = stdoutBuf.indexOf('\r\n\r\n');
        if (headerEnd === -1) break;

        const header = stdoutBuf.slice(0, headerEnd);
        const match = header.match(/Content-Length:\s*(\d+)/i);
        if (!match) {
          stdoutBuf = stdoutBuf.slice(headerEnd + 4);
          continue;
        }

        const contentLen = parseInt(match[1], 10);
        const bodyStart = headerEnd + 4;
        if (stdoutBuf.length < bodyStart + contentLen) break;

        const body = stdoutBuf.slice(bodyStart, bodyStart + contentLen);
        stdoutBuf = stdoutBuf.slice(bodyStart + contentLen);

        // Intercept workspace/configuration requests from the server
        try {
          const parsed = JSON.parse(body);
          if (parsed.method === 'workspace/configuration' && parsed.id != null) {
            // Respond directly with our settings instead of forwarding to client
            const items = parsed.params?.items || [];
            const result = items.map(item => {
              const section = item.section || '';
              // Return flat settings for the requested section
              const response = {};
              for (const [key, value] of Object.entries(luaSettings)) {
                if (key.startsWith(section + '.')) {
                  // Convert "Lua.workspace.library" → nested { workspace: { library: [...] } }
                  const parts = key.slice(section.length + 1).split('.');
                  let obj = response;
                  for (let i = 0; i < parts.length - 1; i++) {
                    obj[parts[i]] = obj[parts[i]] || {};
                    obj = obj[parts[i]];
                  }
                  obj[parts[parts.length - 1]] = value;
                } else if (key === section) {
                  return value;
                }
              }
              return Object.keys(response).length > 0 ? response : {};
            });

            const responseMsg = JSON.stringify({
              jsonrpc: '2.0',
              id: parsed.id,
              result,
            });
            console.log('LSP: config request items:', JSON.stringify(parsed.params?.items));
            console.log('LSP: config response:', JSON.stringify(result));
            sendToLsp(responseMsg);
            // Don't forward this request to the browser
            continue;
          }
        } catch {}

        if (ws.readyState === 1) {
          ws.send(body);
        }
      }
    });

    // Browser → LSP process
    ws.on('message', (data) => {
      let msg = typeof data === 'string' ? data : data.toString();

      // Log and patch messages from browser
      try {
        const parsed = JSON.parse(msg);
        if (parsed.method === 'initialize' && parsed.params) {
          if (!parsed.params.capabilities) parsed.params.capabilities = {};
          if (!parsed.params.capabilities.workspace) parsed.params.capabilities.workspace = {};
          parsed.params.capabilities.workspace.configuration = true;
          msg = JSON.stringify(parsed);
        }
        if (parsed.method === 'textDocument/didOpen') {
          console.log('LSP << didOpen:', parsed.params?.textDocument?.uri);
        }
        if (parsed.method === 'textDocument/completion') {
          console.log('LSP << completion:', parsed.params?.textDocument?.uri, 'pos:', JSON.stringify(parsed.params?.position));
        }
      } catch {}

      sendToLsp(msg);
    });

    ws.on('close', () => {
      lsProc.kill();
    });

    lsProc.on('exit', () => {
      if (ws.readyState === 1) ws.close();
    });
  });

  console.log(`  LSP:     WebSocket proxy listening at /lsp`);
}
