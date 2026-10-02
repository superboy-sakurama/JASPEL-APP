import React, { useState } from 'react';
import { PoinJaspelConfig } from '../../types/jaspel';
import { DEFAULT_POIN_JASPEL } from '../../lib/pointCalculator';
import { 
  Award, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  Users, 
  Stethoscope, 
  GraduationCap, 
  Briefcase, 
  Target,
  Sparkles,
  HelpCircle
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              Menu 1.c Pengaturan
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Data Poin Jaspel (Matriks Variabel Penilaian)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur bobot poin untuk setiap variabel penilaian (Status Kepegawaian, Jenis Ketenagaan, Pendidikan, dan PJ Program) sebagai dasar perhitungan lembar Hitung Poin & PFK BPJS.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Standar Permenkes</span>
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
            <span>Konfigurasi poin jaspel berhasil disimpan! Poin pada lembar Hitung Poin otomatis terbarukan.</span>
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
        {/* GRUP 1: STATUS KEPEGAWAIAN */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center space-x-2.5">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">1. Variabel Penilaian: Status Kepegawaian</h3>
              <p className="text-[11px] text-slate-500">Poin dasar pengakuan status aparatur sipil negara dan non-ASN</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-800">1. PNS (Pegawai Negeri Sipil)</span>
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">ASN</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.statusPns}
                  onChange={(e) => handleChange('statusPns', Number(e.target.value))}
                  className="w-full text-sm font-bold font-mono px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-xs font-semibold text-slate-500">Poin</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Standar Permenkes: 10 Poin</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-800">2. PPPK (Pegawai Pemerintah dg PK)</span>
                <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">ASN</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.statusPppk}
                  onChange={(e) => handleChange('statusPppk', Number(e.target.value))}
                  className="w-full text-sm font-bold font-mono px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-xs font-semibold text-slate-500">Poin</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Standar Permenkes: 8 Poin</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-800">3. Honorer (Non ASN / BLUD)</span>
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Non ASN</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.statusHonorer}
                  onChange={(e) => handleChange('statusHonorer', Number(e.target.value))}
                  className="w-full text-sm font-bold font-mono px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-xs font-semibold text-slate-500">Poin</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Standar Permenkes: 5 Poin (dikalikan % masa kerja)</p>
            </div>
          </div>
        </div>

        {/* GRUP 2: JENIS KETENAGAAN */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">2. Variabel Penilaian: Jenis Ketenagaan (Profesi Medis / Paramedis)</h3>
              <p className="text-[11px] text-slate-500">Poin profesi medis dokter umum, dokter gigi, perawat, bidan, apoteker, dan penunjang</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="block text-xs font-bold text-slate-800 mb-1">1. Dokter Umum</span>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  value={formData.tenagaDokterUmum}
                  onChange={(e) => handleChange('tenagaDokterUmum', Number(e.target.value))}
                  className="w-full text-sm font-bold font-mono px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-xs font-semibold text-slate-500">Poin</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Poin standar: 50</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="block text-xs font-bold text-slate-800 mb-1">2. Dokter Gigi</span>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  value={formData.tenagaDokterGigi}
                  onChange={(e) => handleChange('tenagaDokterGigi', Number(e.target.value))}
                  className="w-full text-sm font-bold font-mono px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-xs font-semibold text-slate-500">Poin</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Poin standar: 45</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="block text-xs font-bold text-slate-800 mb-1">3. Perawat (sesuai pend.)</span>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  value={formData.tenagaPerawat}
                  onChange={(e) => handleChange('tenagaPerawat', Number(e.target.value))}
                  className="w-full text-sm font-bold font-mono px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-xs font-semibold text-slate-500">Poin</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Poin standar: 25</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="block text-xs font-bold text-slate-800 mb-1">4. Bidan (sesuai pend.)</span>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  value={formData.tenagaBidan}
                  onChange={(e) => handleChange('tenagaBidan', Number(e.target.value))}
                  className="w-full text-sm font-bold font-mono px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-xs font-semibold text-slate-500">Poin</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Poin standar: 25</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="block text-xs font-bold text-slate-800 mb-1">5. Apoteker</span>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  value={formData.tenagaApoteker}
                  onChange={(e) => handleChange('tenagaApoteker', Number(e.target.value))}
                  className="w-full text-sm font-bold font-mono px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-xs font-semibold text-slate-500">Poin</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Poin standar: 30</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="block text-xs font-bold text-slate-800 mb-1">6. Asisten Apoteker / TTK</span>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  value={formData.tenagaAsistenApoteker}
                  onChange={(e) => handleChange('tenagaAsistenApoteker', Number(e.target.value))}
                  className="w-full text-sm font-bold font-mono px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-xs font-semibold text-slate-500">Poin</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Poin standar: 15</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="block text-xs font-bold text-slate-800 mb-1">7. Pranata Lab / Sanitasi / Gizi</span>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  value={formData.tenagaPranataLab}
                  onChange={(e) => handleChange('tenagaPranataLab', Number(e.target.value))}
                  className="w-full text-sm font-bold font-mono px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-xs font-semibold text-slate-500">Poin</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Poin standar: 20</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="block text-xs font-bold text-slate-800 mb-1">8. Tenaga Administrasi / Umum</span>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  value={formData.tenagaAdminUmum}
                  onChange={(e) => handleChange('tenagaAdminUmum', Number(e.target.value))}
                  className="w-full text-sm font-bold font-mono px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-xs font-semibold text-slate-500">Poin</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Poin standar: 10</p>
            </div>
          </div>
        </div>

        {/* GRUP 3: JENIS PENDIDIKAN */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center space-x-2.5">
            <div className="p-2 bg-purple-50 text-purple-700 rounded-lg">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">3. Variabel Penilaian: Jenis Pendidikan</h3>
              <p className="text-[11px] text-slate-500">Poin jenjang pendidikan formal ijazah yang diakui instansi</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="block text-xs font-bold text-slate-800 mb-1">1. SD / Sederajat</span>
              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  min="0"
                  value={formData.pendidikanSd}
                  onChange={(e) => handleChange('pendidikanSd', Number(e.target.value))}
                  className="w-full text-xs font-bold font-mono px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-[11px] text-slate-500 font-medium">Poin</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="block text-xs font-bold text-slate-800 mb-1">2. SMP / Sederajat</span>
              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  min="0"
                  value={formData.pendidikanSmp}
                  onChange={(e) => handleChange('pendidikanSmp', Number(e.target.value))}
                  className="w-full text-xs font-bold font-mono px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-[11px] text-slate-500 font-medium">Poin</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="block text-xs font-bold text-slate-800 mb-1">3. SMA / SMK</span>
              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  min="0"
                  value={formData.pendidikanSma}
                  onChange={(e) => handleChange('pendidikanSma', Number(e.target.value))}
                  className="w-full text-xs font-bold font-mono px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-[11px] text-slate-500 font-medium">Poin</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="block text-xs font-bold text-slate-800 mb-1">4. D3 (Diploma 3)</span>
              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  min="0"
                  value={formData.pendidikanD3}
                  onChange={(e) => handleChange('pendidikanD3', Number(e.target.value))}
                  className="w-full text-xs font-bold font-mono px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-[11px] text-slate-500 font-medium">Poin</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="block text-xs font-bold text-slate-800 mb-1">5. D4 / S1 (Sarjana)</span>
              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  min="0"
                  value={formData.pendidikanD4S1}
                  onChange={(e) => handleChange('pendidikanD4S1', Number(e.target.value))}
                  className="w-full text-xs font-bold font-mono px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-[11px] text-slate-500 font-medium">Poin</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="block text-xs font-bold text-slate-800 mb-1">6. Profesi / S2 / Sp.</span>
              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  min="0"
                  value={formData.pendidikanProfesi}
                  onChange={(e) => handleChange('pendidikanProfesi', Number(e.target.value))}
                  className="w-full text-xs font-bold font-mono px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-[11px] text-slate-500 font-medium">Poin</span>
              </div>
            </div>
          </div>
        </div>

        {/* GRUP 4: TUGAS ADMINISTRASI TAMBAHAN */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center space-x-2.5">
            <div className="p-2 bg-rose-50 text-rose-700 rounded-lg">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">4. Variabel Penilaian: Tugas Administrasi / Jabatan Tambahan</h3>
              <p className="text-[11px] text-slate-500">Tambahan poin manajerial pengelola faskes, bendahara, dan pokja</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="block text-xs font-bold text-slate-800 mb-1">Kepala Puskesmas</span>
              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  min="0"
                  value={formData.tugasKepalaPuskesmas}
                  onChange={(e) => handleChange('tugasKepalaPuskesmas', Number(e.target.value))}
                  className="w-full text-xs font-bold font-mono px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-[11px] text-slate-500 font-medium">Poin</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="block text-xs font-bold text-slate-800 mb-1">Ka Subbag TU</span>
              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  min="0"
                  value={formData.tugasKaSubbagTu}
                  onChange={(e) => handleChange('tugasKaSubbagTu', Number(e.target.value))}
                  className="w-full text-xs font-bold font-mono px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-[11px] text-slate-500 font-medium">Poin</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="block text-xs font-bold text-slate-800 mb-1">Bendahara</span>
              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  min="0"
                  value={formData.tugasBendahara}
                  onChange={(e) => handleChange('tugasBendahara', Number(e.target.value))}
                  className="w-full text-xs font-bold font-mono px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-[11px] text-slate-500 font-medium">Poin</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="block text-xs font-bold text-slate-800 mb-1">PPTK</span>
              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  min="0"
                  value={formData.tugasPptk}
                  onChange={(e) => handleChange('tugasPptk', Number(e.target.value))}
                  className="w-full text-xs font-bold font-mono px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-[11px] text-slate-500 font-medium">Poin</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="block text-xs font-bold text-slate-800 mb-1">PJ Pokja UKM/UKP</span>
              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  min="0"
                  value={formData.tugasPjPokja}
                  onChange={(e) => handleChange('tugasPjPokja', Number(e.target.value))}
                  className="w-full text-xs font-bold font-mono px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-[11px] text-slate-500 font-medium">Poin</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="block text-xs font-bold text-slate-800 mb-1">Tugas Lainnya</span>
              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  min="0"
                  value={formData.tugasLainnya}
                  onChange={(e) => handleChange('tugasLainnya', Number(e.target.value))}
                  className="w-full text-xs font-bold font-mono px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-[11px] text-slate-500 font-medium">Poin</span>
              </div>
            </div>
          </div>
        </div>

        {/* GRUP 5: PJ PROGRAM 1 SAMPAI 5 */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center space-x-2.5">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">5. Variabel Penilaian: Penanggung Jawab (PJ) Program 1 s/d Program 5</h3>
              <p className="text-[11px] text-slate-500">Bobot poin tambahan jika pegawai memegang tanggung jawab program kesehatan (KIA, Imunisasi, P2P, TB, dll)</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="block text-xs font-bold text-slate-800 mb-1">PJ Program 1</span>
              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  min="0"
                  value={formData.pjProgram1}
                  onChange={(e) => handleChange('pjProgram1', Number(e.target.value))}
                  className="w-full text-xs font-bold font-mono px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-[11px] text-slate-500 font-medium">Poin</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="block text-xs font-bold text-slate-800 mb-1">PJ Program 2</span>
              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  min="0"
                  value={formData.pjProgram2}
                  onChange={(e) => handleChange('pjProgram2', Number(e.target.value))}
                  className="w-full text-xs font-bold font-mono px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-[11px] text-slate-500 font-medium">Poin</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="block text-xs font-bold text-slate-800 mb-1">PJ Program 3</span>
              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  min="0"
                  value={formData.pjProgram3}
                  onChange={(e) => handleChange('pjProgram3', Number(e.target.value))}
                  className="w-full text-xs font-bold font-mono px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-[11px] text-slate-500 font-medium">Poin</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="block text-xs font-bold text-slate-800 mb-1">PJ Program 4</span>
              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  min="0"
                  value={formData.pjProgram4}
                  onChange={(e) => handleChange('pjProgram4', Number(e.target.value))}
                  className="w-full text-xs font-bold font-mono px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-[11px] text-slate-500 font-medium">Poin</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="block text-xs font-bold text-slate-800 mb-1">PJ Program 5</span>
              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  min="0"
                  value={formData.pjProgram5}
                  onChange={(e) => handleChange('pjProgram5', Number(e.target.value))}
                  className="w-full text-xs font-bold font-mono px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-[11px] text-slate-500 font-medium">Poin</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
