/**
 * app.js — Love2D Web IDE main application script
 * Wires: Monaco editor, file tree, file save, theme toggle, panel resize, mobile tabs
 */

// ---------------------------------------------------------------------------
// Monaco init
// ---------------------------------------------------------------------------
const { monaco, connectLsp } = window.MonacoIDE;

const savedTheme = localStorage.getItem('ide-theme') || 'catppuccin-mocha';
const editorEl = document.getElementById('editor-container');

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  || (navigator.maxTouchPoints > 1 && window.innerWidth < 1024);

const editor = monaco.editor.create(editorEl, {
  language: 'lua',
  theme: savedTheme,
  automaticLayout: true,
  minimap: { enabled: false },
  fontSize: isMobile ? 16 : 14,
  scrollBeyondLastLine: false,
  wordWrap: 'on',
  renderLineHighlight: isMobile ? 'none' : 'all',
  cursorBlinking: 'smooth',
  smoothScrolling: true,
  tabSize: 2,
  insertSpaces: true,
  // Mobile: use native scrolling instead of Monaco's custom scroller
  scrollbar: isMobile ? {
    vertical: 'auto',
    horizontal: 'auto',
    handleMouseWheel: true,
    alwaysConsumeMouseWheel: false,
  } : {},
  // Mobile: disable hover widgets that get in the way
  hover: isMobile ? { enabled: false } : {},
  overviewRulerLanes: isMobile ? 0 : 3,
  quickSuggestions: true,
  parameterHints: {},
  contextmenu: !isMobile,
  // Mobile: prevent tap from selecting whole words
  selectionHighlight: isMobile ? false : true,
  occurrencesHighlight: isMobile ? 'off' : 'singleFile',
  mouseStyle: 'text',
});

// Mobile: single tap places cursor, long press handled by touch selection code above
if (isMobile) {
  let touchStartTime = 0;
  editorEl.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) touchStartTime = Date.now();
  }, { passive: true });

  editorEl.addEventListener('touchend', (e) => {
    if (e.changedTouches.length !== 1) return;
    const duration = Date.now() - touchStartTime;
    if (duration > 300) return; // long press — let touch selection handler deal with it

    const touch = e.changedTouches[0];
    const target = editor.getTargetAtClientPoint(touch.clientX, touch.clientY);
    if (target && target.position) {
      setTimeout(() => {
        const sel = editor.getSelection();
        if (sel && !sel.isEmpty()) {
          editor.setPosition(target.position);
        }
      }, 10);
    }
  }, { passive: true });
}

