const INDO_MONTHS: { [key: string]: number } = {
  'januari': 0, 'februari': 1, 'maret': 2, 'april': 3, 'mei': 4, 'juni': 5,
  'juli': 6, 'agustus': 7, 'september': 8, 'oktober': 9, 'november': 10, 'desember': 11,
  'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'jun': 5, 'jul': 6, 'agu': 7, 'agt': 7, 'sep': 8, 'okt': 9, 'nov': 10, 'des': 11
};

/**
 * Parsing string tanggal Indonesia seperti "24 Juni 2026" menjadi objek Date
 */
export function parseIndoDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length < 3) return null;
  const day = parseInt(parts[0], 10);
  const monthName = parts[1].toLowerCase();
  const year = parseInt(parts[2], 10);
  const month = INDO_MONTHS[monthName];
  if (isNaN(day) || month === undefined || isNaN(year)) return null;
  return new Date(year, month, day);
}

/**
 * Menghitung tanggal jatuh tempo yang aman tanpa overflow tanggal (misal 31 Februari)
 */
export function getSafeDueDate(year: number, monthIndex: number, targetDay: number): Date {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const safeDay = Math.min(targetDay, daysInMonth);
  return new Date(year, monthIndex, safeDay);
}

/**
 * Memeriksa apakah siklus sewa yang jatuh tempo pada targetCycleStart sudah dibayar lunas.
 * 
 * Logika rentang:
 * Pembayaran "24 Sept 2026 - 24 Okt 2026" berakhir pada 24 Okt 2026 (artinya sewa habis pada 24 Okt).
 * Pembayaran ini TIDAK melunasi siklus yang jatuh tempo pada 24 Okt 2026.
 * Siklus 24 Okt 2026 hanya lunas jika ada pembayaran yang tanggal akhirnya > 24 Okt 2026 
 * (contoh: "24 Okt 2026 - 24 Nov 2026").
 */
export function isCyclePaid(
  payments: Array<{ month?: string | null; status: string }>,
  targetCycleStart: Date
): boolean {
  if (!payments || payments.length === 0) return false;

  const targetTime = new Date(
    targetCycleStart.getFullYear(),
    targetCycleStart.getMonth(),
    targetCycleStart.getDate()
  ).getTime();

  return payments.some((p) => {
    if (p.status !== 'LUNAS' || !p.month) return false;

    const raw = p.month.trim();

    // 1. Format rentang tanggal standar DIRA KOS: "24 Oktober 2026 - 24 November 2026"
    if (raw.includes(' - ')) {
      const [startStr, endStr] = raw.split(' - ');
      const startD = parseIndoDate(startStr);
      const endD = parseIndoDate(endStr);

      if (endD) {
        const endTime = new Date(endD.getFullYear(), endD.getMonth(), endD.getDate()).getTime();
        // LUNAS jika periode akhir sewa melewati (lebih besar dari) tanggal awal siklus target
        return endTime > targetTime;
      }

      if (startD) {
        const startTime = new Date(startD.getFullYear(), startD.getMonth(), startD.getDate()).getTime();
        return startTime >= targetTime;
      }
    }

    // 2. Fallback untuk format teks sederhana (misal: "Oktober 2026" atau "10/2026")
    const targetMonthName = targetCycleStart.toLocaleDateString('id-ID', { month: 'long' }).toLowerCase();
    const targetMonthShort = targetCycleStart.toLocaleDateString('id-ID', { month: 'short' }).toLowerCase();
    const targetYear = targetCycleStart.getFullYear().toString();
    const targetMonthNum = (targetCycleStart.getMonth() + 1).toString();
    const targetMonthNumZero = targetMonthNum.padStart(2, '0');

    const rawLower = raw.toLowerCase();
    const hasMonth = rawLower.includes(targetMonthName) || rawLower.includes(targetMonthShort);
    const hasYear = rawLower.includes(targetYear);
    if (hasMonth && hasYear) {
      return true;
    }

    const numericPattern1 = `/${targetMonthNum}/${targetYear}`;
    const numericPattern2 = `/${targetMonthNumZero}/${targetYear}`;
    if (rawLower.includes(numericPattern1) || rawLower.includes(numericPattern2)) {
      return true;
    }

    return false;
  });
}
