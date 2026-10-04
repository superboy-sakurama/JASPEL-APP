import React, { useState } from 'react';
import { CalculatedEmployee, KapitasiSetup, KwitansiPejabat } from '../types/jaspel';
import { formatNumber } from '../lib/utils';
import { exportPfkBpjsToExcel } from '../lib/excelExport';
import { 
  Printer, 
  FileSpreadsheet, 
  Search, 
  Calendar,
  HeartPulse
} from 'lucide-react';

interface PfkBpjsViewProps {
  employees: CalculatedEmployee[];
  setup: KapitasiSetup;
  pejabat: KwitansiPejabat;
  availablePeriods?: { bulan: string; tahun: number; label: string; isLocked?: boolean }[];
  onSelectPeriod?: (bulan: string, tahun: number) => void;
  isPeriodLocked?: boolean;
  selectedPeriodKey?: string;
}

export const PfkBpjsView: React.FC<PfkBpjsViewProps> = ({
  employees,
  setup,
  pejabat,
  availablePeriods = [],
  onSelectPeriod,
  selectedPeriodKey = 'CURRENT',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter hanya tenaga PNS dan PPPK
  const pfkEmployees = employees.filter(
    (emp) => emp.status === 'PNS' || emp.status === 'PPPK'
  );

  const filteredEmployees = pfkEmployees.filter((emp) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      emp.name.toLowerCase().includes(q) ||
      emp.nip.toLowerCase().includes(q) ||
      emp.jabatan.toLowerCase().includes(q)
    );
  });

  let sumJasa = 0;
  let sumThp = 0;
  let sumDpi = 0;
  let sumIuran1 = 0;
  let sumIuran4 = 0;
  let sumIuran5 = 0;

  let pnsIuran1 = 0;
  let pppkIuran1 = 0;
  let pnsIuran4 = 0;
  let pppkIuran4 = 0;

  pfkEmployees.forEach((emp) => {
    const jasaMedis = emp.pfkBpjs || 0;
    const thp = 0;
    const dpi = jasaMedis;
    const i1 = Math.floor(dpi * 0.01);
    const i4 = Math.floor(dpi * 0.04);
    const i5 = i1 + i4;

    sumJasa += jasaMedis;
    sumThp += thp;
    sumDpi += dpi;
    sumIuran1 += i1;
    sumIuran4 += i4;
    sumIuran5 += i5;

    if (emp.status === 'PNS') {
      pnsIuran1 += i1;
      pnsIuran4 += i4;
    } else if (emp.status === 'PPPK') {
      pppkIuran1 += i1;
      pppkIuran4 += i4;
    }
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    exportPfkBpjsToExcel(pfkEmployees, setup, pejabat);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar / Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
              Laporan Resmi • PFK BPJS
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Periode: {setup.bulan} {setup.tahun}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1 flex items-center space-x-2">
            <HeartPulse className="w-5 h-5 text-teal-600" />
            <span>Potongan PFK BPJS (Iuran 1% & 4% PNS & PPPK)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar rincian pemotongan iuran jaminan kesehatan (PFK BPJS) khusus tenaga PNS dan PPPK beserta kontrol perhitungan ebilling.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {availablePeriods.length > 0 && onSelectPeriod && (
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
              <Calendar className="w-4 h-4 text-slate-500 ml-2" />
              <select
                value={selectedPeriodKey}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'CURRENT') {
                    onSelectPeriod(setup.bulan, setup.tahun);
                  } else {
                    const [b, t] = val.split('-');
                    onSelectPeriod(b, Number(t));
                  }
                }}
                className="bg-transparent text-xs font-semibold text-slate-700 px-2 py-1 outline-none"
              >
                <option value="CURRENT">Bulan Aktif ({setup.bulan} {setup.tahun})</option>
                {availablePeriods.map((p) => (
                  <option key={`${p.bulan}-${p.tahun}`} value={`${p.bulan}-${p.tahun}`}>
                    {p.label} {p.isLocked ? '🔒' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari pegawai..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white w-48 focus:w-64 transition-all"
            />
          </div>

          <button
            type="button"
            onClick={handleExport}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Excel</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Paper View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden print:shadow-none print:border-none p-6 sm:p-10 font-sans">
        {/* Header Instansi */}
        <div className="text-center pb-6 border-b-2 border-slate-800 space-y-1">
          <h4 className="text-xs font-bold tracking-widest uppercase text-slate-600">
            PEMERINTAH KABUPATEN
          </h4>
          <h3 className="text-sm font-bold tracking-wider uppercase text-slate-800">
            DINAS KESEHATAN
          </h3>
          <h1 className="text-lg font-black uppercase text-slate-900 tracking-wide">
            {pejabat.namaFaskes || 'UPTD PUSKESMAS'}
          </h1>
          <div className="pt-2">
            <span className="inline-block px-4 py-1 bg-teal-50 text-teal-900 border border-teal-300 rounded-full text-xs font-bold">
              DAFTAR POTONGAN PFK BPJS (IURAN 1% & 4%) TENAGA PNS & PPPK • BULAN {setup.bulan.toUpperCase()} {setup.tahun}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold text-center border border-slate-400">
                <th className="border border-slate-400 px-2 py-2 w-10">No</th>
                <th className="border border-slate-400 px-3 py-2 text-left">Nama Pegawai</th>
                <th className="border border-slate-400 px-3 py-2">NIP (Nomor Induk Pegawai)</th>
                <th className="border border-slate-400 px-2 py-2">Status</th>
                <th className="border border-slate-400 px-3 py-2 text-right">Tunjangan Jasa Layanan Medis</th>
                <th className="border border-slate-400 px-3 py-2 text-right">Total Take Home Pay (THP)</th>
                <th className="border border-slate-400 px-3 py-2 text-right">Dasar Perhitungan Iuran (DPI)</th>
                <th className="border border-slate-400 px-3 py-2 text-right bg-amber-50">Iuran 1%</th>
                <th className="border border-slate-400 px-3 py-2 text-right bg-amber-50">Iuran 4%</th>
                <th className="border border-slate-400 px-3 py-2 text-right bg-amber-100">Total Iuran 5%</th>
              </tr>
              <tr className="bg-slate-50 text-slate-600 text-[10px] font-mono text-center border border-slate-400">
                <th className="border border-slate-400 py-1">1</th>
                <th className="border border-slate-400 py-1">2</th>
                <th className="border border-slate-400 py-1">4</th>
                <th className="border border-slate-400 py-1">-</th>
                <th className="border border-slate-400 py-1">15</th>
                <th className="border border-slate-400 py-1">16</th>
                <th className="border border-slate-400 py-1">17</th>
                <th className="border border-slate-400 py-1 bg-amber-50/50">18 = 17x1%</th>
                <th className="border border-slate-400 py-1 bg-amber-50/50">19 = 17x4%</th>
                <th className="border border-slate-400 py-1 bg-amber-100/50">20 = 18+19</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-slate-400 border border-slate-300">
                    Tidak ada data pegawai PNS atau PPPK yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, idx) => {
                  const jasaMedis = emp.pfkBpjs || 0;
                  const thp = 0;
                  const dpi = jasaMedis;
                  const i1 = Math.floor(dpi * 0.01);
                  const i4 = Math.floor(dpi * 0.04);
                  const i5 = i1 + i4;

                  return (
                    <tr key={`${emp.id}-${idx}`} className="hover:bg-slate-50 transition-colors">
                      <td className="border border-slate-300 px-2 py-1.5 text-center font-mono">{idx + 1}</td>
                      <td className="border border-slate-300 px-3 py-1.5 font-semibold text-slate-900">{emp.name}</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-center font-mono">{emp.nip ? `'${emp.nip}` : '-'}</td>
                      <td className="border border-slate-300 px-2 py-1.5 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          emp.status === 'PNS' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="border border-slate-300 px-3 py-1.5 text-right font-mono">{formatNumber(jasaMedis, 2)}</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-right font-mono text-slate-400">-</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-right font-mono">{formatNumber(dpi, 2)}</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-right font-mono bg-amber-50/40 text-amber-900">{formatNumber(i1, 2)}</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-right font-mono bg-amber-50/40 text-amber-900">{formatNumber(i4, 2)}</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-right font-mono bg-amber-100/50 font-bold text-amber-950">{formatNumber(i5, 2)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold text-slate-900 border border-slate-400">
                <td colSpan={4} className="border border-slate-400 px-3 py-2 text-center uppercase tracking-wider">
                  JUMLAH TOTAL
                </td>
                <td className="border border-slate-400 px-3 py-2 text-right font-mono">{formatNumber(sumJasa, 2)}</td>
                <td className="border border-slate-400 px-3 py-2 text-right font-mono">{formatNumber(sumThp, 2)}</td>
                <td className="border border-slate-400 px-3 py-2 text-right font-mono">{formatNumber(sumDpi, 2)}</td>
                <td className="border border-slate-400 px-3 py-2 text-right font-mono bg-amber-100 text-amber-950">{formatNumber(sumIuran1, 2)}</td>
                <td className="border border-slate-400 px-3 py-2 text-right font-mono bg-amber-100 text-amber-950">{formatNumber(sumIuran4, 2)}</td>
                <td className="border border-slate-400 px-3 py-2 text-right font-mono bg-amber-200 text-amber-950">{formatNumber(sumIuran5, 2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Kontrol Perhitungan (Summary Table) */}
        <div className="mt-10 pt-6 border-t border-slate-300">
          <div className="mb-3">
            <h3 className="text-xs font-bold uppercase text-slate-800 tracking-wider">
              KONTROL PERHITUNGAN PFK BPJS (EBILLING 1% & 4%)
            </h3>
            <p className="text-[11px] text-slate-500">
              Rekapitulasi rincian potongan iuran wajib pegawai negeri (PNS & PPPK) untuk penyetoran ebilling.
            </p>
          </div>

          <table className="w-full sm:w-2/3 border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800 text-white text-center font-bold">
                <th className="border border-slate-600 py-1.5 px-3">Tahun</th>
                <th colSpan={2} className="border border-slate-600 py-1.5 px-3 bg-teal-800">Ebilling 1%</th>
                <th colSpan={2} className="border border-slate-600 py-1.5 px-3 bg-indigo-800">Ebilling 4%</th>
              </tr>
              <tr className="bg-slate-200 text-slate-800 text-center font-bold text-[11px]">
                <th className="border border-slate-400 py-1"></th>
                <th className="border border-slate-400 py-1 w-28">PNS</th>
                <th className="border border-slate-400 py-1 w-28">PPPK</th>
                <th className="border border-slate-400 py-1 w-28">PNS</th>
                <th className="border border-slate-400 py-1 w-28">PPPK</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 py-1.5 px-3 text-center font-mono font-bold bg-slate-50">{setup.tahun}</td>
                <td className="border border-slate-300 py-1.5 px-3 text-right font-mono">{formatNumber(pnsIuran1, 2)}</td>
                <td className="border border-slate-300 py-1.5 px-3 text-right font-mono">{formatNumber(pppkIuran1, 2)}</td>
                <td className="border border-slate-300 py-1.5 px-3 text-right font-mono">{formatNumber(pnsIuran4, 2)}</td>
                <td className="border border-slate-300 py-1.5 px-3 text-right font-mono">{formatNumber(pppkIuran4, 2)}</td>
              </tr>
              <tr className="bg-slate-100 font-bold">
                <td className="border border-slate-300 py-1.5 px-3 text-center uppercase">Sub Total</td>
                <td className="border border-slate-300 py-1.5 px-3 text-right font-mono">{formatNumber(pnsIuran1, 2)}</td>
                <td className="border border-slate-300 py-1.5 px-3 text-right font-mono">{formatNumber(pppkIuran1, 2)}</td>
                <td className="border border-slate-300 py-1.5 px-3 text-right font-mono">{formatNumber(pnsIuran4, 2)}</td>
                <td className="border border-slate-300 py-1.5 px-3 text-right font-mono">{formatNumber(pppkIuran4, 2)}</td>
              </tr>
              <tr className="bg-amber-50 font-bold text-amber-950">
                <td className="border border-slate-400 py-2 px-3 text-center uppercase">JUMLAH TOTAL</td>
                <td colSpan={2} className="border border-slate-400 py-2 px-3 text-center font-mono text-sm">
                  {formatNumber(pnsIuran1 + pppkIuran1, 2)}
                </td>
                <td colSpan={2} className="border border-slate-400 py-2 px-3 text-center font-mono text-sm">
                  {formatNumber(pnsIuran4 + pppkIuran4, 2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tanda Tangan / Signatures */}
        <div className="mt-12 pt-6 grid grid-cols-2 gap-8 text-center text-xs page-break-inside-avoid">
          <div>
            <p className="text-slate-600 mb-16 font-medium">Mengetahui,<br/>Kuasa Pengguna Anggaran (KPA)</p>
            <p className="font-bold underline text-slate-900">{pejabat.kpaNama || 'dr. Hj. Nama KPA, M.Kes'}</p>
            <p className="font-mono text-[11px] text-slate-600 mt-0.5">NIP. {pejabat.kpaNip || '19700101 200012 2 001'}</p>
          </div>
          <div>
            <p className="text-slate-600 mb-16 font-medium">Puskesmas, {pejabat.lunasTgl || '31 Agustus 2026'}<br/>PPTK Puskesmas</p>
            <p className="font-bold underline text-slate-900">{pejabat.pptkNama || 'Nama PPTK, S.Kep.Ns'}</p>
            <p className="font-mono text-[11px] text-slate-600 mt-0.5">NIP. {pejabat.pptkNip || '19750101 200501 1 002'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
