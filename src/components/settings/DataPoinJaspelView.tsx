import React, { useState } from 'react';
import { PoinJaspelConfig, CustomPoinItem } from '../../types/jaspel';
import { DEFAULT_POIN_JASPEL, DEFAULT_TUGAS_TAMBAHAN_LIST } from '../../lib/pointCalculator';
import { 
  Award, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  Users, 
  GraduationCap, 
  Briefcase, 
  Target,
  Clock,
  Gauge,
  Plus,
  Trash2,
  X,
  Layers,
  ToggleLeft,
  ToggleRight,
  Split,
  AlertTriangle,
  ClipboardList,
  Sparkles,
  Info,
  SlidersHorizontal,
  Check
} from 'lucide-react';

interface DataPoinJaspelViewProps {
  poinConfig: PoinJaspelConfig;
  onSaveConfig: (newConfig: PoinJaspelConfig) => void;
  onRecalculateAllEmployees?: () => void;
}

export const DataPoinJaspelView: React.FC<DataPoinJaspelViewProps> = ({
  poinConfig,
  onSaveConfig,
  onRecalculateAllEmployees,
}) => {
  const [formData, setFormData] = useState<PoinJaspelConfig>({ 
    ...poinConfig,
    tugasTambahanEnabled: poinConfig.tugasTambahanEnabled ?? true,
    customTugasTambahanList: poinConfig.customTugasTambahanList || DEFAULT_TUGAS_TAMBAHAN_LIST,
    enableSharedPointDivision: poinConfig.enableSharedPointDivision ?? true,
    progPoliUmum: poinConfig.progPoliUmum ?? 10,
    progUgd: poinConfig.progUgd ?? 15,
    progRawatInap: poinConfig.progRawatInap ?? 10,
    ugdDokterPercent: poinConfig.ugdDokterPercent ?? 50,
    ugdPetugasPercent: poinConfig.ugdPetugasPercent ?? 50,
  });
  const [isSaved, setIsSaved] = useState(false);

  // Modal State Tambah Tugas Administrasi
  const [isAddTugasModalOpen, setIsAddTugasModalOpen] = useState(false);
  const [newTugasNama, setNewTugasNama] = useState('');
  const [newTugasPoin, setNewTugasPoin] = useState<number>(10);

  // Modal State Tambah Program & Pelayanan
  const [isAddProgModalOpen, setIsAddProgModalOpen] = useState(false);
  const [newProgNama, setNewProgNama] = useState('');
  const [newProgPoin, setNewProgPoin] = useState<number>(5);

  // Modal State Tambah Tugas Administrasi Tambahan (Kelompok 7)
  const [isAddTugasTambahanModalOpen, setIsAddTugasTambahanModalOpen] = useState(false);
  const [newTugasTambahanNama, setNewTugasTambahanNama] = useState('');
  const [newTugasTambahanPoin, setNewTugasTambahanPoin] = useState<number>(10);

  const handleChange = (field: keyof PoinJaspelConfig, val: number) => {
    setFormData((prev) => ({ ...prev, [field]: Number(val) || 0 }));
    setIsSaved(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    setFormData({ ...DEFAULT_POIN_JASPEL });
    onSaveConfig(DEFAULT_POIN_JASPEL);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Handler Tambah Tugas Administrasi Baru
  const handleAddCustomTugas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTugasNama.trim()) return;
    const item: CustomPoinItem = {
      id: `tugas-${Date.now()}`,
      nama: newTugasNama.trim(),
      poin: Number(newTugasPoin) || 0,
    };
    setFormData((prev) => ({
      ...prev,
      customTugasList: [...(prev.customTugasList || []), item],
    }));
    setNewTugasNama('');
    setNewTugasPoin(10);
    setIsAddTugasModalOpen(false);
    setIsSaved(false);
  };

  const handleDeleteCustomTugas = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      customTugasList: (prev.customTugasList || []).filter((t) => t.id !== id),
    }));
    setIsSaved(false);
  };

  const handleCustomTugasPoinChange = (id: string, poin: number) => {
    setFormData((prev) => ({
      ...prev,
      customTugasList: (prev.customTugasList || []).map((t) =>
        t.id === id ? { ...t, poin: Number(poin) || 0 } : t
      ),
    }));
    setIsSaved(false);
  };

  // Handler Tambah Program Pelayanan Baru
  const handleAddCustomProg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgNama.trim()) return;
    const item: CustomPoinItem = {
      id: `prog-${Date.now()}`,
      nama: newProgNama.trim(),
      poin: Number(newProgPoin) || 0,
    };
    setFormData((prev) => ({
      ...prev,
      customProgramList: [...(prev.customProgramList || []), item],
    }));
    setNewProgNama('');
    setNewProgPoin(5);
    setIsAddProgModalOpen(false);
    setIsSaved(false);
  };

  const handleDeleteCustomProg = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      customProgramList: (prev.customProgramList || []).filter((p) => p.id !== id),
    }));
    setIsSaved(false);
  };

  const handleCustomProgPoinChange = (id: string, poin: number) => {
    setFormData((prev) => ({
      ...prev,
      customProgramList: (prev.customProgramList || []).map((p) =>
        p.id === id ? { ...p, poin: Number(poin) || 0 } : p
      ),
    }));
    setIsSaved(false);
  };

  // Handler Kelompok 7: Toggle Aktif/Nonaktif Seluruh Kelompok
  const handleToggleTugasTambahanGroup = () => {
    setFormData((prev) => ({
      ...prev,
      tugasTambahanEnabled: !prev.tugasTambahanEnabled,
    }));
    setIsSaved(false);
  };

  // Handler Kelompok 7: Tambah Tugas Administrasi Tambahan Baru
  const handleAddCustomTugasTambahan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTugasTambahanNama.trim()) return;
    const item: CustomPoinItem = {
      id: `tt-${Date.now()}`,
      nama: newTugasTambahanNama.trim(),
      poin: Number(newTugasTambahanPoin) || 0,
    };
    setFormData((prev) => ({
      ...prev,
      customTugasTambahanList: [...(prev.customTugasTambahanList || DEFAULT_TUGAS_TAMBAHAN_LIST), item],
    }));
    setNewTugasTambahanNama('');
    setNewTugasTambahanPoin(10);
    setIsAddTugasTambahanModalOpen(false);
    setIsSaved(false);
  };

  const handleDeleteCustomTugasTambahan = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      customTugasTambahanList: (prev.customTugasTambahanList || DEFAULT_TUGAS_TAMBAHAN_LIST).filter((t) => t.id !== id),
    }));
    setIsSaved(false);
  };

  const handleCustomTugasTambahanPoinChange = (id: string, poin: number) => {
    setFormData((prev) => ({
      ...prev,
      customTugasTambahanList: (prev.customTugasTambahanList || DEFAULT_TUGAS_TAMBAHAN_LIST).map((t) =>
        t.id === id ? { ...t, poin: Number(poin) || 0 } : t
      ),
    }));
    setIsSaved(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              Pengaturan • Data Poin Jaspel
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Standar Poin Dasar AJP
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Data Poin Jaspel (Matriks Poin Dasar)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengaturan bobot poin per kelompok: Jenis Ketenagaan Ijazah, Rangkap Tugas Administrasi, Program & Pelayanan, Status Kepegawaian, dan Variabel Kinerja.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Standar AJP</span>
          </button>
          <button
            type="submit"
            form="form-poin"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Matriks Poin</span>
          </button>
        </div>
      </div>

      {isSaved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Konfigurasi Poin Dasar berhasil disimpan dan diperbarui di lembar Hitung Poin!</span>
          </div>
          {onRecalculateAllEmployees && (
            <button
              type="button"
              onClick={onRecalculateAllEmployees}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold"
            >
              Sinkronkan ke Master Karyawan
            </button>
          )}
        </div>
      )}

      <form id="form-poin" onSubmit={handleSave} className="space-y-6">
        {/* GRUP 1: JENIS KETENAGAAN BERDASARKAN IJAZAH */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">1. Jenis Ketenagaan Berdasarkan Ijazah</h3>
                <p className="text-[11px] text-slate-500">Nilai poin kualifikasi ijazah dan profesi tenaga kesehatan</p>
              </div>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
              Untuk PPPK, sesuai dengan SK
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: 'Dokter', key: 'ijazahDokter' as const, sub: 'Profesi Dokter' },
              { label: 'Dokter Gigi', key: 'ijazahDokterGigi' as const, sub: 'Profesi Dokter Gigi' },
              { label: 'Ners / S.St Bd', key: 'ijazahNersSstBd' as const, sub: 'Profesi / D4 Kebidanan' },
              { label: 'Apoteker', key: 'ijazahApoteker' as const, sub: 'Profesi Apoteker' },
              { label: 'S1 Kesehatan / DIV', key: 'ijazahS1KesDiv' as const, sub: 'S1 Kes / DIV Terapan' },
              { label: 'S1 Non Kesehatan', key: 'ijazahS1NonKes' as const, sub: 'S1 Umum / Non Medis' },
              { label: 'D3 Kesehatan', key: 'ijazahD3Kes' as const, sub: 'D3 Medis / Bidan / Perawat' },
              { label: 'D3 Non Kesehatan', key: 'ijazahD3NonKes' as const, sub: 'D3 Administrasi / TI' },
              { label: 'Asisten Kesehatan', key: 'ijazahAsistenKes' as const, sub: 'SMK Farmasi / Asisten' },
              { label: 'Dibawah D3 Non Kes.', key: 'ijazahDibawahD3NonKes' as const, sub: 'SD, SMP, SMA Sederajat' },
            ].map((item) => (
              <div key={item.key} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="block text-xs font-bold text-slate-800 mb-0.5">{item.label}</span>
                <span className="block text-[10px] text-slate-400 mb-1">{item.sub}</span>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={formData[item.key]}
                    onChange={(e) => handleChange(item.key, Number(e.target.value))}
                    className="w-full text-xs font-bold font-mono px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                  <span className="text-[11px] text-slate-500 font-medium">Poin</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GRUP 2: MASA KERJA BERDASARKAN TMT CPNS */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">2. Masa Kerja Berdasarkan TMT CPNS</h3>
              <p className="text-[11px] text-slate-500">
                Poin bertambah 1 poin per tahun masa kerja pengabdian: &lt;1 Th = 0 poin, 1 Th = 1 poin, 2 Th = 2 poin, dst (Maksimal 25 poin sesuai sheet).
              </p>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
            <span>Aturan: <strong>1 Poin / Tahun Masa Kerja (TMT)</strong></span>
            <span className="font-mono text-indigo-700 font-bold">Maks. 25 Poin</span>
          </div>
        </div>

        {/* GRUP 3: RANGKAP TUGAS ADMINISTRASI (With + Tambah Tugas Fitur) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">3. Rangkap Tugas Administrasi</h3>
                <p className="text-[11px] text-slate-500">Jabatan manajerial dan kepengurusan administratif puskesmas</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAddTugasModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Poin Tugas</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: 'Kapus', key: 'tugasKapus' as const },
              { label: 'KTU beserta Tim', key: 'tugasKtuBesertaTim' as const },
              { label: 'PPTK', key: 'tugasPptk' as const },
              { label: 'Bendahara Pengeluaran', key: 'tugasBendaharaPengeluaran' as const },
              { label: 'Bendahara Penerimaan+Kasir', key: 'tugasBendaharaPenerimaanKasir' as const },
              { label: 'Akuntansi', key: 'tugasAkuntansi' as const },
              { label: 'Pengurus Barang', key: 'tugasPengurusBarang' as const },
              { label: 'PPHP', key: 'tugasPphp' as const },
              { label: 'TIM JKN', key: 'tugasTimJkn' as const },
              { label: 'TIM BOK & JAMPERSAL', key: 'tugasTimBokJampersal' as const },
              { label: 'RJG dan RIG', key: 'tugasRjgRig' as const },
              { label: 'Tim Pokja', key: 'tugasTimPokja' as const },
              { label: 'PJ Pustu/Polindes/Ponkesdes', key: 'tugasPjPustuPolindes' as const },
              { label: 'Tim Mutu', key: 'tugasTimMutu' as const },
              { label: 'Tim SPI', key: 'tugasTimSpi' as const },
            ].map((item) => (
              <div key={item.key} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="block text-xs font-bold text-slate-800 mb-1">{item.label}</span>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData[item.key]}
                    onChange={(e) => handleChange(item.key, Number(e.target.value))}
                    className="w-full text-xs font-bold font-mono px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                  <span className="text-[11px] text-slate-500">Poin</span>
                </div>
              </div>
            ))}

            {/* Custom Added Tasks */}
            {(formData.customTugasList || []).map((ct) => (
              <div key={ct.id} className="p-3 bg-blue-50/40 rounded-xl border border-blue-200 relative group">
                <div className="flex items-center justify-between mb-1">
                  <span className="block text-xs font-bold text-blue-900 truncate" title={ct.nama}>
                    {ct.nama}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteCustomTugas(ct.id)}
                    className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                    title="Hapus tugas tambahan ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={ct.poin}
                    onChange={(e) => handleCustomTugasPoinChange(ct.id, Number(e.target.value))}
                    className="w-full text-xs font-bold font-mono px-2 py-1.5 rounded-lg border border-blue-300 bg-white"
                  />
                  <span className="text-[11px] text-blue-700 font-medium">Poin</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GRUP 4: PROGRAM DAN PELAYANAN (With + Tambah Program Fitur) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">4. Program dan Pelayanan</h3>
                <p className="text-[11px] text-slate-500">
                  Daftar nilai poin program kesehatan. Poin ini otomatis masuk ke lembar <strong>Hitung Poin</strong> (kolom PJ Program, Program 1, Tambahan 1 s/d 4) sesuai isian program tiap pegawai.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAddProgModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 rounded-lg text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Poin Program</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: 'Promkes', key: 'progPromkes' as const },
              { label: 'Kesehatan Lingkungan', key: 'progKesling' as const },
              { label: 'KIA', key: 'progKia' as const },
              { label: 'KB', key: 'progKb' as const },
              { label: 'Gizi', key: 'progGizi' as const },
              { label: 'UKS', key: 'progUks' as const },
              { label: 'Diare', key: 'progDiare' as const },
              { label: 'Ispa', key: 'progIspa' as const },
              { label: 'Kusta', key: 'progKusta' as const },
              { label: 'TB', key: 'progTb' as const },
              { label: 'DBD', key: 'progDbd' as const },
              { label: 'HIV / Penyakit Kelamin', key: 'progHivPms' as const },
              { label: 'Malaria/Rabies/Filaria', key: 'progMalariaRabies' as const },
              { label: 'Hepatitis', key: 'progHepatitis' as const },
              { label: 'Imunisasi', key: 'progImunisasi' as const },
              { label: 'Tim Prolanis', key: 'progTimProlanis' as const },
              { label: 'Surveilance', key: 'progSurveilance' as const },
              { label: 'PTM', key: 'progPtm' as const },
              { label: 'Perkesmas & PIS-PK', key: 'progPerkesmasPisPk' as const },
              { label: 'Keswa', key: 'progKeswa' as const },
              { label: 'Gilut', key: 'progGilut' as const },
              { label: 'Hatra', key: 'progHatra' as const },
              { label: 'Kesorga', key: 'progKesorga' as const },
              { label: 'Indra', key: 'progIndra' as const },
              { label: 'Kes Kerja', key: 'progKesKerja' as const },
            ].map((item) => (
              <div key={item.key} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="block text-xs font-bold text-slate-800 mb-1">{item.label}</span>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData[item.key]}
                    onChange={(e) => handleChange(item.key, Number(e.target.value))}
                    className="w-full text-xs font-bold font-mono px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                  <span className="text-[11px] text-slate-500 font-medium">Poin</span>
                </div>
              </div>
            ))}

            {/* Custom Added Programs */}
            {(formData.customProgramList || []).map((cp) => (
              <div key={cp.id} className="p-3 bg-teal-50/40 rounded-xl border border-teal-200 relative group">
                <div className="flex items-center justify-between mb-1">
                  <span className="block text-xs font-bold text-teal-900 truncate" title={cp.nama}>
                    {cp.nama}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteCustomProg(cp.id)}
                    className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                    title="Hapus program tambahan ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={cp.poin}
                    onChange={(e) => handleCustomProgPoinChange(cp.id, Number(e.target.value))}
                    className="w-full text-xs font-bold font-mono px-2 py-1.5 rounded-lg border border-teal-300 bg-white"
                  />
                  <span className="text-[11px] text-teal-700 font-medium">Poin</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GRUP 5 & 6: STATUS KEPEGAWAIAN & VARIABEL KINERJA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* GRUP 5: STATUS KEPEGAWAIAN */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center space-x-2.5">
              <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">5. Status Kepegawaian</h3>
                <p className="text-[11px] text-slate-500">Poin status aparatur sipil negara dan non-ASN</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="block text-xs font-bold text-slate-800 mb-1">1. PNS</span>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    min="0"
                    value={formData.statusPns ?? formData.statusAsn}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      handleChange('statusPns', v);
                      handleChange('statusAsn', v);
                    }}
                    className="w-full text-xs font-bold font-mono px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                  <span className="text-[11px] text-slate-500">Poin</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Standar: 20 Poin</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="block text-xs font-bold text-slate-800 mb-1">2. PPPK</span>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    min="0"
                    value={formData.statusPppk ?? formData.statusAsn}
                    onChange={(e) => handleChange('statusPppk', Number(e.target.value))}
                    className="w-full text-xs font-bold font-mono px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                  <span className="text-[11px] text-slate-500">Poin</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Standar: 20 Poin</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="block text-xs font-bold text-slate-800 mb-1">3. Honorer (NON ASN)</span>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    min="0"
                    value={formData.statusHonorer ?? formData.statusNonAsn}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      handleChange('statusHonorer', v);
                      handleChange('statusNonAsn', v);
                    }}
                    className="w-full text-xs font-bold font-mono px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                  <span className="text-[11px] text-slate-500">Poin</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Standar: 5 Poin</span>
              </div>
            </div>
          </div>

          {/* GRUP 6: VARIABEL KINERJA */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center space-x-2.5">
              <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
                <Gauge className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">6. Variabel Kinerja</h3>
                <p className="text-[11px] text-slate-500">Persentase capaian kinerja per predikat</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { label: 'Sangat Baik', key: 'kinerjaSangatBaik' as const },
                { label: 'Baik', key: 'kinerjaBaik' as const },
                { label: 'Cukup', key: 'kinerjaCukup' as const },
                { label: 'Kurang', key: 'kinerjaKurang' as const },
                { label: 'Sangat Kurang', key: 'kinerjaSangatKurang' as const },
              ].map((item) => (
                <div key={item.key} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="block text-[11px] font-bold text-slate-700 mb-0.5">{item.label}</span>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      step="0.5"
                      value={formData[item.key]}
                      onChange={(e) => handleChange(item.key, Number(e.target.value))}
                      className="w-full text-xs font-mono font-bold px-2 py-1 rounded border border-slate-300 bg-white"
                    />
                    <span className="text-xs text-slate-500">%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PENGATURAN TERKAIT NILAI POIN: PEMBAGIAN POIN BERSAMA & ATURAN KHUSUS UGD */}
        <div className="bg-linear-to-br from-indigo-50/70 via-white to-sky-50/60 rounded-xl border border-indigo-200 p-6 shadow-sm space-y-5">
          <div className="border-b border-indigo-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-xs">
                <Split className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Pengaturan Pembagian Nilai Poin Bersama (Shared Points) & Aturan UGD
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                    Sistem Otomatis
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Aturan pembagian nilai poin jika satu program atau tugas dijalankan bersama oleh beberapa orang.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  enableSharedPointDivision: !(prev.enableSharedPointDivision ?? true),
                }));
                setIsSaved(false);
              }}
              className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all shadow-xs ${
                formData.enableSharedPointDivision !== false
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700 border-slate-300'
              }`}
            >
              {formData.enableSharedPointDivision !== false ? (
                <>
                  <ToggleRight className="w-4 h-4" />
                  <span>Fitur Pembagian Bersama: AKTIF</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4" />
                  <span>Fitur Pembagian Bersama: NONAKTIF</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Box 1: Aturan Umum (Poli Umum dll.) */}
            <div className="bg-white rounded-xl p-4 border border-indigo-100 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                  <h4 className="text-xs font-bold text-slate-800">
                    1. Aturan Umum: Dibagi Sebanyak Orang yang Menggunakan
                  </h4>
                </div>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-mono px-2 py-0.5 rounded font-semibold">
                  Semua Kriteria (Kecuali UGD)
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Jika poin digunakan untuk beberapa orang, maka nilai poin dibagi sebanyak orang yang menggunakan. 
                <span className="block mt-1 p-2 bg-indigo-50/60 rounded border border-indigo-100 font-mono text-[10.5px] text-indigo-950">
                  💡 <strong>Contoh:</strong> Poin Poli Umum senilai 10 poin, jika terdapat 2 karyawan yang bertugas atau mendapatkan Poin Poli Umum, maka masing-masing mendapatkan <strong>5 poin</strong> (10 ÷ 2).
                </span>
              </p>

              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2.5">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nilai Poin Poli Umum
                  </label>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={formData.progPoliUmum ?? 10}
                      onChange={(e) => handleChange('progPoliUmum', Number(e.target.value))}
                      className="w-full text-xs font-mono font-bold px-2 py-1 rounded border border-slate-300 bg-white"
                    />
                    <span className="text-xs text-slate-500">Poin</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nilai Poin Rawat Inap
                  </label>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={formData.progRawatInap ?? 10}
                      onChange={(e) => handleChange('progRawatInap', Number(e.target.value))}
                      className="w-full text-xs font-mono font-bold px-2 py-1 rounded border border-slate-300 bg-white"
                    />
                    <span className="text-xs text-slate-500">Poin</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: Aturan Khusus UGD */}
            <div className="bg-white rounded-xl p-4 border border-rose-200/80 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-rose-600"></div>
                  <h4 className="text-xs font-bold text-slate-800">
                    2. Aturan Khusus UGD (Unit Gawat Darurat)
                  </h4>
                </div>
                <span className="text-[10px] bg-rose-50 text-rose-700 font-mono px-2 py-0.5 rounded font-semibold">
                  50% Dokter • 50% Petugas Lain
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Nilai Poin UGD dibagi dua: <strong>50% untuk dokter</strong> dan <strong>50% sisanya untuk petugas lain</strong> (Perawat dan Analis/Bidan). Pembagiannya sama dengan pengaturan pertama di atas.
                <span className="block mt-1 p-2 bg-rose-50/60 rounded border border-rose-100 font-mono text-[10.5px] text-rose-950">
                  🚑 <strong>Contoh:</strong> Jika ada 2 dokter dan 5 perawat di UGD, maka kuota 50% dokter dibagi 2 dokter, dan kuota 50% perawat dibagi bersama 5 perawat.
                </span>
              </p>

              <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <label className="block text-[10.5px] font-bold text-slate-700 mb-1">
                    Total Poin UGD
                  </label>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={formData.progUgd ?? 15}
                      onChange={(e) => handleChange('progUgd', Number(e.target.value))}
                      className="w-full text-xs font-mono font-bold px-1.5 py-1 rounded border border-slate-300 bg-white"
                    />
                    <span className="text-[11px] text-slate-500">Poin</span>
                  </div>
                </div>

                <div className="p-2 bg-rose-50/50 rounded-lg border border-rose-200">
                  <label className="block text-[10.5px] font-bold text-rose-900 mb-1">
                    Porsi Dokter (%)
                  </label>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={formData.ugdDokterPercent ?? 50}
                      onChange={(e) => handleChange('ugdDokterPercent', Number(e.target.value))}
                      className="w-full text-xs font-mono font-bold px-1.5 py-1 rounded border border-rose-300 bg-white"
                    />
                    <span className="text-[11px] text-rose-700">%</span>
                  </div>
                </div>

                <div className="p-2 bg-sky-50/50 rounded-lg border border-sky-200">
                  <label className="block text-[10.5px] font-bold text-sky-900 mb-1">
                    Porsi Petugas Lain (%)
                  </label>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={formData.ugdPetugasPercent ?? 50}
                      onChange={(e) => handleChange('ugdPetugasPercent', Number(e.target.value))}
                      className="w-full text-xs font-mono font-bold px-1.5 py-1 rounded border border-sky-300 bg-white"
                    />
                    <span className="text-[11px] text-sky-700">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GRUP 7: TUGAS ADMINISTRASI TAMBAHAN (Dapat Diaktifkan / Dinonaktifkan Secara Keseluruhan) */}
        <div className={`rounded-xl border shadow-sm p-6 space-y-4 transition-all ${
          formData.tugasTambahanEnabled !== false 
            ? 'bg-white border-purple-200/90' 
            : 'bg-slate-50/80 border-slate-300'
        }`}>
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div className={`p-2 rounded-lg ${
                formData.tugasTambahanEnabled !== false
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-slate-200 text-slate-500'
              }`}>
                <ClipboardList className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    7. Tugas Administrasi Tambahan
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    formData.tugasTambahanEnabled !== false
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {formData.tugasTambahanEnabled !== false ? '● STATUS: AKTIF' : '○ STATUS: NONAKTIF'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Kelompok tugas tambahan khusus puskesmas. Dapat diaktifkan atau dinonaktifkan secara keseluruhan pada semua item tugas khusus kelompok ini saja.
                </p>
              </div>
            </div>

            {/* Aksi Pojok Kanan: Toggle Saklar Kelompok + Tombol Tambah Program/Tugas (seperti nomor 4) */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={handleToggleTugasTambahanGroup}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all shadow-xs ${
                  formData.tugasTambahanEnabled !== false
                    ? 'bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-300'
                    : 'bg-rose-600 hover:bg-rose-700 text-white border-rose-700'
                }`}
                title="Klik untuk mengaktifkan atau menonaktifkan seluruh tugas pada kelompok 7 ini"
              >
                {formData.tugasTambahanEnabled !== false ? (
                  <>
                    <ToggleRight className="w-4 h-4 text-purple-600" />
                    <span>Nonaktifkan Kelompok Ini</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-4 h-4 text-white" />
                    <span>Aktifkan Kelompok Ini</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsAddTugasTambahanModalOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                title="Tambah tugas administrasi tambahan baru ke kelompok ini"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Program/Tugas</span>
              </button>
            </div>
          </div>

          {/* Banner Peringatan jika Kelompok Nonaktif */}
          {formData.tugasTambahanEnabled === false && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Kelompok 7 Berstatus Nonaktif!</strong>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  Semua tugas yang ada di kelompok ini dinonaktifkan secara keseluruhan. Poin tugas tambahan bagi karyawan yang memperoleh poin dari tugas tambahan khusus ini <strong>TIDAK IKUT TERAKUMULASI ATAU TIDAK DIHITUNG POINNYA</strong> pada lembar Hitung Poin.
                </p>
              </div>
            </div>
          )}

          {/* Grid Daftar Tugas Administrasi Tambahan */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {(formData.customTugasTambahanList || DEFAULT_TUGAS_TAMBAHAN_LIST).map((ct) => (
              <div 
                key={ct.id} 
                className={`p-3 rounded-xl border relative group transition-all ${
                  formData.tugasTambahanEnabled !== false
                    ? 'bg-purple-50/40 border-purple-200 hover:border-purple-300'
                    : 'bg-slate-100/80 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-1 mb-1">
                  <div>
                    <span className="block text-xs font-bold text-slate-800 line-clamp-1" title={ct.nama}>
                      {ct.nama}
                    </span>
                    <span className={`inline-block text-[9.5px] px-1.5 py-0.2 rounded font-semibold mt-0.5 ${
                      formData.tugasTambahanEnabled !== false
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {formData.tugasTambahanEnabled !== false ? 'Aktif' : 'Nonaktif (0 Poin)'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteCustomTugasTambahan(ct.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors shrink-0"
                    title="Hapus tugas tambahan ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center space-x-1.5 mt-2">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={ct.poin}
                    onChange={(e) => handleCustomTugasTambahanPoinChange(ct.id, Number(e.target.value))}
                    className="w-full text-xs font-bold font-mono px-2 py-1.5 rounded-lg border border-purple-300 bg-white"
                  />
                  <span className="text-[11px] text-purple-700 font-medium">Poin</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>

      {/* Modal Tambah Tugas Administrasi Tambahan (Kelompok 7) */}
      {isAddTugasTambahanModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <ClipboardList className="w-4 h-4 text-purple-600" />
                <span>Tambah Tugas Administrasi Tambahan (Kel. 7)</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddTugasTambahanModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomTugasTambahan} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Tugas Administrasi Tambahan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tim Pengelola BOK Puskesmas / Tim Akreditasi"
                  value={newTugasTambahanNama}
                  onChange={(e) => setNewTugasTambahanNama(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jumlah Nilai Poin <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={newTugasTambahanPoin}
                    onChange={(e) => setNewTugasTambahanPoin(Number(e.target.value))}
                    className="w-full text-xs font-bold font-mono px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:border-purple-500"
                  />
                  <span className="text-xs text-slate-500 font-semibold">Poin</span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddTugasTambahanModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs"
                >
                  Simpan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Tugas Administrasi */}
      {isAddTugasModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>Tambah Tugas Administrasi Baru</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddTugasModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomTugas} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Tugas Administrasi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tim Akreditasi Puskesmas / Tim Audit Internal"
                  value={newTugasNama}
                  onChange={(e) => setNewTugasNama(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jumlah Nilai Poin <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={newTugasPoin}
                    onChange={(e) => setNewTugasPoin(Number(e.target.value))}
                    className="w-full text-xs font-bold font-mono px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:border-blue-500"
                  />
                  <span className="text-xs text-slate-500 font-semibold">Poin</span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddTugasModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Simpan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Program dan Pelayanan */}
      {isAddProgModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Target className="w-4 h-4 text-teal-600" />
                <span>Tambah Program dan Pelayanan Baru</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddProgModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomProg} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Program / Pelayanan Kesehatan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pelayanan USG Ibu Hamil / Skrining Kanker Leher Rahim"
                  value={newProgNama}
                  onChange={(e) => setNewProgNama(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jumlah Nilai Poin <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={newProgPoin}
                    onChange={(e) => setNewProgPoin(Number(e.target.value))}
                    className="w-full text-xs font-bold font-mono px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:border-teal-500"
                  />
                  <span className="text-xs text-slate-500 font-semibold">Poin</span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddProgModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs"
                >
                  Simpan Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
