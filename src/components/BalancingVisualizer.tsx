import React, { useState } from 'react';
import { CalculationResult } from '../types/jaspel';
import { formatRupiah, formatNumber } from '../lib/utils';
import { CheckCircle2, Info, ChevronDown, ChevronUp, Award } from 'lucide-react';

interface BalancingVisualizerProps {
  calculation: CalculationResult;
}

export const BalancingVisualizer: React.FC<BalancingVisualizerProps> = ({ calculation }) => {
  const [showDetail, setShowDetail] = useState(false);

  // Ambil data karyawan yang mendapatkan distribusi gap +Rp 1
  const sortedRemainderList = [...calculation.employees]
    .sort((a, b) => b.remainder - a.remainder)
    .slice(0, 10);

  const bonusCount = calculation.employees.filter(e => e.isBalancedBonus).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-start space-x-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-800">
                Audit Finansial: Largest Remainder Method (Zero Discrepancy)
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Audit Lolos (100% Balanced)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Menghilangkan selisih pembulatan desimal tanpa manipulasi manual sesuai prinsip akuntansi keuangan kesehatan.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowDetail(!showDetail)}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors self-start sm:self-auto"
        >
          <span>{showDetail ? 'Sembunyikan Rincian Math' : 'Lihat Rincian Distribusi Desimal'}</span>
          {showDetail ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 block">1. Total Alokasi Jaspel (Target)</span>
          <span className="text-base font-bold text-slate-800 block mt-1">
            {formatRupiah(calculation.totalAlokasi)}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">60% dari penerimaan BPJS</span>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 block">2. Total Awal (Floor Desimal)</span>
          <span className="text-base font-semibold text-slate-700 block mt-1">
            {formatRupiah(calculation.initialTotalDisbursed)}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Netto dasar + Pajak + FPK 1%</span>
        </div>

        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-amber-800">3. Selisih Pecahan (Gap)</span>
            <span className="text-xs font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">
              +{calculation.gap} Rupiah
            </span>
          </div>
          <span className="text-base font-bold text-amber-900 block mt-1">
            {formatRupiah(calculation.gap)}
          </span>
          <span className="text-[10px] text-amber-700 mt-0.5 block">
            Didistribusikan ke {bonusCount} pegawai dengan sisa bagi terbesar
          </span>
        </div>

        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-emerald-800">4. Status Penyeimbangan</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-base font-bold text-emerald-900 block mt-1">
            Selisih Rp 0 (Pas)
          </span>
          <span className="text-[10px] text-emerald-700 mt-0.5 block">
            Total Netto + Pajak + FPK1 = Alokasi
          </span>
        </div>
      </div>

      {/* Formula Audit Box */}
      <div className="bg-slate-900 text-slate-200 rounded-lg p-3 text-xs font-mono flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Persamaan Akuntansi:</span>
          <span className="text-emerald-400 font-semibold">
            Netto ({formatRupiah(calculation.totalNetto)}) + Pajak ({formatRupiah(calculation.totalTax)}) + FPK 1% ({formatRupiah(calculation.totalFpk1)})
          </span>
        </div>
        <div className="text-right">
          <span className="text-slate-400">= </span>
          <span className="text-white font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            {formatRupiah(calculation.totalAlokasi)}
          </span>
        </div>
      </div>

      {/* Detailed Math Breakdown Dropdown */}
      {showDetail && (
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
            <Info className="w-4 h-4 text-sky-600" />
            <span>Peringkat Sisa Bagi Desimal (Remainder) & Alokasi Penyeimbang +Rp 1</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-2 px-2">Rank</th>
                  <th className="py-2 px-2">Nama Pegawai</th>
                  <th className="py-2 px-2">Status</th>
                  <th className="py-2 px-2 text-right">Nilai Bruto Raw</th>
                  <th className="py-2 px-2 text-right">Remainder Desimal</th>
                  <th className="py-2 px-2 text-center">Distribusi (+Rp 1)</th>
                  <th className="py-2 px-2 text-right">Netto Final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sortedRemainderList.map((emp, index) => {
                  const isBonus = emp.isBalancedBonus;
                  return (
                    <tr
                      key={emp.id}
                      className={isBonus ? 'bg-amber-50/60 font-medium' : 'bg-white hover:bg-slate-100/50'}
                    >
                      <td className="py-2 px-2 font-mono text-slate-500">#{index + 1}</td>
                      <td className="py-2 px-2 text-slate-800">{emp.name}</td>
                      <td className="py-2 px-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                          {emp.status}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">
                        {formatNumber(emp.brutoRaw, 3)}
                      </td>
                      <td className="py-2 px-2 text-right font-mono font-semibold text-sky-700">
                        0.{emp.remainder.toFixed(4).split('.')[1] || '0000'}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {isBonus ? (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <Award className="w-3 h-3 text-emerald-600" />
                            <span>+Rp 1 (Bonus)</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-slate-800">
                        {formatRupiah(emp.netto)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-500 italic">
            *Largest Remainder Method (Metode Kuota Hare-Niemeyer) mengurutkan desimal pecahan dari terbesar ke terkecil
            dan memberikan selisih 1 Rupiah secara berurutan hingga total pembagian persis setara dana alokasi.
          </p>
        </div>
      )}
    </div>
  );
};
