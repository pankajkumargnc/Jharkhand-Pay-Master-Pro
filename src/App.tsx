/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║   GURU NANAK COLLEGE, DHANBAD — ULTRA PREMIUM EDITION v5.0            ║
 * ║   © 2026 · University & College Non-Teaching Staff Calculator      ║
 * ║   New: PF logic · Salary Slip PDF · Excel Export · Reset · Auto Tax║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Calculator, User, FileText, TrendingUp, History, Printer, Download,
  Plus, Trash2, ChevronRight, ChevronLeft, IndianRupee, BarChart3,
  Receipt, ClipboardList, FileSpreadsheet, Shield, Zap, CheckCircle2,
  Info, TrendingDown, RefreshCw, UserPlus, BookOpen, RotateCcw,
  FileDown, TableProperties, X, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ══════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════
interface EmployeeData {
  name: string; salutation: string; designation: string; department: string; college: string;
  panNumber: string; pranNumber: string; bankAccount: string; ifscCode: string;
  dateOfJoining: string; payLevel: number; basicPay7th: number; basicPay8th: number;
  daRate: number; hraCategory: 'X'|'Y'|'Z';
  medicalAllowance: number; transportAllowance: number; washingAllowance: number;
  otherAllowances: number;
  // PF / NPS
  applyNPS: boolean; npsEmployee: number; npsEmployer: number;
  // Deductions
  applyGIS: boolean; gisContribution: number;
  applyPT: boolean; professionalTax: number;
  applyLIC: boolean; licDeduction: number;
  applySociety: boolean; societyDeduction: number;
  applyIT: boolean;
  taxRegime: 'old'|'new';
  // Tax investments
  annualPPF: number; annualLIC: number; annualTuitionFee: number;
  homeLoanPrincipal: number; homeLoanInterest: number;
  mediclaim: number; npsVoluntary: number;
  // 6th CPC
  bandPayOld: number; gradePayOld: number;
  // Config
  incrementMonth: '01'|'07'; financialYear: string; fitmentFactor8th: number;
  salaryMonth: string; salaryYear: string;
}

interface SBEmployee {
  id: number; name: string; designation: string; doj: string;
  level: string; basicOn2016: number; basicOn2024: number; incrementDate: string;
  employeeType: 'old' | 'new'; // old = pre-2016, new = post-2016 joiner
  col6Label: string; // label for column 6 (customizable)
}

// ══════════════════════════════════════════════════════════════════
// DESIGNATION CONFIG
// ══════════════════════════════════════════════════════════════════
const DESIG_CONFIG: Record<string, { level:number; ta:number; ma:number; washing:number; gp6:number; bp6:number }> = {
  'Principal':             {level:14,ta:3600,ma:1000,washing:0,gp6:10000,bp6:37400},
  'Associate Professor':   {level:13,ta:3600,ma:1000,washing:0,gp6:8000, bp6:37400},
  'Assistant Professor':   {level:10,ta:3600,ma:1000,washing:0,gp6:6000, bp6:15600},
  'Librarian':             {level:10,ta:3600,ma:1000,washing:0,gp6:6000, bp6:15600},
  'Assistant Librarian':   {level:7, ta:1800,ma:1000,washing:0,gp6:4600, bp6:9300 },
  'Library Assistant':     {level:6, ta:1800,ma:1000,washing:0,gp6:4200, bp6:9300 },
  'Assistant (UDC)':       {level:6, ta:1800,ma:1000,washing:0,gp6:4200, bp6:9300 },
  'Assistant (LDC)':       {level:4, ta:1800,ma:1000,washing:0,gp6:2400, bp6:5200 },
  'Junior Assistant':      {level:3, ta:1800,ma:1000,washing:0,gp6:2000, bp6:5200 },
  'Accountant':            {level:6, ta:1800,ma:1000,washing:0,gp6:4200, bp6:9300 },
  'Jr. Accountant':        {level:4, ta:1800,ma:1000,washing:0,gp6:2400, bp6:5200 },
  'Computer Operator':     {level:5, ta:1800,ma:1000,washing:0,gp6:2800, bp6:5200 },
  'Store Keeper':          {level:4, ta:1800,ma:1000,washing:0,gp6:2400, bp6:5200 },
  'Lab Assistant':         {level:5, ta:1800,ma:1000,washing:0,gp6:2800, bp6:5200 },
  'Lab Technician':        {level:5, ta:1800,ma:1000,washing:0,gp6:2800, bp6:5200 },
  'Driver':                {level:4, ta:1800,ma:1000,washing:0,gp6:2400, bp6:5200 },
  'Peon (Class IV)':       {level:1, ta:1800,ma:1000,washing:150,gp6:1800,bp6:5200},
  'Chowkidar (Class IV)':  {level:1, ta:1800,ma:1000,washing:150,gp6:1800,bp6:5200},
  'Sweeper (Class IV)':    {level:1, ta:1800,ma:1000,washing:150,gp6:1800,bp6:5200},
  'Mali (Class IV)':       {level:1, ta:1800,ma:1000,washing:150,gp6:1800,bp6:5200},
  'Dafadar':               {level:2, ta:1800,ma:1000,washing:0,gp6:1900, bp6:5200 },
  'Naik':                  {level:2, ta:1800,ma:1000,washing:0,gp6:1900, bp6:5200 },
  'Registrar':             {level:12,ta:3600,ma:1000,washing:0,gp6:7600, bp6:15600},
  'Deputy Registrar':      {level:10,ta:3600,ma:1000,washing:0,gp6:6600, bp6:15600},
  'Assistant Registrar':   {level:8, ta:3600,ma:1000,washing:0,gp6:4800, bp6:9300 },
  'Finance Officer':       {level:12,ta:3600,ma:1000,washing:0,gp6:7600, bp6:15600},
  'Section Officer':       {level:7, ta:1800,ma:1000,washing:0,gp6:4600, bp6:9300 },
  'PA to Principal':       {level:7, ta:1800,ma:1000,washing:0,gp6:4600, bp6:9300 },
  'Physical Instructor':   {level:6, ta:1800,ma:1000,washing:0,gp6:4200, bp6:9300 },
  'Nurse':                 {level:7, ta:1800,ma:1000,washing:150,gp6:4600,bp6:9300},
  'Pharmacist':            {level:5, ta:1800,ma:1000,washing:0,gp6:2800, bp6:5200 },
  'Office Superintendent': {level:7, ta:1800,ma:1000,washing:0,gp6:4600, bp6:9300 },
};

const DESIG_GROUPS = [
  {group:'Teaching Staff',        items:['Principal','Associate Professor','Assistant Professor']},
  {group:'Library Staff',         items:['Librarian','Assistant Librarian','Library Assistant']},
  {group:'Administrative',        items:['Registrar','Deputy Registrar','Assistant Registrar','Finance Officer','Section Officer','Office Superintendent','PA to Principal']},
  {group:'Accounts',              items:['Accountant','Jr. Accountant']},
  {group:'Clerical (Non-Teaching)',items:['Assistant (UDC)','Assistant (LDC)','Junior Assistant','Store Keeper']},
  {group:'Technical Staff',       items:['Computer Operator','Lab Assistant','Lab Technician','Physical Instructor','Pharmacist','Nurse','Driver']},
  {group:'Class IV Staff',        items:['Peon (Class IV)','Chowkidar (Class IV)','Sweeper (Class IV)','Mali (Class IV)','Dafadar','Naik']},
];

// 6th CPC Band Pay options by Pay Band
const BAND_PAY_OPTIONS: Record<string, {band:string; values:number[]}> = {
  'PB-1 (₹5200-20200)': {band:'PB-1',values:[5200,6000,6500,7000,7500,8000,8500,9000,9300,9500,9800,10000,10300,10500,10800,11100,11400,11600,12000,12400,12700,13000,13500,14000,14800,15100,15500,16000,16600]},
  'PB-2 (₹9300-34800)': {band:'PB-2',values:[9300,9500,9800,10000,10500,11000,11500,12000,13000,14000,15000,16000,17000,18000,19000,20000,21000,22000,23000,24000,25000,26000,27000,28000,29000,30000,31000,32000,33000,34800]},
  'PB-3 (₹15600-39100)':{band:'PB-3',values:[15600,16000,17000,18000,19000,20000,21000,22000,23000,24000,25000,26000,27000,28000,29000,30000,31000,32000,33000,34000,35000,36000,37000,38000,39100]},
  'PB-4 (₹37400-67000)':{band:'PB-4',values:[37400,38000,39000,40000,42000,44000,46000,48000,50000,52000,54000,56000,58000,60000,62000,64000,66000,67000]},
};

const GRADE_PAY_OPTIONS = [1800,1900,2000,2400,2800,4200,4600,4800,5400,6600,7600,8000,8700,8900,10000];

const SALUTATIONS = ['Sri.','Smt.','Km.','Dr.','Prof.','Shri','Mr.','Mrs.','Ms.'];
const DEPARTMENTS  = ['Office','Library','Science Dept.','Arts Dept.','Commerce Dept.','Lab','Sports','Accounts','Administration','Examination','Store'];
const MONTHS_FULL  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ══════════════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════════════
const HRA_RATES = {X:0.27, Y:0.18, Z:0.09};

const PAY_MATRIX: Record<number,number[]> = {
  1: [18000,18500,19100,19700,20300,20900,21500,22100,22800,23500],
  2: [19900,20500,21100,21700,22400,23100,23800,24500,25200,26000],
  3: [21700,22400,23100,23800,24500,25200,26000,26800,27600,28400],
  4: [25500,26300,27100,27900,28700,29600,30500,31400,32300,33300],
  5: [29200,30100,31000,31900,32900,33900,34900,35900,37000,38100],
  6: [35400,36500,37600,38700,39900,41100,42300,43600,44900,46200,47600,49000,50500,52000,53600,55200,56900,58600,60400,62200],
  7: [44900,46200,47600,49000,50500,52000,53600,55200,56900,58600,60400,62200,64100,66000,68000,70000,72100,74300,76500,78800],
  8: [47600,49000,50500,52000,53600,55200,56900,58600,60400,62200,64100,66000,68000,70000,72100,74300,76500,78800,81200,83600],
  9: [53100,54700,56300,58000,59700,61500,63300,65200,67200,69200,71300,73400,75600,77900,80200,82600,85100,87700,90300,93000],
  10:[56100,57800,59500,61300,63100,65000,67000,69000,71100,73200,75400,77700,80000,82400,84900,87400,90000,92700,95500,98400],
  11:[67700,69700,71800,74000,76200,78500,80900,83300,85800,88400,91100,93800,96600,99500,102500,105600,108800,112100,115500,119000],
  12:[78800,81200,83600,86100,88700,91400,94100,96900,99800,102800,105900,109100,112400,115800,119300,122900,126600,130400,134300,138300],
  13:[123100,126800,130600,134500,138500,142700,147000,151400,155900,160600,165400,170400,175500,180800,186200,191800,197600,203500,209600,215900],
  14:[144200,148500,153000,157600,162300,167200,172200,177400,182700,188200,193800,199600,205600,211800,218200],
};

const DA_HISTORY: Record<string,number> = {
  '2016-01':0,'2016-07':2,'2017-01':4,'2017-07':5,'2018-01':7,'2018-07':9,
  '2019-01':12,'2019-07':17,'2020-01':17,'2020-07':17,'2021-01':17,'2021-07':28,
  '2022-01':31,'2022-07':38,'2023-01':42,'2023-07':46,'2024-01':50,'2024-07':53,
  '2025-01':57,'2025-07':61,'2026-01':65,
};

const BLANK: EmployeeData = {
  name:'Pankaj Kumar Prasad', salutation:'Sri.', designation:'Assistant (LDC)', department:'Office',
  college:'Guru Nanak College', panNumber:'', pranNumber:'', bankAccount:'', ifscCode:'',
  dateOfJoining:'23-12-2023', payLevel:2, basicPay7th:19900, basicPay8th:56950,
  daRate:53, hraCategory:'Y',
  medicalAllowance:1000, transportAllowance:1800, washingAllowance:0, otherAllowances:0,
  applyNPS:true, npsEmployee:10, npsEmployer:14,
  applyGIS:false, gisContribution:0,
  applyPT:false, professionalTax:200,
  applyLIC:false, licDeduction:0,
  applySociety:false, societyDeduction:0,
  applyIT:true, taxRegime:'new',
  annualPPF:0, annualLIC:0, annualTuitionFee:0,
  homeLoanPrincipal:0, homeLoanInterest:0,
  mediclaim:0, npsVoluntary:0,
  bandPayOld:5200, gradePayOld:1900,
  incrementMonth:'07', financialYear:'2024-25', fitmentFactor8th:2.86,
  salaryMonth:'March', salaryYear:'2025',
};

const TABS = ['profile','fixation','projection','salary','yearlysummary','arrears','salarybill','annualstatement','taxdetail'] as const;
type TabType = typeof TABS[number];

const NAV_ITEMS = [
  {id:'profile',         label:'Employee Profile',   icon:User,           color:'#16a34a'},
  {id:'fixation',        label:'7th Pay Fixation',   icon:FileText,       color:'#2563eb'},
  {id:'projection',      label:'8th Pay Projection', icon:TrendingUp,     color:'#7c3aed'},
  {id:'salary',          label:'Monthly Salary',     icon:IndianRupee,    color:'#0891b2'},
  {id:'yearlysummary',   label:'Yearly Summary',     icon:BarChart3,      color:'#d97706'},
  {id:'arrears',         label:'Arrear Calculator',  icon:History,        color:'#dc2626'},
  {id:'salarybill',      label:'Salary Bill',        icon:ClipboardList,  color:'#4f46e5'},
  {id:'annualstatement', label:'Annual Statement',   icon:FileSpreadsheet,color:'#0d9488'},
  {id:'taxdetail',       label:'Tax Comparison',     icon:Receipt,        color:'#ea580c'},
];

// ══════════════════════════════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════════════════════════════
const rnd = (n:number) => Math.round(n);
const fmt = (n:number) => Math.round(n).toLocaleString('en-IN');
const rs  = (n:number) => `₹${fmt(n)}`;
const pct = (base:number, p:number) => rnd(base * p / 100);

