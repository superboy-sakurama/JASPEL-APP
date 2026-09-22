import { Employee, CalculatedEmployee, KapitasiSetup } from '../types/jaspel';

/**
 * Format mata uang Rupiah Indonesia (Contoh: Rp 4.520.000)
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

/**
 * Format angka desimal Indonesia
 */
export function formatNumber(num: number, maxDecimals: number = 2): string {
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: maxDecimals,
    minimumFractionDigits: 0,
  }).format(num);
}

/**
 * Format persentase
 */
export function formatPercent(ratio: number): string {
  if (isNaN(ratio)) return '0%';
  return `${(ratio * 100).toFixed(1)}%`;
}

/**
 * Parse CSV text dengan auto-detection delimiter (koma, titik koma, tab)
 * Mendukung field dengan quote ganda (")
 */
export function parseCSV(text: string): string[][] {
  const lines = text.trim().split(/\r\n|\n|\r/);
  if (lines.length === 0) return [];

  // Deteksi delimiter dari baris header pertama
  const firstLine = lines[0];
  let delimiter = ',';
  if ((firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length) {
    delimiter = ';';
  } else if ((firstLine.match(/\t/g) || []).length > (firstLine.match(/,/g) || []).length) {
    delimiter = '\t';
  }

  const result: string[][] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    const row: string[] = [];
    let insideQuote = false;
    let currentCell = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (insideQuote && line[i + 1] === '"') {
          currentCell += '"';
          i++; // Skip escaped quote
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === delimiter && !insideQuote) {
        row.push(currentCell.trim());
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    row.push(currentCell.trim());
    result.push(row);
  }

  return result;
}

/**
 * Download data array sebagai file CSV
 */
export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map(row =>
      row
        .map(cell => {
          const str = String(cell ?? '');
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(',')
    ),
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate contoh file CSV absensi untuk template download
 */
export function generateSampleAttendanceCSV(employees: Employee[], bulan: string, tahun: number): string {
  const headers = ['Bulan', 'Tahun', 'NIP', 'Nama', 'Jumlah_Kehadiran'];
  const rows = employees.map(emp => [
    bulan,
    tahun,
    emp.nip,
    emp.name,
    emp.attendance || 22,
  ]);

  return [
    headers.join(','),
    ...rows.map(r => r.map(c => `"${c}"`).join(',')),
  ].join('\r\n');
}
