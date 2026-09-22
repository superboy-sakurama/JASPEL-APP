/**
 * TypeScript Interfaces for Jaspel Zero Data Entry System
 */

export type EmployeeStatus = 'PNS' | 'PPPK' | 'Honorer';

export interface Employee {
  id: string;
  name: string;
  nip: string;
  tmt: string;
  status: EmployeeStatus;
  jenisAsn: string;
  pendidikan: string;
  jabatan: string;
  program1?: string;
  program2?: string;
  program3?: string;
  program4?: string;
  program5?: string;
  npwp: string;
  points: number; // Poin SK/Permenkes (bobot jabatan + pendidikan + masa kerja)
  attendance: number; // Jumlah kehadiran aktual bulan berjalan
  maxAttendance: number; // Hari kerja maksimal sebulan (default 22 hari)
  taxRate: number; // Tarif PPh 21 (misal 0.15 = 15%, 0.05 = 5%, 0 = 0%)
}

export interface KapitasiSetup {
  bulan: string;
  tahun: number;
  totalKapitasi: number;
  alokasiPersen: number; // Default 60%
  totalAlokasi: number; // totalKapitasi * (alokasiPersen / 100)
  maxAttendance: number; // Hari kerja standar sebulan (default 22)
  tanggalHitung: string;
}

export interface CalculatedEmployee extends Employee {
  individualPoints: number; // points * (attendance / maxAttendance)
  individualPointRatio: number; // individualPoints / totalPoints
  brutoRaw: number; // (individualPoints / totalPoints) * totalAlokasi
  brutoShadow: number; // (points / totalBasePoints) * totalAlokasi (untuk hitungan FPK)
  tax: number; // Math.floor(brutoRaw * taxRate)
  fpk1: number; // 1% FPK dari brutoShadow (hanya untuk PNS & PPPK)
  fpk4: number; // 4% FPK dari brutoShadow (hanya untuk PNS & PPPK)
  nettoInitial: number; // Math.floor(brutoRaw - tax - fpk1)
  remainder: number; // (brutoRaw - tax - fpk1) % 1
  gapBonus: number; // +1 jika menerima distribusi pembulatan Largest Remainder
  netto: number; // Netto final setelah penyeimbangan selisih desimal
  isBalancedBonus: boolean;
}

export interface CalculationResult {
  employees: CalculatedEmployee[];
  totalAlokasi: number;
  totalPoints: number; // Total poin aktual dengan bobot kehadiran
  totalBasePoints: number; // Total poin dasar tanpa absensi
  totalBruto: number;
  totalTax: number;
  totalFpk1: number;
  totalFpk4: number;
  totalNetto: number;
  initialTotalDisbursed: number;
  gap: number;
  distributedGap: number;
  isBalanced: boolean;
}

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  isConfigured: boolean;
  clientEmail?: string;
  authMethod: 'env_json' | 'env_keys' | 'base64' | 'not_set';
  sheetsFound?: string[];
  lastSync?: string;
}

export interface AttendanceImportRow {
  nip: string;
  name: string;
  attendance: number;
  bulan?: string;
  tahun?: number;
}
