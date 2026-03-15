/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  JHARKHAND PAY MASTER PRO — ULTRA PREMIUM EDITION v8.0                  ║
 * ║  Multi-Profile System · University & College Staff Calculator           ║
 * ║  7th/8th Pay · Fixation · MACP · Arrears · Tax · Salary Bill · Retire  ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Calculator, User, FileText, TrendingUp, History, Printer, Download,
  Plus, Trash2, ChevronRight, ChevronLeft, IndianRupee, BarChart3,
  Receipt, ClipboardList, FileSpreadsheet, Zap, CheckCircle2,
  Info, TrendingDown, RefreshCw, UserPlus, RotateCcw, TableProperties,
  X, Upload, Settings, Building2, Award, Milestone, Home, Users,
  Search, Copy, Edit3, Star, StarOff, Grid, List, LayoutDashboard,
  Percent, ShieldCheck, Shield, BookOpen, PieChart as PieIcon, Filter,
  ChevronDown, ChevronUp, Eye, Save, AlertCircle, Bell, Check,
  ArrowUpRight, ArrowDownRight, Minus, Layers, SortAsc
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// ══════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════
export interface EmployeeData {
  id: string;
  name: string; salutation: string; designation: string; department: string; college: string;
  panNumber: string; pranNumber: string; bankAccount: string; ifscCode: string;
  dateOfJoining: string; dateOfBirth: string;
  payLevel: number; basicPay7th: number;
  daRate: number; hraCategory: 'X'|'Y'|'Z';
  medicalAllowance: number; transportAllowance: number; washingAllowance: number;
  otherAllowances: number; ceaChildren: number; hostelChildren: number;
  applyNPS: boolean; npsEmployee: number; npsEmployer: number;
  applyGSLI: boolean; gsliContribution: number;
  applyPT: boolean; professionalTax: number;
  applyLIC: boolean; licDeduction: number;
  applySociety: boolean; societyDeduction: number;
  applyIT: boolean; taxRegime: 'old'|'new';
  annualPPF: number; annualLIC: number; annualTuitionFee: number;
  homeLoanPrincipal: number; homeLoanInterest: number;
  mediclaim: number; npsVoluntary: number;
  bandPayOld: number; gradePayOld: number;
  incrementMonth: '01'|'07'; financialYear: string; fitmentFactor8th: number;
  salaryMonth: string; salaryYear: string;
  serviceYears: number; earnedLeaves: number;
  category: 'teaching'|'non-teaching'|'class-iv'|'technical'|'admin';
  isStarred: boolean; color: string;
  additionalIncome1Label: string; additionalIncome1: number;
  additionalIncome2Label: string; additionalIncome2: number;
  notes: string;
}

interface SBEmployee {
  id: number; name: string; designation: string; doj: string;
  level: string; basicOn2016: number; basicOn2024: number; incrementDate: string;
  employeeType: 'old'|'new';
}

// ══════════════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════════════
const DESIG_CONFIG: Record<string,{level:number;ta:number;ma:number;washing:number;gp6:number;bp6:number;cat:EmployeeData['category']}> = {
  'Principal':             {level:14,ta:3600,ma:1000,washing:0,gp6:10000,bp6:37400,cat:'teaching'},
  'Associate Professor':   {level:13,ta:3600,ma:1000,washing:0,gp6:8000, bp6:37400,cat:'teaching'},
  'Assistant Professor':   {level:10,ta:3600,ma:1000,washing:0,gp6:6000, bp6:15600,cat:'teaching'},
  'Librarian':             {level:10,ta:3600,ma:1000,washing:0,gp6:6000, bp6:15600,cat:'teaching'},
  'Assistant Librarian':   {level:7, ta:1800,ma:1000,washing:0,gp6:4600, bp6:9300, cat:'non-teaching'},
  'Library Assistant':     {level:6, ta:1800,ma:1000,washing:0,gp6:4200, bp6:9300, cat:'non-teaching'},
  'Assistant (UDC)':       {level:6, ta:1800,ma:1000,washing:0,gp6:4200, bp6:9300, cat:'non-teaching'},
  'Upper Division Clerk':  {level:6, ta:1800,ma:1000,washing:0,gp6:4200, bp6:9300, cat:'non-teaching'},
  'Assistant (LDC)':       {level:4, ta:1800,ma:1000,washing:0,gp6:2400, bp6:5200, cat:'non-teaching'},
  'Lower Division Clerk':  {level:4, ta:1800,ma:1000,washing:0,gp6:2400, bp6:5200, cat:'non-teaching'},
  'Junior Assistant':      {level:3, ta:1800,ma:1000,washing:0,gp6:2000, bp6:5200, cat:'non-teaching'},
  'Accountant':            {level:6, ta:1800,ma:1000,washing:0,gp6:4200, bp6:9300, cat:'admin'},
  'Jr. Accountant':        {level:4, ta:1800,ma:1000,washing:0,gp6:2400, bp6:5200, cat:'admin'},
  'Computer Operator':     {level:5, ta:1800,ma:1000,washing:0,gp6:2800, bp6:5200, cat:'technical'},
  'Store Keeper':          {level:4, ta:1800,ma:1000,washing:0,gp6:2400, bp6:5200, cat:'admin'},
  'Lab Assistant':         {level:5, ta:1800,ma:1000,washing:0,gp6:2800, bp6:5200, cat:'technical'},
  'Lab Technician':        {level:5, ta:1800,ma:1000,washing:0,gp6:2800, bp6:5200, cat:'technical'},
  'Driver':                {level:4, ta:1800,ma:1000,washing:0,gp6:2400, bp6:5200, cat:'technical'},
  'Peon (Class IV)':       {level:1, ta:1800,ma:1000,washing:150,gp6:1800,bp6:5200,cat:'class-iv'},
  'Chowkidar (Class IV)':  {level:1, ta:1800,ma:1000,washing:150,gp6:1800,bp6:5200,cat:'class-iv'},
  'Sweeper (Class IV)':    {level:1, ta:1800,ma:1000,washing:150,gp6:1800,bp6:5200,cat:'class-iv'},
  'Mali (Class IV)':       {level:1, ta:1800,ma:1000,washing:150,gp6:1800,bp6:5200,cat:'class-iv'},
  'Dafadar':               {level:2, ta:1800,ma:1000,washing:0,gp6:1900, bp6:5200, cat:'class-iv'},
  'Registrar':             {level:12,ta:3600,ma:1000,washing:0,gp6:7600, bp6:15600,cat:'admin'},
  'Deputy Registrar':      {level:10,ta:3600,ma:1000,washing:0,gp6:6600, bp6:15600,cat:'admin'},
  'Assistant Registrar':   {level:8, ta:3600,ma:1000,washing:0,gp6:4800, bp6:9300, cat:'admin'},
  'Finance Officer':       {level:12,ta:3600,ma:1000,washing:0,gp6:7600, bp6:15600,cat:'admin'},
  'Section Officer':       {level:7, ta:1800,ma:1000,washing:0,gp6:4600, bp6:9300, cat:'admin'},
  'PA to Principal':       {level:7, ta:1800,ma:1000,washing:0,gp6:4600, bp6:9300, cat:'admin'},
  'Office Superintendent': {level:7, ta:1800,ma:1000,washing:0,gp6:4600, bp6:9300, cat:'admin'},
  'Physical Instructor':   {level:6, ta:1800,ma:1000,washing:0,gp6:4200, bp6:9300, cat:'non-teaching'},
  'Nurse':                 {level:7, ta:1800,ma:1000,washing:150,gp6:4600,bp6:9300, cat:'technical'},
  'Pharmacist':            {level:5, ta:1800,ma:1000,washing:0,gp6:2800, bp6:5200, cat:'technical'},
};

const DESIG_GROUPS = [
  {group:'Teaching Staff',          items:['Principal','Associate Professor','Assistant Professor']},
  {group:'Library',                 items:['Librarian','Assistant Librarian','Library Assistant']},
  {group:'Administrative',          items:['Registrar','Deputy Registrar','Assistant Registrar','Finance Officer','Section Officer','Office Superintendent','PA to Principal']},
  {group:'Accounts',                items:['Accountant','Jr. Accountant']},
  {group:'Clerical (Non-Teaching)', items:['Assistant (UDC)','Upper Division Clerk','Assistant (LDC)','Lower Division Clerk','Junior Assistant','Store Keeper']},
  {group:'Technical Staff',         items:['Computer Operator','Lab Assistant','Lab Technician','Physical Instructor','Pharmacist','Nurse','Driver']},
  {group:'Class IV Staff',          items:['Peon (Class IV)','Chowkidar (Class IV)','Sweeper (Class IV)','Mali (Class IV)','Dafadar']},
];

const SALUTATIONS = ['Sri.','Smt.','Km.','Dr.','Prof.','Shri','Mr.','Mrs.','Ms.'];
const DEPARTMENTS  = ['Office','Library','Science Dept.','Arts Dept.','Commerce Dept.','Lab','Sports','Accounts','Administration','Examination','Store','NSS/NCC'];
const MONTHS_FULL  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const YEARS        = Array.from({length:61},(_,i)=>String(2000+i));  // 2000-2060
const FY_YEARS     = Array.from({length:61},(_,i)=>`${2000+i}-${String(2001+i).slice(2)}`);  // 2000-01 to 2060-61
const HRA_RATES    = {X:0.27, Y:0.18, Z:0.09};
const CATEGORY_COLORS: Record<string,string> = { 'teaching':'#7c3aed','non-teaching':'#2563eb','admin':'#0891b2','technical':'#d97706','class-iv':'#16a34a' };
const CATEGORY_BG: Record<string,string> = { 'teaching':'#f5f3ff','non-teaching':'#eff6ff','admin':'#ecfeff','technical':'#fffbeb','class-iv':'#f0fdf4' };
const PROFILE_COLORS = ['#2563eb','#16a34a','#dc2626','#d97706','#7c3aed','#0891b2','#db2777','#9333ea','#ea580c','#65a30d'];

const PAY_MATRIX: Record<number,number[]> = {
  1: [18000,18500,19100,19700,20300,20900,21500,22100,22800,23500,24200,24900,25600,26400,27200,28000,28800,29700,30600,31500,32400,33400,34400,35400,36500,37600,38700,39900,41100,42300,43600,44900,46200,47600,49000,50500,52000,53600,55200,56900],
  2: [19900,20500,21100,21700,22400,23100,23800,24500,25200,26000,26800,27600,28400,29300,30200,31100,32000,33000,34000,35000,36100,37200,38300,39500,40700,41900,43200,44500,45800,47200,48600,50100,51600,53100,54700,56300,58000,59700,61500,63300],
  3: [21700,22400,23100,23800,24500,25200,26000,26800,27600,28400,29300,30200,31100,32000,33000,34000,35000,36100,37200,38300,39500,40700,41900,43200,44500,45800,47200,48600,50100,51600,53100,54700,56300,58000,59700,61500,63300,65200,67200,69200],
  4: [25500,26300,27100,27900,28700,29600,30500,31400,32300,33300,34300,35300,36400,37500,38600,39800,41000,42200,43500,44800,46200,47600,49000,50500,52000,53600,55200,56900,58600,60400,62200,64100,66000,68000,70000,72100,74300,76500,78800,81100],
  5: [29200,30100,31000,31900,32900,33900,34900,35900,37000,38100,39300,40500,41700,43000,44300,45600,47000,48400,49900,51400,52900,54500,56100,57800,59500,61300,63100,65000,67000,69000,71100,73200,75400,77700,80000,82400,84900,87400,90000,92700],
  6: [35400,36500,37600,38700,39900,41100,42300,43600,44900,46200,47600,49000,50500,52000,53600,55200,56900,58600,60400,62200,64100,66000,68000,70000,72100,74300,76500,78800,81100,83500,86000,88600,91300,94000,96800,99700,102700,105800,109000,112400],
  7: [44900,46200,47600,49000,50500,52000,53600,55200,56900,58600,60400,62200,64100,66000,68000,70000,72100,74300,76500,78800,81100,83500,86000,88600,91300,94000,96800,99700,102700,105800,109000,112300,115700,119200,122800,126500,130300,134200,138200,142400],
  8: [47600,49000,50500,52000,53600,55200,56900,58600,60400,62200,64100,66000,68000,70000,72100,74300,76500,78800,81100,83500,86000,88600,91300,94000,96800,99700,102700,105800,109000,112300,115700,119200,122800,126500,130300,134200,138200,142400,146700,151100],
  9: [53100,54700,56300,58000,59700,61500,63300,65200,67200,69200,71300,73400,75600,77900,80200,82600,85100,87700,90300,93000,95800,98700,101700,104800,108000,111200,114500,117900,121400,125000,128800,132700,136700,140800,145000,149400,153900,158500,163300,168200],
  10:[56100,57800,59500,61300,63100,65000,67000,69000,71100,73200,75400,77700,80000,82400,84900,87400,90000,92700,95500,98400,101400,104400,107500,110700,114000,117400,120900,124500,128200,132000,135900,139900,144100,148400,152900,157500,162200,167100,172100,177200],
  11:[67700,69700,71800,74000,76200,78500,80900,83300,85800,88400,91100,93800,96600,99500,102500,105600,108800,112100,115500,119000,122600,126300,130100,134000,138000,142100,146400,150800,155300,160000,164800,169700,174800,180100,185500,191100,196800,202700,208800,215100],
  12:[78800,81200,83600,86100,88700,91400,94100,96900,99800,102800,105900,109100,112400,115800,119300,122900,126600,130400,134300,138300,142400,146700,151100,155600,160300,165100,170100,175200,180500,186000,191600,197300,203200,209300,215600,222100,228800,235700,242800,250200],
  13:[123100,126800,130600,134500,138500,142700,147000,151400,155900,160600,165400,170400,175500,180800,186200,191800,197600,203500,209600,215900,222400,229100,236000,243100,250400,257900,265600,273600,281800,290300],
  14:[144200,148500,153000,157600,162300,167200,172200,177400,182700,188200,193800,199600,205600,211800,218200,224700,231500,238500,245700,253100],
};

// ── DA HISTORY (7th CPC) ─────────────────────────────────────────
// Source: MoF Orders + Jharkhand Gazette Notifications
// ⚠ Jul-2025 onward: Official Jharkhand order awaited — marked as PROJECTED
const DA_HISTORY: Record<string,number> = {
  '2016-01': 0,   // Base (7th CPC effective)
  '2016-07': 2,   // MoF O.M. 1/1/2016-E.II(B) dt. 07.09.2016
  '2017-01': 4,   // MoF O.M. dt. 30.06.2017
  '2017-07': 5,   // MoF O.M. dt. 20.09.2017
  '2018-01': 7,   // MoF O.M. dt. 28.03.2018
  '2018-07': 9,   // MoF O.M. dt. 18.07.2018
  '2019-01': 12,  // MoF O.M. dt. 25.01.2019
  '2019-07': 17,  // MoF O.M. dt. 14.06.2019
  '2020-01': 17,  // COVID freeze: DA frozen at 17% (Cabinet decision)
  '2020-07': 17,  // COVID freeze: No revision
  '2021-01': 17,  // COVID freeze: No revision
  '2021-07': 28,  // DA restored + enhanced: 17% + 3 instalments = 28%
  '2022-01': 34,  // MoF O.M. dt. 26.01.2022 (31% → 34% corrected)
  '2022-07': 38,  // MoF O.M. dt. 13.07.2022
  '2023-01': 42,  // MoF O.M. dt. 24.01.2023
  '2023-07': 46,  // MoF O.M. dt. 14.07.2023
  '2024-01': 50,  // MoF O.M. dt. 09.01.2024
  '2024-07': 53,  // MoF O.M. dt. 12.07.2024
  '2025-01': 55,  // MoF O.M. dt. 28.03.2025 (confirmed)
  '2025-07': 58,  // ⚠ PROJECTED — Official Jharkhand order awaited
  '2026-01': 61,  // ⚠ PROJECTED — Official order awaited
};

const BLANK_PROFILE = (id: string, overrides: Partial<EmployeeData> = {}): EmployeeData => ({
  id, name:'', salutation:'Sri.', designation:'Assistant (UDC)', department:'Office',
  college:'Guru Nanak College', panNumber:'', pranNumber:'', bankAccount:'', ifscCode:'',
  dateOfJoining:'', dateOfBirth:'', payLevel:6, basicPay7th:35400,
  daRate:53, hraCategory:'Y', medicalAllowance:1000, transportAllowance:1800,
  washingAllowance:0, otherAllowances:0, ceaChildren:0, hostelChildren:0,
  applyNPS:true, npsEmployee:10, npsEmployer:14,
  applyGSLI:true, gsliContribution:60,
  applyPT:false, professionalTax:208,
  applyLIC:false, licDeduction:0,
  applySociety:false, societyDeduction:0,
  applyIT:false, taxRegime:'new',
  annualPPF:0, annualLIC:0, annualTuitionFee:0,
  homeLoanPrincipal:0, homeLoanInterest:0, mediclaim:0, npsVoluntary:0,
  bandPayOld:9300, gradePayOld:4200,
  incrementMonth:'07', financialYear:'2024-25', fitmentFactor8th:1.92,
  salaryMonth:'March', salaryYear:'2026',
  serviceYears:33, earnedLeaves:200,
  category:'non-teaching', isStarred:false, color:PROFILE_COLORS[0],
  additionalIncome1Label:'Other Income', additionalIncome1:0,
  additionalIncome2Label:'Arrear Income', additionalIncome2:0,
  notes:'', ...overrides,
});

// ══════════════════════════════════════════════════════════════════
// UTILITIES
// ══════════════════════════════════════════════════════════════════
const uid = () => Math.random().toString(36).slice(2,10);
const rnd = (n:number) => Math.round(n);
const fmt = (n:number) => Math.round(n).toLocaleString('en-IN');
const rs  = (n:number) => `₹${fmt(n)}`;
const pct = (base:number, p:number) => rnd(base*p/100);

const getGSLI = (level:number) => level>=10?120:level>=5?60:30;

function getDA(m:string):number {
  for(const k of Object.keys(DA_HISTORY).sort().reverse()) if(m>=k) return DA_HISTORY[k];
  return 0;
}

function nextStep(b:number, lv:number):number {
  const m=PAY_MATRIX[lv]; if(!m) return b;
  const i=m.indexOf(b); if(i!==-1&&i<m.length-1) return m[i+1];
  const j=m.findIndex(v=>v>b); return j!==-1?m[j]:b;
}

function toWords(n:number):string {
  if(!n||n<=0) return 'Zero Only';
  const ones=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  const two=(x:number):string=>x<20?ones[x]:tens[~~(x/10)]+(x%10?' '+ones[x%10]:'');
  const three=(x:number):string=>x>=100?ones[~~(x/100)]+' Hundred'+(x%100?' '+two(x%100):''):two(x);
  let s=''; let nn=n;
  if(nn>=10000000){s+=three(~~(nn/10000000))+' Crore ';nn%=10000000;}
  if(nn>=100000){s+=three(~~(nn/100000))+' Lakh ';nn%=100000;}
  if(nn>=1000){s+=three(~~(nn/1000))+' Thousand ';nn%=1000;}
  if(nn>0) s+=three(nn);
  return s.trim()+' Only';
}

function calcTax(inc:number, regime:'old'|'new'):number {
  let t=0;
  if(regime==='new'){
    if(inc<=300000) t=0;
    else if(inc<=700000) t=(inc-300000)*.05;
    else if(inc<=1000000) t=20000+(inc-700000)*.10;
    else if(inc<=1200000) t=50000+(inc-1000000)*.15;
    else if(inc<=1500000) t=80000+(inc-1200000)*.20;
    else t=140000+(inc-1500000)*.30;
    if(inc<=700000) return 0;
  } else {
    if(inc<=250000) t=0;
    else if(inc<=500000) t=(inc-250000)*.05;
    else if(inc<=1000000) t=12500+(inc-500000)*.20;
    else t=112500+(inc-1000000)*.30;
    if(inc<=500000) return 0;
  }
  return rnd(t*1.04);
}

function getFYMonths(fy:string) {
  const [sy]=fy.split('-').map(Number);
  return Array.from({length:12},(_,i)=>{
    const mo=(i+3)%12; const yr=i<9?sy:sy+1;
    return {key:`${yr}-${String(mo+1).padStart(2,'0')}`,label:MONTHS_SHORT[mo]+'-'+String(yr).slice(2),mo:mo+1};
  });
}

