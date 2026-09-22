import React, { useState } from 'react';
import { CalculationResult, CalculatedEmployee, KapitasiSetup } from '../types/jaspel';
import { formatRupiah, formatNumber, formatPercent, downloadCSV } from '../lib/utils';
import { BalancingVisualizer } from './BalancingVisualizer';
import { 
  Download, 
  Search, 
  FileText, 
  Database, 
  Sparkles, 
  Printer,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

interface JaspelTableProps {
  calculation: CalculationResult;
  setup: KapitasiSetup;
  onOpenSlip: (employee: CalculatedEmployee) => void;
  onPushToGoogleSheets?: () => Promise<void>;
  isSyncingToSheets?: boolean;
}

export const JaspelTable: React.FC<JaspelTableProps> = ({
  calculation,
  setup,
  onOpenSlip,
  onPushToGoogleSheets,
  isSyncingToSheets = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PNS' | 'PPPK' | 'Honorer'>('ALL');
  const [showFpk4Info, setShowFpk4Info] = useState(false);

  // Filter employees
  const filteredEmployees = calculation.employees.filter(emp => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.jabatan.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Export CSV Hasil Perhitungan (Persis struktur Google Sheets Hasil_Perhitungan)
  const handleExportCSV = () => {
    const headers = [
      'Bulan',
      'Tahun',
      'NIP',
      'Nama',
      'Status_ASN',
      'Poin_Efektif',
      'Bruto',
      'Pajak',
      'FPK1',
      'FPK4',
      'Netto_Transfer',
    ];

    const rows = calculation.employees.map(emp => [
      setup.bulan,
      setup.tahun,
      emp.nip,
      emp.name,
      emp.status,
      formatNumber(emp.individualPoints, 2),
      Math.round(emp.brutoRaw),
      emp.tax,
      emp.fpk1,
      emp.fpk4,
      emp.netto,
    ]);

    downloadCSV(`Hasil_Jaspel_${setup.bulan}_${setup.tahun}.csv`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* 6 Metric Executive Dashboard Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 block">Total Dana Alokasi</span>
          <span className="text-base font-bold text-slate-900 block mt-1">
            {formatRupiah(calculation.totalAlokasi)}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">
            {setup.alokasiPersen}% dari Dana Kapitasi
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 block">Total Bruto Dihitung</span>
          <span className="text-base font-bold text-slate-800 block mt-1">
            {formatRupiah(calculation.totalBruto)}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            {calculation.employees.length} Tenaga Kesehatan
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 block">Potongan Pajak PPh 21</span>
          <span className="text-base font-bold text-rose-700 block mt-1">
            {formatRupiah(calculation.totalTax)}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Disetor ke Kas Negara
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 block">Potongan FPK 1% Pegawai</span>
          <span className="text-base font-bold text-amber-700 block mt-1">
            {formatRupiah(calculation.totalFpk1)}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Iuran BPJS Kesehatan (ASN)
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm relative">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Iuran FPK 4% Pemda</span>
            <button
              onClick={() => setShowFpk4Info(!showFpk4Info)}
              className="text-slate-400 hover:text-slate-600"
              title="Informasi Iuran Pemda"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-base font-bold text-sky-700 block mt-1">
            {formatRupiah(calculation.totalFpk4)}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Tanggungan APBD / Pemda
          </span>
        </div>

        <div className="bg-slate-900 rounded-xl p-4 shadow-sm text-white">
          <span className="text-[11px] font-medium text-slate-300 block">Total Netto Ditransfer</span>
          <span className="text-base font-bold text-emerald-400 block mt-1">
            {formatRupiah(calculation.totalNetto)}
          </span>
          <span className="text-[10px] text-emerald-300 font-medium mt-0.5 block">
            Payroll Rekening Bank
          </span>
        </div>
      </div>

      {/* Info Popover for FPK 4% */}
      {showFpk4Info && (
        <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 text-xs text-sky-800 flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Ketentuan FPK 1% dan 4% (Perpres Jaminan Kesehatan):</span>
            <p className="mt-0.5 text-sky-700">
              FPK 1% dipotong langsung dari Jaspel Pegawai ASN (PNS & PPPK), sedangkan FPK 4% adalah iuran kewajiban
              pemberi kerja (Pemerintah Daerah / APBD) yang dihitung berdasarkan nominal bruto bayangan (shadow) tanpa
              pengurangan absensi. Pegawai Honorer/Non-ASN tidak dikenakan pemotongan FPK.
            </p>
          </div>
        </div>
      )}

      {/* Largest Remainder Balancing Visualizer */}
      <BalancingVisualizer calculation={calculation} />

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama, NIP, atau jabatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex rounded-lg border border-slate-300 p-0.5 bg-slate-50 text-xs shrink-0">
              {(['ALL', 'PNS', 'PPPK', 'Honorer'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    statusFilter === st
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export CSV</span>
            </button>

            {onPushToGoogleSheets && (
              <button
                onClick={onPushToGoogleSheets}
                disabled={isSyncingToSheets}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50"
              >
                <Database className="w-3.5 h-3.5" />
                <span>{isSyncingToSheets ? 'Menyimpan...' : 'Kirim ke Google Sheets'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 w-10">No</th>
                <th className="py-3 px-3 min-w-[200px]">Nama & Identitas</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Poin Dasar</th>
                <th className="py-3 px-3 text-center">Kehadiran</th>
                <th className="py-3 px-3 text-right">Poin Efektif</th>
                <th className="py-3 px-3 text-right">Rasio (%)</th>
                <th className="py-3 px-3 text-right">Bruto (Rp)</th>
                <th className="py-3 px-3 text-right">PPh 21</th>
                <th className="py-3 px-3 text-right">FPK 1%</th>
                <th className="py-3 px-3 text-right">FPK 4%</th>
                <th className="py-3 px-3 text-right font-bold text-slate-900">Netto Transfer</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-8 text-center text-slate-400">
                    Tidak ada pegawai yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, index) => {
                  return (
                    <tr
                      key={emp.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        emp.isBalancedBonus ? 'bg-emerald-50/20' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono text-slate-400">{index + 1}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-800">{emp.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          NIP: {emp.nip || '-'}
                        </div>
                        <div className="text-[10px] text-slate-500">{emp.jabatan}</div>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            emp.status === 'PNS'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : emp.status === 'PPPK'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}
                        >
                          {emp.status}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-center font-mono font-medium text-slate-700">
                        {emp.points}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <span className="font-mono font-semibold text-slate-800">
                          {emp.attendance}
                        </span>
                        <span className="text-slate-400 text-[10px]">/{emp.maxAttendance}</span>
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                        {formatNumber(emp.individualPoints, 2)}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                        {formatPercent(emp.individualPointRatio)}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-800">
                        {formatRupiah(emp.brutoRaw)}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono text-rose-700">
                        {emp.tax > 0 ? `-${formatRupiah(emp.tax)}` : 'Rp 0'}
                        {emp.taxRate > 0 && (
                          <span className="block text-[9px] text-rose-500">
                            ({(emp.taxRate * 100).toFixed(0)}%)
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono text-amber-700">
                        {emp.fpk1 > 0 ? `-${formatRupiah(emp.fpk1)}` : 'Rp 0'}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono text-sky-700">
                        {emp.fpk4 > 0 ? formatRupiah(emp.fpk4) : 'Rp 0'}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 bg-slate-50/50">
                        <div className="flex items-center justify-end space-x-1">
                          {emp.isBalancedBonus && (
                            <span
                              title="Mendapatkan alokasi +Rp 1 dari Largest Remainder Method"
                              className="text-amber-500 cursor-help"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </span>
                          )}
                          <span>{formatRupiah(emp.netto)}</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => onOpenSlip(emp)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition-colors"
                        >
                          <FileText className="w-3 h-3 text-slate-500" />
                          <span>Slip</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Table Footer with exact sums */}
            <tfoot className="bg-slate-100 text-slate-800 font-bold border-t-2 border-slate-300">
              <tr>
                <td colSpan={5} className="py-3 px-3 text-right text-xs">
                  TOTAL AKUMULASI ({calculation.employees.length} PEGAWAI):
                </td>
                <td className="py-3 px-3 text-right font-mono text-xs">
                  {formatNumber(calculation.totalPoints, 2)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-xs">100.0%</td>
                <td className="py-3 px-3 text-right font-mono text-xs text-slate-900">
                  {formatRupiah(calculation.totalBruto)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-xs text-rose-700">
                  {formatRupiah(calculation.totalTax)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-xs text-amber-700">
                  {formatRupiah(calculation.totalFpk1)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-xs text-sky-700">
                  {formatRupiah(calculation.totalFpk4)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-xs text-emerald-800 bg-emerald-100/60">
                  {formatRupiah(calculation.totalNetto)}
                </td>
                <td className="py-3 px-3 text-center text-xs">
                  <span className="text-[10px] text-emerald-700 font-bold">100% Pas</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