// Mobile: allow native touch scrolling inside Monaco's scroll container
if (isMobile) {
  const applyTouchFix = () => {
    const monacoLines = editorEl.querySelector('.monaco-scrollable-element');
    if (monacoLines) {
      monacoLines.style.touchAction = 'auto';
    }
    const overlays = editorEl.querySelectorAll('.overflow-guard, .monaco-editor');
    overlays.forEach(el => { el.style.touchAction = 'auto'; });
  };
  setTimeout(applyTouchFix, 100);
  editor.onDidChangeModel(() => setTimeout(applyTouchFix, 100));

  // --- Touch text selection (long-press to select, drag handles to extend) ---
  (function initTouchSelection() {
    let longPressTimer = null;
    let startTouch = null;
    let selectionActive = false;
    let draggingHandle = null; // 'left' | 'right' | null

    // Create drag handles
    const leftHandle = document.createElement('div');
    const rightHandle = document.createElement('div');
    leftHandle.className = 'touch-sel-handle touch-sel-left';
    rightHandle.className = 'touch-sel-handle touch-sel-right';
    leftHandle.style.display = 'none';
    rightHandle.style.display = 'none';
    editorEl.appendChild(leftHandle);
    editorEl.appendChild(rightHandle);

    // Create touch context menu
    const touchMenu = document.createElement('div');
    touchMenu.className = 'touch-ctx-menu';
    touchMenu.style.display = 'none';
    touchMenu.innerHTML = `
      <button data-action="selectAll">Select All</button>
      <button data-action="cut">Cut</button>
      <button data-action="copy">Copy</button>
      <button data-action="paste">Paste</button>
    `;
    editorEl.appendChild(touchMenu);

    touchMenu.addEventListener('click', async (e) => {
      const action = e.target.dataset.action;
      if (!action) return;
      e.stopPropagation();
      if (action === 'selectAll') {
        const model = editor.getModel();
        if (model) {
          const lastLine = model.getLineCount();
          const lastCol = model.getLineMaxColumn(lastLine);
          editor.setSelection(new monaco.Selection(1, 1, lastLine, lastCol));
        }
      } else if (action === 'copy') {
        const sel = editor.getModel().getValueInRange(editor.getSelection());
        await navigator.clipboard.writeText(sel);
      } else if (action === 'cut') {
        const selection = editor.getSelection();
        const sel = editor.getModel().getValueInRange(selection);
        await navigator.clipboard.writeText(sel);
        editor.executeEdits('touch-cut', [{ range: selection, text: '' }]);
      } else if (action === 'paste') {
        const text = await navigator.clipboard.readText();
        editor.executeEdits('touch-paste', [{ range: editor.getSelection(), text }]);
      }
      hideTouchUI();
    });

    function getEditorPosition(clientX, clientY) {
      const target = editor.getTargetAtClientPoint(clientX, clientY);
      return target && target.position ? target.position : null;
    }

    function positionHandles() {
      const sel = editor.getSelection();
      if (!sel || sel.isEmpty()) {
        leftHandle.style.display = 'none';
        rightHandle.style.display = 'none';
        touchMenu.style.display = 'none';
        return;
      }

      const startPos = { lineNumber: sel.startLineNumber, column: sel.startColumn };
      const endPos = { lineNumber: sel.endLineNumber, column: sel.endColumn };

      const startCoords = editor.getScrolledVisiblePosition(startPos);
      const endCoords = editor.getScrolledVisiblePosition(endPos);
      const lineHeight = editor.getOption(monaco.editor.EditorOption.lineHeight);
      const editorRect = editorEl.getBoundingClientRect();
      const editorDomNode = editor.getDomNode();
      const editorContentRect = editorDomNode.querySelector('.lines-content')?.getBoundingClientRect() || editorRect;

      if (startCoords) {
        leftHandle.style.display = '';
        leftHandle.style.left = `${startCoords.left}px`;
        leftHandle.style.top = `${startCoords.top + lineHeight}px`;
      }
      if (endCoords) {
        rightHandle.style.display = '';
        rightHandle.style.left = `${endCoords.left}px`;
        rightHandle.style.top = `${endCoords.top + lineHeight}px`;
      }

      // Position context menu above selection
      if (startCoords) {
        touchMenu.style.display = 'flex';
        const menuX = Math.max(4, Math.min(
          (startCoords.left + (endCoords ? endCoords.left : startCoords.left)) / 2 - 60,
          editorEl.clientWidth - 200
        ));
        touchMenu.style.left = `${menuX}px`;
        touchMenu.style.top = `${Math.max(0, startCoords.top - 40)}px`;
      }
    }

    function hideTouchUI() {
      leftHandle.style.display = 'none';
      rightHandle.style.display = 'none';
      touchMenu.style.display = 'none';
      selectionActive = false;
    }

    // Long-press to select word
    editorEl.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      startTouch = { x: touch.clientX, y: touch.clientY };

      longPressTimer = setTimeout(() => {
        const pos = getEditorPosition(touch.clientX, touch.clientY);
        if (!pos) return;

        const model = editor.getModel();
        const wordAtPos = model.getWordAtPosition(pos);
        if (wordAtPos) {
          editor.setSelection(new monaco.Selection(
            pos.lineNumber, wordAtPos.startColumn,
            pos.lineNumber, wordAtPos.endColumn
          ));
          selectionActive = true;
          positionHandles();
        } else {
          // Empty spot — place cursor and show paste menu
          editor.setPosition(pos);
          selectionActive = true;
          const coords = editor.getScrolledVisiblePosition(pos);
          if (coords) {
            leftHandle.style.display = 'none';
            rightHandle.style.display = 'none';
            touchMenu.style.display = 'flex';
            const menuX = Math.max(4, Math.min(coords.left - 60, editorEl.clientWidth - 200));
            touchMenu.style.top = `${Math.max(0, coords.top - 40)}px`;
            touchMenu.style.left = `${menuX}px`;
          }
        }

        // Haptic feedback if available
        if (navigator.vibrate) navigator.vibrate(30);
      }, 500);
    }, { passive: true });

    editorEl.addEventListener('touchmove', (e) => {
      if (longPressTimer && startTouch && e.touches.length === 1) {
        const touch = e.touches[0];
        const dx = touch.clientX - startTouch.x;
        const dy = touch.clientY - startTouch.y;
        if (Math.sqrt(dx * dx + dy * dy) > 10) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
      }
    }, { passive: true });

    editorEl.addEventListener('touchend', () => {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }, { passive: true });

    // Tap elsewhere dismisses selection UI
    editorEl.addEventListener('click', (e) => {
      if (selectionActive && !e.target.closest('.touch-sel-handle') && !e.target.closest('.touch-ctx-menu')) {
        hideTouchUI();
      }
    });

    // Drag handles to extend selection
    function handleTouchStart(side) {
      return function(e) {
        e.preventDefault();
        e.stopPropagation();
        draggingHandle = side;
      };
    }

    leftHandle.addEventListener('touchstart', handleTouchStart('left'), { passive: false });
    rightHandle.addEventListener('touchstart', handleTouchStart('right'), { passive: false });

    document.addEventListener('touchmove', (e) => {
      if (!draggingHandle) return;
      e.preventDefault();
      const touch = e.touches[0];
      const pos = getEditorPosition(touch.clientX, touch.clientY);
      if (!pos) return;

      const sel = editor.getSelection();
      if (draggingHandle === 'left') {
        editor.setSelection(new monaco.Selection(
          pos.lineNumber, pos.column,
          sel.endLineNumber, sel.endColumn
        ));
      } else {
        editor.setSelection(new monaco.Selection(
          sel.startLineNumber, sel.startColumn,
          pos.lineNumber, pos.column
        ));
      }
      positionHandles();
    }, { passive: false });

    document.addEventListener('touchend', () => {
      draggingHandle = null;
    }, { passive: true });

    // Reposition handles when selection changes programmatically
    editor.onDidChangeCursorSelection(() => {
      if (selectionActive) positionHandles();
    });

    // Hide on scroll
    editor.onDidScrollChange(() => {
      if (selectionActive) positionHandles();
    });
  })();
}

