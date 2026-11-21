const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const WORKSPACE_ROOT = '/home/user';
const PUBLIC_DIR = path.join(__dirname, 'public');

// Scan real workspace files
function scanWorkspace(dir, results = [], depth = 0) {
  if (depth > 6) return results;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const fullPath = path.join(dir, entry.name);
    let stat;
    try {
      stat = fs.statSync(fullPath);
    } catch {
      continue;
    }

    const isDir = entry.isDirectory();
    const ext = isDir ? '' : path.extname(entry.name).slice(1).toLowerCase();

    results.push({
      name: entry.name,
      path: dir,
      fullPath,
      isDir,
      size: isDir ? 0 : stat.size,
      mtime: stat.mtimeMs,
      ext,
      source: 'workspace',
    });

    if (isDir) {
      scanWorkspace(fullPath, results, depth + 1);
    }
  }
  return results;
}

// Generate a rich, realistic demo filesystem (like Windows C:\ & D:\)
function generateDemoFilesystem() {
  const now = Date.now();
  const day = 86400000;
  const items = [];

  const add = (fullPath, isDir, size, daysAgo) => {
    const lastSep = fullPath.lastIndexOf('\\');
    const dirPath = lastSep > 0 ? fullPath.slice(0, lastSep) : fullPath;
    const name = lastSep > 0 ? fullPath.slice(lastSep + 1) : fullPath;
    const ext = isDir ? '' : (name.includes('.') ? name.split('.').pop().toLowerCase() : '');
    items.push({
      name,
      path: dirPath,
      fullPath,
      isDir,
      size: isDir ? 0 : size,
      mtime: now - daysAgo * day,
      ext,
      source: 'demo',
    });
  };

  const dirs = [
    'C:\\Windows',
    'C:\\Windows\\System32',
    'C:\\Windows\\Fonts',
    'C:\\Program Files',
    'C:\\Program Files\\Everything',
    'C:\\Program Files\\Mozilla Firefox',
    'C:\\Program Files\\VideoLAN\\VLC',
    'C:\\Program Files\\Git\\bin',
    'C:\\Users\\Admin',
    'C:\\Users\\Admin\\Desktop',
    'C:\\Users\\Admin\\Documents',
    'C:\\Users\\Admin\\Documents\\Work',
    'C:\\Users\\Admin\\Documents\\Invoices',
    'C:\\Users\\Admin\\Downloads',
    'C:\\Users\\Admin\\Pictures',
    'C:\\Users\\Admin\\Pictures\\Vacation_2026',
    'C:\\Users\\Admin\\Music',
    'C:\\Users\\Admin\\Videos',
    'D:\\Projects',
    'D:\\Projects\\web-app',
    'D:\\Projects\\web-app\\src',
    'D:\\Projects\\ai-notes',
    'D:\\Backups',
  ];

  dirs.forEach((d, i) => add(d, true, 0, (i * 3) % 90));

  const sampleFiles = [
    ['C:\\Program Files\\Everything\\Everything.exe', 2457600, 12],
    ['C:\\Program Files\\Everything\\Everything.ini', 18432, 1],
    ['C:\\Program Files\\Everything\\License.txt', 2048, 120],
    ['C:\\Program Files\\Mozilla Firefox\\firefox.exe', 684200, 5],
    ['C:\\Program Files\\VideoLAN\\VLC\\vlc.exe', 1024000, 30],
    ['C:\\Program Files\\Git\\bin\\git.exe', 524288, 15],
    ['C:\\Windows\\System32\\cmd.exe', 302592, 200],
    ['C:\\Windows\\System32\\notepad.exe', 215040, 200],
    ['C:\\Windows\\System32\\drivers\\etc\\hosts', 824, 45],
    ['C:\\Users\\Admin\\Desktop\\Todo.txt', 1420, 0],
    ['C:\\Users\\Admin\\Desktop\\Budget_2026.xlsx', 48200, 2],
    ['C:\\Users\\Admin\\Documents\\Resume_2026.pdf', 312000, 10],
    ['C:\\Users\\Admin\\Documents\\Project_Proposal.docx', 128400, 3],
    ['C:\\Users\\Admin\\Documents\\Meeting_Notes.md', 6400, 0],
    ['C:\\Users\\Admin\\Documents\\Work\\Q4_Report.pdf', 1845000, 4],
    ['C:\\Users\\Admin\\Documents\\Work\\Architecture_Diagram.png', 945000, 7],
    ['C:\\Users\\Admin\\Documents\\Work\\Presentation.pptx', 4520000, 6],
    ['C:\\Users\\Admin\\Documents\\Invoices\\Invoice_001.pdf', 145000, 25],
    ['C:\\Users\\Admin\\Documents\\Invoices\\Invoice_002.pdf', 152000, 14],
    ['C:\\Users\\Admin\\Documents\\Invoices\\Invoice_003.pdf', 139000, 2],
    ['C:\\Users\\Admin\\Downloads\\Everything-1.4.1.1026.x64-Setup.exe', 1785000, 1],
    ['C:\\Users\\Admin\\Downloads\\ubuntu-24.04-desktop-amd64.iso', 4982162048, 18],
    ['C:\\Users\\Admin\\Downloads\\archive_backup.zip', 84500000, 9],
    ['C:\\Users\\Admin\\Downloads\\node-v20.18.0-x64.msi', 31457280, 22],
    ['C:\\Users\\Admin\\Pictures\\avatar.png', 245000, 40],
    ['C:\\Users\\Admin\\Pictures\\wallpaper_4k.jpg', 3840000, 11],
    ['C:\\Users\\Admin\\Pictures\\Vacation_2026\\IMG_1001.jpg', 4210000, 20],
    ['C:\\Users\\Admin\\Pictures\\Vacation_2026\\IMG_1002.jpg', 3980000, 20],
    ['C:\\Users\\Admin\\Pictures\\Vacation_2026\\sunset_beach.png', 6120000, 19],
    ['C:\\Users\\Admin\\Music\\lofi_beats.mp3', 7420000, 35],
    ['C:\\Users\\Admin\\Music\\classical_piano.flac', 28400000, 50],
    ['C:\\Users\\Admin\\Music\\podcast_ep42.mp3', 42100000, 3],
    ['C:\\Users\\Admin\\Videos\\screen_recording_demo.mp4', 124500000, 1],
    ['C:\\Users\\Admin\\Videos\\tutorial_everything.mkv', 312000000, 15],
    ['D:\\Projects\\web-app\\package.json', 1240, 2],
    ['D:\\Projects\\web-app\\README.md', 4200, 5],
    ['D:\\Projects\\web-app\\src\\index.ts', 8400, 1],
    ['D:\\Projects\\web-app\\src\\App.tsx', 14200, 0],
    ['D:\\Projects\\web-app\\src\\styles.css', 6100, 1],
    ['D:\\Projects\\ai-notes\\embeddings.py', 9800, 4],
    ['D:\\Projects\\ai-notes\\dataset.csv', 2450000, 8],
    ['D:\\Backups\\system_2026_11.tar.gz', 512000000, 7],
  ];

  sampleFiles.forEach(([p, s, d]) => add(p, false, s, d));

  // Add ~300 extra generated files for realistic scale & instant search feel
  const exts = ['txt', 'pdf', 'jpg', 'png', 'mp3', 'mp4', 'docx', 'xlsx', 'js', 'py', 'json', 'zip'];
  const prefixes = ['report', 'data', 'config', 'backup', 'image', 'track', 'clip', 'note', 'draft', 'log'];
  for (let i = 1; i <= 300; i++) {
    const ext = exts[i % exts.length];
    const prefix = prefixes[i % prefixes.length];
    const dir = dirs[i % dirs.length];
    const size = ((i * 7919) % 5000000) + 512;
    const daysAgo = i % 120;
    add(`${dir}\\${prefix}_${String(i).padStart(3, '0')}.${ext}`, false, size, daysAgo);
  }

  return items;
}

