import * as XLSX from 'xlsx';
import { HitungPoinRow } from '../types/jaspel';

/**
 * Download generic 2D array as formatted XLSX file
 */
export function downloadExcel(
  filename: string,
  sheetName: string,
  data: any[][],
  colWidths?: number[]
) {
  const ws = XLSX.utils.aoa_to_sheet(data);
  if (colWidths && colWidths.length > 0) {
    ws['!cols'] = colWidths.map((w) => ({ wch: w }));
  }
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
  const finalFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  XLSX.writeFile(wb, finalFilename);
}

/**
 * Parse an uploaded Excel or CSV file into a 2D array of values
 */
export async function parseExcelOrCsvFile(file: File): Promise<any[][]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: '' });
        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
}

/**
 * Generate and download standard Master Data Pegawai Excel template (.xlsx)
 */
export function downloadMasterPegawaiTemplate() {
  const headers = [
    'No',
    'Nama Pegawai',
    'NIP / NIK',
    'Status Kepegawaian (PNS/PPPK/Honorer)',
    'Golongan / Ruang (e.g. IV/a, III/d, II/c)',
    'TMT Masa Kerja (YYYY-MM-DD)',
    'Pendidikan (SD/SMP/SMA/D3/D4/S1/Profesi)',
    'Jabatan',
    'Tugas Administrasi',
    'PJ Program',
    'Program 1',
    'Tambahan 1',
    'Tambahan 2',
    'Tambahan 3',
    'Tambahan 4',
    'Jumlah Poin Dasar (Opsional/Auto)'
  ];

  const sampleRows = [
    [
      1,
      'drg. Indah Mardiyah Hayati, M.H.',
      '19750411 200312 2 004',
      'PNS',
      'IV/a',
      '2003-12-01',
      'Profesi',
      'Dokter Gigi',
      'Kapus',
      'Manajemen',
      'Pelayanan Poli',
      'Pelayanan Rawat Inap',
      '',
      '',
      '',
      175
    ],
    [
      2,
      'Dr. R. Muhammad Ustadho',
      '19820506 201412 1 001',
      'PNS',
      'IV/a',
      '2014-12-01',
      'S1',
      'Dokter',
      'RJG dan RIG',
      'Pelayanan Poli',
      'Pelayanan Rawat Inap',
      'Tambahan 1',
      'Tambahan 2',
      '',
      '',
      221.2
    ],
    [
      3,
      'Ninik Purwati, S.Kep.Ners',
      '19661203 198712 2 001',
      'PNS',
      'IV/a',
      '1987-12-01',
      'Profesi',
      'Ners / S.St Bd',
      '-',
      'Keperawatan',
      'Pelayanan Rawat Inap',
      '',
      '',
      '',
      '',
      146.25
    ],
    [
      4,
      'Wuryanti, S.ST, Bd',
      '19720824 200604 2 013',
      'PNS',
      'III/d',
      '2006-04-01',
      'D4/S1',
      'Bidan',
      '-',
      'Kesehatan Ibu & Anak (KIA)',
      'Pelayanan KB',
      '',
      '',
      '',
      '',
      86
    ],
    [
      5,
      'Ahmad Syarifuddin, S.Kep',
      '19920315 202203 1 004',
      'PPPK',
      '-',
      '2022-03-01',
      'D4/S1',
      'Perawat',
      '-',
      'Pelayanan Rawat Jalan',
      '',
      '',
      '',
      '',
      '',
      55
    ],
    [
      6,
      'Siti Nurhaliza, A.Md.Keb',
      '3524106509980002',
      'Honorer',
      '-',
      '2024-02-01',
      'D3',
      'Bidan',
      '-',
      'Bidan Desa',
      'Posyandu Balita',
      '',
      '',
      '',
      '',
      40
    ]
  ];

  const colWidths = [6, 32, 24, 25, 18, 18, 16, 22, 20, 24, 24, 20, 20, 20, 20, 16];
  downloadExcel(
    'Format_Import_Master_Karyawan_Jaspel.xlsx',
    'Master_Karyawan',
    [headers, ...sampleRows],
    colWidths
  );
}

/**
 * Generate and download Hitung Poin Excel report (.xlsx)
 */
