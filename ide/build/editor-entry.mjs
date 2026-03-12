import * as monaco from 'monaco-editor';
import { MonacoLanguageClient } from 'monaco-languageclient';
import { WebSocketMessageReader, WebSocketMessageWriter } from 'vscode-ws-jsonrpc/socket';

// Tell Monaco where to find its web worker
self.MonacoEnvironment = {
  getWorkerUrl: function (_moduleId, _label) {
    return '/editor.worker.js';
  },
};

// ---------------------------------------------------------------------------
// Catppuccin Mocha — dark theme
// ---------------------------------------------------------------------------
monaco.editor.defineTheme('catppuccin-mocha', {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6c7086', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'cba6f7' },
    { token: 'keyword.operator', foreground: '94e2d5' },
    { token: 'string', foreground: 'a6e3a1' },
    { token: 'string.escape', foreground: 'fab387' },
    { token: 'number', foreground: 'fab387' },
    { token: 'number.float', foreground: 'fab387' },
    { token: 'delimiter', foreground: 'cdd6f4' },
    { token: 'delimiter.bracket', foreground: 'cdd6f4' },
    { token: 'delimiter.parenthesis', foreground: 'cdd6f4' },
    { token: 'delimiter.square', foreground: 'cdd6f4' },
    { token: 'identifier', foreground: '89dceb' },
    { token: 'type', foreground: '89b4fa' },
    { token: 'type.identifier', foreground: '89b4fa' },
    { token: 'variable', foreground: 'cdd6f4' },
    { token: 'variable.parameter', foreground: 'f2cdcd' },
    { token: 'function', foreground: 'f9e2af' },
    { token: 'method', foreground: 'f9e2af' },
    { token: 'operator', foreground: '94e2d5' },
    { token: 'constant', foreground: 'f38ba8' },
    { token: 'constant.language', foreground: 'f38ba8' },
    { token: 'support.function', foreground: '89b4fa' },
  ],
  colors: {
    'editor.background': '#1e1e2e',
    'editor.foreground': '#cdd6f4',
    'editor.lineHighlightBackground': '#313244',
    'editor.selectionBackground': '#45475a',
    'editor.selectionHighlightBackground': '#45475a80',
    'editor.inactiveSelectionBackground': '#313244',
    'editor.findMatchBackground': '#f9e2af40',
    'editor.findMatchHighlightBackground': '#f9e2af20',
    'editorCursor.foreground': '#f5e0dc',
    'editorLineNumber.foreground': '#585b70',
    'editorLineNumber.activeForeground': '#a6adc8',
    'editorIndentGuide.background': '#313244',
    'editorIndentGuide.activeBackground': '#585b70',
    'editorBracketMatch.background': '#45475a80',
    'editorBracketMatch.border': '#89b4fa',
    'editorWhitespace.foreground': '#45475a',
    'editorRuler.foreground': '#313244',
    'editorOverviewRuler.border': '#1e1e2e',
    'scrollbar.shadow': '#1e1e2e',
    'scrollbarSlider.background': '#45475a80',
    'scrollbarSlider.hoverBackground': '#585b70',
    'scrollbarSlider.activeBackground': '#6c7086',
    'sideBar.background': '#181825',
    'sideBar.foreground': '#cdd6f4',
    'sideBarSectionHeader.background': '#1e1e2e',
    'minimap.background': '#1e1e2e',
    'editorWidget.background': '#181825',
    'editorWidget.border': '#313244',
    'editorSuggestWidget.background': '#181825',
    'editorSuggestWidget.border': '#313244',
    'editorSuggestWidget.selectedBackground': '#313244',
    'input.background': '#313244',
    'input.foreground': '#cdd6f4',
    'input.border': '#45475a',
    'focusBorder': '#cba6f7',
    'button.background': '#cba6f7',
    'button.foreground': '#1e1e2e',
  },
});

