import React, { useState, useRef, useMemo } from 'react';
import { Employee, EmployeeStatus, PoinJaspelConfig } from '../types/jaspel';
import { downloadMasterPegawaiTemplate, parseExcelOrCsvFile, parseExcelDate } from '../lib/excelHelper';
import { 
  getAllAvailablePrograms, 
  getAllAvailableTugas, 
  getAllAvailableTugasTambahan, 
  DEFAULT_POIN_JASPEL, 
  resolveProgramPoints,
  getPoinTugasTambahan
} from '../lib/pointCalculator';
import { 
  UserPlus, 
  Search, 
  Upload, 
  Edit3, 
  Trash2, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  FileDown, 
  X, 
  Layers,
  Info,
  ClipboardList
} from 'lucide-react';

interface EmployeesManagerProps {
  employees: Employee[];
  poinConfig?: PoinJaspelConfig;
  onAddEmployee: (emp: Employee) => void;
  onUpdateEmployee: (emp: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  onBulkImportEmployees?: (imported: Employee[]) => void;
  onPushToGoogleSheets?: () => Promise<void>;
  isSyncingToSheets?: boolean;
}

const PENDIDIKAN_OPTIONS = ['SD', 'SMP', 'SMA', 'D3', 'D4/S1', 'Profesi'];
const STATUS_OPTIONS: EmployeeStatus[] = ['PNS', 'PPPK', 'Honorer'];

export const EmployeesManager: React.FC<EmployeesManagerProps> = ({
  employees,
  poinConfig,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onBulkImportEmployees,
  onPushToGoogleSheets,
  isSyncingToSheets = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | EmployeeStatus>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Excel Import State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importStatus, setImportStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Available Program and Task Lists
  const availablePrograms = useMemo(() => {
    return getAllAvailablePrograms(poinConfig || DEFAULT_POIN_JASPEL);
  }, [poinConfig]);

  const availableTugas = useMemo(() => {
    return getAllAvailableTugas(poinConfig || DEFAULT_POIN_JASPEL);
  }, [poinConfig]);

  const availableTugasTambahan = useMemo(() => {
    return getAllAvailableTugasTambahan(poinConfig || DEFAULT_POIN_JASPEL);
  }, [poinConfig]);

  // Form State
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    nip: '',
    tmt: '2020-01-01',
    status: 'PNS',
    pendidikan: 'D4/S1',
    jabatan: 'Perawat',
    tugasAdmin: '-',
    tugasTambahan: '-',
    pjProgramName: '',
    program1: '',
    program2: '',
    program3: '',
    program4: '',
    program5: '',
    points: 60,
    attendance: 22,
    maxAttendance: 24,
    taxRate: 0.05,
    npwp: '',
    kinerjaUraian: 'Baik',
    kinerjaNilai: 97.5,
  });

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setFormData({
      name: '',
      nip: '',
      tmt: new Date().toISOString().split('T')[0],
      status: 'PNS',
      pendidikan: 'D4/S1',
      jabatan: 'Staf Medis / Paramedis',
      tugasAdmin: '-',
      tugasTambahan: '-',
      pjProgramName: '',
      program1: '',
      program2: '',
      program3: '',
      program4: '',
      program5: '',
      points: 50,
      attendance: 20,
      maxAttendance: 24,
      taxRate: 0.05,
      npwp: '',
      kinerjaUraian: 'Baik',
      kinerjaNilai: 97.5,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({ 
      ...emp,
      tugasTambahan: emp.tugasTambahan || '-',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingEmployee) {
      onUpdateEmployee({
        ...editingEmployee,
        ...formData,
        tugasTambahan: formData.tugasTambahan || '-',
        points: Number(formData.points) || 10,
        attendance: Number(editingEmployee.attendance ?? 0),
        maxAttendance: Number(editingEmployee.maxAttendance || 24),
        taxRate: Number(formData.taxRate) || (formData.status === 'Honorer' ? 0 : 0.05),
      } as Employee);
    } else {
      const newEmp: Employee = {
        id: `emp-${Date.now()}`,
        name: formData.name || 'Pegawai Baru',
        nip: formData.nip || '-',
        tmt: formData.tmt || '2020-01-01',
        status: (formData.status as EmployeeStatus) || 'PNS',
        pendidikan: formData.pendidikan || 'D4/S1',
        jabatan: formData.jabatan || 'Staf',
        tugasAdmin: formData.tugasAdmin || '-',
        tugasTambahan: formData.tugasTambahan || '-',
        pjProgramName: formData.pjProgramName || '',
        program1: formData.program1 || '',
        program2: formData.program2 || '',
        program3: formData.program3 || '',
        program4: formData.program4 || '',
        program5: formData.program5 || '',
        npwp: formData.npwp || '',
        points: Number(formData.points) || 50,
        attendance: 0,
        maxAttendance: 24,
        taxRate: Number(formData.taxRate) || (formData.status === 'Honorer' ? 0 : 0.05),
        kinerjaUraian: formData.kinerjaUraian || 'Baik',
        kinerjaNilai: formData.kinerjaNilai || 97.5,
      };
      onAddEmployee(newEmp);
    }

    setIsModalOpen(false);
  };

  // Handler Import Excel Karyawan
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const rows = await parseExcelOrCsvFile(file);
      if (rows.length < 2) {
        setImportStatus({ message: 'File kosong atau format header tidak valid.', type: 'error' });
        return;
      }

      const headers = rows[0].map((h: any) => String(h || '').toLowerCase().trim());
      const findIdx = (keywords: string[]) => {
        return headers.findIndex((h: string) => keywords.some((k) => h.includes(k)));
      };

      const nameIdx = findIdx(['nama']);
      const nipIdx = findIdx(['nip', 'nik']);
      const statusIdx = findIdx(['status']);
      const tmtIdx = findIdx(['tmt', 'mulai']);
      const pendIdx = findIdx(['pendidikan']);
      const jabIdx = findIdx(['jabatan', 'profesi']);
      const tugasIdx = findIdx(['tugas', 'administrasi']);
      const pjIdx = findIdx(['pj program', 'pj prog', 'utama', 'pj']);
      const p1Idx = findIdx(['program 1', 'program1', 'p1']);
      const p2Idx = findIdx(['tambahan 1', 'program 2', 'program2', 'p2']);
      const p3Idx = findIdx(['tambahan 2', 'program 3', 'program3', 'p3']);
      const p4Idx = findIdx(['tambahan 3', 'program 4', 'program4', 'p4']);
      const p5Idx = findIdx(['tambahan 4', 'program 5', 'program5', 'p5']);
      const poinIdx = findIdx(['poin', 'point']);
      const hadirIdx = findIdx(['kehadiran', 'hadir', 'presensi']);
      const maxHadirIdx = findIdx(['maksimal', 'max', 'hari kerja']);

      if (nameIdx === -1) {
        setImportStatus({ message: 'Kolom "Nama Pegawai" tidak ditemukan pada file.', type: 'error' });
        return;
      }

      const importedEmployees: Employee[] = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const name = String(row[nameIdx] || '').trim();
        if (!name) continue;

        const nip = nipIdx !== -1 ? String(row[nipIdx] || '-').trim() : '-';
        let statusStr: EmployeeStatus = 'PNS';
        if (statusIdx !== -1) {
          const rawStatus = String(row[statusIdx] || '').toUpperCase();
          if (rawStatus.includes('HONOR') || rawStatus.includes('NON')) statusStr = 'Honorer';
          else if (rawStatus.includes('PPPK') || rawStatus.includes('P3K')) statusStr = 'PPPK';
        }

        let tmtStr = '2020-01-01';
        if (tmtIdx !== -1 && row[tmtIdx] !== undefined && row[tmtIdx] !== null && row[tmtIdx] !== '') {
          tmtStr = parseExcelDate(row[tmtIdx]);
        }

        const pend = pendIdx !== -1 && row[pendIdx] ? String(row[pendIdx]).trim() : 'D4/S1';
        const jab = jabIdx !== -1 && row[jabIdx] ? String(row[jabIdx]).trim() : 'Staf Medis';
        const tugas = tugasIdx !== -1 && row[tugasIdx] ? String(row[tugasIdx]).trim() : '-';
        const pj = pjIdx !== -1 ? String(row[pjIdx] || '').trim() : '';
        const p1 = p1Idx !== -1 ? String(row[p1Idx] || '').trim() : '';
        const p2 = p2Idx !== -1 ? String(row[p2Idx] || '').trim() : '';
        const p3 = p3Idx !== -1 ? String(row[p3Idx] || '').trim() : '';
        const p4 = p4Idx !== -1 ? String(row[p4Idx] || '').trim() : '';
        const p5 = p5Idx !== -1 ? String(row[p5Idx] || '').trim() : '';
        const points = poinIdx !== -1 && row[poinIdx] ? Number(row[poinIdx]) : 50;
        
        // Cek jika pegawai sudah ada di sistem, pertahankan data absensi berjalannya
        const existingEmp = employees.find((e) => 
          (nip !== '-' && e.nip.replace(/[^0-9]/g, '') === nip.replace(/[^0-9]/g, '')) ||
          e.name.toLowerCase().trim() === name.toLowerCase().trim()
        );

        const attendance = hadirIdx !== -1 && row[hadirIdx] !== undefined && row[hadirIdx] !== '' 
          ? Number(row[hadirIdx]) 
          : (existingEmp?.attendance ?? 0);
        const maxAttendance = maxHadirIdx !== -1 && row[maxHadirIdx] !== undefined && row[maxHadirIdx] !== '' 
          ? Number(row[maxHadirIdx]) 
          : (existingEmp?.maxAttendance || 24);

        const taxRate = statusStr === 'Honorer' ? 0 : 0.05;

        let empId = existingEmp ? existingEmp.id : `emp-imp-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`;
        if (importedEmployees.some(e => e.id === empId)) {
          empId = `emp-imp-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`;
        }

        importedEmployees.push({
          id: empId,
          name,
          nip,
          status: statusStr,
          tmt: tmtStr,
          pendidikan: pend,
          jabatan: jab,
          tugasAdmin: tugas,
          pjProgramName: pj,
          program1: p1,
          program2: p2,
          program3: p3,
          program4: p4,
          program5: p5,
          points: isNaN(points) ? (existingEmp?.points ?? 50) : points,
          attendance: isNaN(attendance) ? 0 : attendance,
          maxAttendance: isNaN(maxAttendance) ? 24 : maxAttendance,
          taxRate,
          kinerjaUraian: existingEmp?.kinerjaUraian || 'Baik',
          kinerjaNilai: existingEmp?.kinerjaNilai || 97.5,
        });
      }

      if (importedEmployees.length === 0) {
        setImportStatus({ message: 'Tidak ada baris data karyawan yang berhasil diproses.', type: 'error' });
        return;
      }

      if (onBulkImportEmployees) {
        onBulkImportEmployees(importedEmployees);
      } else {
        importedEmployees.forEach((emp) => onAddEmployee(emp));
      }

      setImportStatus({
        message: `Berhasil mengimpor ${importedEmployees.length} data pegawai ke dalam Master Karyawan!`,
        type: 'success',
      });
    } catch (err: any) {
      setImportStatus({
        message: `Gagal memproses file Excel: ${err?.message || 'Format tidak didukung'}`,
        type: 'error',
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.nip.includes(searchTerm) ||
      (emp.jabatan && emp.jabatan.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (emp.tugasAdmin && emp.tugasAdmin.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (emp.pjProgramName && emp.pjProgramName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (emp.program1 && emp.program1.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchStatus = statusFilter === 'ALL' || emp.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Autocomplete Datalist for Programs and Administrative Tasks */}
      <datalist id="program-options-list">
        {availablePrograms.map((prog, idx) => (
          <option key={`${prog.nama}-${idx}`} value={prog.nama}>
            {prog.nama} ({prog.poin} Poin{prog.isCustom ? ' • Custom' : ''})
          </option>
        ))}
      </datalist>

      <datalist id="tugas-options-list">
        {availableTugas.map((t, idx) => (
          <option key={`${t.nama}-${idx}`} value={t.nama}>
            {t.nama} ({t.poin} Poin{t.isCustom ? ' • Custom' : ''})
          </option>
        ))}
      </datalist>

      <datalist id="tugas-tambahan-options-list">
        {availableTugasTambahan.map((tt, idx) => (
          <option key={`${tt.nama}-${idx}`} value={tt.nama}>
            {tt.nama} ({tt.poin} Poin • Kelompok 7)
          </option>
        ))}
      </datalist>

      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
              Pengaturan • Data Pegawai
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Total {employees.length} Pegawai
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Data Pegawai (Master Karyawan)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar seluruh personil, NIP, status kepegawaian, TMT masa kerja, kualifikasi ijazah, tugas administrasi, dan penugasan tanggung jawab program (PJ Program & Tambahan 1 s/d 4).
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Unduh Contoh Format Excel */}
          <button
            type="button"
            onClick={downloadMasterPegawaiTemplate}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            title="Unduh contoh template format Excel untuk diisi"
          >
            <FileDown className="w-3.5 h-3.5 text-slate-600" />
            <span>Format Excel</span>
          </button>

          {/* Import File Excel */}
          <label className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Import Excel</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Sync ke Google Sheets */}
          {onPushToGoogleSheets && (
            <button
              onClick={onPushToGoogleSheets}
              disabled={isSyncingToSheets}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors disabled:opacity-50"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isSyncingToSheets ? 'Menyimpan...' : 'Simpan ke Sheets'}</span>
            </button>
          )}

          {/* Tambah Karyawan */}
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tambah Pegawai</span>
          </button>
        </div>
      </div>

      {/* Import Status Alert */}
      {importStatus && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-medium flex items-center space-x-2 ${
            importStatus.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {importStatus.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{importStatus.message}</span>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, NIP, jabatan, atau program..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-slate-800"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-medium text-slate-500 shrink-0">Filter Status:</span>
          {(['ALL', 'PNS', 'PPPK', 'Honorer'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'Semua' : st === 'Honorer' ? 'NON ASN' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Table Master Pegawai */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 w-10 text-center">No</th>
                <th className="px-4 py-3">Nama Pegawai & NIP/NIK</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">TMT</th>
                <th className="px-4 py-3 text-center">Pendidikan</th>
                <th className="px-4 py-3">Jabatan & Tugas Admin</th>
                <th className="px-4 py-3 min-w-[220px]">Penugasan Program (PJ & Tambahan 1-4)</th>
                <th className="px-4 py-3 text-center">Poin Dasar</th>
                <th className="px-4 py-3 text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((emp, idx) => {
                const programPills = [
                  emp.pjProgramName ? { label: `PJ: ${emp.pjProgramName}`, isPj: true } : null,
                  emp.program1 ? { label: `P1: ${emp.program1}`, isP1: true } : null,
                  emp.program2 ? { label: `Tambahan 1: ${emp.program2}` } : null,
                  emp.program3 ? { label: `Tambahan 2: ${emp.program3}` } : null,
                  emp.program4 ? { label: `Tambahan 3: ${emp.program4}` } : null,
                  emp.program5 ? { label: `Tambahan 4: ${emp.program5}` } : null,
                ].filter(Boolean);

                return (
                  <tr key={`${emp.id}-${idx}`} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{emp.name}</div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">{emp.nip}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          emp.status === 'PNS'
                            ? 'bg-blue-100 text-blue-800'
                            : emp.status === 'PPPK'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {emp.status === 'Honorer' ? 'NON ASN' : emp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-slate-600 whitespace-nowrap">
                      {emp.tmt || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {emp.pendidikan}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-800 font-medium">{emp.jabatan}</div>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {emp.tugasAdmin && emp.tugasAdmin !== '-' && (
                          <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded inline-block font-medium">
                            {emp.tugasAdmin}
                          </span>
                        )}
                        {emp.tugasTambahan && emp.tugasTambahan !== '-' && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded inline-block font-medium border ${
                            poinConfig?.tugasTambahanEnabled !== false
                              ? 'text-purple-700 bg-purple-50 border-purple-200'
                              : 'text-slate-500 bg-slate-100 border-slate-200 line-through'
                          }`} title={poinConfig?.tugasTambahanEnabled !== false ? 'Tugas Administrasi Tambahan (Aktif)' : 'Tugas Administrasi Tambahan (Nonaktif - Tidak Dihitung)'}>
                            Kel. 7: {emp.tugasTambahan}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {programPills.length === 0 ? (
                        <span className="text-slate-400 text-[11px]">-</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {programPills.map((p: any, i) => (
                            <span
                              key={`${p.label}-${i}`}
                              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                p.isPj 
                                  ? 'bg-teal-100 text-teal-900 border border-teal-300 font-semibold' 
                                  : p.isP1
                                  ? 'bg-sky-100 text-sky-900 border border-sky-300 font-medium'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {p.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-slate-800">
                      {emp.points}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Pegawai"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteEmployee(emp.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Pegawai"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Pegawai */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <span>{editingEmployee ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Pegawai <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: drg. Indah Mardiyah Hayati, M.H."
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIP / NIK <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nip || ''}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    placeholder="19750411 200312 2 004"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-mono bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Kepegawaian <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as EmployeeStatus })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st === 'Honorer' ? 'Honorer (NON ASN)' : st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    TMT Masa Kerja <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tmt || ''}
                    onChange={(e) => setFormData({ ...formData, tmt: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-mono bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pendidikan (Jenjang) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.pendidikan}
                    onChange={(e) => setFormData({ ...formData, pendidikan: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    {PENDIDIKAN_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jabatan Fungsional / Profesi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.jabatan || ''}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    placeholder="Contoh: Dokter Umum, Perawat, Bidan"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tugas Administrasi (Kelompok 3)
                  </label>
                  <input
                    type="text"
                    list="tugas-options-list"
                    value={formData.tugasAdmin || '-'}
                    onChange={(e) => setFormData({ ...formData, tugasAdmin: e.target.value })}
                    placeholder="Pilih atau ketik tugas administrasi..."
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Tugas Administrasi Tambahan (Kel. 7)
                    </label>
                    <span className={`text-[9.5px] px-1.5 py-0.2 rounded font-semibold ${
                      poinConfig?.tugasTambahanEnabled !== false
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {poinConfig?.tugasTambahanEnabled !== false ? 'Kel. 7 Aktif' : 'Kel. 7 Nonaktif'}
                    </span>
                  </div>
                  <input
                    type="text"
                    list="tugas-tambahan-options-list"
                    value={formData.tugasTambahan || '-'}
                    onChange={(e) => setFormData({ ...formData, tugasTambahan: e.target.value })}
                    placeholder="Pilih atau ketik tugas tambahan puskesmas..."
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  />
                  {formData.tugasTambahan && formData.tugasTambahan !== '-' && (
                    <span className="text-[10px] text-purple-700 mt-0.5 block font-medium">
                      {poinConfig?.tugasTambahanEnabled !== false
                        ? `→ Masuk ke perhitungan poin tambahan (Kelompok 7)`
                        : `⚠️ Kelompok 7 nonaktif: poin tidak dihitung`}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jumlah Poin Dasar (Auto / Manual)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.points ?? 50}
                    onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold bg-white"
                  />
                </div>
              </div>

              {/* Penugasan Tanggung Jawab Program (AJP) */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Layers className="w-4 h-4 text-teal-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Penugasan Tanggung Jawab Program Kesehatan (AJP)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Pilih program kesehatan puskesmas dari daftar yang telah diatur pada menu Data Poin Jaspel (atau ketik langsung nama program baru). Isian ini otomatis masuk ke kolom terkait pada lembar Hitung Poin:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* PJ Program */}
                  <div className="p-2.5 bg-teal-50/60 rounded-xl border border-teal-200">
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[11px] font-bold text-teal-950">
                        PJ Program (Penanggung Jawab Utama)
                      </label>
                      {formData.pjProgramName && (
                        <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-100 px-1.5 py-0.2 rounded">
                          +{resolveProgramPoints(formData.pjProgramName, formData.pjProgramPoin, poinConfig)} Poin
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-teal-700 font-medium block mb-1">
                      → Masuk ke kolom <strong className="font-bold text-teal-900">PJ PROGRAM</strong> di Hitung Poin
                    </span>
                    <input
                      type="text"
                      list="program-options-list"
                      placeholder="Contoh: Manajemen / KIA / Promkes"
                      value={formData.pjProgramName || ''}
                      onChange={(e) => setFormData({ ...formData, pjProgramName: e.target.value })}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-teal-300 bg-white"
                    />
                  </div>

                  {/* Program 1 */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[11px] font-bold text-slate-800">
                        Program 1 (Program Pokok / Wajib 1)
                      </label>
                      {formData.program1 && (
                        <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                          +{resolveProgramPoints(formData.program1, formData.program1Poin, poinConfig)} Poin
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium block mb-1">
                      → Masuk ke kolom <strong className="font-bold text-slate-800">PROGRAM 1</strong> di Hitung Poin
                    </span>
                    <input
                      type="text"
                      list="program-options-list"
                      placeholder="Contoh: Pelayanan Rawat Inap / Gizi"
                      value={formData.program1 || ''}
                      onChange={(e) => setFormData({ ...formData, program1: e.target.value })}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  {/* Tambahan 1 */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[11px] font-bold text-slate-800">
                        Tambahan 1 (Program Tambahan 1)
                      </label>
                      {formData.program2 && (
                        <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                          +{resolveProgramPoints(formData.program2, formData.program2Poin, poinConfig)} Poin
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium block mb-1">
                      → Masuk ke kolom <strong className="font-bold text-slate-800">TAMBAHAN 1</strong> di Hitung Poin
                    </span>
                    <input
                      type="text"
                      list="program-options-list"
                      placeholder="Contoh: Imunisasi / PTM"
                      value={formData.program2 || ''}
                      onChange={(e) => setFormData({ ...formData, program2: e.target.value })}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  {/* Tambahan 2 */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[11px] font-bold text-slate-800">
                        Tambahan 2 (Program Tambahan 2)
                      </label>
                      {formData.program3 && (
                        <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                          +{resolveProgramPoints(formData.program3, formData.program3Poin, poinConfig)} Poin
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium block mb-1">
                      → Masuk ke kolom <strong className="font-bold text-slate-800">TAMBAHAN 2</strong> di Hitung Poin
                    </span>
                    <input
                      type="text"
                      list="program-options-list"
                      placeholder="Contoh: TB / Diare / UKS"
                      value={formData.program3 || ''}
                      onChange={(e) => setFormData({ ...formData, program3: e.target.value })}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  {/* Tambahan 3 */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[11px] font-bold text-slate-800">
                        Tambahan 3 (Program Tambahan 3)
                      </label>
                      {formData.program4 && (
                        <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                          +{resolveProgramPoints(formData.program4, formData.program4Poin, poinConfig)} Poin
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium block mb-1">
                      → Masuk ke kolom <strong className="font-bold text-slate-800">TAMBAHAN 3</strong> di Hitung Poin
                    </span>
                    <input
                      type="text"
                      list="program-options-list"
                      placeholder="Contoh: Posyandu / Surveilance"
                      value={formData.program4 || ''}
                      onChange={(e) => setFormData({ ...formData, program4: e.target.value })}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  {/* Tambahan 4 */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[11px] font-bold text-slate-800">
                        Tambahan 4 (Program Tambahan 4)
                      </label>
                      {formData.program5 && (
                        <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                          +{resolveProgramPoints(formData.program5, formData.program5Poin, poinConfig)} Poin
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium block mb-1">
                      → Masuk ke kolom <strong className="font-bold text-slate-800">TAMBAHAN 4</strong> di Hitung Poin
                    </span>
                    <input
                      type="text"
                      list="program-options-list"
                      placeholder="Contoh: Keswa / Gilut"
                      value={formData.program5 || ''}
                      onChange={(e) => setFormData({ ...formData, program5: e.target.value })}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Info Kehadiran Otomatis dari Absensi */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start space-x-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold block text-blue-950">
                    Data Kehadiran Otomatis dari Menu Import Absensi
                  </span>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Hari hadir dan hari kerja pegawai tidak diinput pada formulir ini karena jumlahnya berbeda setiap bulan. Data kehadiran akan diambil secara otomatis dari menu <strong>Import Absensi</strong> dan langsung dimunculkan pada lembar <strong>Hitung Poin</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
                >
                  Simpan Pegawai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