// ── PDF EXPORT — High Quality with print-optimized rendering ────
// Note: @react-pdf/renderer would give vector-quality PDF.
// This implementation uses maximum html2canvas quality settings.
const downloadPDF = async (
  ref: React.RefObject<HTMLDivElement|null>,
  filename: string,
  orient: 'p'|'l' = 'p'
) => {
  if(!ref.current) return;
  const el = ref.current;
  const origStyle = el.getAttribute('style') || '';

  // ── Pre-render: force crisp layout ──────────────────────────────
  el.style.cssText = `
    background:#fff !important;
    color:#000 !important;
    font-family: Arial, 'Helvetica Neue', sans-serif !important;
    width:${orient==='p'?'210mm':'297mm'} !important;
    padding: 8mm !important;
    box-sizing: border-box !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  `;

  try {
    // Scale 4 = very sharp; imageTimeout 0 = no timeout for images
    const canvas = await html2canvas(el, {
      scale: 4,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 0,
      removeContainer: true,
      // Fixes blurry text
      windowWidth: orient==='p' ? 794 : 1123,
      windowHeight: 1123,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({ orientation: orient, unit: 'mm', format: 'a4' });
    const margin = 8;
    const pdfW = pdf.internal.pageSize.getWidth()  - margin * 2;
    const pdfH = pdf.internal.pageSize.getHeight() - margin * 2;
    const ratio = canvas.height / canvas.width;
    const contentH = pdfW * ratio;

    if (contentH <= pdfH) {
      // Single page
      pdf.addImage(imgData, 'JPEG', margin, margin, pdfW, contentH);
    } else {
      // Multi-page: slice canvas into page-height chunks
      const pages = Math.ceil(contentH / pdfH);
      for (let page = 0; page < pages; page++) {
        if (page > 0) pdf.addPage();
        // Clip the canvas section for this page
        const sliceCanvas = document.createElement('canvas');
        const sliceH = Math.ceil((pdfH / contentH) * canvas.height);
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.min(sliceH, canvas.height - page * sliceH);
        const ctx = sliceCanvas.getContext('2d')!;
        ctx.drawImage(canvas, 0, -page * sliceH);
        const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.98);
        const sliceContentH = (sliceCanvas.height / canvas.width) * pdfW;
        pdf.addImage(sliceData, 'JPEG', margin, margin, pdfW, sliceContentH);
      }
    }

    // Metadata
    pdf.setProperties({
      title: filename,
      subject: 'Jharkhand Government Employee Salary Document',
      creator: 'Pay Master Pro v8.0',
      keywords: 'salary, 7th pay, jharkhand',
    });

    pdf.save(`${filename}.pdf`);
  } catch (err) {
    console.error('PDF Error:', err);
    alert('PDF generation failed. Please try again or use browser Print (Ctrl+P → Save as PDF).');
  } finally {
    el.setAttribute('style', origStyle);
  }
};

// ══════════════════════════════════════════════════════════════════
// MINI SVG CHART COMPONENTS (No recharts dependency)
// ══════════════════════════════════════════════════════════════════
function MiniBar({data,colors}:{data:{label:string,value:number}[],colors:string[]}) {
  const max=Math.max(...data.map(d=>d.value),1);
  return (
    <div className="flex items-end gap-1.5 h-20">
      {data.map((d,i)=>(
        <div key={d.label} className="flex flex-col items-center gap-1 flex-1">
          <div className="w-full rounded-t transition-all" style={{height:`${(d.value/max)*64}px`,background:colors[i%colors.length],minHeight:'2px'}}/>
          <span className="text-[9px] text-gray-500 leading-tight text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({slices}:{slices:{value:number,color:string,label:string}[]}) {
  const total=slices.reduce((s,x)=>s+x.value,0)||1;
  let cum=0;
  const cx=60,cy=60,r=45,ri=28;
  const arcs=slices.map(s=>{
    const start=cum, end=cum+(s.value/total)*360;
    cum=end;
    const a1=(start-90)*Math.PI/180, a2=(end-90)*Math.PI/180;
    const x1=cx+r*Math.cos(a1),y1=cy+r*Math.sin(a1);
    const x2=cx+r*Math.cos(a2),y2=cy+r*Math.sin(a2);
    const xi1=cx+ri*Math.cos(a1),yi1=cy+ri*Math.sin(a1);
    const xi2=cx+ri*Math.cos(a2),yi2=cy+ri*Math.sin(a2);
    const lg=(end-start)>180?1:0;
    return {path:`M${x1},${y1} A${r},${r} 0 ${lg} 1 ${x2},${y2} L${xi2},${yi2} A${ri},${ri} 0 ${lg} 0 ${xi1},${yi1} Z`,color:s.color,label:s.label,value:s.value};
  });
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      {arcs.map((a,i)=><path key={i} d={a.path} fill={a.color} opacity={0.9}/>)}
      <text x={cx} y={cy+4} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#374151">{fmt(total)}</text>
    </svg>
  );
}

function SparkLine({values,color}:{values:number[],color:string}) {
  if(values.length<2) return null;
  const max=Math.max(...values,1),min=Math.min(...values,0);
  const range=max-min||1;
  const w=120,h=40,pad=4;
  const pts=values.map((v,i)=>`${pad+(i/(values.length-1))*(w-pad*2)},${h-pad-((v-min)/range)*(h-pad*2)}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════
// UI COMPONENTS
// ══════════════════════════════════════════════════════════════════
const Lbl = ({c}:{c:string}) => <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{c}</label>;

const TIn = ({value,onChange,type='text',placeholder='',disabled=false,className=''}:any) => (
  <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
    className={`w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all disabled:bg-gray-50 disabled:text-gray-400 ${className}`}/>
);

const TSel = ({value,onChange,options,grouped}:any) => (
  <select value={value} onChange={e=>onChange(e.target.value)}
    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all">
    {grouped ? grouped.map((g:any)=>(<optgroup key={g.group} label={g.group}>{g.items.map((it:any)=><option key={it} value={it}>{it}</option>)}</optgroup>))
             : options?.map((o:any)=><option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}
  </select>
);

const TToggle = ({checked,onChange,label,size='md'}:any) => (
  <label className="flex items-center gap-2.5 cursor-pointer">
    <div onClick={()=>onChange(!checked)} className={`rounded-full transition-all relative shrink-0 ${size==='sm'?'w-7 h-4':'w-9 h-5'} ${checked?'bg-green-500':'bg-gray-300'}`}>
      <div className={`absolute top-0.5 rounded-full bg-white shadow transition-all ${size==='sm'?'w-3 h-3':'w-4 h-4'} ${checked?(size==='sm'?'left-3.5':'left-4'):'left-0.5'}`}/>
    </div>
    <span className={`text-gray-700 font-medium ${size==='sm'?'text-xs':'text-sm'}`}>{label}</span>
  </label>
);

const Card = ({children,className='',accent}:{children:React.ReactNode,className?:string,accent?:string}) => (
  <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden ${className}`} style={accent?{borderLeft:`3px solid ${accent}`}:{}}>
    {children}
  </div>
);

const StatCard = ({label,value,icon:Icon,color,sub,trend}:{label:string,value:string|number,icon?:any,color:string,sub?:string,trend?:number}) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-xl font-black text-gray-900">{typeof value==='number'?rs(value):value}</p>
        {sub&&<p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <div className="flex flex-col items-end gap-1">
        {Icon&&<div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:color+'18'}}><Icon size={16} style={{color}}/></div>}
        {trend!==undefined&&(
          <div className={`flex items-center gap-1 text-[10px] font-bold ${trend>=0?'text-green-600':'text-red-500'}`}>
            {trend>=0?<ArrowUpRight size={10}/>:<ArrowDownRight size={10}/>}{Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  </div>
);

const SectionHead = ({title,subtitle,icon:Icon,accent}:{title:string,subtitle?:string,icon:any,accent:string}) => (
  <div className="flex items-start gap-4 mb-6 pb-5 border-b border-gray-100">
    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{background:accent+'18',border:`1.5px solid ${accent}44`}}><Icon size={20} style={{color:accent}}/></div>
    <div className="flex-1"><h2 className="text-xl font-black text-gray-900">{title}</h2>{subtitle&&<p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}</div>
  </div>
);

const NavRow = ({onPrev,onNext,showNext=true,extras}:{onPrev?:()=>void,onNext?:()=>void,showNext?:boolean,extras?:React.ReactNode}) => (
  <div className="flex items-center justify-between pt-6 mt-8 border-t border-gray-100">
    <button onClick={onPrev} className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all"><ChevronLeft size={15}/> Previous</button>
    <div className="flex items-center gap-3">{extras}{showNext&&<button onClick={onNext} className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-md">Next <ChevronRight size={15}/></button>}</div>
  </div>
);

const Badge = ({text,color}:{text:string,color:string}) => (
  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{background:color+'18',color}}>{text}</span>
);

const Toast = ({msg,type,onClose}:{msg:string,type:'success'|'error'|'info',onClose:()=>void}) => (
  <motion.div initial={{opacity:0,y:-20,x:'-50%'}} animate={{opacity:1,y:0,x:'-50%'}} exit={{opacity:0,y:-20,x:'-50%'}}
    className="fixed top-4 left-1/2 z-[999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl border"
    style={{background:type==='success'?'#f0fdf4':type==='error'?'#fef2f2':'#eff6ff',borderColor:type==='success'?'#86efac':type==='error'?'#fca5a5':'#93c5fd'}}>
    {type==='success'?<CheckCircle2 size={16} className="text-green-600"/>:type==='error'?<AlertCircle size={16} className="text-red-500"/>:<Info size={16} className="text-blue-500"/>}
    <span className="text-sm font-bold text-gray-800">{msg}</span>
    <button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-700"><X size={14}/></button>
  </motion.div>
);

// ══════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════
const TABS = ['dashboard','profiles','profile','fixation','macp','salary','yearlysummary','arrears','salarybill','annualstatement','taxdetail','retirement','compare','settings'] as const;
type TabType = typeof TABS[number];

const NAV_ITEMS = [
  {id:'dashboard',       label:'Dashboard',          icon:LayoutDashboard, color:'#16a34a', group:'main'},
  {id:'profiles',        label:'All Profiles',        icon:Users,           color:'#2563eb', group:'main'},
  {id:'profile',         label:'Edit Profile',        icon:User,            color:'#7c3aed', group:'employee'},
  {id:'fixation',        label:'7th Pay Fixation',    icon:FileText,        color:'#0891b2', group:'employee'},
  {id:'macp',            label:'MACP Calculator',     icon:Milestone,       color:'#8b5cf6', group:'employee'},
  {id:'salary',          label:'Monthly Salary',      icon:IndianRupee,     color:'#059669', group:'employee'},
  {id:'yearlysummary',   label:'Yearly Summary',      icon:BarChart3,       color:'#d97706', group:'reports'},
  {id:'arrears',         label:'Arrear Calculator',   icon:History,         color:'#dc2626', group:'reports'},
  {id:'salarybill',      label:'Salary Bill',         icon:ClipboardList,   color:'#4f46e5', group:'reports'},
  {id:'annualstatement', label:'Annual Statement',    icon:FileSpreadsheet, color:'#0d9488', group:'reports'},
  {id:'taxdetail',       label:'Tax Comparison',      icon:Receipt,         color:'#ea580c', group:'reports'},
  {id:'retirement',      label:'Retirement/Gratuity', icon:Award,           color:'#eab308', group:'reports'},
  {id:'compare',         label:'Financial Planner',    icon:TrendingUp,      color:'#6366f1', group:'tools'},
  {id:'settings',        label:'Admin Settings',      icon:Settings,        color:'#475569', group:'tools'},
];

export default function App() {
  // ── STATE ────────────────────────────────────────────────────────
  const [tab, setTab] = useState<TabType>('dashboard');
  const [toast, setToast] = useState<{msg:string,type:'success'|'error'|'info'}|null>(null);
  
  const showToast = useCallback((msg:string,type:'success'|'error'|'info'='success') => {
    setToast({msg,type});
    setTimeout(()=>setToast(null),3000);
  },[]);

  const [sysConfig, setSysConfig] = useState(()=>{
    try{ return JSON.parse(localStorage.getItem('gnc_sys_v8')||'null')||{collegeName:'GURU NANAK COLLEGE',address:'Bhuda, Dhanbad, Jharkhand - 826001',affiliatedTo:'Binod Bihari Mahto Koylanchal University',logoBase64:''}; }
    catch(e){ return {collegeName:'GURU NANAK COLLEGE',address:'Bhuda, Dhanbad, Jharkhand - 826001',affiliatedTo:'',logoBase64:''}; }
  });
  useEffect(()=>{ localStorage.setItem('gnc_sys_v8',JSON.stringify(sysConfig)); },[sysConfig]);

  // Multi-profile state
  const [profiles, setProfiles] = useState<EmployeeData[]>(()=>{
    try{ const s=localStorage.getItem('gnc_profiles_v8'); if(s) return JSON.parse(s); } catch(e){}
    return [BLANK_PROFILE(uid(),{
      name:'Demo Employee',
      salutation:'Sri.',
      designation:'Lower Division Clerk',
      department:'Office',
      college:'Your College Name',
      panNumber:'',
      pranNumber:'',
      bankAccount:'',
      ifscCode:'',
      dateOfJoining:'',
      dateOfBirth:'',
      payLevel:2,
      basicPay7th:19900,
      daRate:55,
      hraCategory:'Y',
      medicalAllowance:1000,
      transportAllowance:1800,
      washingAllowance:0,
      ceaChildren:0,
      hostelChildren:0,
      bandPayOld:5200,
      gradePayOld:1900,
      applyNPS:true,
      npsEmployee:10,
      npsEmployer:14,
      applyGSLI:true,
      gsliContribution:60,
      applyPT:false,
      professionalTax:0,
      applyLIC:false,
      licDeduction:0,
      annualLIC:0,
      annualPPF:0,
      homeLoanPrincipal:0,
      homeLoanInterest:0,
      mediclaim:0,
      npsVoluntary:0,
      applyIT:false,
      taxRegime:'new',
      applySociety:false,
      societyDeduction:0,
      additionalIncome1Label:'Other Income',
      additionalIncome1:0,
      additionalIncome2Label:'Arrear Income',
      additionalIncome2:0,
      incrementMonth:'07',
      financialYear:'2024-25',
      fitmentFactor8th:1.92,
      salaryMonth:'March',
      salaryYear:'2026',
      serviceYears:33,
      earnedLeaves:0,
      category:'non-teaching',
      isStarred:false,
      color:'#2563eb',
      notes:'Demo profile — Fill in actual employee details from Edit Profile tab.',
    })];
  });
  useEffect(()=>{ localStorage.setItem('gnc_profiles_v8',JSON.stringify(profiles)); },[profiles]);

  // ── Auto-backup reminder: warn if no backup in 7 days ──────────
  const [showBackupBanner, setShowBackupBanner] = useState(false);
  const [lastBackup, setLastBackup] = useState<number>(()=>{
    try{ return parseInt(localStorage.getItem('gnc_last_backup')||'0'); }catch(e){return 0;}
  });
  useEffect(()=>{
    const daysSince = (Date.now()-lastBackup)/(1000*60*60*24);
    // Show banner if: more than 7 days since backup AND at least 1 profile exists
    setShowBackupBanner(daysSince > 7 && profiles.length > 0 && profiles[0].name !== '');
  },[lastBackup, profiles]);

  const markBackupDone = () => {
    const now = Date.now();
    localStorage.setItem('gnc_last_backup', String(now));
    setLastBackup(now);
    setShowBackupBanner(false);
    exportAllProfiles();
    showToast('Backup exported & saved! ✅','success');
  };

  const [activeId, setActiveId] = useState<string>(profiles[0]?.id||'');
  const emp = useMemo(()=>profiles.find(p=>p.id===activeId)||profiles[0]||BLANK_PROFILE('temp'),[profiles,activeId]);
  const setEmp = useCallback((updater: EmployeeData | ((prev: EmployeeData)=>EmployeeData)) => {
    setProfiles(ps=>ps.map(p=>p.id===activeId?(typeof updater==='function'?updater(p):updater):p));
  },[activeId]);
  const setE = (field:keyof EmployeeData) => (v:any) => setEmp((p:EmployeeData)=>({...p,[field]:typeof p[field]==='number'?(Number(v)||0):v}));

  const [profileSearch, setProfileSearch] = useState('');
  const [profileFilter, setProfileFilter] = useState<string>('all');
  const [profileView, setProfileView] = useState<'grid'|'list'>('grid');
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [showSlip, setShowSlip] = useState(false);
  const [retirementTab, setRetirementTab] = useState<'projection'|'actual'>('projection');
  const [yearlyFY, setYearlyFY] = useState('2024-25');
  const [manDed, setManDed] = useState<Record<string,Record<string,number>>>({});
  const [arrCfg, setArrCfg] = useState({startMonth:'2023-12',endMonth:'2025-03',startBasic:35400,level:6,paidDA:50,incMonth:'07' as '01'|'07'});
  const [arrRows, setArrRows] = useState<any[]>([]);
  const [daArrCfg, setDaArrCfg] = useState({startMonth:'2024-01',endMonth:'2024-06',basic:35400,level:6,oldDA:50,newDA:53});
  const [daArrRows, setDaArrRows] = useState<any[]>([]);
  const [arrSubTab, setArrSubTab] = useState<'salary'|'da'>('salary');
  const [sbCfg, setSbCfg] = useState({month:'March',year:'2026',da:53,hra:18,ma:1000,ta:1800});
  const [sbEmps, setSbEmps] = useState<SBEmployee[]>([]);
  const billRef=useRef<HTMLDivElement>(null);
  const annualRef=useRef<HTMLDivElement>(null);
  const yearlyRef=useRef<HTMLDivElement>(null);
  const slipRef=useRef<HTMLDivElement>(null);

  // ── ACTIVE EMPLOYEE SALARY CALCS ─────────────────────────────────
  const s7 = useMemo(()=>{
    const b=emp.basicPay7th, da=pct(b,emp.daRate);
    const hra=pct(b,HRA_RATES[emp.hraCategory]*100);
    const taDA=pct(emp.transportAllowance,emp.daRate);
    const cea=emp.ceaChildren*2250, hostel=emp.hostelChildren*6750;
    const gross=b+da+hra+emp.medicalAllowance+emp.transportAllowance+taDA+emp.washingAllowance+emp.otherAllowances+cea+hostel;
    const npsEmp=emp.applyNPS?pct(b+da,emp.npsEmployee):0;
    const npsEr =emp.applyNPS?pct(b+da,emp.npsEmployer):0;
    const gsli=emp.applyGSLI?getGSLI(emp.payLevel):emp.gsliContribution;
    const pt=emp.applyPT?emp.professionalTax:0;
    const lic=emp.applyLIC?emp.licDeduction:0;
    const soc=emp.applySociety?emp.societyDeduction:0;
    const pf12=npsEmp*12, std=emp.taxRegime==='new'?75000:50000;
    const c80=emp.taxRegime==='old'?Math.min(emp.homeLoanPrincipal+emp.annualPPF+emp.annualLIC+emp.annualTuitionFee+pf12,150000):0;
    const c80d=emp.taxRegime==='old'?Math.min(emp.mediclaim,25000):0;
    const npsV=emp.taxRegime==='old'?Math.min(emp.npsVoluntary,50000):0;
    const npsEr14=emp.taxRegime==='new'?npsEr*12:0;
    const ceaEx=emp.taxRegime==='old'?(emp.ceaChildren*1200+emp.hostelChildren*3600):0;
    const txb=Math.max(0,(gross+emp.additionalIncome1/12+emp.additionalIncome2/12)*12-std-c80-c80d-npsV-npsEr14-ceaEx-(emp.taxRegime==='old'?pt*12+emp.homeLoanInterest:0));
    const annIT=emp.applyIT?calcTax(txb,emp.taxRegime):0;
    const monthIT=rnd(annIT/12);
    const td=npsEmp+gsli+pt+lic+soc+monthIT;
    const basic8=Math.round(b*emp.fitmentFactor8th/100)*100;
    return {b,da,hra,taDA,ta:emp.transportAllowance,ma:emp.medicalAllowance,wash:emp.washingAllowance,cea,hostel,gross,npsEmp,npsEr,gsli,pt,lic,soc,monthIT,annIT,td,net:gross-td,basic8};
  },[emp]);

  const fix = useMemo(()=>{
    const total6=emp.bandPayOld+emp.gradePayOld, tent=Math.floor(total6*2.57);
    const mat=PAY_MATRIX[emp.payLevel]||[];
    const fixed=mat.find(v=>v>=tent)||mat[0]||tent;
    return {total6,tent,fixed,step:mat.indexOf(fixed)+1,mat,level:emp.payLevel};
  },[emp]);

  const yearlyData = useMemo(()=>{
    const months=getFYMonths(yearlyFY); let basic=emp.basicPay7th;
    return months.map(({key,label,mo})=>{
      if(emp.incrementMonth==='07'&&mo===7) basic=nextStep(basic,emp.payLevel);
      if(emp.incrementMonth==='01'&&mo===1) basic=nextStep(basic,emp.payLevel);
      const daR=getDA(key), da=pct(basic,daR), hra=pct(basic,HRA_RATES[emp.hraCategory]*100);
      const taDA=pct(emp.transportAllowance,daR);
      const gross=basic+da+hra+emp.medicalAllowance+emp.transportAllowance+taDA+(emp.ceaChildren*2250)+(emp.hostelChildren*6750);
      const nps=emp.applyNPS?pct(basic+da,emp.npsEmployee):0;
      const pt=emp.applyPT?emp.professionalTax:0;
      const md=manDed[key]||{};
      const lic=md.lic??0, gsli=md.gsli??(emp.applyGSLI?getGSLI(emp.payLevel):emp.gsliContribution), itax=md.itax??0, others=md.others??0;
      const td=nps+pt+lic+gsli+itax+others;
      return {key,label,basic,daR,da,hra,transport:emp.transportAllowance+taDA,ma:emp.medicalAllowance,gross,nps,pt,lic,gsli,itax,others,td,net:gross-td};
    });
  },[emp,yearlyFY,manDed]);
  const yTot=(k:keyof typeof yearlyData[0])=>yearlyData.reduce((s,r)=>s+((r[k] as number)||0),0);

  const annData = useMemo(()=>{
    const e=emp, months=getFYMonths(e.financialYear); let basic=e.basicPay7th;
    const rows=months.map(({key,label,mo})=>{
      if(e.incrementMonth==='07'&&mo===7) basic=nextStep(basic,e.payLevel);
      if(e.incrementMonth==='01'&&mo===1) basic=nextStep(basic,e.payLevel);
      const daR=getDA(key), da=pct(basic,daR), hra=pct(basic,HRA_RATES[e.hraCategory]*100);
      const ta=e.transportAllowance+pct(e.transportAllowance,daR), ma=e.medicalAllowance;
      const total=basic+da+hra+ta+ma+(e.ceaChildren*2250)+(e.hostelChildren*6750);
      const pf=e.applyNPS?pct(basic+da,e.npsEmployee):0;
      const pt=e.applyPT?e.professionalTax:0, gsli=e.applyGSLI?getGSLI(e.payLevel):e.gsliContribution;
      const npsEr12=e.applyNPS?pct(basic+da,e.npsEmployer)*12:0;
      const std=e.taxRegime==='new'?75000:50000;
      const pf12=pf*12;
      const c80=e.taxRegime==='old'?Math.min(e.homeLoanPrincipal+e.annualPPF+e.annualLIC+e.annualTuitionFee+pf12,150000):0;
      const c80d=e.taxRegime==='old'?Math.min(e.mediclaim,25000):0;
      const npsV=e.taxRegime==='old'?Math.min(e.npsVoluntary,50000):0;
      const ceaEx=e.taxRegime==='old'?(e.ceaChildren*1200+e.hostelChildren*3600):0;
      const grossA=(total+e.additionalIncome1/12+e.additionalIncome2/12)*12;
      const txb=Math.max(0,grossA-std-c80-c80d-npsV-ceaEx-(e.taxRegime==='new'?npsEr12:pt*12+e.homeLoanInterest));
      const it=rnd(calcTax(txb,e.taxRegime)/12);
      return {key,label,basic,daR,da,hra,ta,ma,total,pf,gsli,pt,it};
    });
    const tot=rows.reduce((a,r)=>({...a,basic:a.basic+r.basic,da:a.da+r.da,hra:a.hra+r.hra,ta:a.ta+r.ta,ma:a.ma+r.ma,total:a.total+r.total,pf:a.pf+r.pf,gsli:a.gsli+r.gsli,pt:a.pt+r.pt,it:a.it+r.it}),{basic:0,da:0,hra:0,ta:0,ma:0,total:0,pf:0,gsli:0,pt:0,it:0});
    const grossA=tot.total+emp.additionalIncome1+emp.additionalIncome2;
    const std=emp.taxRegime==='new'?75000:50000, pfA=tot.pf;
    const npsEr12A=emp.applyNPS?pct(emp.basicPay7th+pct(emp.basicPay7th,emp.daRate),emp.npsEmployer)*12:0;
    const c80=emp.taxRegime==='old'?Math.min(emp.homeLoanPrincipal+emp.annualPPF+emp.annualLIC+emp.annualTuitionFee+pfA,150000):0;
    const c80d=emp.taxRegime==='old'?Math.min(emp.mediclaim,25000):0;
    const npsV=emp.taxRegime==='old'?Math.min(emp.npsVoluntary,50000):0;
    const sec16=tot.pt, ceaEx=emp.taxRegime==='old'?(emp.ceaChildren*1200+emp.hostelChildren*3600):0;
    const txb=Math.max(0,grossA-std-c80-c80d-npsV-ceaEx-(emp.taxRegime==='new'?npsEr12A:sec16+emp.homeLoanInterest));
    const totalTax=calcTax(txb,emp.taxRegime);
    return {rows,tot,grossA,std,c80,c80d,npsV,ceaEx,sec16,txb,totalTax,pfA,npsEr12A};
  },[emp]);

  const fullName = `${emp.salutation} ${emp.name}`.trim()||'New Employee';

  // ── PROFILE OPERATIONS ───────────────────────────────────────────
  const addProfile = () => {
    const id=uid();
    const newP=BLANK_PROFILE(id,{name:'',college:sysConfig.collegeName||'',color:PROFILE_COLORS[profiles.length%PROFILE_COLORS.length]});
    setProfiles(ps=>[...ps,newP]);
    setActiveId(id);
    setTab('profile');
    showToast('New profile created','success');
  };

  const deleteProfile = (id:string) => {
    if(profiles.length<=1){ showToast('Cannot delete last profile','error'); return; }
    setProfiles(ps=>ps.filter(p=>p.id!==id));
    if(activeId===id) setActiveId(profiles.find(p=>p.id!==id)?.id||'');
    showToast('Profile deleted','info');
  };

  const duplicateProfile = (id:string) => {
    const src=profiles.find(p=>p.id===id); if(!src) return;
    const newId=uid();
    const dup={...src,id:newId,name:src.name+' (Copy)',isStarred:false,color:PROFILE_COLORS[profiles.length%PROFILE_COLORS.length]};
    setProfiles(ps=>[...ps,dup]);
    setActiveId(newId);
    showToast('Profile duplicated','success');
  };

  const toggleStar = (id:string) => setProfiles(ps=>ps.map(p=>p.id===id?{...p,isStarred:!p.isStarred}:p));

  const switchTo = (id:string) => { setActiveId(id); setTab('profile'); };

  const importAllProfiles = (e:React.ChangeEvent<HTMLInputElement>) => {
    const file=e.target.files?.[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=(evt)=>{
      try {
        const wb=XLSX.read(evt.target?.result,{type:'binary'});
        const rows=XLSX.utils.sheet_to_json<any>(wb.Sheets[wb.SheetNames[0]]);
        const newProfiles=rows.map((r:any)=>BLANK_PROFILE(uid(),r));
        setProfiles(ps=>[...ps,...newProfiles]);
        showToast(`${newProfiles.length} profiles imported`,'success');
      } catch(err){ showToast('Import failed. Check file format.','error'); }
    };
    e.target.value=''; reader.readAsBinaryString(file);
  };

  const exportAllProfiles = () => {
    const hdrs = ['Name','Salutation','Designation','Department','College','PAN','DOJ','DOB','Level','Basic Pay','DA%','HRA','Category','Notes'];
    exportXLSX({
      filename:`All_Profiles_${sysConfig.collegeName.replace(/\s+/g,'_')}`,
      sheets:[{
        name:'Employee Profiles',
        title:`EMPLOYEE PROFILES — ${sysConfig.collegeName}`,
        subtitle:`Total Employees: ${profiles.length} | Exported on ${new Date().toLocaleDateString('en-IN')}`,
        headers:hdrs,
        rows:profiles.map(p=>[p.name,p.salutation,p.designation,p.department,p.college,p.panNumber,p.dateOfJoining,p.dateOfBirth,`Level ${p.payLevel}`,p.basicPay7th,p.daRate+'%',p.hraCategory,p.category,p.notes||'']),
        headerColor:'1A3C5E', altColor:'EBF5FB',
      }]
    });
  };

  const applyDesig = (d:string) => {
    const c=DESIG_CONFIG[d]; if(!c) return;
    setEmp((p:EmployeeData)=>({...p,designation:d,payLevel:c.level,transportAllowance:c.ta,medicalAllowance:c.ma,washingAllowance:c.washing,bandPayOld:c.bp6,gradePayOld:c.gp6,category:c.cat,basicPay7th:PAY_MATRIX[c.level]?.[0]??p.basicPay7th}));
  };
  const applyLevel = (lv:number) => setEmp((p:EmployeeData)=>({...p,payLevel:lv,basicPay7th:PAY_MATRIX[lv]?.[0]??p.basicPay7th}));

  const goNext=()=>{ const i=TABS.indexOf(tab); setTab(TABS[i<TABS.length-1?i+1:0]); };
  const goPrev=()=>{ const i=TABS.indexOf(tab); setTab(TABS[i>0?i-1:TABS.length-1]); };

  // Arrear generators
  const genArrears=()=>{
    let basic=arrCfg.startBasic; const rows:any[]=[]; const end=new Date(arrCfg.endMonth+'-01'); let cur=new Date(arrCfg.startMonth+'-01');
    while(cur<=end){
      const key=cur.toISOString().slice(0,7), mo=cur.getMonth()+1;
      if(key!==arrCfg.startMonth&&String(mo).padStart(2,'0')===arrCfg.incMonth) basic=nextStep(basic,arrCfg.level);
      const actDA=getDA(key); const da=pct(basic,actDA); const pDA=pct(basic,arrCfg.paidDA);
      const hra=pct(basic,HRA_RATES[emp.hraCategory]*100); const ta=emp.transportAllowance, taDA=pct(ta,actDA), pTaDA=pct(ta,arrCfg.paidDA);
      const ma=emp.medicalAllowance; const gross=basic+da+hra+ta+taDA+ma; const pGross=basic+pDA+hra+ta+pTaDA+ma;
      const nps=emp.applyNPS?pct(basic+da,emp.npsEmployee):0; const pNps=emp.applyNPS?pct(basic+pDA,emp.npsEmployee):0;
      const pt=emp.applyPT?emp.professionalTax:0;
      rows.push({key,basic,actDA,pDA_r:arrCfg.paidDA,da,pDA,hra,ta:ta+taDA,pTa:ta+pTaDA,ma,gross,pGross,nps,pNps,pt,net:gross-nps-pt,pNet:pGross-pNps-pt,arrear:(gross-nps-pt)-(pGross-pNps-pt)});
      cur.setMonth(cur.getMonth()+1);
    }
    setArrRows(rows); showToast(`${rows.length} months calculated`,'success');
  };

  const genDaArrears=()=>{
    let basic=daArrCfg.basic; const rows:any[]=[]; const end=new Date(daArrCfg.endMonth+'-01'); let cur=new Date(daArrCfg.startMonth+'-01');
    while(cur<=end){
      const key=cur.toISOString().slice(0,7); const announcedDA=getDA(key);
      const oldDAamt=pct(basic,daArrCfg.oldDA); const newDAamt=pct(basic,announcedDA); const daDiff=newDAamt-oldDAamt;
      const oldTaDA=pct(emp.transportAllowance,daArrCfg.oldDA); const newTaDA=pct(emp.transportAllowance,announcedDA); const taDiff=newTaDA-oldTaDA;
      const oldNPS=emp.applyNPS?pct(basic+oldDAamt,emp.npsEmployee):0; const newNPS=emp.applyNPS?pct(basic+newDAamt,emp.npsEmployee):0;
      const npsDiff=newNPS-oldNPS; const grossDiff=daDiff+taDiff; const netDiff=grossDiff-npsDiff;
      rows.push({key,basic,oldDA:daArrCfg.oldDA,announcedDA,oldDAamt,newDAamt,daDiff,oldTaDA,newTaDA,taDiff,grossDiff,oldNPS,newNPS,npsDiff,netDiff});
      cur.setMonth(cur.getMonth()+1);
    }
    setDaArrRows(rows); showToast(`${rows.length} months DA arrear calculated`,'success');
  };

  const sbCalc=(sb:SBEmployee)=>{const b=sb.basicOn2024,da=pct(b,sbCfg.da),hra=pct(b,sbCfg.hra),ta=sbCfg.ta+pct(sbCfg.ta,sbCfg.da),pf=pct(b,10);return {da,hra,ma:sbCfg.ma,ta,pf,gross:b+da+hra+sbCfg.ma+ta+pf};};

  // ── Premium Excel Export with styled theme ──────────────────────
  const exportXLSX = (data: {
    sheets: {
      name: string;
      title: string;
      subtitle?: string;
      headers: string[];
      rows: any[][];
      totals?: any[];
      headerColor?: string;
      altColor?: string;
    }[];
    filename: string;
  }) => {
    const wb = XLSX.utils.book_new();

    data.sheets.forEach(sheet => {
      const aoa: any[][] = [];

      // Title rows
      aoa.push([sheet.title]);
      if (sheet.subtitle) aoa.push([sheet.subtitle]);
      aoa.push([`Generated: ${new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })} | ${sysConfig.collegeName}`]);
      aoa.push([]); // blank row
      aoa.push(sheet.headers);
      sheet.rows.forEach(r => aoa.push(r));
      if (sheet.totals) { aoa.push([]); aoa.push(sheet.totals); }

      const ws = XLSX.utils.aoa_to_sheet(aoa);

      // Column widths — auto-fit based on content
      const colWidths = sheet.headers.map((h, ci) => {
        const allVals = [h, ...sheet.rows.map(r => String(r[ci] ?? ''))];
        const maxLen = Math.max(...allVals.map(v => String(v).length));
        return { wch: Math.min(Math.max(maxLen + 2, 10), 30) };
      });
      ws['!cols'] = colWidths;

      // Row heights
      const rowHeights: { hpx: number }[] = [];
      aoa.forEach((_, i) => rowHeights.push({ hpx: i < 4 ? 20 : i === 4 ? 22 : 18 }));
      ws['!rows'] = rowHeights;

      // Merge title cells
      const totalCols = sheet.headers.length;
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: totalCols - 1 } },
      ];

      // Cell styles (via SheetJS style extension pattern)
      const hdrColor = (sheet.headerColor || '1F3864').replace('#', '');
      const altColor = (sheet.altColor   || 'EBF5FB').replace('#', '');

      const applyStyle = (cellRef: string, style: any) => {
        if (!ws[cellRef]) ws[cellRef] = { v: '', t: 's' };
        ws[cellRef].s = style;
      };

      // Title style
      const titleStyle = { font: { bold: true, sz: 14, color: { rgb: 'FFFFFF' }, name: 'Arial' }, fill: { fgColor: { rgb: hdrColor } }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true }, border: {} };
      const subStyle   = { font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' }, name: 'Arial' }, fill: { fgColor: { rgb: '2E75B6' } }, alignment: { horizontal: 'center', vertical: 'center' } };
      const metaStyle  = { font: { italic: true, sz: 9, color: { rgb: '595959' }, name: 'Arial' }, fill: { fgColor: { rgb: 'F2F2F2' } }, alignment: { horizontal: 'center' } };
      const hdrStyle   = { font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' }, name: 'Arial' }, fill: { fgColor: { rgb: hdrColor } }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true }, border: { bottom: { style: 'medium', color: { rgb: 'FFFFFF' } } } };
      const numStyle   = { font: { sz: 10, name: 'Arial Narrow' }, numFmt: '#,##0', alignment: { horizontal: 'right' } };
      const totStyle   = { font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' }, name: 'Arial' }, fill: { fgColor: { rgb: '1F5C2E' } }, alignment: { horizontal: 'right' }, numFmt: '#,##0' };

      // Apply title rows
      const titleCells = ['A1', 'A2', 'A3'];
      const titleStyles = [titleStyle, subStyle, metaStyle];
      titleCells.forEach((c, i) => applyStyle(c, titleStyles[i]));

      // Apply header row (row index 4)
      sheet.headers.forEach((_, ci) => {
        const cellRef = XLSX.utils.encode_cell({ r: 4, c: ci });
        applyStyle(cellRef, hdrStyle);
      });

      // Apply data rows
      sheet.rows.forEach((row, ri) => {
        const isAlt = ri % 2 === 1;
        const rowBg = isAlt ? altColor : 'FFFFFF';
        row.forEach((val, ci) => {
          const cellRef = XLSX.utils.encode_cell({ r: 5 + ri, c: ci });
          const isNum = typeof val === 'number';
          const baseStyle = { font: { sz: 10, name: 'Arial Narrow' }, fill: { fgColor: { rgb: rowBg } }, border: { bottom: { style: 'thin', color: { rgb: 'D9D9D9' } } } };
          applyStyle(cellRef, isNum ? { ...baseStyle, ...numStyle, fill: baseStyle.fill } : { ...baseStyle, alignment: { horizontal: ci === 0 ? 'center' : 'left' } });
        });
      });

      // Apply totals row
      if (sheet.totals) {
        const totRowIdx = 5 + sheet.rows.length + 1;
        sheet.totals.forEach((val, ci) => {
          const cellRef = XLSX.utils.encode_cell({ r: totRowIdx, c: ci });
          applyStyle(cellRef, totStyle);
        });
      }

      XLSX.utils.book_append_sheet(wb, ws, sheet.name.slice(0, 31));
    });

    XLSX.writeFile(wb, `${data.filename}.xlsx`);
    showToast(`Excel exported: ${data.filename}.xlsx`, 'success');
  };

  const exportYearly=()=>exportXLSX({
    filename:`Yearly_Salary_${emp.name.replace(/\s+/g,'_')}_${yearlyFY}`,
    sheets:[{
      name:'Yearly Summary',
      title:`YEARLY SALARY SUMMARY — FY ${yearlyFY}`,
      subtitle:`${fullName} | ${emp.designation} | ${emp.college} | Level-${emp.payLevel}`,
      headers:['Month','Basic Pay','DA %','DA Amt','HRA','Transport','Medical','GROSS SALARY','NPS/PF','Prof Tax','Total Ded.','NET PAY'],
      rows:yearlyData.map(r=>[r.label,r.basic,r.daR+'%',r.da,r.hra,r.transport,r.ma,r.gross,r.nps,r.pt,r.td,r.net]),
      totals:['TOTAL','','','',yTot('hra'),yTot('transport'),yTot('ma'),yTot('gross'),yTot('nps'),yTot('pt'),yTot('td'),yTot('net')],
      headerColor:'1F3864', altColor:'EBF5FB',
    }]
  });
  const exportArrears=()=>exportXLSX({
    filename:`Salary_Arrear_${emp.name.replace(/\s+/g,'_')}`,
    sheets:[{
      name:'Salary Arrear',
      title:'SALARY ARREAR STATEMENT',
      subtitle:`${fullName} | Level-${arrCfg.level} | Period: ${arrCfg.startMonth} to ${arrCfg.endMonth}`,
      headers:['Month','Basic','Act.DA%','Paid DA%','DA Actual','DA Paid','HRA','Transport','Medical','Gross Due','Gross Paid','NPS Act.','NPS Paid','Prof.Tax','Net Due','Net Paid','ARREAR'],
      rows:arrRows.map(r=>[r.key,r.basic,r.actDA+'%',r.pDA_r+'%',r.da,r.pDA,r.hra,r.ta,r.ma,r.gross,r.pGross,r.nps,r.pNps,r.pt,r.net,r.pNet,r.arrear]),
      totals:['TOTAL','','','','','','','','',arrRows.reduce((s,r)=>s+r.gross,0),arrRows.reduce((s,r)=>s+r.pGross,0),arrRows.reduce((s,r)=>s+r.nps,0),arrRows.reduce((s,r)=>s+r.pNps,0),arrRows.reduce((s,r)=>s+r.pt,0),arrRows.reduce((s,r)=>s+r.net,0),arrRows.reduce((s,r)=>s+r.pNet,0),arrRows.reduce((s,r)=>s+r.arrear,0)],
      headerColor:'7B0000', altColor:'FFF5F5',
    }]
  });

  // ══════════════════════════════════════════════════════════════════
  // SALARY SLIP COMPONENT
  // ══════════════════════════════════════════════════════════════════
  const SalarySlip = () => (
    <div ref={slipRef} className="bg-white relative overflow-hidden" style={{fontFamily:'"Times New Roman",serif',padding:'28px 36px',border:'8px solid #1e3a8a',outline:'2px solid #000',outlineOffset:'-12px',minHeight:'790px'}}>
      {sysConfig.logoBase64&&<div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',opacity:0.05,pointerEvents:'none',zIndex:0}}><img src={sysConfig.logoBase64} alt="" style={{width:'420px'}}/></div>}
      <div style={{position:'relative',zIndex:1}}>
        <div style={{textAlign:'center',borderBottom:'3px double #000',paddingBottom:'10px',marginBottom:'12px',position:'relative'}}>
          {sysConfig.logoBase64&&<img src={sysConfig.logoBase64} alt="Logo" style={{position:'absolute',left:0,top:0,height:'60px',objectFit:'contain'}}/>}
          <p style={{fontSize:'15px',fontWeight:'900',textTransform:'uppercase',letterSpacing:'2px',color:'#1e3a8a'}}>{sysConfig.collegeName}</p>
          <p style={{fontSize:'10px',fontWeight:'bold',color:'#333',marginTop:'2px'}}>{sysConfig.address}</p>
          <p style={{fontSize:'11px',fontWeight:'bold',marginTop:'6px',background:'#f0f0f0',display:'inline-block',padding:'4px 14px',border:'1px solid #000'}}>Non-Teaching Staff Salary Slip — {emp.salaryMonth} {emp.salaryYear}</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'18px',marginBottom:'14px'}}>
          <div>{[['Name',fullName],['Designation',emp.designation],['Department',emp.department],['PAN',emp.panNumber||'—'],['Date of Birth',emp.dateOfBirth||'—'],['Joining Date',emp.dateOfJoining]].map(([k,v])=><p key={k} style={{display:'flex',justifyContent:'space-between',borderBottom:'1px dotted #ccc',paddingBottom:'3px',marginBottom:'3px',fontSize:'10px'}}><strong>{k}:</strong><span>{v}</span></p>)}</div>
          <div>{[['PRAN',emp.pranNumber||'—'],['Bank A/c',emp.bankAccount||'—'],['IFSC',emp.ifscCode||'—'],['Level',`Level ${emp.payLevel}`],['Tax Regime',emp.taxRegime==='new'?'New Regime':'Old Regime']].map(([k,v])=><p key={k} style={{display:'flex',justifyContent:'space-between',borderBottom:'1px dotted #ccc',paddingBottom:'3px',marginBottom:'3px',fontSize:'10px'}}><strong>{k}:</strong><span>{v}</span></p>)}</div>
        </div>
        <div style={{border:'2px solid #000',marginBottom:'12px'}}>
          <div style={{background:'#f0f0f0',padding:'5px',fontWeight:'bold',textAlign:'center',fontSize:'11px',borderBottom:'2px solid #000',letterSpacing:'1px',textTransform:'uppercase'}}>Monthly Salary Breakdown (7th Pay Commission)</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr'}}>
            <div style={{padding:'12px',borderRight:'1px solid #000'}}>
              <p style={{fontSize:'9px',fontWeight:'bold',textDecoration:'underline',marginBottom:'7px',textTransform:'uppercase'}}>Earnings</p>
              {[['Basic Pay',s7.b],[`DA (${emp.daRate}%)`,s7.da],['HRA ('+HRA_RATES[emp.hraCategory]*100+'%)',s7.hra],[`Transport (+DA)`,s7.ta+s7.taDA],['Medical',s7.ma],...(s7.wash>0?[['Washing',s7.wash]]:[] as any),...(s7.cea>0?[['CEA',s7.cea]]:[] as any)].map(([k,v]:any)=><p key={k} style={{display:'flex',justifyContent:'space-between',marginBottom:'4px',fontSize:'10px'}}><span>{k}:</span><span>{rs(v)}</span></p>)}
              <div style={{borderTop:'2px solid #000',paddingTop:'5px',marginTop:'5px',display:'flex',justifyContent:'space-between',fontWeight:'900',fontSize:'11px'}}><span>Gross Total:</span><span>{rs(s7.gross)}</span></div>
            </div>
            <div style={{padding:'12px'}}>
              <p style={{fontSize:'9px',fontWeight:'bold',textDecoration:'underline',marginBottom:'7px',textTransform:'uppercase'}}>Deductions</p>
              {[...(emp.applyNPS?[['NPS Employee (10%)',s7.npsEmp],['NPS Employer (14%)',s7.npsEr]]:[] as any),...(emp.applyGSLI?[['GSLI',s7.gsli]]:[] as any),...(emp.applyPT?[['Prof. Tax',s7.pt]]:[] as any),...(emp.applyIT?[['Income Tax (TDS)',s7.monthIT]]:[] as any),...(emp.applyLIC?[['LIC',s7.lic]]:[] as any),...(emp.applySociety?[['Society',s7.soc]]:[] as any)].map(([k,v]:any)=><p key={k} style={{display:'flex',justifyContent:'space-between',marginBottom:'4px',fontSize:'10px'}}><span>{k}:</span><span>{rs(v)}</span></p>)}
              <div style={{borderTop:'2px solid #000',paddingTop:'5px',marginTop:'5px',display:'flex',justifyContent:'space-between',fontWeight:'900',fontSize:'11px'}}><span>Total Deductions:</span><span>{rs(s7.td)}</span></div>
            </div>
          </div>
          <div style={{background:'#1a1a1a',color:'#fff',padding:'14px',textAlign:'center',borderTop:'2px solid #000'}}>
            <p style={{fontSize:'9px',fontWeight:'bold',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'3px'}}>Net Monthly Payable</p>
            <p style={{fontSize:'30px',fontWeight:'900'}}>{rs(s7.net)}/-</p>
            <p style={{fontSize:'9px',marginTop:'3px',opacity:0.7}}>{toWords(s7.net)}</p>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',textAlign:'center',marginTop:'36px',gap:'20px'}}>
          {['Employee Signature','Accountant','Principal'].map(r=><div key={r} style={{borderTop:'1px solid #000',paddingTop:'5px',fontSize:'10px',fontWeight:'bold'}}>{r}<div style={{fontSize:'9px',fontWeight:'normal',marginTop:'3px',color:'#666'}}>{r==='Principal'?sysConfig.collegeName:''}</div></div>)}
        </div>
      </div>
    </div>
  );

  const filteredProfiles = useMemo(()=>{
    return profiles.filter(p=>{
      const matchSearch=!profileSearch||p.name.toLowerCase().includes(profileSearch.toLowerCase())||p.designation.toLowerCase().includes(profileSearch.toLowerCase());
      const matchFilter=profileFilter==='all'||(profileFilter==='starred'&&p.isStarred)||(p.category===profileFilter);
      return matchSearch&&matchFilter;
    });
  },[profiles,profileSearch,profileFilter]);

  const dashStats = useMemo(()=>{
    const byCategory: Record<string,number>={};
    const byLevel: Record<number,number>={};
    let totalGross=0, totalNet=0, totalNPS=0;
    profiles.forEach(p=>{
      const b=p.basicPay7th, da=pct(b,p.daRate), hra=pct(b,HRA_RATES[p.hraCategory]*100), ta=p.transportAllowance, ma=p.medicalAllowance;
      const gross=b+da+hra+ta+ma; const nps=p.applyNPS?pct(b+da,p.npsEmployee):0; const gsli=p.applyGSLI?getGSLI(p.payLevel):p.gsliContribution; const pt=p.applyPT?p.professionalTax:0;
      totalGross+=gross; totalNet+=(gross-nps-gsli-pt); totalNPS+=nps;
      byCategory[p.category]=(byCategory[p.category]||0)+1;
      byLevel[p.payLevel]=(byLevel[p.payLevel]||0)+1;
    });
    return {byCategory,byLevel,totalGross,totalNet,totalNPS,count:profiles.length,starred:profiles.filter(p=>p.isStarred).length};
  },[profiles]);

  // ══════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════
  const navGroups = [
    {g:'main',label:'Overview'},
    {g:'employee',label:'Employee'},
    {g:'reports',label:'Reports & Docs'},
    {g:'tools',label:'Tools'},
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-gray-900">
      {/* Toast */}
      <AnimatePresence>{toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}</AnimatePresence>

      {/* Salary Slip Modal */}
      <AnimatePresence>
        {showSlip&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{scale:0.95,y:20}} animate={{scale:1,y:0}} exit={{scale:0.95}} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-auto">
              <div className="sticky top-0 bg-white border-b px-5 py-3 flex items-center justify-between rounded-t-2xl z-10">
                <span className="font-black text-gray-800 flex items-center gap-2"><Receipt size={16} className="text-cyan-600"/> Salary Slip Preview</span>
                <div className="flex items-center gap-2">
                  <button onClick={()=>downloadPDF(slipRef,`Salary_Slip_${emp.name}_${emp.salaryMonth}`,'p')} className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 text-white rounded-lg text-xs font-bold hover:bg-cyan-700"><Download size={12}/> PDF</button>
                  <button onClick={()=>setShowSlip(false)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200"><X size={14}/></button>
                </div>
              </div>
              <div className="p-5"><SalarySlip/></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center shadow"><Calculator size={15} className="text-white"/></div>
            <div className="flex items-baseline gap-2">
              <span className="text-xs sm:text-sm font-black text-gray-900 tracking-tight truncate max-w-[120px] sm:max-w-none">{sysConfig.collegeName||'Pay Master Pro'}</span>
              <span className="hidden sm:inline text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full">v8.0</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Profile Quick Switcher */}
            <div className="hidden lg:flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-xl border border-gray-200">
              {profiles.slice(0,5).map(p=>(
                <button key={p.id} onClick={()=>{setActiveId(p.id);setTab('profile');}} title={p.name}
                  className={`w-7 h-7 rounded-full text-white text-[10px] font-black transition-all flex items-center justify-center ${p.id===activeId?'ring-2 ring-offset-1 ring-gray-400 scale-110':''}`}
                  style={{background:p.color}}>{(p.name||'?')[0].toUpperCase()}</button>
              ))}
              {profiles.length>5&&<span className="text-[10px] text-gray-400 font-bold px-1">+{profiles.length-5}</span>}
              <button onClick={addProfile} className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-all"><Plus size={12} className="text-gray-600"/></button>
            </div>
            {emp.name&&(
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-xl">
                <div className="w-4 h-4 rounded-full" style={{background:emp.color}}/>
                <span className="text-xs font-bold text-green-800">{fullName}</span>
                <span className="text-[10px] text-green-500">· Lvl {emp.payLevel} · {rs(s7.net)}/mo</span>
              </div>
            )}
            <button onClick={()=>{
  if(confirm('⚠ WARNING: Ye sab profiles DELETE kar dega!\n\nKya aapne backup liya hai? Excel export mein backup save hai.\n\nPhir bhi delete karna hai?')){
    exportAllProfiles();
    setTimeout(()=>{
      localStorage.removeItem('gnc_profiles_v8');
      localStorage.removeItem('gnc_sys_v8');
      localStorage.removeItem('gnc_last_backup');
      window.location.reload();
    },800);
  }
}} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 hover:text-red-700 border border-red-200 bg-red-50 rounded-xl transition-all"><RefreshCw size={11}/><span className="hidden sm:inline"> Reset</span></button>
          </div>
        </div>
      </header>

      {/* ── BACKUP WARNING BANNER ─────────────────────────────────── */}
      <AnimatePresence>
        {showBackupBanner && (
          <motion.div
            initial={{opacity:0,y:-40}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-40}}
            className="bg-amber-500 text-white px-4 py-2.5 flex items-center justify-between shadow-md z-30 relative"
          >
            <div className="flex items-center gap-3">
              <AlertCircle size={16} className="shrink-0"/>
              <span className="text-sm font-bold">
                ⚠ Browser data clear hone par sab profiles delete ho sakte hain! 
                Backup karo aur safe raho — last backup: {lastBackup ? new Date(lastBackup).toLocaleDateString('en-IN') : 'Never'}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-4">
              <button
                onClick={markBackupDone}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-amber-700 rounded-lg text-xs font-black hover:bg-amber-50 transition-all shadow"
              >
                <Download size={12}/> Backup Now
              </button>
              <button
                onClick={()=>setShowBackupBanner(false)}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-amber-400 hover:bg-amber-600 transition-all"
              >
                <X size={12}/>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-screen-2xl mx-auto px-2 sm:px-4 py-2 sm:py-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* SIDEBAR */}
        <aside className="hidden sm:block w-44 shrink-0">
          <div className="sticky top-20 space-y-4">
            {navGroups.map(g=>(
              <div key={g.g}>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 px-2">{g.label}</p>
                <div className="space-y-0.5">
                  {NAV_ITEMS.filter(n=>n.group===g.g).map(item=>{
                    const isA=tab===item.id;
                    return (
                      <button key={item.id} onClick={()=>setTab(item.id as TabType)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all duration-150 ${isA?'bg-white shadow border border-gray-200':'hover:bg-white/70'}`}>
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={isA?{background:item.color+'18',border:`1px solid ${item.color}33`}:{}}><item.icon size={12} style={{color:isA?item.color:'#9ca3af'}}/></div>
                        <span className={`text-[11px] font-semibold leading-tight ${isA?'text-gray-900':'text-gray-500'}`}>{item.label}</span>
                        {isA&&<ChevronRight size={10} className="ml-auto shrink-0" style={{color:item.color}}/>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {/* DA Quick Reference */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-2">DA History</p>
              {Object.entries(DA_HISTORY).slice(-6).map(([m,r])=>(
                <div key={m} className="flex justify-between text-[10px] mb-0.5">
                  <span className="text-gray-500">{m}</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-emerald-600">{r}%</span>
                    {m>='2025-07'&&<span className="text-[8px] text-amber-500 font-bold">~</span>}
                  </div>
                </div>
              ))}
              <p className="text-[8px] text-amber-500 mt-1.5 leading-tight">~ = Projected. Verify latest Jharkhand Gazette order.</p>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 min-w-0 w-full">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.14}}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[70vh]">

              {/* ══════ DASHBOARD ══════ */}
              {tab==='dashboard'&&(
                <div className="p-4 sm:p-5">
                  <SectionHead title="Dashboard" subtitle={`${sysConfig.collegeName} · ${dashStats.count} employee profiles`} icon={LayoutDashboard} accent="#16a34a"/>
                  
                  {/* Stats row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                    <StatCard label="Total Employees" value={dashStats.count+' Profiles'} icon={Users} color="#2563eb" sub={`${dashStats.starred} starred`}/>
                    <StatCard label="Total Monthly Gross" value={dashStats.totalGross} icon={TrendingUp} color="#16a34a" sub="All profiles combined"/>
                    <StatCard label="Total Net Payable" value={dashStats.totalNet} icon={IndianRupee} color="#059669" sub="After deductions"/>
                    <StatCard label="Total NPS Monthly" value={dashStats.totalNPS} icon={Shield} color="#7c3aed" sub="Employee contribution"/>
                  </div>

                  {/* Charts + Recent */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                    <Card className="p-5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-4">Category Distribution</p>
                      <div className="flex items-center gap-4">
                        <DonutChart slices={Object.entries(dashStats.byCategory).map(([k,v])=>({value:v as number,color:CATEGORY_COLORS[k]||'#aaa',label:k}))}/>
                        <div className="space-y-1.5 flex-1">
                          {Object.entries(dashStats.byCategory).map(([k,v])=>(
                            <div key={k} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{background:CATEGORY_COLORS[k]}}/><span className="capitalize">{k.replace('-',' ')}</span></div>
                              <span className="font-bold">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                    <Card className="p-5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-4">Salary by Pay Level</p>
                      <MiniBar
                        data={Object.entries(dashStats.byLevel).slice(0,8).map(([lv,cnt])=>({label:'L'+lv,value:cnt as number}))}
                        colors={['#2563eb','#16a34a','#d97706','#7c3aed','#dc2626','#0891b2','#db2777','#9333ea']}
                      />
                    </Card>
                    <Card className="p-5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-4">DA Trend (Last 6 Revisions)</p>
                      <SparkLine values={Object.values(DA_HISTORY).slice(-12)} color="#16a34a"/>
                      <div className="mt-3 space-y-1">
                        {Object.entries(DA_HISTORY).slice(-4).map(([m,r])=>(
                          <div key={m} className="flex justify-between text-xs py-1 border-b border-gray-50">
                            <span className="text-gray-500">{m}</span>
                            <span className="font-black text-emerald-600">{r}%</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>

                  {/* Top employees */}
                  <Card>
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                      <p className="text-sm font-black text-gray-800">All Profiles — Quick Overview</p>
                      <div className="flex gap-2">
                        <button onClick={addProfile} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 shadow"><UserPlus size={12}/> Add Profile</button>
                        <button onClick={()=>setTab('profiles')} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200">View All <ChevronRight size={12}/></button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead><tr className="bg-gray-50 border-b border-gray-100">{['','Name','Designation','Level','Basic','Gross','Net Pay','Action'].map(h=><th key={h} className="px-3 py-2.5 text-left font-black text-gray-400 uppercase tracking-wider text-[10px]">{h}</th>)}</tr></thead>
                        <tbody>
                          {profiles.slice(0,8).map(p=>{
                            const b=p.basicPay7th,da=pct(b,p.daRate),hra=pct(b,HRA_RATES[p.hraCategory]*100),gross=b+da+hra+p.transportAllowance+p.medicalAllowance;
                            const nps=p.applyNPS?pct(b+da,p.npsEmployee):0,gsli=p.applyGSLI?getGSLI(p.payLevel):p.gsliContribution,pt=p.applyPT?p.professionalTax:0,net=gross-nps-gsli-pt;
                            return (
                              <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer ${p.id===activeId?'bg-green-50/30':''}`} onClick={()=>switchTo(p.id)}>
                                <td className="px-3 py-2.5"><div className="w-6 h-6 rounded-full text-white text-[10px] font-black flex items-center justify-center" style={{background:p.color}}>{(p.name||'?')[0]}</div></td>
                                <td className="px-3 py-2.5 font-bold">{p.salutation} {p.name||<span className="text-gray-400 italic">No Name</span>}</td>
                                <td className="px-3 py-2.5 text-gray-500">{p.designation}</td>
                                <td className="px-3 py-2.5"><span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-bold">L{p.payLevel}</span></td>
                                <td className="px-3 py-2.5 font-mono">{rs(b)}</td>
                                <td className="px-3 py-2.5 font-mono font-bold text-green-700">{rs(gross)}</td>
                                <td className="px-3 py-2.5 font-mono font-black">{rs(net)}</td>
                                <td className="px-3 py-2.5">
                                  <div className="flex gap-1">
                                    <button onClick={e=>{e.stopPropagation();switchTo(p.id);}} className="px-2 py-1 bg-green-50 text-green-700 rounded text-[10px] font-bold hover:bg-green-100"><Edit3 size={10}/></button>
                                    <button onClick={e=>{e.stopPropagation();toggleStar(p.id);}} className={`px-2 py-1 rounded text-[10px] font-bold ${p.isStarred?'bg-yellow-50 text-yellow-600':'bg-gray-50 text-gray-400 hover:text-yellow-500'}`}><Star size={10}/></button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                  <NavRow onPrev={goPrev} onNext={()=>setTab('profiles')} extras={<button onClick={addProfile} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow"><UserPlus size={14}/> Add Profile</button>}/>
                </div>
              )}

              {/* ══════ PROFILES ══════ */}
              {tab==='profiles'&&(
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-5 gap-3">
                    <SectionHead title="Profile Manager" subtitle={`${profiles.length} employees · Multi-profile system`} icon={Users} accent="#2563eb"/>
                    <div className="flex flex-wrap items-center gap-2">
                      <input type="file" accept=".xlsx,.xls" id="import-all" className="hidden" onChange={importAllProfiles}/>
                      <label htmlFor="import-all" className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold cursor-pointer hover:bg-blue-100"><Upload size={12}/> Import Excel</label>
                      <button onClick={exportAllProfiles} className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs font-bold hover:bg-green-100"><Download size={12}/> Export All</button>
                      <button onClick={addProfile} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 shadow"><UserPlus size={14}/> Add New</button>
                    </div>
                  </div>

                  {/* Filter bar */}
                  <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                    <div className="relative flex-1 max-w-xs">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                      <input value={profileSearch} onChange={e=>setProfileSearch(e.target.value)} placeholder="Search by name or designation..." className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"/>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {[{v:'all',l:'All'},{v:'starred',l:'⭐ Starred'},{v:'teaching',l:'Teaching'},{v:'non-teaching',l:'Non-Teaching'},{v:'admin',l:'Admin'},{v:'technical',l:'Technical'},{v:'class-iv',l:'Class IV'}].map(f=>(
                        <button key={f.v} onClick={()=>setProfileFilter(f.v)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${profileFilter===f.v?'bg-blue-600 text-white shadow':'bg-white text-gray-500 border border-gray-200 hover:border-blue-300'}`}>{f.l}</button>
                      ))}
                    </div>
                    <div className="flex gap-1 ml-auto">
                      <button onClick={()=>setProfileView('grid')} className={`p-2 rounded-lg transition-all ${profileView==='grid'?'bg-blue-100 text-blue-700':'text-gray-400 hover:text-gray-700'}`}><Grid size={14}/></button>
                      <button onClick={()=>setProfileView('list')} className={`p-2 rounded-lg transition-all ${profileView==='list'?'bg-blue-100 text-blue-700':'text-gray-400 hover:text-gray-700'}`}><List size={14}/></button>
                    </div>
                  </div>

                  {filteredProfiles.length===0&&(
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                      <Users size={48} className="mb-4 opacity-20"/>
                      <p className="text-lg font-bold">No profiles found</p>
                      <p className="text-sm mt-1">Try a different search or filter</p>
                      <button onClick={addProfile} className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700"><UserPlus size={15}/> Add First Profile</button>
                    </div>
                  )}

                  {profileView==='grid'?(
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredProfiles.map(p=>{
                        const b=p.basicPay7th,da=pct(b,p.daRate),hra=pct(b,HRA_RATES[p.hraCategory]*100),gross=b+da+hra+p.transportAllowance+p.medicalAllowance;
                        const nps=p.applyNPS?pct(b+da,p.npsEmployee):0,gsli=p.applyGSLI?getGSLI(p.payLevel):p.gsliContribution,pt=p.applyPT?p.professionalTax:0,net=gross-nps-gsli-pt;
                        const isActive=p.id===activeId;
                        return (
                          <motion.div key={p.id} layout className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden hover:shadow-lg transition-all cursor-pointer group ${isActive?'border-green-500 shadow-md':'border-gray-200'}`} onClick={()=>switchTo(p.id)}>
                            <div className="h-1.5 w-full" style={{background:p.color}}/>
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl text-white font-black text-lg flex items-center justify-center shadow" style={{background:p.color}}>{(p.name||'?')[0].toUpperCase()}</div>
                                <div className="flex gap-1">
                                  <button onClick={e=>{e.stopPropagation();toggleStar(p.id);}} className={`p-1.5 rounded-lg ${p.isStarred?'text-yellow-500':'text-gray-300 hover:text-yellow-400'}`}><Star size={13} fill={p.isStarred?'currentColor':'none'}/></button>
                                  {isActive&&<div className="p-1.5 rounded-lg text-green-600 bg-green-50"><CheckCircle2 size={13}/></div>}
                                </div>
                              </div>
                              <p className="font-black text-gray-900 text-sm truncate">{p.salutation} {p.name||<span className="text-gray-400 italic text-xs">Unnamed</span>}</p>
                              <p className="text-xs text-gray-500 truncate mt-0.5">{p.designation}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{background:CATEGORY_COLORS[p.category]+'18',color:CATEGORY_COLORS[p.category]}}>{p.category}</span>
                                <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-full font-bold">Level {p.payLevel}</span>
                              </div>
                              <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-[10px]">
                                <div><p className="text-gray-400">Gross</p><p className="font-black text-gray-800">{rs(gross)}</p></div>
                                <div><p className="text-gray-400">Net</p><p className="font-black text-green-700">{rs(net)}</p></div>
                              </div>
                              <div className="mt-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={e=>{e.stopPropagation();switchTo(p.id);setTab('profile');}} className="flex-1 text-[10px] py-1.5 bg-green-50 text-green-700 rounded-lg font-bold hover:bg-green-100 flex items-center justify-center gap-1"><Edit3 size={10}/> Edit</button>
                                <button onClick={e=>{e.stopPropagation();duplicateProfile(p.id);}} className="text-[10px] px-2 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100"><Copy size={10}/></button>
                                <button onClick={e=>{e.stopPropagation();if(confirm('Delete?'))deleteProfile(p.id);}} className="text-[10px] px-2 py-1.5 bg-red-50 text-red-500 rounded-lg font-bold hover:bg-red-100"><Trash2 size={10}/></button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                      <button onClick={addProfile} className="rounded-2xl border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50/50 flex flex-col items-center justify-center p-8 transition-all cursor-pointer group min-h-[200px]">
                        <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-green-100 flex items-center justify-center mb-2 transition-all"><Plus size={20} className="text-gray-400 group-hover:text-green-600"/></div>
                        <p className="text-xs font-bold text-gray-400 group-hover:text-green-600 transition-all">Add New Profile</p>
                      </button>
                    </div>
                  ):(
                    <div className="overflow-hidden rounded-xl border border-gray-200">
                      <table className="w-full text-xs">
                        <thead><tr className="bg-gray-800 text-white">{['','Name','Designation','Category','Level','Basic','Gross','Net Pay','Actions'].map(h=><th key={h} className="px-3 py-3 text-left font-black text-[10px] uppercase">{h}</th>)}</tr></thead>
                        <tbody>
                          {filteredProfiles.map((p,i)=>{
                            const b=p.basicPay7th,da=pct(b,p.daRate),hra=pct(b,HRA_RATES[p.hraCategory]*100),gross=b+da+hra+p.transportAllowance+p.medicalAllowance;
                            const nps=p.applyNPS?pct(b+da,p.npsEmployee):0,gsli=p.applyGSLI?getGSLI(p.payLevel):p.gsliContribution,pt=p.applyPT?p.professionalTax:0,net=gross-nps-gsli-pt;
                            return (
                              <tr key={p.id} className={`border-b border-gray-100 hover:bg-gray-50 ${i%2===0?'bg-white':'bg-gray-50/30'} ${p.id===activeId?'bg-green-50/40':''}`}>
                                <td className="px-3 py-2.5"><div className="w-6 h-6 rounded-full" style={{background:p.color}}/></td>
                                <td className="px-3 py-2.5 font-bold">{p.salutation} {p.name||<span className="text-gray-400 italic">—</span>}{p.isStarred&&<Star size={10} fill="#f59e0b" className="inline ml-1 text-yellow-400"/>}</td>
                                <td className="px-3 py-2.5 text-gray-500">{p.designation}</td>
                                <td className="px-3 py-2.5"><span className="capitalize text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{background:CATEGORY_COLORS[p.category]+'18',color:CATEGORY_COLORS[p.category]}}>{p.category}</span></td>
                                <td className="px-3 py-2.5 text-center"><span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-bold">L{p.payLevel}</span></td>
                                <td className="px-3 py-2.5 font-mono">{rs(b)}</td>
                                <td className="px-3 py-2.5 font-mono text-green-700 font-bold">{rs(gross)}</td>
                                <td className="px-3 py-2.5 font-mono font-black">{rs(net)}</td>
                                <td className="px-3 py-2.5">
                                  <div className="flex gap-1">
                                    <button onClick={()=>switchTo(p.id)} className="px-2 py-1 bg-green-50 text-green-700 rounded text-[10px] font-bold hover:bg-green-100 flex items-center gap-1"><Edit3 size={9}/> Edit</button>
                                    <button onClick={()=>duplicateProfile(p.id)} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold hover:bg-blue-100"><Copy size={9}/></button>
                                    <button onClick={()=>{if(confirm('Delete?'))deleteProfile(p.id);}} className="px-2 py-1 bg-red-50 text-red-500 rounded text-[10px] font-bold hover:bg-red-100"><Trash2 size={9}/></button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <NavRow onPrev={goPrev} onNext={()=>setTab('profile')} extras={<button onClick={()=>setTab('compare')} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow"><TrendingUp size={14}/> Planner</button>}/>
                </div>
              )}

              {/* ══════ EDIT PROFILE ══════ */}
              {tab==='profile'&&(
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-5 gap-3">
                    <SectionHead title={emp.name?`Editing: ${fullName}`:'New Employee Profile'} subtitle="Auto-saves · Select designation for smart auto-fill" icon={User} accent="#7c3aed"/>
                    <div className="flex flex-wrap items-center gap-2">
                      <button onClick={()=>duplicateProfile(emp.id)} className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100"><Copy size={12}/> Duplicate</button>
                      <button onClick={()=>{setEmp(BLANK_PROFILE(emp.id,{college:emp.college,color:emp.color}));showToast('Profile reset','info');}} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:text-red-700 border border-red-200 bg-red-50 rounded-xl"><RotateCcw size={11}/> Reset</button>
                    </div>
                  </div>

                  {/* Color picker */}
                  <div className="flex items-center gap-3 mb-5 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <p className="text-xs font-bold text-gray-500">Profile Color:</p>
                    {PROFILE_COLORS.map(c=>(
                      <button key={c} onClick={()=>setEmp((p:EmployeeData)=>({...p,color:c}))} className={`w-6 h-6 rounded-full transition-all ${emp.color===c?'ring-2 ring-offset-1 ring-gray-600 scale-125':''}`} style={{background:c}}/>
                    ))}
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-xs text-gray-400">Category:</span>
                      {(['teaching','non-teaching','admin','technical','class-iv'] as const).map(c=>(
                        <button key={c} onClick={()=>setEmp((p:EmployeeData)=>({...p,category:c}))} className={`text-[10px] px-2 py-1 rounded-full font-bold capitalize transition-all ${emp.category===c?'ring-2 ring-offset-1':'opacity-60'}`} style={{background:CATEGORY_COLORS[c]+'18',color:CATEGORY_COLORS[c],borderColor:CATEGORY_COLORS[c]+'44'}}>{c}</button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                    <div><Lbl c="Salutation"/><TSel value={emp.salutation} onChange={setE('salutation')} options={SALUTATIONS}/></div>
                    <div className="col-span-2"><Lbl c="Full Name"/><TIn value={emp.name} onChange={setE('name')} placeholder="Employee Full Name"/></div>
                    <div><Lbl c="Designation (Auto-fills Pay)"/><TSel value={emp.designation} onChange={applyDesig} grouped={DESIG_GROUPS}/></div>
                    <div><Lbl c="Department"/><TSel value={emp.department} onChange={setE('department')} options={DEPARTMENTS}/></div>
                    <div><Lbl c="College Name"/><TIn value={emp.college} onChange={setE('college')} placeholder="College/Institute name"/></div>
                    <div><Lbl c="PAN Number"/><TIn value={emp.panNumber} onChange={setE('panNumber')} placeholder="ABCDE1234F"/></div>
                    <div><Lbl c="PRAN Number"/><TIn value={emp.pranNumber} onChange={setE('pranNumber')}/></div>
                    <div><Lbl c="Bank Account"/><TIn value={emp.bankAccount} onChange={setE('bankAccount')}/></div>
                    <div><Lbl c="IFSC Code"/><TIn value={emp.ifscCode} onChange={setE('ifscCode')}/></div>
                    <div>
                      <Lbl c="Date of Joining"/>
                      <TIn value={emp.dateOfJoining} onChange={setE('dateOfJoining')} placeholder="DD.MM.YYYY or DD-MM-YYYY"/>
                      <p className="text-[9px] text-gray-400 mt-1">Format: DD.MM.YYYY e.g. 02.05.2011</p>
                    </div>
                    <div>
                      <Lbl c="Date of Birth ★"/>
                      <TIn value={emp.dateOfBirth} onChange={setE('dateOfBirth')} placeholder="DD.MM.YYYY or DD-MM-YYYY"/>
                      <p className="text-[9px] text-amber-500 mt-1 font-bold">★ Required for Retirement calculation</p>
                    </div>
                    <div><Lbl c="Financial Year"/><TSel value={emp.financialYear} onChange={setE('financialYear')} options={FY_YEARS}/></div>
                    <div><Lbl c="Increment Month"/><TSel value={emp.incrementMonth} onChange={(v:any)=>setEmp((p:EmployeeData)=>({...p,incrementMonth:v}))} options={[{value:'07',label:'July (Standard)'},{value:'01',label:'January'}]}/></div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-5">
                    <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-4">Pay Structure (7th CPC)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div><Lbl c="Pay Level"/><TSel value={emp.payLevel} onChange={(v:string)=>applyLevel(Number(v))} options={Object.keys(PAY_MATRIX).map(l=>({value:Number(l),label:`Level ${l} (GP: ₹${({1:1800,2:1900,3:2000,4:2400,5:2800,6:4200,7:4600,8:4800,9:5400,10:5400,11:6600,12:7600,13:8700,14:8900} as any)[l]})`}))}/></div>
                      <div><Lbl c="Current Basic Pay"/><TSel value={emp.basicPay7th} onChange={(v:string)=>setEmp((p:EmployeeData)=>({...p,basicPay7th:Number(v)}))} options={(PAY_MATRIX[emp.payLevel]||[]).map((v,i)=>({value:v,label:`Cell ${i+1} — ${rs(v)}`}))}/></div>
                      <div>
  <Lbl c="DA Rate (%)"/>
  <TSel value={emp.daRate} onChange={(v:string)=>setEmp((p:EmployeeData)=>({...p,daRate:Number(v)}))} options={[
    {value:55,label:'55% — Jan 2025 (Confirmed)'},
    {value:58,label:'58% — Jul 2025 (Projected ~)'},
    {value:61,label:'61% — Jan 2026 (Projected ~)'},
    {value:53,label:'53% — Jul 2024 (Confirmed)'},
    {value:50,label:'50% — Jan 2024 (Confirmed)'},
    {value:46,label:'46% — Jul 2023 (Confirmed)'},
    {value:42,label:'42% — Jan 2023 (Confirmed)'},
    {value:38,label:'38% — Jul 2022 (Confirmed)'},
    {value:34,label:'34% — Jan 2022 (Confirmed)'},
    {value:28,label:'28% — Jul 2021 (Confirmed)'},
    {value:17,label:'17% — Jan 2020 (COVID Freeze)'},
  ]}/>
  <p className="text-[9px] text-amber-500 mt-1">~ = Projected. Verify Jharkhand Gazette.</p>
</div>
                      <div><Lbl c="HRA City Category"/><TSel value={emp.hraCategory} onChange={(v:any)=>setEmp((p:EmployeeData)=>({...p,hraCategory:v}))} options={[{value:'X',label:'X – 27% (Metro)'},{value:'Y',label:'Y – 18% (Ranchi/Jamshedpur/Dhanbad)'},{value:'Z',label:'Z – 9% (Other Districts)'}]}/></div>
                      <div><Lbl c="Transport Allow. (₹)"/><TIn type="number" value={emp.transportAllowance} onChange={setE('transportAllowance')}/></div>
                      <div><Lbl c="Medical Allow. (₹)"/><TIn type="number" value={emp.medicalAllowance} onChange={setE('medicalAllowance')}/></div>
                      <div><Lbl c="Washing Allow. (₹)"/><TIn type="number" value={emp.washingAllowance} onChange={setE('washingAllowance')}/></div>
                      <div><Lbl c="CEA (No. of Children)"/><TSel value={emp.ceaChildren} onChange={setE('ceaChildren')} options={[{value:0,label:'None'},{value:1,label:'1 Child (₹2250/mo)'},{value:2,label:'2 Children (₹4500/mo)'}]}/></div>
                      <div><Lbl c="Hostel Subsidy (No.)"/><TSel value={emp.hostelChildren} onChange={setE('hostelChildren')} options={[{value:0,label:'None'},{value:1,label:'1 Child (₹6750/mo)'},{value:2,label:'2 Children (₹13500/mo)'}]}/></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                      <p className="text-[11px] font-black text-purple-600 uppercase tracking-widest mb-4">Deductions</p>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-purple-100">
                          <TToggle checked={emp.applyNPS} onChange={(v:boolean)=>setEmp((p:EmployeeData)=>({...p,applyNPS:v}))} label={`NPS (${emp.npsEmployee}% emp / ${emp.npsEmployer}% govt)`} size="sm"/>
                          <span className="text-xs font-black text-purple-700">{rs(s7.npsEmp+s7.npsEr)}/mo</span>
                        </div>
                        <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-purple-100">
                          <TToggle checked={emp.applyGSLI} onChange={(v:boolean)=>setEmp((p:EmployeeData)=>({...p,applyGSLI:v}))} label={`GSLI — Auto Level ${emp.payLevel}`} size="sm"/>
                          <span className="text-xs font-black text-purple-700">{rs(emp.applyGSLI?getGSLI(emp.payLevel):0)}/mo</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div><Lbl c="Prof. Tax (₹/mo)"/><TIn type="number" value={emp.professionalTax} onChange={setE('professionalTax')}/></div>
                          <div><Lbl c="LIC Deduction (₹/mo)"/><TIn type="number" value={emp.licDeduction} onChange={setE('licDeduction')}/></div>
                          <div><Lbl c="Society Deduction"/><TIn type="number" value={emp.societyDeduction} onChange={setE('societyDeduction')}/></div>
                        </div>
                        <div className="flex gap-3">
                          <TToggle checked={emp.applyPT} onChange={(v:boolean)=>setEmp((p:EmployeeData)=>({...p,applyPT:v}))} label="Prof. Tax" size="sm"/>
                          <TToggle checked={emp.applyLIC} onChange={(v:boolean)=>setEmp((p:EmployeeData)=>({...p,applyLIC:v}))} label="LIC" size="sm"/>
                          <TToggle checked={emp.applySociety} onChange={(v:boolean)=>setEmp((p:EmployeeData)=>({...p,applySociety:v}))} label="Society" size="sm"/>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                      <p className="text-[11px] font-black text-orange-600 uppercase tracking-widest mb-4">Tax & Investments</p>
                      <div className="mb-3 flex gap-3">
                        <TToggle checked={emp.applyIT} onChange={(v:boolean)=>setEmp((p:EmployeeData)=>({...p,applyIT:v}))} label="Auto TDS" size="sm"/>
                        <div className="flex gap-1 bg-white border border-orange-200 rounded-lg p-0.5">
                          {(['old','new'] as const).map(r=><button key={r} onClick={()=>setEmp((p:EmployeeData)=>({...p,taxRegime:r}))} className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${emp.taxRegime===r?'bg-orange-500 text-white shadow':'text-gray-500'}`}>{r==='old'?'Old Regime':'New Regime'}</button>)}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[['Annual PPF (₹)','annualPPF'],['Annual LIC (₹)','annualLIC'],['Mediclaim/80D (₹)','mediclaim'],['NPS Vol. 80CCD1B','npsVoluntary'],['HBA Principal (₹)','homeLoanPrincipal'],['HBA Interest (₹)','homeLoanInterest']].map(([l,f])=>(
                          <div key={f}><Lbl c={l}/><TIn type="number" value={(emp as any)[f]} onChange={setE(f as keyof EmployeeData)}/></div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl mb-5">
                    <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-4">Additional Income & 8th Pay</p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div><Lbl c="Additional Income 1 (Label)"/><TIn value={emp.additionalIncome1Label} onChange={setE('additionalIncome1Label')}/></div>
                      <div><Lbl c="Amount (₹/year)"/><TIn type="number" value={emp.additionalIncome1} onChange={setE('additionalIncome1')}/></div>
                      <div><Lbl c="Additional Income 2 (Label)"/><TIn value={emp.additionalIncome2Label} onChange={setE('additionalIncome2Label')}/></div>
                      <div><Lbl c="Amount (₹/year)"/><TIn type="number" value={emp.additionalIncome2} onChange={setE('additionalIncome2')}/></div>
                      <div><Lbl c="8th Pay Fitment Factor"/><TSel value={emp.fitmentFactor8th} onChange={(v:string)=>setEmp((p:EmployeeData)=>({...p,fitmentFactor8th:Number(v)}))} options={[1.86,1.92,2.00,2.05,2.10,2.57,3.00].map(v=>({value:v,label:`${v}x ${v===1.92?'(Expected)':v===2.57?'(= 7th CPC)':''}`}))}/></div>
                      <div><Lbl c="8th Pay Basic (Projected)"/><div className="px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg font-black text-orange-700">{rs(s7.basic8)}</div></div>
                      <div><Lbl c="Salary Month"/><TSel value={emp.salaryMonth} onChange={setE('salaryMonth')} options={MONTHS_FULL}/></div>
                      <div><Lbl c="Salary Year"/><TSel value={emp.salaryYear} onChange={setE('salaryYear')} options={YEARS}/></div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-3">Notes</p>
                    <textarea value={emp.notes} onChange={e=>setEmp((p:EmployeeData)=>({...p,notes:e.target.value}))} rows={2} placeholder="Any notes about this employee..." className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"/>
                  </div>
                  <NavRow onPrev={goPrev} onNext={goNext}/>
                </div>
              )}

              {/* ══════ FIXATION ══════ */}
              {tab==='fixation'&&(
                <div className="p-4 sm:p-5">
                  <SectionHead title="7th Pay Commission Fixation" subtitle={`${fullName} · 6th → 7th CPC | Fitment Factor: 2.57 | FR 22(I)(a)(1)`} icon={FileText} accent="#0891b2"/>
                  <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div><Lbl c="Band Pay (6th CPC)"/><select value={Object.entries({PB1:[5200,9299],PB2:[9300,15599],PB3:[15600,39100],PB4:[37400,67000]}).find(([,r])=>emp.bandPayOld>=r[0]&&emp.bandPayOld<=r[1])?.[0]||'PB2'} onChange={e=>{const defVals:any={PB1:5200,PB2:9300,PB3:15600,PB4:37400};setEmp((p:EmployeeData)=>({...p,bandPayOld:defVals[e.target.value]||9300}));}} className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm font-medium focus:outline-none mb-2"><option value="PB1">PB-1 (₹5200-20200)</option><option value="PB2">PB-2 (₹9300-34800)</option><option value="PB3">PB-3 (₹15600-39100)</option><option value="PB4">PB-4 (₹37400-67000)</option></select><Lbl c="Band Pay Amount (₹)"/><TIn type="number" value={emp.bandPayOld} onChange={setE('bandPayOld')}/></div>
                    <div><Lbl c="Grade Pay (6th CPC)"/><TSel value={emp.gradePayOld} onChange={(v:string)=>setEmp((p:EmployeeData)=>({...p,gradePayOld:Number(v)}))} options={[1800,1900,2000,2400,2800,4200,4600,4800,5400,6600,7600,8000,8700,8900,10000].map(v=>({value:v,label:`₹${v}`}))}/></div>
                    <div><Lbl c="Target Pay Level (7th)"/><TSel value={emp.payLevel} onChange={(v:string)=>applyLevel(Number(v))} options={Object.keys(PAY_MATRIX).map(l=>({value:Number(l),label:`Level ${l}`}))}/></div>
                  </div>
                  <div className="space-y-3 mb-7">
                    {[{n:1,lbl:'6th CPC Total Basic',desc:`Band Pay ${rs(emp.bandPayOld)} + Grade Pay ${rs(emp.gradePayOld)}`,val:fix.total6,hi:false,color:'#e0f2fe'},
                      {n:2,lbl:'Apply Fitment Factor × 2.57',desc:`${rs(fix.total6)} × 2.57 = Notional 7th Pay`,val:fix.tent,hi:false,color:'#ede9fe'},
                      {n:3,lbl:'Round Up to Next Cell in Matrix',desc:`Find value ≥ ${rs(fix.tent)} in Level ${fix.level} matrix`,val:fix.fixed,hi:true,color:'#d1fae5'},
                      {n:4,lbl:`Confirmed 7th CPC Basic Pay — Cell ${fix.step}`,desc:`Level ${fix.level} | Cell ${fix.step} | Next Increment: ${rs(nextStep(fix.fixed,fix.level))}`,val:fix.fixed,hi:true,color:'#a7f3d0'}].map(s=>(
                      <div key={s.n} className="flex items-center gap-5 p-4 rounded-xl border" style={{background:s.color,borderColor:s.hi?'#059669':'#e5e7eb'}}>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${s.hi?'bg-green-600 text-white':'bg-gray-200 text-gray-600'}`}>{s.n}</div>
                        <div className="flex-1"><p className={`font-bold text-sm ${s.hi?'text-green-900':'text-gray-700'}`}>{s.lbl}</p><p className="text-xs text-gray-500 mt-0.5">{s.desc}</p></div>
                        <div className={`text-xl font-black ${s.hi?'text-green-700':'text-gray-500'}`}>{rs(s.val)}</div>
                      </div>
                    ))}
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex justify-between items-center">
                      <div><p className="font-bold text-amber-900">Net Benefit on Fixation</p><p className="text-xs text-amber-700 mt-0.5">Increase in Basic Pay</p></div>
                      <div className="text-right"><p className="text-2xl font-black text-amber-700">+{rs(fix.fixed-fix.total6)}</p><p className="text-xs text-amber-600">{fix.total6>0?'+'+((fix.fixed-fix.total6)/fix.total6*100).toFixed(1)+'%':''} increase</p></div>
                    </div>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="text-xs w-full border-collapse min-w-[900px]"><thead><tr className="bg-gray-800 text-white">{['Level',...Array.from({length:10},(_,i)=>`Cell ${i+1}`)].map(h=><th key={h} className="px-2 py-2.5 text-left border-r border-gray-700">{h}</th>)}</tr></thead>
                    <tbody>{Object.entries(PAY_MATRIX).map(([lv,pays])=>(
                      <tr key={lv} className={`border-b border-gray-100 ${parseInt(lv)===emp.payLevel?'bg-green-50':''}`}>
                        <td className={`px-2 py-2 font-black ${parseInt(lv)===emp.payLevel?'text-green-700':'text-gray-400'}`}>L{lv}</td>
                        {pays.slice(0,10).map((p,i)=>(
                          <td key={i} onClick={()=>setEmp((e:EmployeeData)=>({...e,payLevel:parseInt(lv),basicPay7th:p}))} className={`px-2 py-2 font-mono cursor-pointer transition-all border-r border-gray-100 ${emp.basicPay7th===p&&parseInt(lv)===emp.payLevel?'bg-green-600 text-white font-bold':'text-gray-600 hover:text-green-600 hover:bg-green-50'}`}>{p.toLocaleString()}</td>
                        ))}
                      </tr>))}</tbody></table>
                  </div>
                  <NavRow onPrev={goPrev} onNext={goNext}/>
                </div>
              )}

              {/* ══════ MACP ══════ */}
              {tab==='macp'&&(
                <div className="p-4 sm:p-5">
                  <SectionHead title="MACP Progression Calculator" subtitle="Modified Assured Career Progression — Financial upgradation at 10, 20, 30 years" icon={Milestone} accent="#8b5cf6"/>
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl mb-6">
                    <p className="text-sm font-bold text-purple-800 mb-1">MACP Rule for Non-Teaching Staff:</p>
                    <p className="text-xs text-purple-600">If an employee is not promoted by regular DPC, they get automatic financial upgradation to next higher Pay Level after 10, 20, and 30 years of continuous regular service. The upgraded pay is fixed in the next level at the cell equal to or next higher than the current basic.</p>
                  </div>
                  <div className="mb-6 p-4 bg-white border border-gray-200 rounded-xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div><Lbl c="Starting Pay Level"/><TSel value={emp.payLevel} onChange={(v:string)=>applyLevel(Number(v))} options={Object.keys(PAY_MATRIX).map(l=>({value:Number(l),label:`Level ${l}`}))}/></div>
                      <div><Lbl c="Starting Basic Pay"/><TSel value={emp.basicPay7th} onChange={(v:string)=>setEmp((p:EmployeeData)=>({...p,basicPay7th:Number(v)}))} options={(PAY_MATRIX[emp.payLevel]||[]).map((v,i)=>({value:v,label:`Cell ${i+1} — ${rs(v)}`}))}/></div>
                      <div><Lbl c="Joining Date"/><TIn value={emp.dateOfJoining} onChange={setE('dateOfJoining')} placeholder="For tenure calculation"/></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-6 relative">
                    <div className="absolute top-16 left-[calc(33%-1rem)] right-[calc(33%-1rem)] h-1 bg-purple-200 z-0 hidden xl:block"/>
                    {[{y:10,t:'1st MACP',targetLv:Math.min(emp.payLevel+1,14)},{y:20,t:'2nd MACP',targetLv:Math.min(emp.payLevel+2,14)},{y:30,t:'3rd MACP',targetLv:Math.min(emp.payLevel+3,14)}].map(m=>{
                      const targetMat=PAY_MATRIX[m.targetLv]||[]; const targetBasic=targetMat.find(v=>v>=emp.basicPay7th)||targetMat[0]||0;
                      return (
                        <div key={m.y} className="bg-white border-2 border-purple-200 rounded-2xl p-5 text-center shadow-lg relative z-10">
                          <div className="w-14 h-14 bg-purple-600 text-white rounded-2xl flex flex-col items-center justify-center font-black mx-auto mb-4 shadow-lg"><span className="text-lg">{m.y}</span><span className="text-[9px] opacity-80">YRS</span></div>
                          <h3 className="font-black text-gray-800 mb-1">{m.t}</h3>
                          <p className="text-xs text-gray-500 mb-4">Level {emp.payLevel} → Level {m.targetLv}</p>
                          <div className="p-4 bg-purple-50 rounded-xl text-left space-y-2">
                            <div className="flex justify-between text-sm"><span className="text-gray-600">Target Level</span><span className="font-black text-purple-700">Level {m.targetLv}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-gray-600">Pay on MACP</span><span className="font-black text-purple-700">{rs(targetBasic)}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-gray-600">Increase</span><span className="font-black text-green-700">+{rs(targetBasic-emp.basicPay7th)}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-gray-600">% Hike</span><span className="font-black text-green-700">{emp.basicPay7th?'+'+((targetBasic-emp.basicPay7th)/emp.basicPay7th*100).toFixed(1)+'%':'—'}</span></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <NavRow onPrev={goPrev} onNext={goNext}/>
                </div>
              )}

              {/* ══════ MONTHLY SALARY ══════ */}
              {tab==='salary'&&(
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-5 gap-3">
                    <SectionHead title="Monthly Salary Breakdown" subtitle={`${fullName} · Level-${emp.payLevel} · 7th & 8th Pay`} icon={IndianRupee} accent="#059669"/>
                  </div>
                  <div className="flex items-center gap-3 mb-5 p-3 bg-cyan-50 border border-cyan-200 rounded-xl flex-wrap">
                    <div className="flex gap-3">
                      <div><Lbl c="Month"/><TSel value={emp.salaryMonth} onChange={setE('salaryMonth')} options={MONTHS_FULL}/></div>
                      <div><Lbl c="Year"/><TSel value={emp.salaryYear} onChange={setE('salaryYear')} options={YEARS}/></div>
                    </div>
                    <div className="flex-1"/>
                    <button onClick={()=>setShowSlip(true)} className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-bold hover:bg-cyan-700 shadow"><FileText size={14}/> View & Print Slip</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {[{title:'7th Pay',basic:s7.b,da:s7.da,daR:emp.daRate,hra:s7.hra,hraR:HRA_RATES[emp.hraCategory]*100,ta:s7.ta+s7.taDA,ma:s7.ma,wash:s7.wash,cea:s7.cea,hostel:s7.hostel,gross:s7.gross,npsEmp:s7.npsEmp,npsEr:s7.npsEr,gsli:s7.gsli,pt:s7.pt,lic:s7.lic,soc:s7.soc,it:s7.monthIT,td:s7.td,net:s7.net,col:'#059669'},
                     {title:'8th Pay (Projected)',basic:s7.basic8,da:0,daR:0,hra:pct(s7.basic8,HRA_RATES[emp.hraCategory]*100),hraR:HRA_RATES[emp.hraCategory]*100,ta:emp.transportAllowance,ma:emp.medicalAllowance,wash:0,cea:s7.cea,hostel:s7.hostel,gross:s7.basic8+pct(s7.basic8,HRA_RATES[emp.hraCategory]*100)+emp.transportAllowance+emp.medicalAllowance+s7.cea+s7.hostel,npsEmp:pct(s7.basic8,emp.npsEmployee),npsEr:pct(s7.basic8,emp.npsEmployer),gsli:s7.gsli,pt:s7.pt,lic:s7.lic,soc:s7.soc,it:0,td:pct(s7.basic8,emp.npsEmployee)+s7.gsli+s7.pt+s7.lic+s7.soc,net:s7.basic8+pct(s7.basic8,HRA_RATES[emp.hraCategory]*100)+emp.transportAllowance+emp.medicalAllowance+s7.cea+s7.hostel-pct(s7.basic8,emp.npsEmployee)-s7.gsli-s7.pt-s7.lic-s7.soc,col:'#d97706'}].map(p=>(
                      <div key={p.title} className="rounded-2xl overflow-hidden border border-gray-200">
                        <div className="px-4 py-3 font-black text-white text-sm" style={{background:p.col}}>{p.title}</div>
                        <div className="p-4 space-y-1 text-sm border-b border-gray-100">
                          <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Earnings</p>
                          {[['Basic Pay',p.basic,true],[`DA (${p.daR}%)`,p.da],[`HRA (${p.hraR}%)`,p.hra],[`Transport (+DA)`,p.ta],['Medical',p.ma],...(p.wash>0?[['Washing',p.wash]]:[] as any),...(p.cea>0?[['CEA',p.cea]]:[] as any),...(p.hostel>0?[['Hostel',p.hostel]]:[] as any)].map(([l,v,b]:any)=>
                            Number(v)>0&&<div key={l} className={`flex justify-between py-1 ${b?'font-bold border-b border-gray-100':''}`}><span className={b?'text-gray-800':'text-gray-500'}>{l}</span><span className="font-mono">{rs(v)}</span></div>
                          )}
                          <div className="flex justify-between py-1.5 font-black border-t border-gray-200 mt-1" style={{color:p.col}}>Gross<span className="text-xl">{rs(p.gross)}</span></div>
                        </div>
                        <div className="p-4 space-y-1 text-sm">
                          <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Deductions</p>
                          {[['NPS Employee',p.npsEmp],['NPS Employer (Info)',p.npsEr],['GSLI',p.gsli],['Prof.Tax',p.pt],['LIC',p.lic],['Income Tax',p.it]].map(([l,v]:any)=>
                            v>0&&<div key={l} className="flex justify-between py-0.5 text-red-600"><span>{l}</span><span className="font-mono">-{rs(v)}</span></div>
                          )}
                          <div className="flex justify-between py-1.5 font-black border-t border-gray-200 text-red-600">Deductions<span>{rs(p.td)}</span></div>
                          <div className="mt-2 p-3 rounded-xl text-center text-white font-black" style={{background:p.col}}>
                            <p className="text-[10px] opacity-80 uppercase mb-1">Net Take-Home</p>
                            <p className="text-2xl">{rs(p.net)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* NPS detail card */}
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                    <p className="text-[11px] font-black text-purple-600 uppercase tracking-widest mb-3">NPS Details (Monthly)</p>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      {[['Employee (10%)',s7.npsEmp,'#7c3aed'],['Employer/Govt (14%)',s7.npsEr,'#4f46e5'],['Total NPS',s7.npsEmp+s7.npsEr,'#2563eb'],['Annual NPS',(s7.npsEmp+s7.npsEr)*12,'#16a34a']].map(([l,v,c]:any)=>(
                        <div key={l} className="bg-white rounded-xl p-3 text-center border border-purple-100">
                          <p className="text-[10px] text-gray-400 mb-1">{l}</p>
                          <p className="font-black" style={{color:c}}>{rs(v)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <NavRow onPrev={goPrev} onNext={goNext}/>
                </div>
              )}

              {/* ══════ YEARLY SUMMARY ══════ */}
              {tab==='yearlysummary'&&(
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-5 gap-3">
                    <SectionHead title="Yearly Salary Summary" subtitle={`${fullName} · Auto-increment & DA · Editable deductions (yellow cells)`} icon={BarChart3} accent="#d97706"/>
                    <div className="flex items-center gap-2 mt-[-0.5rem] flex-wrap justify-end">
                      <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                        <span className="text-[10px] font-bold text-amber-700">FY</span>
                        <select value={yearlyFY} onChange={e=>setYearlyFY(e.target.value)} className="bg-transparent text-sm font-bold text-amber-900 focus:outline-none">{FY_YEARS.map(y=><option key={y}>{y}</option>)}</select>
                      </div>
                      <button onClick={()=>setManDed({})} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-500 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100"><RotateCcw size={11}/> Reset Ded.</button>
                      <button onClick={()=>downloadPDF(yearlyRef,`Yearly_${emp.name}_${yearlyFY}`,'l')} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 border border-gray-300"><Download size={12}/> PDF</button>
                      <button onClick={exportYearly} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-100"><TableProperties size={12}/> Excel</button>
                    </div>
                  </div>
                  <div ref={yearlyRef} className="overflow-x-auto rounded-xl border border-gray-200 bg-white -mx-2 sm:mx-0">
                    <div className="p-3 bg-amber-700 text-white text-center">
                      <p className="text-sm font-black uppercase">{sysConfig.collegeName}</p>
                      <p className="text-xs mt-0.5">{fullName} · {emp.designation} · FY {yearlyFY}</p>
                    </div>
                    <table className="text-[11px] w-full border-collapse min-w-[1200px]">
                      <thead>
                        <tr className="bg-amber-600 text-white">
                          {['Month','Basic','DA%','DA Amt','HRA','Transport','Medical','GROSS','NPS/PF','GSLI','Prof.Tax','I.Tax','Tot.Ded','NET PAY'].map(h=>(
                            <th key={h} className="px-2.5 py-3 text-center font-black whitespace-nowrap border-r border-amber-500/50">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {yearlyData.map((row,i)=>{
                          const setD=(f:string,v:number)=>setManDed(p=>({...p,[row.key]:{...(p[row.key]||{}),[f]:v}}));
                          const ec=(f:string,def:number)=>(
                            <td key={f} className="px-1 py-1 border-b border-r border-gray-200">
                              <input type="number" value={manDed[row.key]?.[f]??def} onChange={e=>setD(f,Number(e.target.value))}
                                className="w-16 px-1.5 py-1 bg-yellow-50 border border-yellow-300 rounded text-xs text-right font-medium focus:outline-none focus:ring-1 focus:ring-amber-400"/>
                            </td>
                          );
                          return (
                            <tr key={row.key} className={`${i%2===0?'bg-white':'bg-amber-50/20'} hover:bg-amber-50/40`}>
                              <td className="px-2.5 py-2 font-bold text-amber-700 text-center border-b border-r border-gray-200 whitespace-nowrap">{row.label}</td>
                              <td className="px-2.5 py-2 text-right border-b border-r border-gray-200">{fmt(row.basic)}</td>
                              <td className="px-2.5 py-2 text-center text-gray-400 border-b border-r border-gray-200">{row.daR}%</td>
                              <td className="px-2.5 py-2 text-right border-b border-r border-gray-200">{fmt(row.da)}</td>
                              <td className="px-2.5 py-2 text-right border-b border-r border-gray-200">{fmt(row.hra)}</td>
                              <td className="px-2.5 py-2 text-right border-b border-r border-gray-200">{fmt(row.transport)}</td>
                              <td className="px-2.5 py-2 text-right border-b border-r border-gray-200">{fmt(row.ma)}</td>
                              <td className="px-2.5 py-2 text-right border-b border-r border-gray-200 font-black text-green-700">{fmt(row.gross)}</td>
                              {ec('nps',row.nps)}{ec('gsli',row.gsli)}{ec('pt',row.pt)}{ec('itax',row.itax)}
                              <td className="px-2.5 py-2 text-right border-b border-r border-gray-200 font-bold text-red-500">{fmt(row.td)}</td>
                              <td className="px-2.5 py-2 text-right border-b border-gray-200 font-black text-gray-900">{fmt(row.net)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-amber-700 text-white font-black text-xs">
                          <td className="px-2.5 py-3 text-center">TOTAL</td>
                          {(['basic','','da','hra','transport','ma','gross','nps','gsli','pt','itax','td','net'] as const).map((k,i)=>(
                            <td key={i} className="px-2.5 py-3 text-right border-r border-amber-600/50">{k?fmt(yTot(k as any)):''}</td>
                          ))}
                        </tr>
                      </tfoot>
                    </table>
                    <p className="text-[10px] text-gray-400 p-2">✏ Yellow cells are editable — type to override auto-calculated values</p>
                  </div>
                  <NavRow onPrev={goPrev} onNext={goNext}/>
                </div>
              )}

              {/* ══════ ARREARS ══════ */}
              {tab==='arrears'&&(
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-5 gap-3">
                    <SectionHead title="Arrear Calculator" subtitle={`${fullName} · Salary Arrear & DA Arrear · Auto-increment & DA History`} icon={History} accent="#dc2626"/>
                    <div className="flex gap-2 mt-[-0.5rem]">
                      {arrSubTab==='salary'&&arrRows.length>0&&<button onClick={exportArrears} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-100"><TableProperties size={12}/> Excel</button>}
                    </div>
                  </div>
                  <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 w-fit">
                    {([['salary','Salary Arrear','#dc2626'],['da','DA Arrear','#d97706']] as const).map(([id,label,color])=>(
                      <button key={id} onClick={()=>setArrSubTab(id)} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-black transition-all ${arrSubTab===id?'bg-white shadow text-gray-900':'text-gray-500 hover:text-gray-700'}`}>
                        <span className="w-2 h-2 rounded-full" style={{background:arrSubTab===id?color:'#d1d5db'}}/>{label}
                      </button>
                    ))}
                  </div>

                  {arrSubTab==='salary'&&(
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <div><Lbl c="Start Month"/><input type="month" value={arrCfg.startMonth} onChange={e=>setArrCfg(p=>({...p,startMonth:e.target.value}))} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"/></div>
                        <div><Lbl c="End Month"/><input type="month" value={arrCfg.endMonth} onChange={e=>setArrCfg(p=>({...p,endMonth:e.target.value}))} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"/></div>
                        <div><Lbl c="Pay Level"/><TSel value={arrCfg.level} onChange={(v:string)=>setArrCfg(p=>({...p,level:Number(v)}))} options={Object.keys(PAY_MATRIX).map(l=>({value:Number(l),label:`Level ${l}`}))}/></div>
                        <div><Lbl c="Starting Basic Pay"/><TSel value={arrCfg.startBasic} onChange={(v:string)=>setArrCfg(p=>({...p,startBasic:Number(v)}))} options={(PAY_MATRIX[arrCfg.level]||[]).map((v,i)=>({value:v,label:`Cell ${i+1} — ${rs(v)}`}))}/></div>
                        <div><Lbl c="DA Already Paid %"/><TSel value={arrCfg.paidDA} onChange={(v:string)=>setArrCfg(p=>({...p,paidDA:Number(v)}))} options={[{value:0,label:'0% — Nothing Paid'},...Object.entries(DA_HISTORY).sort(([a],[b])=>b.localeCompare(a)).map(([k,v])=>({value:v,label:`${v}% (${k})`}))]}/></div>
                        <div><Lbl c="Increment Month"/><TSel value={arrCfg.incMonth} onChange={(v:any)=>setArrCfg(p=>({...p,incMonth:v}))} options={[{value:'07',label:'July'},{value:'01',label:'January'}]}/></div>
                      </div>
                      <button onClick={genArrears} className="flex items-center gap-3 px-7 py-3 bg-red-600 text-white rounded-xl font-black hover:bg-red-700 mb-6 shadow-lg shadow-red-100"><Zap size={15}/> Generate Arrear Statement</button>
                      {arrRows.length>0&&(
                        <>
                          <div className="grid grid-cols-4 gap-4 mb-5">
                            {[['Total Months',arrRows.length+' Months'],['Total Net Arrear',rs(arrRows.reduce((s,r)=>s+r.arrear,0))],['NPS on Arrear',rs(pct(arrRows.reduce((s,r)=>s+r.arrear,0),10))],['Net After NPS',rs(arrRows.reduce((s,r)=>s+r.arrear,0)-pct(arrRows.reduce((s,r)=>s+r.arrear,0),10))]].map(([l,v])=>(
                              <div key={l} className="bg-red-50 border border-red-200 rounded-xl p-3 text-center"><p className="text-[10px] text-red-400 mb-1">{l}</p><p className="font-black text-red-700 text-lg">{v}</p></div>
                            ))}
                          </div>
                          <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <table className="text-[10px] w-full border-collapse min-w-[1200px]">
                              <thead><tr className="bg-red-700 text-white">{['Month','Basic','Act.DA%','Paid.DA%','DA Act','DA Paid','HRA','TA Act','MA','Gross Due','Gross Paid','NPS Act','NPS Paid','PT','Net Due','Net Paid','ARREAR'].map(h=><th key={h} className="px-2 py-3 text-center font-black whitespace-nowrap border-r border-red-600/40">{h}</th>)}</tr></thead>
                              <tbody>
                                {arrRows.map((r,i)=>(
                                  <tr key={r.key} className={`${i%2===0?'bg-white':'bg-red-50/20'}`}>
                                    <td className="px-2 py-2 font-bold text-red-700 border-b border-r border-gray-200 text-center whitespace-nowrap">{r.key}</td>
                                    <td className="px-2 py-2 text-right border-b border-r border-gray-200">{fmt(r.basic)}</td>
                                    <td className="px-2 py-2 text-center text-green-700 font-bold border-b border-r border-gray-200">{r.actDA}%</td>
                                    <td className="px-2 py-2 text-center text-gray-400 border-b border-r border-gray-200">{r.pDA_r}%</td>
                                    <td className="px-2 py-2 text-right border-b border-r border-gray-200">{fmt(r.da)}</td>
                                    <td className="px-2 py-2 text-right text-gray-400 border-b border-r border-gray-200">{fmt(r.pDA)}</td>
                                    <td className="px-2 py-2 text-right border-b border-r border-gray-200">{fmt(r.hra)}</td>
                                    <td className="px-2 py-2 text-right border-b border-r border-gray-200">{fmt(r.ta)}</td>
                                    <td className="px-2 py-2 text-right border-b border-r border-gray-200">{fmt(r.ma)}</td>
                                    <td className="px-2 py-2 text-right font-bold text-green-700 border-b border-r border-gray-200">{fmt(r.gross)}</td>
                                    <td className="px-2 py-2 text-right text-gray-400 border-b border-r border-gray-200">{fmt(r.pGross)}</td>
                                    <td className="px-2 py-2 text-right text-red-500 border-b border-r border-gray-200">{fmt(r.nps)}</td>
                                    <td className="px-2 py-2 text-right text-gray-400 border-b border-r border-gray-200">{fmt(r.pNps)}</td>
                                    <td className="px-2 py-2 text-right text-red-400 border-b border-r border-gray-200">{fmt(r.pt)}</td>
                                    <td className="px-2 py-2 text-right font-black border-b border-r border-gray-200">{fmt(r.net)}</td>
                                    <td className="px-2 py-2 text-right text-gray-400 border-b border-r border-gray-200">{fmt(r.pNet)}</td>
                                    <td className={`px-2 py-2 text-right font-black border-b border-gray-200 ${r.arrear>0?'text-green-700 bg-green-50/50':'text-gray-400'}`}>{fmt(r.arrear)}</td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr className="bg-red-800 text-white font-black text-xs">
                                  <td className="px-2 py-3 text-center" colSpan={9}>TOTAL</td>
                                  <td className="px-2 py-3 text-right">{fmt(arrRows.reduce((s,r)=>s+r.gross,0))}</td>
                                  <td className="px-2 py-3 text-right opacity-60">{fmt(arrRows.reduce((s,r)=>s+r.pGross,0))}</td>
                                  <td className="px-2 py-3 text-right">{fmt(arrRows.reduce((s,r)=>s+r.nps,0))}</td>
                                  <td className="px-2 py-3 text-right opacity-60">{fmt(arrRows.reduce((s,r)=>s+r.pNps,0))}</td>
                                  <td className="px-2 py-3 text-right">{fmt(arrRows.reduce((s,r)=>s+r.pt,0))}</td>
                                  <td className="px-2 py-3 text-right">{fmt(arrRows.reduce((s,r)=>s+r.net,0))}</td>
                                  <td className="px-2 py-3 text-right opacity-60">{fmt(arrRows.reduce((s,r)=>s+r.pNet,0))}</td>
                                  <td className="px-2 py-3 text-right text-yellow-300 text-sm">{fmt(arrRows.reduce((s,r)=>s+r.arrear,0))}</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {arrSubTab==='da'&&(
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <div><Lbl c="Start Month"/><input type="month" value={daArrCfg.startMonth} onChange={e=>setDaArrCfg(p=>({...p,startMonth:e.target.value}))} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"/></div>
                        <div><Lbl c="End Month"/><input type="month" value={daArrCfg.endMonth} onChange={e=>setDaArrCfg(p=>({...p,endMonth:e.target.value}))} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"/></div>
                        <div><Lbl c="Pay Level"/><TSel value={daArrCfg.level} onChange={(v:string)=>setDaArrCfg(p=>({...p,level:Number(v)}))} options={Object.keys(PAY_MATRIX).map(l=>({value:Number(l),label:`Level ${l}`}))}/></div>
                        <div><Lbl c="Basic Pay"/><TSel value={daArrCfg.basic} onChange={(v:string)=>setDaArrCfg(p=>({...p,basic:Number(v)}))} options={(PAY_MATRIX[daArrCfg.level]||[]).map((v,i)=>({value:v,label:`Cell ${i+1} — ${rs(v)}`}))}/></div>
                        <div><Lbl c="Previously Paid DA %"/><TSel value={daArrCfg.oldDA} onChange={(v:string)=>setDaArrCfg(p=>({...p,oldDA:Number(v)}))} options={Object.entries(DA_HISTORY).sort(([a],[b])=>b.localeCompare(a)).map(([k,v])=>({value:v,label:`${v}% (${k})`}))}/></div>
                      </div>
                      <button onClick={genDaArrears} className="flex items-center gap-3 px-7 py-3 bg-amber-600 text-white rounded-xl font-black hover:bg-amber-700 mb-6 shadow-lg shadow-amber-100"><Zap size={15}/> Calculate DA Arrear</button>
                      {daArrRows.length>0&&(
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                          <table className="text-[10px] w-full border-collapse min-w-[1100px]">
                            <thead><tr className="bg-amber-700 text-white">{['Month','Basic','Paid DA%','Act.DA%','Old DA','New DA','DA Diff','Old TA+DA','New TA+DA','TA Diff','Gross Arr','Old NPS','New NPS','NPS Diff','NET DA ARREAR'].map(h=><th key={h} className="px-2 py-3 text-center font-black whitespace-nowrap border-r border-amber-600/40">{h}</th>)}</tr></thead>
                            <tbody>
                              {daArrRows.map((r,i)=>(
                                <tr key={r.key} className={`${i%2===0?'bg-white':'bg-amber-50/20'}`}>
                                  <td className="px-2 py-2 font-bold text-amber-700 border-b border-r border-gray-200">{r.key}</td>
                                  <td className="px-2 py-2 text-right border-b border-r border-gray-200">{fmt(r.basic)}</td>
                                  <td className="px-2 py-2 text-center text-gray-400 border-b border-r border-gray-200">{r.oldDA}%</td>
                                  <td className="px-2 py-2 text-center text-green-700 font-bold border-b border-r border-gray-200">{r.announcedDA}%</td>
                                  <td className="px-2 py-2 text-right text-gray-400 border-b border-r border-gray-200">{fmt(r.oldDAamt)}</td>
                                  <td className="px-2 py-2 text-right border-b border-r border-gray-200">{fmt(r.newDAamt)}</td>
                                  <td className="px-2 py-2 text-right font-bold border-b border-r border-gray-200">{fmt(r.daDiff)}</td>
                                  <td className="px-2 py-2 text-right text-gray-400 border-b border-r border-gray-200">{fmt(r.oldTaDA)}</td>
                                  <td className="px-2 py-2 text-right border-b border-r border-gray-200">{fmt(r.newTaDA)}</td>
                                  <td className="px-2 py-2 text-right border-b border-r border-gray-200">{fmt(r.taDiff)}</td>
                                  <td className="px-2 py-2 text-right font-bold text-green-700 border-b border-r border-gray-200">{fmt(r.grossDiff)}</td>
                                  <td className="px-2 py-2 text-right text-gray-400 border-b border-r border-gray-200">{fmt(r.oldNPS)}</td>
                                  <td className="px-2 py-2 text-right border-b border-r border-gray-200">{fmt(r.newNPS)}</td>
                                  <td className="px-2 py-2 text-right text-red-500 border-b border-r border-gray-200">{fmt(r.npsDiff)}</td>
                                  <td className={`px-2 py-2 text-right font-black border-b border-gray-200 ${r.netDiff>0?'bg-amber-50 text-amber-700':'text-gray-400'}`}>{fmt(r.netDiff)}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="bg-amber-800 text-white font-black text-xs">
                                <td className="px-2 py-3 text-center" colSpan={4}>TOTAL</td>
                                <td className="px-2 py-3 text-right opacity-60">{fmt(daArrRows.reduce((s,r)=>s+r.oldDAamt,0))}</td>
                                <td className="px-2 py-3 text-right">{fmt(daArrRows.reduce((s,r)=>s+r.newDAamt,0))}</td>
                                <td className="px-2 py-3 text-right text-yellow-300">{fmt(daArrRows.reduce((s,r)=>s+r.daDiff,0))}</td>
                                <td className="px-2 py-3 text-right opacity-60">{fmt(daArrRows.reduce((s,r)=>s+r.oldTaDA,0))}</td>
                                <td className="px-2 py-3 text-right">{fmt(daArrRows.reduce((s,r)=>s+r.newTaDA,0))}</td>
                                <td className="px-2 py-3 text-right text-yellow-300">{fmt(daArrRows.reduce((s,r)=>s+r.taDiff,0))}</td>
                                <td className="px-2 py-3 text-right text-green-300">{fmt(daArrRows.reduce((s,r)=>s+r.grossDiff,0))}</td>
                                <td className="px-2 py-3 text-right opacity-60">{fmt(daArrRows.reduce((s,r)=>s+r.oldNPS,0))}</td>
                                <td className="px-2 py-3 text-right">{fmt(daArrRows.reduce((s,r)=>s+r.newNPS,0))}</td>
                                <td className="px-2 py-3 text-right text-red-300">{fmt(daArrRows.reduce((s,r)=>s+r.npsDiff,0))}</td>
                                <td className="px-2 py-3 text-right text-yellow-300 text-sm">{fmt(daArrRows.reduce((s,r)=>s+r.netDiff,0))}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                  <NavRow onPrev={goPrev} onNext={goNext}/>
                </div>
              )}

              {/* ══════ SALARY BILL ══════ */}
              {tab==='salarybill'&&(
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-5 gap-3">
                    <SectionHead title="Salary Bill — Official Format" subtitle="Matching reference image format · Multi-employee · Old & New joiner support" icon={ClipboardList} accent="#4f46e5"/>
                    <div className="flex gap-2 mt-[-0.5rem]">
                      <button onClick={()=>setSbEmps([])  } className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-500 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100"><RotateCcw size={11}/> Clear</button>
                      <button onClick={()=>downloadPDF(billRef,`Salary_Bill_${sbCfg.month}_${sbCfg.year}`,'l')} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow"><Download size={14}/> Download PDF</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                    <div><Lbl c="Month"/><TSel value={sbCfg.month} onChange={v=>setSbCfg(p=>({...p,month:v}))} options={MONTHS_FULL}/></div>
                    <div><Lbl c="Year"/><TSel value={sbCfg.year} onChange={(v:string)=>setSbCfg(p=>({...p,year:v}))} options={YEARS}/></div>
                    <div><Lbl c="DA %"/><TSel value={sbCfg.da} onChange={(v:string)=>setSbCfg(p=>({...p,da:Number(v)}))} options={[65,61,57,53,50,46,42,38,34].map(d=>({value:d,label:d+'%'}))}/></div>
                    <div><Lbl c="HRA %"/><TSel value={sbCfg.hra} onChange={(v:string)=>setSbCfg(p=>({...p,hra:Number(v)}))} options={[{value:27,label:'27%'},{value:18,label:'18%'},{value:9,label:'9%'}]}/></div>
                    <div><Lbl c="Medical Allow. (₹)"/><TIn type="number" value={sbCfg.ma} onChange={(v:string)=>setSbCfg(p=>({...p,ma:Number(v)}))}/></div>
                    <div><Lbl c="Transport Allow. (₹)"/><TIn type="number" value={sbCfg.ta} onChange={(v:string)=>setSbCfg(p=>({...p,ta:Number(v)}))}/></div>
                  </div>

                  {/* Printable Bill */}
                  <div ref={billRef} style={{background:'#fff',color:'#000',fontFamily:'Arial,sans-serif',padding:'12px'}}>
                    <div style={{textAlign:'center',borderBottom:'2px solid #000',paddingBottom:'7px',marginBottom:'8px'}}>
                      {sysConfig.logoBase64&&<img src={sysConfig.logoBase64} alt="Logo" style={{height:'35px',objectFit:'contain',marginBottom:'3px'}}/>}
                      <div style={{fontSize:'14px',fontWeight:'900',textTransform:'uppercase',letterSpacing:'1px'}}>{sysConfig.collegeName}, DHANBAD</div>
                      <div style={{fontSize:'11px',fontWeight:'bold',marginTop:'3px'}}>SALARY BILL OF THE NON-TEACHING STAFF FOR THE MONTH OF {sbCfg.month.toUpperCase()} {sbCfg.year} (As per 7<sup>th</sup> pay scale)</div>
                    </div>
                    <table style={{width:'100%',borderCollapse:'collapse',fontSize:'9px'}}>
                      <thead><tr>{[{h:'SL. No',w:'3%'},{h:'N A M E',w:'13%'},{h:'Designation',w:'8%'},{h:'D.O.J',w:'6%'},{h:'Academic Level',w:'6%'},{h:'Basic Salary as on 01.01.2016',w:'8%'},{h:'Basic Salary as on 01.07.2024',w:'8%'},{h:`D.A. ${sbCfg.da}%`,w:'6%'},{h:`H.R.A ${sbCfg.hra}%`,w:'5%'},{h:'M.A.',w:'4%'},{h:`Transport Allow. (${sbCfg.ta}+)`,w:'6%'},{h:'P.F',w:'4%'},{h:'G.total',w:'6%'},{h:'Date of Increment',w:'7%'},{h:'Remarks',w:'4%'}].map(({h,w})=><th key={h} style={{border:'1px solid #000',padding:'4px 3px',textAlign:'center',fontSize:'8px',fontWeight:'bold',lineHeight:'1.2',width:w}}>{h}</th>)}</tr></thead>
                      <tbody>
                        {sbEmps.map((sb,i)=>{const c=sbCalc(sb);return(
                          <tr key={sb.id}><td style={{border:'1px solid #000',padding:'4px 3px',textAlign:'center'}}>{i+1}</td>
                          <td style={{border:'1px solid #000',padding:'4px',fontWeight:'500',textAlign:'left'}}>{sb.name}</td>
                          <td style={{border:'1px solid #000',padding:'4px 3px',textAlign:'center',fontSize:'8px'}}>{sb.designation}</td>
                          <td style={{border:'1px solid #000',padding:'4px 3px',textAlign:'center',whiteSpace:'nowrap'}}>{sb.doj}</td>
                          <td style={{border:'1px solid #000',padding:'4px 3px',textAlign:'center'}}>{sb.level}</td>
                          <td style={{border:'1px solid #000',padding:'4px 3px',textAlign:'right',color:sb.employeeType==='new'?'#888':'#000'}}>{sb.employeeType==='new'?'(New)':fmt(sb.basicOn2016)}</td>
                          <td style={{border:'1px solid #000',padding:'4px 3px',textAlign:'right',fontWeight:'bold'}}>{fmt(sb.basicOn2024)}</td>
                          <td style={{border:'1px solid #000',padding:'4px 3px',textAlign:'right'}}>{fmt(c.da)}</td>
                          <td style={{border:'1px solid #000',padding:'4px 3px',textAlign:'right'}}>{fmt(c.hra)}</td>
                          <td style={{border:'1px solid #000',padding:'4px 3px',textAlign:'right'}}>{fmt(c.ma)}</td>
                          <td style={{border:'1px solid #000',padding:'4px 3px',textAlign:'right'}}>{fmt(c.ta)}</td>
                          <td style={{border:'1px solid #000',padding:'4px 3px',textAlign:'right'}}>{fmt(c.pf)}</td>
                          <td style={{border:'1px solid #000',padding:'4px 3px',textAlign:'right',fontWeight:'bold'}}>{fmt(c.gross)}</td>
                          <td style={{border:'1px solid #000',padding:'4px 3px',textAlign:'center',whiteSpace:'nowrap'}}>{sb.incrementDate}</td>
                          <td style={{border:'1px solid #000',padding:'4px 3px'}}></td></tr>
                        );})}
                        <tr style={{background:'#f5f5f5',fontWeight:'bold'}}>
                          <td colSpan={5} style={{border:'1px solid #000',padding:'5px 3px',textAlign:'center',fontWeight:'900'}}>TOTAL</td>
                          <td style={{border:'1px solid #000',padding:'5px 3px',textAlign:'right'}}>{fmt(sbEmps.filter(e=>e.employeeType==='old').reduce((s,e)=>s+e.basicOn2016,0))}</td>
                          <td style={{border:'1px solid #000',padding:'5px 3px',textAlign:'right'}}>{fmt(sbEmps.reduce((s,e)=>s+e.basicOn2024,0))}</td>
                          {(['da','hra','ma','ta','pf','gross'] as const).map(k=><td key={k} style={{border:'1px solid #000',padding:'5px 3px',textAlign:'right'}}>{fmt(sbEmps.reduce((s,e)=>s+sbCalc(e)[k],0))}</td>)}
                          <td colSpan={2} style={{border:'1px solid #000'}}></td>
                        </tr>
                      </tbody>
                    </table>
                    <div style={{display:'flex',gap:'8px',border:'1px solid #000',padding:'5px 10px',marginTop:'4px',marginBottom:'14px',fontSize:'10px'}}>
                      <strong style={{whiteSpace:'nowrap'}}>Rupees</strong><span>{toWords(sbEmps.reduce((s,e)=>s+sbCalc(e).gross,0))}</span>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',textAlign:'center',marginTop:'30px',gap:'16px'}}>
                      {['Accountant','Bursar','Principal'].map(r=><div key={r} style={{borderTop:'1px solid #000',paddingTop:'5px',fontSize:'10px',fontWeight:'bold'}}><div>{r}</div><div>{sysConfig.collegeName}</div><div>Dhanbad</div></div>)}
                    </div>
                  </div>

                  {/* Employee rows editor */}
                  <div className="mt-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-black text-gray-500 uppercase tracking-wider">Employee Rows</p>
                      <div className="flex gap-2">
                        <button onClick={()=>setSbEmps(p=>[...p,{id:Date.now(),name:fullName,designation:emp.designation,doj:emp.dateOfJoining,level:`Level-${emp.payLevel}`,basicOn2016:Math.round(emp.basicPay7th/1.35),basicOn2024:emp.basicPay7th,incrementDate:emp.incrementMonth==='07'?'1-Jul-26':'1-Jan-26',employeeType:'old'}])} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow"><UserPlus size={12}/> Add Active Employee</button>
                        <button onClick={()=>setSbEmps(p=>[...p,{id:Date.now(),name:'',designation:'',doj:'',level:'Level-6',basicOn2016:0,basicOn2024:35400,incrementDate:'1-Jul-26',employeeType:'old'}])} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 border border-gray-300"><Plus size={12}/> Blank Row</button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {sbEmps.map((sb,i)=>(
                        <div key={sb.id} className="border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-2 bg-indigo-50 border-b border-indigo-100">
                            <span className="text-xs font-black text-indigo-700">#{i+1} — {sb.name||'Unnamed'}</span>
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1 p-0.5 bg-white rounded-lg border border-gray-200">
                                {(['old','new'] as const).map(t=><button key={t} onClick={()=>setSbEmps(p=>p.map((r,j)=>j===i?{...r,employeeType:t}:r))} className={`px-3 py-1 rounded-md text-[11px] font-bold ${sb.employeeType===t?(t==='old'?'bg-indigo-600 text-white':'bg-emerald-600 text-white'):'text-gray-500 hover:text-gray-700'}`}>{t==='old'?'Old Joiner':'New Joiner'}</button>)}
                              </div>
                              <button onClick={()=>setSbEmps(p=>p.filter((_,j)=>j!==i))} className="flex items-center gap-1 text-red-400 hover:text-red-600 text-xs font-bold"><Trash2 size={12}/></button>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-3 p-3">
                            <div className="col-span-2"><Lbl c="Full Name"/><input value={sb.name} onChange={e=>setSbEmps(p=>p.map((r,j)=>j===i?{...r,name:e.target.value}:r))} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm shadow-sm focus:outline-none"/></div>
                            <div><Lbl c="Designation"/><input value={sb.designation} onChange={e=>setSbEmps(p=>p.map((r,j)=>j===i?{...r,designation:e.target.value}:r))} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm shadow-sm focus:outline-none"/></div>
                            <div><Lbl c="D.O.J"/><input value={sb.doj} onChange={e=>setSbEmps(p=>p.map((r,j)=>j===i?{...r,doj:e.target.value}:r))} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm shadow-sm focus:outline-none"/></div>
                            <div><Lbl c="Level"/><select value={sb.level} onChange={e=>setSbEmps(p=>p.map((r,j)=>j===i?{...r,level:e.target.value}:r))} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm shadow-sm focus:outline-none">{[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(l=><option key={l} value={`Level-${l}`}>Level-{l}</option>)}</select></div>
                            <div><Lbl c={sb.employeeType==='old'?'Basic 01.01.2016':'Initial Basic'}/><input type="number" value={sb.basicOn2016} onChange={e=>setSbEmps(p=>p.map((r,j)=>j===i?{...r,basicOn2016:Number(e.target.value)}:r))} className={`w-full px-3 py-2 bg-white border rounded-lg text-sm shadow-sm focus:outline-none ${sb.employeeType==='old'?'border-indigo-300':'border-emerald-300'}`}/></div>
                            <div><Lbl c="Current Basic (01.07.2024)"/><select value={sb.basicOn2024} onChange={e=>setSbEmps(p=>p.map((r,j)=>j===i?{...r,basicOn2024:Number(e.target.value)}:r))} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm shadow-sm focus:outline-none">{(PAY_MATRIX[parseInt(sb.level.replace('Level-',''))||6]||[]).map(v=><option key={v} value={v}>{rs(v)}</option>)}</select></div>
                            <div><Lbl c="Date of Increment"/><input value={sb.incrementDate} onChange={e=>setSbEmps(p=>p.map((r,j)=>j===i?{...r,incrementDate:e.target.value}:r))} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm shadow-sm focus:outline-none"/></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <NavRow onPrev={goPrev} onNext={goNext}/>
                </div>
              )}

              {/* ══════ ANNUAL STATEMENT ══════ */}
              {tab==='annualstatement'&&(
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-5 gap-3">
                    <SectionHead title="Annual Salary Statement (Form 16 Est.)" subtitle={`${fullName} · PAN: ${emp.panNumber||'—'} · FY ${emp.financialYear}`} icon={FileSpreadsheet} accent="#0d9488"/>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-teal-50 border border-teal-200 rounded-xl px-3 py-2">
                        <span className="text-[10px] font-bold text-teal-700">FY</span>
                        <select value={emp.financialYear} onChange={e=>setEmp((p:EmployeeData)=>({...p,financialYear:e.target.value}))} className="bg-transparent text-sm font-bold text-teal-900 focus:outline-none">{FY_YEARS.map(y=><option key={y}>{y}</option>)}</select>
                      </div>
                      <button onClick={()=>downloadPDF(annualRef,`Annual_${emp.name}_${emp.financialYear}`,'l')} className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold shadow"><Download size={14}/> PDF</button>
                    </div>
                  </div>
                  <div ref={annualRef} className="bg-white border-2 border-gray-800 p-4 rounded-lg">
                    <div className="text-center border-b-2 border-black pb-3 mb-3">
                      <h2 className="text-sm font-black">{emp.college||sysConfig.collegeName}, {sysConfig.address?.split(',')[1]||'Dhanbad'}</h2>
                      <h3 className="text-[11px] font-bold mt-0.5">{emp.salutation} {emp.name} (PAN No. {emp.panNumber||'—'})</h3>
                      <h4 className="text-[11px] font-bold">Salary Statement for the FINANCIAL Year {emp.financialYear}</h4>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1 overflow-x-auto">
                        <table className="text-[9px] border-collapse w-full">
                          <thead><tr style={{background:'#1e3a5f',color:'#fff'}}>{['Month','Basic pay','D.A','HRA','Transport','M.A','DA ARR','ALLOW','Total','P.F','GSLI','Prof.Tax','I.TAX'].map(h=><th key={h} style={{border:'1px solid #666',padding:'3px 5px'}}>{h}</th>)}</tr></thead>
                          <tbody>
                            {annData.rows.map((row,i)=>(
                              <tr key={row.key} style={{background:i%2===0?'#fff':'#f9fafb'}}>
                                <td style={{border:'1px solid #ccc',padding:'2px 5px',fontWeight:'bold'}}>{row.label}</td>
                                {[row.basic,row.da,row.hra,row.ta,row.ma,0,(emp.ceaChildren*2250+emp.hostelChildren*6750),row.total,row.pf,row.gsli,row.pt,row.it].map((v,ci)=>(
                                  <td key={ci} style={{border:'1px solid #ccc',padding:'2px 5px',textAlign:'right',fontWeight:ci===7?'bold':'normal'}}>{fmt(v)}</td>
                                ))}
                              </tr>
                            ))}
                            <tr style={{background:'#e5e7eb',fontWeight:'900'}}>
                              <td style={{border:'1px solid #000',padding:'3px 5px',textAlign:'center'}}>TOTAL</td>
                              {[annData.tot.basic,annData.tot.da,annData.tot.hra,annData.tot.ta,annData.tot.ma,0,(emp.ceaChildren*2250+emp.hostelChildren*6750)*12,annData.tot.total,annData.tot.pf,annData.tot.gsli,annData.tot.pt,annData.tot.it].map((v,ci)=>(
                                <td key={ci} style={{border:'1px solid #000',padding:'3px 5px',textAlign:'right',fontWeight:'900'}}>{fmt(v)}</td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                        <div style={{display:'flex',justifyContent:'flex-end',marginTop:'5px'}}>
                          <div style={{border:'2px solid black',padding:'4px 12px',fontSize:'11px',fontWeight:'900'}}>Grand Total Rs. {fmt(annData.grossA)}</div>
                        </div>
                        {(emp.additionalIncome1>0||emp.additionalIncome2>0)&&(
                          <div style={{marginTop:'6px',border:'1px solid #ccc',padding:'4px 8px',fontSize:'10px'}}>
                            {emp.additionalIncome1>0&&<div style={{display:'flex',justifyContent:'space-between',marginBottom:'2px'}}><span>{emp.additionalIncome1Label}</span><span style={{fontWeight:'bold'}}>{fmt(emp.additionalIncome1)}</span></div>}
                            {emp.additionalIncome2>0&&<div style={{display:'flex',justifyContent:'space-between',marginBottom:'2px'}}><span>{emp.additionalIncome2Label}</span><span style={{fontWeight:'bold'}}>{fmt(emp.additionalIncome2)}</span></div>}
                            <div style={{display:'flex',justifyContent:'space-between',fontWeight:'900',borderTop:'1px solid #000',paddingTop:'3px',marginTop:'3px'}}><span>Grand Total (inc. Add. Income)</span><span>{fmt(annData.grossA)}</span></div>
                          </div>
                        )}
                      </div>
                      <div style={{width:'210px',flexShrink:0,fontSize:'9px'}}>
                        <table style={{borderCollapse:'collapse',width:'100%'}}>
                          <thead><tr style={{background:'#1e3a5f',color:'#fff'}}><th style={{border:'1px solid #666',padding:'4px 5px',textAlign:'left'}}>Computation</th><th style={{border:'1px solid #666',padding:'4px 5px',textAlign:'right'}}>Amount</th></tr></thead>
                          <tbody>
                            {[['Total Income Rounded',annData.grossA,true],['Standard Deduction',annData.std,false],['80D Mediclaim',annData.c80d,false],['Sec.80CCD 1B',annData.npsV,false],['Sec.16 (iii) PT',annData.sec16,false],['Sec.80 C (-)',annData.c80,false],['10(14) CEA Exempt',annData.ceaEx,false],['Intt.H.Loan Sec24(b)',emp.homeLoanInterest,false],['Taxable income',annData.txb,true]].map(([l,v,b]:any,i)=>(
                              <tr key={i} style={{background:b?'#fef9c3':i%2===0?'#fff':'#f9fafb'}}><td style={{border:'1px solid #ccc',padding:'2px 4px',fontWeight:b?'900':'normal'}}>{l}</td><td style={{border:'1px solid #ccc',padding:'2px 4px',textAlign:'right',fontWeight:b?'900':'normal'}}>{fmt(v)}</td></tr>
                            ))}
                            <tr style={{background:'#fee2e2',fontWeight:'900'}}><td style={{border:'1px solid #000',padding:'3px 4px',color:'#dc2626'}}>Total Tax</td><td style={{border:'1px solid #000',padding:'3px 4px',textAlign:'right',color:'#dc2626'}}>{fmt(annData.totalTax)}</td></tr>
                            <tr><td style={{border:'1px solid #ccc',padding:'2px 4px'}}>Tax Paid (TDS)</td><td style={{border:'1px solid #ccc',padding:'2px 4px',textAlign:'right'}}>{fmt(annData.tot.it)}</td></tr>
                            <tr style={{background:'#dcfce7',fontWeight:'900'}}><td style={{border:'1px solid #000',padding:'3px 4px',color:'#16a34a'}}>Refundable Amt.</td><td style={{border:'1px solid #000',padding:'3px 4px',textAlign:'right',color:annData.tot.it>=annData.totalTax?'#16a34a':'#dc2626'}}>({fmt(annData.tot.it-annData.totalTax)})</td></tr>
                          </tbody>
                        </table>
                        <div style={{marginTop:'6px',border:'2px solid black'}}>
                          <div style={{background:'#1e3a5f',color:'white',textAlign:'center',padding:'3px',fontWeight:'900',fontSize:'9px'}}>Deduction 80C</div>
                          {[['P.F.',annData.pfA],['Tuition Fee',emp.annualTuitionFee],['L.I.P',emp.annualLIC],['P.P.F.',emp.annualPPF],['Pri.Amt H.Loan',emp.homeLoanPrincipal],['GSLI',annData.tot.gsli]].map(([l,v])=>(
                            <div key={String(l)} style={{display:'flex',justifyContent:'space-between',padding:'2px 5px',borderBottom:'1px solid #e5e7eb',fontSize:'9px'}}><span>{l}</span><span style={{fontWeight:'bold'}}>{fmt(Number(v))}</span></div>
                          ))}
                          <div style={{display:'flex',justifyContent:'space-between',padding:'3px 5px',background:'#f1f5f9',fontWeight:'900',fontSize:'9px'}}><span>Total</span><span>{fmt(annData.c80)} <span style={{fontWeight:'normal',color:'#94a3b8'}}>upto 1.5L</span></span></div>
                        </div>
                        <div style={{marginTop:'4px',border:'2px solid black'}}>
                          <div style={{background:'#1e3a5f',color:'white',textAlign:'center',padding:'3px',fontWeight:'900',fontSize:'9px'}}>Deduction 80D</div>
                          {[['MEDICLAIM',emp.mediclaim,'upto ₹25,000/-'],['intt.H.Loan(-)',emp.homeLoanInterest,'upto ₹2,00,000/-'],['Sec.80CCD 1B(-)NPS',emp.npsVoluntary,'upto ₹50,000/-'],['Sec.16 (iii)',annData.tot.pt,'Prof. Tax']].map(([l,v,n])=>(
                            <div key={String(l)} style={{display:'flex',justifyContent:'space-between',padding:'2px 5px',borderBottom:'1px solid #e5e7eb',fontSize:'8px',gap:'4px'}}><span style={{flexShrink:0}}>{l}</span><span>{fmt(Number(v))} <span style={{color:'#94a3b8'}}>{n}</span></span></div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-8 mt-8 pt-5 border-t-2 border-gray-300 text-center text-xs">
                      {['ACCOUNTANT','BURSAR','PRINCIPAL'].map(r=><div key={r}><div className="h-8"/><div className="border-t border-gray-400 pt-1 font-bold">{r}</div><div className="text-[10px] text-gray-500">{emp.college||sysConfig.collegeName}</div></div>)}
                    </div>
                  </div>
                  <NavRow onPrev={goPrev} onNext={goNext}/>
                </div>
              )}

              {/* ══════ TAX COMPARISON ══════ */}
              {tab==='taxdetail'&&(()=>{
                const b=emp.basicPay7th, da=pct(b,emp.daRate), hra=pct(b,HRA_RATES[emp.hraCategory]*100);
                const grossAnn=(b+da+hra+emp.transportAllowance+emp.medicalAllowance+emp.ceaChildren*2250+emp.hostelChildren*6750+emp.additionalIncome1/12+emp.additionalIncome2/12)*12;
                const pf12=emp.applyNPS?pct(b+da,emp.npsEmployee)*12:0;
                const pt12=emp.applyPT?emp.professionalTax*12:0;
                const c80=Math.min(emp.homeLoanPrincipal+emp.annualPPF+emp.annualLIC+emp.annualTuitionFee+pf12,150000);
                const c80d=Math.min(emp.mediclaim,25000);
                const npsV=Math.min(emp.npsVoluntary,50000);
                const hl=emp.homeLoanInterest;
                const ceaEx=emp.ceaChildren*1200+emp.hostelChildren*3600;
                const npsEr12=emp.applyNPS?pct(b+da,emp.npsEmployer)*12:0;
                const txOld=Math.max(0,grossAnn-50000-c80-c80d-npsV-pt12-hl-ceaEx);
                const taxOld=calcTax(txOld,'old');
                const txNew=Math.max(0,grossAnn-75000-npsEr12);
                const taxNew=calcTax(txNew,'new');
                const better=taxNew<taxOld?'new':'old';
                return (
                  <div className="p-4 sm:p-5">
                    <SectionHead title="Income Tax — Both Regimes Side by Side" subtitle={`FY ${emp.financialYear} · 87A Rebate auto-applied · Annual comparison`} icon={Receipt} accent="#ea580c"/>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-6 flex items-start gap-3">
                      <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5"/>
                      <div>
                        <p className="text-sm font-bold text-green-800">Section 87A Rebate Applied</p>
                        <p className="text-xs text-green-700 mt-0.5">Old Regime: If taxable income ≤ ₹5L → Tax = ₹0. New Regime: If taxable income ≤ ₹7L → Tax = ₹0.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6 mb-6">
                      {[{t:'OLD REGIME',color:'#ea580c',txb:txOld,tax:taxOld,items:[['Gross Annual Income',grossAnn],['(-) Standard Deduction',50000],['(-) 80C (PF+LIC+PPF+HBA) max 1.5L',c80],['(-) 80D Mediclaim',c80d],['(-) NPS Vol 80CCD(1B)',npsV],['(-) 10(14) CEA Exemption',ceaEx],['(-) Prof.Tax 16(iii)',pt12],['(-) HBA Interest 24(b)',hl]],
                         slabs:[['Up to ₹2,50,000','Nil',0],['₹2,50,001 – ₹5,00,000','5%',Math.min(Math.max(0,txOld-250000),250000)*0.05],['₹5,00,001 – ₹10,00,000','20%',Math.min(Math.max(0,txOld-500000),500000)*0.20],['Above ₹10,00,000','30%',Math.max(0,txOld-1000000)*0.30]]},
                       {t:'NEW REGIME',color:'#2563eb',txb:txNew,tax:taxNew,items:[['Gross Annual Income',grossAnn],['(-) Standard Deduction (₹75,000)',75000],['(-) NPS Employer 80CCD(2) 14%',npsEr12]],
                        slabs:[['Up to ₹3,00,000','Nil',0],['₹3,00,001 – ₹7,00,000','5%',Math.min(Math.max(0,txNew-300000),400000)*0.05],['₹7,00,001 – ₹10,00,000','10%',Math.min(Math.max(0,txNew-700000),300000)*0.10],['₹10,00,001 – ₹12,00,000','15%',Math.min(Math.max(0,txNew-1000000),200000)*0.15],['₹12,00,001 – ₹15,00,000','20%',Math.min(Math.max(0,txNew-1200000),300000)*0.20],['Above ₹15,00,000','30%',Math.max(0,txNew-1500000)*0.30]]}
                      ].map(panel=>(
                        <div key={panel.t} className="rounded-2xl border-2 overflow-hidden" style={{borderColor:panel.color+'44'}}>
                          <div className="px-4 py-3 text-white font-black text-sm text-center" style={{background:panel.color}}>{panel.t} {better===panel.t.toLowerCase().split(' ')[0]&&<span className="text-[10px] ml-2 bg-white/20 px-2 py-0.5 rounded-full">✓ Recommended</span>}</div>
                          <div className="p-4 space-y-1.5 border-b" style={{borderColor:panel.color+'22',background:panel.color+'05'}}>
                            {panel.items.map(([l,v]:any)=>(
                              <div key={l} className="flex justify-between text-xs"><span className={l.includes('(-)')?'text-red-500':'text-gray-700 font-bold'}>{l}</span><span className={`font-mono font-bold ${l.includes('(-)')?'text-red-500':''}`}>{l.includes('(-)')?'-':''}{rs(v)}</span></div>
                            ))}
                            <div className="flex justify-between pt-2 border-t font-black text-sm" style={{borderColor:panel.color+'33'}}><span>Taxable Income</span><span style={{color:panel.color}}>{rs(panel.txb)}</span></div>
                          </div>
                          <div className="p-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Tax Slabs</p>
                            {panel.slabs.map(([r,rt,v]:any)=>(
                              <div key={r} className="flex justify-between text-[10px] py-0.5 border-b border-gray-50"><span className="text-gray-500">{r}</span><span className="text-gray-400 mx-2">{rt}</span><span className="font-mono">{rs(v)}</span></div>
                            ))}
                          </div>
                          <div className="p-4 text-center" style={{background:panel.color}}>
                            <p className="text-[10px] text-white/70 font-bold uppercase mb-1">Total Tax (incl. 4% Cess)</p>
                            <p className="text-2xl font-black text-white">{rs(panel.tax)}</p>
                            {panel.tax===0&&<p className="text-[10px] mt-1 text-white/90 font-bold">★ 87A REBATE — TAX NIL ★</p>}
                          </div>
                        </div>
                      ))}
                      <div className="rounded-2xl border-2 overflow-hidden" style={{borderColor:better==='new'?'#2563eb44':'#ea580c44'}}>
                        <div className={`px-4 py-3 text-white font-black text-sm text-center ${better==='new'?'bg-blue-600':'bg-orange-600'}`}>RECOMMENDATION</div>
                        <div className="p-5 space-y-4">
                          <div className="text-center p-4 rounded-xl" style={{background:better==='new'?'#eff6ff':'#fff7ed'}}>
                            <p className="text-xs text-gray-500 mb-1">{better==='new'?'New':'Old'} Regime saves you</p>
                            <p className="text-3xl font-black" style={{color:better==='new'?'#2563eb':'#ea580c'}}>{rs(Math.abs(taxOld-taxNew))}</p>
                            <p className="text-xs text-gray-400 mt-1">per year in taxes</p>
                          </div>
                          {[['Old Regime Tax',rs(taxOld),'#ea580c'],['New Regime Tax',rs(taxNew),'#2563eb'],['Monthly TDS (Old)',rs(Math.round(taxOld/12)),'#ea580c'],['Monthly TDS (New)',rs(Math.round(taxNew/12)),'#2563eb']].map(([l,v,c]:any)=>(
                            <div key={l} className="flex justify-between text-sm py-1.5 border-b border-gray-100"><span className="text-gray-600">{l}</span><span className="font-black" style={{color:c}}>{v}</span></div>
                          ))}
                          <div className="p-3 rounded-xl text-center font-black text-white text-sm mt-2" style={{background:better==='new'?'#2563eb':'#ea580c'}}>
                            ✓ Choose {better==='new'?'New':'Old'} Regime
                          </div>
                        </div>
                      </div>
                    </div>
                    <NavRow onPrev={goPrev} onNext={goNext}/>
                  </div>
                );
              })()}

              {/* ══════ RETIREMENT ══════ */}
              {tab==='retirement'&&(()=>{

                // ── Universal date parser: DD.MM.YYYY / DD/MM/YYYY / DD-MM-YYYY / YYYY-MM-DD ──
                const parseDate = (d: string): Date|null => {
                  if(!d||!d.trim()) return null;
                  // Detect separator
                  const sep = d.includes('-') ? '-' : d.includes('.') ? '.' : d.includes('/') ? '/' : null;
                  if(!sep) return null;
                  const p = d.split(sep);
                  if(p.length !== 3) return null;
                  // YYYY-MM-DD  vs  DD-MM-YYYY
                  const [a,b,c] = p;
                  let yr: number, mo: number, dy: number;
                  if(a.length===4){ yr=parseInt(a); mo=parseInt(b); dy=parseInt(c); }
                  else            { dy=parseInt(a); mo=parseInt(b); yr=parseInt(c); }
                  if(isNaN(yr)||isNaN(mo)||isNaN(dy)) return null;
                  const dt = new Date(yr, mo-1, dy);
                  if(isNaN(dt.getTime())) return null;
                  return dt;
                };

                const today    = new Date();
                const curYear  = today.getFullYear();

                // ── DOB-based retirement (Govt superannuation = 60 yrs) ──
                const dobDate  = parseDate(emp.dateOfBirth);
                const dojDate  = parseDate(emp.dateOfJoining);

                // Age as of today
                const ageYears = dobDate
                  ? Math.floor((today.getTime()-dobDate.getTime())/(1000*60*60*24*365.25))
                  : null;

                // Retirement date = DOB + 60 years
                const retDate  = dobDate ? new Date(dobDate.getFullYear()+60, dobDate.getMonth(), dobDate.getDate()) : null;
                const retYear  = retDate ? retDate.getFullYear() : curYear + 30;

                // Years served from DOJ
                const yearsServedSoFar = dojDate
                  ? Math.max(0, Math.floor((today.getTime()-dojDate.getTime())/(1000*60*60*24*365.25)))
                  : 0;

                // Years remaining till retirement (from today)
                const yearsRemaining = Math.max(0, retYear - curYear);

                // Total qualifying service = DOJ to Retirement date
                const totalQualifyingYrs = dojDate && retDate
                  ? Math.min(40, Math.max(0, Math.floor((retDate.getTime()-dojDate.getTime())/(1000*60*60*24*365.25))))
                  : emp.serviceYears;

                // ── Build Full Increment Trail with MACP ────────────────────
                interface TrailRow {
                  year:number; basic:number; level:number;
                  isMacp:boolean; macpNote:string; isRetirement:boolean; isCurrent:boolean;
                }
                const buildTrail = (startBasic:number, startLevel:number, startYrsServed:number, totalYrs:number): TrailRow[] => {
                  const trail: TrailRow[] = [];
                  let basic = startBasic, level = startLevel;
                  for(let i=0; i<=Math.min(totalYrs,42); i++){
                    const yr = curYear + i;
                    const svcYr = startYrsServed + i;
                    // MACP at every 10-year mark of service
                    const isMacp = i>0 && svcYr>0 && svcYr%10===0 && level<14;
                    let macpNote='', didMacp=false;
                    if(isMacp){
                      level = Math.min(level+1, 14);
                      const newMat = PAY_MATRIX[level]||[];
                      basic = newMat.find(v=>v>=basic)||newMat[newMat.length-1]||basic;
                      macpNote = `MACP → Level ${level}`;
                      didMacp = true;
                    }
                    trail.push({year:yr, basic, level, isMacp:didMacp, macpNote, isRetirement:i===totalYrs, isCurrent:i===0});
                    basic = nextStep(basic, level);
                  }
                  return trail;
                };

                // PROJECTION TRAIL: from current basic, remaining years
                const projTrail  = buildTrail(emp.basicPay7th, emp.payLevel, yearsServedSoFar, yearsRemaining);
                const projRetRow = projTrail[projTrail.length-1]||projTrail[0];
                const projBasic  = projRetRow.basic;
                const projLevel  = projRetRow.level;

                // ── Actual Retirement State ─────────────────────────────────
                // For Tab 2: employee is retiring NOW — use current basic
                const actualLastBasic = emp.basicPay7th;
                const actualDA        = emp.daRate;
                const actualGratuity  = Math.min(
                  ((actualLastBasic+pct(actualLastBasic,actualDA))*15*Math.min(totalQualifyingYrs,33))/26,
                  2000000
                );
                const actualLeaveEnc  = ((actualLastBasic+pct(actualLastBasic,actualDA))*emp.earnedLeaves)/30;
                const actualNPS       = pct(actualLastBasic+pct(actualLastBasic,actualDA),24);

                // PROJECTION values
                const projDA       = emp.daRate;
                const projGratuity = Math.min(
                  ((projBasic+pct(projBasic,projDA))*15*Math.min(totalQualifyingYrs,33))/26,
                  2000000
                );
                const projLeaveEnc = ((projBasic+pct(projBasic,projDA))*emp.earnedLeaves)/30;
                const projNPS      = pct(projBasic+pct(projBasic,projDA),24);

                const fmtDate = (d:Date|null) => d ? d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—';

                return (
                <div className="p-4 sm:p-5">
                  <SectionHead title="Retirement & Gratuity Benefits" subtitle={`${fullName} · DOB-based calculation · Superannuation age: 60 years`} icon={Award} accent="#eab308"/>

                  {/* ── Missing fields warning ── */}
                  {(!emp.dateOfBirth || !emp.dateOfJoining) && (
                    <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                      <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5"/>
                      <div className="text-sm">
                        <p className="font-black text-red-700">Missing Fields for Accurate Calculation</p>
                        <p className="text-red-600 text-xs mt-0.5">
                          {!emp.dateOfBirth && <span>• <strong>Date of Birth</strong> not set (needed for retirement year) </span>}
                          {!emp.dateOfJoining && <span>• <strong>Date of Joining</strong> not set (needed for qualifying service) </span>}
                          — Go to <strong>Edit Profile</strong> tab and fill these fields.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ── Key Date Summary Strip ── */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                    {[
                      {l:'Date of Birth',       v:emp.dateOfBirth||'Not set',   col:'#7c3aed', warn:!emp.dateOfBirth},
                      {l:'Date of Joining',      v:emp.dateOfJoining||'Not set', col:'#2563eb', warn:!emp.dateOfJoining},
                      {l:'Current Age',          v:ageYears!=null?`${ageYears} yrs`:'Set DOB',  col:'#0891b2', warn:ageYears==null},
                      {l:'Retirement Date (est)',v:fmtDate(retDate),             col:'#d97706', warn:!retDate},
                    ].map(c=>(
                      <div key={c.l} className={`p-3 rounded-xl border ${c.warn?'bg-red-50 border-red-200':'bg-white border-gray-200'}`}>
                        <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">{c.l}</p>
                        <p className="text-sm font-black" style={{color:c.warn?'#dc2626':c.col}}>{c.v}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {[
                      {l:'Years Served So Far', v:`${yearsServedSoFar} years`,     col:'#16a34a'},
                      {l:'Years Remaining',      v:`${yearsRemaining} years`,       col:'#d97706'},
                      {l:'Retirement Year',      v:String(retYear),                col:'#ea580c'},
                      {l:'Qualifying Service',   v:`${totalQualifyingYrs} years`,  col:'#7c3aed'},
                    ].map(c=>(
                      <div key={c.l} className="p-3 rounded-xl border bg-white border-gray-200">
                        <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">{c.l}</p>
                        <p className="text-lg font-black" style={{color:c.col}}>{c.v}</p>
                      </div>
                    ))}
                  </div>

                  {/* ── TWO TABS ── */}
                  <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 w-fit">
                    {([
                      ['projection', '📈 Future Projection', 'See salary & benefits at retirement (years ahead)'],
                      ['actual',     '✅ Actual Retirement Now', 'Calculate final benefits for employee retiring today'],
                    ] as const).map(([id,label,sub])=>(
                      <button key={id} onClick={()=>setRetirementTab(id)}
                        className={`flex flex-col items-start px-5 py-2.5 rounded-lg transition-all ${retirementTab===id?'bg-white shadow text-gray-900':'text-gray-500 hover:text-gray-700'}`}>
                        <span className="text-sm font-black">{label}</span>
                        <span className="text-[10px] text-gray-400 mt-0.5">{sub}</span>
                      </button>
                    ))}
                  </div>

                  {/* ════ TAB 1: FUTURE PROJECTION ════ */}
                  {retirementTab==='projection'&&(
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left: Inputs */}
                        <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-4">
                          <h3 className="font-black text-sm text-amber-800 flex items-center gap-2 pb-2 border-b border-amber-200">
                            <Settings size={14}/> Projection Parameters
                          </h3>
                          <div>
                            <Lbl c="DA Rate at Retirement (Projected %)"/>
                            <TSel value={emp.daRate} onChange={(v:string)=>setEmp((p:EmployeeData)=>({...p,daRate:Number(v)}))}
                              options={[
                                {value:55,label:'55% — Jan 2025 (Confirmed)'},
                                {value:58,label:'58% — Jul 2025 (Projected)'},
                                {value:61,label:'61% — Jan 2026 (Projected)'},
                                {value:65,label:'65%'},{value:70,label:'70%'},{value:75,label:'75%'},{value:80,label:'80%'},
                              ]}/>
                          </div>
                          <div>
                            <Lbl c="Earned Leaves at Retirement (Max 300)"/>
                            <TIn type="number" value={emp.earnedLeaves}
                              onChange={(v:string)=>setEmp((p:EmployeeData)=>({...p,earnedLeaves:Math.min(Number(v)||0,300)}))}/>
                          </div>

                          {/* Auto-calculated projected basic */}
                          <div className="p-4 bg-white border-2 border-amber-400 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                              <Zap size={14} className="text-amber-600"/>
                              <p className="text-[11px] font-black text-amber-700 uppercase">Projected Last Basic Pay</p>
                            </div>
                            <p className="text-3xl font-black text-amber-900">{rs(projBasic)}</p>
                            <div className="mt-2 space-y-1 text-[10px] text-amber-700">
                              <div className="flex justify-between"><span>Current Basic:</span><span className="font-bold">{rs(emp.basicPay7th)}</span></div>
                              <div className="flex justify-between"><span>Increments Applied:</span><span className="font-bold">{yearsRemaining} annual</span></div>
                              <div className="flex justify-between"><span>MACP Upgrades:</span>
                                <span className="font-bold">{projTrail.filter(r=>r.isMacp).length} times
                                  {projTrail.filter(r=>r.isMacp).length>0 && ` (Level ${emp.payLevel}→${projLevel})`}
                                </span>
                              </div>
                              <div className="flex justify-between"><span>Retirement Year:</span><span className="font-bold">{retYear}</span></div>
                              <div className="flex justify-between pt-1 border-t border-amber-200 font-black text-amber-900">
                                <span>Basic + DA ({projDA}%):</span><span>{rs(projBasic+pct(projBasic,projDA))}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right: Projected Benefits */}
                        <div className="space-y-3">
                          {[
                            {t:'Projected Gratuity',       icon:Award,       col:'#d97706',
                             val:projGratuity,
                             note:`(${rs(projBasic)}+${rs(pct(projBasic,projDA))}) × 15/26 × ${Math.min(totalQualifyingYrs,33)} yrs`,
                             cap:projGratuity>=2000000?'⚠ Capped at ₹20L':'Within ₹20L cap'},
                            {t:'Projected Leave Encashment',icon:BookOpen,    col:'#16a34a',
                             val:projLeaveEnc,
                             note:`(Basic+DA) × ${emp.earnedLeaves} days / 30`,
                             cap:'Max 300 days EL'},
                            {t:'Monthly NPS (at Retirement)',icon:TrendingUp, col:'#7c3aed',
                             val:projNPS,
                             note:`24% of (${rs(projBasic)}+${rs(pct(projBasic,projDA))})`,
                             cap:`Annual: ${rs(projNPS*12)}`},
                          ].map(item=>(
                            <div key={item.t} className="p-4 rounded-xl border-2 flex items-start gap-4"
                              style={{background:item.col+'08',borderColor:item.col+'33'}}>
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{background:item.col+'18'}}>
                                <item.icon size={20} style={{color:item.col}}/>
                              </div>
                              <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-wider" style={{color:item.col}}>{item.t}</p>
                                <p className="text-xl font-black text-gray-900 mt-0.5">{rs(Math.round(item.val))}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{item.note}</p>
                              </div>
                              <span className="text-[10px] font-bold text-gray-400 shrink-0">{item.cap}</span>
                            </div>
                          ))}
                          {/* NPS Corpus */}
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                            <p className="text-[10px] font-black text-blue-700 uppercase mb-2">NPS Corpus at Retirement ({retYear})</p>
                            <div className="grid grid-cols-2 gap-2">
                              {[6,8,10,12].map(rate=>{
                                const r=rate/12/100, n=yearsRemaining*12;
                                const corpus = n>0 ? projNPS*(Math.pow(1+r,n)-1)/r*(1+r) : projNPS*n;
                                return (
                                  <div key={rate} className="bg-white rounded-lg p-2.5 border border-blue-100 text-center">
                                    <p className="text-[9px] text-gray-400">{rate}% p.a.</p>
                                    <p className="font-black text-blue-700 text-sm">{rs(Math.round(corpus/1000)*1000)}</p>
                                    <p className="text-[9px] text-gray-400">Lumpsum 40%: {rs(Math.round(corpus*0.4/1000)*1000)}</p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Salary Progression Trail */}
                      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-5 py-3 bg-amber-600 text-white flex items-center justify-between">
                          <p className="text-sm font-black flex items-center gap-2">
                            <Milestone size={15}/> Year-wise Salary Progression to Retirement
                          </p>
                          <span className="text-[11px] bg-amber-500 px-2.5 py-1 rounded-full font-bold">
                            {rs(emp.basicPay7th)} → {rs(projBasic)} · Level {emp.payLevel}→{projLevel} · {yearsRemaining} yrs
                          </span>
                        </div>
                        <div className="overflow-x-auto max-h-[480px]">
                          <table className="w-full text-xs border-collapse min-w-[800px]">
                            <thead className="sticky top-0 z-10">
                              <tr className="bg-amber-50 border-b-2 border-amber-200">
                                {['Year','Service Yrs','Level','Basic Pay','Increment / Event','DA Amt','HRA','Est. Gross','Status'].map(h=>(
                                  <th key={h} className="px-3 py-2.5 text-center font-black text-gray-600 text-[10px] uppercase tracking-wider whitespace-nowrap">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {projTrail.map((row,idx)=>{
                                const daA = pct(row.basic, projDA);
                                const hrA = pct(row.basic, HRA_RATES[emp.hraCategory]*100);
                                const gr  = row.basic+daA+hrA+emp.transportAllowance+emp.medicalAllowance;
                                const prev= idx>0 ? projTrail[idx-1] : null;
                                const inc = prev && !row.isMacp ? row.basic - prev.basic : 0;
                                const svc = yearsServedSoFar + idx;
                                return (
                                  <tr key={row.year} className={
                                    row.isRetirement ? 'bg-amber-100 border-y-2 border-amber-500 font-black' :
                                    row.isMacp       ? 'bg-purple-50 border border-purple-200' :
                                    row.isCurrent    ? 'bg-green-50 border border-green-200' :
                                    idx%2===0        ? 'bg-white' : 'bg-gray-50/40'
                                  }>
                                    <td className="px-3 py-2 text-center font-bold whitespace-nowrap"
                                      style={{color:row.isRetirement?'#d97706':row.isMacp?'#7c3aed':row.isCurrent?'#16a34a':'#6b7280'}}>
                                      {row.year}
                                    </td>
                                    <td className="px-3 py-2 text-center text-gray-400 text-[10px]">{svc} yr</td>
                                    <td className="px-3 py-2 text-center">
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                                        style={{background:row.isMacp?'#f3e8ff':'#eff6ff',color:row.isMacp?'#7c3aed':'#2563eb'}}>
                                        L{row.level}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 text-right font-mono font-bold">{rs(row.basic)}</td>
                                    <td className="px-3 py-2 text-center">
                                      {row.isMacp
                                        ? <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">⬆ {row.macpNote}</span>
                                        : inc>0
                                          ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700">+{rs(inc)}</span>
                                          : <span className="text-[10px] text-gray-300">—</span>}
                                    </td>
                                    <td className="px-3 py-2 text-right font-mono text-purple-600">{rs(daA)}</td>
                                    <td className="px-3 py-2 text-right font-mono text-blue-600">{rs(hrA)}</td>
                                    <td className="px-3 py-2 text-right font-mono text-green-700 font-bold">{rs(gr)}</td>
                                    <td className="px-3 py-2 text-center whitespace-nowrap">
                                      {row.isRetirement
                                        ? <span className="text-[10px] font-black px-2 py-1 rounded-full bg-amber-500 text-white">🎓 RETIRE</span>
                                        : row.isMacp
                                        ? <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500 text-white">MACP</span>
                                        : row.isCurrent
                                        ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">← Now</span>
                                        : <span className="text-[10px] text-gray-400">+{idx} yr</span>}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ════ TAB 2: ACTUAL RETIREMENT NOW ════ */}
                  {retirementTab==='actual'&&(
                    <div className="space-y-6">
                      {/* Header notice */}
                      <div className="p-4 bg-green-50 border border-green-300 rounded-xl flex items-start gap-3">
                        <CheckCircle2 size={18} className="text-green-600 shrink-0 mt-0.5"/>
                        <div>
                          <p className="font-black text-green-800 text-sm">Actual Retirement Calculation</p>
                          <p className="text-xs text-green-700 mt-0.5">
                            Using <strong>current basic pay</strong> ({rs(actualLastBasic)}) as the last drawn salary.
                            All figures are final/payable amounts based on data entered in Profile.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left: Actual Parameters */}
                        <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-4">
                          <h3 className="font-black text-sm text-gray-700 flex items-center gap-2 pb-2 border-b">
                            <Settings size={14}/> Retirement Parameters (Edit if Needed)
                          </h3>

                          <div>
                            <Lbl c="Last Drawn Basic Pay (₹)"/>
                            <TIn type="number" value={emp.basicPay7th}
                              onChange={(v:string)=>setEmp((p:EmployeeData)=>({...p,basicPay7th:Number(v)||0}))}/>
                            <p className="text-[9px] text-gray-400 mt-1">Level {emp.payLevel} — auto from Profile</p>
                          </div>

                          <div>
                            <Lbl c="DA Rate at Retirement (%)"/>
                            <TSel value={emp.daRate} onChange={(v:string)=>setEmp((p:EmployeeData)=>({...p,daRate:Number(v)}))}
                              options={[
                                {value:55,label:'55% (Jan 2025 — Confirmed)'},
                                {value:58,label:'58% (Jul 2025 — Projected)'},
                                {value:61,label:'61% (Jan 2026 — Projected)'},
                                {value:53,label:'53% (Jul 2024)'},{value:50,label:'50% (Jan 2024)'},
                              ]}/>
                          </div>

                          <div>
                            <Lbl c="Qualifying Service Years"/>
                            <TIn type="number" value={emp.serviceYears}
                              onChange={(v:string)=>setEmp((p:EmployeeData)=>({...p,serviceYears:Math.min(Number(v)||0,42)}))}/>
                            <p className="text-[9px] text-gray-400 mt-1">
                              Auto-calc from DOJ: {totalQualifyingYrs} yrs — override if different
                            </p>
                          </div>

                          <div>
                            <Lbl c="Earned Leave Balance (days, Max 300)"/>
                            <TIn type="number" value={emp.earnedLeaves}
                              onChange={(v:string)=>setEmp((p:EmployeeData)=>({...p,earnedLeaves:Math.min(Number(v)||0,300)}))}/>
                          </div>

                          {/* Final summary box */}
                          <div className="p-4 bg-white border-2 border-gray-300 rounded-xl">
                            <p className="text-[10px] font-black text-gray-600 uppercase mb-2">Summary</p>
                            <div className="space-y-1.5 text-[11px]">
                              {[
                                ['Last Basic Pay',rs(actualLastBasic),'font-black text-gray-900'],
                                ['DA ('+actualDA+'%)',rs(pct(actualLastBasic,actualDA)),'text-purple-700'],
                                ['Basic + DA',rs(actualLastBasic+pct(actualLastBasic,actualDA)),'font-black text-gray-900'],
                                ['Qualifying Service',`${emp.serviceYears} yrs`,'text-blue-700'],
                                ['Earned Leaves',`${emp.earnedLeaves} days`,'text-green-700'],
                              ].map(([l,v,cls])=>(
                                <div key={l as string} className="flex justify-between">
                                  <span className="text-gray-500">{l}</span>
                                  <span className={cls as string}>{v}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Right: Actual Benefit Calculations */}
                        <div className="space-y-4">
                          {[
                            {
                              t:'Death-cum-Retirement Gratuity',
                              icon:Award, col:'#d97706',
                              val: actualGratuity,
                              formula:`(${rs(actualLastBasic)} + ${rs(pct(actualLastBasic,actualDA))}) × 15/26 × ${Math.min(emp.serviceYears,33)} yrs`,
                              detail: actualGratuity>=2000000
                                ? `⚠ Capped at ₹20,00,000 (actual computed: ${rs(((actualLastBasic+pct(actualLastBasic,actualDA))*15*Math.min(emp.serviceYears,33))/26)})`
                                : `${Math.min(emp.serviceYears,33)} qualifying years × (Basic+DA) × 15/26`,
                              cap: '₹20,00,000',
                            },
                            {
                              t:'Leave Encashment (EL)',
                              icon:BookOpen, col:'#16a34a',
                              val: actualLeaveEnc,
                              formula:`(${rs(actualLastBasic)} + ${rs(pct(actualLastBasic,actualDA))}) × ${emp.earnedLeaves} / 30`,
                              detail:`${emp.earnedLeaves} days × (Basic+DA)/30 — Max 300 days`,
                              cap: '300 days max',
                            },
                            {
                              t:'Total Retirement Benefits',
                              icon:IndianRupee, col:'#059669',
                              val: actualGratuity + actualLeaveEnc,
                              formula:`Gratuity + Leave Encashment`,
                              detail:`${rs(actualGratuity)} + ${rs(Math.round(actualLeaveEnc))}`,
                              cap: 'Combined payout',
                            },
                          ].map(item=>(
                            <div key={item.t} className="p-5 rounded-2xl border-2"
                              style={{background:item.col+'06',borderColor:item.col+'44'}}>
                              <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{background:item.col+'18'}}>
                                  <item.icon size={22} style={{color:item.col}}/>
                                </div>
                                <div className="flex-1">
                                  <p className="text-[10px] font-black uppercase tracking-wider" style={{color:item.col}}>{item.t}</p>
                                  <p className="text-3xl font-black text-gray-900 mt-1">{rs(Math.round(item.val))}</p>
                                  <div className="mt-2 p-2 bg-white/80 rounded-lg border" style={{borderColor:item.col+'22'}}>
                                    <p className="text-[10px] font-mono text-gray-600">{item.formula}</p>
                                    <p className="text-[9px] text-gray-400 mt-0.5">{item.detail}</p>
                                  </div>
                                </div>
                                <div className="text-[10px] font-bold text-gray-400 shrink-0 text-right">
                                  Max<br/>{item.cap}
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* NPS Corpus (accumulated so far) */}
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                            <p className="text-[10px] font-black text-blue-700 uppercase mb-2">Monthly NPS at Retirement</p>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-blue-600">Employee 10% + Govt 14%</span>
                              <span className="text-lg font-black text-blue-800">{rs(actualNPS)}/month</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                ['Annual NPS',rs(actualNPS*12)],
                                ['NPS Annuity (est.)',rs(Math.round(actualNPS*12*yearsServedSoFar*0.4/20/12))+'/mo'],
                              ].map(([l,v])=>(
                                <div key={l as string} className="bg-white rounded-lg p-2 text-center border border-blue-100">
                                  <p className="text-[9px] text-gray-400">{l}</p>
                                  <p className="font-black text-blue-700 text-sm">{v}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Retirement Checklist */}
                      <div className="p-5 bg-white border border-gray-200 rounded-2xl">
                        <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-4">
                          📋 Retirement Documents Checklist
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {[
                            'Last Pay Certificate (LPC)','No Objection Certificate (NOC)',
                            'Service Book (All entries verified)','NPS PRAN Account closure/withdrawal form',
                            'Gratuity claim form (Form F)','Leave Encashment application',
                            'PAN Card & Aadhaar','Bank passbook (for NEFT payment)',
                            'Retirement order copy','Department clearance certificate',
                            'Income Tax Returns (last 3 years)','Medical fitness certificate',
                          ].map((item,i)=>(
                            <div key={i} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200 text-xs">
                              <div className="w-4 h-4 rounded border-2 border-gray-300 shrink-0"/>
                              <span className="text-gray-700">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <NavRow onPrev={goPrev} onNext={goNext}/>
                </div>
                );
              })()}

              {/* ══════ NPS TRACKER & FINANCIAL PLANNER ══════ */}
              {tab==='compare'&&(()=>{
                // ── NPS Corpus Calculator ──
                const b7=emp.basicPay7th, da7=pct(b7,emp.daRate);
                const npsEmp7=pct(b7+da7,emp.npsEmployee), npsEr7=pct(b7+da7,emp.npsEmployer);
                const totalNPSPerMonth=npsEmp7+npsEr7;
                const retYear=emp.dateOfJoining?parseInt(emp.dateOfJoining.slice(-4))+60:2060;
                const curYear=new Date().getFullYear();
                const yearsLeft=Math.max(0,retYear-curYear);
                const yearsServed=Math.max(0,curYear-(emp.dateOfJoining?parseInt(emp.dateOfJoining.slice(-4)):curYear));

                // NPS corpus at different return rates
                const npsFV=(monthly:number,years:number,rate:number)=>{
                  const r=rate/12/100; const n=years*12;
                  if(r===0) return monthly*n;
                  return monthly*(Math.pow(1+r,n)-1)/r*(1+r);
                };

                // Salary progression timeline (next 10 years)
                const salaryTimeline=Array.from({length:11},(_,i)=>{
                  let basic=b7; let yr=curYear+i;
                  for(let j=0;j<i;j++) basic=nextStep(basic,emp.payLevel);
                  const da8=getDA(`${yr}-${emp.incrementMonth==='07'?'07':'01'}`);
                  const gross=basic+pct(basic,da8)+pct(basic,HRA_RATES[emp.hraCategory]*100)+emp.transportAllowance+emp.medicalAllowance;
                  const net=gross-(pct(basic+pct(basic,da8),emp.npsEmployee))-(emp.applyGSLI?getGSLI(emp.payLevel):0);
                  return {yr, basic, da:da8, gross, net, b8:Math.round(basic*emp.fitmentFactor8th/100)*100};
                });

                // Income Breakdown Percentages
                const totalGross=s7.gross||1;
                const breakdownItems=[
                  {label:'Basic Pay',  value:s7.b,          pct:Math.round(s7.b/totalGross*100),  color:'#2563eb'},
                  {label:'DA',         value:s7.da,         pct:Math.round(s7.da/totalGross*100),  color:'#7c3aed'},
                  {label:'HRA',        value:s7.hra,        pct:Math.round(s7.hra/totalGross*100), color:'#0891b2'},
                  {label:'Transport',  value:s7.ta+s7.taDA, pct:Math.round((s7.ta+s7.taDA)/totalGross*100), color:'#16a34a'},
                  {label:'Medical+Other',value:s7.ma+s7.cea+s7.hostel, pct:Math.round((s7.ma+s7.cea+s7.hostel)/totalGross*100), color:'#d97706'},
                ];
                const maxBP=Math.max(...breakdownItems.map(x=>x.value),1);

                // Income Tax projection (5 years with annual increment)
                const taxProjection=Array.from({length:6},(_,i)=>{
                  let basic=b7;
                  for(let j=0;j<i;j++) basic=nextStep(basic,emp.payLevel);
                  const da=pct(basic,emp.daRate), hra=pct(basic,HRA_RATES[emp.hraCategory]*100);
                  const gross=(basic+da+hra+emp.transportAllowance+emp.medicalAllowance)*12;
                  const std=emp.taxRegime==='new'?75000:50000;
                  const npsEr12=pct(basic+da,emp.npsEmployer)*12;
                  const pf12=pct(basic+da,emp.npsEmployee)*12;
                  const c80=emp.taxRegime==='old'?Math.min(emp.homeLoanPrincipal+emp.annualPPF+emp.annualLIC+pf12,150000):0;
                  const txb=Math.max(0,gross-(emp.taxRegime==='new'?std+npsEr12:std+c80+emp.homeLoanInterest));
                  return {yr:curYear+i, basic, gross, taxable:txb, tax:calcTax(txb,emp.taxRegime)};
                });

                return (
                <div className="p-4 sm:p-6 space-y-5">
                  <SectionHead title="Advanced Financial Planner" subtitle={`${fullName} · NPS Tracker · Salary Timeline · Tax Projection · Corpus Calculator`} icon={TrendingUp} accent="#6366f1"/>

                  {/* ── TOP STATS ── */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {l:'Monthly NPS (Total)', v:rs(totalNPSPerMonth), sub:`Emp: ${rs(npsEmp7)} + Govt: ${rs(npsEr7)}`, col:'#7c3aed', icon:Shield},
                      {l:'Annual NPS Contribution', v:rs(totalNPSPerMonth*12), sub:'Employee + Employer', col:'#4f46e5', icon:TrendingUp},
                      {l:'Years Left to Retire', v:yearsLeft+' yrs', sub:`Joined ${emp.dateOfJoining||'N/A'} · Ret. ~${retYear}`, col:'#d97706', icon:Award},
                      {l:'Projected NPS Corpus (8%)', v:rs(Math.round(npsFV(totalNPSPerMonth,yearsLeft,8)/1000)*1000), sub:`Over ${yearsLeft} remaining years`, col:'#16a34a', icon:IndianRupee},
                    ].map(c=>(
                      <div key={c.l} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <div className="flex items-start justify-between mb-2">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{background:c.col+'18'}}><c.icon size={16} style={{color:c.col}}/></div>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{c.l}</p>
                        <p className="text-lg font-black text-gray-900 mt-1">{c.v}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{c.sub}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    {/* ── NPS CORPUS PROJECTION ── */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                      <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"><Shield size={13} className="text-indigo-500"/> NPS Corpus at Retirement ({retYear})</p>
                      <div className="space-y-3">
                        {[{r:6,label:'Conservative (6% p.a.)',col:'#ef4444'},{r:8,label:'Moderate (8% p.a.)',col:'#f59e0b'},{r:10,label:'Growth (10% p.a.)',col:'#22c55e'},{r:12,label:'Aggressive (12% p.a.)',col:'#3b82f6'}].map(s=>{
                          const corpus=npsFV(totalNPSPerMonth,yearsLeft,s.r);
                          const annuityMonthly=Math.round(corpus*0.6/20/12); // 60% annuity, 20yr, monthly
                          const maxC=npsFV(totalNPSPerMonth,yearsLeft,12);
                          return (
                            <div key={s.r} className="p-3 rounded-xl border" style={{background:s.col+'08',borderColor:s.col+'33'}}>
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-xs font-bold" style={{color:s.col}}>{s.label}</span>
                                <span className="text-sm font-black text-gray-900">{rs(Math.round(corpus/100000)*100000)}</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all" style={{width:`${Math.min(100,(corpus/maxC)*100)}%`,background:s.col}}/>
                              </div>
                              <p className="text-[10px] text-gray-400 mt-1.5">Monthly annuity ~{rs(annuityMonthly)} (60% of corpus, 20 yr)</p>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs">
                        <p className="font-black text-indigo-700 mb-1">Lump Sum Available at Retirement</p>
                        <p className="text-indigo-600">40% of corpus = <strong>{rs(Math.round(npsFV(totalNPSPerMonth,yearsLeft,8)*0.4/1000)*1000)}</strong> (at 8% scenario)</p>
                      </div>
                    </div>

                    {/* ── SALARY BREAKDOWN PIE ── */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                      <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"><PieIcon size={13} className="text-blue-500"/> Gross Salary Composition</p>
                      <div className="flex items-center gap-4 mb-4">
                        <DonutChart slices={breakdownItems.map(x=>({value:x.value,color:x.color,label:x.label}))}/>
                        <div className="space-y-2 flex-1">
                          {breakdownItems.map(item=>(
                            <div key={item.label} className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-sm shrink-0" style={{background:item.color}}/>
                              <div className="flex-1">
                                <div className="flex justify-between text-xs mb-0.5">
                                  <span className="text-gray-600 font-medium">{item.label}</span>
                                  <span className="font-black">{item.pct}%</span>
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full" style={{width:`${(item.value/maxBP)*100}%`,background:item.color}}/>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="border-t border-gray-100 pt-3 grid grid-cols-2 gap-3">
                        <div className="bg-green-50 rounded-xl p-3 text-center">
                          <p className="text-[10px] text-gray-400 mb-0.5">Total Gross</p>
                          <p className="font-black text-green-700 text-base">{rs(s7.gross)}</p>
                        </div>
                        <div className="bg-red-50 rounded-xl p-3 text-center">
                          <p className="text-[10px] text-gray-400 mb-0.5">Net Take-Home</p>
                          <p className="font-black text-red-600 text-base">{rs(s7.net)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── SALARY PROGRESSION TIMELINE ── */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                    <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"><Milestone size={13} className="text-orange-500"/> 10-Year Salary Progression Timeline (Annual Increment Applied)</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse min-w-[900px]">
                        <thead><tr className="bg-gradient-to-r from-orange-600 to-amber-600 text-white">
                          {['Year','7th Basic Pay','DA%','Est. Gross','Est. Net','8th Pay (Est.)','YoY Growth'].map(h=>(
                            <th key={h} className="px-3 py-2.5 text-center font-black whitespace-nowrap">{h}</th>
                          ))}
                        </tr></thead>
                        <tbody>
                          {salaryTimeline.map((row,i)=>{
                            const prev=salaryTimeline[i-1];
                            const growth=prev&&prev.gross>0?((row.gross-prev.gross)/prev.gross*100):0;
                            const isCurrent=i===0;
                            return (
                              <tr key={row.yr} className={isCurrent?'bg-orange-50 border-2 border-orange-300':i%2===0?'bg-white':'bg-gray-50/50'}>
                                <td className="px-3 py-2.5 text-center font-black" style={{color:isCurrent?'#d97706':'#6b7280'}}>{row.yr}{isCurrent&&' ←'}</td>
                                <td className="px-3 py-2.5 text-right font-mono font-bold">{rs(row.basic)}</td>
                                <td className="px-3 py-2.5 text-center text-gray-400">{row.da}%</td>
                                <td className="px-3 py-2.5 text-right font-mono text-green-700 font-bold">{rs(row.gross)}</td>
                                <td className="px-3 py-2.5 text-right font-mono text-gray-900 font-black">{rs(row.net)}</td>
                                <td className="px-3 py-2.5 text-right font-mono text-orange-600 font-bold">{rs(row.b8)}</td>
                                <td className="px-3 py-2.5 text-center">
                                  {i>0&&<span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{background:growth>0?'#dcfce7':'#f3f4f6',color:growth>0?'#16a34a':'#6b7280'}}>
                                    {growth>0?'+':''}{growth.toFixed(1)}%
                                  </span>}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {/* Mini sparkline bars */}
                    <div className="mt-4 flex items-end gap-1 h-12 px-2">
                      {salaryTimeline.map((row,i)=>{
                        const maxG=Math.max(...salaryTimeline.map(r=>r.gross));
                        const h=Math.max(4,(row.gross/maxG)*44);
                        return (
                          <div key={row.yr} className="flex-1 flex flex-col items-center gap-0.5">
                            <div className="w-full rounded-t transition-all" style={{height:`${h}px`,background:i===0?'#d97706':'#93c5fd',minHeight:'4px'}}/>
                            <span className="text-[8px] text-gray-400">{String(row.yr).slice(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── TAX LIABILITY PROJECTION ── */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                    <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"><Receipt size={13} className="text-red-500"/> 6-Year Income Tax Projection ({emp.taxRegime==='new'?'New':'Old'} Regime)</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead><tr className="bg-red-700 text-white">{['Year','Basic Pay','Est. Gross (Annual)','Taxable Income','Tax Amount','Monthly TDS','Tax % of Gross'].map(h=><th key={h} className="px-3 py-2.5 text-center font-black">{h}</th>)}</tr></thead>
                        <tbody>
                          {taxProjection.map((row,i)=>(
                            <tr key={row.yr} className={i%2===0?'bg-white':'bg-red-50/20'}>
                              <td className="px-3 py-2 text-center font-bold text-red-700">{row.yr}</td>
                              <td className="px-3 py-2 text-right font-mono">{rs(row.basic)}</td>
                              <td className="px-3 py-2 text-right font-mono">{rs(row.gross)}</td>
                              <td className="px-3 py-2 text-right font-mono">{rs(row.taxable)}</td>
                              <td className="px-3 py-2 text-right font-black text-red-600">{rs(row.tax)}</td>
                              <td className="px-3 py-2 text-right font-mono">{rs(Math.round(row.tax/12))}</td>
                              <td className="px-3 py-2 text-center">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                                  {row.gross>0?(row.tax/row.gross*100).toFixed(1):0}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-start gap-2">
                      <Info size={14} className="text-amber-600 shrink-0 mt-0.5"/>
                      <p className="text-amber-700">Projection assumes current DA rate ({emp.daRate}%) constant & annual increment applied. Actual values will vary with DA revisions and actual increment dates.</p>
                    </div>
                  </div>

                  {/* ── FINANCIAL HEALTH SCORE ── */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                    <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"><ShieldCheck size={13} className="text-green-500"/> Financial Health Score</p>
                    {(()=>{
                      const scores=[
                        {label:'NPS Coverage',score:emp.applyNPS?100:0,max:100,note:emp.applyNPS?'NPS active (10%+14%)':'NPS not applied'},
                        {label:'Tax Planning',score:emp.taxRegime==='old'&&(emp.annualPPF+emp.annualLIC+emp.mediclaim)>50000?90:emp.applyIT?70:40,max:100,note:emp.taxRegime==='old'?`Deductions: ${rs(emp.annualPPF+emp.annualLIC+emp.mediclaim)}`:'Tax auto-TDS applied'},
                        {label:'Profile Completeness',score:Math.round(([emp.name,emp.panNumber,emp.pranNumber,emp.bankAccount,emp.ifscCode,emp.dateOfJoining,emp.dateOfBirth].filter(Boolean).length/7)*100),max:100,note:'Name, PAN, PRAN, Bank, IFSC, DOJ, DOB'},
                        {label:'Insurance Coverage',score:emp.applyLIC&&emp.licDeduction>0?100:emp.mediclaim>0?60:20,max:100,note:emp.applyLIC?`LIC: ${rs(emp.licDeduction*12)}/yr`:'No LIC/insurance entered'},
                        {label:'Home Loan Deduction',score:emp.homeLoanInterest>0&&emp.homeLoanPrincipal>0?100:emp.homeLoanInterest>0?50:0,max:100,note:emp.homeLoanInterest>0?`Interest: ${rs(emp.homeLoanInterest)}/yr`:'No home loan'},
                      ];
                      const totalScore=Math.round(scores.reduce((s,x)=>s+x.score,0)/scores.length);
                      const color=totalScore>=80?'#16a34a':totalScore>=60?'#d97706':'#dc2626';
                      const grade=totalScore>=90?'A+':totalScore>=80?'A':totalScore>=70?'B+':totalScore>=60?'B':totalScore>=50?'C':'D';
                      return (
                        <div className="flex gap-6">
                          <div className="flex flex-col items-center justify-center w-32 shrink-0">
                            <svg width="110" height="110" viewBox="0 0 110 110">
                              <circle cx="55" cy="55" r="46" fill="none" stroke="#e5e7eb" strokeWidth="10"/>
                              <circle cx="55" cy="55" r="46" fill="none" stroke={color} strokeWidth="10"
                                strokeDasharray={`${2*Math.PI*46*totalScore/100} ${2*Math.PI*46*(1-totalScore/100)}`}
                                strokeLinecap="round" transform="rotate(-90 55 55)"/>
                              <text x="55" y="50" textAnchor="middle" fontSize="24" fontWeight="900" fill={color}>{grade}</text>
                              <text x="55" y="68" textAnchor="middle" fontSize="12" fill="#6b7280">{totalScore}/100</text>
                            </svg>
                            <p className="text-[10px] font-black text-center mt-1" style={{color}}>
                              {totalScore>=80?'Excellent':totalScore>=60?'Good':'Needs Attention'}
                            </p>
                          </div>
                          <div className="flex-1 space-y-2.5">
                            {scores.map(s=>(
                              <div key={s.label}>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs font-bold text-gray-700">{s.label}</span>
                                  <span className="text-xs font-black" style={{color:s.score>=80?'#16a34a':s.score>=50?'#d97706':'#dc2626'}}>{s.score}%</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full transition-all" style={{width:`${s.score}%`,background:s.score>=80?'#16a34a':s.score>=50?'#d97706':'#dc2626'}}/>
                                </div>
                                <p className="text-[9px] text-gray-400 mt-0.5">{s.note}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <NavRow onPrev={goPrev} onNext={goNext}/>
                </div>
                );
              })()}

              {/* ══════ SETTINGS ══════ */}
              {tab==='settings'&&(
                <div className="p-4 sm:p-5">
                  <SectionHead title="Admin Settings" subtitle="College details, logo & global configuration" icon={Settings} accent="#475569"/>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-5">
                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2"><Building2 size={13}/> Institution Details</h3>
                        <div className="space-y-4">
                          <div><Lbl c="College / University Name"/><TIn value={sysConfig.collegeName} onChange={(v:string)=>setSysConfig(p=>({...p,collegeName:v}))}/></div>
                          <div><Lbl c="Address"/><TIn value={sysConfig.address} onChange={(v:string)=>setSysConfig(p=>({...p,address:v}))}/></div>
                          <div><Lbl c="Affiliated To"/><TIn value={sysConfig.affiliatedTo} onChange={(v:string)=>setSysConfig(p=>({...p,affiliatedTo:v}))}/></div>
                        </div>
                      </div>
                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4">Official Logo Upload</h3>
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-white overflow-hidden shrink-0">
                            {sysConfig.logoBase64?<img src={sysConfig.logoBase64} alt="Logo" className="w-full h-full object-contain p-1"/>:<Building2 size={24} className="text-slate-300"/>}
                          </div>
                          <div>
                            <input type="file" accept="image/png,image/jpeg" id="logo-upload" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f){const r=new FileReader();r.onload=ev=>setSysConfig(p=>({...p,logoBase64:ev.target?.result as string}));r.readAsDataURL(f);}}}/>
                            <label htmlFor="logo-upload" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-700 shadow mb-2"><Upload size={13}/> Upload Logo</label>
                            {sysConfig.logoBase64&&<button onClick={()=>setSysConfig(p=>({...p,logoBase64:''}))} className="block text-[10px] font-bold text-red-500 hover:text-red-700 mt-1">Remove Logo</button>}
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                        <h3 className="text-xs font-black text-red-600 uppercase tracking-wider mb-3">Danger Zone</h3>
                        <div className="flex gap-3">
                          <button onClick={exportAllProfiles} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700"><Download size={12}/> Backup All Data</button>
                          <button onClick={()=>{if(confirm('Delete ALL profiles? This cannot be undone!')){setProfiles([BLANK_PROFILE(uid())]);showToast('All profiles deleted','error');}}} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700"><Trash2 size={12}/> Delete All Profiles</button>
                        </div>
                      </div>
                    </div>
                    <div className="sticky top-24 p-6 bg-white border-2 border-slate-200 rounded-2xl shadow-lg">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5 text-center">Live Document Header Preview</p>
                      <div className="border-b-2 border-double border-black pb-4 text-center flex flex-col items-center">
                        {sysConfig.logoBase64&&<img src={sysConfig.logoBase64} alt="Logo" className="h-16 mb-3 object-contain"/>}
                        <h1 className="text-lg font-black uppercase tracking-wider text-black">{sysConfig.collegeName}</h1>
                        <p className="text-xs font-bold text-gray-700 mt-1">{sysConfig.address}</p>
                        {sysConfig.affiliatedTo&&<p className="text-[10px] font-medium text-gray-500 mt-0.5">Affiliated to {sysConfig.affiliatedTo}</p>}
                      </div>
                      <div className="mt-5 text-center">
                        <p className="text-xs font-bold text-gray-600 bg-gray-100 rounded-lg p-2">All documents use this header automatically</p>
                      </div>
                    </div>
                  </div>
                  <NavRow onPrev={goPrev} showNext={false}/>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAVIGATION ── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
        <div className="grid grid-cols-5 gap-0">
          {[
            {id:'dashboard',  icon:LayoutDashboard,  label:'Home'},
            {id:'profiles',   icon:Users,             label:'Staff'},
            {id:'salary',     icon:IndianRupee,       label:'Salary'},
            {id:'yearlysummary',icon:BarChart3,        label:'Yearly'},
            {id:'settings',   icon:Settings,          label:'More'},
          ].map(item=>(
            <button key={item.id} onClick={()=>setTab(item.id as TabType)}
              className={`flex flex-col items-center justify-center py-2 gap-0.5 transition-all ${tab===item.id?'text-green-600':'text-gray-400'}`}>
              <item.icon size={20} strokeWidth={tab===item.id?2.5:1.5}/>
              <span className="text-[9px] font-bold">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
      {/* Bottom padding for mobile nav */}
      <div className="h-16 sm:hidden"/>

      <footer className="py-6 px-4 text-center text-[10px] text-gray-400 border-t border-gray-200 mt-4">
        <p className="font-bold">{sysConfig.collegeName} · Pay Manager Pro v8.0 Ultra Premium</p>
        <p className="mt-0.5">Non-Teaching Staff Salary Calculator · 7th/8th CPC · Jharkhand Government</p>
      </footer>
    </div>
  );
}