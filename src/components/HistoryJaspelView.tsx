import React, { useState } from 'react';
import { JaspelHistoryRecord, CalculatedEmployee, KapitasiSetup, KwitansiPejabat } from '../types/jaspel';
import { formatRupiah, formatNumber } from '../lib/utils';
import { exportKwitansiToExcel } from '../lib/excelExport';
import { 
  History, 
  Calendar, 
  TrendingUp, 
  Users, 
  DollarSign, 
  FileSpreadsheet, 
  FileText, 
  ChevronRight, 
  BookmarkPlus, 
  Search, 
  ShieldCheck, 
  Receipt,
  Lock,
  Unlock,
  AlertTriangle,
  Info,
  CheckCircle2,
  Trash2,
  Database,
  Layers,
  FileCheck2,
  Filter
} from 'lucide-react';

interface HistoryJaspelViewProps {
  historyRecords: JaspelHistoryRecord[];
  onSaveCurrentToHistory: (note?: string) => boolean | void;
  currentSetup: KapitasiSetup;
  currentCalculationEmployees: CalculatedEmployee[];
  pejabat: KwitansiPejabat;
  onOpenKwitansiForHistory: (record: JaspelHistoryRecord) => void;
  onPrintSlipForEmployee: (emp: CalculatedEmployee, setup: KapitasiSetup) => void;
  onDeleteHistoryRecord?: (id: string) => void;
  onToggleLockHistory?: (id: string, lockNote?: string, officerName?: string) => void;
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
  onToggleLockHistory,
}) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string>(
    historyRecords.length > 0 ? historyRecords[0].id : ''
  );
  const [detailTab, setDetailTab] = useState<'kapitasi' | 'rincian' | 'snapshot'>('kapitasi');
  const [filterLockStatus, setFilterLockStatus] = useState<'ALL' | 'LOCKED' | 'UNLOCKED'>('ALL');
  const [searchEmployeeQuery, setSearchEmployeeQuery] = useState('');
  
  // Modals state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveNote, setSaveNote] = useState('');
  
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockOfficer, setLockOfficer] = useState('Bendahara Jaspel / Kasubag TU');
  const [lockNoteInput, setLockNoteInput] = useState('Dokumen Kwitansi Global telah ditandatangani KPA & PPTK serta SPJ dinyatakan lunas.');
  
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockReason, setUnlockReason] = useState('Penyesuaian perbaikan nomor rekening / verifikasi susulan.');

  // Filter history records
  const filteredHistory = historyRecords.filter((rec) => {
    if (filterLockStatus === 'LOCKED') return rec.isLocked;
    if (filterLockStatus === 'UNLOCKED') return !rec.isLocked;
    return true;
  });

  const selectedRecord = historyRecords.find((r) => r.id === selectedRecordId) || filteredHistory[0] || historyRecords[0];

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

  const handleConfirmLock = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRecord && onToggleLockHistory) {
      onToggleLockHistory(selectedRecord.id, lockNoteInput, lockOfficer);
    }
    setShowLockModal(false);
  };

  const handleConfirmUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRecord && onToggleLockHistory) {
      onToggleLockHistory(selectedRecord.id, unlockReason);
    }
    setShowUnlockModal(false);
  };

  const handleDownloadExcel = () => {
    if (!selectedRecord) return;
    exportKwitansiToExcel(
      selectedRecord.calculation.employees,
      {
        bulan: selectedRecord.bulan,
        tahun: selectedRecord.tahun,
        totalKapitasi: selectedRecord.totalKapitasi,
        alokasiPersen: selectedRecord.alokasiPersen,
        totalAlokasi: selectedRecord.totalAlokasi,
        maxAttendance: selectedRecord.maxAttendance,
        tanggalHitung: selectedRecord.tanggalHitung,
      },
      selectedRecord.pejabat || pejabat,
      `Kwitansi_Jaspel_${selectedRecord.bulan}_${selectedRecord.tahun}_TERKUNCI.xlsx`
    );
  };

  const isCurrentActivePeriodLocked = historyRecords.some(
    (r) => r.bulan === currentSetup.bulan && r.tahun === currentSetup.tahun && r.isLocked
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl shadow-2xs">
              <History className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Riwayat & Penguncian Jaspel Bulan Sebelumnya
                </h2>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Proteksi Imutabel Aktif</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
                Fitur penguncian data memastikan hasil perhitungan bulan-bulan sebelumnya dibekukan secara permanen.
                Perubahan pada data pegawai, penambahan karyawan, maupun penyesuaian matriks poin SK di menu Pengaturan
                <strong> tidak akan pernah mempengaruhi data riwayat yang sudah dikunci</strong>.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setShowSaveModal(true)}
              disabled={isCurrentActivePeriodLocked}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                isCurrentActivePeriodLocked
                  ? `Periode ${currentSetup.bulan} ${currentSetup.tahun} telah dikunci resmi di riwayat`
                  : `Simpan snapshot periode ${currentSetup.bulan} ${currentSetup.tahun}`
              }
            >
              <BookmarkPlus className="w-4 h-4" />
              <span>
                {isCurrentActivePeriodLocked
                  ? `Periode Ini (${currentSetup.bulan}) Terkunci`
                  : `Simpan Bulan Ini (${currentSetup.bulan} ${currentSetup.tahun}) ke Riwayat`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar Periods & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: List of Historical Months (4 cols) */}
        <div className="lg:col-span-4 space-y-3 no-print">
          <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Daftar Riwayat ({historyRecords.length})</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                Pilih periode untuk melihat
              </span>
            </div>

            {/* Filter Lock Status */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg text-[11px] font-medium text-slate-600">
              <button
                type="button"
                onClick={() => setFilterLockStatus('ALL')}
                className={`flex-1 py-1 rounded-md transition-all text-center ${
                  filterLockStatus === 'ALL'
                    ? 'bg-white font-bold text-slate-900 shadow-2xs'
                    : 'hover:text-slate-900'
                }`}
              >
                Semua ({historyRecords.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterLockStatus('LOCKED')}
                className={`flex-1 py-1 rounded-md transition-all text-center flex items-center justify-center space-x-1 ${
                  filterLockStatus === 'LOCKED'
                    ? 'bg-white font-bold text-emerald-800 shadow-2xs'
                    : 'hover:text-slate-900'
                }`}
              >
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>Terkunci ({historyRecords.filter(r => r.isLocked).length})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterLockStatus('UNLOCKED')}
                className={`flex-1 py-1 rounded-md transition-all text-center flex items-center justify-center space-x-1 ${
                  filterLockStatus === 'UNLOCKED'
                    ? 'bg-white font-bold text-amber-800 shadow-2xs'
                    : 'hover:text-slate-900'
                }`}
              >
                <Unlock className="w-3 h-3 text-amber-600" />
                <span>Draft ({historyRecords.filter(r => !r.isLocked).length})</span>
              </button>
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
              <History className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-semibold">Tidak ada data riwayat yang cocok</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Gunakan tombol "Simpan Bulan Ini ke Riwayat" untuk membuat arsip baru.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredHistory.map((record) => {
                const isSelected = selectedRecord?.id === record.id;
                return (
                  <div
                    key={record.id}
                    onClick={() => setSelectedRecordId(record.id)}
                    className={`cursor-pointer rounded-xl p-4 border transition-all relative ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-400 shadow-sm ring-1 ring-indigo-400'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {record.bulan} {record.tahun}
                          </span>
                          
                          {/* Lock Status Badge */}
                          {record.isLocked ? (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <Lock className="w-2.5 h-2.5 text-emerald-700" />
                              <span>Terkunci</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <Unlock className="w-2.5 h-2.5 text-amber-700" />
                              <span>Draft</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1.5">
                          <span>{record.tanggalHitung}</span>
                          <span>•</span>
                          <span>{record.totalPenerima} Pegawai</span>
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
                        <span className="text-[10px] text-slate-400 block">Alokasi Jaspel (60%)</span>
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
            {/* Keamanan & Status Penguncian (Lock Hero Card) */}
            <div className={`rounded-xl border p-4.5 transition-all ${
              selectedRecord.isLocked
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                : 'bg-amber-50/70 border-amber-300 text-amber-950'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/70">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-xl text-white ${
                    selectedRecord.isLocked ? 'bg-emerald-600' : 'bg-amber-600'
                  }`}>
                    {selectedRecord.isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        {selectedRecord.isLocked
                          ? `Periode ${selectedRecord.bulan} ${selectedRecord.tahun} Terkunci Resmi`
                          : `Periode ${selectedRecord.bulan} ${selectedRecord.tahun} Masih Berstatus Draft`}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedRecord.isLocked
                          ? 'bg-emerald-200 text-emerald-900'
                          : 'bg-amber-200 text-amber-900'
                      }`}>
                        {selectedRecord.isLocked ? 'KEBAL DARI PERUBAHAN MASTER' : 'DAPAT DIREVISI'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {selectedRecord.isLocked
                        ? `Dikunci oleh: ${selectedRecord.lockedBy || 'Bendahara Jaspel'} • ${selectedRecord.lockedAt ? new Date(selectedRecord.lockedAt).toLocaleDateString('id-ID', { dateStyle: 'long' }) : 'Arsip Resmi'}`
                        : 'Belum dikunci resmi. Disarankan untuk mengunci setelah kwitansi dicairkan.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {selectedRecord.isLocked ? (
                    <button
                      type="button"
                      onClick={() => setShowUnlockModal(true)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-amber-800 border border-amber-300 shadow-2xs transition-colors"
                      title="Buka kunci untuk merevisi data periode ini"
                    >
                      <Unlock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Buka Kunci (Revisi)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowLockModal(true)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors"
                      title="Kunci periode ini secara permanen"
                    >
                      <Lock className="w-3.5 h-3.5 text-white" />
                      <span>Kunci Periode Ini</span>
                    </button>
                  )}

                  {onDeleteHistoryRecord && !selectedRecord.isLocked && (
                    <button
                      type="button"
                      onClick={() => onDeleteHistoryRecord(selectedRecord.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors"
                      title="Hapus draft periode riwayat ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Security Statement */}
              <div className="pt-3 text-[11px] leading-relaxed flex items-start space-x-2">
                <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <p>
                  {selectedRecord.isLocked ? (
                    <>
                      <strong>Jaminan Keamanan Data:</strong> Nilai poin, hari hadir, bruto, potongan PPh 21, iuran BPJS, dan take-home pay netto pada bulan ini telah <em>dibekukan independen</em>. Perubahan nama pegawai, mutasi jabatan, atau perubahan rumus poin di menu saat ini <strong>tidak akan mengubah 1 rupiah pun angka riwayat ini</strong>.
                    </>
                  ) : (
                    <>
                      <strong>Peringatan Status Draft:</strong> Periode ini belum dikunci. Jika Anda mengubah data pegawai di master atau mengubah pengaturan poin, perhitungan periode ini dapat terpengaruh bila dibuka kembali. Klik <strong>Kunci Periode Ini</strong> untuk mengamankannya.
                    </>
                  )}
                </p>
              </div>

              {selectedRecord.lockNote && (
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[11px] text-slate-700">
                  <span className="font-semibold text-slate-800">Catatan Penguncian:</span> "{selectedRecord.lockNote}"
                </div>
              )}
            </div>

            {/* Record Overview Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-100 text-indigo-800">
                      Detail Arsip Resmi
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      Bulan {selectedRecord.bulan} {selectedRecord.tahun}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Ditetapkan pada {selectedRecord.tanggalHitung} • {selectedRecord.totalPenerima} Pegawai Menerima
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => onOpenKwitansiForHistory(selectedRecord)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-2xs"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Buka Kwitansi Global</span>
                  </button>

                  <button
                    onClick={handleDownloadExcel}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors shadow-2xs"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Unduh Excel</span>
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

                <button
                  onClick={() => setDetailTab('snapshot')}
                  className={`pb-2.5 px-3 font-semibold transition-colors flex items-center space-x-1.5 border-b-2 ${
                    detailTab === 'snapshot'
                      ? 'border-indigo-600 text-indigo-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Audit Snapshot & Sertifikat Kunci</span>
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
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold block">Status Perhitungan: 100% Sempurna (Zero Discrepancy)</span>
                        <span className="text-emerald-700 text-[11px]">
                          Total Bruto ({formatRupiah(selectedRecord.totalBruto)}) tepat sama dengan Total Alokasi ({formatRupiah(selectedRecord.totalAlokasi)}) tanpa selisih pembulatan.
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
                        placeholder="Cari nama, NIP, atau jabatan..."
                        value={searchEmployeeQuery}
                        onChange={(e) => setSearchEmployeeQuery(e.target.value)}
                        className="w-full text-xs pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                      {selectedRecord.isLocked && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                          <Lock className="w-3 h-3 text-emerald-600" />
                          <span>Arsip Terkunci</span>
                        </span>
                      )}
                      <span>
                        Menampilkan {filteredEmployees.length} dari {selectedRecord.calculation.employees.length} penerima
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-[11px] text-left border-collapse">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase">
                        <tr>
                          <th className="py-2.5 px-2.5 text-center">No</th>
                          <th className="py-2.5 px-3">Pegawai</th>
                          <th className="py-2.5 px-2 text-center">Poin / Absen</th>
                          <th className="py-2.5 px-3 text-right">Bruto (Rp)</th>
                          <th className="py-2.5 px-2 text-right">PPh 21</th>
                          <th className="py-2.5 px-2 text-right">FPK 1%</th>
                          <th className="py-2.5 px-3 text-right">Netto (Rp)</th>
                          <th className="py-2.5 px-2 text-center">Slip</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredEmployees.map((emp, idx) => (
                          <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
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
                                className="p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
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

              {/* TAB 3: AUDIT SNAPSHOT & KEAMANAN */}
              {detailTab === 'snapshot' && (
                <div className="space-y-4 pt-1 text-xs">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <span className="font-bold text-slate-800 flex items-center space-x-1.5 text-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Integritas Snapshot Data & Sertifikat Kunci</span>
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
                        <span className="text-[11px] text-slate-500 font-medium">Status Penguncian:</span>
                        <div className="flex items-center space-x-1.5">
                          {selectedRecord.isLocked ? (
                            <>
                              <Lock className="w-4 h-4 text-emerald-600" />
                              <span className="font-bold text-emerald-800">Terkunci Resmi (Imutabel)</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-4 h-4 text-amber-600" />
                              <span className="font-bold text-amber-800">Draft (Belum Dikunci)</span>
                            </>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {selectedRecord.isLocked 
                            ? 'Dilindungi dari penimpaan atau perubahan otomatis.' 
                            : 'Dapat ditimpa jika perhitungan periode yang sama disimpan ulang.'}
                        </p>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
                        <span className="text-[11px] text-slate-500 font-medium">Petugas Pengunci:</span>
                        <div className="font-semibold text-slate-800 font-mono">
                          {selectedRecord.lockedBy || 'Bendahara Jaspel Puskesmas'}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Terkunci sejak: {selectedRecord.lockedAt ? new Date(selectedRecord.lockedAt).toLocaleString('id-ID') : '-'}
                        </p>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
                        <span className="text-[11px] text-slate-500 font-medium">Snapshot Data Pegawai Tersimpan:</span>
                        <div className="font-semibold text-slate-800">
                          {selectedRecord.employeesSnapshot?.length || selectedRecord.calculation.employees.length} Pegawai Dibekukan
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Profil, NIP, status, dan jabatan pegawai pada bulan ini disimpan permanen.
                        </p>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
                        <span className="text-[11px] text-slate-500 font-medium">Pejabat Kwitansi yang Berlaku:</span>
                        <div className="font-semibold text-slate-800 truncate">
                          {selectedRecord.pejabat?.kpaNama || pejabat.kpaNama} (KPA)
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">
                          Bendahara: {selectedRecord.pejabat?.bendaharaNama || pejabat.bendaharaNama}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 space-y-1">
                    <span className="font-bold flex items-center space-x-1.5 text-xs">
                      <FileCheck2 className="w-4 h-4 text-blue-700" />
                      <span>Standar Kepatuhan Audit Inspektorat & BPK</span>
                    </span>
                    <p className="text-[11px] leading-relaxed text-blue-800">
                      Arsip yang terkunci memenuhi asas transparansi dan akuntabilitas keuangan BLUD/JKN. Hasil pembagian jasa tidak akan pernah bergeser meskipun ada revisi data pegawai untuk periode bulan-bulan berikutnya.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Modal 1: Simpan Periode Berjalan ke Riwayat */}
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
                  Data hasil perhitungan saat ini akan diarsipkan sebagai snapshot mandiri
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
                  Catatan / Keterangan Arsip (Opsional)
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

      {/* Modal 2: Kunci Periode Resmi */}
      {showLockModal && selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-slate-800">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Kunci Permanen Periode {selectedRecord.bulan} {selectedRecord.tahun}</h3>
                <p className="text-xs text-slate-500">
                  Data dibekukan dan dilindungi dari perubahan master data di masa depan
                </p>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <span className="font-bold flex items-center space-x-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Efek Penguncian Data:</span>
              </span>
              <p className="text-[11px] leading-relaxed">
                Setelah dikunci, angka nominal, poin, dan kehadiran pada periode <strong>{selectedRecord.bulan} {selectedRecord.tahun}</strong> tidak akan berubah meskipun Anda menambah pegawai, mengubah status PNS/PPPK, atau mengubah bobot poin jaspel di menu Pengaturan.
              </p>
            </div>

            <form onSubmit={handleConfirmLock} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Petugas / Jabatan yang Mengunci:
                </label>
                <input
                  type="text"
                  required
                  value={lockOfficer}
                  onChange={(e) => setLockOfficer(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Penguncian / Dasar SK:
                </label>
                <textarea
                  rows={2}
                  required
                  value={lockNoteInput}
                  onChange={(e) => setLockNoteInput(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLockModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-xs transition-colors flex items-center space-x-1"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Kunci Periode Sekarang</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Buka Kunci Arsip (Revisi) */}
      {showUnlockModal && selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-slate-800">
              <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
                <Unlock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Buka Kunci Periode {selectedRecord.bulan} {selectedRecord.tahun}</h3>
                <p className="text-xs text-slate-500">
                  Beralih ke mode revisi / perbaikan data
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-bold flex items-center space-x-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Peringatan Pembukaan Kunci:</span>
              </span>
              <p className="text-[11px] leading-relaxed">
                Membuka kunci memungkinkan periode ini untuk ditimpa kembali. Pastikan perubahan dilakukan secara bertanggung jawab dan kunci kembali setelah revisi selesai.
              </p>
            </div>

            <form onSubmit={handleConfirmUnlock} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alasan Pembukaan Kunci / Revisi:
                </label>
                <textarea
                  rows={2}
                  required
                  value={unlockReason}
                  onChange={(e) => setUnlockReason(e.target.value)}
                  placeholder="Sebutkan alasan revisi data..."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-600"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUnlockModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-xs transition-colors flex items-center space-x-1"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Buka Kunci Sekarang</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
