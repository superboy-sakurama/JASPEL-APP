import React, { useState } from 'react';
import { CalculatedEmployee, KapitasiSetup, KwitansiPejabat } from '../types/jaspel';
import { formatNumber, formatRupiah, terbilang } from '../lib/utils';
import { exportKwitansiToExcel } from '../lib/excelExport';
import { 
  Printer, 
  FileSpreadsheet, 
  Settings, 
  Search, 
  Check, 
  ChevronDown, 
  Building2, 
  Calendar,
  FileText,
  UserCheck
} from 'lucide-react';

interface KwitansiGlobalViewProps {
  employees: CalculatedEmployee[];
  setup: KapitasiSetup;
  pejabat: KwitansiPejabat;
  onUpdatePejabat: (newPejabat: KwitansiPejabat) => void;
  availablePeriods?: { bulan: string; tahun: number; label: string }[];
  onSelectPeriod?: (bulan: string, tahun: number) => void;
}

export const KwitansiGlobalView: React.FC<KwitansiGlobalViewProps> = ({
  employees,
  setup,
  pejabat,
  onUpdatePejabat,
  availablePeriods = [],
  onSelectPeriod,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [tempPejabat, setTempPejabat] = useState<KwitansiPejabat>(pejabat);

  // Filter list
  const filteredEmployees = employees.filter((emp) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      emp.name.toLowerCase().includes(q) ||
      emp.nip.toLowerCase().includes(q) ||
      emp.jabatan.toLowerCase().includes(q)
    );
  });

  // Calculate totals
  const totalBruto = employees.reduce((sum, e) => sum + e.brutoRaw, 0);
  const totalTax15 = employees
    .filter((e) => e.taxRate >= 0.15)
    .reduce((sum, e) => sum + e.tax, 0);
  const totalTax5 = employees
    .filter((e) => e.taxRate < 0.15 && e.taxRate > 0)
    .reduce((sum, e) => sum + e.tax, 0);
  const totalFpk1 = employees.reduce((sum, e) => sum + e.fpk1, 0);
  const totalNetto = employees.reduce((sum, e) => sum + e.netto, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadExcel = () => {
    exportKwitansiToExcel(employees, setup, pejabat);
  };

  const handleSavePejabat = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePejabat(tempPejabat);
    setShowConfig(false);
  };

  return (
    <div className="space-y-6">
      {/* Action Bar (Hidden during print) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm no-print space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  Kwitansi Global & Bukti Tanda Tangan Penerimaan Jaspel
                </h2>
                <p className="text-xs text-slate-500">
                  Format resmi tanda tangan seluruh pegawai (KPA, PPTK, & Bendahara) sesuai standar belanja JKN Puskesmas
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Period Selector if provided */}
            {availablePeriods.length > 0 && onSelectPeriod && (
              <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-500 font-medium">Periode:</span>
                <select
                  value={`${setup.bulan}-${setup.tahun}`}
                  onChange={(e) => {
                    const [b, t] = e.target.value.split('-');
                    onSelectPeriod(b, Number(t));
                  }}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  {availablePeriods.map((p) => (
                    <option key={`${p.bulan}-${p.tahun}`} value={`${p.bulan}-${p.tahun}`}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => setShowConfig(!showConfig)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-slate-600" />
              <span>{showConfig ? 'Tutup Pengaturan' : 'Atur Kop & Pejabat'}</span>
            </button>

            <button
              onClick={handleDownloadExcel}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Unduh Excel (.xlsx)</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cetak Kwitansi / PDF</span>
            </button>
          </div>
        </div>

        {/* Search bar inside action bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama atau NIP pegawai..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-800"
            />
          </div>

          <div className="flex items-center space-x-4 text-xs text-slate-500">
            <span>
              Total Penerima: <b className="text-slate-800">{employees.length} Pegawai</b>
            </span>
            <span>•</span>
            <span>
              Total Netto: <b className="text-emerald-700 font-mono">{formatRupiah(totalNetto)}</b>
            </span>
          </div>
        </div>

        {/* Pejabat & Kop Configuration Modal/Form */}
        {showConfig && (
          <form
            onSubmit={handleSavePejabat}
            className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Pengaturan Kop Surat & Pejabat Penandatangan</span>
              </span>
              <span className="text-[11px] text-slate-400">
                Nama dan NIP akan otomatis tertera di lembar tanda tangan & file Excel
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Nama Fasilitas Kesehatan / Puskesmas
                </label>
                <input
                  type="text"
                  value={tempPejabat.namaFaskes}
                  onChange={(e) =>
                    setTempPejabat({ ...tempPejabat, namaFaskes: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                  placeholder="Contoh: Puskesmas Kalitengah"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Tanggal Lunas Dibayar
                </label>
                <input
                  type="text"
                  value={tempPejabat.lunasTgl}
                  onChange={(e) =>
                    setTempPejabat({ ...tempPejabat, lunasTgl: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                  placeholder="Contoh: 23/09/2026"
                />
              </div>

              {/* Pejabat 1: KPA */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-[11px]">
                  1. Kuasa Pengguna Anggaran (KPA)
                </span>
                <div>
                  <label className="block text-[10px] text-slate-500">Jabatan:</label>
                  <input
                    type="text"
                    value={tempPejabat.kpaJabatan}
                    onChange={(e) =>
                      setTempPejabat({ ...tempPejabat, kpaJabatan: e.target.value })
                    }
                    className="w-full px-2 py-1 text-xs rounded border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500">Nama Lengkap & Gelar:</label>
                  <input
                    type="text"
                    value={tempPejabat.kpaNama}
                    onChange={(e) =>
                      setTempPejabat({ ...tempPejabat, kpaNama: e.target.value })
                    }
                    className="w-full px-2 py-1 text-xs rounded border border-slate-200 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500">NIP:</label>
                  <input
                    type="text"
                    value={tempPejabat.kpaNip}
                    onChange={(e) =>
                      setTempPejabat({ ...tempPejabat, kpaNip: e.target.value })
                    }
                    className="w-full px-2 py-1 text-xs rounded border border-slate-200 font-mono"
                  />
                </div>
              </div>

              {/* Pejabat 2: PPTK */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-[11px]">
                  2. Pejabat Pelaksana Teknis Kegiatan (PPTK)
                </span>
                <div>
                  <label className="block text-[10px] text-slate-500">Jabatan:</label>
                  <input
                    type="text"
                    value={tempPejabat.pptkJabatan}
                    onChange={(e) =>
                      setTempPejabat({ ...tempPejabat, pptkJabatan: e.target.value })
                    }
                    className="w-full px-2 py-1 text-xs rounded border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500">Nama Lengkap & Gelar:</label>
                  <input
                    type="text"
                    value={tempPejabat.pptkNama}
                    onChange={(e) =>
                      setTempPejabat({ ...tempPejabat, pptkNama: e.target.value })
                    }
                    className="w-full px-2 py-1 text-xs rounded border border-slate-200 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500">NIP:</label>
                  <input
                    type="text"
                    value={tempPejabat.pptkNip}
                    onChange={(e) =>
                      setTempPejabat({ ...tempPejabat, pptkNip: e.target.value })
                    }
                    className="w-full px-2 py-1 text-xs rounded border border-slate-200 font-mono"
                  />
                </div>
              </div>

              {/* Pejabat 3: Bendahara */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-[11px]">
                  3. Bendahara Pengeluaran
                </span>
                <div>
                  <label className="block text-[10px] text-slate-500">Jabatan:</label>
                  <input
                    type="text"
                    value={tempPejabat.bendaharaJabatan}
                    onChange={(e) =>
                      setTempPejabat({ ...tempPejabat, bendaharaJabatan: e.target.value })
                    }
                    className="w-full px-2 py-1 text-xs rounded border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500">Nama Lengkap & Gelar:</label>
                  <input
                    type="text"
                    value={tempPejabat.bendaharaNama}
                    onChange={(e) =>
                      setTempPejabat({ ...tempPejabat, bendaharaNama: e.target.value })
                    }
                    className="w-full px-2 py-1 text-xs rounded border border-slate-200 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500">NIP:</label>
                  <input
                    type="text"
                    value={tempPejabat.bendaharaNip}
                    onChange={(e) =>
                      setTempPejabat({ ...tempPejabat, bendaharaNip: e.target.value })
                    }
                    className="w-full px-2 py-1 text-xs rounded border border-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfig(false)}
                className="px-3 py-1.5 rounded text-xs text-slate-600 hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700"
              >
                Terapkan Perubahan
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Official Kwitansi Printable Paper View */}
      <div 
        id="kwitansi-print-area" 
        className="bg-white rounded-xl border border-slate-300 p-8 shadow-sm text-slate-900 print:p-0 print:border-none print:shadow-none font-sans"
      >
        {/* KWITANSI Title Box (Exact match to official government form) */}
        <div className="border-t-2 border-b-2 border-slate-900 py-1.5 text-center my-2">
          <h1 className="text-sm font-extrabold tracking-widest uppercase">
            KWITANSI
          </h1>
        </div>

        {/* Kwitansi Metadata Header */}
        <div className="my-4 space-y-1 text-xs leading-relaxed">
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-3 font-medium text-slate-700">Sudah terima dari</div>
            <div className="col-span-9 font-semibold">
              : Kuasa Pengguna Anggaran {pejabat.namaFaskes}
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-3 font-medium text-slate-700">Banyaknya Uang</div>
            <div className="col-span-9">
              <span className="font-bold font-mono">
                : Rp {formatNumber(setup.totalAlokasi, 2)}
              </span>
              <span className="italic ml-3 text-slate-700">
                ( {terbilang(setup.totalAlokasi)} )
              </span>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-3 font-medium text-slate-700">Dipergunakan Untuk</div>
            <div className="col-span-9">
              : Belanja Jasa pelayanan Jaminan Kesehatan Nasional (JKN) {pejabat.namaFaskes} bagian bulan {setup.bulan} {setup.tahun}
            </div>
          </div>
        </div>

        {/* Master Kwitansi Table (Exact structure from Excel print preview) */}
        <div className="overflow-x-auto my-5">
          <table className="w-full border-collapse border border-slate-900 text-[11px] leading-tight">
            <thead>
              <tr className="bg-slate-100 text-center font-bold border-b border-slate-900">
                <th rowSpan={2} className="border border-slate-900 py-2 px-1 w-8">
                  NO
                </th>
                <th rowSpan={2} className="border border-slate-900 py-2 px-3 text-center min-w-[200px]">
                  N A M A
                </th>
                <th rowSpan={2} className="border border-slate-900 py-2 px-2 text-center min-w-[150px]">
                  N I P / NIK
                </th>
                <th rowSpan={2} className="border border-slate-900 py-2 px-2 text-center w-24">
                  JUMLAH<br />(Rp.)
                </th>
                <th colSpan={2} className="border border-slate-900 py-1 px-1 text-center">
                  POTONGAN PPh Pasal 21
                </th>
                <th rowSpan={2} className="border border-slate-900 py-2 px-1 text-center w-20">
                  PFK {setup.tahun}<br />(1%)
                </th>
                <th rowSpan={2} className="border border-slate-900 py-2 px-2 text-center w-28">
                  PENERIMAAN<br />(Rp.)
                </th>
                <th colSpan={2} className="border border-slate-900 py-1 px-2 text-center min-w-[140px]">
                  TANDA TANGAN
                </th>
              </tr>
              <tr className="bg-slate-100 text-center font-bold border-b border-slate-900">
                <th className="border border-slate-900 py-1 px-1 w-20">15%</th>
                <th className="border border-slate-900 py-1 px-1 w-20">5%</th>
                <th className="border border-slate-900 py-1 px-2 w-16">Ganjil</th>
                <th className="border border-slate-900 py-1 px-2 w-16">Genap</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp, index) => {
                const no = index + 1;
                const isOdd = no % 2 === 1;
                const tax15 = emp.taxRate >= 0.15 ? emp.tax : 0;
                const tax5 = emp.taxRate < 0.15 && emp.taxRate > 0 ? emp.tax : 0;

                return (
                  <tr key={emp.id} className="hover:bg-slate-50 border-b border-slate-300">
                    <td className="border border-slate-900 text-center py-1.5 px-1 font-mono">
                      {no}
                    </td>
                    <td className="border border-slate-900 py-1.5 px-2.5 font-semibold text-slate-900">
                      {emp.name}
                    </td>
                    <td className="border border-slate-900 py-1.5 px-2 font-mono text-center text-slate-700 whitespace-nowrap">
                      {emp.nip || '-'}
                    </td>
                    <td className="border border-slate-900 py-1.5 px-2 text-right font-mono font-medium">
                      {formatNumber(emp.brutoRaw, 0)}
                    </td>
                    <td className="border border-slate-900 py-1.5 px-1 text-right font-mono text-slate-700">
                      {tax15 > 0 ? formatNumber(tax15, 0) : ''}
                    </td>
                    <td className="border border-slate-900 py-1.5 px-1 text-right font-mono text-slate-700">
                      {tax5 > 0 ? formatNumber(tax5, 0) : ''}
                    </td>
                    <td className="border border-slate-900 py-1.5 px-1 text-right font-mono text-slate-700">
                      {emp.fpk1 > 0 ? formatNumber(emp.fpk1, 0) : ''}
                    </td>
                    <td className="border border-slate-900 py-1.5 px-2 text-right font-mono font-bold text-slate-900">
                      {formatNumber(emp.netto, 0)}
                    </td>
                    {/* Tanda tangan selang-seling (zig-zag 1 di kiri, 2 di kanan) */}
                    <td className="border border-slate-900 py-1.5 px-1 text-left font-mono">
                      {isOdd ? (
                        <div className="flex items-center">
                          <span className="w-5 text-left font-bold">{no}</span>
                          <span className="border-b border-dotted border-slate-500 flex-1 ml-1 h-3"></span>
                        </div>
                      ) : null}
                    </td>
                    <td className="border border-slate-900 py-1.5 px-1 text-left font-mono">
                      {!isOdd ? (
                        <div className="flex items-center">
                          <span className="w-5 text-left font-bold">{no}</span>
                          <span className="border-b border-dotted border-slate-500 flex-1 ml-1 h-3"></span>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                );
              })}

              {/* Total Summary Row */}
              <tr className="bg-slate-100 font-extrabold border-t-2 border-b-2 border-slate-900">
                <td colSpan={3} className="border border-slate-900 text-center py-2 px-2 uppercase tracking-wider">
                  JUMLAH
                </td>
                <td className="border border-slate-900 text-right py-2 px-2 font-mono">
                  {formatNumber(totalBruto, 0)}
                </td>
                <td className="border border-slate-900 text-right py-2 px-1 font-mono">
                  {formatNumber(totalTax15, 0)}
                </td>
                <td className="border border-slate-900 text-right py-2 px-1 font-mono">
                  {formatNumber(totalTax5, 0)}
                </td>
                <td className="border border-slate-900 text-right py-2 px-1 font-mono">
                  {formatNumber(totalFpk1, 0)}
                </td>
                <td className="border border-slate-900 text-right py-2 px-2 font-mono text-emerald-900">
                  {formatNumber(totalNetto, 0)}
                </td>
                <td colSpan={2} className="border border-slate-900 bg-slate-200"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Terbilang Note Below Table */}
        <div className="text-xs my-4 p-2.5 bg-slate-50 border border-slate-300 rounded font-medium flex items-start space-x-2">
          <span className="font-bold text-slate-800">Terbilang:</span>
          <span className="italic font-serif text-slate-800">
            Rp {formatNumber(setup.totalAlokasi, 2)} ( {terbilang(setup.totalAlokasi)} )
          </span>
        </div>

        {/* Official 3-Column Signatories Section (KPA, PPTK, Bendahara) */}
        <div className="pt-6 grid grid-cols-3 text-center text-xs gap-4 break-inside-avoid">
          {/* Signatory 1: KPA */}
          <div className="flex flex-col justify-between h-36">
            <div>
              <p className="font-semibold text-slate-800">{pejabat.kpaJabatan}</p>
              <p className="font-bold text-slate-700">(KPA)</p>
            </div>
            <div>
              <p className="font-bold text-slate-950 underline">{pejabat.kpaNama}</p>
              <p className="font-mono text-slate-600 text-[10px] mt-0.5">
                NIP. {pejabat.kpaNip}
              </p>
            </div>
          </div>

          {/* Signatory 2: PPTK */}
          <div className="flex flex-col justify-between h-36">
            <div>
              <p className="font-semibold text-slate-800">{pejabat.pptkJabatan}</p>
              <p className="font-bold text-slate-700">(PPTK)</p>
            </div>
            <div>
              <p className="font-bold text-slate-950 underline">{pejabat.pptkNama}</p>
              <p className="font-mono text-slate-600 text-[10px] mt-0.5">
                NIP. {pejabat.pptkNip}
              </p>
            </div>
          </div>

          {/* Signatory 3: Bendahara */}
          <div className="flex flex-col justify-between h-36">
            <div>
              <p className="text-slate-600">
                Lunas dibayar Tgl. <span className="font-semibold text-slate-900">{pejabat.lunasTgl || '..................'}</span>
              </p>
              <p className="font-semibold text-slate-800">{pejabat.bendaharaJabatan}</p>
            </div>
            <div>
              <p className="font-bold text-slate-950 underline">{pejabat.bendaharaNama}</p>
              <p className="font-mono text-slate-600 text-[10px] mt-0.5">
                NIP. {pejabat.bendaharaNip}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
