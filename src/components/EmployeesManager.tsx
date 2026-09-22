import React, { useState } from 'react';
import { Employee, EmployeeStatus } from '../types/jaspel';
import { downloadCSV } from '../lib/utils';
import { 
  UserPlus, 
  Search, 
  Download, 
  Edit3, 
  Trash2, 
  Database, 
  Sparkles,
  Award,
  X
} from 'lucide-react';

interface EmployeesManagerProps {
  employees: Employee[];
  onAddEmployee: (emp: Employee) => void;
  onUpdateEmployee: (emp: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  onPushToGoogleSheets?: () => Promise<void>;
  isSyncingToSheets?: boolean;
}

export const EmployeesManager: React.FC<EmployeesManagerProps> = ({
  employees,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onPushToGoogleSheets,
  isSyncingToSheets = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | EmployeeStatus>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    nip: '',
    tmt: '2020-01-01',
    status: 'PNS',
    jenisAsn: 'PNS (Gol. III/a)',
    pendidikan: 'S1 Keperawatan / Ners',
    jabatan: 'Perawat Pelaksana',
    program1: 'Pelayanan Umum',
    npwp: '',
    points: 60,
    attendance: 22,
    maxAttendance: 22,
    taxRate: 0.05,
  });

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setFormData({
      name: '',
      nip: '',
      tmt: new Date().toISOString().split('T')[0],
      status: 'PNS',
      jenisAsn: 'PNS (Gol. III/a)',
      pendidikan: 'S1 Keperawatan',
      jabatan: 'Staf Medis / Paramedis',
      program1: 'Pelayanan Pasien BPJS',
      npwp: '',
      points: 50,
      attendance: 22,
      maxAttendance: 22,
      taxRate: 0.05,
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
        jenisAsn: formData.jenisAsn || 'PNS',
        pendidikan: formData.pendidikan || 'D3 Kesehatan',
        jabatan: formData.jabatan || 'Tenaga Kesehatan',
        program1: formData.program1 || 'Pelayanan BPJS',
        npwp: formData.npwp || '-',
        points: Number(formData.points) || 30,
        attendance: Number(formData.attendance) || 22,
        maxAttendance: Number(formData.maxAttendance) || 22,
        taxRate: Number(formData.taxRate) || 0.05,
      };
      onAddEmployee(newEmp);
    }
    setIsModalOpen(false);
  };

  // Kalkulator rekomendasi poin SK Permenkes
  const calculateRecommendedPoints = () => {
    let base = 30;
    // Faktor Pendidikan
    const pend = (formData.pendidikan || '').toLowerCase();
    if (pend.includes('s2') || pend.includes('spesialis')) base += 40;
    else if (pend.includes('dokter') || pend.includes('profesi')) base += 35;
    else if (pend.includes('s1') || pend.includes('d4')) base += 20;
    else if (pend.includes('d3')) base += 10;

    // Faktor Jabatan
    const jab = (formData.jabatan || '').toLowerCase();
    if (jab.includes('kepala') || jab.includes('pimpinan')) base += 40;
    else if (jab.includes('koordinator')) base += 20;
    else if (jab.includes('dokter')) base += 25;

    // Set form
    setFormData(prev => ({ ...prev, points: base }));
  };

  const filtered = employees.filter(emp => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.jabatan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportMasterCSV = () => {
    const headers = [
      'Nama',
      'NIP',
      'TMT',
      'Jenis_ASN',
      'Pendidikan',
      'Jabatan',
      'Program1-5',
      'NPWP',
      'Status',
      'Poin',
      'Tarif_Pajak',
    ];

    const rows = employees.map(e => [
      e.name,
      e.nip,
      e.tmt,
      e.jenisAsn,
      e.pendidikan,
      e.jabatan,
      [e.program1, e.program2, e.program3].filter(Boolean).join('; '),
      e.npwp,
      e.status,
      e.points,
      e.taxRate,
    ]);

    downloadCSV('Master_Karyawan_Jaspel.csv', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Master Data Karyawan & Bobot Poin Permenkes
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Tabel ini disinkronkan langsung dengan sheet <span className="font-mono font-semibold text-slate-700">Master_Karyawan</span> di Google Sheets. 
              Poin mencerminkan bobot SK Kepala Puskesmas / Perbup berdasarkan jabatan, pendidikan, masa kerja, dan penanggung jawab program.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            >
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <span>Tambah Pegawai</span>
            </button>

            <button
              onClick={handleExportMasterCSV}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Export CSV</span>
            </button>

            {onPushToGoogleSheets && (
              <button
                onClick={onPushToGoogleSheets}
                disabled={isSyncingToSheets}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50"
              >
                <Database className="w-4 h-4" />
                <span>{isSyncingToSheets ? 'Menyimpan...' : 'Sync ke Google Sheets'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama, NIP, atau jabatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-800"
              />
            </div>

            <div className="flex rounded-lg border border-slate-300 p-0.5 bg-slate-50 text-xs shrink-0">
              {(['ALL', 'PNS', 'PPPK', 'Honorer'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    statusFilter === st
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-500">
            Total terdaftar: <span className="font-bold text-slate-800">{employees.length} pegawai</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 w-10">No</th>
                <th className="py-3 px-3">Nama Pegawai & Identitas</th>
                <th className="py-3 px-3 text-center">Status ASN</th>
                <th className="py-3 px-3">Pendidikan & Jabatan</th>
                <th className="py-3 px-3">Program PJ</th>
                <th className="py-3 px-3 text-center">Bobot Poin</th>
                <th className="py-3 px-3 text-center">Tarif Pajak PPh</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((emp, idx) => (
                <tr key={emp.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-800">{emp.name}</div>
                    <div className="text-[11px] font-mono text-slate-500">NIP: {emp.nip || '-'}</div>
                    <div className="text-[10px] text-slate-400">NPWP: {emp.npwp || '-'}</div>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        emp.status === 'PNS'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : emp.status === 'PPPK'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      {emp.status}
                    </span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">{emp.jenisAsn}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-slate-700">{emp.jabatan}</div>
                    <div className="text-[11px] text-slate-500">{emp.pendidikan}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="text-[11px] text-slate-600">
                      {[emp.program1, emp.program2, emp.program3].filter(Boolean).join(', ') || '-'}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-mono font-bold">
                      <Award className="w-3 h-3 text-amber-500" />
                      <span>{emp.points}</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono">
                    <span className="font-semibold text-slate-700">
                      {(emp.taxRate * 100).toFixed(0)}%
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      {emp.status === 'PNS' ? (emp.taxRate === 0.15 ? 'Gol. IV' : 'Gol. III') : 'PTKP/Non'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => handleOpenEdit(emp)}
                        className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors"
                        title="Edit Pegawai"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteEmployee(emp.id)}
                        className="p-1.5 rounded hover:bg-rose-100 text-rose-600 transition-colors"
                        title="Hapus Pegawai"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">
                {editingEmployee ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap & Gelar *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: dr. Siti Aminah, Sp.A"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIP (Nomor Induk Pegawai)
                  </label>
                  <input
                    type="text"
                    value={formData.nip || ''}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    placeholder="19850101..."
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Kepegawaian *
                  </label>
                  <select
                    value={formData.status || 'PNS'}
                    onChange={(e) => {
                      const st = e.target.value as EmployeeStatus;
                      setFormData({
                        ...formData,
                        status: st,
                        taxRate: st === 'PNS' ? 0.05 : 0,
                      });
                    }}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-800 bg-white"
                  >
                    <option value="PNS">PNS (Aparatur Sipil Negara)</option>
                    <option value="PPPK">PPPK (Pegawai Pemerintah dg PK)</option>
                    <option value="Honorer">Honorer / Kontrak BLUD</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jabatan Fungsional/Struktural
                  </label>
                  <input
                    type="text"
                    value={formData.jabatan || ''}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    placeholder="Dokter Umum / Bidan / Perawat"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pendidikan Terakhir
                  </label>
                  <input
                    type="text"
                    value={formData.pendidikan || ''}
                    onChange={(e) => setFormData({ ...formData, pendidikan: e.target.value })}
                    placeholder="Profesi Dokter / S1 / D3"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Bobot Poin SK Permenkes *
                    </label>
                    <button
                      type="button"
                      onClick={calculateRecommendedPoints}
                      className="text-[10px] text-sky-600 hover:text-sky-800 font-semibold flex items-center space-x-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Rekomendasi</span>
                    </button>
                  </div>
                  <input
                    type="number"
                    required
                    min={1}
                    max={200}
                    value={formData.points || 30}
                    onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-800 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tarif Pajak PPh 21 (0 / 0.05 / 0.15)
                  </label>
                  <select
                    value={formData.taxRate ?? 0.05}
                    onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-800 bg-white font-mono"
                  >
                    <option value={0}>0% (Non-PNS / Gol. I-II / PTKP)</option>
                    <option value={0.05}>5% (PNS Golongan III / PPPK)</option>
                    <option value={0.15}>15% (PNS Golongan IV)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
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
