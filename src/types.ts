export interface EmployeeData {
  name: string;
  designation: string;
  department: string;
  panNumber: string;
  pranNumber: string;
  bankAccount: string;
  ifscCode: string;
  dateOfJoining: string;
  payLevel: number;
  basicPay7th: number;
  basicPay8th: number;
  daRate: number;
  hraCategory: 'X' | 'Y' | 'Z';
  medicalAllowance: number;
  transportAllowance: number;
  washingAllowance: number;
  otherAllowances: number;
  npsContribution: boolean;
  gpfContribution: boolean;
  gisContribution: number;
  professionalTax: number;
  licDeduction: number;
  societyDeduction: number;
  taxRegime: 'old' | 'new';
  applyNPS: boolean;
  applyGIS: boolean;
  applyPT: boolean;
  applyIT: boolean;
  applyLIC: boolean;
  applySociety: boolean;
}

export interface SalaryBreakdown {
  basic: number;
  da: number;
  hra: number;
  medical: number;
  transport: number;
  washing: number;
  others: number;
  gross: number;
  nps: number;
  gpf: number;
  gis: number;
  ptax: number;
  lic: number;
  society: number;
  totalDeductions: number;
  netPay: number;
}

export const HRA_RATES = {
  X: 0.27,
  Y: 0.18,
  Z: 0.09
};

export const SEVENTH_PAY_MATRIX: Record<number, number[]> = {
  1: [18000, 18500, 19100, 19700, 20300, 20900, 21500, 22100, 22800, 23500],
  2: [19900, 20500, 21100, 21700, 22400, 23100, 23800, 24500, 25200, 26000],
  3: [21700, 22400, 23100, 23800, 24500, 25200, 26000, 26800, 27600, 28400],
  4: [25500, 26300, 27100, 27900, 28700, 29600, 30500, 31400, 32300, 33300],
  5: [29200, 30100, 31000, 31900, 32900, 33900, 34900, 35900, 37000, 38100],
  6: [35400, 36500, 37600, 38700, 39900, 41100, 42300, 43600, 44900, 46200, 47600, 49000, 50500, 52000, 53600, 55200, 56900, 58600, 60400, 62200],
  7: [44900, 46200, 47600, 49000, 50500, 52000, 53600, 55200, 56900, 58600, 60400, 62200, 64100, 66000, 68000, 70000, 72100, 74300, 76500, 78800],
  8: [47600, 49000, 50500, 52000, 53600, 55200, 56900, 58600, 60400, 62200, 64100, 66000, 68000, 70000, 72100, 74300, 76500, 78800, 81200, 83600],
  9: [53100, 54700, 56300, 58000, 59700, 61500, 63300, 65200, 67200, 69200, 71300, 73400, 75600, 77900, 80200, 82600, 85100, 87700, 90300, 93000],
  10: [56100, 57800, 59500, 61300, 63100, 65000, 67000, 69000, 71100, 73200, 75400, 77700, 80000, 82400, 84900, 87400, 90000, 92700, 95500, 98400],
  11: [67700, 69700, 71800, 74000, 76200, 78500, 80900, 83300, 85800, 88400, 91100, 93800, 96600, 99500, 102500, 105600, 108800, 112100, 115500, 119000],
  12: [78800, 81200, 83600, 86100, 88700, 91400, 94100, 96900, 99800, 102800, 105900, 109100, 112400, 115800, 119300, 122900, 126600, 130400, 134300, 138300],
  13: [123100, 126800, 130600, 134500, 138500, 142700, 147000, 151400, 155900, 160600, 165400, 170400, 175500, 180800, 186200, 191800, 197600, 203500, 209600, 215900],
};

export interface ArrearMonth {
  month: string;
  oldBasic: number;
  newBasic: number;
  daRate: number;
}

export const DA_HISTORY: Record<string, number> = {
  '2016-01': 0,
  '2016-07': 2,
  '2017-01': 4,
  '2017-07': 5,
  '2018-01': 7,
  '2018-07': 9,
  '2019-01': 12,
  '2019-07': 17,
  '2020-01': 17,
  '2020-07': 17,
  '2021-01': 17,
  '2021-07': 28,
  '2022-01': 31,
  '2022-07': 38,
  '2023-01': 42,
  '2023-07': 46,
  '2024-01': 50,
  '2024-07': 53,
  '2025-01': 57,
  '2025-07': 61,
  '2026-01': 65,
};
