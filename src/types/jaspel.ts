/**
 * TypeScript Interfaces for Jaspel Zero Data Entry System
 */

export type EmployeeStatus = 'PNS' | 'PPPK' | 'Honorer';
export type PendidikanLevel = 'SD' | 'SMP' | 'SMA' | 'D3' | 'D4/S1' | 'Profesi';
export type KinerjaRating = 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang' | 'Sangat Kurang';

export interface Employee {
  id: string;
  name: string;
  nip: string; // NIP atau NIK
  tmt: string; // Tanggal Mulai Tugas (YYYY-MM-DD)
  status: EmployeeStatus; // PNS, PPPK, Honorer
  jenisAsn?: string;
  pendidikan: string; // e.g. "S1", "D4", "D3", "Profesi Ners", dll.
  pendidikanStandard?: PendidikanLevel;
  jabatan: string; // e.g. "Dokter Umum", "Perawat", "Bidan", dll.
  tugasAdmin?: string; // e.g. "Kapus", "KTU", "PPTK", "Bendahara Pengeluaran", "-"
  poinRangkapTugasCustom?: number;

  // 7. Tugas Administrasi Tambahan (Kelompok 7)
  tugasTambahan?: string; // e.g. "Tim Akreditasi Puskesmas", "Tim BOK", dll.
  poinTugasTambahanCustom?: number;

  // Tanggung Jawab Program (Detail pemegang program)
  pjProgramName?: string;
  pjProgramPoin?: number;
  program1?: string;
  program1Poin?: number;
  program2?: string;
  program2Poin?: number;
  program3?: string;
  program3Poin?: number;
  program4?: string;
  program4Poin?: number;
  program5?: string;
  program5Poin?: number;

  // Kinerja
  kinerjaUraian?: KinerjaRating;
  kinerjaNilai?: number; // e.g. 97.5

  npwp?: string;
  golongan?: string; // e.g. "IV/a", "III/d", etc.
  points: number; // Poin SK / Permenkes (atau hasil hitung otomatis)
  poinBpjs?: number; // Poin tanpa kehadiran (untuk PFK BPJS)
  prosentaseMasaKerja?: number; // % masa kerja terhitung (Honorer)
  attendance: number; // Jumlah kehadiran aktual bulan berjalan
  maxAttendance: number; // Hari kerja maksimal sebulan (default 24 hari sesuai Excel)
  taxRate: number; // Tarif PPh 21 (0.15 = 15%, 0.05 = 5%, 0 = 0%)
}

export interface KapitasiSetup {
  bulan: string;
  tahun: number;
  totalKapitasi: number;
  alokasiPersen: number; // Default 60%
  totalAlokasi: number; // totalKapitasi * (alokasiPersen / 100)
  maxAttendance: number; // Hari kerja standar sebulan (default 24)
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
  pfkBpjs?: number;
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
  sheetTitle?: string;
  clientEmail?: string;
  authMethod: 'env_json' | 'env_keys' | 'base64' | 'not_set';
  sheetsFound?: string[];
  lastSync?: string;
}

export interface AttendanceImportRow {
  nip: string;
  name: string;
  attendance: number;
  kinerjaUraian?: string;
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

export interface CustomPoinItem {
  id: string;
  nama: string;
  poin: number;
  keterangan?: string;
}

// 1c. Data Poin Jaspel (Sesuai Sheet POIN DASAR Excel AJP)
export interface PoinJaspelConfig {
  // 1. Jenis Ketenagaan Berdasarkan Ijazah
  ijazahDokter: number;
  ijazahDokterGigi: number;
  ijazahNersSstBd: number;
  ijazahApoteker: number;
  ijazahS1KesDiv: number;
  ijazahS1NonKes: number;
  ijazahD3Kes: number;
  ijazahD3NonKes: number;
  ijazahAsistenKes: number;
  ijazahDibawahD3NonKes: number;

  // 2. Rangkap Tugas Administrasi
  tugasKapus: number;
  tugasKtuBesertaTim: number;
  tugasPptk: number;
  tugasBendaharaPengeluaran: number;
  tugasBendaharaPenerimaanKasir: number;
  tugasAkuntansi: number;
  tugasPengurusBarang: number;
  tugasPphp: number;
  tugasTimJkn: number;
  tugasTimBokJampersal: number;
  tugasRjgRig: number;
  tugasTimPokja: number;
  tugasPjPustuPolindes: number;
  tugasTimMutu: number;
  tugasTimSpi: number;
  // Tugas Administrasi Tambahan (Fitur Tambah Poin Tugas)
  customTugasList?: CustomPoinItem[];

  // 3. Program dan Pelayanan
  progPromkes: number;
  progKesling: number;
  progKia: number;
  progKb: number;
  progGizi: number;
  progUks: number;
  progDiare: number;
  progIspa: number;
  progKusta: number;
  progTb: number;
  progDbd: number;
  progHivPms: number;
  progMalariaRabies: number;
  progHepatitis: number;
  progImunisasi: number;
  progTimProlanis: number;
  progSurveilance: number;
  progPtm: number;
  progPerkesmasPisPk: number;
  progKeswa: number;
  progGilut: number;
  progHatra: number;
  progKesorga: number;
  progIndra: number;
  progKesKerja: number;
  progPoliUmum?: number; // Poin Poli Umum (Default: 10)
  progUgd?: number; // Poin UGD (Default: 15 / 10)
  progRawatInap?: number; // Poin Pelayanan Rawat Inap (Default: 10)
  // Program Tambahan Baru (Fitur Tambah Poin Program)
  customProgramList?: CustomPoinItem[];
  poinPjProgramStandar?: number;
  poinProg1Standar?: number;
  poinProg2Standar?: number;
  poinProg3Standar?: number;
  poinProg4Standar?: number;
  poinProg5Standar?: number;

