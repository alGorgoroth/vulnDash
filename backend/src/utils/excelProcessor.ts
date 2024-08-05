import xlsx, { Sheet } from 'xlsx';
import fs from 'fs';

export interface VulnerabilityData {
  pluginID: string;
  pluginName: string;
  severity: string;
  vprScore: string;
  exploitAvailable: string;
  newsworthy: string;
  affectedCount: number;
  ipsAffected: string;
  [key: string]: any; // Allow for additional properties
}

export interface SheetData {
  name: string;
  data: VulnerabilityData[];
}

export async function processExcelFile(filePath: string): Promise<SheetData[]> {
  console.log('Processing Excel file:', filePath);

  const workbook = xlsx.readFile(filePath);
  console.log('Workbook loaded. Sheets:', workbook.SheetNames);

  const sheetsData: SheetData[] = workbook.SheetNames.map(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    console.log('Processing sheet: ${sheetName}');
    console.log('Raw JSON data sample:', JSON.stringify(jsonData).slice(0, 2) + '...');

    const processedData: VulnerabilityData[] = jsonData.map((row: any) => {
      const processed: VulnerabilityData = {
        pluginID: String(row['Plugin ID'] || ''),
        pluginName: String(row['Plugin Name'] || ''),
        severity: String(row['Severity'] || ''),
        vprScore: String(row['VPR Score'] || ''),
        exploitAvailable: String(row['Exploit Available'] || ''),
        newsworthy: String(row['Newsworthy'] || ''),
        affectedCount: Number(row['Affected Count'] || 0),
        ipsAffected: String(row['IPs Affected'] || ''),
      };

      Object.keys(row).forEach(key => {
        if (!(key in processed)) {
          processed[key] = row[key];
        }
      });

      if (index < 2) {
        console.log('Processed row:', JSON.stringify(processed));
      }
      // console.log('Processed row:', JSON.stringify(processed));
      return processed;
    });

    console.log(`Processed ${processedData.length} rows in sheet ${sheetName}`);

    return {
      name: sheetName,
      data: processedData
    };
  });
  // Clean up: remove the uploaded file
  fs.unlinkSync(filePath);

  return processedData;
}