function getDA(m:string):number {
  for (const k of Object.keys(DA_HISTORY).sort().reverse()) if (m>=k) return DA_HISTORY[k];
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
  let s='';
  if(n>=10000000){s+=three(~~(n/10000000))+' Crore ';n%=10000000;}
  if(n>=100000){s+=three(~~(n/100000))+' Lakh ';n%=100000;}
  if(n>=1000){s+=three(~~(n/1000))+' Thousand ';n%=1000;}
  if(n>0) s+=three(n);
  return s.trim()+' Only';
}
function calcTax(inc:number, regime:'old'|'new'):number {
  let t=0;
  if(regime==='new'){
    if(inc<=300000) t=0;
    else if(inc<=600000) t=(inc-300000)*.05;
    else if(inc<=900000) t=15000+(inc-600000)*.10;
    else if(inc<=1200000) t=45000+(inc-900000)*.15;
    else if(inc<=1500000) t=90000+(inc-1200000)*.20;
    else t=150000+(inc-1500000)*.30;
    if(inc<=700000) t=0;
  } else {
    if(inc<=250000) t=0;
    else if(inc<=500000) t=(inc-250000)*.05;
    else if(inc<=1000000) t=12500+(inc-500000)*.20;
    else t=112500+(inc-1000000)*.30;
    if(inc<=500000) t=Math.max(0,t-12500);
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

// Excel CSV export utility
function exportCSV(rows:any[][], filename:string) {
  const csv=rows.map(r=>r.map(c=>typeof c==='string'&&c.includes(',')?`"${c}"`:c).join(',')).join('\n');
  const a=document.createElement('a');
  a.href='data:text/csv;charset=utf-8,\uFEFF'+encodeURIComponent(csv);
  a.download=filename; a.click();
}

// Print utility
function doPrint(ref:React.RefObject<HTMLDivElement>, title:string) {
  if(!ref.current) return;
  const w=window.open('','_blank','width=1000,height=800');
  if(!w) return;
  w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;background:#fff;color:#000;font-size:10px}
    table{border-collapse:collapse;width:100%}
    td,th{border:1px solid #000;padding:3px 5px}
    th{background:#e8e8e8;font-weight:bold;text-align:center}
    .no-print{display:none!important}
    /* A4 print — proper margins, no clipping */
    @page{size:A4 landscape;margin:10mm 8mm 10mm 8mm}
    @media print{
      *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
      .no-print{display:none!important}
      body{padding:0;margin:0}
      table{page-break-inside:auto}
      tr{page-break-inside:avoid;page-break-after:auto}
      thead{display:table-header-group}
      tfoot{display:table-footer-group}
    }
    @media screen{body{padding:12mm 10mm;max-width:297mm;margin:0 auto}}
  </style></head><body>`);
  w.document.write(ref.current.innerHTML);
  w.document.write('</body></html>');
  w.document.close();
  setTimeout(()=>w.print(),600);
}

// ══════════════════════════════════════════════════════════════════
// UI PRIMITIVES
// ══════════════════════════════════════════════════════════════════
const Lbl = ({c}:{c:string}) => <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{c}</label>;

const TIn = ({value,onChange,type='text',placeholder='',disabled=false,className=''}:any) => (
  <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
    className={`w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 font-medium shadow-sm
    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all
    disabled:bg-gray-50 disabled:text-gray-400 placeholder:text-gray-300 ${className}`}/>
);

const TSel = ({value,onChange,options,grouped}:{value:any;onChange:(v:any)=>void;options?:{value:any;label:string}[];grouped?:{group:string;items:string[]}[]}) => (
  <select value={value} onChange={e=>onChange(e.target.value)}
    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 font-medium shadow-sm
    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all">
    {grouped ? grouped.map(g=>(
      <optgroup key={g.group} label={g.group}>
        {g.items.map(it=><option key={it} value={it}>{it}</option>)}
      </optgroup>
    )) : options?.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const TToggle = ({checked,onChange,label}:{checked:boolean;onChange:(v:boolean)=>void;label:string}) => (
  <label className="flex items-center gap-3 cursor-pointer">
    <div onClick={()=>onChange(!checked)}
      className={`w-9 h-5 rounded-full transition-all duration-200 relative shrink-0 ${checked?'bg-green-500':'bg-gray-300'}`}>
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${checked?'left-4':'left-0.5'}`}/>
    </div>
    <span className="text-sm text-gray-700 font-medium">{label}</span>
  </label>
);

const SectionHead = ({title,subtitle,icon:Icon,accent}:any) => (
  <div className="flex items-start gap-4 mb-8 pb-5 border-b border-gray-100">
    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
      style={{background:accent+'18',border:`1.5px solid ${accent}44`}}>
      <Icon size={20} style={{color:accent}}/>
    </div>
    <div className="flex-1">
      <h2 className="text-xl font-black text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
    </div>
  </div>
);

const NavRow = ({onPrev,onNext,showNext=true,extras}:any) => (
  <div className="flex items-center justify-between pt-6 mt-8 border-t border-gray-100">
    <button onClick={onPrev} className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all">
      <ChevronLeft size={15}/> Previous
    </button>
    <div className="flex items-center gap-3">{extras}
      {showNext&&<button onClick={onNext} className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-md shadow-green-200">
        Next <ChevronRight size={15}/>
      </button>}
    </div>
  </div>
);

const ResetBtn = ({onReset,label='Reset Section'}:{onReset:()=>void;label?:string}) => (
  <button onClick={onReset} className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 bg-red-50 hover:bg-red-100 rounded-xl transition-all">
    <RotateCcw size={11}/> {label}
  </button>
);

// Excel premium export button
const XlsBtn = ({onClick,label='Export Excel'}:{onClick:()=>void;label?:string}) => (
  <button onClick={onClick} className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-emerald-700 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all">
    <TableProperties size={11}/> {label}
  </button>
);

// ══════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab]     = useState<TabType>('profile');
  const [emp, setEmp]     = useState<EmployeeData>({...BLANK});
  const [showSlip, setShowSlip] = useState(false);

  const yearlyRef  = useRef<HTMLDivElement>(null);
  const billRef    = useRef<HTMLDivElement>(null);
  const annualRef  = useRef<HTMLDivElement>(null);
  const slipRef    = useRef<HTMLDivElement>(null);

  // Salary Arrear
  const [arrCfg, setArrCfg] = useState({startMonth:'2024-01',endMonth:'2026-03',startBasic:35400,level:6,paidDA:50,incMonth:'07' as '01'|'07'});
  const [arrRows, setArrRows] = useState<any[]>([]);
  // DA Arrear
  const [daArrCfg, setDaArrCfg] = useState({startMonth:'2024-01',endMonth:'2026-03',basic:35400,level:6,oldDA:50,newDA:53});
  const [daArrRows, setDaArrRows] = useState<any[]>([]);
  // Arrear sub-tab
  const [arrSubTab, setArrSubTab] = useState<'salary'|'da'>('salary');

  // Salary Bill
  const [sbCfg, setSbCfg]   = useState({month:'February',year:'2025',da:53,hra:18,ma:1000,ta:1800});
  const [sbEmps, setSbEmps] = useState<SBEmployee[]>([]);

  // Yearly summary
  const [yearlyFY, setYearlyFY] = useState('2024-25');
  const [manDed, setManDed]     = useState<Record<string,Record<string,number>>>({});

  const [asEmp, setAsEmp] = useState<EmployeeData>({...BLANK});

  useEffect(()=>{ setAsEmp(p=>({...p,...emp})); },[emp]);

  const setE = (field:keyof EmployeeData) => (v:any) => setEmp(p=>({...p,[field]:typeof p[field]==='number'?(Number(v)||0):v}));

  // Auto-fill on designation select
  const applyDesig = (d:string) => {
    const c=DESIG_CONFIG[d]; if(!c) return;
    setEmp(p=>({...p, designation:d, payLevel:c.level,
      transportAllowance:c.ta, medicalAllowance:c.ma, washingAllowance:c.washing,
      bandPayOld:c.bp6, gradePayOld:c.gp6,
      basicPay7th: PAY_MATRIX[c.level]?.[0]??p.basicPay7th,
      basicPay8th: rnd((PAY_MATRIX[c.level]?.[0]??p.basicPay7th)*p.fitmentFactor8th),
    }));
  };
  const applyLevel = (lv:number) => setEmp(p=>({...p, payLevel:lv,
    basicPay7th:PAY_MATRIX[lv]?.[0]??p.basicPay7th,
    basicPay8th:rnd((PAY_MATRIX[lv]?.[0]??p.basicPay7th)*p.fitmentFactor8th),
  }));

  const goNext = ()=>{ const i=TABS.indexOf(tab); setTab(TABS[i<TABS.length-1?i+1:0]); };
  const goPrev = ()=>{ const i=TABS.indexOf(tab); setTab(TABS[i>0?i-1:TABS.length-1]); };

  // ── CORE SALARY ────────────────────────────────────────────────
  const s7 = useMemo(()=>{
    const b=emp.basicPay7th, da=pct(b,emp.daRate);
    const hra=pct(b,HRA_RATES[emp.hraCategory]*100);
    const taDA=pct(emp.transportAllowance,emp.daRate);
    const gross=b+da+hra+emp.medicalAllowance+emp.transportAllowance+taDA+emp.washingAllowance+emp.otherAllowances;
    const npsEmp=emp.applyNPS?pct(b+da,emp.npsEmployee):0;
    const npsEr =emp.applyNPS?pct(b+da,emp.npsEmployer):0;
    const gis  =emp.applyGIS ?emp.gisContribution:0;
    const pt   =emp.applyPT  ?emp.professionalTax:0;
    const lic  =emp.applyLIC ?emp.licDeduction:0;
    const soc  =emp.applySociety?emp.societyDeduction:0;
    // Auto IT calc
    const grossAnn=gross*12, std=emp.taxRegime==='new'?75000:50000;
    const pf12=npsEmp*12;
    const c80=emp.taxRegime==='old'?Math.min(emp.homeLoanPrincipal+emp.annualPPF+emp.annualLIC+emp.annualTuitionFee+pf12,150000):0;
    const c80d=emp.taxRegime==='old'?Math.min(emp.mediclaim,25000):0;
    const npsV=emp.taxRegime==='old'?Math.min(emp.npsVoluntary,50000):0;
    const npsEr14=emp.taxRegime==='new'?npsEr*12:0;
    const txb=Math.max(0,grossAnn-std-c80-c80d-npsV-npsEr14-(emp.taxRegime==='old'?pt*12+emp.homeLoanInterest:0));
    const annIT=emp.applyIT?calcTax(txb,emp.taxRegime):0;
    const monthIT=rnd(annIT/12);
    const td=npsEmp+gis+pt+lic+soc+monthIT;
    return {b,da,hra,taDA,ta:emp.transportAllowance,ma:emp.medicalAllowance,gross,npsEmp,npsEr,gis,pt,lic,soc,monthIT,annIT,td,net:gross-td};
  },[emp]);

  // ── FIXATION ──────────────────────────────────────────────────
  const fix = useMemo(()=>{
    const total6=emp.bandPayOld+emp.gradePayOld, tent=Math.floor(total6*2.57);
    const mat=PAY_MATRIX[emp.payLevel]||[];
    const fixed=mat.find(v=>v>=tent)||mat[0]||tent;
    return {total6,tent,fixed,step:mat.indexOf(fixed)+1,mat,nextB:nextStep(fixed,emp.payLevel),level:emp.payLevel};
  },[emp]);

  // ── YEARLY DATA ──────────────────────────────────────────────
  const yearlyData = useMemo(()=>{
    const months=getFYMonths(yearlyFY);
    let basic=emp.basicPay7th;
    return months.map(({key,label,mo})=>{
      if(emp.incrementMonth==='07'&&mo===7) basic=nextStep(basic,emp.payLevel);
      if(emp.incrementMonth==='01'&&mo===1) basic=nextStep(basic,emp.payLevel);
      const daR=getDA(key), da=pct(basic,daR);
      const hra=pct(basic,HRA_RATES[emp.hraCategory]*100);
      const taDA=pct(emp.transportAllowance,daR);
      const gross=basic+da+hra+emp.medicalAllowance+emp.transportAllowance+taDA;
      const nps=emp.applyNPS?pct(basic+da,emp.npsEmployee):0;
      const pt=emp.applyPT?emp.professionalTax:0;
      const md=manDed[key]||{};
      const lic=md.lic??0, gis=md.gis??0, itax=md.itax??0, others=md.others??0;
      const td=nps+pt+lic+gis+itax+others;
      return {key,label,basic,daR,da,hra,transport:emp.transportAllowance+taDA,ma:emp.medicalAllowance,gross,nps,pt,lic,gis,itax,others,td,net:gross-td};
    });
  },[emp,yearlyFY,manDed]);

  // ── ARREARS ──────────────────────────────────────────────────
  const genArrears = ()=>{
    let basic=arrCfg.startBasic; const rows:any[]=[];
    const end=new Date(arrCfg.endMonth+'-01'); let cur=new Date(arrCfg.startMonth+'-01');
    while(cur<=end){
      const key=cur.toISOString().slice(0,7), mo=cur.getMonth()+1;
      if(key!==arrCfg.startMonth&&String(mo).padStart(2,'0')===arrCfg.incMonth) basic=nextStep(basic,arrCfg.level);
      const actDA=getDA(key), pDA_r=arrCfg.paidDA;
      const da=pct(basic,actDA), pDA=pct(basic,pDA_r);
      const hra=pct(basic,HRA_RATES[emp.hraCategory]*100);
      const ta=emp.transportAllowance, taDA=pct(ta,actDA), pTaDA=pct(ta,pDA_r);
      const ma=emp.medicalAllowance;
      const gross=basic+da+hra+ta+taDA+ma, pGross=basic+pDA+hra+ta+pTaDA+ma;
      const nps=emp.applyNPS?pct(basic+da,emp.npsEmployee):0;
      const pNps=emp.applyNPS?pct(basic+pDA,emp.npsEmployee):0;
      const pt=emp.applyPT?emp.professionalTax:0;
      rows.push({key,basic,actDA,pDA_r,da,pDA,hra,ta:ta+taDA,pTa:ta+pTaDA,ma,gross,pGross,nps,pNps,pt,net:gross-nps-pt,pNet:pGross-pNps-pt,arrear:(gross-nps-pt)-(pGross-pNps-pt)});
      cur.setMonth(cur.getMonth()+1);
    }
    setArrRows(rows);
  };

  // ── DA ARREARS ────────────────────────────────────────────────
  const genDaArrears = () => {
    let basic = daArrCfg.basic;
    const rows: any[] = [];
    const end = new Date(daArrCfg.endMonth + '-01');
    let cur = new Date(daArrCfg.startMonth + '-01');
    while (cur <= end) {
      const key = cur.toISOString().slice(0, 7);
      // For DA arrear, we look at what actual DA was announced vs what was paid
      // Each period may have different announced DA from history
      const announcedDA = getDA(key); // actual announced DA for that month
      const oldDAamt = pct(basic, daArrCfg.oldDA);
      const newDAamt = pct(basic, announcedDA);
      const daDiff = newDAamt - oldDAamt;
      const oldTaDA = pct(emp.transportAllowance, daArrCfg.oldDA);
      const newTaDA = pct(emp.transportAllowance, announcedDA);
      const taDiff = newTaDA - oldTaDA;
      const oldNPS = emp.applyNPS ? pct(basic + oldDAamt, emp.npsEmployee) : 0;
      const newNPS = emp.applyNPS ? pct(basic + newDAamt, emp.npsEmployee) : 0;
      const npsDiff = newNPS - oldNPS;
      const grossDiff = daDiff + taDiff;
      const netDiff = grossDiff - npsDiff;
      rows.push({ key, basic, oldDA: daArrCfg.oldDA, announcedDA, oldDAamt, newDAamt, daDiff, oldTaDA, newTaDA, taDiff, grossDiff, oldNPS, newNPS, npsDiff, netDiff });
      cur.setMonth(cur.getMonth() + 1);
    }
    setDaArrRows(rows);
  };

  const exportDaArrears = () => {
    if (!daArrRows.length) return;
    const hdr = ['Month','Basic','Paid DA%','Actual DA%','Old DA Amt','Actual DA Amt','DA Diff','Old TA+DA','Actual TA+DA','TA Diff','Gross Arrear','Old NPS','New NPS','NPS Diff','NET DA ARREAR'];
    exportCSV([
      ['GURU NANAK COLLEGE, DHANBAD — DA ARREAR STATEMENT'],
      [`Employee: ${fullName}   Level: ${daArrCfg.level}   Period: ${daArrCfg.startMonth} to ${daArrCfg.endMonth}`],
      [`Paid DA: ${daArrCfg.oldDA}%   Actual DA auto-fetched from Govt. history   Basic: ₹${fmt(daArrCfg.basic)}`],
      [],
      hdr,
      ...daArrRows.map(r => [r.key, r.basic, r.oldDA+'%', r.announcedDA+'%', r.oldDAamt, r.newDAamt, r.daDiff, r.oldTaDA, r.newTaDA, r.taDiff, r.grossDiff, r.oldNPS, r.newNPS, r.npsDiff, r.netDiff]),
      [],
      ['TOTAL','','','',
        daArrRows.reduce((s,r)=>s+r.oldDAamt,0), daArrRows.reduce((s,r)=>s+r.newDAamt,0),
        daArrRows.reduce((s,r)=>s+r.daDiff,0), '', '',
        daArrRows.reduce((s,r)=>s+r.taDiff,0), daArrRows.reduce((s,r)=>s+r.grossDiff,0),
        daArrRows.reduce((s,r)=>s+r.oldNPS,0), daArrRows.reduce((s,r)=>s+r.newNPS,0),
        daArrRows.reduce((s,r)=>s+r.npsDiff,0), daArrRows.reduce((s,r)=>s+r.netDiff,0),
      ],
    ], `DA_Arrears_${emp.name||'Employee'}_${daArrCfg.startMonth}_${daArrCfg.endMonth}.csv`);
  };

  // ── ANNUAL STATEMENT ─────────────────────────────────────────
  const annData = useMemo(()=>{
    const e=asEmp, months=getFYMonths(e.financialYear);
    let basic=e.basicPay7th;
    const rows=months.map(({key,label,mo})=>{
      if(e.incrementMonth==='07'&&mo===7) basic=nextStep(basic,e.payLevel);
      if(e.incrementMonth==='01'&&mo===1) basic=nextStep(basic,e.payLevel);
      const daR=getDA(key), da=pct(basic,daR), hra=pct(basic,HRA_RATES[e.hraCategory]*100);
      const ta=e.transportAllowance, ma=e.medicalAllowance, total=basic+da+hra+ta+ma;
      const pf=e.applyNPS?pct(basic+da,e.npsEmployee):0;
      const pt=e.applyPT?e.professionalTax:0, gsli=e.gisContribution;
      const gA=total*12, std=e.taxRegime==='new'?75000:50000;
      const pf12=pf*12, npsEr12=e.applyNPS?pct(basic+da,e.npsEmployer)*12:0;
      const c80=e.taxRegime==='old'?Math.min(e.homeLoanPrincipal+e.annualPPF+e.annualLIC+e.annualTuitionFee+pf12,150000):0;
      const c80d=e.taxRegime==='old'?Math.min(e.mediclaim,25000):0;
      const npsV=e.taxRegime==='old'?Math.min(e.npsVoluntary,50000):0;
      const txb=Math.max(0,gA-std-c80-c80d-npsV-(e.taxRegime==='new'?npsEr12:pt*12+e.homeLoanInterest));
      const it=rnd(calcTax(txb,e.taxRegime)/12);
      return {key,label,basic,daR,da,hra,ta,ma,total,pf,gsli,pt,it};
    });
    const tot=rows.reduce((a,r)=>({basic:a.basic+r.basic,da:a.da+r.da,hra:a.hra+r.hra,ta:a.ta+r.ta,ma:a.ma+r.ma,total:a.total+r.total,pf:a.pf+r.pf,gsli:a.gsli+r.gsli,pt:a.pt+r.pt,it:a.it+r.it}),{basic:0,da:0,hra:0,ta:0,ma:0,total:0,pf:0,gsli:0,pt:0,it:0});
    const grossA=tot.total, std=e.taxRegime==='new'?75000:50000, pfA=tot.pf;
    const npsEr12A=e.applyNPS?pct(e.basicPay7th+pct(e.basicPay7th,e.daRate),e.npsEmployer)*12:0;
    const c80=e.taxRegime==='old'?Math.min(e.homeLoanPrincipal+e.annualPPF+e.annualLIC+e.annualTuitionFee+pfA,150000):0;
    const c80d=e.taxRegime==='old'?Math.min(e.mediclaim,25000):0;
    const npsV=e.taxRegime==='old'?Math.min(e.npsVoluntary,50000):0;
    const sec16=tot.pt;
    const txb=Math.max(0,grossA-std-c80-c80d-npsV-(e.taxRegime==='new'?npsEr12A:sec16+e.homeLoanInterest));
    const totalTax=calcTax(txb,e.taxRegime);
    return {rows,tot,grossA,std,c80,c80d,npsV,sec16,txb,totalTax,pfA,npsEr12A};
  },[asEmp]);

  // ── TAX DETAIL ───────────────────────────────────────────────
  const taxDet = useMemo(()=>{
    const e=emp, b=e.basicPay7th, da=pct(b,e.daRate);
    const hra=pct(b,HRA_RATES[e.hraCategory]*100);
    const gross=(b+da+hra+e.transportAllowance+e.medicalAllowance)*12;
    const pf12=e.applyNPS?pct(b+da,e.npsEmployee)*12:0;
    const pt12=e.applyPT?e.professionalTax*12:0;
    const std=50000, c80=Math.min(e.homeLoanPrincipal+e.annualPPF+e.annualLIC+e.annualTuitionFee+pf12,150000);
    const c80d=Math.min(e.mediclaim,25000), npsV=Math.min(e.npsVoluntary,50000), hl=e.homeLoanInterest;
    const txOld=Math.max(0,gross-std-c80-c80d-npsV-pt12-hl);
    const taxOld=calcTax(txOld,'old');
    const std2=75000, npsEr12=e.applyNPS?pct(b+da,e.npsEmployer)*12:0;
    const txNew=Math.max(0,gross-std2-npsEr12);
    const taxNew=calcTax(txNew,'new');
    const slOld=[{r:'Upto ₹2,50,000',rate:0,base:0},{r:'₹2,50,001 – ₹5,00,000',rate:5,base:Math.min(Math.max(0,txOld-250000),250000)},{r:'₹5,00,001 – ₹10,00,000',rate:20,base:Math.min(Math.max(0,txOld-500000),500000)},{r:'Above ₹10,00,000',rate:30,base:Math.max(0,txOld-1000000)}];
    const slNew=[{r:'Upto ₹3,00,000',rate:0,base:0},{r:'₹3,00,001 – ₹6,00,000',rate:5,base:Math.min(Math.max(0,txNew-300000),300000)},{r:'₹6,00,001 – ₹9,00,000',rate:10,base:Math.min(Math.max(0,txNew-600000),300000)},{r:'₹9,00,001 – ₹12,00,000',rate:15,base:Math.min(Math.max(0,txNew-900000),300000)},{r:'₹12,00,001 – ₹15,00,000',rate:20,base:Math.min(Math.max(0,txNew-1200000),300000)},{r:'Above ₹15,00,000',rate:30,base:Math.max(0,txNew-1500000)}];
    return {gross,pf12,pt12,std,c80,c80d,npsV,hl,txOld,taxOld,std2,npsEr12,txNew,taxNew,slOld,slNew};
  },[emp]);

  const sbCalc = (sb:SBEmployee) => {
    const b=sb.basicOn2024, da=pct(b,sbCfg.da), hra=pct(b,sbCfg.hra);
    const ta=sbCfg.ta+pct(sbCfg.ta,sbCfg.da), pf=pct(b,10);
    return {da,hra,ma:sbCfg.ma,ta,pf,gross:b+da+hra+sbCfg.ma+ta+pf};
  };

  const fullName = `${emp.salutation} ${emp.name}`.trim()||'Employee Name';
  const yTot = (k:keyof typeof yearlyData[0]) => yearlyData.reduce((s,r)=>s+((r[k] as number)||0),0);

  // Excel exports
  const exportYearly = () => {
    const hdr = ['Month','Basic','DA%','DA','HRA','Transport','Medical','GROSS','NPS/PF','Prof.Tax','Total Deductions','NET PAY'];
    const rows = yearlyData.map(r=>[r.label,r.basic,r.daR+'%',r.da,r.hra,r.transport,r.ma,r.gross,r.nps,r.pt,r.td,r.net]);
    const totR = ['TOTAL','','',...(['da','hra','transport','ma','gross','nps','pt','td','net'] as const).map(k=>yTot(k))];
    exportCSV([
      [`GURU NANAK COLLEGE, DHANBAD — YEARLY SALARY SUMMARY`],
      [`Employee: ${fullName}   Designation: ${emp.designation}   FY: ${yearlyFY}`],
      [`College: ${emp.college||'—'}   PAN: ${emp.panNumber||'—'}   Pay Level: ${emp.payLevel}`],
      [],
      hdr, ...rows, [], totR,
      [],['Generated by Guru Nanak College Pay Manager — 7th CPC Guidelines'],
    ], `YearlySummary_${emp.name||'Employee'}_${yearlyFY}.csv`);
  };

  const exportArrears = () => {
    if(!arrRows.length) return;
    const hdr=['Month','Basic','Actual DA%','Paid DA%','DA Actual','DA Paid','HRA','TA Actual','MA','Gross Actual','Gross Paid','NPS Actual','NPS Paid','Prof.Tax','Net Actual','Net Paid','ARREAR'];
    exportCSV([
      ['GURU NANAK COLLEGE, DHANBAD — ARREAR STATEMENT'],
      [`Employee: ${fullName}   Level: ${arrCfg.level}   Period: ${arrCfg.startMonth} to ${arrCfg.endMonth}`],
      [],
      hdr,
      ...arrRows.map(r=>[r.key,r.basic,r.actDA+'%',r.pDA_r+'%',r.da,r.pDA,r.hra,r.ta,r.ma,r.gross,r.pGross,r.nps,r.pNps,r.pt,r.net,r.pNet,r.arrear]),
      [],
      ['TOTAL','','','','','','','','',
        arrRows.reduce((s,r)=>s+r.gross,0),arrRows.reduce((s,r)=>s+r.pGross,0),
        arrRows.reduce((s,r)=>s+r.nps,0),arrRows.reduce((s,r)=>s+r.pNps,0),
        arrRows.reduce((s,r)=>s+r.pt,0),arrRows.reduce((s,r)=>s+r.net,0),
        arrRows.reduce((s,r)=>s+r.pNet,0),arrRows.reduce((s,r)=>s+r.arrear,0)
      ],
    ], `Arrears_${emp.name||'Employee'}.csv`);
  };

  const exportAnnual = () => {
    const hdr=['Month','Basic pay','D.A','HRA','Transport','M.A','Total','P.F','GSLI','Prof.Tax','I.TAX'];
    exportCSV([
      ['GURU NANAK COLLEGE — ANNUAL SALARY STATEMENT'],
      [`${fullName}   PAN: ${emp.panNumber||'—'}   FY: ${asEmp.financialYear}`],
      [],
      hdr,
      ...annData.rows.map(r=>[r.label,r.basic,r.da,r.hra,r.ta,r.ma,r.total,r.pf,r.gsli,r.pt,r.it]),
      [],
      ['TOTAL',annData.tot.basic,annData.tot.da,annData.tot.hra,annData.tot.ta,annData.tot.ma,annData.tot.total,annData.tot.pf,annData.tot.gsli,annData.tot.pt,annData.tot.it],
      [],
      ['Gross Annual Income','',annData.grossA],
      ['Taxable Income','',annData.txb],
      ['Total Tax Payable','',annData.totalTax],
    ], `AnnualStatement_${emp.name||'Employee'}_${asEmp.financialYear}.csv`);
  };

  const exportSalarySlip = () => {
    exportCSV([
      ['GURU NANAK COLLEGE, DHANBAD — SALARY SLIP'],
      [`${emp.college||'University/College'}, Dhanbad`],
      [`Month: ${emp.salaryMonth} ${emp.salaryYear}`],
      [],
      ['EMPLOYEE DETAILS','',''],
      ['Name', fullName,''],
      ['Designation', emp.designation,''],
      ['Department', emp.department,''],
      ['Pay Level', `Level ${emp.payLevel}`,''],
      ['PAN', emp.panNumber,''],
      ['PRAN', emp.pranNumber,''],
      [],
      ['EARNINGS','Amount','DEDUCTIONS','Amount'],
      ['Basic Pay',s7.b,'NPS Employee',s7.npsEmp],
      [`DA (${emp.daRate}%)`,s7.da,'NPS Employer (College)',s7.npsEr],
      [`HRA (${emp.hraCategory})`,s7.hra,'GIS',s7.gis],
      ['Transport + DA',s7.ta+s7.taDA,'Professional Tax',s7.pt],
      ['Medical Allowance',s7.ma,'LIC/Other',s7.lic+s7.soc],
      ['','','Income Tax (TDS)',s7.monthIT],
      ['GROSS TOTAL',s7.gross,'TOTAL DEDUCTIONS',s7.td],
      [],
      ['NET MONTHLY PAYABLE',s7.net],
      ['In Words',toWords(s7.net)],
    ], `SalarySlip_${emp.name||'Employee'}_${emp.salaryMonth}${emp.salaryYear}.csv`);
  };

  // ══════════════════════════════════════════════════════════════
  // SALARY SLIP COMPONENT (for print)
  // ══════════════════════════════════════════════════════════════
  const SalarySlip = () => (
    <div ref={slipRef} className="bg-white font-serif" style={{fontFamily:'Georgia,serif'}}>
      {/* Header */}
      <div style={{textAlign:'center',borderBottom:'3px double #000',paddingBottom:'12px',marginBottom:'14px'}}>
        <p style={{fontSize:'13px',fontWeight:'900',textTransform:'uppercase',letterSpacing:'2px'}}>Guru Nanak College, Dhanbad</p>
        <p style={{fontSize:'11px',fontWeight:'bold',marginTop:'2px'}}>Non-Teaching Staff Salary Statement</p>
        <div style={{display:'flex',justifyContent:'center',gap:'12px',marginTop:'8px'}}>
          <span style={{border:'1px solid #000',padding:'2px 10px',fontSize:'9px',fontWeight:'bold',textDecoration:'underline'}}>PRO VERSION</span>
          <span style={{border:'1px solid #000',padding:'2px 10px',fontSize:'9px',fontWeight:'bold',textDecoration:'underline'}}>Ref: GNC-{new Date().getFullYear()}</span>
        </div>
        <p style={{fontSize:'9px',fontStyle:'italic',marginTop:'8px',color:'#555'}}>Generated by Guru Nanak College Pay Manager on {new Date().toLocaleString()}</p>
      </div>

      {/* Employee details */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginBottom:'16px'}}>
        <div>
          <p style={{fontSize:'9px',fontWeight:'bold',textDecoration:'underline',marginBottom:'8px'}}>EMPLOYEE DETAILS</p>
          {[['Name', fullName],['Designation',emp.designation],['Department',emp.college?emp.college+', '+emp.department:emp.department],['Joining Date',emp.dateOfJoining],['PAN Number',emp.panNumber||'—']].map(([k,v])=>(
            <p key={k} style={{display:'flex',justifyContent:'space-between',marginBottom:'4px',fontSize:'10px'}}>
              <strong>{k}:</strong><span style={{textAlign:'right'}}>{v}</span>
            </p>
          ))}
        </div>
        <div>
          <p style={{fontSize:'9px',fontWeight:'bold',textDecoration:'underline',marginBottom:'8px'}}>SERVICE DETAILS</p>
          {[['PRAN Number',emp.pranNumber||'—'],['Bank A/c',emp.bankAccount||'—'],['IFSC Code',emp.ifscCode||'—'],['Pay Matrix Level',`Level ${emp.payLevel}`],['Tax Regime',emp.taxRegime==='new'?`New (FY ${emp.financialYear})`:'Old (With Deductions)']].map(([k,v])=>(
            <p key={k} style={{display:'flex',justifyContent:'space-between',marginBottom:'4px',fontSize:'10px'}}>
              <strong>{k}:</strong><span style={{textAlign:'right'}}>{v}</span>
            </p>
          ))}
        </div>
      </div>

      {/* Salary table */}
      <div style={{border:'2px solid #000',marginBottom:'14px'}}>
        <div style={{background:'#f0f0f0',padding:'6px',fontWeight:'bold',textAlign:'center',fontSize:'11px',borderBottom:'2px solid #000',letterSpacing:'1px'}}>
          MONTHLY SALARY BREAKDOWN (7TH PAY) — {emp.salaryMonth.toUpperCase()} {emp.salaryYear}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr'}}>
          <div style={{padding:'12px',borderRight:'1px solid #000'}}>
            <p style={{fontSize:'9px',fontWeight:'bold',textDecoration:'underline',marginBottom:'8px'}}>EARNINGS</p>
            {[
              ['Basic Pay', s7.b],
              [`DA (${emp.daRate}%)`, s7.da],
              [`HRA – ${emp.hraCategory} (${rnd(HRA_RATES[emp.hraCategory]*100)}%)`, s7.hra],
              ['Medical Allowance', s7.ma],
              [`Transport Allowance`, s7.ta+s7.taDA],
              ...(s7.washing>0?[['Washing Allowance',s7.washing]]:[] as any),
              ...(s7.others>0?[['Other Allowances',s7.others]]:[] as any),
            ].map(([k,v])=>(
              <p key={String(k)} style={{display:'flex',justifyContent:'space-between',marginBottom:'4px',fontSize:'10px'}}>
                <span>{k}:</span><span>{rs(Number(v))}</span>
              </p>
            ))}
            <div style={{borderTop:'2px solid #000',paddingTop:'6px',marginTop:'6px',display:'flex',justifyContent:'space-between',fontWeight:'900',fontSize:'11px'}}>
              <span>Gross Total:</span><span>{rs(s7.gross)}</span>
            </div>
          </div>
          <div style={{padding:'12px'}}>
            <p style={{fontSize:'9px',fontWeight:'bold',textDecoration:'underline',marginBottom:'8px'}}>DEDUCTIONS</p>
            {[
              ...(emp.applyNPS?[['NPS (10% B+D)',s7.npsEmp],['NPS Employer (14%)',s7.npsEr]]:[] as any),
              ...(emp.applyGIS?[['GIS Contribution',s7.gis]]:[] as any),
              ...(emp.applyPT?[['Professional Tax',s7.pt]]:[] as any),
              ...(emp.applyIT?[['Income Tax (TDS)',s7.monthIT]]:[] as any),
              ...(emp.applyLIC?[['LIC Deduction',s7.lic]]:[] as any),
              ...(emp.applySociety?[['Society Deduction',s7.soc]]:[] as any),
            ].map(([k,v]:any)=>(
              <p key={k} style={{display:'flex',justifyContent:'space-between',marginBottom:'4px',fontSize:'10px'}}>
                <span>{k}:</span><span>{rs(Number(v))}</span>
              </p>
            ))}
            <div style={{borderTop:'2px solid #000',paddingTop:'6px',marginTop:'6px',display:'flex',justifyContent:'space-between',fontWeight:'900',fontSize:'11px'}}>
              <span>Total Deductions:</span><span>{rs(s7.td)}</span>
            </div>
          </div>
        </div>
        <div style={{background:'#1a1a1a',color:'#fff',padding:'14px',textAlign:'center',borderTop:'2px solid #000'}}>
          <p style={{fontSize:'10px',fontWeight:'bold',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'4px'}}>Net Monthly Payable</p>
          <p style={{fontSize:'28px',fontWeight:'900',letterSpacing:'-1px'}}>₹{fmt(s7.net)}/-</p>
          <p style={{fontSize:'9px',marginTop:'4px',opacity:0.7}}>{toWords(s7.net)}</p>
        </div>
      </div>

      {/* Tax note */}
      {s7.monthIT > 0 && (
        <div style={{border:'1px solid #ccc',padding:'8px',marginBottom:'12px',fontSize:'9px',background:'#fafafa'}}>
          <p style={{fontWeight:'bold',marginBottom:'4px'}}>Annual Tax Summary (Auto-computed)</p>
          <p>Gross Annual: {rs(s7.gross*12)} | Taxable Income: {rs(Math.max(0,s7.gross*12-(emp.taxRegime==='new'?75000:50000)))} | Annual Tax: {rs(s7.annIT)} | Regime: {emp.taxRegime==='new'?'New':'Old'}</p>
        </div>
      )}

      {/* Signatures */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',textAlign:'center',marginTop:'30px',gap:'20px'}}>
        <div style={{borderTop:'1px solid #000',paddingTop:'6px',fontSize:'9px',fontWeight:'bold'}}>
          <p>Employee Signature</p><p style={{marginTop:'4px',fontStyle:'italic'}}>{fullName}</p>
        </div>
        <div style={{borderTop:'1px solid #000',paddingTop:'6px',fontSize:'9px',fontWeight:'bold'}}>
          <p>Dealing Assistant</p>
        </div>
        <div style={{borderTop:'1px solid #000',paddingTop:'6px',fontSize:'9px',fontWeight:'bold'}}>
          <p>Registrar / Principal / DDO</p><p style={{marginTop:'4px',fontStyle:'italic'}}>{emp.college||'—'}</p>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Salary Slip Modal */}
      <AnimatePresence>
        {showSlip && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div initial={{scale:0.95,y:20}} animate={{scale:1,y:0}} exit={{scale:0.95,y:20}}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between rounded-t-2xl">
                <span className="font-black text-gray-800">Salary Slip Preview</span>
                <div className="flex items-center gap-2">
                  <button onClick={()=>doPrint(slipRef,'Salary Slip')} className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 text-white rounded-lg text-xs font-bold hover:bg-cyan-700">
                    <Printer size={12}/> Print
                  </button>
                  <button onClick={exportSalarySlip} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700">
                    <Download size={12}/> Export CSV
                  </button>
                  <button onClick={()=>setShowSlip(false)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200">
                    <X size={14}/>
                  </button>
                </div>
              </div>
              <div className="p-6"><SalarySlip/></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shadow">
              <Calculator size={16} className="text-white"/>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-black text-gray-900 tracking-tight">Guru Nanak College, Dhanbad</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-green-100 text-green-700 border border-green-200 rounded-md">Pay Manager</span>            </div>
          </div>
          <div className="flex items-center gap-3">
            {emp.name && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                <User size={11} className="text-green-600"/>
                <span className="text-xs font-bold text-green-800">{fullName}</span>
                <span className="text-[10px] text-green-500">· {emp.designation||'—'}</span>
              </div>
            )}
            <span className="text-xs text-gray-400 hidden md:block">FY {emp.financialYear}</span>
            <button onClick={()=>{setEmp({...BLANK});setManDed({});setArrRows([]);setSbEmps([]);setTab('profile');}}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 bg-red-50 rounded-lg transition-all">
              <RefreshCw size={11}/> New Employee
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-4 py-5 flex gap-5">
        {/* SIDEBAR */}
        <aside className="w-52 shrink-0">
          <div className="sticky top-20 space-y-0.5">
            {NAV_ITEMS.map(item=>{
              const isA=tab===item.id;
              return (
                <button key={item.id} onClick={()=>setTab(item.id as TabType)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 ${isA?'bg-white shadow-md border border-gray-200':'hover:bg-white/70 hover:shadow-sm'}`}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={isA?{background:item.color+'18',border:`1px solid ${item.color}33`}:{background:'transparent'}}>
                    <item.icon size={13} style={{color:isA?item.color:'#9ca3af'}}/>
                  </div>
                  <span className={`text-[11px] font-semibold leading-tight ${isA?'text-gray-900':'text-gray-500'}`}>{item.label}</span>
                  {isA&&<ChevronRight size={11} className="ml-auto shrink-0" style={{color:item.color}}/>}
                </button>
              );
            })}
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.16}}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[80vh]">

              {/* ════ PROFILE ════ */}
              {tab==='profile'&&(
                <div className="p-8">
                  <div className="flex items-start justify-between">
                    <SectionHead title="Employee Profile" subtitle="Select designation for auto-fill. All sections update automatically." icon={User} accent="#16a34a"/>
                    <ResetBtn onReset={()=>setEmp({...BLANK})} label="Reset All Fields"/>
                  </div>

                  <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                    <Zap size={14} className="text-green-600 shrink-0"/>
                    <p className="text-xs text-green-800"><strong>Smart Auto-fill:</strong> Select designation → Pay Level, Allowances, Band Pay, Grade Pay fill automatically. Basic Pay shows all matrix cells as dropdown.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div><Lbl c="Salutation"/><TSel value={emp.salutation} onChange={setE('salutation')} options={SALUTATIONS.map(s=>({value:s,label:s}))}/></div>
                    <div className="col-span-2"><Lbl c="Full Name"/><TIn value={emp.name} onChange={setE('name')} placeholder="e.g. Sadhan Kumar Mishra"/></div>
                    <div><Lbl c="Designation (Auto-fills Pay)"/><TSel value={emp.designation} onChange={applyDesig} grouped={DESIG_GROUPS}/><p className="text-[10px] text-green-600 mt-1">↑ Selects pay level & allowances</p></div>
                    <div><Lbl c="Department"/><TSel value={emp.department} onChange={setE('department')} options={DEPARTMENTS.map(d=>({value:d,label:d}))}/></div>
                    <div><Lbl c="College / Institution"/><TIn value={emp.college} onChange={setE('college')} placeholder="e.g. Guru Nanak College"/></div>
                    <div><Lbl c="PAN Number"/><TIn value={emp.panNumber} onChange={setE('panNumber')} placeholder="ABCDE1234F"/></div>
                    <div><Lbl c="PRAN / NPS Number"/><TIn value={emp.pranNumber} onChange={setE('pranNumber')}/></div>
                    <div><Lbl c="Date of Joining"/><TIn value={emp.dateOfJoining} onChange={setE('dateOfJoining')} placeholder="DD.MM.YYYY"/></div>
                    <div><Lbl c="Bank Account No."/><TIn value={emp.bankAccount} onChange={setE('bankAccount')}/></div>
                    <div><Lbl c="IFSC Code"/><TIn value={emp.ifscCode} onChange={setE('ifscCode')}/></div>
                    <div><Lbl c="Financial Year"/><TIn value={emp.financialYear} onChange={setE('financialYear')} placeholder="2024-25"/></div>
                    <div><Lbl c="Increment Month"/><TSel value={emp.incrementMonth} onChange={(v:any)=>setEmp(p=>({...p,incrementMonth:v}))} options={[{value:'07',label:'July (Standard)'},{value:'01',label:'January'}]}/></div>
                  </div>

                  {/* Pay structure */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl mb-5">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Pay Structure (7th CPC)</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div><Lbl c="Pay Level"/><TSel value={emp.payLevel} onChange={(v:string)=>applyLevel(Number(v))} options={Object.keys(PAY_MATRIX).map(l=>({value:Number(l),label:`Level ${l}`}))}/></div>
                      <div><Lbl c="Current Basic Pay"/><TSel value={emp.basicPay7th} onChange={(v:string)=>setEmp(p=>({...p,basicPay7th:Number(v)}))} options={(PAY_MATRIX[emp.payLevel]||[]).map((v,i)=>({value:v,label:`Cell ${i+1} — ₹${fmt(v)}`}))}/></div>
                      <div><Lbl c="DA Rate (%)"/><TSel value={emp.daRate} onChange={(v:string)=>setEmp(p=>({...p,daRate:Number(v)}))} options={[65,61,57,53,50,46,42,38,31,28,17,12,9,7,5,4,2,0].map(d=>({value:d,label:`${d}%${d===65?' (Jan 2026)':d===61?' (Jul 2025)':d===57?' (Jan 2025)':d===53?' (Jul 2024)':d===50?' (Jan 2024)':''}`}))}/></div>
                      <div><Lbl c="HRA City Category"/><TSel value={emp.hraCategory} onChange={(v:any)=>setEmp(p=>({...p,hraCategory:v}))} options={[{value:'X',label:'X – 27% (Metro)'},{value:'Y',label:'Y – 18% (Large City)'},{value:'Z',label:'Z – 9% (Small City)'}]}/></div>
                      <div><Lbl c="Medical Allowance (₹)"/><TIn type="number" value={emp.medicalAllowance} onChange={setE('medicalAllowance')}/></div>
                      <div><Lbl c="Transport Allowance (₹)"/><TIn type="number" value={emp.transportAllowance} onChange={setE('transportAllowance')}/></div>
                      <div><Lbl c="Washing Allowance (₹)"/><TIn type="number" value={emp.washingAllowance} onChange={setE('washingAllowance')}/></div>
                      <div><Lbl c="Other Allowances (₹)"/><TIn type="number" value={emp.otherAllowances} onChange={setE('otherAllowances')}/></div>
                    </div>
                  </div>

                  {/* PF / NPS */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-5">
                    <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2"><Shield size={11}/>PF / NPS Contribution</p>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div><Lbl c="Employee NPS % (of Basic+DA)"/><TSel value={emp.npsEmployee} onChange={(v:string)=>setEmp(p=>({...p,npsEmployee:Number(v)}))} options={[10,12].map(v=>({value:v,label:`${v}% (Employee)`}))}/></div>
                      <div><Lbl c="Employer NPS % (College share)"/><TSel value={emp.npsEmployer} onChange={(v:string)=>setEmp(p=>({...p,npsEmployer:Number(v)}))} options={[14,10,8].map(v=>({value:v,label:`${v}% (Employer)`}))}/></div>
                      <div className="flex items-end"><TToggle checked={emp.applyNPS} onChange={v=>setEmp(p=>({...p,applyNPS:v}))} label={`Apply NPS — Employee: ${pct(s7.b+s7.da,emp.npsEmployee).toLocaleString('en-IN')} | Employer: ${pct(s7.b+s7.da,emp.npsEmployer).toLocaleString('en-IN')}`}/></div>
                    </div>
                    <p className="text-[10px] text-blue-600">PF/NPS Employee portion deducted from salary. Employer portion is college's contribution (not deducted). Annual 80C includes employee PF for tax computation.</p>
                  </div>

                  {/* Other Deductions */}
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl mb-5">
                    <p className="text-[11px] font-black text-orange-600 uppercase tracking-widest mb-4">Other Deductions</p>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div><Lbl c="Professional Tax / Month (₹)"/><TIn type="number" value={emp.professionalTax} onChange={setE('professionalTax')}/></div>
                      <div><Lbl c="GIS Contribution (₹)"/><TIn type="number" value={emp.gisContribution} onChange={setE('gisContribution')}/></div>
                      <div><Lbl c="LIC / Insurance (₹)"/><TIn type="number" value={emp.licDeduction} onChange={setE('licDeduction')}/></div>
                      <div><Lbl c="Society / Cooperative (₹)"/><TIn type="number" value={emp.societyDeduction} onChange={setE('societyDeduction')}/></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <TToggle checked={emp.applyPT} onChange={v=>setEmp(p=>({...p,applyPT:v}))} label="Professional Tax"/>
                      <TToggle checked={emp.applyGIS} onChange={v=>setEmp(p=>({...p,applyGIS:v}))} label="GIS Contribution"/>
                      <TToggle checked={emp.applyLIC} onChange={v=>setEmp(p=>({...p,applyLIC:v}))} label="LIC Deduction"/>
                      <TToggle checked={emp.applySociety} onChange={v=>setEmp(p=>({...p,applySociety:v}))} label="Society Deduction"/>
                      <TToggle checked={emp.applyIT} onChange={v=>setEmp(p=>({...p,applyIT:v}))} label="Income Tax (TDS)"/>
                    </div>
                  </div>

                  {/* Tax & Investments — AUTO */}
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl mb-5">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[11px] font-black text-purple-700 uppercase tracking-widest flex items-center gap-2">
                        <Shield size={11}/>Annual Investments & Tax (Auto-computed as you type)
                      </p>
                      <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-lg">
                        <span className="text-[10px] font-bold text-purple-700">Live Tax:</span>
                        <span className="text-sm font-black text-purple-800">{rs(s7.annIT)}/yr</span>
                        <span className="text-[10px] text-purple-600">= {rs(s7.monthIT)}/mo TDS</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div><Lbl c="Annual PPF (₹)"/><TIn type="number" value={emp.annualPPF} onChange={setE('annualPPF')}/></div>
                      <div><Lbl c="Annual LIC Premium (₹)"/><TIn type="number" value={emp.annualLIC} onChange={setE('annualLIC')}/></div>
                      <div><Lbl c="Home Loan Principal (₹)"/><TIn type="number" value={emp.homeLoanPrincipal} onChange={setE('homeLoanPrincipal')}/></div>
                      <div><Lbl c="Home Loan Interest (₹)"/><TIn type="number" value={emp.homeLoanInterest} onChange={setE('homeLoanInterest')}/></div>
                      <div><Lbl c="Mediclaim / 80D (₹)"/><TIn type="number" value={emp.mediclaim} onChange={setE('mediclaim')}/></div>
                      <div><Lbl c="NPS Voluntary / 80CCD1B (₹)"/><TIn type="number" value={emp.npsVoluntary} onChange={setE('npsVoluntary')}/></div>
                      <div><Lbl c="Tuition Fee (₹)"/><TIn type="number" value={emp.annualTuitionFee} onChange={setE('annualTuitionFee')}/></div>
                    </div>
                    {/* Live tax breakdown */}
                    <div className="p-3 bg-white rounded-xl border border-purple-200 grid grid-cols-4 gap-3 text-center">
                      {[['Gross Annual',s7.gross*12],['PF Contribution',pct(s7.b+s7.da,emp.npsEmployee)*12],['80C Total',Math.min(emp.homeLoanPrincipal+emp.annualPPF+emp.annualLIC+emp.annualTuitionFee+pct(s7.b+s7.da,emp.npsEmployee)*12,150000)],['Taxable Income',Math.max(0,s7.gross*12-(emp.taxRegime==='new'?75000:50000)-Math.min(emp.homeLoanPrincipal+emp.annualPPF+emp.annualLIC+emp.annualTuitionFee+pct(s7.b+s7.da,emp.npsEmployee)*12,150000)-Math.min(emp.mediclaim,25000)-Math.min(emp.npsVoluntary,50000)-(emp.taxRegime==='old'?emp.professionalTax*12+emp.homeLoanInterest:pct(s7.b+s7.da,emp.npsEmployer)*12))]].map(([l,v])=>(
                        <div key={String(l)}><p className="text-[10px] text-gray-500 font-bold">{l}</p><p className="text-sm font-black text-gray-800 mt-0.5">{rs(Number(v))}</p></div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-6">
                      <span className="text-xs text-gray-600 font-bold">Tax Regime:</span>
                      {(['old','new'] as const).map(rg=>(
                        <label key={rg} className="flex items-center gap-2 cursor-pointer" onClick={()=>setEmp(p=>({...p,taxRegime:rg}))}>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${emp.taxRegime===rg?'border-green-600':'border-gray-300'}`}>
                            {emp.taxRegime===rg&&<div className="w-2 h-2 bg-green-600 rounded-full"/>}
                          </div>
                          <span className="text-sm font-medium text-gray-700">{rg==='old'?'Old Regime (80C/80D deductions)':'New Regime (simplified, no 80C)'}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <NavRow onPrev={goPrev} onNext={goNext}/>
                </div>
              )}

              {/* ════ FIXATION ════ */}
              {tab==='fixation'&&(
                <div className="p-8">
                  <div className="flex items-start justify-between">
                    <SectionHead title="7th Pay Commission Fixation" subtitle={`${fullName} · ${emp.designation} · Level ${emp.payLevel}`} icon={FileText} accent="#2563eb"/>
                    <ResetBtn onReset={()=>setEmp(p=>({...p,bandPayOld:9300,gradePayOld:4200}))} label="Reset 6th CPC"/>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
                    <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-3">6th CPC Details</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Lbl c="Pay Band (6th CPC)"/>
                        <select value={Object.entries(BAND_PAY_OPTIONS).find(([,v])=>v.values.includes(emp.bandPayOld))?.[0]||'PB-2 (₹9300-34800)'}
                          onChange={e=>{const first=BAND_PAY_OPTIONS[e.target.value]?.values[0]||9300; setEmp(p=>({...p,bandPayOld:first}));}}
                          className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm text-gray-900 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2">
                          {Object.keys(BAND_PAY_OPTIONS).map(k=><option key={k} value={k}>{k}</option>)}
                        </select>
                        <Lbl c="Band Pay Amount"/>
                        <TSel value={emp.bandPayOld} onChange={(v:string)=>setEmp(p=>({...p,bandPayOld:Number(v)}))}
                          options={(Object.values(BAND_PAY_OPTIONS).find(v=>v.values.includes(emp.bandPayOld))?.values || BAND_PAY_OPTIONS['PB-2 (₹9300-34800)'].values).map(v=>({value:v,label:rs(v)}))}/>
                      </div>
                      <div>
                        <Lbl c="Grade Pay (6th CPC)"/>
                        <TSel value={emp.gradePayOld} onChange={(v:string)=>setEmp(p=>({...p,gradePayOld:Number(v)}))}
                          options={GRADE_PAY_OPTIONS.map(v=>({value:v,label:`₹${v} / Grade Pay`}))}/>
                      </div>
                      <div>
                        <Lbl c="Target Level (7th CPC)"/>
                        <TSel value={emp.payLevel} onChange={(v:string)=>applyLevel(Number(v))} options={Object.keys(PAY_MATRIX).map(l=>({value:Number(l),label:`Level ${l}`}))}/>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-7">
                    {[
                      {n:1,lbl:'6th CPC Basic Pay',desc:`Band Pay ${rs(emp.bandPayOld)} + Grade Pay ${rs(emp.gradePayOld)}`,val:fix.total6,hi:false},
                      {n:2,lbl:'Apply Fitment Factor × 2.57',desc:`${rs(fix.total6)} × 2.57 = ${rs(fix.tent)} (Tentative)`,val:fix.tent,hi:false},
                      {n:3,lbl:`Find Cell in Level-${fix.level} Matrix`,desc:`Next value ≥ ${rs(fix.tent)}`,val:fix.fixed,hi:true},
                      {n:4,lbl:'Fixed 7th CPC Basic Pay',desc:`Cell No. ${fix.step} of Level ${fix.level}`,val:fix.fixed,hi:true},
                    ].map(s=>(
                      <div key={s.n} className={`flex items-center gap-5 p-4 rounded-xl border ${s.hi?'bg-blue-50 border-blue-200':'bg-gray-50 border-gray-200'}`}>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${s.hi?'bg-blue-600 text-white':'bg-gray-300 text-gray-600'}`}>{s.n}</div>
                        <div className="flex-1"><p className={`font-bold text-sm ${s.hi?'text-blue-900':'text-gray-700'}`}>{s.lbl}</p><p className="text-xs text-gray-500 mt-0.5">{s.desc}</p></div>
                        <div className={`text-xl font-black ${s.hi?'text-blue-700':'text-gray-500'}`}>{rs(s.val)}</div>
                        {s.hi&&<CheckCircle2 size={18} className="text-blue-600 shrink-0"/>}
                      </div>
                    ))}
                  </div>

                  <div className="mb-6">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Level-{fix.level} Pay Matrix — Click to Select</p>
                    <div className="flex flex-wrap gap-2">
                      {fix.mat.map((v,i)=>(
                        <div key={i} onClick={()=>setEmp(p=>({...p,basicPay7th:v}))}
                          className={`px-3 py-2 rounded-lg text-xs font-bold border cursor-pointer transition-all ${v===fix.fixed?'bg-blue-600 text-white border-blue-600 shadow scale-105':v===emp.basicPay7th?'bg-green-100 text-green-800 border-green-400':v<fix.tent?'bg-gray-100 text-gray-400 border-gray-200':'bg-white text-gray-700 border-gray-300 hover:border-blue-400'}`}>
                          {i+1}. {rs(v)}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    {[{l:'6th CPC Basic',v:fix.total6,c:'gray'},{l:'7th CPC Fixed',v:fix.fixed,c:'blue'},{l:`Cell #${fix.step}`,v:`of Level ${fix.level}`,c:'blue',str:true},{l:'Annual Increment',v:fix.nextB-fix.fixed,c:'green'}].map(c=>(
                      <div key={c.l} className={`p-4 rounded-xl text-center bg-${c.c}-50 border border-${c.c}-200`}>
                        <p className="text-[10px] font-bold text-gray-500 uppercase">{c.l}</p>
                        <p className={`text-xl font-black text-${c.c}-700 mt-1`}>{c.str?String(c.v):rs(Number(c.v))}</p>
                      </div>
                    ))}
                  </div>
                  <NavRow onPrev={goPrev} onNext={goNext}/>
                </div>
              )}

              {/* ════ PROJECTION ════ */}
              {tab==='projection'&&(
                <div className="p-8">
                  <SectionHead title="8th Pay Commission Projection" subtitle={`${fullName} · Projected 2026`} icon={TrendingUp} accent="#7c3aed"/>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <div className="grid grid-cols-2 gap-4 mb-5">
                        <div><Lbl c="7th Current Basic"/><TIn type="number" value={emp.basicPay7th} onChange={setE('basicPay7th')}/></div>
                        <div><Lbl c="Expected 8th Basic"/><TIn type="number" value={emp.basicPay8th} onChange={setE('basicPay8th')}/></div>
                        <div><Lbl c="Fitment Factor"/><TIn type="number" value={emp.fitmentFactor8th} onChange={setE('fitmentFactor8th')}/></div>
                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex flex-col justify-center">
                          <p className="text-[10px] font-bold text-purple-600">Effective Factor</p>
                          <p className="text-lg font-black text-purple-700 mt-0.5">× {(emp.basicPay8th/emp.basicPay7th).toFixed(2)}</p>
                        </div>
                      </div>
                      {[['7th Current Basic',emp.basicPay7th,false],['8th Projected Basic',emp.basicPay8th,true],['DA 0% (at start)',0,false],[`HRA – ${emp.hraCategory}`,rnd(emp.basicPay8th*HRA_RATES[emp.hraCategory]),false],['Transport',emp.transportAllowance,false],['Medical',emp.medicalAllowance,false]].map(([l,v,hi])=>(
                        <div key={String(l)} className={`flex justify-between px-4 py-2.5 rounded-lg mb-1.5 ${hi?'bg-purple-50 border border-purple-200':''}`}>
                          <span className={`text-sm ${hi?'font-bold text-purple-800':'text-gray-600'}`}>{l}</span>
                          <span className={`font-black text-sm ${hi?'text-purple-700':''}`}>{rs(Number(v))}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="p-6 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl text-center text-white shadow-xl mb-5">
                        <p className="text-xs font-bold opacity-75 uppercase tracking-wider">Estimated 8th CPC Gross</p>
                        <p className="text-4xl font-black mt-2">{rs(emp.basicPay8th+rnd(emp.basicPay8th*HRA_RATES[emp.hraCategory])+emp.transportAllowance+emp.medicalAllowance)}</p>
                        <p className="text-xs opacity-60 mt-2">Per month (DA 0% at inception)</p>
                      </div>
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                        {[['7th Net Pay (now)',s7.net],['8th Gross (est.)',emp.basicPay8th+rnd(emp.basicPay8th*HRA_RATES[emp.hraCategory])+emp.transportAllowance+emp.medicalAllowance]].map(([l,v])=>(
                          <div key={String(l)} className="flex justify-between"><span className="text-sm text-gray-600">{l}</span><span className="font-black">{rs(Number(v))}</span></div>
                        ))}
                        <div className="pt-2 border-t border-gray-200 flex justify-between">
                          <span className="text-sm text-green-700 font-bold">Projected Increase</span>
                          <span className="font-black text-green-700">{rs(emp.basicPay8th+rnd(emp.basicPay8th*HRA_RATES[emp.hraCategory])+emp.transportAllowance+emp.medicalAllowance-s7.net)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <NavRow onPrev={goPrev} onNext={goNext}/>
                </div>
              )}

              {/* ════ MONTHLY SALARY ════ */}
              {tab==='salary'&&(
                <div className="p-8">
                  <div className="flex items-start justify-between">
                    <SectionHead title="Monthly Salary Breakdown" subtitle={`${fullName} · Level-${emp.payLevel} · Basic ${rs(emp.basicPay7th)} · DA ${emp.daRate}%`} icon={IndianRupee} accent="#0891b2"/>
                  </div>

                  {/* Salary slip controls */}
                  <div className="flex items-center gap-3 mb-5 p-3 bg-cyan-50 border border-cyan-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div><Lbl c="Salary Month"/>
                        <TSel value={emp.salaryMonth} onChange={setE('salaryMonth')} options={MONTHS_FULL.map(m=>({value:m,label:m}))}/>
                      </div>
                      <div><Lbl c="Salary Year"/>
                        <TIn value={emp.salaryYear} onChange={setE('salaryYear')} className="w-24"/>
                      </div>
                    </div>
                    <div className="flex-1"/>
                    <button onClick={()=>setShowSlip(true)} className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-bold hover:bg-cyan-700 transition-all shadow-md shadow-cyan-200">
                      <FileText size={15}/> View & Print Salary Slip
                    </button>
                    <button onClick={exportSalarySlip} className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow">
                      <Download size={14}/> Export CSV
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><TrendingUp size={11} className="text-green-600"/>Earnings</h3>
                      {[{l:'Basic Pay',v:s7.b,hi:true},{l:`DA (${emp.daRate}%)`,v:s7.da},{l:`HRA – ${emp.hraCategory} (${rnd(HRA_RATES[emp.hraCategory]*100)}%)`,v:s7.hra},{l:`Transport (${rs(s7.ta)} + DA)`,v:s7.ta+s7.taDA},{l:'Medical Allowance',v:s7.ma},...(emp.washingAllowance>0?[{l:'Washing Allowance',v:emp.washingAllowance}]:[]),...(emp.otherAllowances>0?[{l:'Other Allowances',v:emp.otherAllowances}]:[])].map(row=>(
                        <div key={row.l} className={`flex justify-between items-center px-4 py-2.5 rounded-lg mb-1.5 ${row.hi?'bg-cyan-50 border border-cyan-200':'bg-gray-50'}`}>
                          <span className={`text-sm ${row.hi?'font-bold text-cyan-800':'text-gray-600'}`}>{row.l}</span>
                          <span className={`font-black text-sm ${row.hi?'text-cyan-700':''}`}>{rs(row.v)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center px-4 py-3 bg-cyan-600 text-white rounded-xl mt-2">
                        <span className="font-black">GROSS TOTAL</span><span className="text-xl font-black">{rs(s7.gross)}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><TrendingDown size={11} className="text-red-500"/>Deductions</h3>
                      {[
                        ...(emp.applyNPS?[{l:`NPS Employee (${emp.npsEmployee}% B+DA)`,v:s7.npsEmp},{l:`NPS Employer (${emp.npsEmployer}% — college)`,v:s7.npsEr,note:true}]:[]),
                        ...(emp.applyGIS?[{l:'GIS Contribution',v:s7.gis}]:[]),
                        ...(emp.applyPT?[{l:'Professional Tax',v:s7.pt}]:[]),
                        ...(emp.applyIT&&s7.monthIT>0?[{l:'Income Tax (TDS)',v:s7.monthIT}]:[]),
                        ...(emp.applyLIC?[{l:'LIC Deduction',v:s7.lic}]:[]),
                        ...(emp.applySociety?[{l:'Society Deduction',v:s7.soc}]:[]),
                      ].map((row:any)=>(
                        <div key={row.l} className="flex justify-between items-center px-4 py-2.5 rounded-lg mb-1.5 bg-gray-50">
                          <span className={`text-sm ${row.note?'text-gray-400 italic':'text-gray-600'}`}>{row.l}</span>
                          <span className={`font-black text-sm ${row.note?'text-gray-400':'text-red-600'}`}>{rs(row.v)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center px-4 py-2.5 rounded-lg mb-2 bg-red-50 border border-red-200">
                        <span className="font-bold text-red-700 text-sm">Total Deductions</span>
                        <span className="font-black text-red-700">{rs(s7.td)}</span>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl text-center text-white shadow-lg">
                        <p className="text-xs font-bold opacity-75 uppercase tracking-wider">Net Monthly Pay</p>
                        <p className="text-3xl font-black mt-1">{rs(s7.net)}</p>
                        <p className="text-[10px] mt-1 opacity-70">{toWords(s7.net)}</p>
                      </div>
                    </div>
                  </div>
                  <NavRow onPrev={goPrev} onNext={goNext}/>
                </div>
              )}

              {/* ════ YEARLY SUMMARY ════ */}
              {tab==='yearlysummary'&&(
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <SectionHead title="Yearly Salary Summary" subtitle={`${fullName} · FY ${yearlyFY} — Editable deductions`} icon={BarChart3} accent="#d97706"/>
                    <div className="flex items-center gap-2 shrink-0 mt-[-1rem]">
                      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                        <span className="text-[11px] font-bold text-amber-700">FY</span>
                        <input value={yearlyFY} onChange={e=>setYearlyFY(e.target.value)} className="w-20 bg-transparent text-sm font-bold text-amber-900 focus:outline-none"/>
                      </div>
                      <ResetBtn onReset={()=>setManDed({})} label="Reset Deductions"/>
                      <button onClick={()=>doPrint(yearlyRef,'Yearly Summary')} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 border border-gray-300">
                        <Printer size={12}/> Print
                      </button>
                      <XlsBtn onClick={exportYearly} label="Export CSV"/>
                    </div>
                  </div>
                  <div ref={yearlyRef} className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="text-[11px] w-full border-collapse min-w-[1200px]">
                      <thead>
                        <tr className="bg-amber-700 text-white">
                          {['Month','Basic','DA%','DA','HRA','Transport','Medical','GROSS','NPS/PF','Prof.Tax','Tot.Ded','NET PAY'].map(h=>(
                            <th key={h} className="px-2.5 py-3 text-center font-black whitespace-nowrap border-r border-amber-600/50 last:border-0">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {yearlyData.map((row,i)=>{
                          const setD=(f:string,v:number)=>setManDed(p=>({...p,[row.key]:{...(p[row.key]||{}),[f]:v}}));
                          const ec=(f:string,def:number)=>(
                            <td key={f} className="px-1.5 py-1 border-b border-gray-200 border-r border-gray-200">
                              <input type="number" value={manDed[row.key]?.[f]??def} onChange={e=>setD(f,Number(e.target.value))}
                                className="w-16 px-1.5 py-1 bg-amber-50 border border-amber-300 rounded text-xs text-right font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-amber-500"/>
                            </td>
                          );
                          return (
                            <tr key={row.key} className={`${i%2===0?'bg-white':'bg-gray-50/50'} hover:bg-amber-50/40`}>
                              <td className="px-2.5 py-2 font-bold text-amber-700 text-center border-b border-r border-gray-200 whitespace-nowrap">{row.label}</td>
                              <td className="px-2.5 py-2 text-right border-b border-r border-gray-200 font-medium">{fmt(row.basic)}</td>
                              <td className="px-2.5 py-2 text-center border-b border-r border-gray-200 text-gray-500">{row.daR}%</td>
                              <td className="px-2.5 py-2 text-right border-b border-r border-gray-200">{fmt(row.da)}</td>
                              <td className="px-2.5 py-2 text-right border-b border-r border-gray-200">{fmt(row.hra)}</td>
                              <td className="px-2.5 py-2 text-right border-b border-r border-gray-200">{fmt(row.transport)}</td>
                              <td className="px-2.5 py-2 text-right border-b border-r border-gray-200">{fmt(row.ma)}</td>
                              <td className="px-2.5 py-2 text-right border-b border-r border-gray-200 font-black text-green-700">{fmt(row.gross)}</td>
                              {ec('nps',row.nps)}{ec('pt',row.pt)}
                              <td className="px-2.5 py-2 text-right border-b border-r border-gray-200 font-bold text-red-600">{fmt(row.td)}</td>
                              <td className="px-2.5 py-2 text-right border-b border-gray-200 font-black text-green-700">{fmt(row.net)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-amber-700 text-white font-black text-xs">
                          <td className="px-2.5 py-3 text-center">TOTAL</td>
                          {(['basic','','da','hra','transport','ma','gross','nps','pt','td','net'] as const).map((k,i)=>(
                            <td key={i} className="px-2.5 py-3 text-right border-r border-amber-600/50 last:border-0">
                              {k?fmt(yTot(k as keyof typeof yearlyData[0])):''}
                            </td>
                          ))}
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <p className="text-[10px] text-amber-600 mt-2 flex items-center gap-1.5"><Info size={10}/> Amber cells are editable — click to override any deduction</p>
                  <NavRow onPrev={goPrev} onNext={goNext}/>
                </div>
              )}

              {/* ════ ARREARS ════ */}
              {tab==='arrears'&&(
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <SectionHead title="Arrear Calculator" subtitle={`${fullName} · Salary Arrear & DA Arrear — separate tabs with full logic`} icon={History} accent="#dc2626"/>
                    <div className="flex gap-2 mt-[-1rem]">
                      <ResetBtn onReset={()=>{setArrRows([]);setDaArrRows([]);}} label="Clear All"/>
                      {arrSubTab==='salary'&&arrRows.length>0&&<XlsBtn onClick={exportArrears} label="Export Salary Arrear"/>}
                      {arrSubTab==='da'&&daArrRows.length>0&&<XlsBtn onClick={exportDaArrears} label="Export DA Arrear"/>}
                    </div>
                  </div>

                  {/* Sub-tab switcher */}
                  <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-7 w-fit">
                    {([['salary','Salary Arrear','#dc2626'],['da','DA Arrear','#d97706']] as const).map(([id,label,color])=>(
                      <button key={id} onClick={()=>setArrSubTab(id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-black transition-all ${arrSubTab===id?'bg-white shadow text-gray-900':'text-gray-500 hover:text-gray-700'}`}>
                        <span className="w-2 h-2 rounded-full" style={{background: arrSubTab===id ? color : '#d1d5db'}}/>
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* ── SALARY ARREAR TAB ── */}
                  {arrSubTab==='salary'&&(
                    <>
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-5">
                        <p className="text-[11px] font-black text-red-700 uppercase tracking-widest mb-1 flex items-center gap-2">
                          <Info size={11}/> Salary Arrear Logic
                        </p>
                        <p className="text-xs text-red-600">
                          When salary was not paid for certain months (e.g. pending appointment, delayed posting), this calculates the total salary due for that period.
                          Basic pay auto-increments from Pay Matrix on increment month each year. DA is auto-fetched from Govt. history per month.
                          Arrear = Actual Net Payable − Already Paid Net.
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-5 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <div><Lbl c="Start Month"/><input type="month" value={arrCfg.startMonth} onChange={e=>setArrCfg(p=>({...p,startMonth:e.target.value}))} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"/></div>
                        <div><Lbl c="End Month"/><input type="month" value={arrCfg.endMonth} onChange={e=>setArrCfg(p=>({...p,endMonth:e.target.value}))} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"/></div>
                        <div><Lbl c="Pay Level"/><TSel value={arrCfg.level} onChange={(v:string)=>setArrCfg(p=>({...p,level:Number(v)}))} options={Object.keys(PAY_MATRIX).map(l=>({value:Number(l),label:`Level ${l}`}))}/></div>
                        <div><Lbl c="Starting Basic Pay (First Month)"/><TSel value={arrCfg.startBasic} onChange={(v:string)=>setArrCfg(p=>({...p,startBasic:Number(v)}))} options={(PAY_MATRIX[arrCfg.level]||[]).map((v,i)=>({value:v,label:`Cell ${i+1} — ₹${fmt(v)}`}))}/></div>
                        <div>
                          <Lbl c="Already Paid DA % (What was paid)"/>
                          <TSel value={arrCfg.paidDA} onChange={(v:string)=>setArrCfg(p=>({...p,paidDA:Number(v)}))}
                            options={[{value:0,label:'₹0 — Nothing paid (full arrear)'},...Object.entries(DA_HISTORY).sort(([a],[b])=>b.localeCompare(a)).map(([k,v])=>({value:v,label:`${v}% — paid from ${k}`}))]}/>
                          <p className="text-[10px] text-gray-400 mt-1">Actual DA auto-applied from Govt. records for comparison</p>
                        </div>
                        <div><Lbl c="Increment Month"/><TSel value={arrCfg.incMonth} onChange={(v:any)=>setArrCfg(p=>({...p,incMonth:v}))} options={[{value:'07',label:'July (Standard)'},{value:'01',label:'January'}]}/></div>
                      </div>

                      <button onClick={genArrears}
                        className="flex items-center gap-3 px-8 py-3 bg-red-600 text-white rounded-xl font-black hover:bg-red-700 transition-all shadow-lg shadow-red-200 mb-7">
                        <Zap size={15}/> Calculate Salary Arrear
                      </button>

                      {arrRows.length>0&&(
                        <>
                          <div className="grid grid-cols-4 gap-4 mb-6">
                            {[
                              {l:'Total Salary Arrear',v:rs(arrRows.reduce((s,r)=>s+r.arrear,0)),c:'red'},
                              {l:'Months Covered',v:String(arrRows.length)+' months',c:'gray'},
                              {l:'Avg / Month',v:rs(rnd(arrRows.reduce((s,r)=>s+r.arrear,0)/arrRows.length)),c:'amber'},
                              {l:'Total Gross Due',v:rs(arrRows.reduce((s,r)=>s+r.gross,0)),c:'green'},
                            ].map(c=>(
                              <div key={c.l} className={`p-4 bg-${c.c}-50 border border-${c.c}-200 rounded-xl text-center`}>
                                <p className="text-[10px] font-bold text-gray-500 uppercase">{c.l}</p>
                                <p className={`text-xl font-black text-${c.c}-700 mt-1`}>{c.v}</p>
                              </div>
                            ))}
                          </div>

                          <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <table className="text-[10px] w-full border-collapse min-w-[1350px]">
                              <thead>
                                <tr className="bg-red-700 text-white">
                                  {['Month','Basic','Act.DA%','Paid DA%','DA Actual','DA Paid','HRA','TA(Act.)','TA(Paid)','MA','Gross Due','Gross Paid','NPS Act.','NPS Paid','PT','Net Due','Net Paid','ARREAR'].map(h=>(
                                    <th key={h} className={`px-2 py-3 text-center font-black whitespace-nowrap border-r border-red-600/40 last:border-0 ${h==='ARREAR'?'text-yellow-300':h==='Gross Due'||h==='Net Due'?'text-green-200':''}`}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {arrRows.map((r,i)=>(
                                  <tr key={r.key} className={`${i%2===0?'bg-white':'bg-red-50/20'} hover:bg-red-50/50`}>
                                    <td className="px-2 py-2 font-bold text-red-700 border-b border-r border-gray-200 whitespace-nowrap text-center">{r.key}</td>
                                    <td className="px-2 py-2 text-right border-b border-r border-gray-200 font-medium">{fmt(r.basic)}</td>
                                    <td className="px-2 py-2 text-center font-bold text-green-700 border-b border-r border-gray-200">{r.actDA}%</td>
                                    <td className="px-2 py-2 text-center text-gray-500 border-b border-r border-gray-200">{r.pDA_r}%</td>
                                    <td className="px-2 py-2 text-right border-b border-r border-gray-200">{fmt(r.da)}</td>
                                    <td className="px-2 py-2 text-right text-gray-400 border-b border-r border-gray-200">{fmt(r.pDA)}</td>
                                    <td className="px-2 py-2 text-right border-b border-r border-gray-200">{fmt(r.hra)}</td>
                                    <td className="px-2 py-2 text-right border-b border-r border-gray-200">{fmt(r.ta)}</td>
                                    <td className="px-2 py-2 text-right text-gray-400 border-b border-r border-gray-200">{fmt(r.pTa)}</td>
                                    <td className="px-2 py-2 text-right border-b border-r border-gray-200">{fmt(r.ma)}</td>
                                    <td className="px-2 py-2 text-right font-bold text-green-700 border-b border-r border-gray-200">{fmt(r.gross)}</td>
                                    <td className="px-2 py-2 text-right text-gray-400 border-b border-r border-gray-200">{fmt(r.pGross)}</td>
                                    <td className="px-2 py-2 text-right text-red-500 border-b border-r border-gray-200">{fmt(r.nps)}</td>
                                    <td className="px-2 py-2 text-right text-gray-400 border-b border-r border-gray-200">{fmt(r.pNps)}</td>
                                    <td className="px-2 py-2 text-right text-red-500 border-b border-r border-gray-200">{fmt(r.pt)}</td>
                                    <td className="px-2 py-2 text-right font-black border-b border-r border-gray-200">{fmt(r.net)}</td>
                                    <td className="px-2 py-2 text-right text-gray-400 border-b border-r border-gray-200">{fmt(r.pNet)}</td>
                                    <td className={`px-2 py-2 text-right font-black border-b border-gray-200 ${r.arrear>0?'text-green-700 bg-green-50':r.arrear<0?'text-red-600 bg-red-50':'text-gray-400'}`}>{fmt(r.arrear)}</td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr className="bg-red-800 text-white font-black text-xs">
                                  <td className="px-2 py-3 text-center" colSpan={10}>TOTALS</td>
                                  <td className="px-2 py-3 text-right text-green-300">{fmt(arrRows.reduce((s,r)=>s+r.gross,0))}</td>
                                  <td className="px-2 py-3 text-right opacity-60">{fmt(arrRows.reduce((s,r)=>s+r.pGross,0))}</td>
                                  <td className="px-2 py-3 text-right">{fmt(arrRows.reduce((s,r)=>s+r.nps,0))}</td>
                                  <td className="px-2 py-3 text-right opacity-60">{fmt(arrRows.reduce((s,r)=>s+r.pNps,0))}</td>
                                  <td className="px-2 py-3 text-right">{fmt(arrRows.reduce((s,r)=>s+r.pt,0))}</td>
                                  <td className="px-2 py-3 text-right text-green-300">{fmt(arrRows.reduce((s,r)=>s+r.net,0))}</td>
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

                  {/* ── DA ARREAR TAB ── */}
                  {arrSubTab==='da'&&(
                    <>
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-5">
                        <p className="text-[11px] font-black text-amber-700 uppercase tracking-widest mb-1 flex items-center gap-2">
                          <Info size={11}/> DA Arrear Logic
                        </p>
                        <p className="text-xs text-amber-700">
                          When the Government announces a DA hike but payment is delayed, employees are entitled to arrear for the difference.
                          DA Arrear = (New DA% − Old DA%) × Basic, per month.
                          Also includes TA+DA component and adjusts NPS (since Basic+DA increases → NPS increases slightly).
                          Actual announced DA is auto-fetched from Govt. history for each month.
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-5 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <div><Lbl c="Start Month (Arrear From)"/><input type="month" value={daArrCfg.startMonth} onChange={e=>setDaArrCfg(p=>({...p,startMonth:e.target.value}))} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"/></div>
                        <div><Lbl c="End Month"/><input type="month" value={daArrCfg.endMonth} onChange={e=>setDaArrCfg(p=>({...p,endMonth:e.target.value}))} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"/></div>
                        <div><Lbl c="Pay Level"/><TSel value={daArrCfg.level} onChange={(v:string)=>setDaArrCfg(p=>({...p,level:Number(v)}))} options={Object.keys(PAY_MATRIX).map(l=>({value:Number(l),label:`Level ${l}`}))}/></div>
                        <div>
                          <Lbl c="Basic Pay (Fixed for period)"/>
                          <TSel value={daArrCfg.basic} onChange={(v:string)=>setDaArrCfg(p=>({...p,basic:Number(v)}))}
                            options={(PAY_MATRIX[daArrCfg.level]||[]).map((v,i)=>({value:v,label:`Cell ${i+1} — ₹${fmt(v)}`}))}/>
                          <p className="text-[10px] text-gray-400 mt-1">Basic stays fixed for DA arrear; only DA% changes</p>
                        </div>
                        <div>
                          <Lbl c="DA Rate Actually Paid (%)"/>
                          <TSel value={daArrCfg.oldDA} onChange={(v:string)=>setDaArrCfg(p=>({...p,oldDA:Number(v)}))}
                            options={Object.entries(DA_HISTORY).sort(([a],[b])=>b.localeCompare(a)).map(([k,v])=>({value:v,label:`${v}% — (from ${k})`}))}/>
                          <p className="text-[10px] text-gray-400 mt-1">What DA% was actually disbursed in salary</p>
                        </div>
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex flex-col justify-center">
                          <p className="text-[10px] font-bold text-amber-700 uppercase">Actual DA</p>
                          <p className="text-xs text-amber-600 mt-1">Auto-fetched from official Govt. DA history for each month in range</p>
                          <p className="text-sm font-black text-amber-800 mt-1">Current (latest): {getDA('2026-01')}%</p>
                        </div>
                      </div>

                      {/* DA History Reference */}
                      <div className="mb-5 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <p className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-3">Official DA Rate History (7th CPC)</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(DA_HISTORY).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>(
                            <div key={k} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border ${v===daArrCfg.oldDA?'bg-amber-500 text-white border-amber-500':v>daArrCfg.oldDA?'bg-green-50 text-green-700 border-green-300':'bg-gray-100 text-gray-400 border-gray-200'}`}>
                              {k}: {v}%
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2">🟡 = Paid rate | 🟢 = Rates for which arrear will be calculated | ⬜ = Before paid period</p>
                      </div>

                      <button onClick={genDaArrears}
                        className="flex items-center gap-3 px-8 py-3 bg-amber-600 text-white rounded-xl font-black hover:bg-amber-700 transition-all shadow-lg shadow-amber-200 mb-7">
                        <Zap size={15}/> Calculate DA Arrear
                      </button>

                      {daArrRows.length>0&&(
                        <>
                          <div className="grid grid-cols-4 gap-4 mb-6">
                            {[
                              {l:'Total DA Arrear (Net)',v:rs(daArrRows.reduce((s,r)=>s+r.netDiff,0)),c:'amber'},
                              {l:'Total Gross DA Diff',v:rs(daArrRows.reduce((s,r)=>s+r.grossDiff,0)),c:'green'},
                              {l:'Months',v:String(daArrRows.length)+' months',c:'gray'},
                              {l:'Avg DA Arrear / Month',v:rs(rnd(daArrRows.reduce((s,r)=>s+r.netDiff,0)/daArrRows.length)),c:'orange'},
                            ].map(c=>(
                              <div key={c.l} className={`p-4 bg-${c.c}-50 border border-${c.c}-200 rounded-xl text-center`}>
                                <p className="text-[10px] font-bold text-gray-500 uppercase">{c.l}</p>
                                <p className={`text-xl font-black text-${c.c}-700 mt-1`}>{c.v}</p>
                              </div>
                            ))}
                          </div>

                          <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <table className="text-[10px] w-full border-collapse min-w-[1100px]">
                              <thead>
                                <tr className="bg-amber-700 text-white">
                                  {['Month','Basic','Paid DA%','Actual DA%','Old DA Amt','Actual DA Amt','DA Difference','Old TA+DA','Actual TA+DA','TA Diff','Gross Arrear','Old NPS','New NPS','NPS Diff','NET DA ARREAR'].map(h=>(
                                    <th key={h} className={`px-2 py-3 text-center font-black whitespace-nowrap border-r border-amber-600/40 last:border-0 ${h==='NET DA ARREAR'||h==='DA Difference'?'text-yellow-200':''}`}>{h}</th>
                                  ))}
                                </tr>
                                <tr className="bg-amber-800/60 text-amber-200 text-[9px]">
                                  <td className="px-2 py-1 text-center border-r border-amber-700/40">Period</td>
                                  <td className="px-2 py-1 text-center border-r border-amber-700/40">Fixed</td>
                                  <td className="px-2 py-1 text-center border-r border-amber-700/40">Was Paid</td>
                                  <td className="px-2 py-1 text-center border-r border-amber-700/40">Govt. Record</td>
                                  <td className="px-2 py-1 text-right border-r border-amber-700/40">Basic×OldDA%</td>
                                  <td className="px-2 py-1 text-right border-r border-amber-700/40">Basic×ActDA%</td>
                                  <td className="px-2 py-1 text-right border-r border-amber-700/40 font-bold">Actual−Old</td>
                                  <td className="px-2 py-1 text-right border-r border-amber-700/40">TA×OldDA%</td>
                                  <td className="px-2 py-1 text-right border-r border-amber-700/40">TA×ActDA%</td>
                                  <td className="px-2 py-1 text-right border-r border-amber-700/40">Diff</td>
                                  <td className="px-2 py-1 text-right border-r border-amber-700/40">DA+TA Diff</td>
                                  <td className="px-2 py-1 text-right border-r border-amber-700/40">10%×(B+OldDA)</td>
                                  <td className="px-2 py-1 text-right border-r border-amber-700/40">10%×(B+ActDA)</td>
                                  <td className="px-2 py-1 text-right border-r border-amber-700/40">NPS Diff</td>
                                  <td className="px-2 py-1 text-right">GrossArr−NPS↑</td>
                                </tr>
                              </thead>
                              <tbody>
                                {daArrRows.map((r,i)=>(
                                  <tr key={r.key} className={`${i%2===0?'bg-white':'bg-amber-50/20'} hover:bg-amber-50/60`}>
                                    <td className="px-2 py-2 font-bold text-amber-700 border-b border-r border-gray-200 whitespace-nowrap text-center">{r.key}</td>
                                    <td className="px-2 py-2 text-right border-b border-r border-gray-200 font-medium">{fmt(r.basic)}</td>
                                    <td className="px-2 py-2 text-center text-gray-500 border-b border-r border-gray-200">{r.oldDA}%</td>
                                    <td className={`px-2 py-2 text-center font-bold border-b border-r border-gray-200 ${r.announcedDA > r.oldDA ? 'text-green-700' : 'text-gray-500'}`}>{r.announcedDA}%</td>
                                    <td className="px-2 py-2 text-right text-gray-500 border-b border-r border-gray-200">{fmt(r.oldDAamt)}</td>
                                    <td className="px-2 py-2 text-right border-b border-r border-gray-200">{fmt(r.newDAamt)}</td>
                                    <td className={`px-2 py-2 text-right font-bold border-b border-r border-gray-200 ${r.daDiff>0?'text-green-700':'text-gray-400'}`}>{fmt(r.daDiff)}</td>
                                    <td className="px-2 py-2 text-right text-gray-500 border-b border-r border-gray-200">{fmt(r.oldTaDA)}</td>
                                    <td className="px-2 py-2 text-right border-b border-r border-gray-200">{fmt(r.newTaDA)}</td>
                                    <td className={`px-2 py-2 text-right border-b border-r border-gray-200 ${r.taDiff>0?'text-green-600':'text-gray-400'}`}>{fmt(r.taDiff)}</td>
                                    <td className="px-2 py-2 text-right font-bold text-green-700 border-b border-r border-gray-200">{fmt(r.grossDiff)}</td>
                                    <td className="px-2 py-2 text-right text-gray-500 border-b border-r border-gray-200">{fmt(r.oldNPS)}</td>
                                    <td className="px-2 py-2 text-right border-b border-r border-gray-200">{fmt(r.newNPS)}</td>
                                    <td className="px-2 py-2 text-right text-red-500 border-b border-r border-gray-200">{fmt(r.npsDiff)}</td>
                                    <td className={`px-2 py-2 text-right font-black border-b border-gray-200 ${r.netDiff>0?'text-amber-700 bg-amber-50':'text-gray-400'}`}>{fmt(r.netDiff)}</td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr className="bg-amber-800 text-white font-black text-xs">
                                  <td className="px-2 py-3 text-center" colSpan={4}>TOTALS</td>
                                  <td className="px-2 py-3 text-right opacity-70">{fmt(daArrRows.reduce((s,r)=>s+r.oldDAamt,0))}</td>
                                  <td className="px-2 py-3 text-right">{fmt(daArrRows.reduce((s,r)=>s+r.newDAamt,0))}</td>
                                  <td className="px-2 py-3 text-right text-yellow-300">{fmt(daArrRows.reduce((s,r)=>s+r.daDiff,0))}</td>
                                  <td className="px-2 py-3 text-right opacity-70">{fmt(daArrRows.reduce((s,r)=>s+r.oldTaDA,0))}</td>
                                  <td className="px-2 py-3 text-right">{fmt(daArrRows.reduce((s,r)=>s+r.newTaDA,0))}</td>
                                  <td className="px-2 py-3 text-right text-yellow-300">{fmt(daArrRows.reduce((s,r)=>s+r.taDiff,0))}</td>
                                  <td className="px-2 py-3 text-right text-green-300">{fmt(daArrRows.reduce((s,r)=>s+r.grossDiff,0))}</td>
                                  <td className="px-2 py-3 text-right opacity-70">{fmt(daArrRows.reduce((s,r)=>s+r.oldNPS,0))}</td>
                                  <td className="px-2 py-3 text-right">{fmt(daArrRows.reduce((s,r)=>s+r.newNPS,0))}</td>
                                  <td className="px-2 py-3 text-right text-red-300">{fmt(daArrRows.reduce((s,r)=>s+r.npsDiff,0))}</td>
                                  <td className="px-2 py-3 text-right text-yellow-300 text-sm">{fmt(daArrRows.reduce((s,r)=>s+r.netDiff,0))}</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>

                          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                            <strong>Formula used:</strong> NET DA Arrear = (Basic × (Actual DA% − Paid DA%) / 100) + (TA × (Actual DA% − Paid DA%) / 100) − (NPS Employee increase due to higher DA).
                            Actual DA for each month is sourced from official Govt. notification history.
                          </div>
                        </>
                      )}
                    </>
                  )}

                  <NavRow onPrev={goPrev} onNext={goNext}/>
                </div>
              )}

              {/* ════ SALARY BILL ════ */}
              {tab==='salarybill'&&(
                <div className="p-6">
                  <div className="flex items-start justify-between mb-5">
                    <SectionHead title="Salary Bill — Official Format" subtitle="Multi-employee · Old & New joiner support · Auto-calculated · Guru Nanak College format" icon={ClipboardList} accent="#4f46e5"/>
                    <div className="flex gap-2 mt-[-1rem]">
                      <ResetBtn onReset={()=>setSbEmps([])} label="Clear All"/>
                      <button onClick={()=>doPrint(billRef,'Salary Bill')} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow">
                        <Printer size={14}/> Print Bill
                      </button>
                    </div>
                  </div>

                  {/* Bill config */}
                  <div className="grid grid-cols-3 gap-3 mb-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                    <div><Lbl c="Month"/><TSel value={sbCfg.month} onChange={v=>setSbCfg(p=>({...p,month:v}))} options={MONTHS_FULL.map(m=>({value:m,label:m}))}/></div>
                    <div><Lbl c="Year"/><TIn value={sbCfg.year} onChange={(v:string)=>setSbCfg(p=>({...p,year:v}))}/></div>
                    <div><Lbl c="DA Rate (%)"/><TSel value={sbCfg.da} onChange={(v:string)=>setSbCfg(p=>({...p,da:Number(v)}))} options={[65,61,57,53,50,46,42,38,31,28].map(d=>({value:d,label:`${d}%`}))}/></div>
                    <div><Lbl c="HRA Rate (%)"/><TSel value={sbCfg.hra} onChange={(v:string)=>setSbCfg(p=>({...p,hra:Number(v)}))} options={[{value:27,label:'27% (X — Metro)'},{value:18,label:'18% (Y — City)'},{value:9,label:'9% (Z — Small)'}]}/></div>
                    <div><Lbl c="Medical Allowance"/><TIn type="number" value={sbCfg.ma} onChange={(v:string)=>setSbCfg(p=>({...p,ma:Number(v)}))}/></div>
                    <div><Lbl c="Transport Allowance"/><TIn type="number" value={sbCfg.ta} onChange={(v:string)=>setSbCfg(p=>({...p,ta:Number(v)}))}/></div>
                  </div>

                  {/* Column 6 explanation box */}
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex gap-3">
                    <Info size={14} className="text-amber-600 shrink-0 mt-0.5"/>
                    <div>
                      <strong>Column 6 — "Basic Salary" field:</strong>
                      <span className="ml-1">Select employee type below — <strong>Old Joinee (pre-2016):</strong> enter their basic as on 01.01.2016 (7th CPC start). <strong>New Joinee (post-2016):</strong> this column shows their initial joining basic or can be blank/0. Column 7 always shows their current basic (as on the bill date).</span>
                    </div>
                  </div>

                  {/* Printable area */}
                  <div ref={billRef} style={{background:'#fff',color:'#000',fontFamily:'Arial,sans-serif'}}>
                    {/* College Header */}
                    <div style={{textAlign:'center',borderBottom:'2px solid #000',paddingBottom:'8px',marginBottom:'8px'}}>
                      <div style={{fontSize:'14px',fontWeight:'900',textTransform:'uppercase',letterSpacing:'1px'}}>{emp.college||'GURU NANAK COLLEGE'}, DHANBAD</div>
                      <div style={{fontSize:'11px',fontWeight:'bold',marginTop:'3px'}}>
                        SALARY BILL OF THE NON-TEACHING STAFF FOR THE MONTH OF {sbCfg.month.toUpperCase()} {sbCfg.year} (As per 7<sup>th</sup> pay scale)
                      </div>
                    </div>

                    <table style={{width:'100%',borderCollapse:'collapse',fontSize:'9px'}}>
                      <thead>
                        <tr>
                          {[
                            {h:'SL. No', w:'4%'},
                            {h:'N A M E', w:'14%'},
                            {h:'Designation', w:'8%'},
                            {h:'D.O.J', w:'7%'},
                            {h:'Academic Level', w:'6%'},
                            {h:'Basic Salary as on 01.01.2016', w:'8%'},
                            {h:'Basic Salary as on 01.07.2024', w:'8%'},
                            {h:`D.A. ${sbCfg.da}%`, w:'6%'},
                            {h:`H.R.A ${sbCfg.hra}%`, w:'5%'},
                            {h:'M.A.', w:'5%'},
                            {h:'Transport Allow.', w:'6%'},
                            {h:'P.F', w:'5%'},
                            {h:'G.total', w:'6%'},
                            {h:'Date of Increment', w:'7%'},
                            {h:'Remarks', w:'5%'},
                          ].map(({h,w})=>(
                            <th key={h} style={{border:'1px solid #000',padding:'4px 3px',textAlign:'center',fontSize:'8px',fontWeight:'bold',lineHeight:'1.2',verticalAlign:'bottom',width:w}}>{h}</th>
                          ))}
                        </tr>
                        <tr style={{background:'#f5f5f5'}}>
                          {['1','2','3','4','5','6','7','8','9','10','11','12','13','14',''].map((n,i)=>(
                            <td key={i} style={{border:'1px solid #000',padding:'2px 3px',textAlign:'center',fontSize:'8px',color:'#666',fontWeight:'bold'}}>{n}</td>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sbEmps.map((sb,i)=>{
                          const c=sbCalc(sb);
                          return (
                            <tr key={sb.id}>
                              <td style={{border:'1px solid #000',padding:'4px 3px',textAlign:'center'}}>{i+1}</td>
                              <td style={{border:'1px solid #000',padding:'4px 4px',textAlign:'left',fontWeight:'500'}}>{sb.name}</td>
                              <td style={{border:'1px solid #000',padding:'4px 3px',textAlign:'center',fontSize:'8px',lineHeight:'1.2'}}>{sb.designation}</td>
                              <td style={{border:'1px solid #000',padding:'4px 3px',textAlign:'center',whiteSpace:'nowrap'}}>{sb.doj}</td>
                              <td style={{border:'1px solid #000',padding:'4px 3px',textAlign:'center'}}>{sb.level}</td>
                              {/* Column 6: Old = basic on 01.01.2016, New = initial basic or blank */}
                              <td style={{border:'1px solid #000',padding:'4px 3px',textAlign:'right',color: sb.employeeType==='new'?'#666':'#000'}}>
                                {sb.employeeType==='new' ? (sb.basicOn2016>0 ? fmt(sb.basicOn2016) : '—') : fmt(sb.basicOn2016)}
                              </td>
                              <td style={{border:'1px solid #000',padding:'4px 3px',textAlign:'right',fontWeight:'bold'}}>{fmt(sb.basicOn2024)}</td>
                              <td style={{border:'1px solid #000',padding:'4px 3px',textAlign:'right'}}>{fmt(c.da)}</td>
                              <td style={{border:'1px solid #000',padding:'4px 3px',textAlign:'right'}}>{fmt(c.hra)}</td>
                              <td style={{border:'1px solid #000',padding:'4px 3px',textAlign:'right'}}>{fmt(c.ma)}</td>
                              <td style={{border:'1px solid #000',padding:'4px 3px',textAlign:'right'}}>{fmt(c.ta)}</td>
                              <td style={{border:'1px solid #000',padding:'4px 3px',textAlign:'right'}}>{fmt(c.pf)}</td>
                              <td style={{border:'1px solid #000',padding:'4px 3px',textAlign:'right',fontWeight:'bold'}}>{fmt(c.gross)}</td>
                              <td style={{border:'1px solid #000',padding:'4px 3px',textAlign:'center',whiteSpace:'nowrap'}}>{sb.incrementDate}</td>
                              <td style={{border:'1px solid #000',padding:'4px 3px'}}></td>
                            </tr>
                          );
                        })}
                        {/* TOTAL row */}
                        <tr style={{background:'#f0f0f0',fontWeight:'bold'}}>
                          <td colSpan={5} style={{border:'1px solid #000',padding:'5px 3px',textAlign:'center',fontWeight:'900'}}>TOTAL</td>
                          <td style={{border:'1px solid #000',padding:'5px 3px',textAlign:'right'}}>
                            {fmt(sbEmps.filter(e=>e.employeeType==='old').reduce((s,e)=>s+e.basicOn2016,0))}
                          </td>
                          <td style={{border:'1px solid #000',padding:'5px 3px',textAlign:'right'}}>{fmt(sbEmps.reduce((s,e)=>s+e.basicOn2024,0))}</td>
                          {(['da','hra','ma','ta','pf','gross'] as const).map(k=>(
                            <td key={k} style={{border:'1px solid #000',padding:'5px 3px',textAlign:'right'}}>{fmt(sbEmps.reduce((s,e)=>s+sbCalc(e)[k],0))}</td>
                          ))}
                          <td colSpan={2} style={{border:'1px solid #000'}}></td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Rupees line */}
                    <div style={{display:'flex',gap:'8px',border:'1px solid #000',padding:'5px 10px',marginTop:'4px',marginBottom:'16px',fontSize:'10px'}}>
                      <strong style={{whiteSpace:'nowrap'}}>Rupees</strong>
                      <span>{toWords(sbEmps.reduce((s,e)=>s+sbCalc(e).gross,0))}</span>
                    </div>

                    {/* Signatures */}
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',textAlign:'center',marginTop:'32px',gap:'16px'}}>
                      <div style={{borderTop:'1px solid #000',paddingTop:'6px',fontSize:'10px',fontWeight:'bold'}}>
                        <div>Accountant</div><div style={{marginTop:'3px'}}>{emp.college||'Guru Nanak College'}</div><div>Dhanbad</div>
                      </div>
                      <div style={{borderTop:'1px solid #000',paddingTop:'6px',fontSize:'10px',fontWeight:'bold'}}>
                        <div>Bursar</div><div style={{marginTop:'3px'}}>{emp.college||'Guru Nanak College'}</div><div>Dhanbad</div>
                      </div>
                      <div style={{borderTop:'1px solid #000',paddingTop:'6px',fontSize:'10px',fontWeight:'bold'}}>
                        <div>Principal</div><div style={{marginTop:'3px'}}>{emp.college||'Guru Nanak College'}</div><div>Dhanbad</div>
                      </div>
                    </div>
                  </div>

                  {/* ── Employee Row Editor (no-print) ── */}
                  <div className="mt-6 no-print">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Employee Rows — Edit Below</p>
                      <button
                        onClick={()=>setSbEmps(p=>[...p,{
                          id:Date.now(), name:fullName, designation:emp.designation,
                          doj:emp.dateOfJoining, level:`Level-${emp.payLevel}`,
                          basicOn2016: rnd(emp.basicPay7th / 1.3),
                          basicOn2024: emp.basicPay7th,
                          incrementDate: emp.incrementMonth==='07'?'1-Jul-25':'1-Jan-25',
                          employeeType: 'old',
                          col6Label: 'Basic as on 01.01.2016',
                        }])}
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow transition-all">
                        <UserPlus size={12}/> Add Current Employee ({fullName})
                      </button>
                    </div>

                    {sbEmps.length===0 && (
                      <div className="text-center py-10 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                        <UserPlus size={24} className="mx-auto mb-2 opacity-40"/>
                        <p>Click "Add Current Employee" or add rows manually below</p>
                        <p className="text-xs mt-1 text-gray-300">Each row = one employee in the salary bill</p>
                      </div>
                    )}

                    <div className="space-y-3">
                      {sbEmps.map((sb,i)=>(
                        <div key={sb.id} className="border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
                          {/* Row header with employee type toggle */}
                          <div className="flex items-center justify-between px-4 py-2.5 bg-indigo-50 border-b border-indigo-100">
                            <span className="text-xs font-black text-indigo-700">Employee #{i+1}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-[11px] text-gray-500 font-bold">Column 6 type:</span>
                              <div className="flex gap-1 p-0.5 bg-white rounded-lg border border-gray-200">
                                <button
                                  onClick={()=>setSbEmps(p=>p.map((r,j)=>j===i?{...r,employeeType:'old',col6Label:'Basic as on 01.01.2016'}:r))}
                                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${sb.employeeType==='old'?'bg-indigo-600 text-white':'text-gray-500 hover:text-gray-700'}`}>
                                  Old Joiner (pre-2016)
                                </button>
                                <button
                                  onClick={()=>setSbEmps(p=>p.map((r,j)=>j===i?{...r,employeeType:'new',col6Label:'Basic at Joining'}:r))}
                                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${sb.employeeType==='new'?'bg-emerald-600 text-white':'text-gray-500 hover:text-gray-700'}`}>
                                  New Joiner (post-2016)
                                </button>
                              </div>
                              <button onClick={()=>setSbEmps(p=>p.filter((_,j)=>j!==i))} className="flex items-center gap-1 text-red-400 hover:text-red-600 text-xs font-bold transition-colors">
                                <Trash2 size={12}/> Remove
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-3 p-4">
                            {/* Row 1 */}
                            <div className="col-span-2">
                              <Lbl c="Full Name"/>
                              <input value={sb.name} onChange={e=>setSbEmps(p=>p.map((r,j)=>j===i?{...r,name:e.target.value}:r))}
                                placeholder="e.g. Sri. Pankaj Kumar Prasad"
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"/>
                            </div>
                            <div>
                              <Lbl c="Designation"/>
                              <input value={sb.designation} onChange={e=>setSbEmps(p=>p.map((r,j)=>j===i?{...r,designation:e.target.value}:r))}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"/>
                            </div>
                            <div>
                              <Lbl c="Date of Joining"/>
                              <input value={sb.doj} onChange={e=>setSbEmps(p=>p.map((r,j)=>j===i?{...r,doj:e.target.value}:r))}
                                placeholder="DD.MM.YYYY"
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"/>
                            </div>

                            {/* Row 2 */}
                            <div>
                              <Lbl c="Academic Level"/>
                              <select value={sb.level} onChange={e=>setSbEmps(p=>p.map((r,j)=>j===i?{...r,level:e.target.value}:r))}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm">
                                {[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(l=><option key={l} value={`Level-${l}`}>Level-{l}</option>)}
                              </select>
                            </div>
                            <div>
                              <Lbl c={sb.employeeType==='old'?'Basic as on 01.01.2016':'Basic at Joining (Col 6)'}/>
                              <div className="relative">
                                <input type="number" value={sb.basicOn2016}
                                  onChange={e=>setSbEmps(p=>p.map((r,j)=>j===i?{...r,basicOn2016:Number(e.target.value)}:r))}
                                  placeholder={sb.employeeType==='new'?'0 = blank':'Basic in Jan 2016'}
                                  className={`w-full px-3 py-2 bg-white border rounded-lg text-sm text-gray-800 focus:outline-none shadow-sm ${sb.employeeType==='old'?'border-indigo-300 focus:ring-2 focus:ring-indigo-400':'border-emerald-300 focus:ring-2 focus:ring-emerald-400'}`}/>
                                <span className={`absolute right-2 top-2.5 text-[9px] font-bold ${sb.employeeType==='old'?'text-indigo-500':'text-emerald-500'}`}>
                                  {sb.employeeType==='old'?'2016':'JOIN'}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {sb.employeeType==='old'?'Enter 7th CPC basic on 01.01.2016':'Enter initial basic at appointment (or 0 to show —)'}
                              </p>
                            </div>
                            <div>
                              <Lbl c="Current Basic (as on 01.07.2024)"/>
                              <select value={sb.basicOn2024}
                                onChange={e=>setSbEmps(p=>p.map((r,j)=>j===i?{...r,basicOn2024:Number(e.target.value)}:r))}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm">
                                {(PAY_MATRIX[parseInt(sb.level.replace('Level-',''))||6]||[]).map((v,ci)=>(
                                  <option key={v} value={v}>Cell {ci+1} — ₹{fmt(v)}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <Lbl c="Date of Increment"/>
                              <input value={sb.incrementDate} onChange={e=>setSbEmps(p=>p.map((r,j)=>j===i?{...r,incrementDate:e.target.value}:r))}
                                placeholder="e.g. 1-Jul-25"
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"/>
                            </div>
                          </div>

                          {/* Live preview of this row */}
                          <div className="mx-4 mb-4 p-3 bg-white rounded-xl border border-gray-100 grid grid-cols-7 gap-2 text-center">
                            {[
                              {l:'Basic',v:fmt(sb.basicOn2024)},
                              {l:`DA ${sbCfg.da}%`,v:fmt(sbCalc(sb).da)},
                              {l:`HRA ${sbCfg.hra}%`,v:fmt(sbCalc(sb).hra)},
                              {l:'MA',v:fmt(sbCalc(sb).ma)},
                              {l:'TA',v:fmt(sbCalc(sb).ta)},
                              {l:'PF',v:fmt(sbCalc(sb).pf)},
                              {l:'G.Total',v:fmt(sbCalc(sb).gross),bold:true},
                            ].map(c=>(
                              <div key={c.l}>
                                <div className="text-[10px] text-gray-400">{c.l}</div>
                                <div className={`text-xs font-bold mt-0.5 ${(c as any).bold?'text-indigo-700':''}`}>{c.v}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add blank row button */}
                    {sbEmps.length > 0 && (
                      <button
                        onClick={()=>setSbEmps(p=>[...p,{
                          id:Date.now(), name:'', designation:'', doj:'', level:'Level-6',
                          basicOn2016:0, basicOn2024:35400, incrementDate:'1-Jul-25',
                          employeeType:'old', col6Label:'Basic as on 01.01.2016',
                        }])}
                        className="mt-3 flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 border border-gray-200 transition-all w-full justify-center">
                        <Plus size={12}/> Add Another Employee Row (blank)
                      </button>
                    )}
                  </div>
                  <NavRow onPrev={goPrev} onNext={goNext}/>
                </div>
              )}

              {/* ════ ANNUAL STATEMENT ════ */}
              {tab==='annualstatement'&&(
                <div className="p-6">
                  <div className="flex items-start justify-between mb-5">
                    <SectionHead title="Annual Salary Statement" subtitle={`${fullName} · FY ${asEmp.financialYear} · Official format with tax computation`} icon={FileSpreadsheet} accent="#0d9488"/>
                    <div className="flex items-center gap-2 mt-[-1rem]">
                      <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-xl px-3 py-2">
                        <span className="text-[11px] font-bold text-teal-700">FY</span>
                        <input value={asEmp.financialYear} onChange={e=>setAsEmp(p=>({...p,financialYear:e.target.value}))} className="w-20 bg-transparent text-sm font-bold text-teal-900 focus:outline-none"/>
                      </div>
                      <XlsBtn onClick={exportAnnual} label="Export CSV"/>
                      <button onClick={()=>doPrint(annualRef,'Annual Statement')} className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 shadow">
                        <Printer size={14}/> Print
                      </button>
                    </div>
                  </div>
                  <div ref={annualRef} className="bg-white border-2 border-gray-800 p-4 rounded-lg">
                    <div className="text-center border-b-2 border-black pb-3 mb-3">
                      <h2 className="text-sm font-black">{asEmp.college||'Guru Nanak College'}, Dhanbad</h2>
                      <h3 className="text-[11px] font-bold mt-0.5">{asEmp.salutation} {asEmp.name} (PAN No. {asEmp.panNumber||'—'})</h3>
                      <h4 className="text-[11px] font-bold">Salary Statement for the FINANCIAL Year {asEmp.financialYear}</h4>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1 overflow-x-auto">
                        <table className="text-[9px] border-collapse w-full">
                          <thead><tr style={{background:'#1e3a5f',color:'#fff'}}>
                            {['Month','Basic pay','D.A','HRA','Transport','M.A','DA ARREAR','ALLOWANCE','Total','P.F','GSLI','Prof.Tax','I.TAX'].map(h=>(
                              <th key={h} style={{border:'1px solid #666',padding:'3px 5px',textAlign:'center',fontWeight:'bold',whiteSpace:'nowrap'}}>{h}</th>
                            ))}
                          </tr></thead>
                          <tbody>
                            {annData.rows.map((row,i)=>(
                              <tr key={row.key} style={{background:i%2===0?'#fff':'#f9fafb'}}>
                                <td style={{border:'1px solid #ccc',padding:'2px 5px',fontWeight:'bold',whiteSpace:'nowrap'}}>{row.label}</td>
                                <td style={{border:'1px solid #ccc',padding:'2px 5px',textAlign:'right'}}>{fmt(row.basic)}</td>
                                <td style={{border:'1px solid #ccc',padding:'2px 5px',textAlign:'right'}}>{fmt(row.da)}</td>
                                <td style={{border:'1px solid #ccc',padding:'2px 5px',textAlign:'right'}}>{fmt(row.hra)}</td>
                                <td style={{border:'1px solid #ccc',padding:'2px 5px',textAlign:'right'}}>{fmt(row.ta)}</td>
                                <td style={{border:'1px solid #ccc',padding:'2px 5px',textAlign:'right'}}>{fmt(row.ma)}</td>
                                <td style={{border:'1px solid #ccc',padding:'2px 5px',textAlign:'right'}}>0</td>
                                <td style={{border:'1px solid #ccc',padding:'2px 5px',textAlign:'right'}}>0</td>
                                <td style={{border:'1px solid #ccc',padding:'2px 5px',textAlign:'right',fontWeight:'bold'}}>{fmt(row.total)}</td>
                                <td style={{border:'1px solid #ccc',padding:'2px 5px',textAlign:'right',color:'#dc2626'}}>{fmt(row.pf)}</td>
                                <td style={{border:'1px solid #ccc',padding:'2px 5px',textAlign:'right'}}>{fmt(row.gsli)}</td>
                                <td style={{border:'1px solid #ccc',padding:'2px 5px',textAlign:'right'}}>{fmt(row.pt)}</td>
                                <td style={{border:'1px solid #ccc',padding:'2px 5px',textAlign:'right'}}>{fmt(row.it)}</td>
                              </tr>
                            ))}
                            <tr style={{background:'#e5e7eb',fontWeight:'900'}}>
                              <td style={{border:'1px solid #000',padding:'3px 5px',textAlign:'center'}}>TOTAL</td>
                              {['basic','da','hra','ta','ma'].map(k=><td key={k} style={{border:'1px solid #000',padding:'3px 5px',textAlign:'right'}}>{fmt((annData.tot as any)[k])}</td>)}
                              <td style={{border:'1px solid #000',padding:'3px 5px',textAlign:'right'}}>0</td>
                              <td style={{border:'1px solid #000',padding:'3px 5px',textAlign:'right'}}>0</td>
                              {['total','pf','gsli','pt','it'].map(k=><td key={k} style={{border:'1px solid #000',padding:'3px 5px',textAlign:'right',fontWeight:'900'}}>{fmt((annData.tot as any)[k])}</td>)}
                            </tr>
                          </tbody>
                        </table>
                        <div style={{display:'flex',justifyContent:'flex-end',marginTop:'6px'}}>
                          <div style={{border:'2px solid black',padding:'4px 12px',fontSize:'11px',fontWeight:'900'}}>Grand Total Rs. {fmt(annData.grossA)}</div>
                        </div>
                      </div>
                      {/* Tax panel */}
                      <div style={{width:'215px',flexShrink:0,fontSize:'9px'}}>
                        <table style={{borderCollapse:'collapse',width:'100%'}}>
                          <thead><tr style={{background:'#1e3a5f',color:'#fff'}}>
                            <th style={{border:'1px solid #666',padding:'4px 5px',textAlign:'left'}}>Computation</th>
                            <th style={{border:'1px solid #666',padding:'4px 5px',textAlign:'right'}}>Amount</th>
                          </tr></thead>
                          <tbody>
                            {[['Total Income Rounded',fmt(annData.grossA),true],['Standard Deduction(-)',fmt(annData.std),false],[''  ,fmt(annData.grossA-annData.std),true],['80D',fmt(annData.c80d),false],['Sec.80CCD 1B (-)',fmt(annData.npsV),false],['Sec.16 (iii)',fmt(annData.sec16),false],['Sec.80 C (-)',fmt(annData.c80),false],['Intt.H.Loan (-)',fmt(asEmp.homeLoanInterest),false],['Taxable income',fmt(annData.txb),true],['Exempt upto 2,50,000','250000',false],['Taxable amount',fmt(Math.max(0,annData.txb-250000)),true]].map(([l,v,b]:any,i)=>(
                              <tr key={i} style={{background:b?'#fef9c3':i%2===0?'#fff':'#f9fafb'}}>
                                <td style={{border:'1px solid #ccc',padding:'2px 4px',fontWeight:b?'900':'normal'}}>{l}</td>
                                <td style={{border:'1px solid #ccc',padding:'2px 4px',textAlign:'right',fontWeight:b?'900':'normal'}}>{v}</td>
                              </tr>
                            ))}
                            {annData.txb>250000&&<tr><td style={{border:'1px solid #ccc',padding:'2px 4px'}}>250000×5%</td><td style={{border:'1px solid #ccc',padding:'2px 4px',textAlign:'right'}}>{fmt(Math.min(Math.max(0,annData.txb-250000),250000)*.05)}</td></tr>}
                            {annData.txb>500000&&<tr><td style={{border:'1px solid #ccc',padding:'2px 4px'}}>{fmt(Math.min(Math.max(0,annData.txb-500000),500000))}×20%</td><td style={{border:'1px solid #ccc',padding:'2px 4px',textAlign:'right'}}>{fmt(Math.min(Math.max(0,annData.txb-500000),500000)*.20)}</td></tr>}
                            {annData.txb>1000000&&<tr><td style={{border:'1px solid #ccc',padding:'2px 4px'}}>Above 10L×30%</td><td style={{border:'1px solid #ccc',padding:'2px 4px',textAlign:'right'}}>{fmt(Math.max(0,annData.txb-1000000)*.30)}</td></tr>}
                            <tr><td style={{border:'1px solid #ccc',padding:'2px 4px'}}>+4% Cess</td><td style={{border:'1px solid #ccc',padding:'2px 4px',textAlign:'right'}}>{fmt(rnd(annData.totalTax/1.04*.04))}</td></tr>
                            <tr style={{background:'#fee2e2',fontWeight:'900'}}><td style={{border:'1px solid #000',padding:'3px 4px',color:'#dc2626'}}>Total Tax</td><td style={{border:'1px solid #000',padding:'3px 4px',textAlign:'right',color:'#dc2626'}}>{fmt(annData.totalTax)}</td></tr>
                            <tr><td style={{border:'1px solid #ccc',padding:'2px 4px'}}>Tax Paid</td><td style={{border:'1px solid #ccc',padding:'2px 4px',textAlign:'right'}}>{fmt(annData.tot.it)}</td></tr>
                            <tr style={{background:'#dcfce7',fontWeight:'900'}}><td style={{border:'1px solid #000',padding:'3px 4px',color:'#16a34a'}}>Refundable amt.</td><td style={{border:'1px solid #000',padding:'3px 4px',textAlign:'right',color:annData.tot.it>=annData.totalTax?'#16a34a':'#dc2626'}}>({fmt(annData.tot.it-annData.totalTax)})</td></tr>
                          </tbody>
                        </table>
                        <div style={{marginTop:'7px',border:'2px solid black'}}>
                          <div style={{background:'#1e3a5f',color:'white',textAlign:'center',padding:'3px',fontWeight:'900'}}>Deduction 80C</div>
                          {[['P.F.',annData.pfA],['Tuition fee',asEmp.annualTuitionFee],['LIP',asEmp.annualLIC],['PPF.',asEmp.annualPPF],['Pri.Amt H.loan',asEmp.homeLoanPrincipal],['Gsli',asEmp.gisContribution*12]].map(([l,v])=>(
                            <div key={String(l)} style={{display:'flex',justifyContent:'space-between',padding:'2px 5px',borderBottom:'1px solid #e5e7eb'}}><span>{l}</span><span style={{fontWeight:'bold'}}>{fmt(Number(v))}</span></div>
                          ))}
                          <div style={{display:'flex',justifyContent:'space-between',padding:'3px 5px',background:'#f1f5f9',fontWeight:'900'}}><span>Total</span><span>{fmt(annData.pfA+asEmp.annualTuitionFee+asEmp.annualLIC+asEmp.annualPPF+asEmp.homeLoanPrincipal)} <span style={{fontWeight:'normal',color:'#94a3b8',fontSize:'8px'}}>upto 1,50,000</span></span></div>
                        </div>
                        <div style={{marginTop:'5px',border:'2px solid black'}}>
                          <div style={{background:'#1e3a5f',color:'white',textAlign:'center',padding:'3px',fontWeight:'900'}}>Deduction 80D</div>
                          {[['MEDICLAIM',asEmp.mediclaim,'upto 25,000'],['intt.H.Loan (-)',asEmp.homeLoanInterest,'upto 2,00,000'],['Sec.80CCD 1B NPS',asEmp.npsVoluntary,''],['Sec.16(iii)',asEmp.professionalTax*12,'Prof. Tax']].map(([l,v,n])=>(
                            <div key={String(l)} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'2px 5px',borderBottom:'1px solid #e5e7eb'}}>
                              <span>{l}</span><span><span style={{fontWeight:'bold'}}>{fmt(Number(v))}</span>{n&&<span style={{color:'#94a3b8',marginLeft:'3px',fontSize:'8px'}}>{n}</span>}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',textAlign:'center',marginTop:'24px',paddingTop:'8px',borderTop:'1px solid #94a3b8',fontSize:'10px',fontWeight:'bold'}}>
                      <div><p>ACCOUNTANT</p><p>{asEmp.college||'—'}</p><p>Dhanbad</p></div>
                      <div><p>BURSAR</p><p>{asEmp.college||'—'}</p><p>Dhanbad</p></div>
                      <div><p>PRINCIPAL</p><p>{asEmp.college||'—'}</p><p>Dhanbad</p></div>
                    </div>
                  </div>
                  <NavRow onPrev={goPrev} onNext={goNext}/>
                </div>
              )}

              {/* ════ TAX COMPARISON ════ */}
              {tab==='taxdetail'&&(
                <div className="p-8">
                  <SectionHead title="Income Tax — Both Regimes Side by Side" subtitle={`${fullName} · FY ${emp.financialYear} · Auto-calculated from Profile data`} icon={Receipt} accent="#ea580c"/>
                  <div className="grid grid-cols-6 gap-3 mb-7 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                    {[['Basic × 12',emp.basicPay7th*12],[`DA ${emp.daRate}%`,pct(emp.basicPay7th,emp.daRate)*12],[`HRA`,pct(emp.basicPay7th,HRA_RATES[emp.hraCategory]*100)*12],['Transport',emp.transportAllowance*12],['Medical',emp.medicalAllowance*12],['GROSS ANNUAL',taxDet.gross]].map(([l,v],i)=>(
                      <div key={String(l)} className={`p-3 rounded-xl text-center ${i===5?'bg-orange-600 text-white shadow':'bg-white border border-orange-200'}`}>
                        <p className="text-[10px] font-bold opacity-70">{l}</p>
                        <p className={`text-sm font-black mt-1 ${i===5?'text-white':'text-gray-800'}`}>{rs(Number(v))}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-6 mb-7">
                    {[{title:'OLD REGIME',sub:'With 80C, 80D, HRA, Home Loan deductions',color:'orange',txb:taxDet.txOld,tax:taxDet.taxOld,sl:taxDet.slOld,items:[['Gross Annual',taxDet.gross,false],['(-) Standard Deduction ₹50,000',taxDet.std,true],['(-) Sec.80C max ₹1,50,000',taxDet.c80,true],['(-) Sec.80D Mediclaim',taxDet.c80d,true],['(-) 80CCD1B NPS Voluntary',taxDet.npsV,true],['(-) Home Loan Interest',taxDet.hl,true],['(-) Prof.Tax Sec.16(iii)',taxDet.pt12,true]]},{title:'NEW REGIME',sub:'Simplified — ₹75,000 std deduction + NPS employer',color:'blue',txb:taxDet.txNew,tax:taxDet.taxNew,sl:taxDet.slNew,items:[['Gross Annual',taxDet.gross,false],['(-) Standard Deduction ₹75,000',taxDet.std2,true],['(-) NPS Employer 14%',taxDet.npsEr12,true]]}].map(panel=>(
                      <div key={panel.title} className={`rounded-2xl border-2 border-${panel.color}-200 overflow-hidden`}>
                        <div className={`bg-gradient-to-r from-${panel.color}-600 to-${panel.color}-500 px-5 py-4`}>
                          <h3 className="font-black text-lg text-white">{panel.title}</h3>
                          <p className={`text-xs text-${panel.color}-100 mt-0.5`}>{panel.sub}</p>
                        </div>
                        <div className={`p-5 space-y-2 bg-${panel.color}-50/30 border-b border-${panel.color}-200`}>
                          {panel.items.map(([l,v,d])=>(
                            <div key={String(l)} className="flex justify-between text-sm">
                              <span className={d?'text-red-600':'text-gray-700 font-bold'}>{l}</span>
                              <span className={`font-black ${d?'text-red-600':''}`}>{d?'-':''}{rs(Number(v))}</span>
                            </div>
                          ))}
                          {panel.color==='blue'&&taxDet.txNew<=700000&&<div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200"><CheckCircle2 size={11} className="text-green-600"/><span className="text-xs text-green-700 font-bold">87A Rebate — Tax = ₹0 (income ≤ ₹7L)</span></div>}
                          <div className={`flex justify-between pt-2 border-t border-${panel.color}-200`}>
                            <span className={`font-black text-${panel.color}-800`}>Taxable Income</span>
                            <span className={`text-xl font-black text-${panel.color}-700`}>{rs(panel.txb)}</span>
                          </div>
                        </div>
                        <div className="p-4">
                          <table className="w-full text-xs border-collapse mb-3">
                            <thead><tr className={`bg-${panel.color}-100`}>
                              <th className={`px-2 py-2 text-left border border-${panel.color}-300 font-black text-${panel.color}-800`}>Slab</th>
                              <th className={`px-2 py-2 text-center border border-${panel.color}-300 font-black text-${panel.color}-800`}>Rate</th>
                              <th className={`px-2 py-2 text-right border border-${panel.color}-300 font-black text-${panel.color}-800`}>Tax</th>
                            </tr></thead>
                            <tbody>
                              {panel.sl.map(s=>(
                                <tr key={s.r} className={s.base>0?`bg-${panel.color}-50`:''}>
                                  <td className={`px-2 py-2 border border-${panel.color}-200 text-gray-700`}>{s.r}</td>
                                  <td className={`px-2 py-2 border border-${panel.color}-200 text-center font-bold text-${panel.color}-700`}>{s.rate}%</td>
                                  <td className={`px-2 py-2 border border-${panel.color}-200 text-right font-bold`}>{s.base>0?rs(rnd(s.base*s.rate/100)):'—'}</td>
                                </tr>
                              ))}
                              <tr className={`bg-${panel.color}-100`}><td colSpan={2} className={`px-2 py-2 border border-${panel.color}-300 font-black text-${panel.color}-800`}>+ 4% Cess</td><td className={`px-2 py-2 border border-${panel.color}-300 text-right font-bold`}>{rs(rnd(panel.tax*0.04/1.04))}</td></tr>
                            </tbody>
                          </table>
                          <div className={`p-4 bg-${panel.color}-600 text-white rounded-xl text-center shadow`}>
                            <p className="text-xs font-bold opacity-80 uppercase">Total Tax — {panel.title}</p>
                            <p className="text-3xl font-black mt-1">{rs(panel.tax)}</p>
                            <p className="text-xs mt-1 opacity-70">Monthly TDS: {rs(rnd(panel.tax/12))}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className={`p-6 rounded-2xl border-2 flex items-center gap-6 ${taxDet.taxOld<=taxDet.taxNew?'bg-orange-50 border-orange-300':'bg-blue-50 border-blue-300'}`}>
                    <div className="text-3xl shrink-0">{taxDet.taxOld<=taxDet.taxNew?'🟠':'🔵'}</div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Recommended for {fullName}, FY {emp.financialYear}</p>
                      <p className="text-xl font-black text-gray-900 mt-1">{taxDet.taxOld<=taxDet.taxNew?'OLD REGIME is better':'NEW REGIME is better'}</p>
                      <p className="text-sm text-green-700 font-bold mt-1">Save <span className="font-black">{rs(Math.abs(taxDet.taxOld-taxDet.taxNew))}</span> annually · <span className="font-black">{rs(rnd(Math.abs(taxDet.taxOld-taxDet.taxNew)/12))}</span> per month</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">Old Regime</p><p className="text-lg font-black text-orange-700">{rs(taxDet.taxOld)}</p>
                      <p className="text-xs text-gray-400 mt-2">New Regime</p><p className="text-lg font-black text-blue-700">{rs(taxDet.taxNew)}</p>
                    </div>
                  </div>
                  <NavRow onPrev={goPrev} showNext={false}/>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <footer className="border-t border-gray-200 py-4 text-center text-[11px] text-gray-400 bg-white">
        Guru Nanak College, Dhanbad · Salary Management System · 7th CPC · All calculations follow official guidelines
      </footer>
    </div>
  );
}