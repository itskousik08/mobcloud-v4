const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs-extra');
const mime = require('mime-types');
const archiver = require('archiver');

function getProjectDir(app, projectId) {
  return path.join(app.get('workspaceDir'), projectId);
}

function safePath(base, rel) {
  const normalized = path.normalize(rel).replace(/^(\.\.(\/|\\|$))+/, '');
  const full = path.resolve(base, normalized);
  if (!full.startsWith(path.resolve(base))) throw new Error('Path traversal detected');
  return full;
}

// GET /api/files/:projectId/read?path=relative/path
router.get('/:projectId/read', (req, res) => {
  try {
    const projectDir = getProjectDir(req.app, req.params.projectId);
    const filePath = req.query.path;
    if (!filePath) return res.status(400).json({ error: 'path query param required' });
    const full = safePath(projectDir, filePath);
    if (!fs.existsSync(full)) return res.status(404).json({ error: 'File not found' });
    const stat = fs.statSync(full);
    if (stat.isDirectory()) return res.status(400).json({ error: 'Is a directory' });
    const mimeType = mime.lookup(full) || 'text/plain';
    const isBinary = mimeType.startsWith('image/') || mimeType.startsWith('application/octet');
    if (isBinary) return res.sendFile(full);
    const content = fs.readFileSync(full, 'utf-8');
    res.json({ content, path: filePath, mimeType });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/files/:projectId/write  body: { path, content }
router.post('/:projectId/write', (req, res) => {
  try {
    const projectDir = getProjectDir(req.app, req.params.projectId);
    const { path: filePath, content } = req.body;
    if (!filePath) return res.status(400).json({ error: 'path required' });
    const full = safePath(projectDir, filePath);
    fs.ensureDirSync(path.dirname(full));
    fs.writeFileSync(full, content || '', 'utf-8');
    const io = req.app.get('io');
    io?.to(`project-${req.params.projectId}`).emit('file-changed', { path: filePath, content });
    res.json({ success: true, path: filePath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/files/:projectId/delete  body: { path }
router.delete('/:projectId/delete', (req, res) => {
  try {
    const projectDir = getProjectDir(req.app, req.params.projectId);
    const filePath = req.body?.path || req.query.path;
    if (!filePath) return res.status(400).json({ error: 'path required' });
    const full = safePath(projectDir, filePath);
    fs.removeSync(full);
    const io = req.app.get('io');
    io?.to(`project-${req.params.projectId}`).emit('file-deleted', { path: filePath });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/files/:projectId/rename  body: { oldPath, newPath }
router.post('/:projectId/rename', (req, res) => {
  try {
    const projectDir = getProjectDir(req.app, req.params.projectId);
    const { oldPath, newPath } = req.body;
    if (!oldPath || !newPath) return res.status(400).json({ error: 'oldPath and newPath required' });
    const fullFrom = safePath(projectDir, oldPath);
    const fullTo = safePath(projectDir, newPath);
    fs.ensureDirSync(path.dirname(fullTo));
    fs.moveSync(fullFrom, fullTo, { overwrite: false });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/files/:projectId/mkdir  body: { dirPath }
router.post('/:projectId/mkdir', (req, res) => {
  try {
    const projectDir = getProjectDir(req.app, req.params.projectId);
    const { dirPath } = req.body;
    if (!dirPath) return res.status(400).json({ error: 'dirPath required' });
    const full = safePath(projectDir, dirPath);
    fs.ensureDirSync(full);
    // Create a .gitkeep so the folder appears in the tree
    const keepFile = path.join(full, '.gitkeep');
    if (!fs.existsSync(keepFile)) fs.writeFileSync(keepFile, '');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/files/:projectId/download  — zip download
router.get('/:projectId/download', (req, res) => {
  try {
    const projectDir = getProjectDir(req.app, req.params.projectId);
    if (!fs.existsSync(projectDir)) return res.status(404).json({ error: 'Project not found' });
    const archive = archiver('zip', { zlib: { level: 9 } });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="project.zip"`);
    archive.pipe(res);
    archive.directory(projectDir, false);
    archive.finalize();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/files/:projectId/upload  — upload file
router.post('/:projectId/upload', express.raw({ type: '*/*', limit: '50mb' }), (req, res) => {
  try {
    const projectDir = getProjectDir(req.app, req.params.projectId);
    const filePath = req.query.path || req.headers['x-file-path'];
    if (!filePath) return res.status(400).json({ error: 'path required' });
    const full = safePath(projectDir, filePath);
    fs.ensureDirSync(path.dirname(full));
    fs.writeFileSync(full, req.body);
    res.json({ success: true, path: filePath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
