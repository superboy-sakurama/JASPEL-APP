import React, { useState } from 'react';
import { GoogleSheetsConfig } from '../types/jaspel';
import { 
  Cloud, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink, 
  Share2, 
  ShieldCheck,
  Check
} from 'lucide-react';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GoogleSheetsConfig;
  onRefreshStatus: () => Promise<void>;
  onInitTabs: () => Promise<void>;
  isInitializingTabs?: boolean;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  config,
  onRefreshStatus,
  onInitTabs,
  isInitializingTabs = false,
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

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
    { name: 'Master_Karyawan', desc: 'Menyimpan master profil, jabatan, status ASN, & poin SK' },
    { name: 'Data_Absensi', desc: 'Menyimpan riwayat absensi bulanan dari mesin finger' },
    { name: 'Periode_Kapitasi', desc: 'Menyimpan data total dana BPJS diterima & alokasi 60%' },
    { name: 'Hasil_Perhitungan', desc: 'Menyimpan hasil transfer Jaspel, PPh 21, FPK 1%, & Netto' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Status Integrasi Google Sheets API (Zero Data Entry)
              </h3>
              <p className="text-[11px] text-slate-500">
                Koneksi Server-to-Server menggunakan Google Cloud Service Account
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Status Indicator Box */}
          <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
            config.isConfigured
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            {config.isConfigured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <span className="font-bold block text-sm">
                {config.isConfigured
                  ? 'Tersambung ke Google Spreadsheet'
                  : 'Mode Standalone / Belum Terhubung Live'}
              </span>
              <p className="text-xs opacity-90 leading-relaxed">
                {config.isConfigured
                  ? 'Aplikasi membaca dan menulis data langsung ke Google Sheets secara real-time.'
                  : 'Aplikasi saat ini berjalan dalam mode mandiri (data tersimpan di memori & browser). Untuk mengaktifkan sinkronisasi otomatis, masukkan SPREADSHEET_ID dan kredensial Service Account.'}
              </p>
            </div>
          </div>

          {/* Spreadsheet ID & Email Details */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">SPREADSHEET_ID:</span>
              <span className="font-mono font-bold text-slate-800">
                {config.spreadsheetId || '(Belum diset di ENV)'}
              </span>
            </div>
            {config.clientEmail && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Service Account Email:</span>
                <span className="font-mono font-semibold text-slate-700 truncate max-w-[260px]">
                  {config.clientEmail}
                </span>
              </div>
            )}
          </div>

          {/* Verification of the 4 Required Database Sheets */}
          <div className="space-y-2">
            <span className="font-bold text-slate-800 block">
              Struktur Database Google Sheets:
            </span>
            <div className="grid grid-cols-1 gap-2">
              {expectedTabs.map((tab) => {
                const isFound = config.sheetsFound?.includes(tab.name);
                return (
                  <div
                    key={tab.name}
                    className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono font-bold text-slate-800">{tab.name}</span>
                        {isFound && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                            Aktif
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">{tab.desc}</span>
                    </div>

                    <div>
                      {isFound ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <span className="text-[10px] text-slate-400">Belum dibuat</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Test connection result display if any */}
          {testResult && (
            <div className={`p-3 rounded-lg border text-xs ${
              testResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <span className="font-bold block">Hasil Test Koneksi:</span>
              {testResult.success ? (
                <div>
                  Berhasil terhubung ke spreadsheet: <b>{testResult.title}</b> ({testResult.sheets?.length} sheets ditemukan).
                </div>
              ) : (
                <div>Gagal: {testResult.error}</div>
              )}
            </div>
          )}

          {/* 3 Step Setup Reminder */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 text-[11px] text-slate-600">
            <span className="font-bold text-slate-800 flex items-center space-x-1">
              <Share2 className="w-3.5 h-3.5 text-sky-600" />
              <span>Langkah Menghubungkan Google Sheets:</span>
            </span>
            <ol className="list-decimal list-inside space-y-1 pl-1">
              <li>Buat Google Spreadsheet baru di Google Drive Anda.</li>
              <li>Klik tombol <b>Bagikan (Share)</b>, lalu masukkan email Service Account sebagai <b>Editor</b>.</li>
              <li>Salin ID Spreadsheet dari tautan browser ke file <code className="font-mono text-slate-800">.env</code> atau Vercel ENV.</li>
            </ol>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              onClick={handleTest}
              disabled={isTesting}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Menguji Koneksi...' : 'Uji Koneksi Sheets'}</span>
            </button>

            <button
              onClick={onInitTabs}
              disabled={isInitializingTabs}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors disabled:opacity-50"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isInitializingTabs ? 'Membuat Tab...' : 'Inisialisasi 4 Tab Otomatis'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
