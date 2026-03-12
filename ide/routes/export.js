import { Router } from 'express';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, basename, relative } from 'path';
import archiver from 'archiver';
import ignore from 'ignore';

const exportRouter = Router();

exportRouter.get('/', (req, res) => {
  const config = req.app.locals.config;
  const projectPath = config.projectPath;
  const projectName = basename(projectPath) || 'project';

  // Load .loveignore if it exists
  const loveignorePath = join(projectPath, '.loveignore');
  const ig = ignore();
  ig.add('.git');
  if (existsSync(loveignorePath)) {
    ig.add(readFileSync(loveignorePath, 'utf8'));
  }

  // Collect files recursively, respecting .loveignore
  function collectFiles(dir) {
    const files = [];
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      const relPath = relative(projectPath, fullPath).replace(/\\/g, '/');
      if (ig.ignores(relPath)) continue;
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        files.push(...collectFiles(fullPath));
      } else {
        files.push({ fullPath, relPath });
      }
    }
    return files;
  }

  const files = collectFiles(projectPath);

  // Set headers
  res.setHeader('Content-Type', 'application/zip');
  if (req.query.inline === '1') {
    res.removeHeader('Content-Disposition');
  } else {
    res.setHeader('Content-Disposition', `attachment; filename="${projectName}.love"`);
  }
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

  // Create archive
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.on('error', (err) => {
    console.error('Archive error:', err);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  });
  archive.pipe(res);

  for (const { fullPath, relPath } of files) {
    archive.file(fullPath, { name: relPath });
  }

  archive.finalize();
});

export { exportRouter };
