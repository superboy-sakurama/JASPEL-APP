import {
  Employee,
  PoinJaspelConfig,
  MasaKerjaRule,
  HitungPoinRow,
  EmployeeStatus
} from '../types/jaspel';

/**
 * Default Konfigurasi Poin Jaspel berdasarkan Permenkes & Regulasi Kesehatan
 */
export const DEFAULT_POIN_JASPEL: PoinJaspelConfig = {
  // 1. Status Kepegawaian
  statusPns: 10,
  statusPppk: 8,
  statusHonorer: 5,

  // 2. Jenis Ketenagaan
  tenagaDokterUmum: 50,
  tenagaDokterGigi: 45,
  tenagaPerawat: 25,
  tenagaBidan: 25,
  tenagaApoteker: 30,
  tenagaAsistenApoteker: 15,
  tenagaPranataLab: 20,
  tenagaAdminUmum: 10,

  // 3. Jenis Pendidikan
  pendidikanSd: 5,
  pendidikanSmp: 7,
  pendidikanSma: 10,
  pendidikanD3: 15,
  pendidikanD4S1: 20,
  pendidikanProfesi: 25,

  // 4. Tugas Administrasi Tambahan
  tugasKepalaPuskesmas: 30,
  tugasKaSubbagTu: 20,
  tugasBendahara: 15,
  tugasPptk: 15,
  tugasPjPokja: 10,
  tugasLainnya: 5,

  // 5. PJ Program (Per Program)
  pjProgram1: 5,
  pjProgram2: 5,
  pjProgram3: 5,
  pjProgram4: 5,
  pjProgram5: 5,
};

/**
 * Default Aturan Prosentase Masa Kerja Honorer (Non ASN)
 */
export const DEFAULT_MASA_KERJA_RULES: MasaKerjaRule[] = [
  {
    id: 'mk-1',
    minBulan: 0,
    maxBulan: 6,
    label: '0 s/d 6 Bulan',
    persentase: 25,
  },
  {
    id: 'mk-2',
    minBulan: 7,
    maxBulan: 12,
    label: '> 6 Bulan s/d 1 Tahun',
    persentase: 50,
  },
  {
    id: 'mk-3',
    minBulan: 13,
    maxBulan: 24,
    label: '> 1 Tahun s/d 2 Tahun',
    persentase: 75,
  },
  {
    id: 'mk-4',
    minBulan: 25,
    maxBulan: 36,
    label: '> 2 Tahun s/d 3 Tahun',
    persentase: 90,
  },
  {
    id: 'mk-5',
    minBulan: 37,
    maxBulan: 99999,
    label: '> 3 Tahun Ke Atas',
    persentase: 100,
  },
];

/**
 * Hitung jumlah tahun dan bulan masa kerja dari TMT hingga tanggal referensi
 */
export function calculateMasaKerja(
  tmt: string,
  referenceDateStr?: string
): { years: number; months: number; totalMonths: number } {
  if (!tmt) return { years: 0, months: 0, totalMonths: 0 };
  const startDate = new Date(tmt);
  if (isNaN(startDate.getTime())) return { years: 0, months: 0, totalMonths: 0 };

  const refDate = referenceDateStr ? new Date(referenceDateStr) : new Date();
  if (refDate < startDate) return { years: 0, months: 0, totalMonths: 0 };

  let years = refDate.getFullYear() - startDate.getFullYear();
  let months = refDate.getMonth() - startDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  const totalMonths = Math.max(0, years * 12 + months);
  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    totalMonths,
  };
}

/**
 * Cari prosentase masa kerja berdasarkan aturan
 * PNS & PPPK selalu 100%
 * Honorer mengikuti tabel berjenjang
 */
export function getProsentaseMasaKerja(
  status: EmployeeStatus,
  totalMonths: number,
  rules: MasaKerjaRule[]
): number {
  if (status === 'PNS' || status === 'PPPK') {
    return 100;
  }

  // Sort rules ascending by minBulan
  const sortedRules = [...rules].sort((a, b) => a.minBulan - b.minBulan);
  for (const rule of sortedRules) {
    if (totalMonths >= rule.minBulan && totalMonths <= rule.maxBulan) {
      return rule.persentase;
    }
  }

  // Fallback jika di luar batas atas
  const lastRule = sortedRules[sortedRules.length - 1];
  return lastRule ? lastRule.persentase : 100;
}

/**
 * Deteksi skor poin pendidikan dari string pendidikan
 */
export function getPoinPendidikan(pendidikanStr: string = '', config: PoinJaspelConfig): number {
  const p = pendidikanStr.toLowerCase();
  if (p.includes('profesi') || p.includes('spesialis') || p.includes('s2') || p.includes('dokter')) {
    return config.pendidikanProfesi;
  }
  if (p.includes('d4') || p.includes('s1') || p.includes('sarjana')) {
    return config.pendidikanD4S1;
  }
  if (p.includes('d3') || p.includes('diploma') || p.includes('amd')) {
    return config.pendidikanD3;
  }
  if (p.includes('sma') || p.includes('smk') || p.includes('slta') || p.includes('aliyah')) {
    return config.pendidikanSma;
  }
  if (p.includes('smp') || p.includes('sltp') || p.includes('mts')) {
    return config.pendidikanSmp;
  }
  if (p.includes('sd') || p.includes('mi')) {
    return config.pendidikanSd;
  }
  return config.pendidikanD4S1; // Default
}

/**
 * Deteksi skor poin status kepegawaian
 */
