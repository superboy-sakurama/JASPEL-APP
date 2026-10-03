import {
  Employee,
  PoinJaspelConfig,
  MasaKerjaRule,
  HitungPoinRow,
  EmployeeStatus,
  CustomPoinItem
} from '../types/jaspel';

/**
 * Daftar Baku Tugas Administrasi Tambahan (Kelompok 7)
 */
export const DEFAULT_TUGAS_TAMBAHAN_LIST: CustomPoinItem[] = [
  { id: 'tt-1', nama: 'Tim Pengelola BOK Puskesmas', poin: 10, keterangan: 'Pengelolaan anggaran & SPJ program BOK' },
  { id: 'tt-2', nama: 'Tim Akreditasi Puskesmas', poin: 15, keterangan: 'Persiapan & pemenuhan instrumen survei akreditasi' },
  { id: 'tt-3', nama: 'Tim Penanganan Pengaduan / Keluhan', poin: 5, keterangan: 'Tindak lanjut dan respon kotak saran & komplain' },
  { id: 'tt-4', nama: 'Tim Audit Internal (AI)', poin: 7.5, keterangan: 'Audit berkala kepatuhan SOP mutu puskesmas' },
  { id: 'tt-5', nama: 'Tim Keselamatan Pasien (KP)', poin: 7.5, keterangan: 'Manajemen risiko dan pelaporan IKP' },
  { id: 'tt-6', nama: 'Tim PPI (Pencegahan & Pengendalian Infeksi)', poin: 7.5, keterangan: 'Penerapan standar kewaspadaan isolasi & APD' },
  { id: 'tt-7', nama: 'Tim K3 Puskesmas', poin: 5, keterangan: 'Keselamatan & kesehatan lingkungan kerja' },
  { id: 'tt-8', nama: 'Tim Sistem Informasi Puskesmas (SIP)', poin: 5, keterangan: 'Pengelolaan data bridging & pelaporan digital' },
];

/**
 * Default Konfigurasi Poin Jaspel Persis Sesuai Sheet POIN DASAR Excel AJP
 */
