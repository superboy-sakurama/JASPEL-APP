import React, { useState, useRef } from 'react';
import { Employee, EmployeeStatus } from '../types/jaspel';
import { downloadMasterPegawaiTemplate, parseExcelOrCsvFile } from '../lib/excelHelper';
import { 
  UserPlus, 
  Search, 
  Download, 
  Upload, 
  Edit3, 
  Trash2, 
  Database, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  FileDown,
  X,
  Plus
} from 'lucide-react';

interface EmployeesManagerProps {
  employees: Employee[];
  onAddEmployee: (emp: Employee) => void;
  onUpdateEmployee: (emp: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  onBulkImportEmployees?: (imported: Employee[]) => void;
  onPushToGoogleSheets?: () => Promise<void>;
  isSyncingToSheets?: boolean;
}

const PENDIDIKAN_OPTIONS = ['SD', 'SMP', 'SMA', 'D3', 'D4/S1', 'Profesi'];
const STATUS_OPTIONS: EmployeeStatus[] = ['PNS', 'PPPK', 'Honorer'];
const TUGAS_ADMIN_OPTIONS = [
  '-',
  'Kepala Puskesmas',
  'Ka Subbag TU',
  'Bendahara',
  'PPTK',
  'PJ Pokja UKM',
  'PJ Pokja UKP',
  'PJ Pokja Admen',
  'Koordinator UGD / Rawat Inap',
  'Staf Pelaksana',
];

export const EmployeesManager: React.FC<EmployeesManagerProps> = ({
  employees,
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

  // Form State
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    nip: '',
    tmt: '2020-01-01',
    status: 'PNS',
    pendidikan: 'D4/S1',
    jabatan: 'Perawat',
    tugasAdmin: '-',
    program1: '',
    program2: '',
    program3: '',
    program4: '',
    program5: '',
    points: 60,
    attendance: 22,
    maxAttendance: 22,
    taxRate: 0.05,
    npwp: '',
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
      program1: 'Pelayanan Pasien BPJS',
      program2: '',
      program3: '',
      program4: '',
      program5: '',
      points: 50,
      attendance: 22,
      maxAttendance: 22,
      taxRate: 0.05,
      npwp: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({ ...emp });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingEmployee) {
      onUpdateEmployee({
        ...editingEmployee,
        ...formData,
        points: Number(formData.points) || 10,
        attendance: Number(formData.attendance) || 22,
        maxAttendance: Number(formData.maxAttendance) || 22,
        taxRate: Number(formData.taxRate) || 0,
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
        program1: formData.program1 || '',
        program2: formData.program2 || '',
        program3: formData.program3 || '',
        program4: formData.program4 || '',
        program5: formData.program5 || '',
        npwp: formData.npwp || '',
        points: Number(formData.points) || 50,
        attendance: Number(formData.attendance) || 22,
        maxAttendance: Number(formData.maxAttendance) || 22,
        taxRate: Number(formData.taxRate) || (formData.status === 'Honorer' ? 0 : 0.05),
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

      // Deteksi indeks kolom dari header baris pertama
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
      const p1Idx = findIdx(['program 1', 'program1', 'p1']);
      const p2Idx = findIdx(['program 2', 'program2', 'p2']);
      const p3Idx = findIdx(['program 3', 'program3', 'p3']);
      const p4Idx = findIdx(['program 4', 'program4', 'p4']);
      const p5Idx = findIdx(['program 5', 'program5', 'p5']);
      const poinIdx = findIdx(['poin', 'point']);
      const hadirIdx = findIdx(['kehadiran', 'hadir']);
      const maxHadirIdx = findIdx(['maksimal', 'max']);

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
        if (tmtIdx !== -1 && row[tmtIdx]) {
          const rawTmt = String(row[tmtIdx]).trim();
          tmtStr = rawTmt.includes('-') ? rawTmt : '2020-01-01';
        }

        const pend = pendIdx !== -1 && row[pendIdx] ? String(row[pendIdx]).trim() : 'D4/S1';
        const jab = jabIdx !== -1 && row[jabIdx] ? String(row[jabIdx]).trim() : 'Staf Medis';
        const tugas = tugasIdx !== -1 && row[tugasIdx] ? String(row[tugasIdx]).trim() : '-';
        const p1 = p1Idx !== -1 ? String(row[p1Idx] || '').trim() : '';
        const p2 = p2Idx !== -1 ? String(row[p2Idx] || '').trim() : '';
        const p3 = p3Idx !== -1 ? String(row[p3Idx] || '').trim() : '';
        const p4 = p4Idx !== -1 ? String(row[p4Idx] || '').trim() : '';
        const p5 = p5Idx !== -1 ? String(row[p5Idx] || '').trim() : '';
        const points = poinIdx !== -1 && row[poinIdx] ? Number(row[poinIdx]) : 50;
        const attendance = hadirIdx !== -1 && row[hadirIdx] ? Number(row[hadirIdx]) : 22;
        const maxAttendance = maxHadirIdx !== -1 && row[maxHadirIdx] ? Number(row[maxHadirIdx]) : 22;

        const taxRate = statusStr === 'Honorer' ? 0 : 0.05;

        importedEmployees.push({
          id: `emp-imp-${Date.now()}-${i}`,
          name,
          nip,
          status: statusStr,
          tmt: tmtStr,
          pendidikan: pend,
          jabatan: jab,
          tugasAdmin: tugas,
          program1: p1,
          program2: p2,
          program3: p3,
          program4: p4,
          program5: p5,
          points: isNaN(points) ? 50 : points,
          attendance: isNaN(attendance) ? 22 : attendance,
          maxAttendance: isNaN(maxAttendance) ? 22 : maxAttendance,
          taxRate,
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
        message: `Berhasil mengimpor ${importedEmployees.length} pegawai ke Master Data!`,
        type: 'success',
      });
      setTimeout(() => setImportStatus(null), 5000);
    } catch (err: any) {
      setImportStatus({ message: `Gagal membaca file Excel: ${err.message}`, type: 'error' });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Filtered list
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.jabatan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Menu 1.b Pengaturan
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Total {employees.length} Karyawan
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Data Pegawai (Master Karyawan)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola master data pegawai: NIP/NIK, Status Kepegawaian (PNS, PPPK, Honorer), TMT, Pendidikan, Jabatan, Tugas Administrasi, Program 1-5, dan Poin.
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
            placeholder="Cari nama, NIP, atau jabatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-800"
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
              {st === 'ALL' ? 'Semua' : st}
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
                <th className="px-4 py-3">Program (1-5)</th>
                <th className="px-4 py-3 text-center">Poin</th>
                <th className="px-4 py-3 text-center">Kehadiran</th>
                <th className="px-4 py-3 text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((emp, idx) => {
                const programs = [emp.program1, emp.program2, emp.program3, emp.program4, emp.program5]
                  .filter(Boolean)
                  .join(', ');

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
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
                        {emp.status}
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
                      <div className="font-semibold text-slate-800">{emp.jabatan}</div>
                      {emp.tugasAdmin && emp.tugasAdmin !== '-' && (
                        <div className="text-[10px] text-indigo-700 font-medium bg-indigo-50 px-1.5 py-0.5 rounded w-max mt-0.5">
                          Tugas: {emp.tugasAdmin}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate" title={programs || '-'}>
                      {programs || '-'}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-slate-800">
                      {emp.points}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-slate-600 whitespace-nowrap">
                      {emp.attendance}/{emp.maxAttendance || 22}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Pegawai"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteEmployee(emp.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Pegawai"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Modal Add/Edit Employee */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <span>{editingEmployee ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
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
                        {st}
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
                    Tugas Administrasi
                  </label>
                  <select
                    value={formData.tugasAdmin || '-'}
                    onChange={(e) => setFormData({ ...formData, tugasAdmin: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    {TUGAS_ADMIN_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jumlah Poin
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

              {/* Program 1 s/d 5 */}
              <div className="pt-2 border-t border-slate-100">
                <span className="block text-xs font-bold text-slate-800 mb-2">
                  Penugasan Program Kesehatan (PJ Program 1 s/d 5):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Program 1</label>
                    <input
                      type="text"
                      placeholder="Contoh: Kesehatan Ibu & Anak (KIA)"
                      value={formData.program1 || ''}
                      onChange={(e) => setFormData({ ...formData, program1: e.target.value })}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Program 2</label>
                    <input
                      type="text"
                      placeholder="Contoh: Pelayanan KB"
                      value={formData.program2 || ''}
                      onChange={(e) => setFormData({ ...formData, program2: e.target.value })}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Program 3</label>
                    <input
                      type="text"
                      placeholder="Contoh: Posyandu Balita"
                      value={formData.program3 || ''}
                      onChange={(e) => setFormData({ ...formData, program3: e.target.value })}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Program 4</label>
                    <input
                      type="text"
                      placeholder="Contoh: Skrining PTM"
                      value={formData.program4 || ''}
                      onChange={(e) => setFormData({ ...formData, program4: e.target.value })}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Program 5</label>
                    <input
                      type="text"
                      placeholder="Contoh: Imunisasi Dasar Lengkap"
                      value={formData.program5 || ''}
                      onChange={(e) => setFormData({ ...formData, program5: e.target.value })}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Attendance & Tax */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hari Kehadiran (Bulan Ini)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.attendance ?? 22}
                    onChange={(e) => setFormData({ ...formData, attendance: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-mono bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hari Maksimal Kerja
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxAttendance ?? 22}
                    onChange={(e) => setFormData({ ...formData, maxAttendance: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-mono bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  {editingEmployee ? 'Simpan Perubahan' : 'Tambahkan Pegawai'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
