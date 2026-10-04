import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { calculateJaspel } from './src/lib/calculateJaspel';
import { 
  testGoogleSheetsConnection, 
  initializeSpreadsheetTabs,
  saveHasilPerhitunganToSheets,
  savePeriodeKapitasiToSheets,
  getHistoricalJaspelFromSheets,
  getSheetData,
  appendSheetData,
  getMasterKaryawanFromSheets,
  SHEET_NAMES,
  SHEET_HEADERS
} from './src/services/googleSheets';
import { parseGoogleCredentials } from './src/lib/google-auth';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Google Sheets Status & Config Info
  app.get('/api/sheets/config', async (req, res) => {
    try {
      const creds = parseGoogleCredentials();
      const sheetId = process.env.SPREADSHEET_ID || '';
      const isConfigured = Boolean(creds && sheetId && sheetId !== 'your_google_spreadsheet_id_here');

      let sheetsFound: string[] | undefined = undefined;
      let sheetTitle: string | undefined = undefined;

      if (isConfigured) {
        try {
          const testRes = await testGoogleSheetsConnection();
          if (testRes.success) {
            sheetsFound = testRes.sheets;
            sheetTitle = testRes.title;
          }
        } catch (connErr: any) {
          console.warn('Auto fetch Google Sheets tabs failed:', connErr.message);
        }
      }

      res.json({
        success: true,
        // Sembunyikan ID sebenarnya demi privasi & keamanan data instansi
        spreadsheetId: isConfigured ? '••••••••••••••••••••••••••••••••' : '',
        isConfigured,
        sheetTitle,
        sheetsFound,
        clientEmail: creds?.client_email ? '••••••••@serviceaccount.gserviceaccount.com' : undefined,
        authMethod: process.env.GOOGLE_SERVICE_ACCOUNT_BASE64
          ? 'base64'
          : process.env.GOOGLE_SERVICE_ACCOUNT_JSON
          ? 'env_json'
          : process.env.GOOGLE_CLIENT_EMAIL
          ? 'env_keys'
          : 'not_set',
      });
    } catch (err: any) {
      res.json({
        success: false,
        spreadsheetId: '',
        isConfigured: false,
        error: err.message,
      });
    }
  });

  // Google Sheets Proxy Route
  app.get('/api/sheets', async (req, res) => {
    const action = req.query.action as string || 'test';

    try {
      if (action === 'test') {
        const testResult = await testGoogleSheetsConnection();
        return res.json(testResult);
      }

      if (action === 'get') {
        const range = (req.query.range as string) || 'Master_Karyawan!A:K';
        const rows = await getSheetData(range);
        return res.json({ success: true, values: rows });
      }

      if (action === 'get-history') {
        const historyData = await getHistoricalJaspelFromSheets();
        return res.json({ success: true, data: historyData });
      }

      if (action === 'get-employees') {
        const employees = await getMasterKaryawanFromSheets();
        return res.json({ success: true, employees });
      }

      res.status(400).json({ error: 'Action parameter tidak dikenali' });
    } catch (err: any) {
      console.warn('Google Sheets API GET error:', err.message);
      res.status(200).json({
        success: false,
        error: err.message,
        hint: 'Periksa SPREADSHEET_ID dan email Service Account di .env'
      });
    }
  });

  app.post('/api/sheets', async (req, res) => {
    try {
      const { action, bulan, tahun, results, setup, range, values, employees } = req.body;

      if (action === 'init-tabs') {
        const initResult = await initializeSpreadsheetTabs();
        return res.json({ success: true, ...initResult });
      }

      if (action === 'save-results') {
        await saveHasilPerhitunganToSheets(bulan, tahun, results);
        return res.json({ success: true, message: 'Hasil Jaspel berhasil disimpan ke Google Sheets' });
      }

      if (action === 'save-setup') {
        await savePeriodeKapitasiToSheets(setup);
        return res.json({ success: true, message: 'Periode kapitasi berhasil disimpan ke Google Sheets' });
      }

      if (action === 'save-employees' && employees) {
        const employeeValues = employees.map((e: any) => [
          e.name,
          e.nip,
          e.tmt,
          e.jenisAsn,
          e.pendidikan,
          e.jabatan,
          [e.program1, e.program2, e.program3].filter(Boolean).join('; '),
          e.npwp,
          e.status,
          e.points,
          e.taxRate,
        ]);
        await appendSheetData(`${SHEET_NAMES.MASTER_KARYAWAN}!A:K`, employeeValues);
        return res.json({ success: true, message: 'Master karyawan tersimpan ke Google Sheets' });
      }

      if (action === 'save-attendance' && values) {
        await appendSheetData(`${SHEET_NAMES.DATA_ABSENSI}!A:E`, values);
        return res.json({ success: true, message: 'Data absensi tersimpan ke Google Sheets' });
      }

      if (action === 'append' && range && values) {
        const appendRes = await appendSheetData(range, values);
        return res.json({ success: true, data: appendRes });
      }

      res.status(400).json({ error: 'Payload aksi tidak valid' });
    } catch (err: any) {
      console.warn('Google Sheets API POST error:', err.message);
      res.status(200).json({
        success: false,
        error: err.message,
        hint: 'Pastikan spreadsheet telah dibagikan (share) ke email Service Account dengan hak akses Editor.'
      });
    }
  });

  // Calculate API Route
  app.post('/api/calculate', (req, res) => {
    try {
      const { employees, totalAlokasi } = req.body;
      if (!employees || !totalAlokasi) {
        return res.status(400).json({ error: 'employees dan totalAlokasi wajib diisi' });
      }
      const result = calculateJaspel(employees, Number(totalAlokasi));
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Jaspel berjalan di http://0.0.0.0:${PORT}`);
  });
}

startServer();
