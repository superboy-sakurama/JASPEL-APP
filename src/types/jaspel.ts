/**
 * TypeScript Interfaces for Jaspel Zero Data Entry System
 */

export type EmployeeStatus = 'PNS' | 'PPPK' | 'Honorer';
export type PendidikanLevel = 'SD' | 'SMP' | 'SMA' | 'D3' | 'D4/S1' | 'Profesi';

export interface Employee {
  id: string;
  name: string;
  nip: string; // NIP atau NIK
  tmt: string; // Tanggal Mulai Tugas (YYYY-MM-DD)
  status: EmployeeStatus; // PNS, PPPK, Honorer
  jenisAsn?: string;
  pendidikan: string; // e.g. "Profesi Ners", "D3 Kebidanan", "D4/S1", "SD", etc.
  pendidikanStandard?: PendidikanLevel;
  jabatan: string; // e.g. "Dokter Umum", "Perawat", "Bidan", dll.
  tugasAdmin?: string; // Tugas administrasi / jabatan tambahan (e.g. "Kepala Puskesmas", "Bendahara", "PPTK", "-")
  program1?: string;
  program2?: string;
  program3?: string;
  program4?: string;
  program5?: string;
  npwp?: string;
  points: number; // Poin SK / Permenkes (atau hasil hitung otomatis)
  poinBpjs?: number; // Poin tanpa kehadiran (untuk PFK BPJS)
  prosentaseMasaKerja?: number; // % masa kerja terhitung (Honorer)
  attendance: number; // Jumlah kehadiran aktual bulan berjalan
  maxAttendance: number; // Hari kerja maksimal sebulan (default 22 hari)
  taxRate: number; // Tarif PPh 21 (0.15 = 15%, 0.05 = 5%, 0 = 0%)
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

// 1a. Data Instansi & Pejabat
export interface InstansiConfig {
  namaInstansi: string;
  kodeInstansi: string;
  kodeRekeningBelanja: string;
  nomorDpa: string;
  // Pejabat
  namaKepala: string;
  nipKepala: string;
  jabatanKepala: string;
  namaPejabatKeuangan: string;
  nipPejabatKeuangan: string;
  jabatanPejabatKeuangan: string;
  namaBendahara: string;
  nipBendahara: string;
  jabatanBendahara: string;
  namaPptk: string;
  nipPptk: string;
  jabatanPptk: string;
  tanggalLunas: string;
}

export interface KwitansiPejabat {
  namaFaskes: string;
  kpaTitle: string;
  kpaNama: string;
  kpaNip: string;
  kpaJabatan: string;
  pptkNama: string;
  pptkNip: string;
  pptkJabatan: string;
  bendaharaNama: string;
  bendaharaNip: string;
  bendaharaJabatan: string;
  lunasTgl: string;
  // Extended fields
  kodeInstansi?: string;
  kodeRekeningBelanja?: string;
  nomorDpa?: string;
  namaPejabatKeuangan?: string;
  nipPejabatKeuangan?: string;
  jabatanPejabatKeuangan?: string;
}

// 1c. Data Poin Jaspel (Matriks Penilaian)
export interface PoinJaspelConfig {
  // 1. Status Kepegawaian
  statusPns: number;
  statusPppk: number;
  statusHonorer: number;

  // 2. Jenis Ketenagaan
  tenagaDokterUmum: number;
  tenagaDokterGigi: number;
  tenagaPerawat: number;
  tenagaBidan: number;
  tenagaApoteker: number;
  tenagaAsistenApoteker: number;
  tenagaPranataLab: number;
  tenagaAdminUmum: number;

  // 3. Jenis Pendidikan
  pendidikanSd: number;
  pendidikanSmp: number;
  pendidikanSma: number;
  pendidikanD3: number;
  pendidikanD4S1: number;
  pendidikanProfesi: number;

  // 4. Tugas Administrasi Tambahan
  tugasKepalaPuskesmas: number;
  tugasKaSubbagTu: number;
  tugasBendahara: number;
  tugasPptk: number;
  tugasPjPokja: number;
  tugasLainnya: number;

  // 5. PJ Program
  pjProgram1: number;
  pjProgram2: number;
  pjProgram3: number;
  pjProgram4: number;
  pjProgram5: number;
}

// 1d. Prosentase Masa Kerja (Honorer / Non-ASN)
export interface MasaKerjaRule {
  id: string;
  minBulan: number;
  maxBulan: number; // e.g. 6, 12, 24, 36, or 99999 for > 36 bulan
  label: string;
  persentase: number; // 25, 50, 75, 90, 100
}

// 2. Hitung Poin Aspect Row
export interface HitungPoinRow {
  id: string;
  no: number;
  nama: string;
  nip: string;
  pendidikan: string;
  status: EmployeeStatus;
  jabatan: string;
  tugasAdmin: string;
  program1?: string;
  program2?: string;
  program3?: string;
  program4?: string;
  program5?: string;
  tmt: string;
  lamaKerjaThn: number;
  lamaKerjaBln: number;
  prosentaseMasaKerja: number;
  // Detail Poin
  poinStatus: number;
  poinKetenagaan: number;
  poinPendidikan: number;
  poinTugasAdmin: number;
  poinProgram: number;
  poinSubtotal: number;
  // Poin tanpa kehadiran (PFK BPJS)
  poinPfkBpjs: number;
  // Kehadiran
  kehadiran: number;
  maxKehadiran: number;
  rasioKehadiran: number;
  // Poin Akhir Tertimbang
  poinAkhir: number;
}

export interface JaspelHistoryRecord {
  id: string; // e.g. "2026-08"
  bulan: string;
  tahun: number;
  totalKapitasi: number;
  alokasiPersen: number;
  totalAlokasi: number;
  tanggalHitung: string;
  maxAttendance: number;
  totalPenerima: number;
  totalBruto: number;
  totalTax: number;
  totalTax15: number;
  totalTax5: number;
  totalFpk1: number;
  totalFpk4: number;
  totalNetto: number;
  calculation: CalculationResult;
  pejabat?: KwitansiPejabat;
  savedAt: string;
}
