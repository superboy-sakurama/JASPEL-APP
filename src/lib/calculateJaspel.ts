import { Employee, CalculatedEmployee, CalculationResult } from '../types/jaspel';

/**
 * Engine Perhitungan Jaspel: Algoritma Balancing & Pembulatan (Largest Remainder Method)
 * Sesuai prinsip akuntansi dan regulasi Jasa Pelayanan Kesehatan.
 *
 * Menghitung:
 * 1. Poin Berbobot Absensi (Individual Points)
 * 2. Nominal Bruto Proposional
 * 3. Shadow Calculation (Tanpa Absensi) untuk dasar FPK 1% & 4% (PNS & PPPK)
 * 4. Pemotongan PPh 21 (Pajak)
 * 5. Iuran JKN FPK 1% (Potongan Karyawan) & FPK 4% (Iuran Pemda/Pemberi Kerja)
 * 6. Penyeimbangan Pembulatan (Largest Remainder Method) agar Total Netto + Pajak + FPK1 == Total Alokasi (0 selisih)
 */
export const calculateJaspel = (
  employees: Employee[],
  totalAlokasi: number
): CalculationResult => {
  if (!employees || employees.length === 0 || totalAlokasi <= 0) {
    return {
      employees: [],
      totalAlokasi,
      totalPoints: 0,
      totalBasePoints: 0,
      totalBruto: 0,
      totalTax: 0,
      totalFpk1: 0,
      totalFpk4: 0,
      totalNetto: 0,
      initialTotalDisbursed: 0,
      gap: 0,
      distributedGap: 0,
      isBalanced: true,
    };
  }

  // Total Poin Dasar (Tanpa Absensi) untuk Shadow Calculation FPK
  const totalBasePoints = employees.reduce((acc, emp) => acc + (emp.points || 0), 0);

  // 1. Hitung Total Poin Bruto (dengan absensi)
  const totalPoints = employees.reduce((acc, emp) => {
    const maxAtt = emp.maxAttendance > 0 ? emp.maxAttendance : 22;
    const attRatio = Math.min(Math.max((emp.attendance || 0) / maxAtt, 0), 1);
    return acc + ((emp.points || 0) * attRatio);
  }, 0);

  // Safety fallback jika total poin bernilai 0
  const safeTotalPoints = totalPoints > 0 ? totalPoints : 1;
  const safeTotalBasePoints = totalBasePoints > 0 ? totalBasePoints : 1;

  // 2. Hitung Nominal Bruto & Pecahan
  let intermediate = employees.map(emp => {
    const maxAtt = emp.maxAttendance > 0 ? emp.maxAttendance : 22;
    const attRatio = Math.min(Math.max((emp.attendance || 0) / maxAtt, 0), 1);
    const individualPoints = (emp.points || 0) * attRatio;
    const individualPointRatio = totalPoints > 0 ? individualPoints / safeTotalPoints : 0;

    const brutoRaw = (individualPoints / safeTotalPoints) * totalAlokasi;

    // Shadow Calculation (Tanpa Absensi) untuk dasar FPK 1% dan 4%
    const brutoShadow = ((emp.points || 0) / safeTotalBasePoints) * totalAlokasi;

    // Pajak PPh 21: dibulatkan ke bawah (floor)
    const tax = Math.floor(brutoRaw * (emp.taxRate || 0));

    // FPK 1% & FPK 4%: Hanya untuk ASN (PNS & PPPK), Honorer = 0
    const isAsn = emp.status !== 'Honorer';
    const fpk1 = isAsn ? Math.floor(brutoShadow * 0.01) : 0;
    const fpk4 = isAsn ? Math.floor(brutoShadow * 0.04) : 0;

    // Netto Awal sebelum penyeimbangan pembulatan
    const netRaw = brutoRaw - tax - fpk1;
    const nettoInitial = Math.floor(netRaw);
    const remainder = netRaw - nettoInitial;

    return {
      ...emp,
      individualPoints,
      individualPointRatio,
      brutoRaw,
      brutoShadow,
      tax,
      fpk1,
      fpk4,
      nettoInitial,
      remainder,
      gapBonus: 0,
      netto: nettoInitial,
      isBalancedBonus: false,
    };
  });

  // 3. Rounding & Balancing (Largest Remainder Method)
  // Menghitung total terdistribusi awal (Netto + Pajak + FPK1)
  const initialTotalDisbursed = intermediate.reduce(
    (acc, emp) => acc + (emp.nettoInitial + emp.tax + emp.fpk1),
    0
  );

  // Menghitung selisih pembulatan (gap pecahan Rupiah)
  const gap = Math.round(totalAlokasi - initialTotalDisbursed);

  // Distribusi selisih (gap) ke karyawan dengan remainder (sisa bagi) terbesar
  let distributedGap = 0;
  if (gap > 0) {
    const sortedByRemainder = [...intermediate].sort((a, b) => b.remainder - a.remainder);
    const bonusRecipientIds = new Set<string>();

    const safeLoopCount = Math.min(gap, sortedByRemainder.length);
    for (let i = 0; i < safeLoopCount; i++) {
      bonusRecipientIds.add(sortedByRemainder[i].id);
      distributedGap++;
    }

    intermediate = intermediate.map(res => {
      if (bonusRecipientIds.has(res.id)) {
        return {
          ...res,
          netto: res.nettoInitial + 1,
          gapBonus: 1,
          isBalancedBonus: true,
        };
      }
      return res;
    });
  }

  // Hitung total akumulasi setelah balancing
  const totalBruto = intermediate.reduce((acc, emp) => acc + emp.brutoRaw, 0);
  const totalTax = intermediate.reduce((acc, emp) => acc + emp.tax, 0);
  const totalFpk1 = intermediate.reduce((acc, emp) => acc + emp.fpk1, 0);
  const totalFpk4 = intermediate.reduce((acc, emp) => acc + emp.fpk4, 0);
  const totalNetto = intermediate.reduce((acc, emp) => acc + emp.netto, 0);

  // Final check: totalNetto + totalTax + totalFpk1 harus sama persis dengan totalAlokasi
  const finalDisbursed = totalNetto + totalTax + totalFpk1;
  const isBalanced = Math.abs(finalDisbursed - totalAlokasi) === 0;

  return {
    employees: intermediate,
    totalAlokasi,
    totalPoints,
    totalBasePoints,
    totalBruto,
    totalTax,
    totalFpk1,
    totalFpk4,
    totalNetto,
    initialTotalDisbursed,
    gap,
    distributedGap,
    isBalanced,
  };
};
