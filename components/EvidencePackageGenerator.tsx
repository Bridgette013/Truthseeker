import React, { useState, useMemo } from 'react';
import { 
  FileText, Download, CheckSquare, Square, AlertTriangle,
  Calendar, Shield, Loader2, FileCheck, Info
} from 'lucide-react';
import { 
  EvidencePackage, 
  EvidenceItem, 
  generateCaseId,
  formatDate 
} from '../services/evidencePackage';
import { generateEvidenceReportHTML, downloadAsPDF } from '../services/pdfGenerator';
import { CaseHistoryItem, JournalEntry } from '../types';

interface EvidencePackageGeneratorProps {
  caseHistory: CaseHistoryItem[];
  journalEntries: JournalEntry[];
}

const EvidencePackageGenerator: React.FC<EvidencePackageGeneratorProps> = ({
  caseHistory,
  journalEntries
}) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [overallAssessment, setOverallAssessment] = useState('');

  // Convert case history and journal entries to evidence items
  const allEvidence = useMemo((): EvidenceItem[] => {
    const items: EvidenceItem[] = [];

    caseHistory.forEach((c, idx) => {
      items.push({
        id: `case-${idx}`,
        type: 'analysis',
        date: c.timestamp || c.date || new Date().toISOString(),
        title: c.fileName || `Analysis #${idx + 1}`,
        summary: c.resultSummary || 'Analysis completed',
        riskLevel: c.riskLevel as 'LOW' | 'MEDIUM' | 'HIGH',
        rawData: JSON.stringify(c)
      });
    });

    journalEntries.forEach((j, idx) => {
      items.push({
        id: `journal-${idx}`,
        type: 'journal',
        date: j.createdAt || j.date || new Date().toISOString(),
        title: j.title || `Journal Entry #${idx + 1}`,
        summary: j.content?.substring(0, 500) || '',
        rawData: JSON.stringify(j)
      });
    });

    return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [caseHistory, journalEntries]);

  const toggleItem = (id: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedItems(new Set(allEvidence.map(e => e.id)));
  };

  const selectNone = () => {
    setSelectedItems(new Set());
  };

  const generatePackage = async () => {
    if (selectedItems.size === 0) {
      alert('Please select at least one evidence item');
      return;
    }

    setIsGenerating(true);

    try {
      const selectedEvidence = allEvidence.filter(e => selectedItems.has(e.id));
      
      const pkg: EvidencePackage = {
        caseId: generateCaseId(),
        generatedAt: new Date().toISOString(),
        items: selectedEvidence,
        overallAssessment: overallAssessment || 'This report contains evidence collected and analyzed using TruthSeeker forensic tools. Review all items for potential indicators of online fraud or deception.',
        timeline: selectedEvidence.map(e => ({
          date: formatDate(e.date),
          event: e.title,
          evidenceId: e.id,
          isConcern: e.riskLevel === 'HIGH' || e.riskLevel === 'MEDIUM'
        }))
      };

      const html = generateEvidenceReportHTML(pkg);
      downloadAsPDF(html, `TruthSeeker-Evidence-${pkg.caseId}.pdf`);
    } finally {
      setIsGenerating(false);
    }
  };

  const highRiskCount = allEvidence.filter(e => selectedItems.has(e.id) && e.riskLevel === 'HIGH').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-display font-bold text-white">Evidence Package Generator</h2>
        <p className="text-vvv-muted mt-1">Compile your documented evidence into a formatted PDF report</p>
      </div>

      {/* Info Banner */}
      <div className="bg-vvv-purple/10 border border-vvv-purple/30 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-vvv-purple flex-shrink-0 mt-0.5" />
        <div className="text-sm text-vvv-text">
          <p className="font-medium text-vvv-purple mb-1">For Law Enforcement Use</p>
          <p>This report is formatted for submission to IC3 (FBI), FTC, or local law enforcement. All evidence includes integrity checksums.</p>
        </div>
      </div>

      {/* Selection Stats */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="bg-vvv-surface border border-vvv-divider rounded-lg px-4 py-2">
          <span className="text-vvv-muted text-sm">Selected: </span>
          <span className="font-mono font-bold text-white">{selectedItems.size}</span>
          <span className="text-vvv-muted text-sm"> / {allEvidence.length}</span>
        </div>
        
        {highRiskCount > 0 && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg px-4 py-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm font-medium">{highRiskCount} High Risk Items</span>
          </div>
        )}
        
        <div className="flex gap-2 ml-auto">
          <button onClick={selectAll} className="text-sm text-vvv-purple hover:text-white transition-colors">
            Select All
          </button>
          <span className="text-vvv-divider">|</span>
          <button onClick={selectNone} className="text-sm text-vvv-muted hover:text-white transition-colors">
            Clear
          </button>
        </div>
      </div>

      {/* Evidence List */}
      {allEvidence.length === 0 ? (
        <div className="bg-vvv-surface/50 border border-dashed border-vvv-divider rounded-2xl p-12 text-center">
          <FileText className="w-12 h-12 text-vvv-muted mx-auto mb-4" />
          <h3 className="text-lg font-display font-bold text-white mb-2">No Evidence Collected Yet</h3>
          <p className="text-vvv-muted">Analyze images, videos, or conversations first, then return here to generate your report.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
          {allEvidence.map(item => (
            <button
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                selectedItems.has(item.id)
                  ? 'bg-vvv-purple/10 border-vvv-purple/50'
                  : 'bg-vvv-surface border-vvv-divider hover:border-vvv-purple/30'
              }`}
            >
              {selectedItems.has(item.id) ? (
                <CheckSquare className="w-5 h-5 text-vvv-purple flex-shrink-0" />
              ) : (
                <Square className="w-5 h-5 text-vvv-muted flex-shrink-0" />
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    item.type === 'analysis' ? 'bg-vvv-purple/20 text-vvv-purple' :
                    item.type === 'journal' ? 'bg-blue-900/30 text-blue-400' :
                    'bg-vvv-surface text-vvv-muted'
                  }`}>
                    {item.type}
                  </span>
                  {item.riskLevel && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.riskLevel === 'HIGH' ? 'bg-red-900/30 text-red-400' :
                      item.riskLevel === 'MEDIUM' ? 'bg-yellow-900/30 text-yellow-400' :
                      'bg-emerald-900/30 text-emerald-400'
                    }`}>
                      {item.riskLevel}
                    </span>
                  )}
                </div>
                <p className="font-medium text-white truncate">{item.title}</p>
                <p className="text-xs text-vvv-muted truncate">{item.summary}</p>
              </div>
              
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-vvv-muted flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(item.date).toLocaleDateString()}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Assessment Field */}
      <div>
        <label className="block text-sm font-medium text-vvv-text mb-2">
          Overall Assessment (optional)
        </label>
        <textarea
          value={overallAssessment}
          onChange={(e) => setOverallAssessment(e.target.value)}
          placeholder="Add a summary of your case or any additional notes for the report..."
          className="w-full h-24 bg-vvv-charcoal border border-vvv-divider rounded-xl p-4 text-vvv-text placeholder-vvv-muted focus:ring-2 focus:ring-vvv-purple/50 focus:border-vvv-purple outline-none resize-none"
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={generatePackage}
        disabled={isGenerating || selectedItems.size === 0}
        className="w-full bg-gradient-to-r from-vvv-coral to-vvv-purple text-white font-bold py-4 rounded-xl transition-all vvv-btn-shine disabled:opacity-50 flex items-center justify-center gap-3"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating Report...
          </>
        ) : (
          <>
            <FileCheck className="w-5 h-5" />
            Generate Evidence Package (PDF)
          </>
        )}
      </button>

      {/* Tips */}
      <div className="bg-vvv-surface border border-vvv-divider rounded-xl p-4">
        <h4 className="font-medium text-white mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-vvv-purple" />
          Tips for Filing Reports
        </h4>
        <ul className="text-sm text-vvv-muted space-y-1">
          <li>• Save all original screenshots and conversations separately</li>
          <li>• File with IC3 (ic3.gov) for internet crimes over $1,000</li>
          <li>• Report to the FTC at reportfraud.ftc.gov</li>
          <li>• Contact your local police to file an official report</li>
          <li>• Report the account on the platform where contact occurred</li>
        </ul>
      </div>
    </div>
  );
};

export default EvidencePackageGenerator;