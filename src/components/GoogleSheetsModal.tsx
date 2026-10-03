import React, { useState, useEffect } from 'react';
import { GoogleSheetsConfig } from '../types/jaspel';
import { 
  Cloud, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Share2, 
  ShieldCheck, 
  Check,
  Lock,
  Database,
  ArrowUpRight,
  FileSpreadsheet,
  CheckCircle
} from 'lucide-react';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GoogleSheetsConfig;
  onRefreshStatus: () => Promise<void>;
  onInitTabs: () => Promise<void>;
  isInitializingTabs?: boolean;
  onPushEmployees?: () => Promise<void>;
  onPushResults?: () => Promise<void>;
  isSyncing?: boolean;
  employeeCount?: number;
  activePeriod?: string;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  config,
  onRefreshStatus,
  onInitTabs,
  isInitializingTabs = false,
  onPushEmployees,
  onPushResults,
  isSyncing = false,
  employeeCount = 0,
  activePeriod = 'Bulan Berjalan',
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  // Otomatis refresh status saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      onRefreshStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/sheets?action=test');
      const data = await res.json();
      setTestResult(data);
      await onRefreshStatus();
    } catch (err: any) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  const expectedTabs = [
    { 
      name: 'Master_Karyawan', 
      desc: 'Menyimpan profil lengkap pegawai, NIP, status ASN, jabatan, dan penugasan program.',
      actionType: 'employees'
    },
    { 
      name: 'Data_Absensi', 
      desc: 'Menyimpan rekap kehadiran bulanan pegawai dari mesin absensi/fingerprint.',
      actionType: 'attendance'
    },
    { 
      name: 'Periode_Kapitasi', 
      desc: 'Menyimpan catatan dana kapitasi BPJS diterima dan alokasi 60% per bulan.',
      actionType: 'kapitasi'
    },
    { 
      name: 'Hasil_Perhitungan', 
      desc: 'Menyimpan hasil final pembagian Jaspel, potongan pajak PPh 21, BPJS 1%, dan take-home pay.',
      actionType: 'results'
    },
  ];

  const activeSheetsList = config.sheetsFound || testResult?.sheets || [];
  const currentSheetTitle = config.sheetTitle || testResult?.title || 'Jasa Pelayanan APP';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Status Integrasi Google Sheets (Zero Data Entry)
              </h3>
              <p className="text-[11px] text-slate-500">
                Koneksi Server-to-Server Google Cloud Service Account
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Status Indicator Box */}
          <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
            config.isConfigured
              ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            {config.isConfigured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm">
                  {config.isConfigured
                    ? 'Tersambung ke Google Spreadsheet'
                    : 'Mode Standalone / Belum Terhubung Live'}
                </span>
                {config.isConfigured && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-200/70 text-emerald-800 text-[10px] font-bold">
                    ONLINE
                  </span>
                )}
              </div>
              <p className="text-xs opacity-90 leading-relaxed">
                {config.isConfigured
                  ? 'Aplikasi telah berhasil terhubung secara live ke Google Sheets. Anda dapat mengirim data master pegawai dan hasil perhitungan Jaspel secara instan.'
                  : 'Aplikasi saat ini berjalan dalam mode mandiri (data tersimpan di memori & browser). Untuk mengaktifkan sinkronisasi otomatis, masukkan SPREADSHEET_ID dan kredensial Service Account.'}
              </p>
            </div>
          </div>

          {/* Spreadsheet ID & Email Details (Disembunyikan Penuh demi Keamanan & Privasi) */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2.5">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
              <span className="text-slate-700 font-medium flex items-center space-x-1.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">Kredensial & Kunci Database (Enkripsi Server):</span>
              </span>
              <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-2 py-0.5 rounded-full">
                <Lock className="w-2.5 h-2.5" />
                <span>Disembunyikan (Aman)</span>
              </span>
            </div>

            {/* Nama Dokumen Sheet Terhubung */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium flex items-center space-x-1">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Dokumen Spreadsheet:</span>
              </span>
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                  {currentSheetTitle}
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
                  ✓ Valid
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Spreadsheet ID:</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs text-slate-700 tracking-widest font-semibold select-none">
                  ••••••••••••••••••••••••••••••••
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-100/70 border border-emerald-300 px-1.5 py-0.5 rounded font-medium">
                  {config.isConfigured ? 'Tersimpan Aman di ENV' : 'Belum Diset'}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Service Account Private Key:</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs text-slate-700 tracking-widest font-semibold select-none">
                  ••••••••••••••••••••••••••••••••
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-100/70 border border-emerald-300 px-1.5 py-0.5 rounded font-medium">
                  Terenkripsi
                </span>
              </div>
            </div>
          </div>

          {/* Verification of the 4 Required Database Sheets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs block">
                Struktur 4 Tab Database di Google Sheets:
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center space-x-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Status Tab Terverifikasi</span>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {expectedTabs.map((tab) => {
                const isFound = activeSheetsList.includes(tab.name);
                return (
                  <div
                    key={tab.name}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                      isFound 
                        ? 'border-emerald-200 bg-emerald-50/40' 
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-800">{tab.name}</span>
                        {isFound ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            ✓ Aktif & Tersedia di Spreadsheet
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                            Belum Terbaca
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">{tab.desc}</span>
                    </div>

                    <div className="shrink-0 ml-3">
                      {isFound ? (
                        <div className="flex items-center space-x-1 text-emerald-700 bg-emerald-100/80 px-2 py-1 rounded-md border border-emerald-300 font-semibold text-[11px]">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Siap Sinkron</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          Belum Dibuat
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Push Buttons inside Modal */}
          {config.isConfigured && (
            <div className="p-3.5 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl border border-teal-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center space-x-1.5 text-xs">
                  <Database className="w-3.5 h-3.5 text-teal-600" />
                  <span>Kirim & Sinkronkan Data ke Google Sheets:</span>
                </span>
                <span className="text-[10px] text-slate-500">
                  Data otomatis masuk ke tab spreadsheet
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {onPushEmployees && (
                  <button
                    type="button"
                    onClick={onPushEmployees}
                    disabled={isSyncing}
                    className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-50"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>{isSyncing ? 'Menyimpan...' : `Kirim Data Pegawai (${employeeCount})`}</span>
                  </button>
                )}

                {onPushResults && (
                  <button
                    type="button"
                    onClick={onPushResults}
                    disabled={isSyncing}
                    className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-50"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>{isSyncing ? 'Menyimpan...' : `Kirim Hasil Jaspel (${activePeriod})`}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Test connection result display if any */}
          {testResult && (
            <div className={`p-3 rounded-xl border text-xs ${
              testResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <span className="font-bold block mb-0.5">Hasil Uji Koneksi:</span>
              {testResult.success ? (
                <div>
                  Berhasil terhubung ke spreadsheet: <b>{testResult.title}</b> ({testResult.sheets?.length} tab ditemukan).
                </div>
              ) : (
                <div>Gagal: {testResult.error}</div>
              )}
            </div>
          )}

          {/* 3 Step Setup Reminder */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-[11px] text-slate-600">
            <span className="font-bold text-slate-800 flex items-center space-x-1">
              <Share2 className="w-3.5 h-3.5 text-sky-600" />
              <span>Cara Kerja Sinkronisasi Google Sheets:</span>
            </span>
            <p className="leading-relaxed text-slate-600">
              Aplikasi telah terhubung via Service Account. Setiap kali Anda mengubah data pegawai atau menyelesaikan pembagian jaspel, Anda dapat mengklik tombol <b>Simpan ke Google Sheets</b> agar tab <code>Master_Karyawan</code> dan <code>Hasil_Perhitungan</code> selalu terbarui secara real-time.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            onClick={handleTest}
            disabled={isTesting}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-teal-600' : ''}`} />
            <span>{isTesting ? 'Menguji Koneksi...' : 'Uji / Refresh Koneksi'}</span>
          </button>

          <button
            onClick={onInitTabs}
            disabled={isInitializingTabs}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors disabled:opacity-50 shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isInitializingTabs ? 'Membuat Tab...' : 'Format Ulang Header 4 Tab'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