// Apply theme to HTML element as well
applyTheme(savedTheme === 'catppuccin-mocha' ? 'dark' : 'light');

// Fetch project path, then connect LSP with correct workspace root
let projectRootPath = '/project';
let loveApiPath = '';
fetch('/api/health').then(r => r.json()).then(data => {
  if (data.projectPath) projectRootPath = data.projectPath;
  if (data.loveApiPath) loveApiPath = data.loveApiPath;
  if (typeof connectLsp === 'function') {
    try {
      const wsProto = location.protocol === 'https:' ? 'wss:' : 'ws:';
      console.log('Connecting LSP...', projectRootPath);
      connectLsp(wsProto + '//' + location.host + '/lsp', projectRootPath);
    } catch (err) {
      console.error('LSP connectLsp threw:', err);
      document.title = 'LSP ERR: ' + err.message;
    }
  }
}).catch((err) => { console.error('LSP connect failed:', err); document.title = 'HEALTH ERR: ' + err.message; });


// ---------------------------------------------------------------------------
// Font size zoom controls
// ---------------------------------------------------------------------------
const savedFontSize = parseInt(localStorage.getItem('ide-font-size'), 10) || 14;
if (savedFontSize !== 14) editor.updateOptions({ fontSize: savedFontSize });

document.getElementById('btn-zoom-in').addEventListener('click', () => {
  const current = editor.getOption(monaco.editor.EditorOption.fontSize);
  const next = Math.min(current + 2, 32);
  editor.updateOptions({ fontSize: next });
  localStorage.setItem('ide-font-size', next);
});

document.getElementById('btn-zoom-out').addEventListener('click', () => {
  const current = editor.getOption(monaco.editor.EditorOption.fontSize);
  const next = Math.max(current - 2, 8);
  editor.updateOptions({ fontSize: next });
  localStorage.setItem('ide-font-size', next);
});

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let currentFilePath = null;
let isDirty = false;
let activeTreeItem = null;

