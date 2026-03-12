import { Router } from 'express';
import { createReadStream, existsSync } from 'fs';
import { join, basename } from 'path';
import archiver from 'archiver';
import ignore from 'ignore';
import { readFileSync } from 'fs';

const exportRouter = Router();

exportRouter.get('/', (req, res) => {
  const config = req.app.locals.config;
  const projectPath = config.projectPath;

  // Derive project name from the last path segment
  const projectName = basename(projectPath) || 'project';

  // Load .loveignore if it exists
  const loveignorePath = join(projectPath, '.loveignore');
  const ig = ignore();
  if (existsSync(loveignorePath)) {
    const rules = readFileSync(loveignorePath, 'utf8');
    ig.add(rules);
  }

  // Set download headers
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${projectName}.love"`);

  // Create archive
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.on('error', (err) => {
    console.error('Archive error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  });

  // Pipe archive to response
  archive.pipe(res);

  // Add files using a custom glob + ignore filter
  archive.glob('**/*', {
    cwd: projectPath,
    dot: true,
    ignore: ['**/.git/**', '**/.git'],
    filter: (filepath) => {
      // filepath is relative to projectPath
      return !ig.ignores(filepath);
    },
  });

  archive.finalize();
});

export { exportRouter };
