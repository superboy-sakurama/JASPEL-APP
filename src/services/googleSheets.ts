import { google } from 'googleapis';
import { getGoogleAuthClient, parseGoogleCredentials } from '../lib/google-auth';
import { Employee, CalculatedEmployee, KapitasiSetup } from '../types/jaspel';

export const SHEET_NAMES = {
  MASTER_KARYAWAN: 'Master_Karyawan',
  DATA_ABSENSI: 'Data_Absensi',
  PERIODE_KAPITASI: 'Periode_Kapitasi',
  HASIL_PERHITUNGAN: 'Hasil_Perhitungan',
} as const;

export const SHEET_HEADERS = {
  [SHEET_NAMES.MASTER_KARYAWAN]: [
    'Nama',
    'NIP',
    'TMT',
    'Jenis_ASN',
    'Pendidikan',
    'Jabatan',
    'Program1-5',
    'NPWP',
    'Status',
    'Poin',
    'Tarif_Pajak',
  ],
  [SHEET_NAMES.DATA_ABSENSI]: [
    'Bulan',
    'Tahun',
    'NIP',
    'Nama',
    'Jumlah_Kehadiran',
  ],
  [SHEET_NAMES.PERIODE_KAPITASI]: [
    'Bulan',
    'Tahun',
    'Total_Kapitasi',
    'Alokasi_60',
    'Tanggal_Hitung',
  ],
  [SHEET_NAMES.HASIL_PERHITUNGAN]: [
    'Bulan',
    'Tahun',
    'Nama',
    'Bruto',
    'Pajak',
    'FPK1',
    'FPK4',
    'Netto_Transfer',
  ],
};

export function getSpreadsheetId(): string {
  const sheetId = process.env.SPREADSHEET_ID;
  if (!sheetId || sheetId.trim() === '' || sheetId.includes('placeholder')) {
    throw new Error(
      'SPREADSHEET_ID belum dikonfigurasi di file .env atau Vercel Dashboard.'
    );
  }
  return sheetId.trim();
}

/**
 * Inisialisasi Google Sheets Client dengan cache singleton
 */
let cachedSheetsClient: any = null;

export function getSheetsClient() {
  if (cachedSheetsClient) {
    return cachedSheetsClient;
  }
  const auth = getGoogleAuthClient();
  cachedSheetsClient = google.sheets({ version: 'v4', auth });
  return cachedSheetsClient;
}

/**
 * Mengambil data baris dari range Google Sheets
 */
export const getSheetData = async (range: string): Promise<any[][] | undefined> => {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  return response.data.values;
};

/**
 * Menambahkan data baris ke sheet
 */
export const appendSheetData = async (range: string, values: any[][]) => {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });

  return response.data;
};

/**
 * Update data baris pada range sheet
 */
export const updateSheetData = async (range: string, values: any[][]) => {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const response = await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });

  return response.data;
};

/**
 * Test koneksi Google Sheets & verifikasi akses
 */
export const testGoogleSheetsConnection = async () => {
  const spreadsheetId = getSpreadsheetId();
  const sheets = getSheetsClient();

  const metadata = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'properties.title,sheets.properties.title',
  });

  const existingSheetTitles = (metadata.data.sheets || []).map(
    (s: any) => s.properties?.title
  );

  return {
    success: true,
    title: metadata.data.properties?.title || 'Spreadsheet',
    spreadsheetId,
    sheets: existingSheetTitles,
    configuredTabs: Object.values(SHEET_NAMES).map(name => ({
      name,
      exists: existingSheetTitles.includes(name),
    })),
  };
};

/**
 * Otomatis membuat tab & header jika belum ada di spreadsheet
 */