// ---------------------------------------------------------------------------
// Catppuccin Latte — light theme
// ---------------------------------------------------------------------------
monaco.editor.defineTheme('catppuccin-latte', {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '9ca0b0', fontStyle: 'italic' },
    { token: 'keyword', foreground: '8839ef' },
    { token: 'keyword.operator', foreground: '179299' },
    { token: 'string', foreground: '40a02b' },
    { token: 'string.escape', foreground: 'fe640b' },
    { token: 'number', foreground: 'fe640b' },
    { token: 'number.float', foreground: 'fe640b' },
    { token: 'delimiter', foreground: '4c4f69' },
    { token: 'delimiter.bracket', foreground: '4c4f69' },
    { token: 'delimiter.parenthesis', foreground: '4c4f69' },
    { token: 'delimiter.square', foreground: '4c4f69' },
    { token: 'identifier', foreground: '04a5e5' },
    { token: 'type', foreground: '1e66f5' },
    { token: 'type.identifier', foreground: '1e66f5' },
    { token: 'variable', foreground: '4c4f69' },
    { token: 'variable.parameter', foreground: 'dd7878' },
    { token: 'function', foreground: 'df8e1d' },
    { token: 'method', foreground: 'df8e1d' },
    { token: 'operator', foreground: '179299' },
    { token: 'constant', foreground: 'd20f39' },
    { token: 'constant.language', foreground: 'd20f39' },
    { token: 'support.function', foreground: '1e66f5' },
  ],
  colors: {
    'editor.background': '#eff1f5',
    'editor.foreground': '#4c4f69',
    'editor.lineHighlightBackground': '#e6e9ef',
    'editor.selectionBackground': '#acb0be',
    'editor.selectionHighlightBackground': '#acb0be80',
    'editor.inactiveSelectionBackground': '#e6e9ef',
    'editorCursor.foreground': '#dc8a78',
    'editorLineNumber.foreground': '#9ca0b0',
    'editorLineNumber.activeForeground': '#6c6f85',
    'editorIndentGuide.background': '#dce0e8',
    'editorIndentGuide.activeBackground': '#9ca0b0',
    'editorBracketMatch.background': '#acb0be80',
    'editorBracketMatch.border': '#1e66f5',
    'editorWhitespace.foreground': '#acb0be',
    'editorRuler.foreground': '#dce0e8',
    'scrollbarSlider.background': '#acb0be80',
    'scrollbarSlider.hoverBackground': '#9ca0b0',
    'scrollbarSlider.activeBackground': '#6c6f85',
    'sideBar.background': '#e6e9ef',
    'sideBar.foreground': '#4c4f69',
    'editorWidget.background': '#e6e9ef',
    'editorWidget.border': '#dce0e8',
    'editorSuggestWidget.background': '#e6e9ef',
    'editorSuggestWidget.border': '#dce0e8',
    'editorSuggestWidget.selectedBackground': '#dce0e8',
    'input.background': '#dce0e8',
    'input.foreground': '#4c4f69',
    'input.border': '#acb0be',
    'focusBorder': '#8839ef',
    'button.background': '#8839ef',
    'button.foreground': '#eff1f5',
  },
});

// ---------------------------------------------------------------------------
// LSP client — connects Monaco to lua-language-server via WebSocket
// ---------------------------------------------------------------------------

/**
 * Connect to the Lua Language Server WebSocket proxy.
 * Creates a MonacoLanguageClient that bridges the /lsp endpoint to Monaco.
 *
 * Safe to call even if LSP is not configured on the server — it will just fail
 * silently after the WebSocket connection attempt times out or is refused.
 *
 * @param {string} wsUrl  e.g. 'ws://localhost:3000/lsp'
 */
function connectLsp(wsUrl) {
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    const socket = toIWebSocket(ws);
    const reader = new WebSocketMessageReader(socket);
    const writer = new WebSocketMessageWriter(socket);

    const client = new MonacoLanguageClient({
      name: 'Lua Language Client',
      clientOptions: {
        documentSelector: [{ language: 'lua' }],
        errorHandler: {
          error: () => ({ action: 1 /* ErrorAction.Continue */ }),
          closed: () => ({ action: 2 /* CloseAction.DoNotRestart */ }),
        },
      },
      messageTransports: { reader, writer },
    });

    client.start();

    reader.onClose(() => client.stop());
  };

  ws.onerror = (e) => {
    // LSP not available — IDE continues without diagnostics
    console.debug('LSP WebSocket error (LSP disabled or unavailable):', e.type);
  };
}

/**
 * Wrap a native WebSocket into the IWebSocket interface expected by vscode-ws-jsonrpc.
 * @param {WebSocket} ws
 * @returns {import('vscode-ws-jsonrpc').IWebSocket}
 */
function toIWebSocket(ws) {
  return {
    send: (content) => ws.send(content),
    onMessage: (cb) => {
      ws.addEventListener('message', (e) => cb(e.data));
    },
    onError: (cb) => {
      ws.addEventListener('error', (e) => cb(e));
    },
    onClose: (cb) => {
      ws.addEventListener('close', (e) => cb(e.code, e.reason));
    },
    dispose: () => ws.close(),
  };
}

export { monaco, connectLsp };
