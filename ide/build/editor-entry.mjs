import * as monaco from 'monaco-editor';

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
/**
 * Raw LSP client over WebSocket.
 * Handles initialize, textDocument/didOpen, completion, and diagnostics.
 */
function connectLsp(wsUrl, rootPath) {
  let ws, reqId = 1, pending = {}, serverCaps = null;
  const openDocs = new Map(); // uri -> version
  let completionDisposable = null;

  function connect() {
    ws = new WebSocket(wsUrl);
    ws.onopen = () => {
      send('initialize', {
        processId: null,
        rootUri: rootPath ? 'file://' + rootPath : null,
        capabilities: {
          workspace: { configuration: true },
          textDocument: {
            completion: { completionItem: { snippetSupport: true, labelDetailsSupport: true } },
            publishDiagnostics: { relatedInformation: true },
            synchronization: { dynamicRegistration: false, willSave: false, didSave: false, willSaveWaitUntil: false },
          },
        },
        workspaceFolders: rootPath ? [{ uri: 'file://' + rootPath, name: 'project' }] : null,
      }).then((result) => {
        serverCaps = result.capabilities;
        notify('initialized', {});
        registerProviders();
        // Sync any already-open models
        for (const model of monaco.editor.getModels()) {
          if (model.getLanguageId() === 'lua') sendDidOpen(model);
        }
        document.title = 'Love2D IDE';
      });
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      // Response to our request
      if (msg.id != null && pending[msg.id]) {
        pending[msg.id](msg.result, msg.error);
        delete pending[msg.id];
      }
      // Server notification
      if (msg.method === 'textDocument/publishDiagnostics') {
        handleDiagnostics(msg.params);
      }
    };

    ws.onerror = () => {};
    ws.onclose = () => {};
  }

  function send(method, params) {
    return new Promise((resolve) => {
      const id = reqId++;
      pending[id] = resolve;
      ws.send(JSON.stringify({ jsonrpc: '2.0', id, method, params }));
    });
  }

  function notify(method, params) {
    ws.send(JSON.stringify({ jsonrpc: '2.0', method, params }));
  }

  function sendDidOpen(model) {
    const uri = model.uri.toString();
    if (openDocs.has(uri)) return;
    const version = 1;
    openDocs.set(uri, version);
    notify('textDocument/didOpen', {
      textDocument: { uri, languageId: 'lua', version, text: model.getValue() },
    });

    // Track changes
    model.onDidChangeContent(() => {
      const v = (openDocs.get(uri) || 1) + 1;
      openDocs.set(uri, v);
      notify('textDocument/didChange', {
        textDocument: { uri, version: v },
        contentChanges: [{ text: model.getValue() }],
      });
    });
  }

  function registerProviders() {
    // Completion provider
    completionDisposable = monaco.languages.registerCompletionItemProvider('lua', {
      triggerCharacters: ['.', ':'],
      provideCompletionItems: async (model, position) => {
        const uri = model.uri.toString();
        if (!openDocs.has(uri)) sendDidOpen(model);
        const result = await send('textDocument/completion', {
          textDocument: { uri },
          position: { line: position.lineNumber - 1, character: position.column - 1 },
        });
        if (!result) return { suggestions: [] };
        const items = result.items || result;
        return {
          suggestions: items.map((item) => ({
            label: item.label,
            kind: item.kind || 1,
            insertText: item.textEdit?.newText || item.insertText || item.label,
            insertTextRules: item.insertTextFormat === 2
              ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
              : undefined,
            detail: item.detail || '',
            documentation: item.documentation?.value || item.documentation || '',
            range: undefined,
          })),
        };
      },
    });

    // Listen for new models
    monaco.editor.onDidCreateModel((model) => {
      if (model.getLanguageId() === 'lua') sendDidOpen(model);
    });
  }

  // Diagnostics → Monaco markers
  function handleDiagnostics(params) {
    const uri = monaco.Uri.parse(params.uri);
    const model = monaco.editor.getModel(uri);
    if (!model) return;
    const markers = (params.diagnostics || []).map((d) => ({
      severity: [0, 8, 4, 2, 1][d.severity] || 8,
      startLineNumber: d.range.start.line + 1,
      startColumn: d.range.start.character + 1,
      endLineNumber: d.range.end.line + 1,
      endColumn: d.range.end.character + 1,
      message: d.message,
      source: d.source || 'lua',
    }));
    monaco.editor.setModelMarkers(model, 'lua-lsp', markers);
  }

  connect();
}

export { monaco, connectLsp };