  // 4. Status Kepegawaian
  statusAsn: number;
  statusNonAsn: number;
  statusPns?: number;
  statusPppk?: number;
  statusHonorer?: number;

  // 5. Variabel Kinerja
  kinerjaSangatBaik: number;
  kinerjaBaik: number;
  kinerjaCukup: number;
  kinerjaKurang: number;
  kinerjaSangatKurang: number;

  // 7. Tugas Administrasi Tambahan (Bisa diaktifkan/dinonaktifkan secara keseluruhan)
  tugasTambahanEnabled: boolean; // Master toggle: Aktif / Nonaktif
  customTugasTambahanList?: CustomPoinItem[]; // Daftar tugas tambahan kelompok 7

  // Pengaturan Terkait Pembagian Nilai Poin Bersama (Shared Points)
  enableSharedPointDivision?: boolean; // Default true: jika poin dipakai bersama, dibagi rata sebanyak pemakai
  ugdDokterPercent?: number; // Default 50%: 50% untuk dokter
  ugdPetugasPercent?: number; // Default 50%: 50% untuk petugas lain (perawat, analis, bidan)
}

// 1d. Prosentase Masa Kerja (Honorer / Non-ASN)
export interface MasaKerjaRule {
  id: string;
  minBulan: number;
  maxBulan: number;
  label: string;
  persentase: number;
}

// 2. Hitung Poin Row (Exact match to Excel AJP Screenshot columns)
export interface HitungPoinRow {
  id: string;
  no: number;
  nama: string;
  pendidikan: string;
  tmt: string;

  // JML Masa Kerja
  masaKerjaTh: number;
  masaKerjaBln: number;
  masaKerjaHari: number;

  // Variabel Kehadiran
  presensi: number;
  hariKerja: number;
  prosentaseKehadiran: number;

  // Variabel Nilai
  poinKetenagaan: number;
  poinMasaKerja: number;
  poinRangkapTugas: number;

  // 7. Tugas Administrasi Tambahan (Kelompok 7)
  poinTugasTambahan: number;
  namaTugasTambahan?: string;
  isTugasTambahanActive: boolean;

  // Tanggung Jawab Program (Detail pemegang program)
  poinPjProg: number;
  namaPjProg?: string;
  poinProg1: number;
  namaProg1?: string;
  poinProg2: number;
  namaProg2?: string;
  poinProg3: number;
  namaProg3?: string;
  poinProg4?: number;
  namaProg4?: string;
  poinProg5?: number;
  namaProg5?: string;
  poinProgTambahanTotal: number;
  totalProgram: number;

  // Status Kepegawaian
  statusKepegawaian: EmployeeStatus;
  statusNilai: number;

  // Total Point
  totalPoint: number;

  // Poin Kehadiran = (Prosentase kehadiran x JML Poin) / 100
  poinKehadiran: number;

  // Variabel Kinerja
  kinerjaUraian: string;
  kinerjaNilai: number;

  // Poin Kinerja = (Poin Kehadiran x Nilai Kinerja) / 100
  poinKinerja: number;

  // Variabel Masa Kerja (NON ASN)
  masaKerjaBulan: number;
  prosentaseMasaKerja: number;

  // Exit Poin (Poin Final) = Poin Kinerja x (Prosentase Masa Kerja / 100)
  exitPoin: number;

  // Jasa Pelayanan (Rp.)
  jasaPelayanan: number;

  // Perhitungan PFK BPJS
  totalPoinTanpaKehadiran: number; // TOTAL POINT x (Nilai Kinerja / 100) x (Prosentase Masa Kerja / 100)
  pfkBpjs: number; // (totalPoinTanpaKehadiran / totalBasePoin) x totalAlokasi

  // Rincian Pembagian Poin Bersama
  sharedPointBreakdown?: {
    roleName: string;
    groupType: 'program' | 'tugasAdmin' | 'tugasTambahan';
    originalPoint: number;
    finalPoint: number;
    userCount: number;
    isUgd?: boolean;
    ugdRole?: 'dokter' | 'petugas';
    note?: string;
  }[];
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

  // Fitur Keamanan Penguncian Data History Bulan Sebelumnya
  isLocked: boolean; // Jika true, data bulan ini dibekukan dan kebal dari perubahan master data/poin
  lockedAt?: string;
  lockedBy?: string;
  lockNote?: string;
  employeesSnapshot?: Employee[]; // Snapshot lengkap data pegawai saat periode dikunci
  poinConfigSnapshot?: PoinJaspelConfig; // Snapshot matriks poin saat periode dikunci
  masaKerjaRulesSnapshot?: MasaKerjaRule[]; // Snapshot aturan masa kerja saat periode dikunci
}
