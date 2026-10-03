import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Award, 
  Percent, 
  Calculator, 
  Sliders, 
  FileSpreadsheet, 
  Scale, 
  Receipt, 
  History, 
  ChevronDown, 
  ChevronRight, 
  Settings, 
  Cloud, 
  Code, 
  X,
  HeartPulse
} from 'lucide-react';
import { GoogleSheetsConfig, InstansiConfig } from '../../types/jaspel';

export type AppMenuId = 
  | 'pengaturan-instansi'
  | 'pengaturan-pegawai'
  | 'pengaturan-poin'
  | 'pengaturan-masa-kerja'
  | 'alokasi'
  | 'absensi'
  | 'hitung-poin'
  | 'balancing'
  | 'kwitansi'
  | 'pfk-bpjs'
  | 'history'
  | 'code'
  | 'vercel';

interface SidebarProps {
  activeMenu: AppMenuId;
  setActiveMenu: (menu: AppMenuId) => void;
  instansi: InstansiConfig;
  sheetsConfig: GoogleSheetsConfig;
  onOpenSheetsModal: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeMenu,
  setActiveMenu,
  instansi,
  sheetsConfig,
  onOpenSheetsModal,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const isPengaturanActive = activeMenu.startsWith('pengaturan-');
  const [isPengaturanOpen, setIsPengaturanOpen] = useState(true);

