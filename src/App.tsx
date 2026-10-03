import React, { useState, useEffect, useMemo } from 'react';
import { 
  Employee, 
  KapitasiSetup, 
  CalculatedEmployee, 
  GoogleSheetsConfig, 
  AttendanceImportRow,
  KwitansiPejabat,
  JaspelHistoryRecord,
  InstansiConfig,
  PoinJaspelConfig,
  MasaKerjaRule
} from './types/jaspel';
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_SETUP, 
  DEFAULT_PEJABAT, 
  DEFAULT_INSTANSI,
  buildInitialHistory 
} from './data/initialData';
import { 
  DEFAULT_POIN_JASPEL, 
  DEFAULT_MASA_KERJA_RULES,
  evaluateHitungPoinRow
} from './lib/pointCalculator';
import { calculateJaspel } from './lib/calculateJaspel';
import { Sidebar, AppMenuId } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { DataInstansiView } from './components/settings/DataInstansiView';
import { DataPoinJaspelView } from './components/settings/DataPoinJaspelView';
import { ProsentaseMasaKerjaView } from './components/settings/ProsentaseMasaKerjaView';
import { HitungPoinView } from './components/HitungPoinView';
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
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeMenu, setActiveMenu] = useState<AppMenuId>('balancing');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // 1a. Data Instansi & Pejabat State
  const [instansi, setInstansi] = useState<InstansiConfig>(() => {
    const saved = localStorage.getItem('jaspel_instansi');
    return saved ? JSON.parse(saved) : DEFAULT_INSTANSI;
  });

  // 1b. Master Data Karyawan State
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('jaspel_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  // 1c. Data Poin Jaspel Config State
  const [poinConfig, setPoinConfig] = useState<PoinJaspelConfig>(() => {
    const saved = localStorage.getItem('jaspel_poin_config');
    return saved ? JSON.parse(saved) : DEFAULT_POIN_JASPEL;
  });

  // 1d. Aturan Prosentase Masa Kerja Honorer State
  const [masaKerjaRules, setMasaKerjaRules] = useState<MasaKerjaRule[]>(() => {
    const saved = localStorage.getItem('jaspel_masa_kerja_rules');
    return saved ? JSON.parse(saved) : DEFAULT_MASA_KERJA_RULES;
  });

  // 3. Alokasi Jasa Pelayanan & Setup
  const [setup, setSetup] = useState<KapitasiSetup>(() => {
    const saved = localStorage.getItem('jaspel_setup');
    return saved ? JSON.parse(saved) : INITIAL_SETUP;
  });

  // Pejabat Penandatangan Kwitansi (Synced with Instansi)
  const [pejabat, setPejabat] = useState<KwitansiPejabat>(() => {
    const saved = localStorage.getItem('jaspel_pejabat');
    if (saved) return JSON.parse(saved);
    return {
      namaFaskes: DEFAULT_INSTANSI.namaInstansi,
      kodeInstansi: DEFAULT_INSTANSI.kodeInstansi,
      kodeRekeningBelanja: DEFAULT_INSTANSI.kodeRekeningBelanja,
      nomorDpa: DEFAULT_INSTANSI.nomorDpa,
      kpaTitle: 'Kuasa Pengguna Anggaran',
      kpaNama: DEFAULT_INSTANSI.namaKepala,
      kpaNip: DEFAULT_INSTANSI.nipKepala,
      kpaJabatan: DEFAULT_INSTANSI.jabatanKepala,
      namaPejabatKeuangan: DEFAULT_INSTANSI.namaPejabatKeuangan,
      nipPejabatKeuangan: DEFAULT_INSTANSI.nipPejabatKeuangan,
      jabatanPejabatKeuangan: DEFAULT_INSTANSI.jabatanPejabatKeuangan,
      pptkNama: DEFAULT_INSTANSI.namaPptk,
      pptkNip: DEFAULT_INSTANSI.nipPptk,
      pptkJabatan: DEFAULT_INSTANSI.jabatanPptk,
      bendaharaNama: DEFAULT_INSTANSI.namaBendahara,
      bendaharaNip: DEFAULT_INSTANSI.nipBendahara,
      bendaharaJabatan: DEFAULT_INSTANSI.jabatanBendahara,
      lunasTgl: DEFAULT_INSTANSI.tanggalLunas,
    };
  });

  // 7. Riwayat Arsip Periode (Dengan Sistem Penguncian Data Imutabel)
  const [historyRecords, setHistoryRecords] = useState<JaspelHistoryRecord[]>(() => {
    const saved = localStorage.getItem('jaspel_history');
    if (saved) {
      try {
        const parsed: JaspelHistoryRecord[] = JSON.parse(saved);
        // Pastikan field keamanan isLocked selalu terdefinisi (arsip lampau default terkunci resmi)
        return parsed.map((item) => ({
          ...item,
          isLocked: item.isLocked !== undefined ? item.isLocked : true,
        }));
      } catch {
        return buildInitialHistory();
      }
    }
    return buildInitialHistory();
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

  // Persistence to localStorage
  useEffect(() => {
    localStorage.setItem('jaspel_instansi', JSON.stringify(instansi));
  }, [instansi]);

  useEffect(() => {
    localStorage.setItem('jaspel_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('jaspel_poin_config', JSON.stringify(poinConfig));
  }, [poinConfig]);

  useEffect(() => {
    localStorage.setItem('jaspel_masa_kerja_rules', JSON.stringify(masaKerjaRules));
  }, [masaKerjaRules]);

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

  // Update Instansi and propagate to Pejabat
  const handleUpdateInstansi = (newInst: InstansiConfig) => {
    setInstansi(newInst);
    const updatedPejabat: KwitansiPejabat = {
      ...pejabat,
      namaFaskes: newInst.namaInstansi,
      kodeInstansi: newInst.kodeInstansi,
      kodeRekeningBelanja: newInst.kodeRekeningBelanja,
      nomorDpa: newInst.nomorDpa,
      kpaNama: newInst.namaKepala,
      kpaNip: newInst.nipKepala,
      kpaJabatan: newInst.jabatanKepala,
      namaPejabatKeuangan: newInst.namaPejabatKeuangan,
      nipPejabatKeuangan: newInst.nipPejabatKeuangan,
      jabatanPejabatKeuangan: newInst.jabatanPejabatKeuangan,
      bendaharaNama: newInst.namaBendahara,
      bendaharaNip: newInst.nipBendahara,
      bendaharaJabatan: newInst.jabatanBendahara,
      pptkNama: newInst.namaPptk,
      pptkNip: newInst.nipPptk,
      pptkJabatan: newInst.jabatanPptk,
      lunasTgl: newInst.tanggalLunas,
    };
    setPejabat(updatedPejabat);
    showToast('Data instansi dan pejabat penandatangan berhasil diperbarui!', 'success');
  };

  // Reset Instansi to Default
  const handleResetInstansi = () => {
    setInstansi(DEFAULT_INSTANSI);
    handleUpdateInstansi(DEFAULT_INSTANSI);
  };

  // Handler hitung ulang semua poin pegawai dari konfigurasi matriks
  const handleRecalculateAllEmployeePoints = () => {
    const updated = employees.map((emp, idx) => {
      const row = evaluateHitungPoinRow(emp, idx, poinConfig, masaKerjaRules);
      return {
        ...emp,
        points: row.exitPoin,
        poinBpjs: row.totalPoinTanpaKehadiran,
        prosentaseMasaKerja: row.prosentaseMasaKerja,
      };
    });
    setEmployees(updated);
    showToast('Seluruh poin pegawai berhasil dihitung ulang dan disinkronkan!', 'success');
  };

  // Handler simpan periode berjalan ke riwayat arsip dengan proteksi penguncian
  const handleSaveCurrentToHistory = (note?: string): boolean => {
    // 1. Cek apakah periode ini sudah ada di riwayat dan berstatus TERKUNCI
    const existing = historyRecords.find(
      (r) => r.bulan === setup.bulan && r.tahun === setup.tahun
    );

    if (existing && existing.isLocked) {
      showToast(
        `Periode ${setup.bulan} ${setup.tahun} berstatus TERKUNCI RESMI! Buka kunci terlebih dahulu jika Anda benar-benar bermaksud merevisi arsip ini.`,
        'error'
      );
      return false;
    }

    const recordId = `${setup.tahun}-${String(new Date(setup.tanggalHitung || Date.now()).getMonth() + 1).padStart(2, '0')}`;
    const tax15 = calculation.employees
      .filter((e) => e.taxRate >= 0.15)
      .reduce((s, e) => s + e.tax, 0);
    const tax5 = calculation.employees
      .filter((e) => e.taxRate < 0.15 && e.taxRate > 0)
      .reduce((s, e) => s + e.tax, 0);

    // Deep clone snapshot data saat ini agar 100% kebal dari perubahan master data / poin di masa depan
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
      calculation: JSON.parse(JSON.stringify(calculation)),
      pejabat: JSON.parse(JSON.stringify(pejabat)),
      savedAt: new Date().toISOString(),
      isLocked: false, // Disimpan sebagai draft aktif, admin dapat menguncinya setelah final
      lockNote: note || '',
      employeesSnapshot: JSON.parse(JSON.stringify(employees)),
      poinConfigSnapshot: JSON.parse(JSON.stringify(poinConfig)),
      masaKerjaRulesSnapshot: JSON.parse(JSON.stringify(masaKerjaRules)),
    };

    setHistoryRecords((prev) => {
      const filtered = prev.filter(
        (r) => !(r.bulan === setup.bulan && r.tahun === setup.tahun)
      );
      return [newRecord, ...filtered];
    });

    showToast(
      `Hasil Jaspel ${setup.bulan} ${setup.tahun} berhasil disimpan ke Riwayat!`,
      'success'
    );
    return true;
  };

  // Handler Kunci / Buka Kunci Periode Riwayat
  const handleToggleLockHistory = (id: string, lockNote?: string, officerName?: string) => {
    const target = historyRecords.find((r) => r.id === id);
    if (!target) return;

    const willLock = !target.isLocked;
    const nowIso = new Date().toISOString();

    const updated = historyRecords.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          isLocked: willLock,
          lockedAt: willLock ? nowIso : undefined,
          lockedBy: willLock ? (officerName || 'Bendahara Jaspel / Kasubag TU') : undefined,
          lockNote: willLock 
            ? (lockNote || r.lockNote || 'Data periode dikunci permanen.') 
            : `Kunci dibuka untuk revisi pada ${new Date().toLocaleDateString('id-ID')}`,
        };
      }
      return r;
    });

    setHistoryRecords(updated);
    if (willLock) {
      showToast(
        `Periode ${target.bulan} ${target.tahun} BERHASIL DIKUNCI! Data kini kebal dari segala perubahan master pegawai & poin.`,
        'success'
      );
    } else {
      showToast(
        `Kunci arsip periode ${target.bulan} ${target.tahun} dibuka (Status: Draft/Dapat Direvisi).`,
        'info'
      );
    }
  };

  // Handler Hapus Riwayat dengan Proteksi Kunci
  const handleDeleteHistoryRecordSafely = (id: string) => {
    const target = historyRecords.find((r) => r.id === id);
    if (!target) return;

    if (target.isLocked) {
      showToast(
        `Gagal menghapus: Periode ${target.bulan} ${target.tahun} berstatus TERKUNCI RESMI dan dilindungi. Buka kunci terlebih dahulu jika benar-benar ingin menghapus.`,
        'error'
      );
      return;
    }

    setHistoryRecords((prev) => prev.filter((r) => r.id !== id));
    showToast(`Arsip Jaspel ${target.bulan} ${target.tahun} berhasil dihapus.`, 'info');
  };

  // Resolve data aktif untuk Kwitansi Global
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

  // Handler apply attendance dari CSV
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

  // Employee CRUD Handlers
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

  const handleBulkImportEmployees = (imported: Employee[]) => {
    setEmployees(imported);
    showToast(`Master data karyawan berhasil diperbarui (${imported.length} pegawai)!`, 'success');
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
          data.error || 'Gagal menyimpan ke Google Sheets.',
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
        showToast(data.error || 'Gagal menyimpan ke Sheets.', 'error');
      }
    } catch (err: any) {
      showToast(`Koneksi gagal: ${err.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Inisialisasi otomatis tab Google Sheets
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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans">
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

      {/* Modern Sidebar Navigation */}
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        instansi={instansi}
        sheetsConfig={sheetsConfig}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* TopBar with Breadcrumbs and Quick Actions */}
        <TopBar
          activeMenu={activeMenu}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          instansi={instansi}
          setup={setup}
          sheetsConfig={sheetsConfig}
          onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
          onQuickKwitansi={() => {
            setSelectedKwitansiPeriod('CURRENT');
            setActiveMenu('kwitansi');
          }}
        />

        {/* Main Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* MENU 1.a: DATA INSTANSI & PEJABAT */}
          {activeMenu === 'pengaturan-instansi' && (
            <DataInstansiView
              instansi={instansi}
              onSaveInstansi={handleUpdateInstansi}
              onResetDefault={handleResetInstansi}
            />
          )}

          {/* MENU DATA PEGAWAI (MASTER KARYAWAN) */}
          {activeMenu === 'pengaturan-pegawai' && (
            <EmployeesManager
              employees={employees}
              poinConfig={poinConfig}
              onAddEmployee={handleAddEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onBulkImportEmployees={handleBulkImportEmployees}
              onPushToGoogleSheets={handlePushEmployeesToSheets}
              isSyncingToSheets={isSyncing}
            />
          )}

          {/* MENU 1.c: DATA POIN JASPEL */}
          {activeMenu === 'pengaturan-poin' && (
            <DataPoinJaspelView
              poinConfig={poinConfig}
              onSaveConfig={(newCfg) => {
                setPoinConfig(newCfg);
                showToast('Konfigurasi poin jaspel disimpan!', 'success');
              }}
              onRecalculateAllEmployees={handleRecalculateAllEmployeePoints}
            />
          )}

          {/* MENU 1.d: PROSENTASE MASA KERJA */}
          {activeMenu === 'pengaturan-masa-kerja' && (
            <ProsentaseMasaKerjaView
              rules={masaKerjaRules}
              onSaveRules={(newRules) => {
                setMasaKerjaRules(newRules);
                showToast('Aturan prosentase masa kerja disimpan!', 'success');
              }}
              onResetRules={() => {
                setMasaKerjaRules(DEFAULT_MASA_KERJA_RULES);
                showToast('Aturan masa kerja direset ke standar!', 'info');
              }}
            />
          )}

          {/* ALOKASI JASA PELAYANAN */}
          {activeMenu === 'alokasi' && (
            <KapitasiSetupView
              setup={setup}
              onUpdateSetup={setSetup}
              onSaveToHistory={handleSaveCurrentToHistory}
              historyRecords={historyRecords}
              onLoadPeriod={(record) => {
                setSetup({
                  bulan: record.bulan,
                  tahun: record.tahun,
                  totalKapitasi: record.totalKapitasi,
                  alokasiPersen: record.alokasiPersen,
                  totalAlokasi: record.totalAlokasi,
                  maxAttendance: record.maxAttendance,
                  tanggalHitung: record.tanggalHitung,
                });
                showToast(`Periode ${record.bulan} ${record.tahun} berhasil dimuat!`, 'success');
              }}
              onOpenKwitansiForHistory={(record) => {
                setSelectedKwitansiPeriod(`${record.bulan}-${record.tahun}`);
                setActiveMenu('kwitansi');
              }}
              onDeleteHistoryRecord={handleDeleteHistoryRecordSafely}
              onToggleLockHistory={handleToggleLockHistory}
              onPushToGoogleSheets={handlePushResultsToSheets}
              isSyncingToSheets={isSyncing}
            />
          )}

          {/* IMPORT ABSENSI */}
          {activeMenu === 'absensi' && (
            <ImportCSV
              employees={employees}
              bulan={setup.bulan}
              tahun={setup.tahun}
              maxAttendance={setup.maxAttendance}
              onApplyAttendance={handleApplyAttendance}
            />
          )}

          {/* HITUNG POIN */}
          {activeMenu === 'hitung-poin' && (
            <HitungPoinView
              employees={employees}
              poinConfig={poinConfig}
              masaKerjaRules={masaKerjaRules}
              instansi={instansi}
              bulan={setup.bulan}
              tahun={setup.tahun}
              totalAlokasiKapitasi={setup.totalAlokasi}
              onApplyCalculatedPointsToMaster={(updated) => {
                setEmployees(updated);
                showToast('Nilai poin berhasil diterapkan ke Master Karyawan!', 'success');
              }}
            />
          )}

          {/* HASIL & BALANCING JASPEL */}
          {activeMenu === 'balancing' && (
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
                setActiveMenu('kwitansi');
              }}
              isSyncingToSheets={isSyncing}
            />
          )}

          {/* KWITANSI GLOBAL */}
          {activeMenu === 'kwitansi' && (
            <KwitansiGlobalView
              employees={kwitansiData.employees}
              setup={kwitansiData.setup}
              pejabat={pejabat}
              onUpdatePejabat={(newP) => {
                setPejabat(newP);
                showToast('Data pejabat penandatangan kwitansi diperbarui!', 'success');
              }}
              availablePeriods={availablePeriods}
              selectedPeriodKey={selectedKwitansiPeriod}
              isPeriodLocked={
                selectedKwitansiPeriod === 'CURRENT'
                  ? Boolean(historyRecords.find(r => r.bulan === setup.bulan && r.tahun === setup.tahun)?.isLocked)
                  : Boolean(historyRecords.find(r => `${r.bulan}-${r.tahun}` === selectedKwitansiPeriod)?.isLocked)
              }
              onSelectPeriod={(b, t) => {
                if (b === setup.bulan && t === setup.tahun) {
                  setSelectedKwitansiPeriod('CURRENT');
                } else {
                  setSelectedKwitansiPeriod(`${b}-${t}`);
                }
              }}
            />
          )}

          {/* HISTORY */}
          {activeMenu === 'history' && (
            <HistoryJaspelView
              historyRecords={historyRecords}
              onSaveCurrentToHistory={handleSaveCurrentToHistory}
              currentSetup={setup}
              currentCalculationEmployees={calculation.employees}
              pejabat={pejabat}
              onOpenKwitansiForHistory={(record) => {
                setSelectedKwitansiPeriod(`${record.bulan}-${record.tahun}`);
                setActiveMenu('kwitansi');
              }}
              onPrintSlipForEmployee={(emp, periodSetup) => {
                setSelectedSlipEmployee(emp);
                setActiveSlipSetup(periodSetup);
              }}
              onDeleteHistoryRecord={handleDeleteHistoryRecordSafely}
              onToggleLockHistory={handleToggleLockHistory}
            />
          )}

          {/* DOKUMENTASI ARSITEKTUR NEXT.JS */}
          {activeMenu === 'code' && (
            <NextJsCodeExport />
          )}

          {/* PANDUAN DEPLOYMENT VERCEL */}
          {activeMenu === 'vercel' && (
            <VercelGuideModal />
          )}
        </main>

        {/* Global Modals */}
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
          onPushEmployees={handlePushEmployeesToSheets}
          onPushResults={handlePushResultsToSheets}
          isSyncing={isSyncing}
          employeeCount={employees.length}
          activePeriod={`${setup.bulan} ${setup.tahun}`}
        />

        {/* App Footer */}
        <footer className="bg-white border-t border-slate-200 py-4 mt-auto no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <div>
              <span className="font-semibold text-slate-700">{instansi.namaInstansi || 'UPTD Puskesmas'}</span> • Jaspel Zero Data Entry & Kwitansi Global Resmi
            </div>
            <div className="flex items-center space-x-3">
              <span>Permenkes No. 6/2022</span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold">Hare-Niemeyer Largest Remainder</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
