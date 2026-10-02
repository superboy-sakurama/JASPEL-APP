import React, { useState } from 'react';
import { KapitasiSetup, JaspelHistoryRecord } from '../types/jaspel';
import { formatRupiah } from '../lib/utils';
import { 
  Settings, 
  Check, 
  Calendar, 
  DollarSign, 
  Percent, 
  Database, 
  Building2,
  Save,
  History,
  FileText,
  RotateCcw,
  Receipt,
  Trash2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface KapitasiSetupViewProps {
  setup: KapitasiSetup;
  onUpdateSetup: (newSetup: KapitasiSetup) => void;
  onSaveToHistory?: () => void;
  historyRecords?: JaspelHistoryRecord[];
  onLoadPeriod?: (record: JaspelHistoryRecord) => void;
  onOpenKwitansiForHistory?: (record: JaspelHistoryRecord) => void;
  onDeleteHistoryRecord?: (id: string) => void;
  onPushToGoogleSheets?: () => Promise<void>;
  isSyncingToSheets?: boolean;
}

const BULAN_OPTIONS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const KapitasiSetupView: React.FC<KapitasiSetupViewProps> = ({
  setup,
  onUpdateSetup,
  onSaveToHistory,
  historyRecords = [],
  onLoadPeriod,
  onOpenKwitansiForHistory,
  onDeleteHistoryRecord,
  onPushToGoogleSheets,
  isSyncingToSheets = false,
}) => {
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChangeTotal = (amount: number) => {
    const totalAlokasi = Math.round(amount * (setup.alokasiPersen / 100));
    onUpdateSetup({
      ...setup,
      totalKapitasi: amount,
      totalAlokasi,
    });
  };

  const handleChangePersen = (persen: number) => {
    const totalAlokasi = Math.round(setup.totalKapitasi * (persen / 100));
    onUpdateSetup({
      ...setup,
      alokasiPersen: persen,
      totalAlokasi,
    });
  };

  const handleApplyPreset = (nama: string, amount: number, persen: number = 60) => {
    const totalAlokasi = Math.round(amount * (persen / 100));
    onUpdateSetup({
      ...setup,
      totalKapitasi: amount,
      alokasiPersen: persen,
      totalAlokasi,
    });
  };

  const handleTriggerSave = () => {
    if (onSaveToHistory) {
      onSaveToHistory();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Alokasi Jasa Pelayanan
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Periode {setup.bulan} {setup.tahun}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Alokasi Jasa Pelayanan & Pendapatan Dana Kapitasi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sesuai Permenkes No. 6/2022, sekurang-kurangnya 60% dana kapitasi BPJS dialokasikan untuk Jasa Pelayanan Kesehatan (Jaspel), sisanya untuk operasional pelayanan kesehatan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onPushToGoogleSheets && (
            <button
              onClick={onPushToGoogleSheets}
              disabled={isSyncingToSheets}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isSyncingToSheets ? 'Menyimpan...' : 'Simpan ke Sheets'}</span>
            </button>
          )}

          {/* Tombol Simpan Alokasi */}
          <button
            type="button"
            onClick={handleTriggerSave}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Alokasi Periode Ini</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Alokasi dan perhitungan Jaspel periode {setup.bulan} {setup.tahun} berhasil disimpan ke Riwayat!</span>
        </div>
      )}

      {/* Main Form & Calculation Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Parameters */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <Settings className="w-4 h-4 text-slate-600" />
              <span>Parameter Periode & Penerimaan Kapitasi</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bulan Perhitungan
              </label>
              <select
                value={setup.bulan}
                onChange={(e) => onUpdateSetup({ ...setup, bulan: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-800 bg-white"
              >
                {BULAN_OPTIONS.map((bln) => (
                  <option key={bln} value={bln}>
                    {bln}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tahun Anggaran
              </label>
              <input
                type="number"
                value={setup.tahun}
                onChange={(e) => onUpdateSetup({ ...setup, tahun: Number(e.target.value) })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-800 font-mono bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hari Kerja Standar (Maksimal)
              </label>
              <input
                type="number"
                value={setup.maxAttendance}
                onChange={(e) => onUpdateSetup({ ...setup, maxAttendance: Number(e.target.value) })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-800 font-mono bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Total Dana Kapitasi Diterima dari BPJS Kesehatan (100%)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                Rp
              </span>
              <input
                type="number"
                step="100000"
                value={setup.totalKapitasi}
                onChange={(e) => handleChangeTotal(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-2.5 text-sm font-bold text-slate-900 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-800 font-mono bg-white"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Terbilang: {formatRupiah(setup.totalKapitasi)}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Persentase Alokasi Jaspel (Regulasi Standar 60%)
              </label>
              <span className="text-xs font-bold font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {setup.alokasiPersen}%
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="70"
              step="1"
              value={setup.alokasiPersen}
              onChange={(e) => handleChangePersen(Number(e.target.value))}
              className="w-full accent-slate-800"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Minimal 50% (Perbup Tertentu)</span>
              <span className="font-semibold text-slate-700">Standar Permenkes 60%</span>
              <span>Maksimal 70% (Daerah Terpencil)</span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div>
            <span className="block text-xs font-semibold text-slate-700 mb-2">
              Preset Cepat Skala Fasilitas Kesehatan:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset('Puskesmas Standar', 85000000, 60)}
                className="p-2.5 text-left rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-800">
                  <Building2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Puskesmas Standar</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">Rp 85.000.000 (60%)</div>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('Puskesmas Besar', 155255060, 60)}
                className="p-2.5 text-left rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-800">
                  <Building2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>Puskesmas Kalitengah</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">Rp 155.255.060 (60%)</div>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('Klinik Pratama', 45000000, 60)}
                className="p-2.5 text-left rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-800">
                  <Building2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Klinik Pratama</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">Rp 45.000.000 (60%)</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Summary Card: Alokasi Output */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
                Hasil Kalkulasi Alokasi
              </span>
              <h4 className="text-base font-bold text-slate-800 mt-1">
                Periode {setup.bulan} {setup.tahun}
              </h4>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
              <span className="text-xs text-slate-300 block">Total Dana Alokasi Jaspel (Target):</span>
              <span className="text-2xl font-black font-mono tracking-tight text-emerald-400 block">
                {formatRupiah(setup.totalAlokasi)}
              </span>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                Persis {setup.alokasiPersen}% dari Total Kapitasi {formatRupiah(setup.totalKapitasi)}
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Alokasi Jasa Pelayanan ({setup.alokasiPersen}%):</span>
                <span className="font-bold text-slate-800 font-mono">{formatRupiah(setup.totalAlokasi)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Sisa Operasional Pelayanan ({100 - setup.alokasiPersen}%):</span>
                <span className="font-bold text-slate-800 font-mono">
                  {formatRupiah(setup.totalKapitasi - setup.totalAlokasi)}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span>Tanggal Hitung:</span>
                <span className="font-mono text-slate-800">{setup.tanggalHitung}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
            <div className="flex items-center space-x-1.5 font-bold mb-0.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Algoritma Penyeimbang Siap</span>
            </div>
            Nominal {formatRupiah(setup.totalAlokasi)} akan didistribusikan 100% tanpa selisih desimal menggunakan Largest Remainder Method.
          </div>
        </div>
      </div>

      {/* Bagian Bawah: List History Bulan-bulan Sebelumnya */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Riwayat Alokasi Jasa Pelayanan Bulan-Bulan Sebelumnya
              </h3>
              <p className="text-[11px] text-slate-500">
                Daftar arsip besaran dana kapitasi, persentase alokasi, dan dokumen jaspel periode lampau
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-500 font-medium">
            {historyRecords.length} Periode Tersimpan
          </span>
        </div>

        {historyRecords.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Belum ada riwayat periode tersimpan. Klik tombol <strong>Simpan Alokasi Periode Ini</strong> di atas untuk mengarsipkan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 w-10 text-center">No</th>
                  <th className="px-4 py-3 min-w-[130px]">Periode</th>
                  <th className="px-4 py-3 text-right">Total Kapitasi (100%)</th>
                  <th className="px-4 py-3 text-center w-24">Alokasi</th>
                  <th className="px-4 py-3 text-right">Dana Jaspel (Netto)</th>
                  <th className="px-4 py-3 text-center">Penerima</th>
                  <th className="px-4 py-3 text-center">Tgl Simpan</th>
                  <th className="px-4 py-3 text-center w-48">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyRecords.map((hist, idx) => (
                  <tr key={hist.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{hist.bulan} {hist.tahun}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800">
                      {formatRupiah(hist.totalKapitasi)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {hist.alokasiPersen}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">
                      {formatRupiah(hist.totalAlokasi)}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-slate-600">
                      {hist.totalPenerima} Orang
                    </td>
                    <td className="px-4 py-3 text-center text-slate-500 font-mono text-[11px]">
                      {hist.tanggalHitung}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        {onOpenKwitansiForHistory && (
                          <button
                            type="button"
                            onClick={() => onOpenKwitansiForHistory(hist)}
                            className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors"
                            title="Buka Kwitansi Global tanda tangan bulan ini"
                          >
                            <Receipt className="w-3 h-3 text-slate-600" />
                            <span>Kwitansi</span>
                          </button>
                        )}

                        {onLoadPeriod && (
                          <button
                            type="button"
                            onClick={() => onLoadPeriod(hist)}
                            className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-medium transition-colors"
                            title="Muat alokasi ini sebagai periode aktif"
                          >
                            <ArrowRight className="w-3 h-3 text-indigo-600" />
                            <span>Muat</span>
                          </button>
                        )}

                        {onDeleteHistoryRecord && (
                          <button
                            type="button"
                            onClick={() => onDeleteHistoryRecord(hist.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Hapus riwayat periode ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
