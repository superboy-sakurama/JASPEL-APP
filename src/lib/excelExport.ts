import * as XLSX from 'xlsx';
import { CalculatedEmployee, KapitasiSetup, KwitansiPejabat } from '../types/jaspel';
import { terbilang, formatNumber } from './utils';

/**
 * Export Kwitansi Global Tanda Tangan ke format file Microsoft Excel (.xlsx)
 * Persis dengan layout dokumen kedinasan JKN Puskesmas Kalitengah
 */
export function exportKwitansiToExcel(
  employees: CalculatedEmployee[],
  setup: KapitasiSetup,
  pejabat: KwitansiPejabat,
  filename?: string
) {
  const wsData: (string | number)[][] = [];

  // Baris Judul
  wsData.push(['KWITANSI']);
  wsData.push([]);
  wsData.push(['Sudah terima dari', ':', `Kuasa Pengguna Anggaran ${pejabat.namaFaskes}`]);
  wsData.push([
    'Banyaknya Uang',
    ':',
    `Rp ${formatNumber(setup.totalAlokasi, 0)}.00`,
    `( ${terbilang(setup.totalAlokasi)} )`,
  ]);
  wsData.push([
    'Dipergunakan Untuk',
    ':',
    `Belanja Jasa pelayanan Jaminan Kesehatan Nasional (JKN) ${pejabat.namaFaskes} bagian bulan ${setup.bulan} ${setup.tahun}`,
  ]);
  wsData.push([]);

  // Baris Header Kolom Tabel (2 Baris)
  wsData.push([
    'NO',
    'N A M A',
    'N I P / NIK',
    'JUMLAH',
    'POTONGAN PPh Pasal 21',
    '',
    `PFK ${setup.tahun} (1%)`,
    'PENERIMAAN',
    'TANDA TANGAN',
    '',
  ]);
  wsData.push([
    '',
    '',
    '',
    '(Rp.)',
    '15%',
    '5%',
    '1%',
    '(Rp.)',
    '',
    '',
  ]);

  // Baris Data Pegawai
  let sumBruto = 0;
  let sumTax15 = 0;
  let sumTax5 = 0;
  let sumFpk1 = 0;
  let sumNetto = 0;

  employees.forEach((emp, idx) => {
    const no = idx + 1;
    const tax15 = emp.taxRate >= 0.15 ? emp.tax : 0;
    const tax5 = emp.taxRate < 0.15 && emp.taxRate > 0 ? emp.tax : 0;
    sumBruto += emp.brutoRaw;
    sumTax15 += tax15;
    sumTax5 += tax5;
    sumFpk1 += emp.fpk1;
    sumNetto += emp.netto;

    // Format selang-seling tanda tangan khas kwitansi kedinasan (ganjil di kiri, genap di kanan)
    const ttdLeft = no % 2 === 1 ? `${no} .........` : '';
    const ttdRight = no % 2 === 0 ? `${no} .........` : '';

    wsData.push([
      no,
      emp.name,
      emp.nip ? `'${emp.nip}` : '-', // Kutip di awal agar NIP panjang tidak berubah jadi notasi ilmiah di Excel
      emp.brutoRaw,
      tax15 > 0 ? tax15 : 0,
      tax5 > 0 ? tax5 : 0,
      emp.fpk1 > 0 ? emp.fpk1 : 0,
      emp.netto,
      ttdLeft,
      ttdRight,
    ]);
  });

  // Baris Summary Total
  const summaryRowIndex = 8 + employees.length;
  wsData.push([
    'JUMLAH',
    '',
    '',
    sumBruto,
    sumTax15,
    sumTax5,
    sumFpk1,
    sumNetto,
    '',
    '',
  ]);

  wsData.push([]);
  wsData.push([
    'Terbilang :',
    `Rp ${formatNumber(setup.totalAlokasi, 0)}.00`,
    `( ${terbilang(setup.totalAlokasi)} )`,
  ]);
  wsData.push([]);

  // Pejabat Tanda Tangan (3 Kolom: KPA, PPTK, Bendahara)
  wsData.push([
    '',
    pejabat.kpaJabatan,
    '',
    '',
    pejabat.pptkJabatan,
    '',
    '',
    `Lunas dibayar Tgl. ${pejabat.lunasTgl || '..................'}`,
    '',
    '',
  ]);
  wsData.push([
    '',
    '(KPA)',
    '',
    '',
    '(PPTK)',
    '',
    '',
    pejabat.bendaharaJabatan,
    '',
    '',
  ]);
  wsData.push([]);
  wsData.push([]);
  wsData.push([]);
  wsData.push([
    '',
    pejabat.kpaNama,
    '',
    '',
    pejabat.pptkNama,
    '',
    '',
    pejabat.bendaharaNama,
    '',
    '',
  ]);
  wsData.push([
    '',
    `NIP. ${pejabat.kpaNip}`,
    '',
    '',
    `NIP. ${pejabat.pptkNip}`,
    '',
    '',
    `NIP. ${pejabat.bendaharaNip}`,
    '',
    '',
  ]);

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Atur lebar kolom agar proporsional dan mudah dibaca
  ws['!cols'] = [
    { wch: 6 },  // NO
    { wch: 36 }, // NAMA
    { wch: 25 }, // NIP / NIK
    { wch: 16 }, // JUMLAH
    { wch: 14 }, // PPh 15%
    { wch: 14 }, // PPh 5%
    { wch: 15 }, // PFK 1%
    { wch: 18 }, // PENERIMAAN
    { wch: 14 }, // TTD Ganjil
    { wch: 14 }, // TTD Genap
  ];

  // Merge cell untuk judul dan header tabel bertingkat
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }, // KWITANSI judul utama
    { s: { r: 6, c: 0 }, e: { r: 7, c: 0 } }, // NO
    { s: { r: 6, c: 1 }, e: { r: 7, c: 1 } }, // NAMA
    { s: { r: 6, c: 2 }, e: { r: 7, c: 2 } }, // NIP
    { s: { r: 6, c: 3 }, e: { r: 6, c: 3 } }, // JUMLAH (Rp.)
    { s: { r: 6, c: 4 }, e: { r: 6, c: 5 } }, // Header POTONGAN PPh Pasal 21 (gabung 15% & 5%)
    { s: { r: 6, c: 6 }, e: { r: 6, c: 6 } }, // PFK (1%)
    { s: { r: 6, c: 7 }, e: { r: 6, c: 7 } }, // PENERIMAAN
    { s: { r: 6, c: 8 }, e: { r: 6, c: 9 } }, // TANDA TANGAN (gabung 2 kolom ttd)
    { s: { r: summaryRowIndex, c: 0 }, e: { r: summaryRowIndex, c: 2 } }, // Label JUMLAH baris total
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Kwitansi_${setup.bulan}`);

  const finalName = filename || `Kwitansi_Jaspel_${pejabat.namaFaskes.replace(/\s+/g, '_')}_${setup.bulan}_${setup.tahun}.xlsx`;
  XLSX.writeFile(wb, finalName);
}
