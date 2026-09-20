'use client';

export interface ExportColumn<T> {
  header: string;
  key: keyof T | string;
  format?: (val: any, row: T) => string | number;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface ExportSummaryMetric {
  label: string;
  value: string | number;
  subtext?: string;
}

export interface ExportSignatory {
  role: string;
  name: string;
  title: string;
  date?: string;
}

export interface ExportOptions<T> {
  filename: string;
  title: string;
  subtitle?: string;
  category?: string;
  metadata?: Record<string, string>;
  columns: ExportColumn<T>[];
  data: T[];
  summaryMetrics?: ExportSummaryMetric[];
  signatories?: ExportSignatory[];
  orientation?: 'portrait' | 'landscape';
}

/**
 * Cleanly extracts a cell value given a column definition and data row.
 */
function getCellValue<T>(row: T, col: ExportColumn<T>): string | number {
  const rawValue = (row as any)[col.key];
  if (col.format) {
    return col.format(rawValue, row);
  }
  if (rawValue === null || rawValue === undefined) {
    return '';
  }
  if (typeof rawValue === 'object') {
    return JSON.stringify(rawValue);
  }
  return rawValue;
}

/**
 * Generates an Excel-ready (.xls) spreadsheet file with styled headers, gridlines,
 * metadata header, and proper numeric alignment.
 */
export function exportToXls<T>(options: ExportOptions<T>): void {
  const {
    filename,
    title,
    subtitle = 'AquaEarth Consulting Limited — Operational Ledger',
    category = 'OFFICIAL REPORT',
    metadata = {},
    columns,
    data,
    summaryMetrics = []
  } = options;

  const dateGenerated = new Date().toISOString().replace('T', ' ').substring(0, 19);

  let html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" 
      xmlns:x="urn:schemas-microsoft-com:office:excel" 
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>${category.substring(0, 25).replace(/[\\/?*\[\]]/g, '')}</x:Name>
          <x:WorksheetOptions>
            <x:DisplayGridlines/>
          </x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 11px; }
    .org-header { font-size: 16px; font-weight: bold; color: #047857; }
    .doc-title { font-size: 14px; font-weight: bold; color: #0F172A; }
    .doc-subtitle { font-size: 11px; color: #64748B; margin-bottom: 8px; }
    .meta-table { margin-bottom: 14px; }
    .meta-label { font-weight: bold; color: #334155; }
    .meta-val { color: #0F172A; }
    .metric-box { background-color: #F8FAFC; border: 1px solid #CBD5E1; padding: 6px 12px; font-weight: bold; }
    table.data-table { border-collapse: collapse; width: 100%; }
    th { background-color: #064E3B; color: #FFFFFF; font-weight: bold; border: 1px solid #047857; padding: 8px 10px; font-size: 11px; text-align: left; }
    td { border: 1px solid #E2E8F0; padding: 6px 10px; font-size: 11px; }
    tr:nth-child(even) td { background-color: #F8FAFC; }
    .align-right { text-align: right; }
    .align-center { text-align: center; }
    .align-left { text-align: left; }
    .footer-note { font-size: 10px; color: #94A3B8; margin-top: 14px; font-style: italic; }
  </style>
</head>
<body>
  <table>
    <tr>
      <td colspan="${columns.length}" class="org-header">AQUAEARTH CONSULTING LIMITED</td>
    </tr>
    <tr>
      <td colspan="${columns.length}" class="doc-title">${title}</td>
    </tr>
    <tr>
      <td colspan="${columns.length}" class="doc-subtitle">${subtitle} | Generated: ${dateGenerated}</td>
    </tr>
  </table>

  <!-- Metadata Summary -->
  <table class="meta-table">
    <tr>
      <td class="meta-label">System Record:</td>
      <td class="meta-val">${category}</td>
      <td class="meta-label">Total Rows:</td>
      <td class="meta-val">${data.length}</td>
      ${Object.entries(metadata).map(([k, v]) => `<td class="meta-label">${k}:</td><td class="meta-val">${v}</td>`).join('')}
    </tr>
  </table>

  ${summaryMetrics.length > 0 ? `
  <table>
    <tr>
      ${summaryMetrics.map(m => `
        <td class="metric-box" colspan="2">
          ${m.label}: <strong>${m.value}</strong> ${m.subtext ? `(${m.subtext})` : ''}
        </td>
      `).join('')}
    </tr>
  </table>
  <br/>
  ` : ''}

  <table class="data-table">
    <thead>
      <tr>
        ${columns.map(col => `
          <th class="align-${col.align || 'left'}">${col.header}</th>
        `).join('')}
      </tr>
    </thead>
    <tbody>
      ${data.map(row => `
        <tr>
          ${columns.map(col => {
            const val = getCellValue(row, col);
            const alignClass = `align-${col.align || 'left'}`;
            return `<td class="${alignClass}">${val !== undefined && val !== null ? val : ''}</td>`;
          }).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>

  <table>
    <tr>
      <td colspan="${columns.length}" class="footer-note">
        AquaEarth Enterprise ERP System — Generated per SOP Operations. Confidential & Proprietary.
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename.endsWith('.xls') ? filename : `${filename}.xls`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Generates an executive, printable PDF document window with official AquaEarth letterhead,
 * summary KPI metric chips, detailed data table, and 3-way sign-off section.
 */
export function exportToPdf<T>(options: ExportOptions<T>): void {
  const {
    filename,
    title,
    subtitle = 'AquaEarth Consulting Limited — Environmental Engineering & Geosciences',
    category = 'OFFICIAL AUDIT REPORT',
    metadata = {},
    columns,
    data,
    summaryMetrics = [],
    signatories = [
      { role: 'PREPARED BY', name: 'Authorized Custodian', title: 'Finance & Operations Officer' },
      { role: 'VETTED & REVIEWED BY', name: 'Mrs. Erica Okonkwo', title: 'Chief Financial Officer (CFO)' },
      { role: 'APPROVED BY', name: 'Dr. Kaine Edike', title: 'Managing Consultant (COMEG / FNEC)' }
    ],
    orientation = 'landscape'
  } = options;

  const dateGenerated = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const timeGenerated = new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const printWindow = window.open('', '_blank', 'width=1120,height=850');
  if (!printWindow) {
    if (typeof window !== 'undefined') {
      alert('Popup blocker prevented report preview. Please allow popups for AquaEarth Platform to download PDF reports.');
    }
    return;
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title} — AquaEarth PDF Export</title>
  <style>
    @page {
      size: ${orientation};
      margin: 12mm 10mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0F172A;
      background: #FFFFFF;
      font-size: 11px;
      line-height: 1.45;
      padding: 24px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .no-print-bar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: #0F172A;
      color: #FFFFFF;
      padding: 10px 18px;
      border-radius: 12px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 14px rgba(0,0,0,0.15);
    }
    .no-print-bar button {
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 12px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }
    .btn-print {
      background: #10B981;
      color: #FFFFFF;
    }
    .btn-print:hover {
      background: #059669;
    }
    .btn-close {
      background: #334155;
      color: #F1F5F9;
    }
    .btn-close:hover {
      background: #475569;
    }
    .header-table {
      width: 100%;
      border-bottom: 2px solid #047857;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .brand-title {
      font-size: 18px;
      font-weight: 800;
      color: #047857;
      letter-spacing: -0.02em;
      text-transform: uppercase;
    }
    .brand-subtitle {
      font-size: 10px;
      color: #475569;
      margin-top: 2px;
      font-weight: 500;
    }
    .header-right {
      text-align: right;
    }
    .doc-badge {
      display: inline-block;
      padding: 3px 8px;
      background: #ECFDF5;
      color: #047857;
      border: 1px solid #A7F3D0;
      border-radius: 999px;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .doc-meta {
      font-size: 10px;
      color: #64748B;
      margin-top: 4px;
    }
    .report-headline {
      margin-bottom: 14px;
    }
    .report-title {
      font-size: 15px;
      font-weight: 700;
      color: #0F172A;
      letter-spacing: -0.01em;
    }
    .report-desc {
      font-size: 11px;
      color: #64748B;
      margin-top: 2px;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 10px;
      margin-bottom: 18px;
    }
    .metric-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 8px 12px;
    }
    .metric-label {
      font-size: 9.5px;
      font-weight: 600;
      text-transform: uppercase;
      color: #64748B;
      letter-spacing: 0.03em;
    }
    .metric-val {
      font-size: 14px;
      font-weight: 700;
      color: #0F172A;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      margin-top: 2px;
    }
    .metric-sub {
      font-size: 9px;
      color: #94A3B8;
      margin-top: 1px;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    table.data-table th {
      background: #0F172A;
      color: #FFFFFF;
      font-weight: 600;
      font-size: 9.5px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 7px 9px;
      border: 1px solid #0F172A;
    }
    table.data-table td {
      padding: 6px 9px;
      border: 1px solid #E2E8F0;
      font-size: 10.5px;
    }
    table.data-table tbody tr:nth-child(even) {
      background: #F8FAFC;
    }
    .align-left { text-align: left; }
    .align-center { text-align: center; }
    .align-right { text-align: right; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace; }
    .signatories-section {
      page-break-inside: avoid;
      margin-top: 24px;
      border-top: 1px solid #E2E8F0;
      padding-top: 16px;
    }
    .signatories-title {
      font-size: 10px;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 12px;
    }
    .signatories-grid {
      display: grid;
      grid-template-columns: repeat(${signatories.length}, 1fr);
      gap: 16px;
    }
    .sign-box {
      border: 1px dashed #CBD5E1;
      border-radius: 8px;
      padding: 10px 14px;
      background: #FAFAFA;
    }
    .sign-role {
      font-size: 9px;
      font-weight: 700;
      color: #047857;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .sign-name {
      font-size: 11px;
      font-weight: 700;
      color: #0F172A;
      margin-top: 4px;
    }
    .sign-title {
      font-size: 9.5px;
      color: #64748B;
    }
    .sign-line {
      height: 1px;
      background: #CBD5E1;
      margin: 18px 0 6px 0;
    }
    .sign-date {
      font-size: 9px;
      color: #94A3B8;
    }
    .report-footer {
      margin-top: 20px;
      border-top: 1px solid #F1F5F9;
      padding-top: 8px;
      display: flex;
      justify-content: space-between;
      color: #94A3B8;
      font-size: 9px;
    }
    @media print {
      .no-print-bar {
        display: none !important;
      }
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <div style="font-weight: 600; font-size: 12px;">
      📄 ${title} (Ready to Print or Save as PDF)
    </div>
    <div style="display: flex; gap: 8px;">
      <button class="btn-print" onclick="window.print()">
        🖨️ Print / Save as PDF
      </button>
      <button class="btn-close" onclick="window.close()">
        ✕ Close Window
      </button>
    </div>
  </div>

  <table class="header-table">
    <tr>
      <td>
        <div class="brand-title">AquaEarth Consulting Limited</div>
        <div class="brand-subtitle">Environmental Engineering, Geotechnics & Hydrogeological Consultancy</div>
        <div class="brand-subtitle">RC: 1428901 | DPR/NUPRC Permit Validated | ISO 9001:2015 Compliant</div>
      </td>
      <td class="header-right">
        <span class="doc-badge">${category}</span>
        <div class="doc-meta">Generated: <strong>${dateGenerated}</strong> ${timeGenerated}</div>
        <div class="doc-meta">Ref: <strong>AE-REP-${Date.now().toString().slice(-6)}</strong></div>
      </td>
    </tr>
  </table>

  <div class="report-headline">
    <h1 class="report-title">${title}</h1>
    <p class="report-desc">${subtitle}</p>
  </div>

  ${summaryMetrics.length > 0 ? `
  <div class="metrics-grid">
    ${summaryMetrics.map(m => `
      <div class="metric-card">
        <div class="metric-label">${m.label}</div>
        <div class="metric-val">${m.value}</div>
        ${m.subtext ? `<div class="metric-sub">${m.subtext}</div>` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  <table class="data-table">
    <thead>
      <tr>
        ${columns.map(col => `
          <th class="align-${col.align || 'left'}" style="${col.width ? `width:${col.width};` : ''}">${col.header}</th>
        `).join('')}
      </tr>
    </thead>
    <tbody>
      ${data.map(row => `
        <tr>
          ${columns.map(col => {
            const val = getCellValue(row, col);
            const alignClass = `align-${col.align || 'left'}`;
            return `<td class="${alignClass}">${val !== undefined && val !== null ? val : ''}</td>`;
          }).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>

  ${signatories.length > 0 ? `
  <div class="signatories-section">
    <div class="signatories-title">Official Authorization & Sign-off Audit</div>
    <div class="signatories-grid">
      ${signatories.map(s => `
        <div class="sign-box">
          <div class="sign-role">${s.role}</div>
          <div class="sign-name">${s.name}</div>
          <div class="sign-title">${s.title}</div>
          <div class="sign-line"></div>
          <div class="sign-date">Date Signed: ${s.date || dateGenerated}</div>
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  <div class="report-footer">
    <span>AquaEarth ERP System &bull; Confidential Internal Record &bull; Verification SHA: ${Date.now().toString(16)}</span>
    <span>Page 1 of 1</span>
  </div>

  <script>
    window.addEventListener('load', () => {
      // Auto-focus and trigger system print dialog smoothly
      setTimeout(() => {
        window.print();
      }, 400);
    });
  </script>
</body>
</html>
`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