// ---------------------------------------------------------------------------
// File tree
// ---------------------------------------------------------------------------
const fileTreeEl = document.getElementById('file-tree');

async function loadFileTree() {
  try {
    const res = await fetch('/api/files');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const tree = await res.json();
    renderTree(tree, fileTreeEl, 0);
  } catch (err) {
    fileTreeEl.innerHTML = `<span style="color:var(--red);padding:8px;display:block">Failed to load file tree: ${err.message}</span>`;
  }
}

/**
 * Render tree nodes into a container element.
 * @param {Array} nodes
 * @param {HTMLElement} container
 * @param {number} depth
 */
function renderTree(nodes, container, depth) {
  container.innerHTML = '';
  for (const node of nodes) {
    if (node.type === 'directory') {
      const wrap = document.createElement('div');

      const item = document.createElement('div');
      item.className = 'tree-item directory';
      item.style.paddingLeft = `${8 + depth * 14}px`;
      item.dataset.path = node.path;
      item.innerHTML = `
        <span class="tree-arrow">&#9658;</span>
        <span class="tree-icon">&#128193;</span>
        <span class="tree-label">${escapeHtml(node.name)}</span>
      `;

      const children = document.createElement('div');
      children.className = 'tree-children';

      if (node.children && node.children.length > 0) {
        renderTree(node.children, children, depth + 1);
      }

      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = item.classList.contains('open');
        if (isOpen) {
          item.classList.remove('open');
          children.classList.remove('open');
        } else {
          item.classList.add('open');
          children.classList.add('open');
        }
      });

      wrap.appendChild(item);
      wrap.appendChild(children);
      container.appendChild(wrap);
    } else {
      const item = document.createElement('div');
      item.className = 'tree-item';
      item.style.paddingLeft = `${8 + depth * 14}px`;
      item.dataset.path = node.path;

      const icon = getFileIcon(node.name);
      item.innerHTML = `
        <span class="tree-arrow" style="visibility:hidden">&#9658;</span>
        <span class="tree-icon">${icon}</span>
        <span class="tree-label">${escapeHtml(node.name)}</span>
      `;

      item.addEventListener('click', (e) => {
        e.stopPropagation();
        openFile(node.path, item);
      });

      container.appendChild(item);
    }
  }
}