const DEMO_ITEMS = generateDemoFilesystem();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/index') {
    const source = url.searchParams.get('source') || 'all';
    const t0 = performance.now();
    let items = [];
    if (source === 'workspace') {
      items = scanWorkspace(WORKSPACE_ROOT);
    } else if (source === 'demo') {
      items = DEMO_ITEMS;
    } else {
      items = [...scanWorkspace(WORKSPACE_ROOT), ...DEMO_ITEMS];
    }
    const elapsed = (performance.now() - t0).toFixed(2);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ items, indexTimeMs: elapsed, total: items.length }));
    return;
  }

  if (url.pathname === '/api/file') {
    const filePath = url.searchParams.get('path') || '';
    if (!filePath.startsWith(WORKSPACE_ROOT)) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Preview only available for workspace files.' }));
      return;
    }
    try {
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        const entries = fs.readdirSync(filePath);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ type: 'dir', entries }));
        return;
      }
      if (stat.size > 200 * 1024) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ type: 'binary', message: `File too large to preview (${stat.size} bytes).` }));
        return;
      }
      const content = fs.readFileSync(filePath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ type: 'text', content }));
    } catch (err) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // Serve static files
  let reqPath = url.pathname === '/' ? '/index.html' : url.pathname;
  const safePath = path.normalize(reqPath).replace(/^(\.\.[/\\])+/, '');
  const fullPath = path.join(PUBLIC_DIR, safePath);

  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    const ext = path.extname(fullPath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    fs.createReadStream(fullPath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Everything Clone server listening on http://0.0.0.0:${PORT}`);
});
