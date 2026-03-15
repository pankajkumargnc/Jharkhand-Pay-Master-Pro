# 💰 Jharkhand Pay Master Pro — v8.0 Ultra Premium

<div align="center">

![Version](https://img.shields.io/badge/Version-8.0%20Ultra%20Premium-brightgreen?style=for-the-badge)
![Pay Commission](https://img.shields.io/badge/7th%20%26%208th%20CPC-Supported-blue?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Mobile%20%7C%20Tablet-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Advanced Salary Calculator & Pay Fixation Tool**
**Jharkhand Government University & College Non-Teaching Staff**

*7th Pay Commission · 8th Pay Projection · MACP · NPS · Retirement · Tax · Salary Bill*

</div>

---

## ✨ Features at a Glance

| Module | Features |
|--------|----------|
| **Multi-Profile System** | Unlimited employee profiles · Grid/List view · Search & filter · Star/color-code · Import/Export Excel |
| **Dashboard** | Live payroll stats · Donut chart · Salary bar chart · DA trend sparkline · Quick profile table |
| **Employee Profile** | Auto-fill by designation · DOB & DOJ · PAN/PRAN/Bank · Category tagging · Notes |
| **7th Pay Fixation** | 6th→7th CPC with Fitment × 2.57 · Interactive pay matrix table · Step-by-step calculation |
| **MACP Calculator** | 10/20/30-year upgrades · Next level projections · Percentage hike display |
| **Monthly Salary** | 7th & 8th Pay side-by-side · NPS breakdown · CEA · Hostel Subsidy · Salary Slip PDF |
| **Yearly Summary** | April–March FY · Auto DA & increment · Editable deduction cells · PDF + Excel export |
| **Arrear Calculator** | Salary Arrear + DA Arrear · MACP-aware · Month-by-month trail · Premium Excel export |
| **Salary Bill** | Official format · Old & New joiner support · Multi-employee · PDF export |
| **Annual Statement** | Form 16 estimate · 80C/80D breakdown · Tax computation · Refund/payable |
| **Tax Comparison** | Old vs New regime · 87A Rebate · Slab-wise computation · Recommendation |
| **Retirement & Gratuity** | DOB-based auto-calculation · Full increment trail · MACP in trail · NPS corpus projection |
| **Financial Planner** | NPS corpus (4 return rates) · 10-yr salary timeline · Tax projection · Health score gauge |
| **Admin Settings** | College name/address · Logo upload · Backup system · Danger zone |

---

## 🖥️ Screenshots

```
┌─────────────────────────────────────────────────────────┐
│  💰 GURU NANAK COLLEGE          v8.0 Ultra Pro          │
├──────────┬──────────────────────────────────────────────┤
│ Overview │  Dashboard                                    │
│  ▸ Dashboard │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│  ▸ All Profiles│ │  12  │ │ ₹8.5L│ │ ₹7.2L│ │ ₹85K │  │
│ Employee │  │Profiles│ │Gross │ │Net   │ │NPS   │   │
│  ▸ Edit Profile│ └──────┘ └──────┘ └──────┘ └──────┘   │
│  ▸ 7th Fixation│                                        │
│  ▸ MACP  │  [Category Donut] [Level Bar] [DA Sparkline] │
│  ▸ Salary│                                              │
│ Reports  │  All Profiles Quick Overview                 │
│  ▸ Yearly│  Name          Level  Basic   Net   Action   │
│  ▸ Arrear│  Sri Ram...    L-6    ₹52,000 ₹44K  ✏ ⭐    │
│  ▸ Bill  │  Smt Priya...  L-4    ₹29,200 ₹24K  ✏ ⭐    │
│  ▸ Annual│                                              │
│  ▸ Tax   │                                              │
│ Tools    │                                              │
│  ▸ Planner    │                                         │
│  ▸ Settings   │                                         │
└──────────┴──────────────────────────────────────────────┘
```

---

## 🚀 Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

### Quick Start

```bash
# 1. Clone or download the project
git clone https://github.com/your-username/jharkhand-pay-master-pro.git
cd jharkhand-pay-master-pro

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
# Opens at http://localhost:3000
```

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

### Deploy to Vercel (Recommended — Free)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts → Get a live URL in 60 seconds
```

---

## 📁 Project Structure

```
jharkhand-pay-master-pro/
├── src/
│   ├── App.tsx          ← Main application (2,900+ lines)
│   ├── main.tsx         ← React entry point
│   └── index.css        ← Global styles
├── public/              ← Static assets
├── index.html           ← HTML entry point
├── package.json         ← Dependencies
├── vite.config.ts       ← Build configuration
├── tsconfig.json        ← TypeScript config
└── README.md            ← This file
```

---

## 📦 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^19 | UI Framework |
| `react-dom` | ^19 | DOM rendering |
| `motion` | ^12 | Animations |
| `lucide-react` | ^0.546 | Icons |
| `xlsx` | ^0.18 | Premium Excel export |
| `html2canvas` | ^1.4 | PDF screenshot |
| `jspdf` | ^4.2 | PDF generation |
| `tailwindcss` | ^4.1 | Styling |

---

## 💡 Usage Guide

### Step 1 — Configure College

Go to **Admin Settings** tab:
- Enter college name, address, affiliation
- Upload official logo (PNG/JPG)
- Logo auto-appears on salary slips, bills, statements

### Step 2 — Add Employee Profiles

Go to **All Profiles** → **Add New**:
- Select designation → pay level auto-fills
- Enter DOB and DOJ for retirement calculations
- Set DA rate, HRA category, deductions
- Add multiple employees for salary bill

### Step 3 — Generate Documents

| Document | Tab | Export |
|----------|-----|--------|
| Salary Slip | Monthly Salary | PDF |
| Yearly Summary | Yearly Summary | Excel + PDF |
| Salary Bill | Salary Bill | PDF |
| Annual Statement | Annual Statement | PDF |
| Arrear Statement | Arrear Calculator | Excel |
| All Profiles | All Profiles | Excel |

---

## 📊 Pay Matrix — Level Reference

| Level | Grade Pay (6th) | Starting Basic (7th) | GSLI/month |
|-------|----------------|----------------------|------------|
| 1 | ₹1,800 | ₹18,000 | ₹30 |
| 2 | ₹1,900 | ₹19,900 | ₹30 |
| 3 | ₹2,000 | ₹21,700 | ₹30 |
| 4 | ₹2,400 | ₹25,500 | ₹30 |
| 5 | ₹2,800 | ₹29,200 | ₹60 |
| 6 | ₹4,200 | ₹35,400 | ₹60 |
| 7 | ₹4,600 | ₹44,900 | ₹60 |
| 8 | ₹4,800 | ₹47,600 | ₹60 |
| 9 | ₹5,400 | ₹53,100 | ₹60 |
| 10 | ₹5,400 | ₹56,100 | ₹120 |
| 11 | ₹6,600 | ₹67,700 | ₹120 |
| 12 | ₹7,600 | ₹78,800 | ₹120 |
| 13 | ₹8,700 | ₹1,23,100 | ₹120 |
| 14 | ₹8,900 | ₹1,44,200 | ₹120 |

---

## 📅 DA Rate History (7th CPC)

| Effective From | DA Rate | Status |
|---------------|---------|--------|
| January 2016 | 0% | Base |
| July 2021 | 28% | Confirmed ✅ |
| January 2022 | 34% | Confirmed ✅ |
| July 2022 | 38% | Confirmed ✅ |
| January 2023 | 42% | Confirmed ✅ |
| July 2023 | 46% | Confirmed ✅ |
| January 2024 | 50% | Confirmed ✅ |
| July 2024 | 53% | Confirmed ✅ |
| January 2025 | 55% | Confirmed ✅ |
| July 2025 | 58% | Projected ⚠ |
| January 2026 | 61% | Projected ⚠ |

> ⚠ Projected rates: Official Jharkhand Government Gazette order awaited. Verify before use.

---

## 🏦 NPS (National Pension System)

- **Employee Contribution:** 10% of (Basic + DA)
- **Government Contribution:** 14% of (Basic + DA)
- **Total monthly NPS:** 24% of (Basic + DA)
- **Tax Benefit (Old Regime):** Employer's 14% exempt under Sec 80CCD(2)
- **Tax Benefit (New Regime):** Same — exempt under Sec 80CCD(2)

---

## 🧮 Gratuity Formula

```
Gratuity = (Last Basic + DA) × 15 × Qualifying Service Years
           ──────────────────────────────────────────────────
                              26

Maximum payable: ₹20,00,000 (Twenty Lakhs)
Qualifying Service: Minimum 5 years required
```

---

## 📋 MACP (Modified Assured Career Progression)

Financial upgradation (next Pay Level) if no promotion in:
- **10 years** → 1st MACP
- **20 years** → 2nd MACP
- **30 years** → 3rd MACP

MACP is automatically calculated in:
- Retirement projection trail ✅
- Financial Planner salary timeline ✅
- MACP Calculator tab ✅

---

## ⚠️ Important Disclaimers

1. **Reference Tool Only** — All calculations are estimates. Final salary must be verified with Treasury/Accounts Office.
2. **DA Rates** — Projected rates (Jul 2025, Jan 2026) are estimates. Verify from official Jharkhand Gazette.
3. **Tax Calculation** — Approximate based on provided data. Consult CA for actual tax filing.
4. **Retirement Benefits** — Final gratuity/leave encashment sanctioned by competent authority only.
5. **Data Storage** — All data stored in browser localStorage. Clear browser = Data lost. Use **Backup** feature regularly.

---

## 💾 Data Backup

> **Important:** This app stores data in browser's localStorage.
> If you clear browser data, all profiles will be deleted.

**How to backup:**
- Go to **Settings** tab → **Backup All Data** (exports Excel)
- Or click the orange **Backup Now** banner (appears after 7 days)
- Or go to **All Profiles** → **Export All**

**How to restore:**
- Go to **All Profiles** → **Import Excel** → Select your backup file

---

## 🛠️ Customization

### Change College Name / Logo
Settings tab → Institution Details → Update name/address → Upload logo

### Add New Designations
Edit `DESIG_CONFIG` in `App.tsx`:
```typescript
'Your Designation': {
  level: 6,        // Pay Level
  ta: 1800,        // Transport Allowance
  ma: 1000,        // Medical Allowance
  washing: 0,      // Washing Allowance
  gp6: 4200,       // Grade Pay (6th CPC)
  bp6: 9300,       // Band Pay (6th CPC)
  cat: 'admin'     // Category
}
```

### Update DA Rates
Edit `DA_HISTORY` in `App.tsx`:
```typescript
'2025-07': 58,   // Add/update when official order comes
```

---

## 🗺️ Roadmap

- [ ] Form 16 Part A & Part B (complete format)
- [ ] Form 10E (Arrear tax relief)
- [ ] GPF Register (pre-2004 employees)
- [ ] Increment Certificate document
- [ ] PWA (offline support)
- [ ] Multi-language (Hindi + English)
- [ ] Print-optimized CSS
- [ ] @react-pdf/renderer for vector PDFs

---

## 🙏 Acknowledgements

- **7th Pay Commission** — Government of India recommendations
- **Jharkhand Government** — State-specific DA/allowance orders
- **Binod Bihari Mahto Koylanchal University** — Affiliation reference
- Built with ❤️ for government college staff of Jharkhand

---

## 📄 License

```
MIT License

Copyright (c) 2026 Jharkhand Pay Master Pro

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
```

---

<div align="center">

**Made for Jharkhand Government College Non-Teaching Staff**

*7th Pay · 8th Pay · MACP · NPS · Retirement · Tax · Salary Bill*

⭐ Star this repo if it helped you!

</div>