export const initializeSpreadsheetTabs = async () => {
  const spreadsheetId = getSpreadsheetId();
  const sheets = getSheetsClient();

  const metadata = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties.title',
  });

  const existingTitles = new Set(
    (metadata.data.sheets || []).map((s: any) => s.properties?.title)
  );

  const missingTabs = Object.values(SHEET_NAMES).filter(
    name => !existingTitles.has(name)
  );

  if (missingTabs.length > 0) {
    // Tambah sheet yang kurang
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: missingTabs.map(title => ({
          addSheet: {
            properties: { title },
          },
        })),
      },
    });

    // Tambah header baris pertama
    for (const tabName of missingTabs) {
      const headers = SHEET_HEADERS[tabName];
      if (headers) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${tabName}!A1:${String.fromCharCode(64 + headers.length)}1`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [headers] },
        });
      }
    }
  }

  return { initialized: missingTabs };
};

/**
 * Ambil Master Karyawan dari Google Sheets
 */
export const getMasterKaryawanFromSheets = async (): Promise<Employee[]> => {
  const rows = await getSheetData(`${SHEET_NAMES.MASTER_KARYAWAN}!A2:K`);
  if (!rows || rows.length === 0) return [];

  return rows.map((row, idx) => {
    const name = row[0] || `Karyawan ${idx + 1}`;
    const nip = row[1] || `NIP-${idx + 1}`;
    const tmt = row[2] || '';
    const jenisAsn = row[3] || 'PNS';
    const pendidikan = row[4] || 'S1';
    const jabatan = row[5] || 'Tenaga Kesehatan';
    const programs = row[6] || '';
    const npwp = row[7] || '';
    const statusRaw = (row[8] || 'PNS').trim().toUpperCase();
    const status: 'PNS' | 'PPPK' | 'Honorer' =
      statusRaw === 'HONORER' ? 'Honorer' : statusRaw === 'PPPK' ? 'PPPK' : 'PNS';
    const points = parseFloat(row[9]) || 10;
    const taxRate = parseFloat(row[10]) || (status === 'PNS' ? 0.05 : 0);

    return {
      id: `emp-${idx + 1}`,
      name,
      nip,
      tmt,
      jenisAsn,
      pendidikan,
      jabatan,
      program1: programs,
      npwp,
      status,
      points,
      attendance: 22,
      maxAttendance: 22,
      taxRate,
    };
  });
};

/**
 * Simpan Hasil Perhitungan ke tab Hasil_Perhitungan
 * Sesuai format: Bulan, Tahun, Nama, Bruto, Pajak, FPK1, FPK4, Netto_Transfer
 */
export const saveHasilPerhitunganToSheets = async (
  bulan: string,
  tahun: number,
  results: CalculatedEmployee[]
) => {
  const values = results.map(res => [
    bulan,
    tahun,
    res.name,
    Math.round(res.brutoRaw),
    res.tax,
    res.fpk1,
    res.fpk4,
    res.netto,
  ]);

  return await appendSheetData(`${SHEET_NAMES.HASIL_PERHITUNGAN}!A:H`, values);
};

/**
 * Simpan Periode Kapitasi
 */
export const savePeriodeKapitasiToSheets = async (setup: KapitasiSetup) => {
  const values = [
    [
      setup.bulan,
      setup.tahun,
      setup.totalKapitasi,
      setup.totalAlokasi,
      setup.tanggalHitung,
    ],
  ];

  return await appendSheetData(`${SHEET_NAMES.PERIODE_KAPITASI}!A:E`, values);
};

/**
 * Mengambil riwayat periode dan hasil perhitungan jaspel dari Google Sheets
 */
export const getHistoricalJaspelFromSheets = async () => {
  const [periodeRows, hasilRows] = await Promise.all([
    getSheetData(`${SHEET_NAMES.PERIODE_KAPITASI}!A2:E`).catch(() => []),
    getSheetData(`${SHEET_NAMES.HASIL_PERHITUNGAN}!A2:H`).catch(() => []),
  ]);

  return {
    periode: (periodeRows || []).map((row) => ({
      bulan: row[0] || '',
      tahun: Number(row[1]) || 2026,
      totalKapitasi: Number(row[2]) || 0,
      totalAlokasi: Number(row[3]) || 0,
      tanggalHitung: row[4] || '',
    })),
    hasil: (hasilRows || []).map((row) => ({
      bulan: row[0] || '',
      tahun: Number(row[1]) || 2026,
      nama: row[2] || '',
      bruto: Number(row[3]) || 0,
      pajak: Number(row[4]) || 0,
      fpk1: Number(row[5]) || 0,
      fpk4: Number(row[6]) || 0,
      netto: Number(row[7]) || 0,
    })),
  };
};
