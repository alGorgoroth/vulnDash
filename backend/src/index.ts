import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Database } from 'sqlite3';
import { processExcelFile } from './utils/excelProcessor';
import path from 'path';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// Initialize SQLite database
const db = new Database('vulnerability_dashboard.db', (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Database opened successfully');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Create Hosts table
    db.run(`CREATE TABLE IF NOT EXISTS hosts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      ip TEXT,
      operating_system TEXT
    )`);

    // Create Vulnerabilities table
    db.run(`CREATE TABLE IF NOT EXISTS vulnerabilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plugin_id TEXT,
      plugin_name TEXT,
      severity TEXT,
      cvss_score REAL,
      description TEXT,
      solution TEXT
    )`);

    // Create Groups table
    db.run(`CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      criticality TEXT
    )`);

    // Create Host_Vulnerabilities join table
    db.run(`CREATE TABLE IF NOT EXISTS host_vulnerabilities (
      host_id INTEGER,
      vulnerability_id INTEGER,
      FOREIGN KEY (host_id) REFERENCES hosts (id),
      FOREIGN KEY (vulnerability_id) REFERENCES vulnerabilities (id)
    )`);

    // Create Host_Groups join table
    db.run(`CREATE TABLE IF NOT EXISTS host_groups (
      host_id INTEGER,
      group_id INTEGER,
      FOREIGN KEY (host_id) REFERENCES hosts (id),
      FOREIGN KEY (group_id) REFERENCES groups (id)
    )`);
  });
}

