import React, { useState, useMemo } from 'react';
import { 
  Employee, 
  PoinJaspelConfig, 
  MasaKerjaRule, 
  InstansiConfig, 
  HitungPoinRow 
} from '../types/jaspel';
import { evaluateHitungPoinRow, buildSharedPointsContext } from '../lib/pointCalculator';
import { formatNumber, formatRupiah } from '../lib/utils';
import { downloadExcel } from '../lib/excelHelper';
import { 
  Calculator, 
  Download, 
  Search, 
  Users, 
  Award, 
  CheckCircle2, 
  HelpCircle,
  FileSpreadsheet,
  RefreshCw,
  Sparkles,
  Maximize2,
  Filter,
  Layers,
  ChevronRight,
  Eye,
  EyeOff,
  Split,
  ClipboardList,
  Info,
  Stethoscope,
  AlertTriangle,
  X
} from 'lucide-react';

interface HitungPoinViewProps {
  employees: Employee[];
  poinConfig: PoinJaspelConfig;
  masaKerjaRules: MasaKerjaRule[];
  instansi: InstansiConfig;
  bulan: string;
  tahun: number;
  totalAlokasiKapitasi?: number;
  onApplyCalculatedPointsToMaster?: (updatedEmployees: Employee[]) => void;
}

export const HitungPoinView: React.FC<HitungPoinViewProps> = ({
  employees,
  poinConfig,
  masaKerjaRules,
  instansi,
  bulan,
  tahun,
  totalAlokasiKapitasi = 89100000,
  onApplyCalculatedPointsToMaster,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [programFilterTerm, setProgramFilterTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PNS' | 'PPPK' | 'Honorer'>('ALL');
  const [showProgramNames, setShowProgramNames] = useState(true);
  const [isAppliedToast, setIsAppliedToast] = useState(false);
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [showSharedModal, setShowSharedModal] = useState(false);

  // Bangun Shared Points Context (Perhitungan Pembagian Poin Bersama & UGD 50/50)
  const sharedContext = useMemo(() => {
    return buildSharedPointsContext(employees, poinConfig);
  }, [employees, poinConfig]);

  // Evaluasi seluruh baris poin
  // Pass 1: compute sums for scaling Jaspel and BPJS
  const preliminaryRows = useMemo(() => {
    return employees.map((emp, idx) =>
      evaluateHitungPoinRow(emp, idx, poinConfig, masaKerjaRules, 0, 1, 1, undefined, employees, sharedContext)
    );
  }, [employees, poinConfig, masaKerjaRules, sharedContext]);

  const totalExitPoinAll = useMemo(() => {
    return preliminaryRows.reduce((sum, r) => sum + r.exitPoin, 0) || 1;
  }, [preliminaryRows]);

  const totalBasePoinAll = useMemo(() => {
    return preliminaryRows.reduce((sum, r) => sum + r.totalPoinTanpaKehadiran, 0) || 1;
  }, [preliminaryRows]);

  // Pass 2: calculate exact proportions and Rupiah amounts
  const calculatedRows: HitungPoinRow[] = useMemo(() => {
    return employees.map((emp, idx) =>
      evaluateHitungPoinRow(
        emp,
        idx,
        poinConfig,
        masaKerjaRules,
        totalAlokasiKapitasi,
        totalExitPoinAll,
        totalBasePoinAll,
        undefined,
        employees,
        sharedContext
      )
    );
  }, [employees, poinConfig, masaKerjaRules, totalAlokasiKapitasi, totalExitPoinAll, totalBasePoinAll, sharedContext]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return calculatedRows.filter((r) => {
      const matchSearch =
        r.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.pendidikan || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.statusKepegawaian || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || r.statusKepegawaian === statusFilter;

      let matchProgram = true;
      if (programFilterTerm.trim()) {
        const query = programFilterTerm.toLowerCase();
        const programsCombined = [
          r.namaPjProg,
          r.namaProg1,
          r.namaProg2,
          r.namaProg3,
          r.namaProg4,
          r.namaProg5,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        matchProgram = programsCombined.includes(query);
      }

      return matchSearch && matchStatus && matchProgram;
    });
  }, [calculatedRows, searchTerm, statusFilter, programFilterTerm]);

  // Aggregate Metrics
  const totalPegawai = calculatedRows.length;
  const sumTotalPoints = calculatedRows.reduce((s, r) => s + r.totalPoint, 0);
  const sumTotalProgramPoints = calculatedRows.reduce((s, r) => s + r.totalProgram, 0);
  const sumTotalTugasTambahanPoints = calculatedRows.reduce((s, r) => s + (r.poinTugasTambahan || 0), 0);
  const sumPoinKehadiran = calculatedRows.reduce((s, r) => s + r.poinKehadiran, 0);
  const sumPoinKinerja = calculatedRows.reduce((s, r) => s + r.poinKinerja, 0);
  const sumExitPoin = calculatedRows.reduce((s, r) => s + r.exitPoin, 0);
  const sumPfkPoin = calculatedRows.reduce((s, r) => s + r.totalPoinTanpaKehadiran, 0);
  const sumJaspelRp = calculatedRows.reduce((s, r) => s + r.jasaPelayanan, 0);
  const sumPfkRp = calculatedRows.reduce((s, r) => s + r.pfkBpjs, 0);

  // Grouped Program Holders Summary for Modal
  const programHoldersSummary = useMemo(() => {
    const map = new Map<string, { employeeName: string; roleType: string; poin: number }[]>();
    calculatedRows.forEach((r) => {
      const checkAndAdd = (name?: string, poin?: number, role?: string) => {
        if (name && name !== '-' && name.trim()) {
          const key = name.trim();
          const list = map.get(key) || [];
          list.push({ employeeName: r.nama, roleType: role || 'Pemegang Program', poin: poin || 0 });
          map.set(key, list);
        }
      };
      checkAndAdd(r.namaPjProg, r.poinPjProg, 'PJ Program');
      checkAndAdd(r.namaProg1, r.poinProg1, 'Program 1');
      checkAndAdd(r.namaProg2, r.poinProg2, 'Tambahan 1');
      checkAndAdd(r.namaProg3, r.poinProg3, 'Tambahan 2');
      checkAndAdd(r.namaProg4, r.poinProg4, 'Tambahan 3');
      checkAndAdd(r.namaProg5, r.poinProg5, 'Tambahan 4');
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [calculatedRows]);

  // Handler Export to Excel with EXACT columns from Screenshot
  const handleExportExcel = () => {
    const headers1 = [
      'NO',
      'NAMA',
      'Pendidikan',
      'TMT',
      'JML Masa Kerja', '', '',
      'VARIABEL KEHADIRAN', '', '',
      'VARIABEL NILAI', '', '', '',
      'TANGGUNG JAWAB PROGRAM', '', '', '', '', '', '',
      'STATUS KEPEGAWAIAN', '',
      'TOTAL POINT',
      'Poin Kehadiran (Prosentase x JML Poin)/100',
      'VARIABEL KINERJA', '',
      'POIN KINERJA (Poin Kehadiran x Kinerja)/100',
      'VARIABEL MASA KERJA (NON ASN)', '',
      'EXIT POIN',
      'JASA PELAYANAN (Rp)',
      'PERHITUNGAN PFK BPJS', ''
    ];

    const headers2 = [
      '', '', '', '',
      'Th', 'Bln', 'Hari',
      'PRESENSI', 'HARI KERJA', 'PROSENTASE (%)',
      'JENIS KETENAGAAN', 'MASA KERJA', 'RANGKAP TUGAS ADMIN', 'TUGAS TAMBAHAN (KEL. 7)',
      'PJ PROGRAM', 'PROGRAM 1', 'TAMBAHAN 1', 'TAMBAHAN 2', 'TAMBAHAN 3', 'TAMBAHAN 4', 'TOTAL PROGRAM',
      'STATUS', 'NILAI',
      '',
      '',
      'URAIAN', 'Nilai',
      '',
      'Masa Kerja (Bulan)', 'Prosentase Masa Kerja',
      '',
      '',
      'TOTAL POIN TANPA KEHADIRAN', 'PFK BPJS (Rp)'
    ];

    const dataRows = calculatedRows.map((r, idx) => [
      idx + 1,
      r.nama,
      r.pendidikan,
      r.tmt,
      r.masaKerjaTh,
      r.masaKerjaBln,
      r.masaKerjaHari,
      r.presensi,
      r.hariKerja,
      r.prosentaseKehadiran,
      r.poinKetenagaan,
      r.poinMasaKerja,
      r.poinRangkapTugas || '',
      r.poinTugasTambahan > 0 
        ? `${r.poinTugasTambahan} (${r.namaTugasTambahan || ''})` 
        : (r.isTugasTambahanActive ? (r.namaTugasTambahan && r.namaTugasTambahan !== '-' ? r.namaTugasTambahan : '') : 'Nonaktif (0)'),
      r.poinPjProg ? `${r.poinPjProg} (${r.namaPjProg || ''})` : '',
      r.poinProg1 ? `${r.poinProg1} (${r.namaProg1 || ''})` : '',
      r.poinProg2 ? `${r.poinProg2} (${r.namaProg2 || ''})` : '',
      r.poinProg3 ? `${r.poinProg3} (${r.namaProg3 || ''})` : '',
      r.poinProg4 ? `${r.poinProg4} (${r.namaProg4 || ''})` : '',
      r.poinProg5 ? `${r.poinProg5} (${r.namaProg5 || ''})` : '',
      r.poinProgTambahanTotal,
      r.statusKepegawaian === 'Honorer' ? 'NON ASN' : r.statusKepegawaian,
      r.statusNilai,
      r.totalPoint,
      r.poinKehadiran,
      r.kinerjaUraian,
      r.kinerjaNilai,
      r.poinKinerja,
      r.masaKerjaBulan,
      r.prosentaseMasaKerja,
      r.exitPoin,
      r.jasaPelayanan,
      r.totalPoinTanpaKehadiran,
      r.pfkBpjs
    ]);

    const titleRows = [
      [`DAFTAR PERHITUNGAN POIN JASA PELAYANAN (AJP) KESEHATAN`],
      [`INSTANSI: ${instansi.namaInstansi.toUpperCase()}`],
      [`PERIODE: ${bulan.toUpperCase()} ${tahun} • TOTAL ALOKASI: ${formatRupiah(totalAlokasiKapitasi)}`],
      []
    ];

    const totalRow = [
      '', 'TOTAL', '', '', '', '', '', '', '', '',
      '', '', '', Number(sumTotalTugasTambahanPoints.toFixed(2)),
      '', '', '', '', '', '', Number(sumTotalProgramPoints.toFixed(2)),
      '', '',
      Number(sumTotalPoints.toFixed(2)),
      Number(sumPoinKehadiran.toFixed(2)),
      '', '',
      Number(sumPoinKinerja.toFixed(2)),
      '', '',
      Number(sumExitPoin.toFixed(2)),
      sumJaspelRp,
      Number(sumPfkPoin.toFixed(2)),
      sumPfkRp
    ];

    const aoa = [...titleRows, headers1, headers2, ...dataRows, totalRow];
    downloadExcel(
      `AJP_HITUNG_POIN_${bulan}_${tahun}.xlsx`,
      'HITUNG POIN',
      aoa
    );
  };

  // Handler Apply Points to Master
  const handleApplyToMaster = () => {
    if (!onApplyCalculatedPointsToMaster) return;
    const updated = employees.map((emp, idx) => {
      const row = calculatedRows[idx];
      return {
        ...emp,
        points: row.totalPoint,
        poinBpjs: row.totalPoinTanpaKehadiran,
        prosentaseMasaKerja: row.prosentaseMasaKerja,
      };
    });
    onApplyCalculatedPointsToMaster(updated);
    setIsAppliedToast(true);
    setTimeout(() => setIsAppliedToast(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Hitung Poin Jaspel
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Periode {bulan} {tahun}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Data Perhitungan Poin & Detail Tanggung Jawab Pemegang Program
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Format resmi sesuai standar lembar kerja Excel AJP: Ketenagaan, Masa Kerja, Rangkap Tugas, Detail Pemegang Program (PJ Program & Tambahan 1-4), Variabel Kinerja, Exit Poin, dan PFK BPJS.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowSharedModal(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-indigo-300 text-xs font-semibold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 transition-colors shadow-xs"
            title="Lihat rincian pembagian poin bersama dan aturan khusus UGD"
          >
            <Split className="w-3.5 h-3.5 text-indigo-600" />
            <span>Rincian Pembagian Bersama & UGD</span>
          </button>

          <button
            type="button"
            onClick={() => setShowProgramModal(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-teal-300 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 transition-colors"
            title="Lihat rekapitulasi daftar pemegang program"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Rekap Pemegang Program ({programHoldersSummary.length})</span>
          </button>

          {onApplyCalculatedPointsToMaster && (
            <button
              type="button"
              onClick={handleApplyToMaster}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-emerald-300 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
              title="Perbarui kolom poin di Master Karyawan dengan hasil hitung ini"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sinkron ke Master</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Excel Hitung Poin (.xlsx)</span>
          </button>
        </div>
      </div>

      {isAppliedToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Exit Poin dan Poin BPJS berhasil disinkronkan ke Master Pegawai!</span>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Total Pegawai</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-xl font-bold font-mono text-slate-900">{totalPegawai}</span>
            <span className="text-[11px] text-slate-400">Orang</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-teal-200 bg-teal-50/20 shadow-xs">
          <span className="text-[11px] font-semibold text-teal-800 block">Poin Program Total</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-xl font-bold font-mono text-teal-900">{formatNumber(sumTotalProgramPoints, 1)}</span>
            <span className="text-[11px] text-teal-600">Poin</span>
          </div>
        </div>

        {/* Tugas Administrasi Tambahan Kelompok 7 */}
        <div className={`p-3 rounded-xl border shadow-xs transition-all ${
          poinConfig.tugasTambahanEnabled !== false 
            ? 'bg-purple-50/30 border-purple-200 text-purple-900' 
            : 'bg-slate-100/70 border-slate-300 text-slate-500'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold block truncate">Poin Kel. 7 (Tugas Tambahan)</span>
            <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
              poinConfig.tugasTambahanEnabled !== false ? 'bg-purple-100 text-purple-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {poinConfig.tugasTambahanEnabled !== false ? 'AKTIF' : 'NONAKTIF'}
            </span>
          </div>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-xl font-bold font-mono">
              {poinConfig.tugasTambahanEnabled !== false ? formatNumber(sumTotalTugasTambahanPoints, 1) : 0}
            </span>
            <span className="text-[11px] text-slate-500">Poin</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Total Poin Dasar</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-xl font-bold font-mono text-slate-900">{formatNumber(sumTotalPoints, 1)}</span>
            <span className="text-[11px] text-slate-400">Poin</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-800 block">Total Exit Poin</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-xl font-bold font-mono text-emerald-900">{formatNumber(sumExitPoin, 1)}</span>
            <span className="text-[11px] text-emerald-600">Poin</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-800 block">Total Jaspel Alokasi</span>
          <span className="text-sm font-bold font-mono text-emerald-700 block mt-1 truncate" title={formatRupiah(sumJaspelRp)}>
            {formatRupiah(sumJaspelRp)}
          </span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-amber-200 bg-amber-50/40 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-800 block">Total PFK BPJS Dasar</span>
          <span className="text-sm font-bold font-mono text-amber-700 block mt-1 truncate" title={formatRupiah(sumPfkRp)}>
            {formatRupiah(sumPfkRp)}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search by Name */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, pendidikan, status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Search by Program */}
          <div className="relative min-w-[200px]">
            <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-teal-600" />
            <input
              type="text"
              placeholder="Filter nama program (KIA, TB, Gizi...)"
              value={programFilterTerm}
              onChange={(e) => setProgramFilterTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-teal-50/30 border border-teal-200 rounded-lg text-xs focus:bg-white focus:border-teal-500 focus:outline-hidden text-teal-900"
            />
          </div>
        </div>

        {/* Status Filter Buttons & Program Name Toggle */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowProgramNames(!showProgramNames)}
            className={`inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showProgramNames 
                ? 'bg-teal-50 border-teal-300 text-teal-800' 
                : 'bg-slate-100 border-slate-300 text-slate-600'
            }`}
            title="Sembunyikan atau tampilkan label nama program di bawah angka poin"
          >
            {showProgramNames ? <Eye className="w-3.5 h-3.5 text-teal-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
            <span>Nama Program</span>
          </button>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {(['ALL', 'PNS', 'PPPK', 'Honorer'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? 'Semua' : st === 'Honorer' ? 'NON ASN' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table: Exact Layout from Excel AJP Screenshot */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
        <div className="p-3 bg-slate-100 border-b border-slate-300 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Matriks Data Hitung Poin Lengkap (Excel AJP Format)
            </span>
          </div>
          <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-mono">
            {programFilterTerm && (
              <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Filter Program: &quot;{programFilterTerm}&quot;
              </span>
            )}
            <span>Menampilkan {filteredRows.length} dari {totalPegawai} pegawai</span>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[750px] custom-scrollbar">
          <table className="w-full border-collapse text-[11px] font-sans leading-tight">
            {/* Header Row 1 */}
            <thead className="bg-slate-200 text-slate-800 font-bold sticky top-0 z-20 shadow-xs">
              <tr className="border-b border-slate-300">
                <th rowSpan={2} className="border border-slate-400 px-2 py-2 text-center w-10 sticky left-0 bg-slate-200 z-30">
                  NO
                </th>
                <th rowSpan={2} className="border border-slate-400 px-3 py-2 text-center min-w-[200px] sticky left-10 bg-slate-200 z-30">
                  NAMA
                </th>
                <th rowSpan={2} className="border border-slate-400 px-2 py-2 text-center w-14">
                  Pendidikan
                </th>
                <th rowSpan={2} className="border border-slate-400 px-2 py-2 text-center w-24">
                  TMT
                </th>
                <th colSpan={3} className="border border-slate-400 py-1 px-1 text-center bg-slate-100">
                  JML Masa Kerja
                </th>
                <th colSpan={3} className="border border-slate-400 py-1 px-1 text-center bg-yellow-100/70 text-slate-900">
                  VARIABEL KEHADIRAN
                </th>
                <th colSpan={4} className="border border-slate-400 py-1 px-1 text-center bg-slate-100 font-bold">
                  VARIABEL NILAI
                </th>
                {/* TANGGUNG JAWAB PROGRAM: Super header covering PJ PROG, PROGRAM 1, TAMBAHAN 1..4 & TOTAL PROG */}
                <th colSpan={7} className="border border-slate-400 py-1.5 px-1 text-center bg-teal-100 text-teal-950 font-black tracking-wide">
                  TANGGUNG JAWAB PROGRAM
                </th>
                <th colSpan={2} className="border border-slate-400 py-1 px-1 text-center bg-blue-50 text-blue-900">
                  STATUS KEPEGAWAIAN
                </th>
                <th rowSpan={2} className="border border-slate-400 px-2 py-2 text-center w-18 bg-emerald-100 text-emerald-950 font-black">
                  TOTAL POINT
                </th>
                <th rowSpan={2} className="border border-slate-400 px-2 py-2 text-center w-24 bg-cyan-50 text-cyan-950">
                  Poin Kehadiran<br />
                  <span className="text-[9px] font-normal">(Presensi x JML Poin)/100</span>
                </th>
                <th colSpan={2} className="border border-slate-400 py-1 px-1 text-center bg-slate-100">
                  VARIABEL KINERJA
                </th>
                <th rowSpan={2} className="border border-slate-400 px-2 py-2 text-center w-24 bg-indigo-50 text-indigo-950 font-bold">
                  POIN KINERJA<br />
                  <span className="text-[9px] font-normal">(Poin Kehadiran x Kinerja)/100</span>
                </th>
                <th colSpan={2} className="border border-slate-400 py-1 px-1 text-center bg-purple-50 text-purple-900">
                  VARIABEL MASA KERJA (NON ASN)
                </th>
                <th rowSpan={2} className="border border-slate-400 px-2 py-2 text-center w-20 bg-emerald-200 text-emerald-950 font-black">
                  EXIT POIN
                </th>
                <th rowSpan={2} className="border border-slate-400 px-3 py-2 text-center min-w-[110px] bg-emerald-100 text-emerald-950 font-black">
                  JASA PELAYANAN
                </th>
                <th colSpan={2} className="border border-slate-400 py-1 px-1 text-center bg-amber-200 text-amber-950 font-bold">
                  PERHITUNGAN PFK BPJS
                </th>
              </tr>

              {/* Header Row 2 */}
              <tr className="border-b border-slate-400 text-center text-[10px]">
                {/* JML Masa Kerja */}
                <th className="border border-slate-400 px-1 py-1 w-10 bg-slate-100 font-semibold">Th</th>
                <th className="border border-slate-400 px-1 py-1 w-10 bg-slate-100 font-semibold">Bln</th>
                <th className="border border-slate-400 px-1 py-1 w-10 bg-slate-100 font-semibold">Hari</th>

                {/* Variabel Kehadiran */}
                <th className="border border-slate-400 px-1.5 py-1 w-12 bg-yellow-100 text-yellow-950 font-bold">PRESENSI</th>
                <th className="border border-slate-400 px-1.5 py-1 w-12 bg-yellow-100 text-yellow-950 font-bold">HARI KERJA</th>
                <th className="border border-slate-400 px-1.5 py-1 w-14 bg-yellow-100 text-yellow-950 font-bold">PROSENTASE (%)</th>

                {/* Variabel Nilai */}
                <th className="border border-slate-400 px-1.5 py-1 w-18 bg-slate-50 font-semibold">JENIS KETENAGAAN</th>
                <th className="border border-slate-400 px-1.5 py-1 w-14 bg-slate-50 font-semibold">MASA KERJA</th>
                <th className="border border-slate-400 px-1.5 py-1 w-20 bg-slate-50 font-semibold">RANGKAP TUGAS ADMIN</th>
                <th className={`border border-slate-400 px-1.5 py-1 w-24 ${
                  poinConfig.tugasTambahanEnabled !== false ? 'bg-purple-100/80 text-purple-950 font-bold' : 'bg-slate-200 text-slate-500'
                }`}>
                  TUGAS TAMBAHAN (KEL. 7)
                  <span className="block text-[8.5px] font-normal mt-0.5">
                    {poinConfig.tugasTambahanEnabled !== false ? '● Aktif' : '○ Nonaktif'}
                  </span>
                </th>

                {/* Tanggung Jawab Program Sub-Columns */}
                <th className="border border-slate-400 px-1.5 py-1 min-w-[70px] bg-teal-50 text-teal-950 font-bold">PJ PROGRAM</th>
                <th className="border border-slate-400 px-1.5 py-1 min-w-[70px] bg-teal-50 text-teal-950 font-bold">PROGRAM 1</th>
                <th className="border border-slate-400 px-1.5 py-1 min-w-[70px] bg-teal-50 text-teal-950 font-bold">TAMBAHAN 1</th>
                <th className="border border-slate-400 px-1.5 py-1 min-w-[70px] bg-teal-50 text-teal-950 font-bold">TAMBAHAN 2</th>
                <th className="border border-slate-400 px-1.5 py-1 min-w-[70px] bg-teal-50 text-teal-950 font-bold">TAMBAHAN 3</th>
                <th className="border border-slate-400 px-1.5 py-1 min-w-[70px] bg-teal-50 text-teal-950 font-bold">TAMBAHAN 4</th>
                <th className="border border-slate-400 px-1.5 py-1 w-14 bg-teal-200 text-teal-950 font-black">TOTAL PROGRAM</th>

                {/* Status Kepegawaian */}
                <th className="border border-slate-400 px-1.5 py-1 w-16 bg-blue-50 text-blue-950">STATUS</th>
                <th className="border border-slate-400 px-1.5 py-1 w-12 bg-blue-50 text-blue-950">NILAI</th>

                {/* Variabel Kinerja */}
                <th className="border border-slate-400 px-1.5 py-1 w-16 bg-slate-100">URAIAN</th>
                <th className="border border-slate-400 px-1.5 py-1 w-12 bg-slate-100">Nilai</th>

                {/* Variabel Masa Kerja (NON ASN) */}
                <th className="border border-slate-400 px-1.5 py-1 w-16 bg-purple-50 text-purple-950">Masa Kerja (Bulan)</th>
                <th className="border border-slate-400 px-1.5 py-1 w-18 bg-purple-50 text-purple-950">Prosentase Masa Kerja</th>

                {/* Perhitungan PFK BPJS */}
                <th className="border border-slate-400 px-2 py-1 w-24 bg-amber-100 text-amber-950 font-bold">
                  TOTAL POIN TANPA KEHADIRAN
                </th>
                <th className="border border-slate-400 px-2 py-1 w-28 bg-amber-100 text-amber-950 font-bold">
                  PFK BPJS (Rp.)
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-300">
              {filteredRows.map((r, idx) => (
                <tr key={`${r.id || 'row'}-${idx}`} className="hover:bg-slate-50 transition-colors">
                  {/* NO (Sticky) */}
                  <td className="border border-slate-300 text-center font-mono py-1.5 px-1 text-slate-500 sticky left-0 bg-white z-10">
                    {idx + 1}
                  </td>

                  {/* NAMA (Sticky) */}
                  <td className="border border-slate-300 py-1.5 px-2 font-semibold text-slate-900 sticky left-10 bg-white z-10 whitespace-nowrap">
                    {r.nama}
                  </td>

                  {/* Pendidikan */}
                  <td className="border border-slate-300 text-center py-1.5 px-1 font-mono text-slate-700">
                    {r.pendidikan}
                  </td>

                  {/* TMT */}
                  <td className="border border-slate-300 text-center py-1.5 px-1 font-mono text-slate-600 whitespace-nowrap">
                    {r.tmt}
                  </td>

                  {/* JML Masa Kerja: Th, Bln, Hari */}
                  <td className="border border-slate-300 text-center font-mono py-1.5 px-1 text-slate-800">
                    {r.masaKerjaTh}
                  </td>
                  <td className="border border-slate-300 text-center font-mono py-1.5 px-1 text-slate-600">
                    {r.masaKerjaBln}
                  </td>
                  <td className="border border-slate-300 text-center font-mono py-1.5 px-1 text-slate-600">
                    {r.masaKerjaHari}
                  </td>

                  {/* Variabel Kehadiran: Presensi, Hari Kerja, % */}
                  <td className="border border-slate-300 text-center font-mono font-bold py-1.5 px-1 bg-yellow-50 text-slate-900">
                    {r.presensi}
                  </td>
                  <td className="border border-slate-300 text-center font-mono py-1.5 px-1 bg-yellow-50 text-slate-600">
                    {r.hariKerja}
                  </td>
                  <td className="border border-slate-300 text-center font-mono font-bold py-1.5 px-1 bg-yellow-50 text-slate-900">
                    {r.prosentaseKehadiran}
                  </td>

                  {/* Jenis Ketenagaan */}
                  <td className="border border-slate-300 text-center font-mono font-bold py-1.5 px-1 text-slate-800">
                    {r.poinKetenagaan}
                  </td>

                  {/* Masa Kerja */}
                  <td className="border border-slate-300 text-center font-mono font-semibold py-1.5 px-1 text-slate-800">
                    {r.poinMasaKerja}
                  </td>

                  {/* Rangkap Tugas Admin */}
                  <td className="border border-slate-300 text-center font-mono py-1.5 px-1 text-slate-800">
                    {r.poinRangkapTugas > 0 ? r.poinRangkapTugas : ''}
                  </td>

                  {/* Tugas Tambahan (Kel. 7) */}
                  <td className="border border-slate-300 text-center py-1 px-1 bg-purple-50/50 text-purple-950">
                    <div className="font-mono font-bold">{r.poinTugasTambahan > 0 ? r.poinTugasTambahan : ''}</div>
                    {showProgramNames && r.namaTugasTambahan && r.namaTugasTambahan !== '-' && (
                      <div className="text-[9px] text-purple-800 font-medium truncate max-w-[90px] mx-auto mt-0.5 bg-purple-100/60 px-1 py-0.2 rounded" title={r.namaTugasTambahan}>
                        {r.namaTugasTambahan}
                      </div>
                    )}
                  </td>

                  {/* TANGGUNG JAWAB PROGRAM: Detail Pemegang Program */}
                  {/* PJ PROG */}
                  <td className="border border-slate-300 text-center py-1 px-1 bg-teal-50/40 text-teal-950">
                    <div className="font-mono font-bold">{r.poinPjProg > 0 ? r.poinPjProg : ''}</div>
                    {showProgramNames && r.namaPjProg && r.namaPjProg !== '-' && (
                      <div className="text-[9px] text-teal-800 font-medium truncate max-w-[90px] mx-auto mt-0.5 bg-teal-100/60 px-1 py-0.2 rounded" title={r.namaPjProg}>
                        {r.namaPjProg}
                      </div>
                    )}
                  </td>

                  {/* PROGRAM 1 */}
                  <td className="border border-slate-300 text-center py-1 px-1 bg-teal-50/40 text-teal-950">
                    <div className="font-mono font-bold">{r.poinProg1 > 0 ? r.poinProg1 : ''}</div>
                    {showProgramNames && r.namaProg1 && r.namaProg1 !== '-' && (
                      <div className="text-[9px] text-teal-800 font-medium truncate max-w-[90px] mx-auto mt-0.5 bg-teal-100/60 px-1 py-0.2 rounded" title={r.namaProg1}>
                        {r.namaProg1}
                      </div>
                    )}
                  </td>

                  {/* TAMBAHAN 1 (Program 2) */}
                  <td className="border border-slate-300 text-center py-1 px-1 bg-teal-50/40 text-teal-950">
                    <div className="font-mono font-bold">{r.poinProg2 > 0 ? r.poinProg2 : ''}</div>
                    {showProgramNames && r.namaProg2 && r.namaProg2 !== '-' && (
                      <div className="text-[9px] text-teal-800 font-medium truncate max-w-[90px] mx-auto mt-0.5 bg-teal-100/60 px-1 py-0.2 rounded" title={r.namaProg2}>
                        {r.namaProg2}
                      </div>
                    )}
                  </td>

                  {/* TAMBAHAN 2 (Program 3) */}
                  <td className="border border-slate-300 text-center py-1 px-1 bg-teal-50/40 text-teal-950">
                    <div className="font-mono font-bold">{r.poinProg3 > 0 ? r.poinProg3 : ''}</div>
                    {showProgramNames && r.namaProg3 && r.namaProg3 !== '-' && (
                      <div className="text-[9px] text-teal-800 font-medium truncate max-w-[90px] mx-auto mt-0.5 bg-teal-100/60 px-1 py-0.2 rounded" title={r.namaProg3}>
                        {r.namaProg3}
                      </div>
                    )}
                  </td>

                  {/* TAMBAHAN 3 (Program 4) */}
                  <td className="border border-slate-300 text-center py-1 px-1 bg-teal-50/40 text-teal-950">
                    <div className="font-mono font-bold">{r.poinProg4 && r.poinProg4 > 0 ? r.poinProg4 : ''}</div>
                    {showProgramNames && r.namaProg4 && r.namaProg4 !== '-' && (
                      <div className="text-[9px] text-teal-800 font-medium truncate max-w-[90px] mx-auto mt-0.5 bg-teal-100/60 px-1 py-0.2 rounded" title={r.namaProg4}>
                        {r.namaProg4}
                      </div>
                    )}
                  </td>

                  {/* TAMBAHAN 4 (Program 5) */}
                  <td className="border border-slate-300 text-center py-1 px-1 bg-teal-50/40 text-teal-950">
                    <div className="font-mono font-bold">{r.poinProg5 && r.poinProg5 > 0 ? r.poinProg5 : ''}</div>
                    {showProgramNames && r.namaProg5 && r.namaProg5 !== '-' && (
                      <div className="text-[9px] text-teal-800 font-medium truncate max-w-[90px] mx-auto mt-0.5 bg-teal-100/60 px-1 py-0.2 rounded" title={r.namaProg5}>
                        {r.namaProg5}
                      </div>
                    )}
                  </td>

                  {/* TOTAL POIN PROGRAM */}
                  <td className="border border-slate-300 text-center font-mono font-black py-1.5 px-1 bg-teal-100/80 text-teal-950">
                    {r.totalProgram > 0 ? formatNumber(r.totalProgram, 2) : '-'}
                  </td>

                  {/* Status Kepegawaian */}
                  <td className="border border-slate-300 text-center py-1.5 px-1 text-[10px] font-bold text-slate-700">
                    {r.statusKepegawaian === 'Honorer' ? 'NON ASN' : r.statusKepegawaian}
                  </td>
                  <td className="border border-slate-300 text-center font-mono py-1.5 px-1 text-slate-800">
                    {r.statusNilai}
                  </td>

                  {/* TOTAL POINT */}
                  <td className="border border-slate-300 text-center font-mono font-black py-1.5 px-1 bg-emerald-50 text-emerald-950">
                    {formatNumber(r.totalPoint, 2)}
                  </td>

                  {/* Poin Kehadiran */}
                  <td className="border border-slate-300 text-center font-mono font-bold py-1.5 px-1 bg-cyan-50 text-cyan-950">
                    {formatNumber(r.poinKehadiran, 2)}
                  </td>

                  {/* Variabel Kinerja */}
                  <td className="border border-slate-300 text-center py-1.5 px-1 text-[10px] text-slate-700">
                    {r.kinerjaUraian}
                  </td>
                  <td className="border border-slate-300 text-center font-mono py-1.5 px-1 text-slate-800">
                    {r.kinerjaNilai}
                  </td>

                  {/* POIN KINERJA */}
                  <td className="border border-slate-300 text-center font-mono font-bold py-1.5 px-1 bg-indigo-50 text-indigo-950">
                    {formatNumber(r.poinKinerja, 2)}
                  </td>

                  {/* Variabel Masa Kerja (NON ASN) */}
                  <td className="border border-slate-300 text-center font-mono py-1.5 px-1 text-slate-600">
                    {r.masaKerjaBulan}
                  </td>
                  <td className="border border-slate-300 text-center font-mono py-1.5 px-1 text-slate-800">
                    {r.prosentaseMasaKerja}
                  </td>

                  {/* EXIT POIN */}
                  <td className="border border-slate-300 text-center font-mono font-black py-1.5 px-1 bg-emerald-100 text-emerald-950">
                    {formatNumber(r.exitPoin, 2)}
                  </td>

                  {/* JASA PELAYANAN (Rp.) */}
                  <td className="border border-slate-300 text-right font-mono font-bold py-1.5 px-2 text-emerald-900 bg-emerald-50 whitespace-nowrap">
                    {formatRupiah(r.jasaPelayanan)}
                  </td>

                  {/* TOTAL POIN TANPA KEHADIRAN (PFK BPJS Dasar) */}
                  <td className="border border-slate-300 text-center font-mono font-black py-1.5 px-1.5 bg-amber-50 text-amber-950">
                    {formatNumber(r.totalPoinTanpaKehadiran, 4)}
                  </td>

                  {/* PFK BPJS (Rp.) */}
                  <td className="border border-slate-300 text-right font-mono font-bold py-1.5 px-2 text-amber-900 bg-amber-50 whitespace-nowrap">
                    {formatRupiah(r.pfkBpjs)}
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Table Footer Summary */}
            <tfoot className="bg-slate-200 font-bold border-t-2 border-slate-400 sticky bottom-0 z-20">
              <tr>
                <td colSpan={2} className="border border-slate-400 px-3 py-2 text-center text-xs sticky left-0 bg-slate-200 z-30 uppercase tracking-wide">
                  TOTAL KESELURUHAN
                </td>
                <td colSpan={13} className="border border-slate-400 px-2 py-2 text-right text-slate-600 text-[10px]">
                  REKAPITULASI:
                </td>
                <td colSpan={5} className="border border-slate-400"></td>
                <td className="border border-slate-400 text-center font-mono text-xs font-black text-teal-950 bg-teal-200">
                  {formatNumber(sumTotalProgramPoints, 2)}
                </td>
                <td colSpan={2} className="border border-slate-400"></td>
                <td className="border border-slate-400 text-center font-mono text-xs font-black text-emerald-950 bg-emerald-200">
                  {formatNumber(sumTotalPoints, 2)}
                </td>
                <td className="border border-slate-400 text-center font-mono text-xs font-bold text-cyan-950 bg-cyan-100">
                  {formatNumber(sumPoinKehadiran, 2)}
                </td>
                <td colSpan={2} className="border border-slate-400"></td>
                <td className="border border-slate-400 text-center font-mono text-xs font-bold text-indigo-950 bg-indigo-100">
                  {formatNumber(sumPoinKinerja, 2)}
                </td>
                <td colSpan={2} className="border border-slate-400"></td>
                <td className="border border-slate-400 text-center font-mono text-xs font-black text-emerald-950 bg-emerald-300">
                  {formatNumber(sumExitPoin, 2)}
                </td>
                <td className="border border-slate-400 text-right font-mono text-xs font-black text-emerald-950 bg-emerald-200 whitespace-nowrap px-2">
                  {formatRupiah(sumJaspelRp)}
                </td>
                <td className="border border-slate-400 text-center font-mono text-xs font-black text-amber-950 bg-amber-200">
                  {formatNumber(sumPfkPoin, 2)}
                </td>
                <td className="border border-slate-400 text-right font-mono text-xs font-black text-amber-950 bg-amber-200 whitespace-nowrap px-2">
                  {formatRupiah(sumPfkRp)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Program Holders Summary Modal */}
      {showProgramModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Daftar Pemegang Program Puskesmas
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Rincian detail nama pegawai dan pemegang tanggung jawab program kesehatan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProgramModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 divide-y divide-slate-100">
              {programHoldersSummary.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Belum ada data pemegang program yang tercatat pada Master Karyawan.
                </div>
              ) : (
                programHoldersSummary.map(([progName, holders], idx) => (
                  <div key={`${progName}-${idx}`} className="pt-3 first:pt-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {progName}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {holders.length} Pegawai
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                      {holders.map((h, i) => (
                        <div key={i} className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-slate-800 block truncate">{h.employeeName}</span>
                            <span className="text-[10px] text-slate-500">{h.roleType}</span>
                          </div>
                          <span className="font-mono font-bold text-teal-700 bg-white px-1.5 py-0.5 rounded border border-teal-100">
                            +{h.poin} Poin
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowProgramModal(false)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