export function downloadHitungPoinExcel(
  rows: HitungPoinRow[],
  bulan: string,
  tahun: number,
  instansiName: string
) {
  const title = [
    [`DAFTAR PERHITUNGAN POIN JASA PELAYANAN (JASPEL) KESEHATAN`],
    [`INSTANSI: ${instansiName.toUpperCase()}`],
    [`PERIODE: ${bulan.toUpperCase()} ${tahun}`],
    []
  ];

  const headers = [
    'No',
    'Nama Pegawai',
    'Pendidikan',
    'TMT',
    'Masa Kerja (Th)',
    'Masa Kerja (Bln)',
    'Masa Kerja (Hari)',
    'Presensi',
    'Hari Kerja',
    '% Kehadiran',
    'Poin Ketenagaan',
    'Poin Masa Kerja',
    'Poin Rangkap Tugas',
    'PJ Program',
    'Program 1',
    'Tambahan 1',
    'Tambahan 2',
    'Tambahan 3',
    'Tambahan 4',
    'Total Poin Program',
    'Status Kepegawaian',
    'Status Nilai',
    'Total Point',
    'Poin Kehadiran',
    'Kinerja Uraian',
    'Kinerja Nilai (%)',
    'Poin Kinerja',
    'Masa Kerja Bln (Non ASN)',
    '% Masa Kerja',
    'Exit Poin Final',
    'Jasa Pelayanan (Rp)',
    'Total Poin Tanpa Kehadiran',
    'PFK BPJS (Rp)'
  ];

  const dataRows = rows.map((r, idx) => [
    idx + 1,
    r.nama,
    r.pendidikan,
    r.tmt,
    r.masaKerjaTh,
    r.masaKerjaBln,
    r.masaKerjaHari,
    r.presensi,
    r.hariKerja,
    `${r.prosentaseKehadiran}%`,
    r.poinKetenagaan,
    r.poinMasaKerja,
    r.poinRangkapTugas || 0,
    r.poinPjProg ? `${r.poinPjProg} (${r.namaPjProg || ''})` : 0,
    r.poinProg1 ? `${r.poinProg1} (${r.namaProg1 || ''})` : 0,
    r.poinProg2 ? `${r.poinProg2} (${r.namaProg2 || ''})` : 0,
    r.poinProg3 ? `${r.poinProg3} (${r.namaProg3 || ''})` : 0,
    r.poinProg4 ? `${r.poinProg4} (${r.namaProg4 || ''})` : 0,
    r.poinProg5 ? `${r.poinProg5} (${r.namaProg5 || ''})` : 0,
    r.poinProgTambahanTotal,
    r.statusKepegawaian === 'Honorer' ? 'NON ASN' : r.statusKepegawaian,
    r.statusNilai,
    r.totalPoint,
    r.poinKehadiran,
    r.kinerjaUraian,
    `${r.kinerjaNilai}%`,
    r.poinKinerja,
    r.masaKerjaBulan,
    `${r.prosentaseMasaKerja}%`,
    r.exitPoin,
    r.jasaPelayanan,
    r.totalPoinTanpaKehadiran,
    r.pfkBpjs
  ]);

  const totalPoints = rows.reduce((s, r) => s + r.totalPoint, 0);
  const totalExit = rows.reduce((s, r) => s + r.exitPoin, 0);
  const totalJaspel = rows.reduce((s, r) => s + r.jasaPelayanan, 0);
  const totalPfk = rows.reduce((s, r) => s + r.totalPoinTanpaKehadiran, 0);
  const totalPfkRp = rows.reduce((s, r) => s + r.pfkBpjs, 0);

  const totalProgramPoin = rows.reduce((s, r) => s + r.poinProgTambahanTotal, 0);

  const summaryRow = [
    '',
    'TOTAL',
    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    Number(totalProgramPoin.toFixed(2)),
    '', '',
    Number(totalPoints.toFixed(2)),
    '', '', '', '', '', '',
    Number(totalExit.toFixed(2)),
    totalJaspel,
    Number(totalPfk.toFixed(2)),
    totalPfkRp
  ];

  const allAoa = [...title, headers, ...dataRows, summaryRow];
  const colWidths = [5, 28, 12, 12, 8, 8, 8, 10, 10, 12, 12, 12, 14, 16, 16, 16, 16, 16, 16, 14, 14, 10, 12, 12, 12, 12, 12, 12, 12, 14, 18, 18, 18];

  downloadExcel(
    `Perhitungan_Poin_Jaspel_${bulan}_${tahun}.xlsx`,
    'Hitung_Poin',
    allAoa,
    colWidths
  );
}

/**
 * Robustly parse Excel date values (Serial numbers, JS Date objects, formatted strings, year strings) into 'YYYY-MM-DD'
 */
export function parseExcelDate(rawVal: any): string {
  if (rawVal === undefined || rawVal === null || rawVal === '') {
    return '2020-01-01';
  }
  if (rawVal instanceof Date) {
    if (!isNaN(rawVal.getTime())) {
      return rawVal.toISOString().split('T')[0];
    }
  }
  if (typeof rawVal === 'number') {
    // Excel serial number (days since Dec 30 1899)
    const jsDate = new Date(Math.round((rawVal - (25567 + 2)) * 86400 * 1000));
    if (!isNaN(jsDate.getTime())) {
      return jsDate.toISOString().split('T')[0];
    }
  }
  const str = String(rawVal).trim();
  if (!str) return '2020-01-01';

  // Check if 4 digit year
  if (/^\d{4}$/.test(str)) {
    return `${str}-01-01`;
  }

  // Check if numeric string representing Excel serial number
  if (!isNaN(Number(str)) && Number(str) > 10000) {
    const num = Number(str);
    const jsDate = new Date(Math.round((num - (25567 + 2)) * 86400 * 1000));
    if (!isNaN(jsDate.getTime())) {
      return jsDate.toISOString().split('T')[0];
    }
  }

  // Normalize slashes to dashes
  let normalized = str.replace(/\//g, '-');
  const parts = normalized.split('-');
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      const y = parts[0];
      const m = parts[1].padStart(2, '0');
      const d = parts[2].padStart(2, '0');
      return `${y}-${m}-${d}`;
    } else if (parts[2].length === 4) {
      // DD-MM-YYYY or MM-DD-YYYY
      const d = parts[0].padStart(2, '0');
      const m = parts[1].padStart(2, '0');
      const y = parts[2];
      return `${y}-${m}-${d}`;
    }
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return '2020-01-01';
}

