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
    'TMT Masa Kerja (YYYY-MM-DD)',
    'Pendidikan (SD/SMP/SMA/D3/D4/S1/Profesi)',
    'Jabatan',
    'Tugas Administrasi',
    'Program 1',
    'Program 2',
    'Program 3',
    'Program 4',
    'Program 5',
    'Jumlah Poin (Opsional/Auto)',
    'Kehadiran (Hari)',
    'Hari Maksimal'
  ];

  const sampleRows = [
    [
      1,
      'drg. Indah Mardiyah Hayati, M.H.',
      '19750411 200312 2 004',
      'PNS',
      '2003-12-01',
      'Profesi',
      'Dokter Gigi',
      'Kepala Puskesmas',
      'Manajemen Puskesmas',
      'Pelayanan Gigi & Mulut',
      '',
      '',
      '',
      105,
      22,
      22
    ],
    [
      2,
      'Dr. R. Muhammad Ustadho',
      '19820506 201412 1 001',
      'PNS',
      '2014-12-01',
      'Profesi',
      'Dokter Umum',
      'PJ Pokja UKP',
      'Pelayanan Poli Umum',
      'Pelayanan Rawat Inap & UGD',
      '',
      '',
      '',
      130,
      22,
      22
    ],
    [
      3,
      'Ninik Purwati, S.Kep.Ners',
      '19661203 198712 2 001',
      'PNS',
      '1987-12-01',
      'Profesi',
      'Perawat',
      'PJ Pokja UKM',
      'Pelayanan Keperawatan',
      'Manajemen Rawat Inap',
      '',
      '',
      '',
      90,
      22,
      22
    ],
    [
      4,
      'Wuryanti, S.ST, Bd',
      '19720824 200604 2 013',
      'PNS',
      '2006-04-01',
      'D4/S1',
      'Bidan',
      '-',
      'Kesehatan Ibu & Anak (KIA)',
      'Pelayanan KB',
      '',
      '',
      '',
      86,
      22,
      22
    ],
    [
      5,
      'Ahmad Syarifuddin, S.Kep',
      '19920315 202203 1 004',
      'PPPK',
      '2022-03-01',
      'D4/S1',
      'Perawat',
      '-',
      'Pelayanan Rawat Jalan',
      '',
      '',
      '',
      '',
      55,
      22,
      22
    ],
    [
      6,
      'Siti Nurhaliza, A.Md.Keb',
      '3524106509980002',
      'Honorer',
      '2024-02-01',
      'D3',
      'Bidan',
      '-',
      'Bidan Desa',
      'Posyandu Balita',
      '',
      '',
      '',
      40,
      22,
      22
    ]
  ];

  const colWidths = [6, 32, 24, 25, 18, 16, 22, 20, 24, 24, 20, 20, 20, 16, 12, 12];
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
    'NIP / NIK',
    'Pendidikan',
    'Status Kepegawaian',
    'Jabatan',
    'Tugas Administrasi',
    'PJ Program',
    'TMT',
    'Masa Kerja',
    '% Masa Kerja',
    'Poin Subtotal',
    'Poin Tanpa Kehadiran (PFK BPJS)',
    'Kehadiran (Hari)',
    '% Kehadiran',
    'Jumlah Seluruh Poin Akhir'
  ];

  const dataRows = rows.map((r, idx) => [
    idx + 1,
    r.nama,
    r.nip,
    r.pendidikan,
    r.status,
    r.jabatan,
    r.tugasAdmin,
    [r.program1, r.program2, r.program3, r.program4, r.program5].filter(Boolean).join(', ') || '-',
    r.tmt,
    `${r.lamaKerjaThn} Thn ${r.lamaKerjaBln} Bln`,
    `${r.prosentaseMasaKerja}%`,
    r.poinSubtotal,
    r.poinPfkBpjs,
    `${r.kehadiran} / ${r.maxKehadiran}`,
    `${(r.rasioKehadiran * 100).toFixed(1)}%`,
    Number(r.poinAkhir.toFixed(2))
  ]);

  const totalPfk = rows.reduce((s, r) => s + r.poinPfkBpjs, 0);
  const totalAkhir = rows.reduce((s, r) => s + r.poinAkhir, 0);

  const summaryRow = [
    '',
    'TOTAL',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    totalPfk,
    '',
    '',
    Number(totalAkhir.toFixed(2))
  ];

  const allAoa = [...title, headers, ...dataRows, summaryRow];
  const colWidths = [5, 30, 22, 14, 14, 20, 20, 32, 14, 16, 14, 14, 24, 16, 14, 22];

  downloadExcel(
    `Perhitungan_Poin_Jaspel_${bulan}_${tahun}.xlsx`,
    'Hitung_Poin',
    allAoa,
    colWidths
  );
}
