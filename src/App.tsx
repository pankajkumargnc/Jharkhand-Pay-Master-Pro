/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { 
  Calculator, 
  User, 
  FileText, 
  TrendingUp, 
  History, 
  Printer, 
  Download, 
  Plus, 
  Trash2, 
  ChevronRight,
  IndianRupee,
  Building2,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

import { 
  EmployeeData, 
  SalaryBreakdown, 
  ArrearMonth,
  HRA_RATES, 
  SEVENTH_PAY_MATRIX,
  DA_HISTORY
} from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const INITIAL_EMPLOYEE: EmployeeData = {
  name: '',
  designation: 'Assistant',
  department: 'University Office',
  panNumber: '',
  pranNumber: '',
  bankAccount: '',
  ifscCode: '',
  dateOfJoining: '',
  payLevel: 1,
  basicPay7th: 18000,
  basicPay8th: 54000, // Placeholder 3.0x
  daRate: 53,
  hraCategory: 'Y',
  medicalAllowance: 1000,
  transportAllowance: 0,
  washingAllowance: 0,
  otherAllowances: 0,
  npsContribution: true,
  gpfContribution: false,
  gisContribution: 30,
  professionalTax: 200,
  licDeduction: 0,
  societyDeduction: 0,
  taxRegime: 'new',
  applyNPS: true,
  applyGIS: true,
  applyPT: true,
  applyIT: true,
  applyLIC: true,
  applySociety: true,
};

const TABS = ['profile', 'fixation', 'projection', 'salary', 'yearlysummary', 'arrears'] as const;
type TabType = (typeof TABS)[number];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [employee, setEmployee] = useState<EmployeeData>(INITIAL_EMPLOYEE);
  const [arrearMonths, setArrearMonths] = useState<{ month: string, oldBasic: number, newBasic: number, daRate: number }[]>([]);
  const [daArrearMonths, setDaArrearMonths] = useState<{ month: string, basic: number, oldDaRate: number, newDaRate: number }[]>([]);
  const [arrearSubTab, setArrearSubTab] = useState<'salary' | 'da'>('salary');
  
  const printRef = useRef<HTMLDivElement>(null);

  const handleNext = () => {
    const currentIndex = TABS.indexOf(activeTab);
    if (currentIndex < TABS.length - 1) {
      setActiveTab(TABS[currentIndex + 1]);
    } else {
      setActiveTab('profile');
    }
  };

  // Calculations
  const calculatePT = (monthlyGross: number) => {
    const annualGross = monthlyGross * 12;
    if (annualGross <= 300000) return 0;
    if (annualGross <= 500000) return 1000 / 12;
    if (annualGross <= 800000) return 1500 / 12;
    if (annualGross <= 1000000) return 2000 / 12;
    return 2500 / 12;
  };

  const calculateIT = (monthlyGross: number, regime: 'old' | 'new') => {
    const annualGross = monthlyGross * 12;
    let tax = 0;
    if (regime === 'new') {
      if (annualGross <= 300000) tax = 0;
      else if (annualGross <= 600000) tax = (annualGross - 300000) * 0.05;
      else if (annualGross <= 900000) tax = 15000 + (annualGross - 600000) * 0.10;
      else if (annualGross <= 1200000) tax = 45000 + (annualGross - 900000) * 0.15;
      else if (annualGross <= 1500000) tax = 90000 + (annualGross - 1200000) * 0.20;
      else tax = 150000 + (annualGross - 1500000) * 0.30;
    } else {
      const taxable = Math.max(0, annualGross - 50000 - 150000); // Standard + 80C
      if (taxable <= 250000) tax = 0;
      else if (taxable <= 500000) tax = (taxable - 250000) * 0.05;
      else if (taxable <= 1000000) tax = 12500 + (taxable - 500000) * 0.20;
      else tax = 112500 + (taxable - 1000000) * 0.30;
    }
    return Math.floor(tax / 12);
  };

  const salary7th = useMemo(() => {
    const basic = employee.basicPay7th;
    const da = Math.floor(basic * (employee.daRate / 100));
    const hra = Math.floor(basic * HRA_RATES[employee.hraCategory]);
    const gross = basic + da + hra + employee.medicalAllowance + employee.transportAllowance + employee.washingAllowance + employee.otherAllowances;
    
    let nps = 0;
    if (employee.applyNPS) {
      nps = Math.floor((basic + da) * 0.10);
    }
    
    const autoPT = employee.applyPT ? calculatePT(gross) : 0;
    const autoIT = employee.applyIT ? calculateIT(gross, employee.taxRegime) : 0;
    const gis = employee.applyGIS ? employee.gisContribution : 0;
    const lic = employee.applyLIC ? employee.licDeduction : 0;
    const society = employee.applySociety ? employee.societyDeduction : 0;
    
    const totalDeductions = nps + gis + autoPT + lic + society + autoIT;
    
    return {
      basic, da, hra, medical: employee.medicalAllowance, 
      transport: employee.transportAllowance, washing: employee.washingAllowance,
      others: employee.otherAllowances,
      gross, nps, gpf: 0, gis, ptax: autoPT,
      lic, society,
      it: autoIT,
      totalDeductions, netPay: gross - totalDeductions
    } as SalaryBreakdown & { it: number };
  }, [employee]);

  const salary8th = useMemo(() => {
    const basic = employee.basicPay8th;
    const da = Math.floor(basic * 0); // 8th pay usually starts with 0% DA
    const hra = Math.floor(basic * HRA_RATES[employee.hraCategory]);
    const gross = basic + da + hra + employee.medicalAllowance + employee.transportAllowance + employee.washingAllowance + employee.otherAllowances;
    
    let nps = 0;
    if (employee.applyNPS) {
      nps = Math.floor((basic + da) * 0.10);
    }
    
    const autoPT = employee.applyPT ? calculatePT(gross) : 0;
    const autoIT = employee.applyIT ? calculateIT(gross, employee.taxRegime) : 0;
    const gis = employee.applyGIS ? employee.gisContribution : 0;
    const lic = employee.applyLIC ? employee.licDeduction : 0;
    const society = employee.applySociety ? employee.societyDeduction : 0;
    
    const totalDeductions = nps + gis + autoPT + lic + society + autoIT;
    
    return {
      basic, da, hra, medical: employee.medicalAllowance, 
      transport: employee.transportAllowance, washing: employee.washingAllowance,
      others: employee.otherAllowances,
      gross, nps, gpf: 0, gis, ptax: autoPT,
      lic, society,
      it: autoIT,
      totalDeductions, netPay: gross - totalDeductions
    } as SalaryBreakdown & { it: number };
  }, [employee]);

  const totalArrears = useMemo(() => {
    return arrearMonths.reduce((acc, curr) => {
      const oldGross = curr.oldBasic + Math.floor(curr.oldBasic * (curr.daRate / 100));
      const newGross = curr.newBasic + Math.floor(curr.newBasic * (curr.daRate / 100));
      return acc + (newGross - oldGross);
    }, 0);
  }, [arrearMonths]);

  const exportToPDF = async () => {
    if (!printRef.current) return;
    try {
      // Temporarily make it visible for capture but off-screen
      const element = printRef.current;
      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${employee.name || 'Salary'}_Jharkhand_Pay_Master.pdf`);
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleDaArrears = (startMonth: string, endMonth: string, basic: number) => {
    const start = new Date(startMonth + '-01');
    const end = new Date(endMonth + '-01');
    const months = [];
    let current = new Date(start);

    while (current <= end) {
      const monthStr = current.toISOString().slice(0, 7);
      
      // For DA arrears, we typically compare the "Current Paid Rate" vs "New Announced Rate"
      // Example: Paid 50%, New 53%. Arrear is on 3%.
      const currentRate = getDARateForMonth(monthStr);
      
      months.push({
        month: monthStr,
        basic: basic,
        oldDaRate: currentRate - 3, // Assume 3% hike for the period
        newDaRate: currentRate
      });
      current.setMonth(current.getMonth() + 1);
    }
    setDaArrearMonths(months);
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Sheet 1: Salary Profile
    const profileData = [
      ['GOVERNMENT OF JHARKHAND - PAY MASTER PRO'],
      ['PREMIUM SALARY STATEMENT (OFFICIAL)'],
      [''],
      ['EMPLOYEE SERVICE PROFILE'],
      ['Name', employee.name],
      ['Designation', employee.designation],
      ['Department', employee.department],
      ['Pay Level', `Level ${employee.payLevel}`],
      ['Basic Pay', employee.basicPay7th],
      [''],
      ['MONTHLY EARNINGS'],
      ['Basic', salary7th.basic],
      ['DA', salary7th.da],
      ['HRA', salary7th.hra],
      ['Medical', salary7th.medical],
      ['Gross', salary7th.gross],
      [''],
      ['MONTHLY DEDUCTIONS'],
      ['NPS', salary7th.nps],
      ['GIS', salary7th.gis],
      ['PT', salary7th.ptax],
      ['IT', salary7th.it],
      ['Total Deductions', salary7th.totalDeductions],
      [''],
      ['NET PAYABLE', salary7th.netPay]
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(profileData);
    XLSX.utils.book_append_sheet(wb, ws1, "Salary Summary");

    // Sheet 2: Yearly Summary
    const yearlyHeader = [['Month', 'Basic', 'DA %', 'DA', 'HRA', 'Medical', 'Gross', 'Deductions', 'Net Pay']];
    const yearlyRows = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map((month, idx) => {
      const incMonthIdx = bulkArrears.incrementMonth === '01' ? 9 : 3;
      let basic = employee.basicPay7th;
      if (idx >= incMonthIdx) {
        basic = getNextBasic(employee.basicPay7th, employee.payLevel);
      }
      
      let currentDaRate = employee.daRate;
      if (idx < 3) currentDaRate = employee.daRate - 3;
      else if (idx < 9) currentDaRate = employee.daRate;

      const da = Math.floor(basic * (currentDaRate / 100));
      const hra = Math.floor(basic * HRA_RATES[employee.hraCategory]);
      const gross = basic + da + hra + employee.medicalAllowance + employee.transportAllowance + employee.washingAllowance + employee.otherAllowances;
      const nps = employee.applyNPS ? Math.floor((basic + da) * 0.10) : 0;
      const autoPT = employee.applyPT ? calculatePT(gross) : 0;
      const autoIT = employee.applyIT ? calculateIT(gross, employee.taxRegime) : 0;
      const totalDeductions = nps + (employee.applyGIS ? employee.gisContribution : 0) + autoPT + (employee.applyLIC ? employee.licDeduction : 0) + (employee.applySociety ? employee.societyDeduction : 0) + autoIT;
      return [month, basic, `${currentDaRate}%`, da, hra, employee.medicalAllowance, gross, totalDeductions, gross - totalDeductions];
    });
    const ws2 = XLSX.utils.aoa_to_sheet([...yearlyHeader, ...yearlyRows]);
    XLSX.utils.book_append_sheet(wb, ws2, "Yearly Summary");

    // Sheet 3: Salary Arrears
    if (arrearMonths.length > 0) {
      const salHeader = [['Month', 'Old Basic', 'New Basic', 'DA %', 'Old Gross', 'New Gross', 'Difference']];
      const salRows = arrearMonths.map(m => {
        const oldDA = Math.floor(m.oldBasic * (m.daRate / 100));
        const newDA = Math.floor(m.newBasic * (m.daRate / 100));
        return [m.month, m.oldBasic, m.newBasic, m.daRate, m.oldBasic + oldDA, m.newBasic + newDA, (m.newBasic + newDA) - (m.oldBasic + oldDA)];
      });
      const ws3 = XLSX.utils.aoa_to_sheet([...salHeader, ...salRows]);
      XLSX.utils.book_append_sheet(wb, ws3, "Salary Arrears");
    }

    // Sheet 4: DA Arrears
    if (daArrearMonths.length > 0) {
      const daHeader = [['Month', 'Basic', 'Old DA %', 'New DA %', 'Old DA', 'New DA', 'Difference']];
      const daRows = daArrearMonths.map(m => {
        const oldDA = Math.floor(m.basic * (m.oldDaRate / 100));
        const newDA = Math.floor(m.basic * (m.newDaRate / 100));
        return [m.month, m.basic, m.oldDaRate, m.newDaRate, oldDA, newDA, newDA - oldDA];
      });
      const ws4 = XLSX.utils.aoa_to_sheet([...daHeader, ...daRows]);
      XLSX.utils.book_append_sheet(wb, ws4, "DA Arrears");
    }

    XLSX.writeFile(wb, `${employee.name || 'Salary'}_Jharkhand_Pay_Master_Pro.xlsx`);
  };
;

  const addArrearMonth = () => {
    const lastMonth = arrearMonths.length > 0 ? arrearMonths[arrearMonths.length - 1].month : '2024-01';
    const date = new Date(lastMonth + '-01');
    date.setMonth(date.getMonth() + 1);
    const nextMonth = date.toISOString().slice(0, 7);
    
    setArrearMonths([...arrearMonths, { 
      month: nextMonth, 
      oldBasic: employee.basicPay7th, 
      newBasic: employee.basicPay7th, 
      daRate: employee.daRate 
    }]);
  };

  const [bulkArrears, setBulkArrears] = useState({ 
    start: '2023-12', 
    end: '2026-03', 
    oldBasic: 19900, 
    newBasic: 19900, 
    autoDA: true,
    autoIncrement: true,
    incrementMonth: '07' // July
  });

  const getDARateForMonth = (monthStr: string) => {
    const sortedKeys = Object.keys(DA_HISTORY).sort().reverse();
    for (const key of sortedKeys) {
      if (monthStr >= key) return DA_HISTORY[key];
    }
    return 0;
  };

  const getNextBasic = (currentBasic: number, level: number) => {
    const matrix = SEVENTH_PAY_MATRIX[level];
    if (!matrix) return currentBasic;
    // Find the current step index
    const currentIndex = matrix.indexOf(currentBasic);
    if (currentIndex !== -1 && currentIndex < matrix.length - 1) {
      return matrix[currentIndex + 1];
    }
    // If not found exactly, find the next higher step
    const nextIndex = matrix.findIndex(v => v > currentBasic);
    if (nextIndex !== -1) return matrix[nextIndex];
    
    return currentBasic;
  };

  const handleBulkArrears = () => {
    const start = new Date(bulkArrears.start + '-01');
    const end = new Date(bulkArrears.end + '-01');
    const months = [];
    let current = new Date(start);
    
    let currentOldBasic = Number(bulkArrears.oldBasic);
    let currentNewBasic = Number(bulkArrears.newBasic);

    while (current <= end) {
      const monthStr = current.toISOString().slice(0, 7);
      const monthNum = current.getMonth() + 1;
      
      // Apply yearly increment if it's the increment month
      // Rules: Increment after 6 months of service. 
      // For simplicity in bulk generator, we just apply on the chosen month.
      if (bulkArrears.autoIncrement && monthNum === parseInt(bulkArrears.incrementMonth)) {
        // Don't increment in the very first month of the range if it's the increment month
        if (monthStr !== bulkArrears.start) {
          currentOldBasic = getNextBasic(currentOldBasic, employee.payLevel);
          currentNewBasic = getNextBasic(currentNewBasic, employee.payLevel);
        }
      }

      months.push({ 
        month: monthStr, 
        oldBasic: currentOldBasic, 
        newBasic: currentNewBasic, 
        daRate: bulkArrears.autoDA ? getDARateForMonth(monthStr) : 50 
      });
      current.setMonth(current.getMonth() + 1);
    }
    setArrearMonths(months);
  };

  const removeArrearMonth = (index: number) => {
    setArrearMonths(arrearMonths.filter((_, i) => i !== index));
  };

  // Auto-update arrears when settings change (if already generated)
  React.useEffect(() => {
    if (arrearMonths.length > 0) {
      handleBulkArrears();
    }
  }, [bulkArrears.incrementMonth, bulkArrears.autoDA, bulkArrears.autoIncrement]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-[#E0E0E0] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
              <Calculator size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Jharkhand Pay Master Pro</h1>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">University & College Non-Teaching Staff</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition-colors"
            >
              <Download size={16} /> Excel
            </button>
            <button 
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Printer size={16} /> Print PDF
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Navigation */}
          <nav className="lg:col-span-3 space-y-1">
            {[
              { id: 'profile', label: 'Employee Profile', icon: User },
              { id: 'fixation', label: '7th Pay Fixation', icon: FileText },
              { id: 'projection', label: '8th Pay Projection', icon: TrendingUp },
              { id: 'salary', label: 'Monthly Salary', icon: IndianRupee },
              { id: 'yearlysummary', label: 'Yearly Summary', icon: Building2 },
              { id: 'arrears', label: 'Arrear Master', icon: History },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                  activeTab === tab.id 
                    ? "bg-white text-emerald-700 shadow-sm border border-emerald-100" 
                    : "text-gray-500 hover:bg-white/50 hover:text-gray-900"
                )}
              >
                <tab.icon size={18} className={activeTab === tab.id ? "text-emerald-600" : "text-gray-400"} />
                {tab.label}
                {activeTab === tab.id && <ChevronRight size={16} className="ml-auto" />}
              </button>
            ))}
          </nav>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden"
              >
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="p-8 space-y-8">
                    <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                      <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                        <User size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Basic Information</h2>
                        <p className="text-sm text-gray-500">Enter employee details for calculation</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Employee Name</label>
                        <input 
                          type="text" 
                          value={employee.name}
                          onChange={(e) => setEmployee({...employee, name: e.target.value})}
                          placeholder="e.g. Rajesh Kumar"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Designation</label>
                        <input 
                          type="text" 
                          value={employee.designation}
                          onChange={(e) => setEmployee({...employee, designation: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Department / College</label>
                        <input 
                          type="text" 
                          value={employee.department}
                          onChange={(e) => setEmployee({...employee, department: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date of Joining</label>
                        <input 
                          type="date" 
                          value={employee.dateOfJoining}
                          onChange={(e) => setEmployee({...employee, dateOfJoining: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">PAN Number</label>
                        <input 
                          type="text" 
                          value={employee.panNumber}
                          onChange={(e) => setEmployee({...employee, panNumber: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">PRAN Number</label>
                        <input 
                          type="text" 
                          value={employee.pranNumber}
                          onChange={(e) => setEmployee({...employee, pranNumber: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bank Account Number</label>
                        <input 
                          type="text" 
                          value={employee.bankAccount}
                          onChange={(e) => setEmployee({...employee, bankAccount: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">IFSC Code</label>
                        <input 
                          type="text" 
                          value={employee.ifscCode}
                          onChange={(e) => setEmployee({...employee, ifscCode: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">HRA Category (Jharkhand)</label>
                        <select 
                          value={employee.hraCategory}
                          onChange={(e) => setEmployee({...employee, hraCategory: e.target.value as any})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        >
                          <option value="X">X (27% - Metro)</option>
                          <option value="Y">Y (18% - Ranchi, Jamshedpur, Dhanbad)</option>
                          <option value="Z">Z (9% - Other Districts)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Income Tax Regime</label>
                        <select 
                          value={employee.taxRegime}
                          onChange={(e) => setEmployee({...employee, taxRegime: e.target.value as any})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-bold"
                        >
                          <option value="new">New Tax Regime (FY 2024-25)</option>
                          <option value="old">Old Tax Regime (With Deductions)</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                      <h3 className="text-sm font-bold text-gray-900 mb-4">Deduction Flexibility (Toggle to apply)</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {[
                          { id: 'applyNPS', label: 'NPS (10%)' },
                          { id: 'applyGIS', label: 'GIS' },
                          { id: 'applyPT', label: 'Prof. Tax' },
                          { id: 'applyIT', label: 'Income Tax' },
                          { id: 'applyLIC', label: 'LIC' },
                          { id: 'applySociety', label: 'Society' },
                        ].map((d) => (
                          <label key={d.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                            <input 
                              type="checkbox" 
                              checked={(employee as any)[d.id]} 
                              onChange={(e) => setEmployee({...employee, [d.id]: e.target.checked})}
                              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                            />
                            <span className="text-xs font-bold text-gray-700">{d.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                      <button 
                        onClick={handleNext}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                      >
                        Next: Fixation <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Fixation Tab */}
                {activeTab === 'fixation' && (
                  <div className="p-8 space-y-8">
                    <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                      <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                        <FileText size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-gray-900">7th Pay Fixation Matrix</h2>
                        <p className="text-sm text-gray-500">Official Jharkhand Pay Matrix (Fitment 2.57)</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                      <div className="lg:col-span-1 space-y-6">
                        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Select Pay Level</label>
                            <div className="grid grid-cols-4 gap-2">
                              {Object.keys(SEVENTH_PAY_MATRIX).map(level => (
                                <button
                                  key={level}
                                  onClick={() => setEmployee({...employee, payLevel: parseInt(level)})}
                                  className={cn(
                                    "py-2 rounded-lg text-sm font-bold transition-all border",
                                    employee.payLevel === parseInt(level) 
                                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md" 
                                      : "bg-white text-gray-600 border-gray-100 hover:border-emerald-200"
                                  )}
                                >
                                  L{level}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Select Basic Pay</label>
                            <select 
                              value={employee.basicPay7th}
                              onChange={(e) => setEmployee({...employee, basicPay7th: parseInt(e.target.value)})}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                            >
                              {SEVENTH_PAY_MATRIX[employee.payLevel]?.map((pay, idx) => (
                                <option key={idx} value={pay}>Index {idx + 1}: ₹{pay.toLocaleString()}</option>
                              ))}
                            </select>
                          </div>

                          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                            <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Current Selection</p>
                            <p className="text-2xl font-black text-emerald-900">₹{employee.basicPay7th.toLocaleString()}</p>
                            <p className="text-xs text-emerald-700 mt-1">Level {employee.payLevel}, Index {SEVENTH_PAY_MATRIX[employee.payLevel]?.indexOf(employee.basicPay7th) + 1}</p>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Full Pay Matrix (Level 1-13)</h3>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Highlighting Level {employee.payLevel}</span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                  <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase">Level</th>
                                  {[...Array(10)].map((_, i) => (
                                    <th key={i} className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase">Idx {i + 1}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(SEVENTH_PAY_MATRIX).map(([level, pays]) => (
                                  <tr 
                                    key={level} 
                                    className={cn(
                                      "border-b border-gray-50 transition-colors",
                                      employee.payLevel === parseInt(level) ? "bg-emerald-50/50" : "hover:bg-gray-50/50"
                                    )}
                                  >
                                    <td className={cn(
                                      "px-4 py-3 font-bold text-sm",
                                      employee.payLevel === parseInt(level) ? "text-emerald-700" : "text-gray-500"
                                    )}>L{level}</td>
                                    {pays.slice(0, 10).map((pay, idx) => (
                                      <td 
                                        key={idx} 
                                        onClick={() => {
                                          setEmployee({...employee, payLevel: parseInt(level), basicPay7th: pay});
                                        }}
                                        className={cn(
                                          "px-4 py-3 text-xs font-mono cursor-pointer transition-all",
                                          employee.basicPay7th === pay && employee.payLevel === parseInt(level)
                                            ? "bg-emerald-600 text-white font-bold scale-105 shadow-sm rounded"
                                            : "text-gray-600 hover:text-emerald-600"
                                        )}
                                      >
                                        {pay.toLocaleString()}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                      <button 
                        onClick={handleNext}
                        className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 hover:-translate-y-1 active:translate-y-0"
                      >
                        Next: 8th Pay Projection <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                )}


                {/* Projection Tab */}
                {activeTab === 'projection' && (
                  <div className="p-8 space-y-8">
                    <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                      <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                        <TrendingUp size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">8th Pay Projection</h2>
                        <p className="text-sm text-gray-500">Estimated fixation (Fitment 3.00x)</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                          <p className="text-sm text-emerald-800 mb-2">Calculated 8th Pay Basic</p>
                          <p className="text-3xl font-bold text-emerald-900">₹{(employee.basicPay7th * 3).toLocaleString()}</p>
                          <p className="text-xs text-emerald-600 mt-2 font-medium">Using Fitment Factor: 3.00</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Manual 8th Pay Basic</label>
                          <input 
                            type="number" 
                            value={employee.basicPay8th}
                            onChange={(e) => setEmployee({...employee, basicPay8th: parseInt(e.target.value)})}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 leading-relaxed">
                        <p className="font-bold text-gray-900 mb-2">Note on 8th Pay Commission:</p>
                        <p>The 8th Pay Commission is yet to be officially notified by the Government of India. This calculation is based on the widely anticipated fitment factor of 3.00x. Actual values may vary once the official gazette is released.</p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                      <button 
                        onClick={handleNext}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                      >
                        Next: Monthly Salary <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Salary Tab */}
                {activeTab === 'salary' && (
                  <div className="p-8 space-y-8">
                    <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                      <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                        <IndianRupee size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Monthly Salary Breakdown</h2>
                        <p className="text-sm text-gray-500">Current month salary estimation</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">DA Rate (%)</label>
                            <input 
                              type="number" 
                              value={employee.daRate}
                              onChange={(e) => setEmployee({...employee, daRate: parseInt(e.target.value)})}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Medical Allowance</label>
                            <input 
                              type="number" 
                              value={employee.medicalAllowance}
                              onChange={(e) => setEmployee({...employee, medicalAllowance: parseInt(e.target.value)})}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                          </div>
                        </div>

                        <div className="pt-4 space-y-4">
                          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Deduction Flexibility</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {[
                              { id: 'applyNPS', label: 'NPS (10%)' },
                              { id: 'applyGIS', label: 'GIS' },
                              { id: 'applyPT', label: 'Prof. Tax' },
                              { id: 'applyIT', label: 'Income Tax' },
                              { id: 'applyLIC', label: 'LIC' },
                              { id: 'applySociety', label: 'Society' },
                            ].map((item) => (
                              <label key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                                <input 
                                  type="checkbox" 
                                  checked={employee[item.id as keyof typeof employee] as boolean}
                                  onChange={(e) => setEmployee({...employee, [item.id]: e.target.checked})}
                                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                                />
                                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">GIS Deduction</label>
                            <input 
                              type="number" 
                              value={employee.gisDeduction}
                              onChange={(e) => setEmployee({...employee, gisDeduction: parseInt(e.target.value)})}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Professional Tax</label>
                            <input 
                              type="number" 
                              value={employee.professionalTax}
                              onChange={(e) => setEmployee({...employee, professionalTax: parseInt(e.target.value)})}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">LIC Deduction</label>
                            <input 
                              type="number" 
                              value={employee.licDeduction}
                              onChange={(e) => setEmployee({...employee, licDeduction: parseInt(e.target.value)})}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Society Deduction</label>
                            <input 
                              type="number" 
                              value={employee.societyDeduction}
                              onChange={(e) => setEmployee({...employee, societyDeduction: parseInt(e.target.value)})}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                          <div className="space-y-4">
                            <h3 className="font-bold text-gray-900 border-b pb-2">7th Pay Breakdown</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between"><span>Basic Pay:</span> <span className="font-mono">₹{salary7th.basic.toLocaleString()}</span></div>
                              <div className="flex justify-between"><span>DA ({employee.daRate}%):</span> <span className="font-mono">₹{salary7th.da.toLocaleString()}</span></div>
                              <div className="flex justify-between"><span>HRA ({HRA_RATES[employee.hraCategory]*100}%):</span> <span className="font-mono">₹{salary7th.hra.toLocaleString()}</span></div>
                              <div className="flex justify-between"><span>Medical:</span> <span className="font-mono">₹{salary7th.medical.toLocaleString()}</span></div>
                              <div className="flex justify-between"><span>Transport:</span> <span className="font-mono">₹{salary7th.transport.toLocaleString()}</span></div>
                              <div className="flex justify-between"><span>Washing:</span> <span className="font-mono">₹{salary7th.washing.toLocaleString()}</span></div>
                              <div className="flex justify-between font-bold pt-2 border-t"><span>Gross Salary:</span> <span className="text-emerald-600">₹{salary7th.gross.toLocaleString()}</span></div>
                              <div className="flex justify-between text-red-500"><span>Total Deductions:</span> <span>-₹{salary7th.totalDeductions.toLocaleString()}</span></div>
                              <div className="flex justify-between font-bold pt-2 border-t text-lg"><span>Net Salary:</span> <span className="text-emerald-700">₹{salary7th.netPay.toLocaleString()}</span></div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h3 className="font-bold text-gray-900 border-b pb-2">8th Pay Breakdown (Est.)</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between"><span>Basic Pay:</span> <span className="font-mono">₹{salary8th.basic.toLocaleString()}</span></div>
                              <div className="flex justify-between"><span>DA ({employee.daRate}%):</span> <span className="font-mono">₹{salary8th.da.toLocaleString()}</span></div>
                              <div className="flex justify-between"><span>HRA ({HRA_RATES[employee.hraCategory]*100}%):</span> <span className="font-mono">₹{salary8th.hra.toLocaleString()}</span></div>
                              <div className="flex justify-between"><span>Medical:</span> <span className="font-mono">₹{salary8th.medical.toLocaleString()}</span></div>
                              <div className="flex justify-between"><span>Transport:</span> <span className="font-mono">₹{salary8th.transport.toLocaleString()}</span></div>
                              <div className="flex justify-between"><span>Washing:</span> <span className="font-mono">₹{salary8th.washing.toLocaleString()}</span></div>
                              <div className="flex justify-between font-bold pt-2 border-t"><span>Gross Salary:</span> <span className="text-emerald-600">₹{salary8th.gross.toLocaleString()}</span></div>
                              <div className="flex justify-between text-red-500"><span>Total Deductions:</span> <span>-₹{salary8th.totalDeductions.toLocaleString()}</span></div>
                              <div className="flex justify-between font-bold pt-2 border-t text-lg"><span>Net Salary:</span> <span className="text-emerald-700">₹{salary8th.netPay.toLocaleString()}</span></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-xl shadow-emerald-100">
                          <h3 className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">Monthly Net Take Home</h3>
                          <p className="text-4xl font-bold">₹{salary7th.netPay.toLocaleString()}</p>
                          <div className="mt-4 pt-4 border-t border-emerald-500/50 flex justify-between items-center">
                            <span className="text-xs text-emerald-100">8th Pay Projection:</span>
                            <span className="font-bold">₹{salary8th.netPay.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
                          <h3 className="font-bold text-gray-900">Quick Actions</h3>
                          <button 
                            onClick={exportToPDF}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all"
                          >
                            <Printer size={18} /> Print PDF
                          </button>
                          <button 
                            onClick={exportToExcel}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                          >
                            <Download size={18} /> Export Excel
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                      <button 
                        onClick={handleNext}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                      >
                        Next: Arrears <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Year View Tab */}
                {activeTab === 'yearlysummary' && (
                  <div className="p-8 space-y-8">
                    <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                      <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                        <Building2 size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Yearly Summary (Financial Year)</h2>
                        <p className="text-sm text-gray-500">Month-wise breakdown with automated increments and DA updates</p>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase">Month</th>
                            <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase">Basic</th>
                            <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase">DA %</th>
                            <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase">DA</th>
                            <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase">HRA</th>
                            <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase">Gross</th>
                            <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase">Deductions</th>
                            <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase">Net Pay</th>
                          </tr>
                        </thead>
                        <tbody>
                          {['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map((month, idx) => {
                            const incMonthIdx = bulkArrears.incrementMonth === '01' ? 9 : 3;
                            let basic = employee.basicPay7th;
                            if (idx >= incMonthIdx) {
                              basic = getNextBasic(employee.basicPay7th, employee.payLevel);
                            }
                            
                            // Determine DA rate for the month (simplified: changes in Jul and Jan)
                            let currentDaRate = employee.daRate;
                            if (month === 'Jan' || month === 'Feb' || month === 'Mar') {
                              currentDaRate = employee.daRate; // Assuming current is latest
                            } else if (idx < 3) { // Apr, May, Jun
                              currentDaRate = employee.daRate - 3; // Previous rate
                            } else if (idx < 9) { // Jul - Dec
                              currentDaRate = employee.daRate;
                            }

                            const da = Math.floor(basic * (currentDaRate / 100));
                            const hra = Math.floor(basic * HRA_RATES[employee.hraCategory]);
                            const gross = basic + da + hra + employee.medicalAllowance + employee.transportAllowance + employee.washingAllowance + employee.otherAllowances;
                            
                            let nps = employee.applyNPS ? Math.floor((basic + da) * 0.10) : 0;
                            const autoPT = employee.applyPT ? calculatePT(gross) : 0;
                            const autoIT = employee.applyIT ? calculateIT(gross, employee.taxRegime) : 0;
                            const totalDeductions = nps + (employee.applyGIS ? employee.gisContribution : 0) + autoPT + (employee.applyLIC ? employee.licDeduction : 0) + (employee.applySociety ? employee.societyDeduction : 0) + autoIT;

                            return (
                              <tr key={month} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                <td className="px-4 py-3 font-bold text-sm text-gray-700">{month}</td>
                                <td className="px-4 py-3 text-sm font-mono">₹{basic.toLocaleString()}</td>
                                <td className="px-4 py-3 text-xs font-mono text-gray-500">{currentDaRate}%</td>
                                <td className="px-4 py-3 text-sm font-mono">₹{da.toLocaleString()}</td>
                                <td className="px-4 py-3 text-sm font-mono">₹{hra.toLocaleString()}</td>
                                <td className="px-4 py-3 text-sm font-mono font-bold text-emerald-700">₹{gross.toLocaleString()}</td>
                                <td className="px-4 py-3 text-sm font-mono text-red-600">₹{totalDeductions.toLocaleString()}</td>
                                <td className="px-4 py-3 text-sm font-mono font-black text-gray-900">₹{(gross - totalDeductions).toLocaleString()}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                      <h3 className="text-sm font-bold text-blue-900 mb-4 flex items-center gap-2">
                        <TrendingUp size={16} /> Tax Regime Comparison (Annual)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white rounded-xl border border-blue-200 shadow-sm">
                          <p className="text-[10px] font-black text-gray-400 uppercase mb-1">New Tax Regime</p>
                          <p className="text-xl font-black text-gray-900">₹{(calculateIT(salary7th.gross, 'new') * 12).toLocaleString()}</p>
                          <p className="text-xs text-gray-500 mt-1">Standard Deduction: ₹75,000 applied</p>
                        </div>
                        <div className="p-4 bg-white rounded-xl border border-blue-200 shadow-sm">
                          <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Old Tax Regime</p>
                          <p className="text-xl font-black text-gray-900">₹{(calculateIT(salary7th.gross, 'old') * 12).toLocaleString()}</p>
                          <p className="text-xs text-gray-500 mt-1">80C (₹1.5L) + Standard (₹50k) applied</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                      <button 
                        onClick={handleNext}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                      >
                        Next: Arrears <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                )}
                {activeTab === 'arrears' && (
                  <div className="p-8 space-y-8">
                    <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                          <History size={24} />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">Arrear Master</h2>
                          <p className="text-sm text-gray-500">Salary & DA Arrears with Ultra-Pro Logic</p>
                        </div>
                      </div>
                      <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button 
                          onClick={() => setArrearSubTab('salary')}
                          className={cn(
                            "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                            arrearSubTab === 'salary' ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                          )}
                        >
                          Salary Arrears
                        </button>
                        <button 
                          onClick={() => setArrearSubTab('da')}
                          className={cn(
                            "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                            arrearSubTab === 'da' ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                          )}
                        >
                          DA Arrears
                        </button>
                      </div>
                    </div>

                    {arrearSubTab === 'salary' ? (
                      <div className="space-y-8">
                        {/* Bulk Generator */}
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Ultra-Pro Arrears Generator</h3>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={bulkArrears.autoDA} 
                              onChange={e => setBulkArrears({...bulkArrears, autoDA: e.target.checked})}
                              className="w-4 h-4 rounded text-emerald-600"
                            />
                            Auto DA History
                          </label>
                          <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={bulkArrears.autoIncrement} 
                              onChange={e => setBulkArrears({...bulkArrears, autoIncrement: e.target.checked})}
                              className="w-4 h-4 rounded text-emerald-600"
                            />
                            Auto Increment
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">Start Month</label>
                          <input type="month" value={bulkArrears.start} onChange={e => setBulkArrears({...bulkArrears, start: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">End Month</label>
                          <input type="month" value={bulkArrears.end} onChange={e => setBulkArrears({...bulkArrears, end: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">Initial Old Basic</label>
                          <input type="number" value={bulkArrears.oldBasic} onChange={e => setBulkArrears({...bulkArrears, oldBasic: parseInt(e.target.value)})} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">Initial New Basic</label>
                          <input type="number" value={bulkArrears.newBasic} onChange={e => setBulkArrears({...bulkArrears, newBasic: parseInt(e.target.value)})} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">Incr. Month</label>
                          <select 
                            value={bulkArrears.incrementMonth} 
                            onChange={e => setBulkArrears({...bulkArrears, incrementMonth: e.target.value})}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold"
                          >
                            <option value="01">January</option>
                            <option value="07">July</option>
                          </select>
                        </div>
                        <div className="flex items-end">
                          <button onClick={handleBulkArrears} className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">Generate Arrears</button>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-xl">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-900 border-b border-gray-800">
                            <th className="px-6 py-4 text-xs font-bold text-gray-300 uppercase">Month</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-300 uppercase">Old Basic</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-300 uppercase">New Basic</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-300 uppercase">DA %</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-300 uppercase">Old Gross</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-300 uppercase">New Gross</th>
                            <th className="px-6 py-4 text-xs font-bold text-emerald-400 uppercase text-right">Difference</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-300 uppercase text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {arrearMonths.map((item, idx) => {
                            const oldDA = Math.floor(item.oldBasic * (item.daRate / 100));
                            const newDA = Math.floor(item.newBasic * (item.daRate / 100));
                            const oldGross = item.oldBasic + oldDA;
                            const newGross = item.newBasic + newDA;
                            const diff = newGross - oldGross;

                            return (
                              <tr key={idx} className={clsx("hover:bg-emerald-50/30 transition-colors group", item.oldBasic > item.newBasic && "bg-red-50")}>
                                <td className="px-6 py-4">
                                  <input 
                                    type="month" 
                                    value={item.month}
                                    onChange={(e) => {
                                      const newArr = [...arrearMonths];
                                      newArr[idx].month = e.target.value;
                                      setArrearMonths(newArr);
                                    }}
                                    className="bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-700"
                                  />
                                </td>
                                <td className="px-6 py-4">
                                  <input 
                                    type="number" 
                                    value={item.oldBasic}
                                    onChange={(e) => {
                                      const newArr = [...arrearMonths];
                                      newArr[idx].oldBasic = parseInt(e.target.value) || 0;
                                      setArrearMonths(newArr);
                                    }}
                                    className="w-24 bg-transparent border-none focus:ring-0 text-sm font-mono font-medium"
                                  />
                                </td>
                                <td className="px-6 py-4">
                                  <input 
                                    type="number" 
                                    value={item.newBasic}
                                    onChange={(e) => {
                                      const newArr = [...arrearMonths];
                                      newArr[idx].newBasic = parseInt(e.target.value) || 0;
                                      setArrearMonths(newArr);
                                    }}
                                    className={clsx("w-24 bg-transparent border-none focus:ring-0 text-sm font-mono font-medium", item.oldBasic > item.newBasic && "text-red-600 font-bold underline")}
                                  />
                                </td>
                                <td className="px-6 py-4">
                                  <input 
                                    type="number" 
                                    value={item.daRate}
                                    onChange={(e) => {
                                      const newArr = [...arrearMonths];
                                      newArr[idx].daRate = parseFloat(e.target.value) || 0;
                                      setArrearMonths(newArr);
                                    }}
                                    className="w-16 bg-transparent border-none focus:ring-0 text-sm font-mono font-medium"
                                  />
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 font-mono">₹{oldGross.toLocaleString()}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 font-mono">₹{newGross.toLocaleString()}</td>
                                <td className="px-6 py-4 text-sm font-black text-emerald-700 text-right bg-emerald-50/50">₹{diff.toLocaleString()}</td>
                                <td className="px-6 py-4 text-center">
                                  <button 
                                    onClick={() => removeArrearMonth(idx)}
                                    className="text-gray-300 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                      </div>
                    ) : (
                      <div className="space-y-8">
                        {/* DA Arrear Generator */}
                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-6">
                          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">DA Arrears Generator</h3>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-500 uppercase">Start Month</label>
                              <input type="month" id="daStart" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold" defaultValue="2024-01" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-500 uppercase">End Month</label>
                              <input type="month" id="daEnd" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold" defaultValue="2024-06" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-500 uppercase">Basic Pay</label>
                              <input type="number" id="daBasic" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold" defaultValue={employee.basicPay7th} />
                            </div>
                            <div className="flex items-end">
                              <button 
                                onClick={() => {
                                  const start = (document.getElementById('daStart') as HTMLInputElement).value;
                                  const end = (document.getElementById('daEnd') as HTMLInputElement).value;
                                  const basic = parseInt((document.getElementById('daBasic') as HTMLInputElement).value);
                                  handleDaArrears(start, end, basic);
                                }}
                                className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                              >
                                Generate DA Arrears
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-xl">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-gray-900 border-b border-gray-800">
                                <th className="px-6 py-4 text-xs font-bold text-gray-300 uppercase">Month</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-300 uppercase">Basic</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-300 uppercase">Old DA %</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-300 uppercase">New DA %</th>
                                <th className="px-6 py-4 text-xs font-bold text-emerald-400 uppercase text-right">Difference</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-300 uppercase text-center">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                              {daArrearMonths.map((item, idx) => {
                                const oldDA = Math.floor(item.basic * (item.oldDaRate / 100));
                                const newDA = Math.floor(item.basic * (item.newDaRate / 100));
                                const diff = newDA - oldDA;
                                return (
                                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold">{item.month}</td>
                                    <td className="px-6 py-4 text-sm font-mono">₹{item.basic.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm font-mono">{item.oldDaRate}%</td>
                                    <td className="px-6 py-4 text-sm font-mono">{item.newDaRate}%</td>
                                    <td className="px-6 py-4 text-sm font-black text-emerald-700 text-right">₹{diff.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">
                                      <button onClick={() => setDaArrearMonths(daArrearMonths.filter((_, i) => i !== idx))} className="text-gray-300 hover:text-red-600 transition-colors">
                                        <Trash2 size={16} />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                      <div className="p-6 bg-emerald-600 rounded-2xl text-white shadow-xl shadow-emerald-100 flex items-center gap-6">
                        <div>
                          <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">Total Payable {arrearSubTab === 'salary' ? 'Salary' : 'DA'} Arrears</p>
                          <p className="text-4xl font-black">
                            ₹{arrearSubTab === 'salary' 
                              ? arrearMonths.reduce((acc, curr) => acc + (curr.newGross - curr.oldGross), 0).toLocaleString()
                              : daArrearMonths.reduce((acc, curr) => acc + (Math.floor(curr.basic * (curr.newDaRate / 100)) - Math.floor(curr.basic * (curr.oldDaRate / 100))), 0).toLocaleString()
                            }
                          </p>
                        </div>
                        <div className="w-px h-12 bg-emerald-500/50" />
                        <div className="text-sm text-emerald-100">
                          <p>Months: {arrearSubTab === 'salary' ? arrearMonths.length : daArrearMonths.length}</p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button 
                          onClick={() => setActiveTab('profile')}
                          className="px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl font-black hover:bg-gray-50 transition-all shadow-sm"
                        >
                          Finish: Back to Profile
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Hidden Print View */}
      <div className="opacity-0 pointer-events-none absolute -left-[9999px] top-0">
        <div ref={printRef} className="p-12 bg-white text-black w-[210mm] min-h-[297mm] font-serif">
          <div className="text-center border-b-4 border-double border-black pb-8 mb-10">
            <h1 className="text-3xl font-black uppercase tracking-tight">Government of Jharkhand</h1>
            <h2 className="text-xl font-bold mt-1">University & College Non-Teaching Staff Financial Statement</h2>
            <div className="flex justify-center gap-4 mt-4 text-sm font-bold">
              <span className="px-3 py-1 border border-black rounded">PRO VERSION</span>
              <span className="px-3 py-1 border border-black rounded">Ref: JKPMP-{new Date().getFullYear()}-{Math.floor(Math.random()*1000)}</span>
            </div>
            <p className="text-xs mt-4 italic">Generated via Jharkhand Pay Master Pro on {new Date().toLocaleString()}</p>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-10 text-sm">
            <div className="space-y-3">
              <h3 className="font-black border-b border-black pb-1 uppercase text-xs">Employee Details</h3>
              <p className="flex justify-between"><strong>Name:</strong> <span>{employee.name}</span></p>
              <p className="flex justify-between"><strong>Designation:</strong> <span>{employee.designation}</span></p>
              <p className="flex justify-between"><strong>Department:</strong> <span>{employee.department}</span></p>
              <p className="flex justify-between"><strong>Joining Date:</strong> <span>{employee.dateOfJoining}</span></p>
              <p className="flex justify-between"><strong>PAN Number:</strong> <span>{employee.panNumber}</span></p>
            </div>
            <div className="space-y-3">
              <h3 className="font-black border-b border-black pb-1 uppercase text-xs">Service Details</h3>
              <p className="flex justify-between"><strong>PRAN Number:</strong> <span>{employee.pranNumber}</span></p>
              <p className="flex justify-between"><strong>Bank A/c:</strong> <span>{employee.bankAccount}</span></p>
              <p className="flex justify-between"><strong>IFSC Code:</strong> <span>{employee.ifscCode}</span></p>
              <p className="flex justify-between"><strong>Pay Matrix Level:</strong> <span>Level {employee.payLevel}</span></p>
              <p className="flex justify-between"><strong>Tax Regime:</strong> <span>{employee.taxRegime === 'new' ? 'New (FY 24-25)' : 'Old (With Deductions)'}</span></p>
            </div>
          </div>

          <div className="border-2 border-black mb-10 overflow-hidden rounded-lg">
            <div className="bg-gray-100 p-3 font-black border-b-2 border-black text-center uppercase tracking-widest">Monthly Salary Breakdown (7th Pay)</div>
            <div className="grid grid-cols-2">
              <div className="p-6 space-y-2 border-r border-black">
                <h4 className="font-bold text-xs uppercase underline mb-4">Earnings</h4>
                <p className="flex justify-between"><span>Basic Pay:</span> <span>₹{salary7th.basic.toLocaleString()}</span></p>
                <p className="flex justify-between"><span>DA ({employee.daRate}%):</span> <span>₹{salary7th.da.toLocaleString()}</span></p>
                <p className="flex justify-between"><span>HRA ({employee.hraCategory}):</span> <span>₹{salary7th.hra.toLocaleString()}</span></p>
                <p className="flex justify-between"><span>Medical Allowance:</span> <span>₹{salary7th.medical.toLocaleString()}</span></p>
                <p className="flex justify-between"><span>Transport Allowance:</span> <span>₹{salary7th.transport.toLocaleString()}</span></p>
                <p className="flex justify-between"><span>Washing Allowance:</span> <span>₹{salary7th.washing.toLocaleString()}</span></p>
                <p className="flex justify-between"><span>Other Allowances:</span> <span>₹{salary7th.others.toLocaleString()}</span></p>
                <div className="pt-4 border-t border-black font-black flex justify-between text-lg">
                  <span>Gross Total:</span> <span>₹{salary7th.gross.toLocaleString()}</span>
                </div>
              </div>
              <div className="p-6 space-y-2">
                <h4 className="font-bold text-xs uppercase underline mb-4">Deductions</h4>
                <p className="flex justify-between"><span>NPS (10% B+D):</span> <span>₹{salary7th.nps.toLocaleString()}</span></p>
                <p className="flex justify-between"><span>GIS Contribution:</span> <span>₹{salary7th.gis.toLocaleString()}</span></p>
                <p className="flex justify-between"><span>Professional Tax:</span> <span>₹{salary7th.ptax.toLocaleString()}</span></p>
                <p className="flex justify-between"><span>Income Tax (TDS):</span> <span>₹{salary7th.it.toLocaleString()}</span></p>
                <p className="flex justify-between"><span>LIC Deduction:</span> <span>₹{salary7th.lic.toLocaleString()}</span></p>
                <p className="flex justify-between"><span>Society Deduction:</span> <span>₹{salary7th.society.toLocaleString()}</span></p>
                <div className="pt-4 border-t border-black font-black flex justify-between text-lg">
                  <span>Total Deductions:</span> <span>₹{salary7th.totalDeductions.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="bg-black text-white p-6 text-center">
              <p className="text-sm font-bold uppercase tracking-widest mb-1">Net Monthly Payable</p>
              <p className="text-4xl font-black">₹{salary7th.netPay.toLocaleString()}/-</p>
            </div>
          </div>

          {arrearMonths.length > 0 && (
            <div className="border-2 border-black rounded-lg overflow-hidden">
              <div className="bg-gray-100 p-3 font-black border-b-2 border-black text-center uppercase tracking-widest">Arrear Statement Summary</div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-black">
                    <th className="p-3 text-left border-r border-black">Month</th>
                    <th className="p-3 text-right border-r border-black">Old Gross</th>
                    <th className="p-3 text-right border-r border-black">New Gross</th>
                    <th className="p-3 text-center border-r border-black">DA %</th>
                    <th className="p-3 text-right">Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {arrearMonths.map((m, idx) => {
                    const oldDA = Math.floor(m.oldBasic * (m.daRate/100));
                    const newDA = Math.floor(m.newBasic * (m.daRate/100));
                    const diff = (m.newBasic + newDA) - (m.oldBasic + oldDA);
                    return (
                      <tr key={idx} className="border-b border-black">
                        <td className="p-3 border-r border-black font-bold">{m.month}</td>
                        <td className="p-3 text-right border-r border-black">₹{(m.oldBasic + oldDA).toLocaleString()}</td>
                        <td className="p-3 text-right border-r border-black">₹{(m.newBasic + newDA).toLocaleString()}</td>
                        <td className="p-3 text-center border-r border-black">{m.daRate}%</td>
                        <td className="p-3 text-right font-bold">₹{diff.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-200 font-black text-sm">
                    <td colSpan={4} className="p-4 text-right border-r border-black uppercase tracking-wider">Total Arrears Payable:</td>
                    <td className="p-4 text-right text-lg">₹{totalArrears.toLocaleString()}/-</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          <div className="mt-24 grid grid-cols-3 gap-10 text-center text-xs font-bold uppercase">
            <div className="space-y-20">
              <div className="border-t border-black pt-2">Employee Signature</div>
            </div>
            <div className="space-y-20">
              <div className="border-t border-black pt-2">Dealing Assistant</div>
            </div>
            <div className="space-y-20">
              <div className="border-t border-black pt-2">Registrar / Principal / DDO</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-400 text-sm">
        <p>© 2026 Jharkhand Pay Master Pro. Designed for Educational Institutions of Jharkhand.</p>
        <p className="mt-1 italic">Calculations are based on 7th CPC guidelines and 8th CPC projections.</p>
      </footer>
    </div>
  );
}
