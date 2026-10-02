import React, { useState } from 'react';
import { PoinJaspelConfig, CustomPoinItem } from '../../types/jaspel';
import { DEFAULT_POIN_JASPEL } from '../../lib/pointCalculator';
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
  Layers
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
  const [formData, setFormData] = useState<PoinJaspelConfig>({ ...poinConfig });
  const [isSaved, setIsSaved] = useState(false);

  // Modal State Tambah Tugas Administrasi
  const [isAddTugasModalOpen, setIsAddTugasModalOpen] = useState(false);
  const [newTugasNama, setNewTugasNama] = useState('');
  const [newTugasPoin, setNewTugasPoin] = useState<number>(10);

  // Modal State Tambah Program & Pelayanan
  const [isAddProgModalOpen, setIsAddProgModalOpen] = useState(false);
  const [newProgNama, setNewProgNama] = useState('');
  const [newProgPoin, setNewProgPoin] = useState<number>(5);

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
      </form>

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
