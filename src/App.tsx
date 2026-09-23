import React, { useState, useEffect, useMemo } from 'react';
import { 
  Employee, 
  KapitasiSetup, 
  CalculatedEmployee, 
  GoogleSheetsConfig, 
  AttendanceImportRow,
  KwitansiPejabat,
  JaspelHistoryRecord
} from './types/jaspel';
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_SETUP, 
  DEFAULT_PEJABAT, 
  buildInitialHistory 
} from './data/initialData';
import { calculateJaspel } from './lib/calculateJaspel';
import { Header, AppTab } from './components/layout/Header';
import { JaspelTable } from './components/JaspelTable';
import { KwitansiGlobalView } from './components/KwitansiGlobalView';
import { HistoryJaspelView } from './components/HistoryJaspelView';
import { EmployeesManager } from './components/EmployeesManager';
import { ImportCSV } from './components/ImportCSV';
import { KapitasiSetupView } from './components/KapitasiSetupView';
import { VercelGuideModal } from './components/VercelGuideModal';
import { NextJsCodeExport } from './components/NextJsCodeExport';
import { SlipGajiModal } from './components/SlipGajiModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('reports');

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('jaspel_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [setup, setSetup] = useState<KapitasiSetup>(() => {
    const saved = localStorage.getItem('jaspel_setup');
    return saved ? JSON.parse(saved) : INITIAL_SETUP;
  });

  const [pejabat, setPejabat] = useState<KwitansiPejabat>(() => {
    const saved = localStorage.getItem('jaspel_pejabat');
    return saved ? JSON.parse(saved) : DEFAULT_PEJABAT;
  });

  const [historyRecords, setHistoryRecords] = useState<JaspelHistoryRecord[]>(() => {
    const saved = localStorage.getItem('jaspel_history');
    return saved ? JSON.parse(saved) : buildInitialHistory();
  });

  const [selectedKwitansiPeriod, setSelectedKwitansiPeriod] = useState<string>('CURRENT');

  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>({
    spreadsheetId: '',
    isConfigured: false,
    authMethod: 'not_set',
  });

  const [selectedSlipEmployee, setSelectedSlipEmployee] = useState<CalculatedEmployee | null>(null);
  const [activeSlipSetup, setActiveSlipSetup] = useState<KapitasiSetup>(setup);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitializingTabs, setIsInitializingTabs] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Simpan ke localStorage saat state berubah
  useEffect(() => {
    localStorage.setItem('jaspel_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('jaspel_setup', JSON.stringify(setup));
  }, [setup]);

  useEffect(() => {
    localStorage.setItem('jaspel_pejabat', JSON.stringify(pejabat));
  }, [pejabat]);

  useEffect(() => {
    localStorage.setItem('jaspel_history', JSON.stringify(historyRecords));
  }, [historyRecords]);

  // Fetch status koneksi Google Sheets dari server backend
  const fetchSheetsStatus = async () => {
    try {
      const res = await fetch('/api/sheets/config');
      const data = await res.json();
      setSheetsConfig(data);
    } catch (err) {
      console.warn('Gagal memuat status Google Sheets config:', err);
    }
  };

  useEffect(() => {
    fetchSheetsStatus();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Kalkulasi reaktif Jaspel menggunakan Largest Remainder Method (Hare-Niemeyer)
  const calculation = useMemo(() => {
    return calculateJaspel(employees, setup.totalAlokasi);
  }, [employees, setup.totalAlokasi]);

  // Handler simpan periode berjalan ke riwayat arsip
  const handleSaveCurrentToHistory = (note?: string) => {
    const recordId = `${setup.tahun}-${String(new Date(setup.tanggalHitung || Date.now()).getMonth() + 1).padStart(2, '0')}`;
    const tax15 = calculation.employees
      .filter((e) => e.taxRate >= 0.15)
      .reduce((s, e) => s + e.tax, 0);
    const tax5 = calculation.employees
      .filter((e) => e.taxRate < 0.15 && e.taxRate > 0)
      .reduce((s, e) => s + e.tax, 0);

    const newRecord: JaspelHistoryRecord = {
      id: recordId,
      bulan: setup.bulan,
      tahun: setup.tahun,
      totalKapitasi: setup.totalKapitasi,
      alokasiPersen: setup.alokasiPersen,
      totalAlokasi: setup.totalAlokasi,
      tanggalHitung: setup.tanggalHitung,
      maxAttendance: setup.maxAttendance,
      totalPenerima: calculation.employees.length,
      totalBruto: calculation.totalBruto,
      totalTax: calculation.totalTax,
      totalTax15: tax15,
      totalTax5: tax5,
      totalFpk1: calculation.totalFpk1,
      totalFpk4: calculation.totalFpk4,
      totalNetto: calculation.totalNetto,
      calculation: calculation,
      pejabat: pejabat,
      savedAt: new Date().toISOString(),
    };

    setHistoryRecords((prev) => {
      const filtered = prev.filter(
        (r) => !(r.bulan === setup.bulan && r.tahun === setup.tahun)
      );
      return [newRecord, ...filtered];
    });

    showToast(
      `Hasil Jaspel ${setup.bulan} ${setup.tahun} berhasil dibekukan dan disimpan ke Riwayat!`,
      'success'
    );
  };

  // Resolve data aktif untuk Kwitansi Global (Bisa periode berjalan atau periode riwayat lampau)
  const kwitansiData = useMemo(() => {
    if (selectedKwitansiPeriod === 'CURRENT') {
      return {
        employees: calculation.employees,
        setup: setup,
      };
    }
    const hist = historyRecords.find(
      (r) => `${r.bulan}-${r.tahun}` === selectedKwitansiPeriod
    );
    if (hist) {
      return {
        employees: hist.calculation.employees,
        setup: {
          bulan: hist.bulan,
          tahun: hist.tahun,
          totalKapitasi: hist.totalKapitasi,
          alokasiPersen: hist.alokasiPersen,
          totalAlokasi: hist.totalAlokasi,
          maxAttendance: hist.maxAttendance,
          tanggalHitung: hist.tanggalHitung,
        },
      };
    }
    return {
      employees: calculation.employees,
      setup: setup,
    };
  }, [selectedKwitansiPeriod, calculation, setup, historyRecords]);

  // List available periods for Kwitansi dropdown
  const availablePeriods = useMemo(() => {
    const list = [
      {
        bulan: setup.bulan,
        tahun: setup.tahun,
        label: `${setup.bulan} ${setup.tahun} (Bulan Berjalan)`,
      },
    ];
    historyRecords.forEach((h) => {
      if (!(h.bulan === setup.bulan && h.tahun === setup.tahun)) {
        list.push({
          bulan: h.bulan,
          tahun: h.tahun,
          label: `${h.bulan} ${h.tahun} (Riwayat)`,
        });
      }
    });
    return list;
  }, [setup.bulan, setup.tahun, historyRecords]);

  // Handler update kehadiran dari CSV
  const handleApplyAttendance = (records: AttendanceImportRow[]) => {
    const recordMap = new Map<string, number>();
    records.forEach((r) => {
      if (r.nip && r.nip !== '-') {
        recordMap.set(r.nip.replace(/[^0-9]/g, ''), r.attendance);
      }
      recordMap.set(r.name.toLowerCase().trim(), r.attendance);
    });

    const updated = employees.map((emp) => {
      const cleanNip = emp.nip.replace(/[^0-9]/g, '');
      const matchByNip = cleanNip ? recordMap.get(cleanNip) : undefined;
      const matchByName = recordMap.get(emp.name.toLowerCase().trim());
      const matchAtt = matchByNip !== undefined ? matchByNip : matchByName;
      if (matchAtt !== undefined) {
        return { ...emp, attendance: Number(matchAtt), maxAttendance: setup.maxAttendance };
      }
      return emp;
    });

    setEmployees(updated);
    showToast(`Kehadiran ${records.length} pegawai berhasil diterapkan ke kalkulasi Jaspel!`, 'success');
  };

  // Handler Employee CRUD
  const handleAddEmployee = (emp: Employee) => {
    setEmployees((prev) => [...prev, emp]);
    showToast(`Pegawai ${emp.name} berhasil ditambahkan!`, 'success');
  };

  const handleUpdateEmployee = (emp: Employee) => {
    setEmployees((prev) => prev.map((e) => (e.id === emp.id ? emp : e)));
    showToast(`Data pegawai ${emp.name} diperbarui!`, 'success');
  };

  const handleDeleteEmployee = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    showToast(`Pegawai ${emp?.name || ''} dihapus dari Master.`, 'info');
  };

  // Sync Hasil Perhitungan ke Google Sheets
  const handlePushResultsToSheets = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-results',
          bulan: setup.bulan,
          tahun: setup.tahun,
          results: calculation.employees,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Also save setup
        await fetch('/api/sheets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'save-setup',
            setup,
          }),
        });
        showToast('Hasil Jaspel & Periode Kapitasi tersinkronisasi ke Google Sheets!', 'success');
      } else {
        showToast(
          data.error || 'Gagal menyimpan ke Google Sheets. Cek kredensial di tab Deployment Vercel.',
          'error'
        );
      }
    } catch (err: any) {
      showToast(`Koneksi gagal: ${err.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync Master Pegawai ke Google Sheets
  const handlePushEmployeesToSheets = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-employees',
          employees,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Master Karyawan berhasil disimpan ke Google Sheets!', 'success');
      } else {
        showToast(
          data.error || 'Gagal menyimpan. Pastikan Service Account memiliki akses Editor.',
          'error'
        );
      }
    } catch (err: any) {
      showToast(`Koneksi gagal: ${err.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Inisialisasi otomatis 4 Sheet Tab di Spreadsheet
  const handleInitSheetsTabs = async () => {
    setIsInitializingTabs(true);
    try {
      const res = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'init-tabs' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          'Tab Master_Karyawan, Data_Absensi, Periode_Kapitasi, & Hasil_Perhitungan berhasil disiapkan!',
          'success'
        );
        await fetchSheetsStatus();
      } else {
        showToast(data.error || 'Gagal inisialisasi tab.', 'error');
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsInitializingTabs(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 transition-all duration-300 transform translate-y-0 no-print">
          <div
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : toast.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sheetsConfig={sheetsConfig}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
      />

      {/* Main App Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'reports' && (
          <JaspelTable
            calculation={calculation}
            setup={setup}
            onOpenSlip={(emp) => {
              setSelectedSlipEmployee(emp);
              setActiveSlipSetup(setup);
            }}
            onPushToGoogleSheets={handlePushResultsToSheets}
            onOpenKwitansi={() => {
              setSelectedKwitansiPeriod('CURRENT');
              setActiveTab('kwitansi');
            }}
            isSyncingToSheets={isSyncing}
          />
        )}

        {activeTab === 'kwitansi' && (
          <KwitansiGlobalView
            employees={kwitansiData.employees}
            setup={kwitansiData.setup}
            pejabat={pejabat}
            onUpdatePejabat={(newP) => {
              setPejabat(newP);
              showToast('Data pejabat penandatangan berhasil diperbarui!', 'success');
            }}
            availablePeriods={availablePeriods}
            onSelectPeriod={(b, t) => {
              if (b === setup.bulan && t === setup.tahun) {
                setSelectedKwitansiPeriod('CURRENT');
              } else {
                setSelectedKwitansiPeriod(`${b}-${t}`);
              }
            }}
          />
        )}

        {activeTab === 'history' && (
          <HistoryJaspelView
            historyRecords={historyRecords}
            onSaveCurrentToHistory={handleSaveCurrentToHistory}
            currentSetup={setup}
            currentCalculationEmployees={calculation.employees}
            pejabat={pejabat}
            onOpenKwitansiForHistory={(record) => {
              setSelectedKwitansiPeriod(`${record.bulan}-${record.tahun}`);
              setActiveTab('kwitansi');
            }}
            onPrintSlipForEmployee={(emp, periodSetup) => {
              setSelectedSlipEmployee(emp);
              setActiveSlipSetup(periodSetup);
            }}
            onDeleteHistoryRecord={(id) => {
              setHistoryRecords((prev) => prev.filter((r) => r.id !== id));
              showToast('Riwayat berhasil dihapus.', 'info');
            }}
          />
        )}

        {activeTab === 'employees' && (
          <EmployeesManager
            employees={employees}
            onAddEmployee={handleAddEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            onPushToGoogleSheets={handlePushEmployeesToSheets}
            isSyncingToSheets={isSyncing}
          />
        )}

        {activeTab === 'attendance' && (
          <ImportCSV
            employees={employees}
            bulan={setup.bulan}
            tahun={setup.tahun}
            maxAttendance={setup.maxAttendance}
            onApplyAttendance={handleApplyAttendance}
          />
        )}

        {activeTab === 'setup' && (
          <KapitasiSetupView
            setup={setup}
            onUpdateSetup={setSetup}
          />
        )}

        {activeTab === 'vercel' && (
          <VercelGuideModal />
        )}

        {activeTab === 'code' && (
          <NextJsCodeExport />
        )}
      </main>

      {/* Modals */}
      <SlipGajiModal
        employee={selectedSlipEmployee}
        setup={activeSlipSetup}
        onClose={() => setSelectedSlipEmployee(null)}
      />

      <GoogleSheetsModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        config={sheetsConfig}
        onRefreshStatus={fetchSheetsStatus}
        onInitTabs={handleInitSheetsTabs}
        isInitializingTabs={isInitializingTabs}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            <span className="font-semibold text-slate-700">Jaspel Zero Data Entry</span> • Otomasi Jasa Pelayanan Kesehatan terintegrasi Google Sheets API & Dokumen Kwitansi Resmi
          </div>
          <div className="flex items-center space-x-3">
            <span>Permenkes No. 6/2022</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">Hare-Niemeyer Largest Remainder</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
