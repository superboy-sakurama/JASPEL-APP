import React from 'react';
import { 
  Menu, 
  Cloud, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Receipt,
  FileText
} from 'lucide-react';
import { AppMenuId } from './Sidebar';
import { GoogleSheetsConfig, InstansiConfig, KapitasiSetup } from '../../types/jaspel';

interface TopBarProps {
  activeMenu: AppMenuId;
  onOpenMobileMenu: () => void;
  instansi: InstansiConfig;
  setup: KapitasiSetup;
  sheetsConfig: GoogleSheetsConfig;
  onOpenSheetsModal: () => void;
  onQuickKwitansi: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeMenu,
  onOpenMobileMenu,
  instansi,
  setup,
  sheetsConfig,
  onOpenSheetsModal,
  onQuickKwitansi,
}) => {
  const getMenuInfo = (): { title: string; subtitle: string; tag: string } => {
    switch (activeMenu) {
      case 'pengaturan-instansi':
        return {
          title: 'Data Instansi & Pejabat',
          subtitle: 'Pengaturan identitas puskesmas/klinik dan pejabat penandatangan kwitansi',
          tag: 'Pengaturan',
        };
      case 'pengaturan-pegawai':
        return {
          title: 'Data Pegawai (Master Karyawan)',
          subtitle: 'Master data NIP, status kepegawaian, jabatan, tugas tambahan, dan pemegang program',
          tag: 'Pengaturan',
        };
      case 'pengaturan-poin':
        return {
          title: 'Data Poin Jaspel',
          subtitle: 'Konfigurasi bobot poin penilaian status, ketenagaan, tugas administrasi, dan program pelayanan',
          tag: 'Pengaturan',
        };
      case 'pengaturan-masa-kerja':
        return {
          title: 'Prosentase Masa Kerja Honorer',
          subtitle: 'Tabel berjenjang persentase masa kerja tenaga honorer (Non-ASN)',
          tag: 'Pengaturan',
        };
      case 'alokasi':
        return {
          title: 'Alokasi Jasa Pelayanan',
          subtitle: 'Pengaturan dana kapitasi BPJS 60% dan daftar riwayat bulan-bulan sebelumnya',
          tag: 'Dana Kapitasi',
        };
      case 'absensi':
        return {
          title: 'Import Absensi Kehadiran',
          subtitle: 'Upload file absensi pegawai dan sinkronisasi hari hadir ke perhitungan jaspel',
          tag: 'Absensi',
        };
      case 'hitung-poin':
        return {
          title: 'Hitung Poin Seluruh Aspek & PFK BPJS',
          subtitle: 'Lembar perhitungan komprehensif poin dasar, rincian program, PFK BPJS, dan bobot kehadiran',
          tag: 'Hitung Poin',
        };
      case 'balancing':
        return {
          title: 'Hasil & Balancing Jaspel (Largest Remainder)',
          subtitle: 'Rincian nominal bruto, potongan pajak PPh 21, iuran BPJS 1%, dan netto final zero selisih',
          tag: 'Balancing Jaspel',
        };
      case 'kwitansi':
        return {
          title: 'Kwitansi Global (Tanda Tangan)',
          subtitle: 'Dokumen bukti pengeluaran resmi puskesmas siap cetak A4 landscape & ekspor Excel',
          tag: 'Kwitansi Global',
        };
      case 'history':
        return {
          title: 'History Jaspel Bulan Sebelumnya',
          subtitle: 'Arsip rekapitulasi kapitasi dan rincian pembagian jaspel periode terdahulu',
          tag: 'History Arsip',
        };
      case 'code':
        return {
          title: 'Struktur Arsitektur Next.js App Router',
          subtitle: 'Dokumentasi struktur folder, API router, dan modul sistem jaspel',
          tag: 'Arsitektur',
        };
      case 'vercel':
        return {
          title: 'Panduan Deployment Vercel & Google API',
          subtitle: 'Langkah instalasi kredensial Google Service Account & produksi',
          tag: 'Panduan',
        };
      default:
        return {
          title: 'Sistem Jaspel Zero Data Entry',
          subtitle: 'Otomasi pembagian jasa pelayanan kesehatan',
          tag: 'Jaspel',
        };
    }
  };

  const menuInfo = getMenuInfo();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 no-print">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile hamburger & breadcrumbs */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            title="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
                {menuInfo.tag}
              </span>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                {menuInfo.title}
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block truncate max-w-xl">
              {menuInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right Action Widgets */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Active Period Badge */}
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>{setup.bulan} {setup.tahun}</span>
          </div>

          {/* Quick Kwitansi button */}
          <button
            onClick={onQuickKwitansi}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors"
            title="Buka lembar tanda tangan kwitansi global"
          >
            <Receipt className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Kwitansi Global</span>
          </button>

          {/* Google Sheets API status */}
          <button
            onClick={onOpenSheetsModal}
            className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              sheetsConfig.isConfigured
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
            title="Status sinkronisasi Google Sheets"
          >
            <Cloud className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">Google Sheets</span>
            {sheetsConfig.isConfigured ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