  const handleSelectMenu = (menu: AppMenuId) => {
    setActiveMenu(menu);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden no-print"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 no-print ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand / Faskes Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shrink-0">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs font-bold text-white uppercase tracking-tight truncate" title={instansi.namaInstansi}>
                {instansi.namaInstansi || 'UPTD Puskesmas'}
              </h1>
              <p className="text-[10px] text-emerald-400 font-semibold tracking-wider">
                JASPEL ZERO DATA ENTRY
              </p>
            </div>
          </div>

          {/* Close button for mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation List: Exact Workflow Order without numbers */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 text-xs font-medium custom-scrollbar">
          
          {/* 1. PENGATURAN (Collapsible) */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setIsPengaturanOpen(!isPengaturanOpen)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                isPengaturanActive
                  ? 'bg-slate-800/90 text-white font-bold'
                  : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Settings className={`w-4 h-4 ${isPengaturanActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span className="text-xs">Pengaturan</span>
              </div>
              {isPengaturanOpen ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {isPengaturanOpen && (
              <div className="pl-5 pr-1 py-1 space-y-1 border-l-2 border-slate-800 ml-4 my-1">
                {/* Data Instansi & Pejabat */}
                <button
                  type="button"
                  onClick={() => handleSelectMenu('pengaturan-instansi')}
                  className={`w-full flex items-center space-x-2 px-2.5 py-2 rounded-lg text-[11px] transition-colors ${
                    activeMenu === 'pengaturan-instansi'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Data Instansi & Pejabat</span>
                </button>

                {/* Data Pegawai (Master) */}
                <button
                  type="button"
                  onClick={() => handleSelectMenu('pengaturan-pegawai')}
                  className={`w-full flex items-center space-x-2 px-2.5 py-2 rounded-lg text-[11px] transition-colors ${
                    activeMenu === 'pengaturan-pegawai'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Data Pegawai (Master)</span>
                </button>

                {/* Data Poin Jaspel */}
                <button
                  type="button"
                  onClick={() => handleSelectMenu('pengaturan-poin')}
                  className={`w-full flex items-center space-x-2 px-2.5 py-2 rounded-lg text-[11px] transition-colors ${
                    activeMenu === 'pengaturan-poin'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Data Poin Jaspel</span>
                </button>

                {/* Prosentase Masa Kerja */}
                <button
                  type="button"
                  onClick={() => handleSelectMenu('pengaturan-masa-kerja')}
                  className={`w-full flex items-center space-x-2 px-2.5 py-2 rounded-lg text-[11px] transition-colors ${
                    activeMenu === 'pengaturan-masa-kerja'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Percent className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Prosentase Masa Kerja</span>
                </button>
              </div>
            )}
          </div>

          {/* 2. ALOKASI JASA PELAYANAN */}
          <button
            type="button"
            onClick={() => handleSelectMenu('alokasi')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
              activeMenu === 'alokasi'
                ? 'bg-blue-600 text-white font-bold shadow-md'
                : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Sliders className={`w-4 h-4 ${activeMenu === 'alokasi' ? 'text-white' : 'text-blue-400'}`} />
              <span>Alokasi Jasa Pelayanan</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
              activeMenu === 'alokasi' ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-400'
            }`}>
              60%
            </span>
          </button>

          {/* 3. IMPORT ABSENSI */}
          <button
            type="button"
            onClick={() => handleSelectMenu('absensi')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
              activeMenu === 'absensi'
                ? 'bg-cyan-600 text-white font-bold shadow-md'
                : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <FileSpreadsheet className={`w-4 h-4 ${activeMenu === 'absensi' ? 'text-white' : 'text-cyan-400'}`} />
              <span>Import Absensi</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
              activeMenu === 'absensi' ? 'bg-cyan-700 text-cyan-100' : 'bg-slate-800 text-slate-400'
            }`}>
              CSV/Excel
            </span>
          </button>

          {/* 4. HITUNG POIN */}
          <button
            type="button"
            onClick={() => handleSelectMenu('hitung-poin')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
              activeMenu === 'hitung-poin'
                ? 'bg-emerald-600 text-white font-bold shadow-md'
                : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Calculator className={`w-4 h-4 ${activeMenu === 'hitung-poin' ? 'text-white' : 'text-emerald-400'}`} />
              <span>Hitung Poin</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
              activeMenu === 'hitung-poin' ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-800 text-emerald-400'
            }`}>
              PFK BPJS
            </span>
          </button>

          {/* 5. HASIL & BALANCING JASPEL */}
          <button
            type="button"
            onClick={() => handleSelectMenu('balancing')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
              activeMenu === 'balancing'
                ? 'bg-amber-600 text-white font-bold shadow-md'
                : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Scale className={`w-4 h-4 ${activeMenu === 'balancing' ? 'text-white' : 'text-amber-400'}`} />
              <span>Hasil & Balancing Jaspel</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
              activeMenu === 'balancing' ? 'bg-amber-700 text-amber-100' : 'bg-slate-800 text-amber-400'
            }`}>
              Zero Diff
            </span>
          </button>

          {/* 6. KWITANSI GLOBAL */}
          <button
            type="button"
            onClick={() => handleSelectMenu('kwitansi')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
              activeMenu === 'kwitansi'
                ? 'bg-rose-600 text-white font-bold shadow-md'
                : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Receipt className={`w-4 h-4 ${activeMenu === 'kwitansi' ? 'text-white' : 'text-rose-400'}`} />
              <span>Kwitansi Global (Tanda Tangan)</span>
            </div>
          </button>

          {/* 6.5 POTONGAN PFK BPJS */}
          <button
            type="button"
            onClick={() => handleSelectMenu('pfk-bpjs')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
              activeMenu === 'pfk-bpjs'
                ? 'bg-teal-600 text-white font-bold shadow-md'
                : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <HeartPulse className={`w-4 h-4 ${activeMenu === 'pfk-bpjs' ? 'text-white' : 'text-teal-400'}`} />
              <span>Potongan PFK BPJS</span>
            </div>
          </button>

          {/* 7. HISTORY */}
          <button
            type="button"
            onClick={() => handleSelectMenu('history')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
              activeMenu === 'history'
                ? 'bg-purple-600 text-white font-bold shadow-md'
                : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <History className={`w-4 h-4 ${activeMenu === 'history' ? 'text-white' : 'text-purple-400'}`} />
              <span>History</span>
            </div>
          </button>

          {/* Divider */}
          <div className="pt-3 border-t border-slate-800/80">
            <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Integrasi & Ekspor
            </span>

            {/* Google Sheets Trigger */}
            <button
              type="button"
              onClick={onOpenSheetsModal}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px]">Google Sheets API</span>
              </div>
              <span className={`w-2 h-2 rounded-full ${sheetsConfig.isConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            </button>

            {/* Next.js Code Export */}
            <button
              type="button"
              onClick={() => handleSelectMenu('code')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-[11px] transition-colors ${
                activeMenu === 'code' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-sky-400" />
              <span>Struktur Next.js Code</span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[10px] text-slate-400 space-y-1">
          <div className="flex items-center justify-between">
            <span>Algoritma Penyeimbang:</span>
            <span className="font-semibold text-emerald-400">Hare-Niemeyer</span>
          </div>
          <p className="text-[9px] text-slate-500">
            Regulasi: Permenkes No. 6 Tahun 2022
          </p>
        </div>
      </aside>
    </>
  );
};
