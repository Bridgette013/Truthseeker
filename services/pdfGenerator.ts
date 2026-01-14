import { EvidencePackage, EvidenceItem, formatDate, generateChecksum } from './evidencePackage';

// Generates HTML content that can be printed to PDF
export const generateEvidenceReportHTML = (pkg: EvidencePackage): string => {
  const styles = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
      
      * { margin: 0; padding: 0; box-sizing: border-box; }
      
      body {
        font-family: 'Inter', sans-serif;
        font-size: 11pt;
        line-height: 1.6;
        color: #1a1a1a;
        background: white;
      }
      
      .page {
        max-width: 8.5in;
        margin: 0 auto;
        padding: 0.75in;
        page-break-after: always;
      }
      
      .page:last-child { page-break-after: avoid; }
      
      h1, h2, h3 { font-family: 'Space Grotesk', sans-serif; }
      
      h1 { font-size: 24pt; margin-bottom: 0.5em; }
      h2 { font-size: 16pt; margin: 1.5em 0 0.5em; border-bottom: 2px solid #6246EA; padding-bottom: 0.25em; }
      h3 { font-size: 12pt; margin: 1em 0 0.5em; }
      
      .cover {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 9in;
        text-align: center;
      }
      
      .cover .logo {
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, #E9622D, #6246EA);
        border-radius: 16px;
        margin-bottom: 1em;
      }
      
      .cover h1 { font-size: 32pt; margin-bottom: 0.25em; }
      .cover .subtitle { font-size: 14pt; color: #666; margin-bottom: 2em; }
      
      .cover .case-info {
        background: #f5f5f5;
        padding: 1.5em 2em;
        border-radius: 8px;
        margin: 1em 0;
      }
      
      .cover .case-info p { margin: 0.5em 0; }
      .cover .confidential {
        margin-top: 2em;
        padding: 0.5em 1em;
        border: 2px solid #E9622D;
        color: #E9622D;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }
      
      .summary-box {
        background: #f8f8ff;
        border-left: 4px solid #6246EA;
        padding: 1em;
        margin: 1em 0;
      }
      
      .stat-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1em;
        margin: 1em 0;
      }
      
      .stat {
        background: #f5f5f5;
        padding: 1em;
        border-radius: 8px;
        text-align: center;
      }
      
      .stat .value {
        font-size: 24pt;
        font-weight: 700;
        color: #6246EA;
      }
      
      .stat .label {
        font-size: 9pt;
        color: #666;
        text-transform: uppercase;
      }
      
      .timeline-item {
        display: flex;
        gap: 1em;
        padding: 1em 0;
        border-bottom: 1px solid #eee;
      }
      
      .timeline-item .date {
        width: 120px;
        flex-shrink: 0;
        font-size: 9pt;
        color: #666;
      }
      
      .timeline-item.concern { background: #fff5f5; margin: 0 -1em; padding: 1em; }
      .timeline-item.concern .event { color: #c00; }
      
      .evidence-card {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 1em;
        margin: 1em 0;
        page-break-inside: avoid;
      }
      
      .evidence-card .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5em;
      }
      
      .evidence-card .type {
        font-size: 9pt;
        padding: 0.25em 0.5em;
        background: #6246EA;
        color: white;
        border-radius: 4px;
        text-transform: uppercase;
      }
      
      .risk-badge {
        font-size: 9pt;
        padding: 0.25em 0.5em;
        border-radius: 4px;
        font-weight: 600;
      }
      
      .risk-badge.high { background: #fee; color: #c00; }
      .risk-badge.medium { background: #fff8e0; color: #a50; }
      .risk-badge.low { background: #e8f5e9; color: #2e7d32; }
      
      .checksum {
        font-family: monospace;
        font-size: 9pt;
        color: #666;
        background: #f5f5f5;
        padding: 0.25em 0.5em;
        border-radius: 4px;
      }
      
      .footer {
        margin-top: 2em;
        padding-top: 1em;
        border-top: 1px solid #ddd;
        font-size: 9pt;
        color: #666;
        text-align: center;
      }
      
      .appendix-section {
        background: #f9f9f9;
        padding: 1em;
        margin: 1em 0;
        border-radius: 8px;
      }
      
      .appendix-section h4 {
        margin-bottom: 0.5em;
        color: #6246EA;
      }
      
      ul { margin-left: 1.5em; }
      li { margin: 0.5em 0; }
      
      @media print {
        body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        .page { padding: 0.5in; }
      }
    </style>
  `;

  const coverPage = `
    <div class="page cover">
      <div class="logo"></div>
      <h1>Evidence Report</h1>
      <p class="subtitle">TruthSeeker Forensic Analysis Platform</p>
      
      <div class="case-info">
        <p><strong>Case Reference:</strong> ${pkg.caseId}</p>
        <p><strong>Generated:</strong> ${formatDate(pkg.generatedAt)}</p>
        <p><strong>Total Evidence Items:</strong> ${pkg.items.length}</p>
      </div>
      
      <p class="confidential">Confidential - For Law Enforcement Use</p>
      
      <div style="margin-top: 3em; font-size: 10pt; color: #666;">
        <p>This report was generated using TruthSeeker by VVV Digitals.</p>
        <p>All analysis performed using AI forensic tools.</p>
      </div>
    </div>
  `;

  const highRiskCount = pkg.items.filter(i => i.riskLevel === 'HIGH').length;
  const mediumRiskCount = pkg.items.filter(i => i.riskLevel === 'MEDIUM').length;

  const summaryPage = `
    <div class="page">
      <h2>Executive Summary</h2>
      
      <div class="summary-box">
        <p>${pkg.overallAssessment}</p>
      </div>
      
      <div class="stat-grid">
        <div class="stat">
          <div class="value">${pkg.items.length}</div>
          <div class="label">Evidence Items</div>
        </div>
        <div class="stat">
          <div class="value" style="color: #c00;">${highRiskCount}</div>
          <div class="label">High Risk Findings</div>
        </div>
        <div class="stat">
          <div class="value" style="color: #a50;">${mediumRiskCount}</div>
          <div class="label">Medium Risk Findings</div>
        </div>
      </div>
      
      <h2>Evidence Timeline</h2>
      ${pkg.timeline.map(t => `
        <div class="timeline-item ${t.isConcern ? 'concern' : ''}">
          <div class="date">${t.date}</div>
          <div class="event">${t.event}</div>
        </div>
      `).join('')}
    </div>
  `;

  const evidencePages = pkg.items.map((item, idx) => `
    <div class="evidence-card">
      <div class="header">
        <div>
          <span class="type">${item.type}</span>
          <strong style="margin-left: 0.5em;">${item.title}</strong>
        </div>
        ${item.riskLevel ? `<span class="risk-badge ${item.riskLevel.toLowerCase()}">${item.riskLevel} RISK</span>` : ''}
      </div>
      <p style="font-size: 10pt; color: #666; margin-bottom: 0.5em;">${formatDate(item.date)}</p>
      <p>${item.summary}</p>
      ${item.rawData ? `<p style="margin-top: 0.5em;"><span class="checksum">Checksum: ${generateChecksum(item.rawData)}</span></p>` : ''}
    </div>
  `).join('');

  const evidencePage = `
    <div class="page">
      <h2>Detailed Evidence</h2>
      ${evidencePages}
    </div>
  `;

  const appendixPage = `
    <div class="page">
      <h2>Appendix</h2>
      
      <div class="appendix-section">
        <h4>How to Report Online Fraud</h4>
        <ul>
          <li><strong>IC3 (FBI Internet Crime Complaint Center):</strong> ic3.gov - For all internet-related crimes</li>
          <li><strong>FTC (Federal Trade Commission):</strong> reportfraud.ftc.gov - Consumer fraud reports</li>
          <li><strong>Local Police:</strong> File a report with your local law enforcement</li>
          <li><strong>Platform Reporting:</strong> Report the account on the platform where contact occurred</li>
        </ul>
      </div>
      
      <div class="appendix-section">
        <h4>Evidence Integrity</h4>
        <p>All evidence items include checksums generated at the time of analysis. These can be used to verify that evidence has not been modified since collection.</p>
      </div>
      
      <div class="appendix-section">
        <h4>Analysis Methodology</h4>
        <p>TruthSeeker uses AI-powered forensic analysis to detect:</p>
        <ul>
          <li>Image manipulation and AI-generated content</li>
          <li>Deepfake video detection</li>
          <li>Voice synthesis and audio manipulation</li>
          <li>Behavioral patterns indicating fraud</li>
        </ul>
        <p style="margin-top: 0.5em; font-size: 10pt; color: #666;">Note: AI analysis provides indicators and should be considered alongside other evidence.</p>
      </div>
      
      <div class="footer">
        <p>Generated by TruthSeeker | VVV Digitals LLC</p>
        <p>This report is intended for informational purposes and to assist in reporting potential fraud.</p>
      </div>
    </div>
  `;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Evidence Report - ${pkg.caseId}</title>
      ${styles}
    </head>
    <body>
      ${coverPage}
      ${summaryPage}
      ${evidencePage}
      ${appendixPage}
    </body>
    </html>
  `;
};

// Open print dialog to save as PDF
export const downloadAsPDF = (html: string, filename: string) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to download the PDF');
    return;
  }
  
  printWindow.document.write(html);
  printWindow.document.close();
  
  // Wait for fonts to load, then trigger print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
};