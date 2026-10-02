import React, { useState } from 'react';
import { InstansiConfig } from '../../types/jaspel';
import { 
  Building2, 
  Users, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  FileText, 
  Briefcase, 
  CreditCard,
  Calendar
} from 'lucide-react';

interface DataInstansiViewProps {
  instansi: InstansiConfig;
  onSaveInstansi: (newConfig: InstansiConfig) => void;
  onResetDefault: () => void;
}

export const DataInstansiView: React.FC<DataInstansiViewProps> = ({
  instansi,
  onSaveInstansi,
  onResetDefault,
}) => {
  const [formData, setFormData] = useState<InstansiConfig>({ ...instansi });
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (field: keyof InstansiConfig, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveInstansi(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Banner Title */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Menu 1.a Pengaturan
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Data Instansi & Pejabat Penandatangan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengaturan profil instansi faskes, kode anggaran, dan pejabat pengesah untuk dokumen resmi kwitansi, SP2D, dan laporan Jaspel.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={onResetDefault}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>
          <button
            type="submit"
            form="form-instansi"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>

      {isSaved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Data instansi dan pejabat berhasil disimpan dan langsung diterapkan ke seluruh dokumen kwitansi!</span>
        </div>
      )}

      <form id="form-instansi" onSubmit={handleSubmit} className="space-y-6">
        {/* Bagian A: Data Instansi */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">1. Data Instansi & Anggaran Belanja</h3>
              <p className="text-[11px] text-slate-500">Informasi identitas faskes puskesmas/klinik dan DPA anggaran</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Instansi / Puskesmas <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.namaInstansi}
                  onChange={(e) => handleChange('namaInstansi', e.target.value)}
                  placeholder="Contoh: UPTD Puskesmas Kalitengah"
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-800 bg-white"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Dicetak sebagai nama instansi pada Kop Surat & Kwitansi Global</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kode Instansi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.kodeInstansi}
                onChange={(e) => handleChange('kodeInstansi', e.target.value)}
                placeholder="Contoh: 1.02.0.00.0.00.01.0000"
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-800 font-mono bg-white"
              />
              <p className="text-[10px] text-slate-400 mt-1">Kode unit SKPD / Faskes sesuai SIPD</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kode Rekening Belanja <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.kodeRekeningBelanja}
                onChange={(e) => handleChange('kodeRekeningBelanja', e.target.value)}
                placeholder="Contoh: 5.1.02.02.01.0014"
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-800 font-mono bg-white"
              />
              <p className="text-[10px] text-slate-400 mt-1">Kode akun belanja Jasa Pelayanan BPJS</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor DPA (Dokumen Pelaksanaan Anggaran) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nomorDpa}
                onChange={(e) => handleChange('nomorDpa', e.target.value)}
                placeholder="Contoh: DPA/A.1/1.02.0.00.0.00.01.0000/001/2026"
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-800 font-mono bg-white"
              />
              <p className="text-[10px] text-slate-400 mt-1">Nomor register DPA SKPD tahun anggaran berjalan</p>
            </div>
          </div>
        </div>

        {/* Bagian B: Pejabat Penandatangan */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">2. Data Pejabat Penandatangan & Pengesah</h3>
              <p className="text-[11px] text-slate-500">Nama lengkap bergelar, NIP resmi, dan jabatan penandatangan kwitansi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Kepala Puskesmas / KPA */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>a. Kepala Instansi / KPA (Kuasa Pengguna Anggaran)</span>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Nama Kepala (Lengkap dengan Gelar)</label>
                <input
                  type="text"
                  value={formData.namaKepala}
                  onChange={(e) => handleChange('namaKepala', e.target.value)}
                  placeholder="Contoh: drg. Indah Mardiyah Hayati, M.H."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">NIP Kepala</label>
                  <input
                    type="text"
                    value={formData.nipKepala}
                    onChange={(e) => handleChange('nipKepala', e.target.value)}
                    placeholder="19750411 200312 2 004"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-mono bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Jabatan Resmi</label>
                  <input
                    type="text"
                    value={formData.jabatanKepala}
                    onChange={(e) => handleChange('jabatanKepala', e.target.value)}
                    placeholder="Plt. Kepala Puskesmas"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* 2. Pejabat Keuangan / PPK */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>b. Pejabat Penatausahaan Keuangan (PPK)</span>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Nama Pejabat Keuangan</label>
                <input
                  type="text"
                  value={formData.namaPejabatKeuangan}
                  onChange={(e) => handleChange('namaPejabatKeuangan', e.target.value)}
                  placeholder="Contoh: Muhammad Faizal, S.Si."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">NIP Pejabat Keuangan</label>
                  <input
                    type="text"
                    value={formData.nipPejabatKeuangan}
                    onChange={(e) => handleChange('nipPejabatKeuangan', e.target.value)}
                    placeholder="19950528 201902 1 006"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-mono bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Jabatan Resmi</label>
                  <input
                    type="text"
                    value={formData.jabatanPejabatKeuangan}
                    onChange={(e) => handleChange('jabatanPejabatKeuangan', e.target.value)}
                    placeholder="Pejabat Penatausahaan Keuangan"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* 3. Bendahara Pengeluaran */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>c. Bendahara Pengeluaran</span>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Nama Bendahara Pengeluaran</label>
                <input
                  type="text"
                  value={formData.namaBendahara}
                  onChange={(e) => handleChange('namaBendahara', e.target.value)}
                  placeholder="Contoh: Tri Mariyono Hadi Upoyo, S.Kep., Ns"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">NIP Bendahara</label>
                  <input
                    type="text"
                    value={formData.nipBendahara}
                    onChange={(e) => handleChange('nipBendahara', e.target.value)}
                    placeholder="19820622 200604 1 006"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-mono bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Jabatan Resmi</label>
                  <input
                    type="text"
                    value={formData.jabatanBendahara}
                    onChange={(e) => handleChange('jabatanBendahara', e.target.value)}
                    placeholder="Bendahara Pengeluaran"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* 4. PPTK */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span>d. Pejabat Pelaksana Teknis Kegiatan (PPTK)</span>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Nama PPTK</label>
                <input
                  type="text"
                  value={formData.namaPptk}
                  onChange={(e) => handleChange('namaPptk', e.target.value)}
                  placeholder="Contoh: Muhammad Faizal, S.Si."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">NIP PPTK</label>
                  <input
                    type="text"
                    value={formData.nipPptk}
                    onChange={(e) => handleChange('nipPptk', e.target.value)}
                    placeholder="19950528 201902 1 006"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-mono bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Jabatan Resmi</label>
                  <input
                    type="text"
                    value={formData.jabatanPptk}
                    onChange={(e) => handleChange('jabatanPptk', e.target.value)}
                    placeholder="Pejabat Pelaksana Teknis Kegiatan"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tanggal Lunas Bayar */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Tanggal Lunas Bayar / Penerbitan Kwitansi</label>
              <p className="text-[10px] text-slate-400">Dicetak di atas tanda tangan bendahara pada lembar kwitansi</p>
            </div>
            <div className="w-full sm:w-64">
              <input
                type="text"
                value={formData.tanggalLunas}
                onChange={(e) => handleChange('tanggalLunas', e.target.value)}
                placeholder="Contoh: 23/09/2026 atau 23 September 2026"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-mono bg-white"
              />
            </div>
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="bg-slate-900 text-white rounded-xl p-5 space-y-3">
          <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
            Pratinjau Kop Surat Resmi Kwitansi
          </div>
          <div className="bg-white text-slate-900 p-4 rounded-lg font-mono text-xs border border-slate-200">
            <div className="text-center font-bold text-sm tracking-wide">{formData.namaInstansi.toUpperCase()}</div>
            <div className="text-center text-[10px] text-slate-500 mt-0.5">
              KODE INSTANSI: {formData.kodeInstansi} • NO. DPA: {formData.nomorDpa}
            </div>
            <div className="text-center text-[10px] text-slate-500">
              REKENING BELANJA: {formData.kodeRekeningBelanja} (JASA PELAYANAN KESEHATAN)
            </div>
            <div className="mt-3 pt-2 border-t border-dashed border-slate-300 flex justify-between text-[10px] text-slate-600">
              <div>KPA: {formData.namaKepala}</div>
              <div>PPK: {formData.namaPejabatKeuangan}</div>
              <div>PPTK: {formData.namaPptk}</div>
              <div>Bendahara: {formData.namaBendahara}</div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
