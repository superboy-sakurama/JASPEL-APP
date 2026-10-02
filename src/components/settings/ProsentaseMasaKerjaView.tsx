import React, { useState } from 'react';
import { MasaKerjaRule } from '../../types/jaspel';
import { DEFAULT_MASA_KERJA_RULES, getProsentaseMasaKerja } from '../../lib/pointCalculator';
import { 
  Percent, 
  Plus, 
  Trash2, 
  Edit3, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Calculator,
  AlertCircle
} from 'lucide-react';

interface ProsentaseMasaKerjaViewProps {
  rules: MasaKerjaRule[];
  onSaveRules: (newRules: MasaKerjaRule[]) => void;
  onResetRules: () => void;
}

export const ProsentaseMasaKerjaView: React.FC<ProsentaseMasaKerjaViewProps> = ({
  rules,
  onSaveRules,
  onResetRules,
}) => {
  const [ruleList, setRuleList] = useState<MasaKerjaRule[]>([...rules]);
  const [isSaved, setIsSaved] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Rule Form State
  const [newRule, setNewRule] = useState<Partial<MasaKerjaRule>>({
    label: '',
    minBulan: 0,
    maxBulan: 12,
    persentase: 50,
  });

  // Simulator State
  const [simMonths, setSimMonths] = useState<number>(8);

  const handleSave = () => {
    onSaveRules(ruleList);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    setRuleList([...DEFAULT_MASA_KERJA_RULES]);
    onSaveRules(DEFAULT_MASA_KERJA_RULES);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleDeleteRule = (id: string) => {
    setRuleList((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateRuleValue = (id: string, field: keyof MasaKerjaRule, val: any) => {
    setRuleList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: val } : r))
    );
  };

  const handleAddRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.label) return;

    const created: MasaKerjaRule = {
      id: `mk-${Date.now()}`,
      label: newRule.label,
      minBulan: Number(newRule.minBulan) || 0,
      maxBulan: Number(newRule.maxBulan) || 12,
      persentase: Number(newRule.persentase) || 50,
    };

    const updated = [...ruleList, created].sort((a, b) => a.minBulan - b.minBulan);
    setRuleList(updated);
    setIsAddModalOpen(false);
    setNewRule({ label: '', minBulan: 0, maxBulan: 12, persentase: 50 });
  };

  const simulatedPercentHonorer = getProsentaseMasaKerja('Honorer', simMonths, ruleList);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
              Menu 1.d Pengaturan
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Prosentase Masa Kerja Tenaga Honorer (Non ASN)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Perhitungan khusus jenjang masa kerja tenaga honorer faskes. Contoh: 0-6 bulan menerima 25% dari total poin, &gt;6-12 bulan 50%, dst. Pegawai ASN (PNS & PPPK) otomatis 100%.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Prosentase</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Aturan</span>
          </button>
        </div>
      </div>

      {isSaved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Aturan prosentase masa kerja berhasil disimpan dan diterapkan ke lembar Hitung Poin!</span>
        </div>
      )}

      {/* Info Card PNS / PPPK vs Honorer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-blue-900 block">Status ASN (PNS & PPPK): 100% Poin Utuh</span>
            <p className="text-[11px] text-blue-700 mt-0.5">
              Sesuai regulasi, pegawai berstatus PNS dan PPPK berhak mendapatkan 100% nilai akumulasi seluruh poin tanpa pengurangan masa kerja.
            </p>
          </div>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3">
          <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-amber-900 block">Status Honorer / Non ASN: Skala Proporsional</span>
            <p className="text-[11px] text-amber-700 mt-0.5">
              Tenaga Honorer / BLUD / Non ASN mendapatkan prosentase bertingkat dari total poin dasar sesuai lama pengabdian pada tabel di bawah ini.
            </p>
          </div>
        </div>
      </div>

      {/* Main Table: Rentang Prosentase */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <Percent className="w-4 h-4 text-slate-600" />
            <span>Tabel Konfigurasi Rentang Masa Kerja Honorer</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {ruleList.length} Jenjang Aktif
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 w-12 text-center">No</th>
                <th className="px-4 py-3">Deskripsi / Label Rentang</th>
                <th className="px-4 py-3 w-32 text-center">Bulan Mulai (Min)</th>
                <th className="px-4 py-3 w-32 text-center">Bulan Akhir (Max)</th>
                <th className="px-4 py-3 w-40 text-center">Prosentase Diperoleh</th>
                <th className="px-4 py-3 w-28 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ruleList.map((rule, idx) => (
                <tr key={rule.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 text-center font-mono text-slate-500">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={rule.label}
                      onChange={(e) => handleUpdateRuleValue(rule.id, 'label', e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:border-slate-800 bg-white"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex items-center space-x-1">
                      <input
                        type="number"
                        min="0"
                        value={rule.minBulan}
                        onChange={(e) => handleUpdateRuleValue(rule.id, 'minBulan', Number(e.target.value))}
                        className="w-20 text-xs text-center font-mono px-2 py-1.5 rounded-lg border border-slate-200 bg-white"
                      />
                      <span className="text-[11px] text-slate-400">bln</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex items-center space-x-1">
                      <input
                        type="number"
                        min="0"
                        value={rule.maxBulan >= 99999 ? 999 : rule.maxBulan}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          handleUpdateRuleValue(rule.id, 'maxBulan', val >= 999 ? 99999 : val);
                        }}
                        className="w-20 text-xs text-center font-mono px-2 py-1.5 rounded-lg border border-slate-200 bg-white"
                      />
                      <span className="text-[11px] text-slate-400">{rule.maxBulan >= 99999 ? 'dst' : 'bln'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex items-center justify-center space-x-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={rule.persentase}
                        onChange={(e) => handleUpdateRuleValue(rule.id, 'persentase', Number(e.target.value))}
                        className="w-20 text-xs text-center font-bold font-mono px-2 py-1.5 rounded-lg border border-slate-200 bg-emerald-50 text-emerald-800"
                      />
                      <span className="text-xs font-bold text-slate-600">%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus baris aturan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulator Interaktif */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Calculator className="w-4 h-4 text-emerald-400" />
          <span>Simulator Uji Hitung Masa Kerja Honorer</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Masukkan Lama Bekerja Pegawai Honorer:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                value={simMonths}
                onChange={(e) => setSimMonths(Number(e.target.value))}
                className="w-24 text-base font-bold font-mono px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
              />
              <span className="text-xs text-slate-400 font-medium">
                Bulan (~{(simMonths / 12).toFixed(1)} Tahun)
              </span>
            </div>
          </div>

          <div className="md:col-span-2 p-4 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Prosentase Poin yang Diperoleh Honorer:</span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-3xl font-black font-mono text-emerald-400">
                  {simulatedPercentHonorer}%
                </span>
                <span className="text-xs text-slate-400">
                  dari seluruh akumulasi poin
                </span>
              </div>
            </div>

            <div className="text-right text-xs text-slate-300">
              <span className="block text-slate-400 text-[11px]">Contoh jika total poin dasar 60 poin:</span>
              <span className="font-mono font-bold text-amber-400 text-sm">
                {(60 * (simulatedPercentHonorer / 100)).toFixed(1)} Poin PFK BPJS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Tambah Prosentase */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              <span>Tambah Jenjang Prosentase Masa Kerja</span>
            </h3>

            <form onSubmit={handleAddRuleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Label Rentang <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: > 3 Tahun s/d 4 Tahun"
                  value={newRule.label}
                  onChange={(e) => setNewRule({ ...newRule, label: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bulan Mulai (Min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newRule.minBulan}
                    onChange={(e) => setNewRule({ ...newRule, minBulan: Number(e.target.value) })}
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bulan Akhir (Max)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newRule.maxBulan}
                    onChange={(e) => setNewRule({ ...newRule, maxBulan: Number(e.target.value) })}
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prosentase Diperoleh (%) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={newRule.persentase}
                  onChange={(e) => setNewRule({ ...newRule, persentase: Number(e.target.value) })}
                  className="w-full text-xs font-bold font-mono px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Tambahkan Rentang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
