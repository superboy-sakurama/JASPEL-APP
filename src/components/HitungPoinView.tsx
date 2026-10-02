import React, { useState, useMemo } from 'react';
import { 
  Employee, 
  PoinJaspelConfig, 
  MasaKerjaRule, 
  InstansiConfig, 
  HitungPoinRow 
} from '../types/jaspel';
import { evaluateHitungPoinRow } from '../lib/pointCalculator';
import { downloadHitungPoinExcel } from '../lib/excelHelper';
import { formatNumber } from '../lib/utils';
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
  Sparkles
} from 'lucide-react';

interface HitungPoinViewProps {
  employees: Employee[];
  poinConfig: PoinJaspelConfig;
  masaKerjaRules: MasaKerjaRule[];
  instansi: InstansiConfig;
  bulan: string;
  tahun: number;
  onApplyCalculatedPointsToMaster?: (updatedEmployees: Employee[]) => void;
}

export const HitungPoinView: React.FC<HitungPoinViewProps> = ({
  employees,
  poinConfig,
  masaKerjaRules,
  instansi,
  bulan,
  tahun,
  onApplyCalculatedPointsToMaster,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PNS' | 'PPPK' | 'Honorer'>('ALL');
  const [isAppliedToast, setIsAppliedToast] = useState(false);

  // Evaluasi seluruh baris poin
  const calculatedRows: HitungPoinRow[] = useMemo(() => {
    return employees.map((emp, idx) =>
      evaluateHitungPoinRow(emp, idx, poinConfig, masaKerjaRules)
    );
  }, [employees, poinConfig, masaKerjaRules]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return calculatedRows.filter((r) => {
      const matchSearch =
        r.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.jabatan.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [calculatedRows, searchTerm, statusFilter]);

  // Aggregate metrics
  const totalPegawai = calculatedRows.length;
  const totalPoinPfkBpjs = calculatedRows.reduce((s, r) => s + r.poinPfkBpjs, 0);
  const totalPoinAkhir = calculatedRows.reduce((s, r) => s + r.poinAkhir, 0);
  const rataPoin = totalPegawai > 0 ? totalPoinAkhir / totalPegawai : 0;

  // Handler Download Excel
  const handleExportExcel = () => {
    downloadHitungPoinExcel(calculatedRows, bulan, tahun, instansi.namaInstansi);
  };

  // Handler Sinkronisasi Poin ke Master Karyawan
  const handleApplyToMaster = () => {
    if (!onApplyCalculatedPointsToMaster) return;
    const updated = employees.map((emp, idx) => {
      const row = calculatedRows[idx];
      return {
        ...emp,
        points: row.poinPfkBpjs, // Poin dasar sebelum absensi
        poinBpjs: row.poinPfkBpjs,
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
              Menu 2 Hitung Poin
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Periode {bulan} {tahun}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Lembar Perhitungan Poin Jasa Pelayanan & PFK BPJS
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kompilasi seluruh variabel penilaian: Status ASN, Jabatan, Pendidikan, Tugas Tambahan, Program, Masa Kerja Honorer, dan Bobot Kehadiran.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
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
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Nilai poin dasar telah disinkronkan ke seluruh data Master Karyawan dan siap didistribusikan ke Hasil Balancing!</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Pegawai
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black font-mono text-slate-800">{totalPegawai}</span>
            <span className="text-xs text-slate-400">Orang</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Semua tenaga faskes</span>
        </div>

        <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
              Poin Tanpa Kehadiran (BPJS)
            </span>
            <span className="text-[10px] bg-amber-200/80 text-amber-900 px-1.5 py-0.5 rounded font-bold">PFK BPJS</span>
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black font-mono text-amber-900">
              {formatNumber(totalPoinPfkBpjs, 1)}
            </span>
            <span className="text-xs text-amber-700">Poin</span>
          </div>
          <span className="text-[10px] text-amber-700/80 mt-1 block">Dasar potong iuran 1% & 4% FPK</span>
        </div>

        <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
              Total Poin Tertimbang
            </span>
            <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-1.5 py-0.5 rounded font-bold">Jaspel</span>
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black font-mono text-emerald-900">
              {formatNumber(totalPoinAkhir, 1)}
            </span>
            <span className="text-xs text-emerald-700">Poin</span>
          </div>
          <span className="text-[10px] text-emerald-700/80 mt-1 block">Setelah dikalikan bobot kehadiran</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Rata-rata Poin / Pegawai
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black font-mono text-slate-800">
              {formatNumber(rataPoin, 1)}
            </span>
            <span className="text-xs text-slate-400">Poin</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Indeks produktivitas</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, NIP, atau jabatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-800"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-medium text-slate-500 shrink-0">Status:</span>
          {(['ALL', 'PNS', 'PPPK', 'Honorer'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'Semua' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table: Lembar Hitung Poin */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>Matriks Hitung Poin Komprehensif Seluruh Aspek Data</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Kolom kuning merupakan <strong>Poin Tanpa Kehadiran (PFK BPJS)</strong>, sedangkan kolom hijau adalah <strong>Jumlah Seluruh Poin Akhir</strong> setelah dikalikan prosentase kehadiran.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Menampilkan {filteredRows.length} dari {totalPegawai} pegawai
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-3 py-3 w-10 text-center">No</th>
                <th className="px-3 py-3 min-w-[200px]">Nama Pegawai</th>
                <th className="px-3 py-3 min-w-[150px]">NIP / NIK</th>
                <th className="px-3 py-3 text-center">Pendidikan</th>
                <th className="px-3 py-3 text-center">Status</th>
                <th className="px-3 py-3 min-w-[140px]">Tugas Tambahan / Jabatan</th>
                <th className="px-3 py-3 min-w-[140px]">PJ Program</th>
                <th className="px-3 py-3 text-center">Masa Kerja (TMT)</th>
                <th className="px-3 py-3 text-center">% Masa</th>
                <th className="px-3 py-3 text-right bg-amber-50 text-amber-900 border-x border-amber-200 font-bold" title="Poin tanpa perhitungan kehadiran sebagai dasar perhitungan PFK BPJS">
                  Poin PFK BPJS
                </th>
                <th className="px-3 py-3 text-center">Kehadiran</th>
                <th className="px-3 py-3 text-right bg-emerald-50 text-emerald-900 border-l border-emerald-200 font-bold">
                  Poin Akhir
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.map((r, idx) => {
                const programList = [r.program1, r.program2, r.program3, r.program4, r.program5]
                  .filter((p) => p && p.trim() && p !== '-')
                  .join(', ');

                return (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-3 py-2.5 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="px-3 py-2.5 font-semibold text-slate-900">{r.nama}</td>
                    <td className="px-3 py-2.5 font-mono text-slate-600">{r.nip}</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        {r.pendidikan}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.status === 'PNS'
                            ? 'bg-blue-100 text-blue-800'
                            : r.status === 'PPPK'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">
                      <div className="font-medium">{r.tugasAdmin !== '-' ? r.tugasAdmin : r.jabatan}</div>
                      {r.tugasAdmin !== '-' && (
                        <div className="text-[10px] text-slate-400">{r.jabatan}</div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 max-w-[180px] truncate" title={programList || '-'}>
                      {programList || '-'}
                    </td>
                    <td className="px-3 py-2.5 text-center font-mono text-slate-600 whitespace-nowrap">
                      {r.lamaKerjaThn} Th {r.lamaKerjaBln} Bl
                    </td>
                    <td className="px-3 py-2.5 text-center font-mono font-semibold text-slate-700">
                      {r.prosentaseMasaKerja}%
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-black text-amber-900 bg-amber-50/50 border-x border-amber-200">
                      {formatNumber(r.poinPfkBpjs, 1)}
                    </td>
                    <td className="px-3 py-2.5 text-center font-mono text-slate-600 whitespace-nowrap">
                      <span className="font-semibold text-slate-800">{r.kehadiran}</span> / {r.maxKehadiran} ({((r.kehadiran / r.maxKehadiran) * 100).toFixed(0)}%)
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-black text-emerald-900 bg-emerald-50/50 border-l border-emerald-200">
                      {formatNumber(r.poinAkhir, 2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300">
              <tr>
                <td colSpan={9} className="px-4 py-3 text-right text-slate-700 uppercase tracking-wide text-xs">
                  TOTAL KESELURUHAN:
                </td>
                <td className="px-3 py-3 text-right font-mono text-sm text-amber-900 bg-amber-100/70 border-x border-amber-300">
                  {formatNumber(totalPoinPfkBpjs, 1)}
                </td>
                <td className="px-3 py-3 text-center text-slate-400">-</td>
                <td className="px-3 py-3 text-right font-mono text-sm text-emerald-900 bg-emerald-100/70 border-l border-emerald-300">
                  {formatNumber(totalPoinAkhir, 2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
