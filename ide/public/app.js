/**
 * app.js — Love2D Web IDE main application script
 * Wires: Monaco editor, file tree, file save, theme toggle, panel resize, mobile tabs
 */

// ---------------------------------------------------------------------------
// Monaco init
// ---------------------------------------------------------------------------
const { monaco } = window.MonacoIDE;

const savedTheme = localStorage.getItem('ide-theme') || 'catppuccin-mocha';
const editorEl = document.getElementById('editor-container');

const editor = monaco.editor.create(editorEl, {
  language: 'lua',
  theme: savedTheme,
  automaticLayout: true,
  minimap: { enabled: false },
  fontSize: 14,
  scrollBeyondLastLine: false,
  wordWrap: 'on',
  renderLineHighlight: 'all',
  cursorBlinking: 'smooth',
  smoothScrolling: true,
  tabSize: 2,
  insertSpaces: true,
});

// Apply theme to HTML element as well
applyTheme(savedTheme === 'catppuccin-mocha' ? 'dark' : 'light');

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
    const model = monaco.editor.createModel(content, lang);
    const oldModel = editor.getModel();
    editor.setModel(model);
    if (oldModel) oldModel.dispose();

    currentFilePath = relativePath;
    isDirty = false;
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

// ---------------------------------------------------------------------------
// File save (Ctrl+S / Cmd+S)
// ---------------------------------------------------------------------------
editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, saveCurrentFile);

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

    isDirty = false;
    updateEditorHeader();
    showStatus('Saved', 'ok');
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
  themeIcon.innerHTML = mode === 'dark' ? '&#9790;' : '&#9788;';
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
  const panels = document.querySelectorAll('#sidebar, #editor-panel, #console-panel');
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
// Toolbar buttons (stubs for Plan 02/03)
// ---------------------------------------------------------------------------
document.getElementById('btn-run').addEventListener('click', () => {
  console.log('TODO: wire Run in Plan 02');
  showStatus('Run: coming in Plan 02', 'ok');
});

document.getElementById('btn-stop').addEventListener('click', () => {
  console.log('TODO: wire Stop in Plan 02');
  showStatus('Stop: coming in Plan 02', 'ok');
});

document.getElementById('btn-export').addEventListener('click', () => {
  console.log('TODO: wire Export in Plan 03');
  showStatus('Export: coming in Plan 03', 'ok');
});

// ---------------------------------------------------------------------------
// Console panel clear button
// ---------------------------------------------------------------------------
document.getElementById('btn-clear-console').addEventListener('click', () => {
  const out = document.getElementById('console-output');
  out.innerHTML = '<span class="console-placeholder">Console cleared.</span>';
});

// ---------------------------------------------------------------------------
// Refresh file tree button
// ---------------------------------------------------------------------------
document.getElementById('btn-refresh-tree').addEventListener('click', loadFileTree);

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------
loadFileTree();