export function getPoinStatus(status: EmployeeStatus, config: PoinJaspelConfig): number {
  switch (status) {
    case 'PNS':
      return config.statusPns;
    case 'PPPK':
      return config.statusPppk;
    case 'Honorer':
      return config.statusHonorer;
    default:
      return 5;
  }
}

/**
 * Deteksi skor poin ketenagaan
 */
export function getPoinKetenagaan(jabatanStr: string = '', config: PoinJaspelConfig): number {
  const j = jabatanStr.toLowerCase();
  if (j.includes('dokter gigi')) return config.tenagaDokterGigi;
  if (j.includes('dokter')) return config.tenagaDokterUmum;
  if (j.includes('apoteker') && !j.includes('asisten')) return config.tenagaApoteker;
  if (j.includes('asisten apoteker') || j.includes('farmasi')) return config.tenagaAsistenApoteker;
  if (j.includes('bidan')) return config.tenagaBidan;
  if (j.includes('perawat') || j.includes('ners')) return config.tenagaPerawat;
  if (j.includes('lab') || j.includes('sanitarian') || j.includes('gizi') || j.includes('pranata')) {
    return config.tenagaPranataLab;
  }
  return config.tenagaAdminUmum;
}

/**
 * Deteksi skor poin tugas administrasi tambahan
 */
export function getPoinTugasAdmin(tugasStr: string = '', config: PoinJaspelConfig): number {
  if (!tugasStr || tugasStr === '-' || tugasStr === 'Tidak Ada') return 0;
  const t = tugasStr.toLowerCase();
  if (t.includes('kepala puskesmas') || t.includes('plt. kepala') || t.includes('kpa')) {
    return config.tugasKepalaPuskesmas;
  }
  if (t.includes('subbag tu') || t.includes('tata usaha') || t.includes('ka tu')) {
    return config.tugasKaSubbagTu;
  }
  if (t.includes('bendahara')) {
    return config.tugasBendahara;
  }
  if (t.includes('pptk')) {
    return config.tugasPptk;
  }
  if (t.includes('pokja') || t.includes('pj ukm') || t.includes('pj ukp') || t.includes('koordinator')) {
    return config.tugasPjPokja;
  }
  return config.tugasLainnya;
}

/**
 * Evaluasi 1 Baris Hitung Poin Lengkap
 */
export function evaluateHitungPoinRow(
  emp: Employee,
  index: number,
  config: PoinJaspelConfig,
  masaKerjaRules: MasaKerjaRule[],
  referenceDateStr?: string
): HitungPoinRow {
  const masaKerja = calculateMasaKerja(emp.tmt, referenceDateStr);
  const prosentaseMasaKerja = getProsentaseMasaKerja(emp.status, masaKerja.totalMonths, masaKerjaRules);

  const poinStatus = getPoinStatus(emp.status, config);
  const poinKetenagaan = getPoinKetenagaan(emp.jabatan, config);
  const poinPendidikan = getPoinPendidikan(emp.pendidikan, config);
  const poinTugasAdmin = getPoinTugasAdmin(emp.tugasAdmin, config);

  // PJ Program poin
  let poinProgram = 0;
  if (emp.program1 && emp.program1.trim() && emp.program1 !== '-') poinProgram += config.pjProgram1;
  if (emp.program2 && emp.program2.trim() && emp.program2 !== '-') poinProgram += config.pjProgram2;
  if (emp.program3 && emp.program3.trim() && emp.program3 !== '-') poinProgram += config.pjProgram3;
  if (emp.program4 && emp.program4.trim() && emp.program4 !== '-') poinProgram += config.pjProgram4;
  if (emp.program5 && emp.program5.trim() && emp.program5 !== '-') poinProgram += config.pjProgram5;

  const poinSubtotal = poinStatus + poinKetenagaan + poinPendidikan + poinTugasAdmin + poinProgram;

  // Poin tanpa kehadiran (PFK BPJS) = Subtotal * (% Masa Kerja / 100)
  const poinPfkBpjs = Math.round((poinSubtotal * (prosentaseMasaKerja / 100)) * 100) / 100;

  // Kehadiran
  const kehadiran = emp.attendance ?? 22;
  const maxKehadiran = emp.maxAttendance || 22;
  const rasioKehadiran = maxKehadiran > 0 ? Math.min(1, Math.max(0, kehadiran / maxKehadiran)) : 1;

  // Poin Akhir Tertimbang Kehadiran
  const poinAkhir = Math.round((poinPfkBpjs * rasioKehadiran) * 100) / 100;

  return {
    id: emp.id,
    no: index + 1,
    nama: emp.name,
    nip: emp.nip || '-',
    pendidikan: emp.pendidikan || '-',
    status: emp.status,
    jabatan: emp.jabatan || '-',
    tugasAdmin: emp.tugasAdmin || '-',
    program1: emp.program1,
    program2: emp.program2,
    program3: emp.program3,
    program4: emp.program4,
    program5: emp.program5,
    tmt: emp.tmt || '2020-01-01',
    lamaKerjaThn: masaKerja.years,
    lamaKerjaBln: masaKerja.months,
    prosentaseMasaKerja,
    poinStatus,
    poinKetenagaan,
    poinPendidikan,
    poinTugasAdmin,
    poinProgram,
    poinSubtotal,
    poinPfkBpjs,
    kehadiran,
    maxKehadiran,
    rasioKehadiran,
    poinAkhir,
  };
}
