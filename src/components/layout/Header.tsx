import React from 'react';
import { 
  Calculator, 
  Users, 
  FileSpreadsheet, 
  Settings, 
  FileText, 
  Cloud, 
  Code, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { GoogleSheetsConfig } from '../../types/jaspel';

interface HeaderProps {
  activeTab: 'reports' | 'employees' | 'attendance' | 'setup' | 'vercel' | 'code';
  setActiveTab: (tab: 'reports' | 'employees' | 'attendance' | 'setup' | 'vercel' | 'code') => void;
  sheetsConfig: GoogleSheetsConfig;
  onOpenSheetsModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  sheetsConfig,
  onOpenSheetsModal,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-white shadow-sm">
              <Calculator className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-800 tracking-tight">
                  Jaspel Zero Data Entry
                </h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  BPJS Kapitasi 60%
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Sistem Otomasi Jasa Pelayanan Kesehatan & Integrasi Google Sheets API
              </p>
            </div>
          </div>

          {/* Right Action: Google Sheets Connection Status */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenSheetsModal}
              className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                sheetsConfig.isConfigured
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Cloud className={`w-4 h-4 ${sheetsConfig.isConfigured ? 'text-emerald-600' : 'text-slate-500'}`} />
              <span className="font-semibold">Google Sheets:</span>
              <span>{sheetsConfig.isConfigured ? 'Terhubung Live' : 'Mode Offline / Konfigurasi'}</span>
              {sheetsConfig.isConfigured ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-2 -mb-px overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center space-x-2 py-3 px-3.5 border-b-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'reports'
                ? 'border-slate-800 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Hasil & Balancing Jaspel</span>
          </button>

          <button
            onClick={() => setActiveTab('employees')}
            className={`flex items-center space-x-2 py-3 px-3.5 border-b-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'employees'
                ? 'border-slate-800 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Master Karyawan</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center space-x-2 py-3 px-3.5 border-b-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'attendance'
                ? 'border-slate-800 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Import Absensi CSV</span>
          </button>

          <button
            onClick={() => setActiveTab('setup')}
            className={`flex items-center space-x-2 py-3 px-3.5 border-b-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'setup'
                ? 'border-slate-800 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Konfigurasi Kapitasi</span>
          </button>

          <button
            onClick={() => setActiveTab('vercel')}
            className={`flex items-center space-x-2 py-3 px-3.5 border-b-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'vercel'
                ? 'border-slate-800 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Cloud className="w-4 h-4 text-sky-600" />
            <span>Deployment Vercel & ENV</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center space-x-2 py-3 px-3.5 border-b-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'code'
                ? 'border-slate-800 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Code className="w-4 h-4 text-indigo-600" />
            <span>Arsitektur Next.js Export</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