// Helper function to run SQL queries
function runQuery(query: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// API Routes

// Hosts
app.get('/api/hosts', async (req, res) => {
  try {
    const hosts = await runQuery('SELECT * FROM hosts');
    res.json(hosts);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching hosts' });
  }
});

app.get('/api/hosts/:hostId', async (req, res) => {
  try {
    const host = await runQuery('SELECT * FROM hosts WHERE id = ?', [req.params.hostId]);
    if (host.length === 0) {
      res.status(404).json({ error: 'Host not found' });
    } else {
      res.json(host[0]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching host' });
  }
});

app.post('/api/hosts', async (req, res) => {
  const { name, ip, operating_system } = req.body;
  if (!name || !ip) {
    return res.status(400).json({ error: 'Name and IP are required' });
  }
  try {
    const result = await runQuery(
      'INSERT INTO hosts (name, ip, operating_system) VALUES (?, ?, ?)',
      [name, ip, operating_system]
    );
    res.status(201).json({ id: result.lastID, name, ip, operating_system });
  } catch (error) {
    res.status(500).json({ error: 'Error creating host' });
  }
});

app.put('/api/hosts/:hostId', async (req, res) => {
  const { name, ip, operating_system } = req.body;
  if (!name || !ip) {
    return res.status(400).json({ error: 'Name and IP are required' });
  }
  try {
    await runQuery(
      'UPDATE hosts SET name = ?, ip = ?, operating_system = ? WHERE id = ?',
      [name, ip, operating_system, req.params.hostId]
    );
    res.json({ id: req.params.hostId, name, ip, operating_system });
  } catch (error) {
    res.status(500).json({ error: 'Error updating host' });
  }
});

app.delete('/api/hosts/:hostId', async (req, res) => {
  try {
    await runQuery('DELETE FROM hosts WHERE id = ?', [req.params.hostId]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting host' });
  }
});

// Vulnerabilities
app.get('/api/vulnerabilities', async (req, res) => {
  try {
    const vulnerabilities = await runQuery('SELECT * FROM vulnerabilities');
    res.json(vulnerabilities);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching vulnerabilities' });
  }
});

app.get('/api/vulnerabilities/:vulnerabilityId', async (req, res) => {
  try {
    const vulnerability = await runQuery('SELECT * FROM vulnerabilities WHERE id = ?', [req.params.vulnerabilityId]);
    if (vulnerability.length === 0) {
      res.status(404).json({ error: 'Vulnerability not found' });
    } else {
      res.json(vulnerability[0]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching vulnerability' });
  }
});

app.post('/api/vulnerabilities', async (req, res) => {
  const { plugin_id, plugin_name, severity, cvss_score, description, solution } = req.body;
  if (!plugin_id || !plugin_name || !severity) {
    return res.status(400).json({ error: 'Plugin ID, name, and severity are required' });
  }
  try {
    const result = await runQuery(
      'INSERT INTO vulnerabilities (plugin_id, plugin_name, severity, cvss_score, description, solution) VALUES (?, ?, ?, ?, ?, ?)',
      [plugin_id, plugin_name, severity, cvss_score, description, solution]
    );
    res.status(201).json({ id: result.lastID, plugin_id, plugin_name, severity, cvss_score, description, solution });
  } catch (error) {
    res.status(500).json({ error: 'Error creating vulnerability' });
  }
});

app.put('/api/vulnerabilities/:vulnerabilityId', async (req, res) => {
  const { plugin_id, plugin_name, severity, cvss_score, description, solution } = req.body;
  if (!plugin_id || !plugin_name || !severity) {
    return res.status(400).json({ error: 'Plugin ID, name, and severity are required' });
  }
  try {
    await runQuery(
      'UPDATE vulnerabilities SET plugin_id = ?, plugin_name = ?, severity = ?, cvss_score = ?, description = ?, solution = ? WHERE id = ?',
      [plugin_id, plugin_name, severity, cvss_score, description, solution, req.params.vulnerabilityId]
    );
    res.json({ id: req.params.vulnerabilityId, plugin_id, plugin_name, severity, cvss_score, description, solution });
  } catch (error) {
    res.status(500).json({ error: 'Error updating vulnerability' });
  }
});

app.delete('/api/vulnerabilities/:vulnerabilityId', async (req, res) => {
  try {
    await runQuery('DELETE FROM vulnerabilities WHERE id = ?', [req.params.vulnerabilityId]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting vulnerability' });
  }
});

// Groups
app.get('/api/groups', async (req, res) => {
  try {
    const groups = await runQuery('SELECT * FROM groups');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching groups' });
  }
});

app.get('/api/groups/:groupId', async (req, res) => {
  try {
    const group = await runQuery('SELECT * FROM groups WHERE id = ?', [req.params.groupId]);
    if (group.length === 0) {
      res.status(404).json({ error: 'Group not found' });
    } else {
      res.json(group[0]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching group' });
  }
});

app.post('/api/groups', async (req, res) => {
  const { name, criticality } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  try {
    const result = await runQuery(
      'INSERT INTO groups (name, criticality) VALUES (?, ?)',
      [name, criticality]
    );
    res.status(201).json({ id: result.lastID, name, criticality });
  } catch (error) {
    res.status(500).json({ error: 'Error creating group' });
  }
});

app.put('/api/groups/:groupId', async (req, res) => {
  const { name, criticality } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  try {
    await runQuery(
      'UPDATE groups SET name = ?, criticality = ? WHERE id = ?',
      [name, criticality, req.params.groupId]
    );
    res.json({ id: req.params.groupId, name, criticality });
  } catch (error) {
    res.status(500).json({ error: 'Error updating group' });
  }
});

app.delete('/api/groups/:groupId', async (req, res) => {
  try {
    await runQuery('DELETE FROM groups WHERE id = ?', [req.params.groupId]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting group' });
  }
});

// Import data
app.post('/api/import', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  try {
    await processExcelFile(req.file.path);
    res.json({ message: 'Data imported successfully' });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Error processing file' });
  }
});

// Export data
app.get('/api/export', async (req, res) => {
  try {
    // TODO: Implement data export functionality
    res.status(501).json({ error: 'Export functionality not implemented yet' });
  } catch (error) {
    res.status(500).json({ error: 'Error exporting data' });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
