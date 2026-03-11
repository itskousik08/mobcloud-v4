const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class ProjectService {
  constructor(workspaceDir) {
    this.workspaceDir = workspaceDir;
    this.metaFile = path.join(workspaceDir, '.mobclowd-projects.json');
    this._ensureMeta();
  }

  _ensureMeta() {
    if (!fs.existsSync(this.metaFile)) {
      fs.writeJsonSync(this.metaFile, { projects: [] });
    }
  }

  _readMeta() {
    try {
      return fs.readJsonSync(this.metaFile);
    } catch {
      return { projects: [] };
    }
  }

  _writeMeta(data) {
    fs.writeJsonSync(this.metaFile, data, { spaces: 2 });
  }

  getAll() {
    const meta = this._readMeta();
    return meta.projects.map(p => ({
      ...p,
      exists: fs.existsSync(path.join(this.workspaceDir, p.id))
    }));
  }

  getById(id) {
    const meta = this._readMeta();
    return meta.projects.find(p => p.id === id);
  }

  create({ name, description = '', template = 'blank' }) {
    const id = uuidv4();
    const projectDir = path.join(this.workspaceDir, id);
    fs.ensureDirSync(projectDir);

    const project = {
      id,
      name,
      description,
      template,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      files: []
    };

    const meta = this._readMeta();
    meta.projects.push(project);
    this._writeMeta(meta);

    return project;
  }

  update(id, updates) {
    const meta = this._readMeta();
    const idx = meta.projects.findIndex(p => p.id === id);
    if (idx === -1) return null;
    meta.projects[idx] = { ...meta.projects[idx], ...updates, updatedAt: new Date().toISOString() };
    this._writeMeta(meta);
    return meta.projects[idx];
  }

  delete(id) {
    const meta = this._readMeta();
    const project = meta.projects.find(p => p.id === id);
    if (!project) return false;

    const projectDir = path.join(this.workspaceDir, id);
    fs.removeSync(projectDir);

    meta.projects = meta.projects.filter(p => p.id !== id);
    this._writeMeta(meta);
    return true;
  }

  getProjectDir(id) {
    return path.join(this.workspaceDir, id);
  }

  getFileTree(id) {
    const dir = path.join(this.workspaceDir, id);
    if (!fs.existsSync(dir)) return [];
    return this._buildTree(dir, dir);
  }

  _buildTree(baseDir, currentDir) {
    const items = [];
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith('.') && entry.name !== '.env') continue;
      if (entry.name === 'node_modules') continue;

      const fullPath = path.join(currentDir, entry.name);
      const relativePath = path.relative(baseDir, fullPath);

      if (entry.isDirectory()) {
        items.push({
          name: entry.name,
          path: relativePath,
          type: 'directory',
          children: this._buildTree(baseDir, fullPath)
        });
      } else {
        const stat = fs.statSync(fullPath);
        items.push({
          name: entry.name,
          path: relativePath,
          type: 'file',
          size: stat.size,
          ext: path.extname(entry.name).slice(1)
        });
      }
    }

    return items.sort((a, b) => {
      if (a.type === 'directory' && b.type !== 'directory') return -1;
      if (a.type !== 'directory' && b.type === 'directory') return 1;
      return a.name.localeCompare(b.name);
    });
  }
}

module.exports = ProjectService;
