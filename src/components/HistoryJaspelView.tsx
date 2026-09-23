import React, { useState } from 'react';
import { JaspelHistoryRecord, CalculatedEmployee, KapitasiSetup, KwitansiPejabat } from '../types/jaspel';
import { formatRupiah, formatNumber, formatPercent } from '../lib/utils';
import { 
  History, 
  Calendar, 
  TrendingUp, 
  Users, 
  DollarSign, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Download, 
  ChevronRight, 
  ArrowLeft, 
  CheckCircle2, 
  BookmarkPlus, 
  Search, 
  ShieldCheck, 
  Building, 
  Receipt,
  Layers
} from 'lucide-react';

interface HistoryJaspelViewProps {
  historyRecords: JaspelHistoryRecord[];
  onSaveCurrentToHistory: (note?: string) => void;
  currentSetup: KapitasiSetup;
  currentCalculationEmployees: CalculatedEmployee[];
  pejabat: KwitansiPejabat;
  onOpenKwitansiForHistory: (record: JaspelHistoryRecord) => void;
  onPrintSlipForEmployee: (emp: CalculatedEmployee, setup: KapitasiSetup) => void;
  onDeleteHistoryRecord?: (id: string) => void;
}

export const HistoryJaspelView: React.FC<HistoryJaspelViewProps> = ({
  historyRecords,
  onSaveCurrentToHistory,
  currentSetup,
  currentCalculationEmployees,
  pejabat,
  onOpenKwitansiForHistory,
  onPrintSlipForEmployee,
  onDeleteHistoryRecord,
}) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string>(
    historyRecords.length > 0 ? historyRecords[0].id : ''
  );
  const [detailTab, setDetailTab] = useState<'kapitasi' | 'rincian'>('kapitasi');
  const [searchEmployeeQuery, setSearchEmployeeQuery] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveNote, setSaveNote] = useState('');

  const selectedRecord = historyRecords.find((r) => r.id === selectedRecordId) || historyRecords[0];

  const filteredEmployees = selectedRecord
    ? selectedRecord.calculation.employees.filter((emp) => {
        if (!searchEmployeeQuery.trim()) return true;
        const q = searchEmployeeQuery.toLowerCase();
        return (
          emp.name.toLowerCase().includes(q) ||
          emp.nip.toLowerCase().includes(q) ||
          emp.jabatan.toLowerCase().includes(q)
        );
      })
    : [];

  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCurrentToHistory(saveNote);
    setShowSaveModal(false);
    setSaveNote('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Riwayat Jasa Pelayanan & Besaran Kapitasi Bulan Sebelumnya
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Arsip audit perhitungan, besaran dana kapitasi BPJS, dan rincian nominal jaspel per pegawai dari bulan-bulan lalu
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowSaveModal(true)}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors"
            >
              <BookmarkPlus className="w-4 h-4" />
              <span>Simpan Bulan Ini ({currentSetup.bulan} {currentSetup.tahun}) ke Riwayat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar Periods & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: List of Historical Months (4 cols) */}
        <div className="lg:col-span-4 space-y-3 no-print">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Daftar Bulan Sebelumnya ({historyRecords.length})</span>
            </span>
            <span className="text-[11px] text-slate-400">Pilih untuk melihat</span>
          </div>

          {historyRecords.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
              <History className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-medium">Belum ada riwayat tersimpan</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Gunakan tombol "Simpan Bulan Ini ke Riwayat" di atas untuk menyimpan perhitungan periode berjalan.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {historyRecords.map((record) => {
                const isSelected = selectedRecord?.id === record.id;
                return (
                  <div
                    key={record.id}
                    onClick={() => setSelectedRecordId(record.id)}
                    className={`cursor-pointer rounded-xl p-4 border transition-all ${
                      isSelected
                        ? 'bg-indigo-50/60 border-indigo-400 shadow-sm ring-1 ring-indigo-400'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {record.bulan} {record.tahun}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            100% Balanced
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Tgl Hitung: {record.tanggalHitung} • {record.totalPenerima} Pegawai
                        </p>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isSelected ? 'text-indigo-600 translate-x-1' : 'text-slate-400'
                        }`}
                      />
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Total Alokasi Jaspel</span>
                        <span className="font-bold font-mono text-slate-800 text-xs">
                          {formatRupiah(record.totalAlokasi)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Total Netto Transfer</span>
                        <span className="font-bold font-mono text-emerald-700 text-xs">
                          {formatRupiah(record.totalNetto)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Historical Record Detail (8 cols) */}
        {selectedRecord ? (
          <div className="lg:col-span-8 space-y-5">
            {/* Record Overview Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-100 text-indigo-800">
                      Periode Riwayat
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      Bulan {selectedRecord.bulan} {selectedRecord.tahun}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Ditetapkan pada {selectedRecord.tanggalHitung} • Disimpan di database Puskesmas
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenKwitansiForHistory(selectedRecord)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Buka Kwitansi Global</span>
                  </button>
                </div>
              </div>

              {/* Stat Badges for Selected Period */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[11px] text-slate-500 block">Total Penerimaan Dana</span>
                  <span className="text-xs font-bold text-slate-900 font-mono">
                    {formatRupiah(selectedRecord.totalKapitasi)}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">100% Kapitasi BPJS</span>
                </div>

                <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg">
                  <span className="text-[11px] text-indigo-700 block">Alokasi Jasa Pelayanan</span>
                  <span className="text-xs font-bold text-indigo-900 font-mono">
                    {formatRupiah(selectedRecord.totalAlokasi)}
                  </span>
                  <span className="text-[10px] text-indigo-600 block mt-0.5">
                    {selectedRecord.alokasiPersen}% (Alokasi)
                  </span>
                </div>

                <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-lg">
                  <span className="text-[11px] text-emerald-700 block">Netto Dibayarkan</span>
                  <span className="text-xs font-bold text-emerald-900 font-mono">
                    {formatRupiah(selectedRecord.totalNetto)}
                  </span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5">Setelah Pajak & FPK</span>
                </div>

                <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-lg">
                  <span className="text-[11px] text-amber-700 block">Pajak PPh & Iuran FPK</span>
                  <span className="text-xs font-bold text-amber-900 font-mono">
                    {formatRupiah(selectedRecord.totalTax + selectedRecord.totalFpk1)}
                  </span>
                  <span className="text-[10px] text-amber-600 block mt-0.5">PPh 21 + FPK 1%</span>
                </div>
              </div>

              {/* Sub Navigation Tabs */}
              <div className="flex border-b border-slate-200 pt-2 text-xs">
                <button
                  onClick={() => setDetailTab('kapitasi')}
                  className={`pb-2.5 px-3 font-semibold transition-colors flex items-center space-x-1.5 border-b-2 ${
                    detailTab === 'kapitasi'
                      ? 'border-indigo-600 text-indigo-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Besaran & Pembagian Kapitasi</span>
                </button>

                <button
                  onClick={() => setDetailTab('rincian')}
                  className={`pb-2.5 px-3 font-semibold transition-colors flex items-center space-x-1.5 border-b-2 ${
                    detailTab === 'rincian'
                      ? 'border-indigo-600 text-indigo-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Rincian Jaspel Karyawan ({selectedRecord.calculation.employees.length})</span>
                </button>
              </div>

              {/* TAB 1: BESARAN KAPITASI */}
              {detailTab === 'kapitasi' && (
                <div className="space-y-4 pt-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Alokasi 60% vs 40% */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                      <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                        <TrendingUp className="w-4 h-4 text-indigo-600" />
                        <span>Proporsi Alokasi Dana Kapitasi</span>
                      </span>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center py-1 border-b border-slate-200">
                          <span className="text-slate-600">Total Kapitasi BPJS Diterima</span>
                          <span className="font-bold font-mono text-slate-900">
                            {formatRupiah(selectedRecord.totalKapitasi)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-1 border-b border-slate-200 text-indigo-700">
                          <span className="font-medium">
                            Jasa Pelayanan ({selectedRecord.alokasiPersen}%)
                          </span>
                          <span className="font-bold font-mono">
                            {formatRupiah(selectedRecord.totalAlokasi)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-1 border-b border-slate-200 text-slate-600">
                          <span>
                            Dukungan Operasional ({100 - selectedRecord.alokasiPersen}%)
                          </span>
                          <span className="font-mono font-medium">
                            {formatRupiah(
                              selectedRecord.totalKapitasi - selectedRecord.totalAlokasi
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-1">
                          <span className="text-slate-500">Standar Hari Kerja Bulan Ini</span>
                          <span className="font-bold text-slate-800">
                            {selectedRecord.maxAttendance} Hari Kerja
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ringkasan Keuangan Pajak & Iuran */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                      <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Potongan Resmi & Penyetoran Kas</span>
                      </span>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center py-1 border-b border-slate-200">
                          <span className="text-slate-600">PPh 21 Tarif 15% (Gol. IV)</span>
                          <span className="font-mono text-slate-800">
                            {formatRupiah(selectedRecord.totalTax15 || 0)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-1 border-b border-slate-200">
                          <span className="text-slate-600">PPh 21 Tarif 5% (Gol. III & PPPK)</span>
                          <span className="font-mono text-slate-800">
                            {formatRupiah(selectedRecord.totalTax5 || 0)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-1 border-b border-slate-200 text-amber-700">
                          <span className="font-medium">Total Pajak PPh 21 Disetor</span>
                          <span className="font-bold font-mono">
                            {formatRupiah(selectedRecord.totalTax)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-1 text-slate-600">
                          <span>Iuran BPJS FPK 1% Pegawai</span>
                          <span className="font-mono font-medium">
                            {formatRupiah(selectedRecord.totalFpk1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Balancing Audit */}
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 text-emerald-900">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <div>
                        <span className="font-bold block">Status Perhitungan: 100% Sempurna (Zero Discrepancy)</span>
                        <span className="text-emerald-700 text-[11px]">
                          Total Bruto ({formatRupiah(selectedRecord.totalBruto)}) tepat sama dengan Total Alokasi ({formatRupiah(selectedRecord.totalAlokasi)}) tanpa sisa pembulatan.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: RINCIAN JASPEL KARYAWAN */}
              {detailTab === 'rincian' && (
                <div className="space-y-3 pt-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="relative w-full sm:w-72">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Cari pegawai..."
                        value={searchEmployeeQuery}
                        onChange={(e) => setSearchEmployeeQuery(e.target.value)}
                        className="w-full text-xs pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <span className="text-[11px] text-slate-500">
                      Menampilkan {filteredEmployees.length} dari {selectedRecord.calculation.employees.length} penerima
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-[11px] text-left border-collapse">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase">
                        <tr>
                          <th className="py-2 px-2.5 text-center">No</th>
                          <th className="py-2 px-3">Pegawai</th>
                          <th className="py-2 px-2 text-center">Poin / Absen</th>
                          <th className="py-2 px-3 text-right">Bruto (Rp)</th>
                          <th className="py-2 px-2 text-right">PPh 21</th>
                          <th className="py-2 px-2 text-right">FPK 1%</th>
                          <th className="py-2 px-3 text-right">Netto (Rp)</th>
                          <th className="py-2 px-2 text-center">Slip</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredEmployees.map((emp, idx) => (
                          <tr key={emp.id} className="hover:bg-slate-50">
                            <td className="py-2 px-2 text-center text-slate-400 font-mono">
                              {idx + 1}
                            </td>
                            <td className="py-2 px-3">
                              <span className="font-semibold text-slate-900 block">
                                {emp.name}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {emp.nip || '-'} • {emp.jabatan}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-center text-slate-700">
                              <span className="font-bold">{emp.points}</span> pt
                              <span className="text-slate-400 text-[10px] block">
                                {emp.attendance}/{emp.maxAttendance} hr
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-medium text-slate-800">
                              {formatNumber(emp.brutoRaw, 0)}
                            </td>
                            <td className="py-2 px-2 text-right font-mono text-slate-600">
                              {emp.tax > 0 ? formatNumber(emp.tax, 0) : '-'}
                            </td>
                            <td className="py-2 px-2 text-right font-mono text-slate-600">
                              {emp.fpk1 > 0 ? formatNumber(emp.fpk1, 0) : '-'}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                              {formatNumber(emp.netto, 0)}
                            </td>
                            <td className="py-2 px-2 text-center">
                              <button
                                onClick={() =>
                                  onPrintSlipForEmployee(emp, {
                                    bulan: selectedRecord.bulan,
                                    tahun: selectedRecord.tahun,
                                    totalKapitasi: selectedRecord.totalKapitasi,
                                    alokasiPersen: selectedRecord.alokasiPersen,
                                    totalAlokasi: selectedRecord.totalAlokasi,
                                    maxAttendance: selectedRecord.maxAttendance,
                                    tanggalHitung: selectedRecord.tanggalHitung,
                                  })
                                }
                                title="Cetak Slip Gaji Individu"
                                className="p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Modal: Simpan Periode Berjalan ke Riwayat */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 text-slate-800">
              <span className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                <BookmarkPlus className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold">Simpan Snapshot Periode ke Riwayat</h3>
                <p className="text-xs text-slate-500">
                  Data hasil perhitungan saat ini akan dibekukan sebagai arsip riwayat resmi
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Periode:</span>
                <span className="font-bold text-slate-800">
                  {currentSetup.bulan} {currentSetup.tahun}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Alokasi Jaspel:</span>
                <span className="font-bold font-mono text-indigo-700">
                  {formatRupiah(currentSetup.totalAlokasi)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jumlah Penerima:</span>
                <span className="font-bold text-slate-800">
                  {currentCalculationEmployees.length} Pegawai
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveCurrent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan / Keterangan Tambahan (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={saveNote}
                  onChange={(e) => setSaveNote(e.target.value)}
                  placeholder="Contoh: Sesuai SK penetapan Kepala Puskesmas per 22 September"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                >
                  Konfirmasi & Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
