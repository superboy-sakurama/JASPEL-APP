import React from 'react';
import { CalculatedEmployee, KapitasiSetup } from '../types/jaspel';
import { formatRupiah, formatNumber, formatPercent } from '../lib/utils';
import { Printer, X, ShieldCheck } from 'lucide-react';

interface SlipGajiModalProps {
  employee: CalculatedEmployee | null;
  setup: KapitasiSetup;
  onClose: () => void;
}

export const SlipGajiModal: React.FC<SlipGajiModalProps> = ({
  employee,
  setup,
  onClose,
}) => {
  if (!employee) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden print:border-none print:shadow-none print:max-w-full">
        {/* Modal Toolbar (Hidden during print) */}
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-800">
              Pratinjau Slip Pembagian Jasa Pelayanan (Jaspel)
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cetak Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Slip Content */}
        <div className="p-8 space-y-6 text-slate-800 font-sans" id="printable-slip">
          {/* Official Letterhead (Kop Surat) */}
          <div className="border-b-2 border-slate-800 pb-4 text-center">
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-600">
              Pemerintah Daerah Kabupaten / Kota
            </h3>
            <h2 className="text-sm font-extrabold uppercase tracking-tight text-slate-900 mt-0.5">
              Dinas Kesehatan • UPTD Puskesmas / Fasilitas Pelayanan Kesehatan
            </h2>
            <p className="text-[11px] text-slate-500 mt-1">
              BUKTI PEMBAYARAN JASA PELAYANAN (JASPEL) DANA KAPITASI BPJS KESEHATAN
            </p>
            <div className="inline-block mt-2 px-3 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-[10px] font-bold tracking-wider uppercase text-slate-700">
              Periode: {setup.bulan} {setup.tahun}
            </div>
          </div>

          {/* Pegawai Info Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs border-b border-slate-200 pb-4">
            <div>
              <span className="text-slate-500 text-[11px] block">Nama Pegawai:</span>
              <span className="font-bold text-slate-900">{employee.name}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Status Kepegawaian:</span>
              <span className="font-semibold text-slate-800">{employee.status} ({employee.jenisAsn})</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">NIP / Identitas:</span>
              <span className="font-mono text-slate-800">{employee.nip || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Jabatan / Fungsional:</span>
              <span className="text-slate-800 font-medium">{employee.jabatan}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Poin SK (Dasar):</span>
              <span className="font-mono font-bold text-slate-800">{employee.points} Poin</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Tingkat Kehadiran:</span>
              <span className="font-mono font-bold text-slate-800">
                {employee.attendance} / {employee.maxAttendance} Hari ({formatPercent(employee.attendance / employee.maxAttendance)})
              </span>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Rincian Perhitungan Keuangan (Largest Remainder Method)
            </h4>

            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              {/* Row 1: Bruto */}
              <div className="flex justify-between p-2.5 bg-slate-50 border-b border-slate-200">
                <div>
                  <span className="font-semibold text-slate-800">1. Penghasilan Bruto Jasa Pelayanan</span>
                  <span className="block text-[10px] text-slate-500">
                    Poin efektif ({formatNumber(employee.individualPoints, 2)}) × Nilai per Poin
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {formatRupiah(employee.brutoRaw)}
                </span>
              </div>

              {/* Row 2: Potongan Pajak */}
              <div className="flex justify-between p-2.5 border-b border-slate-200">
                <div>
                  <span className="font-medium text-rose-700">
                    2. Potongan Pajak PPh 21 ({(employee.taxRate * 100).toFixed(0)}%)
                  </span>
                  <span className="block text-[10px] text-slate-500">
                    Sesuai tarif pajak golongan ASN / NPWP
                  </span>
                </div>
                <span className="font-mono font-semibold text-rose-700">
                  -{formatRupiah(employee.tax)}
                </span>
              </div>

              {/* Row 3: Potongan FPK 1% */}
              <div className="flex justify-between p-2.5 border-b border-slate-200">
                <div>
                  <span className="font-medium text-amber-800">
                    3. Potongan Iuran FPK 1% Pegawai (BPJS Kesehatan)
                  </span>
                  <span className="block text-[10px] text-slate-500">
                    1% dari Penghasilan Bruto Shadow ({employee.status === 'Honorer' ? 'Bebas Potongan' : 'ASN'})
                  </span>
                </div>
                <span className="font-mono font-semibold text-amber-800">
                  -{formatRupiah(employee.fpk1)}
                </span>
              </div>

              {/* Row 4: Penyeimbangan +1 */}
              {employee.isBalancedBonus && (
                <div className="flex justify-between p-2.5 bg-emerald-50/70 border-b border-slate-200">
                  <div>
                    <span className="font-semibold text-emerald-800">
                      Penyesuaian Desimal (Largest Remainder)
                    </span>
                    <span className="block text-[10px] text-emerald-600">
                      Sisa pecahan pembulatan tertinggi (+Rp 1)
                    </span>
                  </div>
                  <span className="font-mono font-bold text-emerald-700">+Rp 1</span>
                </div>
              )}

              {/* Row 5: Netto Final */}
              <div className="flex justify-between p-3 bg-slate-900 text-white">
                <div>
                  <span className="font-bold text-sm">JUMLAH BERSIH DITERIMA (NETTO)</span>
                  <span className="block text-[10px] text-slate-400">
                    Ditransfer langsung ke rekening terdaftar
                  </span>
                </div>
                <span className="font-mono font-extrabold text-lg text-emerald-400">
                  {formatRupiah(employee.netto)}
                </span>
              </div>
            </div>
          </div>

          {/* Informasi Tambahan: FPK 4% */}
          {employee.status !== 'Honorer' && (
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800">Informasi Iuran FPK 4% Pemerintah Daerah: </span>
                Sebesar <span className="font-mono font-bold text-slate-900">{formatRupiah(employee.fpk4)}</span> disetorkan oleh Pemda/Dinas Kesehatan ke BPJS Kesehatan (bukan potongan gaji pegawai).
              </div>
            </div>
          )}

          {/* Signatures */}
          <div className="pt-4 grid grid-cols-2 text-center text-xs gap-6">
            <div>
              <p className="text-slate-500">Penerima Jasa Pelayanan,</p>
              <div className="h-16 flex items-end justify-center">
                <span className="font-bold text-slate-900 underline">{employee.name}</span>
              </div>
              <p className="text-[10px] font-mono text-slate-500 mt-0.5">NIP: {employee.nip || '-'}</p>
            </div>

            <div>
              <p className="text-slate-500">
                Bendahara Jaspel / Pengeluaran,
              </p>
              <div className="h-16 flex items-end justify-center">
                <span className="font-bold text-slate-900 underline">Bendahara Jaspel Puskesmas</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">NIP: 198005102008012014</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