function getFileIcon(name) {
  const ext = name.split('.').pop().toLowerCase();
  const icons = {
    lua: '&#128196;',
    json: '&#123;',
    md: '&#128221;',
    txt: '&#128196;',
    png: '&#128444;',
    jpg: '&#128444;',
    jpeg: '&#128444;',
    gif: '&#128444;',
    wav: '&#127925;',
    mp3: '&#127925;',
    ogg: '&#127925;',
  };
  return icons[ext] || '&#128196;';
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------------------------------------------------------------------------
// Open file
// ---------------------------------------------------------------------------
async function openFile(relativePath, treeItem) {
  // Check for unsaved changes
  if (isDirty && currentFilePath) {
    const ok = confirm(`Discard unsaved changes to ${currentFilePath}?`);
    if (!ok) return;
  }

  try {
    const res = await fetch(`/api/files/${encodeURIPath(relativePath)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const content = await res.text();

    // Determine language from extension
    const lang = getLanguageFromPath(relativePath);
    const fileUri = monaco.Uri.parse('file://' + projectRootPath + '/' + relativePath);
    // Reuse existing model for same URI, or create new one
    let model = monaco.editor.getModel(fileUri);
    if (model) {
      model.setValue(content);
    } else {
      model = monaco.editor.createModel(content, lang, fileUri);
    }
    const oldModel = editor.getModel();
    editor.setModel(model);
    if (oldModel && oldModel !== model) oldModel.dispose();

    currentFilePath = relativePath;
    isDirty = false;
    localStorage.setItem('ide-last-file', relativePath);
    updateEditorHeader();

    // Update active tree item
    if (activeTreeItem) activeTreeItem.classList.remove('active');
    if (treeItem) {
      treeItem.classList.add('active');
      activeTreeItem = treeItem;
    }

    // On mobile, switch to editor panel
    if (window.innerWidth <= 768) {
      switchMobilePanel('editor-panel');
    }
  } catch (err) {
    showStatus(`Error: ${err.message}`, 'error');
  }
}

function getLanguageFromPath(path) {
  const ext = path.split('.').pop().toLowerCase();
  const langs = {
    lua: 'lua',
    js: 'javascript',
    ts: 'typescript',
    json: 'json',
    md: 'markdown',
    html: 'html',
    css: 'css',
    txt: 'plaintext',
    sh: 'shell',
    conf: 'plaintext',
  };
  return langs[ext] || 'plaintext';
}

function encodeURIPath(path) {
  // Encode each segment separately, preserving slashes
  return path.split('/').map(encodeURIComponent).join('/');
}

// ---------------------------------------------------------------------------
// Editor header update
// ---------------------------------------------------------------------------
function updateEditorHeader() {
  const filenameEl = document.getElementById('editor-filename');
  const dirtyEl = document.getElementById('editor-dirty');

  if (currentFilePath) {
    const parts = currentFilePath.split('/');
    filenameEl.textContent = parts[parts.length - 1];
    filenameEl.title = currentFilePath;
  } else {
    filenameEl.textContent = 'No file open';
  }

  if (isDirty) {
    dirtyEl.removeAttribute('hidden');
  } else {
    dirtyEl.setAttribute('hidden', '');
  }
}

// Mark dirty on edit
editor.onDidChangeModelContent(() => {
  if (!isDirty && currentFilePath) {
    isDirty = true;
    updateEditorHeader();
  }
});

// Remember cursor position
let cursorSaveEnabled = false;
editor.onDidChangeCursorPosition((e) => {
  if (cursorSaveEnabled && currentFilePath) {
    localStorage.setItem('ide-cursor', JSON.stringify({
      line: e.position.lineNumber,
      column: e.position.column,
    }));
  }
});

// ---------------------------------------------------------------------------
// File save (Ctrl+S / Cmd+S)
// ---------------------------------------------------------------------------
editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, saveCurrentFile);
document.getElementById('btn-save').addEventListener('click', saveCurrentFile);

async function saveCurrentFile() {
  if (!currentFilePath) return;

  const content = editor.getValue();
  try {
    const res = await fetch(`/api/files/${encodeURIPath(currentFilePath)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'text/plain' },
      body: content,
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    // Apply formatted content from server (StyLua)
    const result = await res.json();
    if (result.content && result.content !== content) {
      const pos = editor.getPosition();
      editor.setValue(result.content);
      if (pos) editor.setPosition(pos);
    }

    isDirty = false;
    updateEditorHeader();
    showStatus('Saved', 'ok');

    // Trigger immediate game restart if game is running
    // This gives instant feedback without waiting for chokidar's 350ms debounce
    if (gameRunning) {
      try {
        await fetch('/api/run', { method: 'POST' });
      } catch {
        // Non-fatal — chokidar will still catch it
      }
    }
  } catch (err) {
    showStatus(`Save failed: ${err.message}`, 'error');
  }
}

// ---------------------------------------------------------------------------
// Status messages
// ---------------------------------------------------------------------------
let statusTimeout;

function showStatus(msg, type = 'ok') {
  const el = document.getElementById('status-msg');
  el.textContent = msg;
  el.style.color = type === 'error' ? 'var(--red)' : 'var(--green)';
  clearTimeout(statusTimeout);
  statusTimeout = setTimeout(() => {
    el.textContent = '';
  }, 2500);
}

// ---------------------------------------------------------------------------
// Theme toggle
// ---------------------------------------------------------------------------
const btnTheme = document.getElementById('btn-theme');
const themeIcon = document.getElementById('theme-icon');

function applyTheme(mode) {
  document.documentElement.setAttribute('data-theme', mode);
  const icon = document.getElementById('theme-icon');
  if (icon) icon.innerHTML = mode === 'dark' ? '&#9790;' : '&#9788;';
}

btnTheme.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  const monacoTheme = next === 'dark' ? 'catppuccin-mocha' : 'catppuccin-latte';
  monaco.editor.setTheme(monacoTheme);
  applyTheme(next);
  localStorage.setItem('ide-theme', monacoTheme);
});

// ---------------------------------------------------------------------------
// Resizable dividers
// ---------------------------------------------------------------------------
const layout = document.getElementById('ide-layout');

// Vertical handle (sidebar width)
const vHandle = document.getElementById('resize-vertical');

