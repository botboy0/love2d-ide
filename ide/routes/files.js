import { Router } from 'express';
import { readdirSync, statSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, resolve, relative, normalize } from 'path';

const SKIP_NAMES = new Set([
  'node_modules', '.git', '.DS_Store', 'Thumbs.db',
]);

function isHidden(name) {
  return name.startsWith('.');
}

/**
 * Recursively build directory tree.
 * @param {string} dirPath - Absolute path to scan
 * @param {string} rootPath - Project root (for relative path tracking)
 * @returns {Array} Array of tree nodes
 */
function buildTree(dirPath, rootPath) {
  let entries;
  try {
    entries = readdirSync(dirPath);
  } catch (err) {
    return [];
  }

  const nodes = [];
  for (const name of entries.sort()) {
    if (SKIP_NAMES.has(name) || isHidden(name)) continue;

    const fullPath = join(dirPath, name);
    let stat;
    try {
      stat = statSync(fullPath);
    } catch {
      continue;
    }

    if (stat.isDirectory()) {
      nodes.push({
        name,
        type: 'directory',
        path: relative(rootPath, fullPath).replace(/\\/g, '/'),
        children: buildTree(fullPath, rootPath),
      });
    } else {
      nodes.push({
        name,
        type: 'file',
        path: relative(rootPath, fullPath).replace(/\\/g, '/'),
      });
    }
  }
  return nodes;
}

/**
 * Validate that resolved path stays within the project root.
 * Returns the absolute path or null if traversal detected.
 */
function safeResolve(projectPath, relativePath) {
  // Normalize and resolve the full path
  const fullPath = resolve(join(projectPath, normalize(relativePath)));
  // Ensure it starts with projectPath (prevent traversal)
  const normalRoot = resolve(projectPath);
  if (!fullPath.startsWith(normalRoot + '\\') && fullPath !== normalRoot &&
      !fullPath.startsWith(normalRoot + '/') ) {
    return null;
  }
  return fullPath;
}

export function filesRouter(config) {
  const router = Router();
  const projectPath = config.projectPath;

  // GET / — Return directory tree
  router.get('/', (req, res) => {
    try {
      const tree = buildTree(projectPath, projectPath);
      res.json(tree);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET /:path(*) — Return file content
  router.get('/:filePath(*)', (req, res) => {
    const relativePath = req.params.filePath;
    const fullPath = safeResolve(projectPath, relativePath);

    if (!fullPath) {
      return res.status(403).json({ error: 'Path traversal detected' });
    }

    try {
      const content = readFileSync(fullPath, 'utf8');
      res.type('text/plain').send(content);
    } catch (err) {
      if (err.code === 'ENOENT') {
        res.status(404).json({ error: 'File not found' });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  });

  // PUT /:path(*) — Write file content
  router.put('/:filePath(*)', (req, res) => {
    const relativePath = req.params.filePath;
    const fullPath = safeResolve(projectPath, relativePath);

    if (!fullPath) {
      return res.status(403).json({ error: 'Path traversal detected' });
    }

    try {
      // Ensure parent directory exists
      const parentDir = join(fullPath, '..');
      mkdirSync(parentDir, { recursive: true });
      writeFileSync(fullPath, req.body, 'utf8');
      res.json({ ok: true, path: relativePath });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
