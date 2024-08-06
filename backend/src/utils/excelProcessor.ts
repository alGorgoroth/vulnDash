import xlsx from 'xlsx';
import fs from 'fs';
import { Database } from 'sqlite3';

interface VulnerabilityData {
  pluginID: string;
  pluginName: string;
  severity: string;
  cvssScore: string;
  description: string;
  solution: string;
}

interface HostData {
  name: string;
  ip: string;
  operatingSystem: string;
  vulnerabilities: VulnerabilityData[];
}

const db = new Database('vulnerability_dashboard.db');

export async function processExcelFile(filePath: string): Promise<void> {
  console.log('Processing Excel file:', filePath);

  const workbook = xlsx.readFile(filePath);
  console.log('Workbook loaded. Sheets:', workbook.SheetNames);

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    console.log(`Processing sheet: ${sheetName}`);
    console.log('Raw JSON data sample:', JSON.stringify(jsonData.slice(0, 2)) + '...');

    const hostMap = new Map<string, HostData>();

    for (const row of jsonData) {
      const vuln: VulnerabilityData = {
        pluginID: String(row['Plugin ID'] || ''),
        pluginName: String(row['Plugin Name'] || ''),
        severity: String(row['Severity'] || ''),
        cvssScore: String(row['CVSS Score'] || ''),
        description: String(row['Description'] || ''),
        solution: String(row['Solution'] || ''),
      };

      const hostIP = String(row['IP'] || '');
      if (!hostMap.has(hostIP)) {
        hostMap.set(hostIP, {
          name: String(row['Host Name'] || `Host-${hostIP}`),
          ip: hostIP,
          operatingSystem: String(row['Operating System'] || 'Unknown'),
          vulnerabilities: [],
        });
      }
      hostMap.get(hostIP)!.vulnerabilities.push(vuln);
    }

    await insertData(Array.from(hostMap.values()));
  }

  // Clean up: remove the uploaded file
  fs.unlinkSync(filePath);
}

async function insertData(hosts: HostData[]): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      const stmtHost = db.prepare('INSERT INTO hosts (name, ip, operating_system) VALUES (?, ?, ?)');
      const stmtVuln = db.prepare('INSERT INTO vulnerabilities (plugin_id, plugin_name, severity, cvss_score, description, solution) VALUES (?, ?, ?, ?, ?, ?)');
      const stmtHostVuln = db.prepare('INSERT INTO host_vulnerabilities (host_id, vulnerability_id) VALUES (?, ?)');

      hosts.forEach((host) => {
        stmtHost.run(host.name, host.ip, host.operatingSystem, function (this: any) {
          const hostId = this.lastID;

          host.vulnerabilities.forEach((vuln) => {
            stmtVuln.run(vuln.pluginID, vuln.pluginName, vuln.severity, vuln.cvssScore, vuln.description, vuln.solution, function (this: any) {
              const vulnId = this.lastID;
              stmtHostVuln.run(hostId, vulnId);
            });
          });
        });
      });

      stmtHost.finalize();
      stmtVuln.finalize();
      stmtHostVuln.finalize();

      db.run('COMMIT', (err) => {
        if (err) {
          console.error('Error committing transaction:', err);
          db.run('ROLLBACK');
          reject(err);
        } else {
          console.log('Data inserted successfully');
          resolve();
        }
      });
    });
  });
}