vHandle.addEventListener('mousedown', (e) => {
  e.preventDefault();
  vHandle.classList.add('dragging');

  const startX = e.clientX;
  const startWidth = parseInt(
    getComputedStyle(layout).getPropertyValue('--sidebar-width') || '250',
    10
  );

  function onMouseMove(e) {
    const delta = e.clientX - startX;
    const newWidth = Math.max(140, Math.min(600, startWidth + delta));
    layout.style.setProperty('--sidebar-width', `${newWidth}px`);
  }

  function onMouseUp() {
    vHandle.classList.remove('dragging');
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
});

// Horizontal handle (console height)
const hHandle = document.getElementById('resize-horizontal');

hHandle.addEventListener('mousedown', (e) => {
  e.preventDefault();
  hHandle.classList.add('dragging');

  const startY = e.clientY;
  const startHeight = parseInt(
    getComputedStyle(layout).getPropertyValue('--console-height') || '200',
    10
  );

  function onMouseMove(e) {
    const delta = startY - e.clientY;
    const newHeight = Math.max(60, Math.min(500, startHeight + delta));
    layout.style.setProperty('--console-height', `${newHeight}px`);
  }

  function onMouseUp() {
    hHandle.classList.remove('dragging');
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
});

// ---------------------------------------------------------------------------
// Mobile tabs
// ---------------------------------------------------------------------------
const mobileTabs = document.querySelectorAll('.tab-btn');

mobileTabs.forEach((btn) => {
  btn.addEventListener('click', () => {
    switchMobilePanel(btn.dataset.panel);
  });
});

function switchMobilePanel(panelId) {
  // Update tab buttons
  mobileTabs.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.panel === panelId);
  });

  // Show/hide panels
  const panels = document.querySelectorAll('#sidebar, #editor-panel, #console-panel, #game-panel');
  panels.forEach((p) => {
    p.classList.toggle('active-panel', p.id === panelId);
  });
}

// Set default active panel on mobile
if (window.innerWidth <= 768) {
  switchMobilePanel('editor-panel');
} else {
  // On desktop, ensure all panels are visible (no active-panel class)
  document.querySelectorAll('#sidebar, #editor-panel, #console-panel').forEach((p) => {
    p.classList.remove('active-panel');
  });
}

// Re-check on resize crossing breakpoint
let wasMobile = window.innerWidth <= 768;
window.addEventListener('resize', () => {
  const isMobile = window.innerWidth <= 768;
  if (isMobile !== wasMobile) {
    wasMobile = isMobile;
    if (!isMobile) {
      // Switched to desktop — remove active-panel from all
      document.querySelectorAll('#sidebar, #editor-panel, #console-panel').forEach((p) => {
        p.classList.remove('active-panel');
      });
    } else {
      // Switched to mobile — default to editor
      switchMobilePanel('editor-panel');
    }
  }
});

// ---------------------------------------------------------------------------
// Game process state
// ---------------------------------------------------------------------------
let gameRunning = false;

function setGameRunning(running) {
  gameRunning = running;
  const runBtn = document.getElementById('btn-run');
  const stopBtn = document.getElementById('btn-stop');
  const statusEl = document.getElementById('game-status');

  if (running) {
    runBtn.disabled = true;
    runBtn.style.opacity = '0.5';
    if (statusEl) {
      statusEl.textContent = 'Running';
      statusEl.style.color = 'var(--green)';
    }
  } else {
    runBtn.disabled = false;
    runBtn.style.opacity = '';
    if (statusEl) {
      statusEl.textContent = 'Stopped';
      statusEl.style.color = 'var(--overlay0)';
    }
  }
}

// ---------------------------------------------------------------------------
// Toolbar buttons
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Run mode toggle: browser (love.js) vs native (desktop Love2D)
// ---------------------------------------------------------------------------
let runMode = localStorage.getItem('ide-run-mode') || 'browser';
const runModeBtn = document.getElementById('btn-run-mode');
const runModeIcon = document.getElementById('run-mode-icon');
const runModeLabel = document.getElementById('run-mode-label');

