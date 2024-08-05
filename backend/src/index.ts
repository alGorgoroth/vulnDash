import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { processExcelFile } from './utils/excelProcessor';
import { createServer } from 'http';

const app = express();

app.use(cors());

app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.post('/api/import', upload.single('file'), async (req, res) => {
  if (!req.file) {

    return res.status(400).json({ error: 'No file uploaded' });
  }
  try {
    const data = await processExcelFile(req.file.path);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error processing file' });
  }
});

function findAvailablePort(startPort: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(startPort, () => {
      const { port } = server.address() as { port: number };
      server.close(() => resolve(port));
    });
    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        findAvailablePort(startPort + 1).then(resolve, reject);
      } else {
        reject(err);
      }
    });
  });
}

const startServer = async () => {
  try {
    const port = await findAvailablePort(3001);
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

startServer();
