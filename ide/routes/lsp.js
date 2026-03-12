import { WebSocketServer } from 'ws';
import { createServerProcess, createWebSocketConnection, forward } from 'vscode-ws-jsonrpc/server';

/**
 * Attach Lua Language Server WebSocket proxy to the HTTP server.
 *
 * When a browser connects to /lsp, this:
 *  1. Spawns lua-language-server as a child process
 *  2. Bridges the WebSocket to the LSP process stdio using LSP Content-Length framing
 *  3. Cleans up both sides on disconnect/exit
 *
 * If lsPath is empty or falsy, LSP is disabled gracefully — the IDE still works.
 *
 * @param {import('http').Server} httpServer
 * @param {string} lsPath  Path to lua-language-server binary (e.g. C:\tools\lua-language-server\bin\lua-language-server.exe)
 */
export function attachLspProxy(httpServer, lsPath) {
  if (!lsPath) {
    console.log('  LSP:     disabled (lsPath not configured in config.json)');
    return;
  }

  const wss = new WebSocketServer({ server: httpServer, path: '/lsp' });

  wss.on('connection', (ws) => {
    // Wrap the raw WebSocket with vscode-ws-jsonrpc's IWebSocket interface
    const socket = {
      send: (content) => ws.send(content),
      onMessage: (cb) => ws.on('message', cb),
      onError: (cb) => ws.on('error', cb),
      onClose: (cb) => ws.on('close', cb),
      dispose: () => ws.close(),
    };

    // Create LSP client connection from the WebSocket
    const clientConnection = createWebSocketConnection(socket);

    // Spawn lua-language-server process
    const serverConnection = createServerProcess(
      'lua-language-server',
      lsPath,
      [],
      { shell: false }
    );

    if (!serverConnection) {
      console.error('LSP: Failed to spawn lua-language-server — process connection is undefined');
      ws.close();
      return;
    }

    // Bridge client <-> server (forwards messages both ways, cleans up on close)
    forward(clientConnection, serverConnection);

    clientConnection.onClose(() => {
      serverConnection.dispose();
    });
    serverConnection.onClose(() => {
      clientConnection.dispose();
    });
  });

  console.log(`  LSP:     WebSocket proxy listening at /lsp`);
}