function updateRunModeUI() {
  if (runMode === 'native') {
    runModeIcon.textContent = '\u{1F5A5}';
    runModeLabel.textContent = 'Native';
    runModeBtn.classList.add('native');
  } else {
    runModeIcon.textContent = '\u{1F310}';
    runModeLabel.textContent = 'Browser';
    runModeBtn.classList.remove('native');
  }
}
updateRunModeUI();

runModeBtn.addEventListener('click', () => {
  runMode = runMode === 'browser' ? 'native' : 'browser';
  localStorage.setItem('ide-run-mode', runMode);
  updateRunModeUI();
});

// ---------------------------------------------------------------------------
// In-browser game player (love.js)
// ---------------------------------------------------------------------------
const gamePanel = document.getElementById('game-panel');
const gameContainer = document.getElementById('game-container');
const consolePanel = document.getElementById('console-panel');
const gameTab = document.getElementById('tab-game');

function launchBrowserGame() {
  // Save any open file first
  if (currentFilePath && isDirty) {
    document.dispatchEvent(new Event('save-current-file'));
  }
  // Remove old iframe if any
  const old = gameContainer.querySelector('iframe');
  if (old) old.remove();

  // Create fresh iframe pointing to love.js player
  const iframe = document.createElement('iframe');
  iframe.src = '/lovejs/player.html?_t=' + Date.now();
  iframe.allow = 'autoplay';
  iframe.setAttribute('allowfullscreen', '');
  gameContainer.appendChild(iframe);

  // Show game panel
  gamePanel.style.removeProperty('display');
  if (window.innerWidth <= 768) {
    // Mobile: show Game tab and switch to it
    gameTab.style.display = '';
    switchMobilePanel('game-panel');
  } else {
    // Desktop: hide console, show game panel in its place
    consolePanel.style.display = 'none';
    gamePanel.classList.add('active-game');
  }

  setGameRunning(true);
  showStatus('Running', 'ok');
}

function stopBrowserGame() {
  // Remove iframe
  const iframe = gameContainer.querySelector('iframe');
  if (iframe) iframe.remove();

  // Restore panels
  gamePanel.style.display = 'none';
  gamePanel.classList.remove('active-game');
  if (window.innerWidth <= 768) {
    gameTab.style.display = 'none';
    switchMobilePanel('editor-panel');
  } else {
    consolePanel.style.removeProperty('display');
  }

  setGameRunning(false);
  showStatus('Stopped', 'ok');
}