export const DEFAULT_POIN_JASPEL: PoinJaspelConfig = {
  // 1. Jenis Ketenagaan Berdasarkan Ijazah
  ijazahDokter: 175,
  ijazahDokterGigi: 185,
  ijazahNersSstBd: 100,
  ijazahApoteker: 100,
  ijazahS1KesDiv: 90,
  ijazahS1NonKes: 70,
  ijazahD3Kes: 70,
  ijazahD3NonKes: 60,
  ijazahAsistenKes: 50,
  ijazahDibawahD3NonKes: 40,

  // 2. Rangkap Tugas Administrasi
  tugasKapus: 175,
  tugasKtuBesertaTim: 30,
  tugasPptk: 30,
  tugasBendaharaPengeluaran: 30,
  tugasBendaharaPenerimaanKasir: 20,
  tugasAkuntansi: 20,
  tugasPengurusBarang: 20,
  tugasPphp: 5,
  tugasTimJkn: 40,
  tugasTimBokJampersal: 40,
  tugasRjgRig: 20,
  tugasTimPokja: 15,
  tugasPjPustuPolindes: 2.5,
  tugasTimMutu: 15,
  tugasTimSpi: 15,

  // 3. Program dan Pelayanan
  progPromkes: 10,
  progKesling: 10,
  progKia: 10,
  progKb: 5,
  progGizi: 10,
  progUks: 2.5,
  progDiare: 2,
  progIspa: 2,
  progKusta: 2.5,
  progTb: 7.5,
  progDbd: 2.5,
  progHivPms: 5,
  progMalariaRabies: 5,
  progHepatitis: 2,
  progImunisasi: 7.5,
  progTimProlanis: 5,
  progSurveilance: 5,
  progPtm: 5,
  progPerkesmasPisPk: 5,
  progKeswa: 5,
  progGilut: 5,
  progHatra: 2.5,
  progKesorga: 2,
  progIndra: 2,
  progKesKerja: 2,
  progPoliUmum: 10, // Nilai default Poli Umum (10 Poin)
  progUgd: 15, // Nilai default UGD (50% dokter, 50% petugas lain)
  progRawatInap: 10,
  poinPjProgramStandar: 5,
  poinProg1Standar: 5,
  poinProg2Standar: 3,
  poinProg3Standar: 2.5,
  poinProg4Standar: 2,
  poinProg5Standar: 2,

  // 4. Status Kepegawaian
  statusAsn: 20,
  statusNonAsn: 5,
  statusPns: 20,
  statusPppk: 20,
  statusHonorer: 5,

  // 5. Variabel Kinerja
  kinerjaSangatBaik: 100,
  kinerjaBaik: 97.5,
  kinerjaCukup: 95,
  kinerjaKurang: 92.5,
  kinerjaSangatKurang: 90,

  // 7. Tugas Administrasi Tambahan
  tugasTambahanEnabled: true,
  customTugasTambahanList: DEFAULT_TUGAS_TAMBAHAN_LIST,

  // Pengaturan Terkait Pembagian Nilai Poin Bersama
  enableSharedPointDivision: true,
  ugdDokterPercent: 50,
  ugdPetugasPercent: 50,
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
 * Hitung jumlah tahun, bulan, dan hari masa kerja dari TMT hingga tanggal referensi
 */
export function calculateMasaKerjaDetail(
  tmt: string,
  referenceDateStr?: string
): { years: number; months: number; days: number; totalMonths: number } {
  if (!tmt) return { years: 0, months: 0, days: 0, totalMonths: 0 };
  const startDate = new Date(tmt);
  if (isNaN(startDate.getTime())) return { years: 0, months: 0, days: 0, totalMonths: 0 };

  const refDate = referenceDateStr ? new Date(referenceDateStr) : new Date();
  if (refDate < startDate) return { years: 0, months: 0, days: 0, totalMonths: 0 };

  let years = refDate.getFullYear() - startDate.getFullYear();
  let months = refDate.getMonth() - startDate.getMonth();
  let days = refDate.getDate() - startDate.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(refDate.getFullYear(), refDate.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const totalMonths = Math.max(0, years * 12 + months);
  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
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

  const sortedRules = [...rules].sort((a, b) => a.minBulan - b.minBulan);
  for (const rule of sortedRules) {
    if (totalMonths >= rule.minBulan && totalMonths <= rule.maxBulan) {
      return rule.persentase;
    }
  }

  const lastRule = sortedRules[sortedRules.length - 1];
  return lastRule ? lastRule.persentase : 100;
}

/**
 * Deteksi skor poin ijazah / ketenagaan dari data pegawai
 */
export function getPoinIjazah(emp: Employee, config: PoinJaspelConfig): number {
  const p = (emp.pendidikan || '').toLowerCase();
  const j = (emp.jabatan || '').toLowerCase();

  if (j.includes('dokter gigi')) return config.ijazahDokterGigi;
  if (j.includes('dokter') || p.includes('dokter')) return config.ijazahDokter;
  if (j.includes('ners') || p.includes('ners') || p.includes('s.st') || p.includes('sst') || (j.includes('bidan') && (p.includes('d4') || p.includes('s1')))) {
    return config.ijazahNersSstBd;
  }
  if (j.includes('apoteker') && !j.includes('asisten')) return config.ijazahApoteker;
  if ((p.includes('s1') || p.includes('d4')) && (j.includes('kes') || j.includes('perawat') || j.includes('bidan') || j.includes('gizi') || j.includes('sanitasi'))) {
    return config.ijazahS1KesDiv;
  }
  if (p.includes('s1') || p.includes('d4')) return config.ijazahS1NonKes;
  if (p.includes('d3') && (j.includes('kes') || j.includes('bidan') || j.includes('perawat') || j.includes('farmasi') || j.includes('lab'))) {
    return config.ijazahD3Kes;
  }
  if (p.includes('d3')) return config.ijazahD3NonKes;
  if (p.includes('asisten') || j.includes('asisten')) return config.ijazahAsistenKes;
  return config.ijazahDibawahD3NonKes;
}

/**
 * Poin masa kerja = jumlah tahun masa kerja, maks 25 (sesuai data Excel AJP)
 */
export function getPoinMasaKerja(years: number): number {
  return Math.min(Math.max(0, years), 25);
}

/**
 * Deteksi skor poin pemegang program kesehatan berdasarkan nama program atau custom point
 */
export function resolveProgramPoints(
  programName?: string,
  customPoin?: number,
  config?: PoinJaspelConfig,
  fallbackSlotPoints?: number
): number {
  if (customPoin !== undefined && customPoin !== null && !isNaN(customPoin) && customPoin > 0) {
    return customPoin;
  }
  if (!programName || programName === '-' || programName.trim() === '') {
    return 0;
  }

  const p = programName.toLowerCase().trim();
  const cfg = config || DEFAULT_POIN_JASPEL;

  // Cek pada daftar Program Tambahan Baru (customProgramList)
  if (cfg.customProgramList && cfg.customProgramList.length > 0) {
    const customMatch = cfg.customProgramList.find((item) => {
      const itemNama = item.nama.toLowerCase().trim();
      return itemNama === p || p.includes(itemNama) || itemNama.includes(p);
    });
    if (customMatch && customMatch.poin > 0) {
      return customMatch.poin;
    }
  }

  if (p.includes('promkes')) return cfg.progPromkes;
  if (p.includes('kesling') || p.includes('lingkungan')) return cfg.progKesling;
  if (p.includes('kia') || p.includes('ibu dan anak')) return cfg.progKia;
  if (p.includes('kb') || p.includes('keluarga berencana')) return cfg.progKb;
  if (p.includes('gizi')) return cfg.progGizi;
  if (p.includes('uks')) return cfg.progUks;
  if (p.includes('diare')) return cfg.progDiare;
  if (p.includes('ispa')) return cfg.progIspa;
  if (p.includes('kusta')) return cfg.progKusta;
  if (p.includes('tb') || p.includes('tbc') || p.includes('tuberkulosis')) return cfg.progTb;
  if (p.includes('dbd') || p.includes('dengue')) return cfg.progDbd;
  if (p.includes('hiv') || p.includes('pms') || p.includes('kelamin') || p.includes('aids')) return cfg.progHivPms;
  if (p.includes('malaria') || p.includes('rabies') || p.includes('filaria')) return cfg.progMalariaRabies;
  if (p.includes('hepatitis')) return cfg.progHepatitis;
  if (p.includes('imunisasi')) return cfg.progImunisasi;
  if (p.includes('prolanis')) return cfg.progTimProlanis;
  if (p.includes('surveilance') || p.includes('surveilans')) return cfg.progSurveilance;
  if (p.includes('ptm') || p.includes('tidak menular')) return cfg.progPtm;
  if (p.includes('perkesmas') || p.includes('pis-pk') || p.includes('pispk')) return cfg.progPerkesmasPisPk;
  if (p.includes('keswa') || p.includes('jiwa')) return cfg.progKeswa;
  if (p.includes('gilut') || p.includes('gigi')) return cfg.progGilut;
  if (p.includes('hatra') || p.includes('tradisional')) return cfg.progHatra;
  if (p.includes('kesorga') || p.includes('olahraga')) return cfg.progKesorga;
  if (p.includes('indra') || p.includes('mata')) return cfg.progIndra;
  if (p.includes('kes kerja') || p.includes('kesehatan kerja')) return cfg.progKesKerja;
  if (p.includes('poli umum') || p === 'poli') return cfg.progPoliUmum ?? 10;
  if (p.includes('ugd') || p.includes('gawat darurat') || p.includes('igd')) return cfg.progUgd ?? 15;
  if (p.includes('rawat inap')) return cfg.progRawatInap ?? 10;
  if (p.includes('manajemen')) return 40;
  if (p.includes('posyandu')) return 2.5;

  // Default fallback if program name exists
  if (fallbackSlotPoints !== undefined && fallbackSlotPoints > 0) {
    return fallbackSlotPoints;
  }
  return customPoin !== undefined ? customPoin : 2.5;
}

/**
 * Deteksi skor poin rangkap tugas administrasi
 */
export function getPoinRangkapTugas(emp: Employee, config: PoinJaspelConfig): number {
  if (emp.poinRangkapTugasCustom !== undefined) {
    return emp.poinRangkapTugasCustom;
  }
  const t = (emp.tugasAdmin || '').toLowerCase().trim();
  if (t === '-' || !t) return 0;

  // Cek pada daftar Tugas Tambahan Baru (customTugasList)
  if (config.customTugasList && config.customTugasList.length > 0) {
    const customTugas = config.customTugasList.find((item) => {
      const itemNama = item.nama.toLowerCase().trim();
      return itemNama === t || t.includes(itemNama) || itemNama.includes(t);
    });
    if (customTugas && customTugas.poin > 0) {
      return customTugas.poin;
    }
  }

  if (t.includes('kapus') || t.includes('kepala puskesmas')) return config.tugasKapus;
  if (t.includes('ktu') || t.includes('tata usaha')) return config.tugasKtuBesertaTim;
  if (t.includes('pptk')) return config.tugasPptk;
  if (t.includes('bendahara pengeluaran')) return config.tugasBendaharaPengeluaran;
  if (t.includes('bendahara penerimaan') || t.includes('kasir')) return config.tugasBendaharaPenerimaanKasir;
  if (t.includes('akuntansi')) return config.tugasAkuntansi;
  if (t.includes('pengurus barang')) return config.tugasPengurusBarang;
  if (t.includes('pphp')) return config.tugasPphp;
  if (t.includes('tim jkn')) return config.tugasTimJkn;
  if (t.includes('tim bok') || t.includes('jampersal')) return config.tugasTimBokJampersal;
  if (t.includes('rjg') || t.includes('rig')) return config.tugasRjgRig;
  if (t.includes('pokja')) return config.tugasTimPokja;
  if (t.includes('pustu') || t.includes('polindes') || t.includes('ponkesdes')) return config.tugasPjPustuPolindes;
  if (t.includes('mutu')) return config.tugasTimMutu;
  if (t.includes('spi')) return config.tugasTimSpi;
  return 0;
}

/**
 * Daftar seluruh program standar + custom yang aktif
 */
export function getAllAvailablePrograms(config: PoinJaspelConfig): { nama: string; poin: number; isCustom?: boolean }[] {
  const standards = [
    { nama: 'Poli Umum', poin: config.progPoliUmum ?? 10 },
    { nama: 'UGD (Gawat Darurat)', poin: config.progUgd ?? 15 },
    { nama: 'Pelayanan Rawat Inap', poin: config.progRawatInap ?? 10 },
    { nama: 'Promkes', poin: config.progPromkes },
    { nama: 'Kesehatan Lingkungan', poin: config.progKesling },
    { nama: 'KIA', poin: config.progKia },
    { nama: 'KB', poin: config.progKb },
    { nama: 'Gizi', poin: config.progGizi },
    { nama: 'UKS', poin: config.progUks },
    { nama: 'Diare', poin: config.progDiare },
    { nama: 'Ispa', poin: config.progIspa },
    { nama: 'Kusta', poin: config.progKusta },
    { nama: 'TB', poin: config.progTb },
    { nama: 'DBD', poin: config.progDbd },
    { nama: 'HIV / Penyakit Kelamin', poin: config.progHivPms },
    { nama: 'Malaria/Rabies/Filaria', poin: config.progMalariaRabies },
    { nama: 'Hepatitis', poin: config.progHepatitis },
    { nama: 'Imunisasi', poin: config.progImunisasi },
    { nama: 'Tim Prolanis', poin: config.progTimProlanis },
    { nama: 'Surveilance', poin: config.progSurveilance },
    { nama: 'PTM', poin: config.progPtm },
    { nama: 'Perkesmas & PIS-PK', poin: config.progPerkesmasPisPk },
    { nama: 'Keswa', poin: config.progKeswa },
    { nama: 'Gilut', poin: config.progGilut },
    { nama: 'Hatra', poin: config.progHatra },
    { nama: 'Kesorga', poin: config.progKesorga },
    { nama: 'Indra', poin: config.progIndra },
    { nama: 'Kes Kerja', poin: config.progKesKerja },
  ];

  const customs = (config.customProgramList || []).map((cp) => ({
    nama: cp.nama,
    poin: cp.poin,
    isCustom: true,
  }));

  return [...standards, ...customs];
}

/**
 * Daftar seluruh tugas administrasi standar + custom yang aktif
 */
export function getAllAvailableTugas(config: PoinJaspelConfig): { nama: string; poin: number; isCustom?: boolean }[] {
  const standards = [
    { nama: 'Kapus', poin: config.tugasKapus },
    { nama: 'KTU beserta Tim', poin: config.tugasKtuBesertaTim },
    { nama: 'PPTK', poin: config.tugasPptk },
    { nama: 'Bendahara Pengeluaran', poin: config.tugasBendaharaPengeluaran },
    { nama: 'Bendahara Penerimaan + Kasir', poin: config.tugasBendaharaPenerimaanKasir },
    { nama: 'Akuntansi', poin: config.tugasAkuntansi },
    { nama: 'Pengurus Barang', poin: config.tugasPengurusBarang },
    { nama: 'PPHP', poin: config.tugasPphp },
    { nama: 'TIM JKN', poin: config.tugasTimJkn },
    { nama: 'TIM BOK & JAMPERSAL', poin: config.tugasTimBokJampersal },
    { nama: 'RJG dan RIG', poin: config.tugasRjgRig },
    { nama: 'Tim Pokja', poin: config.tugasTimPokja },
    { nama: 'PJ Pustu/Polindes/Ponkesdes', poin: config.tugasPjPustuPolindes },
    { nama: 'Tim Mutu', poin: config.tugasTimMutu },
    { nama: 'Tim SPI', poin: config.tugasTimSpi },
  ];

  const customs = (config.customTugasList || []).map((ct) => ({
    nama: ct.nama,
    poin: ct.poin,
    isCustom: true,
  }));

  return [...standards, ...customs];
}

/**
 * Daftar seluruh tugas administrasi tambahan (Kelompok 7)
 */
export function getAllAvailableTugasTambahan(config: PoinJaspelConfig): { nama: string; poin: number; isCustom?: boolean }[] {
  const list = config.customTugasTambahanList || DEFAULT_TUGAS_TAMBAHAN_LIST;
  return list.map((item) => ({
    nama: item.nama,
    poin: item.poin,
    isCustom: true,
  }));
}

/**
 * Deteksi profesi Dokter untuk pembagian proporsional UGD 50%
 */
export function isDoctorEmployee(emp: Employee): boolean {
  const j = (emp.jabatan || '').toLowerCase();
  const n = (emp.name || '').toLowerCase();
  const p = (emp.pendidikan || '').toLowerCase();
  return (
    j.includes('dokter') ||
    n.startsWith('dr.') ||
    n.startsWith('drg.') ||
    n.includes('dr.') ||
    n.includes('drg.') ||
    p.includes('dokter') ||
    p.includes('profesi dokter')
  );
}

/**
 * Deteksi apakah program termasuk kategori UGD / Gawat Darurat
 */
export function isUgdProgram(name?: string): boolean {
  if (!name || name === '-' || !name.trim()) return false;
  const n = name.toLowerCase().trim();
  return n === 'ugd' || n.includes('ugd') || n.includes('gawat darurat') || n.includes('igd');
}

/**
 * Hitung poin dasar tugas administrasi tambahan (Kelompok 7)
 * Memperhatikan switch aktivasi kelompok 7 (tugasTambahanEnabled)
 */
export function getPoinTugasTambahan(
  emp: Employee,
  config: PoinJaspelConfig,
  customPoin?: number
): { poin: number; nama: string; isActive: boolean } {
  const isEnabled = config.tugasTambahanEnabled !== false;
  if (!isEnabled) {
    return {
      poin: 0,
      nama: emp.tugasTambahan || '-',
      isActive: false,
    };
  }

  const t = (emp.tugasTambahan || '').toLowerCase().trim();
  if (!t || t === '-') {
    return { poin: 0, nama: '-', isActive: true };
  }

  if (customPoin !== undefined && customPoin !== null && !isNaN(customPoin) && customPoin > 0) {
    return { poin: customPoin, nama: emp.tugasTambahan!, isActive: true };
  }

  const list = config.customTugasTambahanList || DEFAULT_TUGAS_TAMBAHAN_LIST;
  const match = list.find((item) => {
    const itemNama = item.nama.toLowerCase().trim();
    return itemNama === t || t.includes(itemNama) || itemNama.includes(t);
  });

  if (match) {
    return { poin: match.poin, nama: match.nama, isActive: true };
  }

  return { poin: 5, nama: emp.tugasTambahan!, isActive: true };
}

export interface SharedRoleBreakdownItem {
  roleName: string;
  groupType: 'program' | 'tugasAdmin' | 'tugasTambahan';
  originalPoint: number;
  finalPoint: number;
  userCount: number;
  isUgd?: boolean;
  ugdRole?: 'dokter' | 'petugas';
  note?: string;
}

export interface SharedPointsContext {
  isDivisionEnabled: boolean;
  programShareMap: Map<string, {
    originalName: string;
    totalUsers: number;
    pointPerPerson: number;
    isUgd: boolean;
    doctorCount: number;
    staffCount: number;
    doctorPoint: number;
    staffPoint: number;
    originalPoint: number;
  }>;
  tugasAdminShareMap: Map<string, {
    originalName: string;
    totalUsers: number;
    pointPerPerson: number;
    originalPoint: number;
  }>;
  tugasTambahanShareMap: Map<string, {
    originalName: string;
    totalUsers: number;
    pointPerPerson: number;
    originalPoint: number;
    isActive: boolean;
  }>;
}

/**
 * Engine Pembagian Poin Bersama (Shared Points)
 * Mengatur:
 * 1. Program & Pelayanan bersama: Poin dibagi rata sebanyak jumlah pegawai pemegang program (kecuali UGD)
 * 2. UGD: 50% untuk dokter (dibagi rata jumlah dokter), 50% untuk petugas lain (perawat, analis, bidan)
 * 3. Rangkap Tugas Administrasi bersama: Poin dibagi rata
 * 4. Tugas Administrasi Tambahan (Kelompok 7): Poin dibagi rata jika aktif, 0 jika nonaktif
 */
export function buildSharedPointsContext(
  allEmployees: Employee[],
  config: PoinJaspelConfig
): SharedPointsContext {
  const isDivisionEnabled = config.enableSharedPointDivision !== false;
  const isTugasTambahanEnabled = config.tugasTambahanEnabled !== false;

  const programUserMap = new Map<string, { originalName: string; employees: Employee[] }>();
  const tugasAdminUserMap = new Map<string, { originalName: string; employees: Employee[] }>();
  const tugasTambahanUserMap = new Map<string, { originalName: string; employees: Employee[] }>();

  if (allEmployees && allEmployees.length > 0) {
    allEmployees.forEach((emp) => {
      // Kumpulkan Program (deduplikasi per pegawai)
      const empPrograms = [
        emp.pjProgramName,
        emp.program1,
        emp.program2,
        emp.program3,
        emp.program4,
        emp.program5,
      ].filter((p): p is string => Boolean(p && p !== '-' && p.trim() !== ''));

      const seenInEmp = new Set<string>();
      empPrograms.forEach((pName) => {
        const key = pName.toLowerCase().trim();
        if (!seenInEmp.has(key)) {
          seenInEmp.add(key);
          const current = programUserMap.get(key) || { originalName: pName.trim(), employees: [] };
          current.employees.push(emp);
          programUserMap.set(key, current);
        }
      });

      // Kumpulkan Rangkap Tugas Admin
      if (emp.tugasAdmin && emp.tugasAdmin !== '-' && emp.tugasAdmin.trim() !== '') {
        const key = emp.tugasAdmin.toLowerCase().trim();
        const current = tugasAdminUserMap.get(key) || { originalName: emp.tugasAdmin.trim(), employees: [] };
        current.employees.push(emp);
        tugasAdminUserMap.set(key, current);
      }

      // Kumpulkan Tugas Administrasi Tambahan (Kelompok 7)
      if (emp.tugasTambahan && emp.tugasTambahan !== '-' && emp.tugasTambahan.trim() !== '') {
        const key = emp.tugasTambahan.toLowerCase().trim();
        const current = tugasTambahanUserMap.get(key) || { originalName: emp.tugasTambahan.trim(), employees: [] };
        current.employees.push(emp);
        tugasTambahanUserMap.set(key, current);
      }
    });
  }

  // 1. Proses Program & Pelayanan (Termasuk Aturan Khusus UGD)
  const programShareMap = new Map<string, {
    originalName: string;
    totalUsers: number;
    pointPerPerson: number;
    isUgd: boolean;
    doctorCount: number;
    staffCount: number;
    doctorPoint: number;
    staffPoint: number;
    originalPoint: number;
  }>();

  programUserMap.forEach(({ originalName, employees: users }, key) => {
    const isUgd = isUgdProgram(originalName);
    const rawPoint = resolveProgramPoints(originalName, undefined, config);

    if (isUgd) {
      const doctors = users.filter((u) => isDoctorEmployee(u));
      const staff = users.filter((u) => !isDoctorEmployee(u));
      const doctorCount = doctors.length;
      const staffCount = staff.length;
      const totalUsers = users.length;

      const ugdPoint = config.progUgd !== undefined ? config.progUgd : (rawPoint > 0 ? rawPoint : 15);
      const docPercent = (config.ugdDokterPercent !== undefined ? config.ugdDokterPercent : 50) / 100;
      const staffPercent = (config.ugdPetugasPercent !== undefined ? config.ugdPetugasPercent : 50) / 100;

      const docPool = ugdPoint * docPercent;
      const staffPool = ugdPoint * staffPercent;

      let doctorPoint = 0;
      let staffPoint = 0;

      if (isDivisionEnabled) {
        doctorPoint = doctorCount > 0 ? Number((docPool / doctorCount).toFixed(2)) : 0;
        staffPoint = staffCount > 0 ? Number((staffPool / staffCount).toFixed(2)) : 0;
      } else {
        doctorPoint = Number(docPool.toFixed(2));
        staffPoint = Number(staffPool.toFixed(2));
      }

      programShareMap.set(key, {
        originalName,
        totalUsers,
        pointPerPerson: totalUsers > 0 ? Number((ugdPoint / totalUsers).toFixed(2)) : ugdPoint,
        isUgd: true,
        doctorCount,
        staffCount,
        doctorPoint,
        staffPoint,
        originalPoint: ugdPoint,
      });
    } else {
      const totalUsers = users.length;
      const basePoint = rawPoint;
      const pointPerPerson = (isDivisionEnabled && totalUsers > 1)
        ? Number((basePoint / totalUsers).toFixed(2))
        : basePoint;

      programShareMap.set(key, {
        originalName,
        totalUsers,
        pointPerPerson,
        isUgd: false,
        doctorCount: 0,
        staffCount: 0,
        doctorPoint: pointPerPerson,
        staffPoint: pointPerPerson,
        originalPoint: basePoint,
      });
    }
  });

  // 2. Proses Rangkap Tugas Administrasi
  const tugasAdminShareMap = new Map<string, {
    originalName: string;
    totalUsers: number;
    pointPerPerson: number;
    originalPoint: number;
  }>();

  tugasAdminUserMap.forEach(({ originalName, employees: users }, key) => {
    const totalUsers = users.length;
    const basePoint = getPoinRangkapTugas(users[0], config);
    const pointPerPerson = (isDivisionEnabled && totalUsers > 1)
      ? Number((basePoint / totalUsers).toFixed(2))
      : basePoint;

    tugasAdminShareMap.set(key, {
      originalName,
      totalUsers,
      pointPerPerson,
      originalPoint: basePoint,
    });
  });

  // 3. Proses Tugas Administrasi Tambahan (Kelompok 7)
  const tugasTambahanShareMap = new Map<string, {
    originalName: string;
    totalUsers: number;
    pointPerPerson: number;
    originalPoint: number;
    isActive: boolean;
  }>();

  tugasTambahanUserMap.forEach(({ originalName, employees: users }, key) => {
    const totalUsers = users.length;
    const rawRes = getPoinTugasTambahan(users[0], config);
    const basePoint = rawRes.poin;

    let pointPerPerson = 0;
    if (isTugasTambahanEnabled) {
      pointPerPerson = (isDivisionEnabled && totalUsers > 1)
        ? Number((basePoint / totalUsers).toFixed(2))
        : basePoint;
    }

    tugasTambahanShareMap.set(key, {
      originalName,
      totalUsers,
      pointPerPerson,
      originalPoint: basePoint,
      isActive: isTugasTambahanEnabled,
    });
  });

  return {
    isDivisionEnabled,
    programShareMap,
    tugasAdminShareMap,
    tugasTambahanShareMap,
  };
}

/**
 * Evaluasi 1 Baris Hitung Poin Lengkap Persis Sesuai Excel
 * Mendukung Pembagian Nilai Poin Bersama & Kelompok 7 (Tugas Administrasi Tambahan)
 */
export function evaluateHitungPoinRow(
  emp: Employee,
  index: number,
  config: PoinJaspelConfig,
  masaKerjaRules: MasaKerjaRule[],
  totalAlokasi: number = 0,
  totalExitPoin: number = 1,
  totalBasePoin: number = 1,
  referenceDateStr?: string,
  allEmployees?: Employee[],
  precomputedSharedContext?: SharedPointsContext
): HitungPoinRow {
  const mk = calculateMasaKerjaDetail(emp.tmt, referenceDateStr);

  const sharedContext = precomputedSharedContext || (allEmployees ? buildSharedPointsContext(allEmployees, config) : undefined);
  const isDoctor = isDoctorEmployee(emp);

  const poinKetenagaan = getPoinIjazah(emp, config);
  const poinMasaKerja = getPoinMasaKerja(mk.years);

  const sharedBreakdown: SharedRoleBreakdownItem[] = [];

  // 2. Rangkap Tugas Administrasi (Kelompok 3)
  let poinRangkapTugas = getPoinRangkapTugas(emp, config);
  if (emp.poinRangkapTugasCustom !== undefined) {
    poinRangkapTugas = emp.poinRangkapTugasCustom;
  } else if (sharedContext && emp.tugasAdmin && emp.tugasAdmin !== '-') {
    const adminKey = emp.tugasAdmin.toLowerCase().trim();
    const adminShare = sharedContext.tugasAdminShareMap.get(adminKey);
    if (adminShare) {
      poinRangkapTugas = adminShare.pointPerPerson;
      if (adminShare.totalUsers > 1 && sharedContext.isDivisionEnabled) {
        sharedBreakdown.push({
          roleName: adminShare.originalName,
          groupType: 'tugasAdmin',
          originalPoint: adminShare.originalPoint,
          finalPoint: adminShare.pointPerPerson,
          userCount: adminShare.totalUsers,
          note: `Dibagi ${adminShare.totalUsers} orang (${adminShare.originalPoint} / ${adminShare.totalUsers})`,
        });
      }
    }
  }

  // 7. Tugas Administrasi Tambahan (Kelompok 7)
  let poinTugasTambahan = 0;
  let namaTugasTambahan = emp.tugasTambahan || '-';
  const isTugasTambahanActive = config.tugasTambahanEnabled !== false;

  if (isTugasTambahanActive && emp.tugasTambahan && emp.tugasTambahan !== '-') {
    if (emp.poinTugasTambahanCustom !== undefined) {
      poinTugasTambahan = emp.poinTugasTambahanCustom;
    } else if (sharedContext) {
      const ttKey = emp.tugasTambahan.toLowerCase().trim();
      const ttShare = sharedContext.tugasTambahanShareMap.get(ttKey);
      if (ttShare) {
        poinTugasTambahan = ttShare.pointPerPerson;
        namaTugasTambahan = ttShare.originalName;
        if (ttShare.totalUsers > 1 && sharedContext.isDivisionEnabled) {
          sharedBreakdown.push({
            roleName: ttShare.originalName,
            groupType: 'tugasTambahan',
            originalPoint: ttShare.originalPoint,
            finalPoint: ttShare.pointPerPerson,
            userCount: ttShare.totalUsers,
            note: `Dibagi ${ttShare.totalUsers} orang (${ttShare.originalPoint} / ${ttShare.totalUsers})`,
          });
        }
      } else {
        const rawTt = getPoinTugasTambahan(emp, config);
        poinTugasTambahan = rawTt.poin;
        namaTugasTambahan = rawTt.nama;
      }
    } else {
      const rawTt = getPoinTugasTambahan(emp, config);
      poinTugasTambahan = rawTt.poin;
      namaTugasTambahan = rawTt.nama;
    }
  } else {
    poinTugasTambahan = 0;
    namaTugasTambahan = emp.tugasTambahan || '-';
  }

  // Evaluasi Slot Program & Pelayanan (Kelompok 4) dengan Aturan Pembagian & UGD
  const evalSlot = (slotName?: string, customPoin?: number, fallback?: number): number => {
    if (!slotName || slotName === '-' || !slotName.trim()) return 0;
    if (customPoin !== undefined && customPoin !== null && !isNaN(customPoin) && customPoin > 0) {
      return customPoin;
    }

    if (sharedContext) {
      const pKey = slotName.toLowerCase().trim();
      const pShare = sharedContext.programShareMap.get(pKey);
      if (pShare) {
        if (pShare.isUgd) {
          const finalVal = isDoctor ? pShare.doctorPoint : pShare.staffPoint;
          const userCount = isDoctor ? pShare.doctorCount : pShare.staffCount;
          sharedBreakdown.push({
            roleName: pShare.originalName,
            groupType: 'program',
            originalPoint: pShare.originalPoint,
            finalPoint: finalVal,
            userCount,
            isUgd: true,
            ugdRole: isDoctor ? 'dokter' : 'petugas',
            note: isDoctor 
              ? `UGD 50% dokter (${pShare.originalPoint * 0.5} poin dibagi ${userCount} dokter)`
              : `UGD 50% petugas lain (${pShare.originalPoint * 0.5} poin dibagi ${userCount} petugas)`,
          });
          return finalVal;
        } else {
          const finalVal = pShare.pointPerPerson;
          if (pShare.totalUsers > 1 && sharedContext.isDivisionEnabled) {
            sharedBreakdown.push({
              roleName: pShare.originalName,
              groupType: 'program',
              originalPoint: pShare.originalPoint,
              finalPoint: finalVal,
              userCount: pShare.totalUsers,
              note: `Dibagi ${pShare.totalUsers} orang (${pShare.originalPoint} / ${pShare.totalUsers})`,
            });
          }
          return finalVal;
        }
      }
    }

    return resolveProgramPoints(slotName, customPoin, config, fallback);
  };

  const poinPjProg = evalSlot(emp.pjProgramName, emp.pjProgramPoin, config.poinPjProgramStandar ?? 5);
  const poinProg1 = evalSlot(emp.program1, emp.program1Poin, config.poinProg1Standar ?? 5);
  const poinProg2 = evalSlot(emp.program2, emp.program2Poin, config.poinProg2Standar ?? 3);
  const poinProg3 = evalSlot(emp.program3, emp.program3Poin, config.poinProg3Standar ?? 2.5);
  const poinProg4 = evalSlot(emp.program4, emp.program4Poin, config.poinProg4Standar ?? 2);
  const poinProg5 = evalSlot(emp.program5, emp.program5Poin, config.poinProg5Standar ?? 2);
  const poinProgTambahanTotal = Number((poinPjProg + poinProg1 + poinProg2 + poinProg3 + poinProg4 + poinProg5).toFixed(2));

  // Status Kepegawaian (PNS, PPPK, Honorer)
  let statusNilai = config.statusAsn;
  if (emp.status === 'Honorer') {
    statusNilai = config.statusHonorer ?? config.statusNonAsn;
  } else if (emp.status === 'PPPK') {
    statusNilai = config.statusPppk ?? config.statusAsn;
  } else if (emp.status === 'PNS') {
    statusNilai = config.statusPns ?? config.statusAsn;
  }

  // TOTAL POINT = Ketenagaan + Masa Kerja + Rangkap Tugas + Tugas Tambahan (Kel. 7) + Tanggung Jawab Program + Status
  const totalPoint = Number((poinKetenagaan + poinMasaKerja + poinRangkapTugas + poinTugasTambahan + poinProgTambahanTotal + statusNilai).toFixed(2));

  // Kehadiran
  const presensi = emp.attendance ?? 20;
  const hariKerja = emp.maxAttendance || 24;
  const prosentaseKehadiran = Math.round((presensi / hariKerja) * 100);

  // Poin Kehadiran = (Prosentase kehadiran x JML Poin) / 100
  const poinKehadiran = Number(((prosentaseKehadiran * totalPoint) / 100).toFixed(2));

  // Kinerja
  const kinerjaUraian = emp.kinerjaUraian || 'Baik';
  const kinerjaNilai = emp.kinerjaNilai ?? config.kinerjaBaik; // Default 97.5

  // Poin Kinerja = (Poin Kehadiran x Nilai Kinerja) / 100
  const poinKinerja = Number(((poinKehadiran * kinerjaNilai) / 100).toFixed(2));

  // Masa Kerja Non ASN
  const prosentaseMasaKerja = getProsentaseMasaKerja(emp.status, mk.totalMonths, masaKerjaRules);

  // EXIT POIN = Poin Kinerja x (Prosentase Masa Kerja / 100)
  const exitPoin = Number(((poinKinerja * prosentaseMasaKerja) / 100).toFixed(2));

  // Total Poin Tanpa Kehadiran (PFK BPJS) = TOTAL POINT x (Nilai Kinerja / 100) x (Prosentase Masa Kerja / 100)
  const totalPoinTanpaKehadiran = Number(((totalPoint * kinerjaNilai / 100) * (prosentaseMasaKerja / 100)).toFixed(4));

  // Jasa Pelayanan & PFK BPJS Rp
  const jasaPelayanan = totalExitPoin > 0 ? Math.round((exitPoin / totalExitPoin) * totalAlokasi) : 0;
  const pfkBpjs = totalBasePoin > 0 ? Math.round((totalPoinTanpaKehadiran / totalBasePoin) * totalAlokasi) : 0;

  return {
    id: emp.id,
    no: index + 1,
    nama: emp.name,
    pendidikan: emp.pendidikan || 'S1',
    tmt: emp.tmt || '2003-12-01',
    masaKerjaTh: mk.years,
    masaKerjaBln: mk.months,
    masaKerjaHari: mk.days,
    presensi,
    hariKerja,
    prosentaseKehadiran,
    poinKetenagaan,
    poinMasaKerja,
    poinRangkapTugas,
    poinTugasTambahan,
    namaTugasTambahan,
    isTugasTambahanActive,
    poinPjProg,
    namaPjProg: emp.pjProgramName,
    poinProg1,
    namaProg1: emp.program1,
    poinProg2,
    namaProg2: emp.program2,
    poinProg3,
    namaProg3: emp.program3,
    poinProg4,
    namaProg4: emp.program4,
    poinProg5,
    namaProg5: emp.program5,
    poinProgTambahanTotal,
    statusKepegawaian: emp.status,
    statusNilai,
    totalPoint,
    poinKehadiran,
    kinerjaUraian,
    kinerjaNilai,
    poinKinerja,
    masaKerjaBulan: mk.totalMonths,
    prosentaseMasaKerja,
    exitPoin,
    jasaPelayanan,
    totalPoinTanpaKehadiran,
    pfkBpjs,
    sharedPointBreakdown: sharedBreakdown.length > 0 ? sharedBreakdown : undefined,
  };
}