document.getElementById('btn-run').addEventListener('click', async () => {
  if (gameRunning) return;
  if (runMode === 'native') {
    try {
      const res = await fetch('/api/run', { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setGameRunning(true);
      showStatus('Running (native)', 'ok');
    } catch (err) {
      showStatus(`Run failed: ${err.message}`, 'error');
    }
  } else {
    launchBrowserGame();
  }
});

document.getElementById('btn-stop').addEventListener('click', async () => {
  if (runMode === 'native') {
    try {
      const res = await fetch('/api/run/stop', { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setGameRunning(false);
      showStatus('Stopped', 'ok');
    } catch (err) {
      showStatus(`Stop failed: ${err.message}`, 'error');
    }
  } else {
    stopBrowserGame();
  }
});

document.getElementById('btn-close-game').addEventListener('click', () => {
  stopBrowserGame();
});

document.getElementById('btn-export').addEventListener('click', () => {
  window.location.href = '/api/export';
});

// ---------------------------------------------------------------------------
// Console panel clear button
// ---------------------------------------------------------------------------
document.getElementById('btn-clear-console').addEventListener('click', () => {
  const out = document.getElementById('console-output');
  out.innerHTML = '<span class="console-placeholder">Console cleared.</span>';
});

// ---------------------------------------------------------------------------
// Error linkification helper
// ---------------------------------------------------------------------------
const ERROR_LINK_RE = /([^:\s]+\.lua):(\d+)/g;

/**
 * Convert file:line references in stderr text into clickable anchor elements.
 * Returns a DocumentFragment with text nodes and anchor elements.
 *
 * @param {string} text
 * @returns {DocumentFragment}
 */
function linkifyErrors(text) {
  const fragment = document.createDocumentFragment();
  let lastIndex = 0;
  let match;

  ERROR_LINK_RE.lastIndex = 0;
  while ((match = ERROR_LINK_RE.exec(text)) !== null) {
    // Text before the match
    if (match.index > lastIndex) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
    }

    const anchor = document.createElement('a');
    anchor.href = '#';
    anchor.className = 'error-link';
    anchor.dataset.file = match[1];
    anchor.dataset.line = match[2];
    anchor.textContent = `${match[1]}:${match[2]}`;
    fragment.appendChild(anchor);

    lastIndex = match.index + match[0].length;
  }

  // Remaining text after last match
  if (lastIndex < text.length) {
    fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
  }

  return fragment;
}

// ---------------------------------------------------------------------------
// Console SSE stream
// ---------------------------------------------------------------------------
const consoleOutput = document.getElementById('console-output');

const es = new EventSource('/api/console/stream');

es.onmessage = (event) => {
  const data = JSON.parse(event.data);
  const { stream, text } = data;

  // Remove placeholder text on first real output
  const placeholder = consoleOutput.querySelector('.console-placeholder');
  if (placeholder) placeholder.remove();

  const line = document.createElement('div');
  line.className = `console-line ${stream}`;

  if (stream === 'stderr') {
    line.appendChild(linkifyErrors(text));
  } else {
    line.textContent = text;
  }

  consoleOutput.appendChild(line);

  // Auto-scroll to bottom
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
};

es.addEventListener('clear', () => {
  consoleOutput.innerHTML = '';
  setGameRunning(true);
});

es.onerror = () => {
  // EventSource will auto-reconnect — no manual action needed
};

// ---------------------------------------------------------------------------
// love.js iframe console output (browser mode)
// ---------------------------------------------------------------------------
window.addEventListener('message', (event) => {
  if (!event.data || event.data.type !== 'lovejs-console') return;
  const { stream, text } = event.data;

  const placeholder = consoleOutput.querySelector('.console-placeholder');
  if (placeholder) placeholder.remove();

  const line = document.createElement('div');
  line.className = `console-line ${stream}`;

  if (stream === 'stderr') {
    line.appendChild(linkifyErrors(text));
  } else {
    line.textContent = text;
  }

  consoleOutput.appendChild(line);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
});

// ---------------------------------------------------------------------------
// Error link click delegation
// ---------------------------------------------------------------------------
consoleOutput.addEventListener('click', async (e) => {
  const link = e.target.closest('.error-link');
  if (!link) return;

  e.preventDefault();

  const file = link.dataset.file;
  const line = parseInt(link.dataset.line, 10);

  try {
    const res = await fetch(`/api/files/${encodeURIPath(file)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const content = await res.text();

    // Find the matching tree item if present, otherwise pass null
    const treeItem = fileTreeEl.querySelector(`[data-path="${CSS.escape(file)}"]`) || null;
    await openFile(file, treeItem);

    // Navigate to the error line after model is loaded
    // Use a brief timeout to let Monaco finish setting the model
    setTimeout(() => {
      goToLine(line);
    }, 50);
  } catch (err) {
    showStatus(`Cannot open ${file}: ${err.message}`, 'error');
  }
});

// ---------------------------------------------------------------------------
// goToLine — navigate Monaco editor to a specific line
// ---------------------------------------------------------------------------
function goToLine(lineNumber) {
  editor.revealLineInCenter(lineNumber);
  editor.setPosition({ lineNumber, column: 1 });
  editor.focus();
}

// ---------------------------------------------------------------------------
// Refresh file tree button
// ---------------------------------------------------------------------------
document.getElementById('btn-refresh-tree').addEventListener('click', loadFileTree);

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------
loadFileTree().then(async () => {
  const lastFile = localStorage.getItem('ide-last-file');
  if (lastFile) {
    const treeItem = fileTreeEl.querySelector(`[data-path="${CSS.escape(lastFile)}"]`) || null;
    await openFile(lastFile, treeItem);
    const saved = localStorage.getItem('ide-cursor');
    if (saved) {
      // Delay restore — Monaco resets cursor after layout shifts (especially on mobile)
      await new Promise(r => setTimeout(r, 200));
      try {
        const { line, column } = JSON.parse(saved);
        editor.setPosition({ lineNumber: line, column });
        editor.revealLineInCenter(line);
      } catch {}
    }
  }
  cursorSaveEnabled = true;
});

// Game always starts as not running on page load (in-browser player)
setGameRunning(false);
