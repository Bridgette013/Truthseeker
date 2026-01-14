import React, { useState, useRef } from 'react';
import { 
  MessageSquareWarning, Upload, FileText, Loader2, 
  AlertTriangle, CheckCircle, BrainCircuit, MessageSquare, 
  Plus, Trash2, ArrowRight
} from 'lucide-react';
import { analyzeConversation, extractTextFromImage, ConversationAnalysisResult } from '../services/conversationAnalysis';
import ReactMarkdown from 'react-markdown';

const ToolAnalyzeConversation: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [context, setContext] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [result, setResult] = useState<ConversationAnalysisResult | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        alert("Please upload an image (screenshot) file.");
        return;
      }

      setIsExtractingText(true);
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          const extractedText = await extractTextFromImage(base64Data, file.type);
          
          setInputText(prev => {
            const separator = prev ? '\n\n--- SCREENSHOT EXTRACT ---\n' : '';
            return prev + separator + extractedText;
          });
          setIsExtractingText(false);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error(error);
        setIsExtractingText(false);
        alert("Failed to extract text from image.");
      }
    }
  };

  const runAnalysis = async () => {
    if (!inputText.trim()) return;
    
    setIsAnalyzing(true);
    setResult(null);
    
    try {
      const analysis = await analyzeConversation(inputText, context);
      setResult(analysis);
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'HIGH': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'MEDIUM': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      default: return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    }
  };

  const getRiskColor = (level: string) => {
    switch(level) {
      case 'CRITICAL': return 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)]';
      case 'HIGH': return 'bg-orange-600 shadow-[0_0_20px_rgba(234,88,12,0.5)]';
      case 'MEDIUM': return 'bg-yellow-600 shadow-[0_0_20px_rgba(202,138,4,0.5)]';
      default: return 'bg-emerald-600 shadow-[0_0_20px_rgba(5,150,105,0.5)]';
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <MessageSquareWarning className="text-vvv-coral" />
          Conversation Analyzer
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-0">
        
        {/* Left Col: Input */}
        <div className="flex flex-col gap-4 h-full min-h-0">
          <div className="bg-vvv-surface border border-vvv-divider rounded-xl p-4 flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between mb-3">
               <span className="text-sm font-bold text-white flex items-center gap-2">
                 <MessageSquare className="w-4 h-4 text-vvv-purple" /> Input Chat Logs
               </span>
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 disabled={isExtractingText}
                 className="text-xs bg-vvv-charcoal border border-vvv-divider px-3 py-1.5 rounded-lg hover:border-vvv-purple/50 transition-all flex items-center gap-2"
               >
                 {isExtractingText ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                 Add Screenshot
               </button>
               <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
            </div>
            
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste conversation text here... or upload screenshots to extract text automatically."
              className="flex-1 bg-vvv-charcoal border border-vvv-divider rounded-lg p-3 text-sm font-mono text-vvv-text focus:outline-none focus:border-vvv-purple resize-none placeholder-vvv-muted/30"
            />

            <div className="mt-4 pt-4 border-t border-vvv-divider">
               <label className="text-xs font-bold text-vvv-muted mb-2 block">Context (Optional)</label>
               <input 
                 type="text" 
                 value={context}
                 onChange={(e) => setContext(e.target.value)}
                 placeholder="E.g., We met on Tinder 2 weeks ago, they say they are a doctor..."
                 className="w-full bg-vvv-charcoal border border-vvv-divider rounded-lg px-3 py-2 text-sm text-vvv-text focus:outline-none focus:border-vvv-purple"
               />
            </div>
          </div>

          <button
            onClick={runAnalysis}
            disabled={isAnalyzing || !inputText.trim()}
            className="w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all vvv-btn-shine bg-gradient-to-r from-vvv-coral to-vvv-purple text-white hover:shadow-vvv-purple/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Analyzing Patterns...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <BrainCircuit className="w-5 h-5" /> Analyze Conversation
              </span>
            )}
          </button>
        </div>

        {/* Right Col: Results */}
        <div className="bg-vvv-surface border border-vvv-divider rounded-xl flex flex-col h-full min-h-0 overflow-hidden shadow-lg">
           <div className="p-4 border-b border-vvv-divider bg-vvv-charcoal/30 flex justify-between items-center">
             <h3 className="font-bold text-white flex items-center gap-2">
               <FileText className="w-4 h-4 text-vvv-purple" /> Analysis Report
             </h3>
             {result && (
               <span className={`text-xs font-bold px-3 py-1 rounded-full text-white ${getRiskColor(result.riskLevel)}`}>
                 {result.riskLevel} RISK
               </span>
             )}
           </div>
           
           <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
             {!result ? (
               <div className="h-full flex flex-col items-center justify-center text-vvv-muted opacity-50 space-y-4">
                 <MessageSquareWarning className="w-16 h-16" />
                 <p className="text-sm">Enter chat logs to detect manipulation patterns.</p>
               </div>
             ) : (
               <div className="space-y-8">
                 
                 {/* Summary */}
                 <div>
                   <h4 className="text-sm font-bold text-vvv-muted uppercase tracking-wider mb-2">Assessment</h4>
                   <p className="text-white leading-relaxed">{result.summary}</p>
                 </div>

                 {/* Patterns */}
                 {result.patterns.length > 0 && (
                   <div>
                     <h4 className="text-sm font-bold text-vvv-muted uppercase tracking-wider mb-3">Detected Patterns</h4>
                     <div className="space-y-3">
                       {result.patterns.map((pattern, idx) => (
                         <div key={idx} className={`p-4 rounded-lg border ${getSeverityColor(pattern.severity)}`}>
                           <div className="flex items-center justify-between mb-2">
                             <span className="font-bold text-sm">{pattern.type.replace('_', ' ')}</span>
                             <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/20">{pattern.severity}</span>
                           </div>
                           <p className="text-xs mb-3 opacity-90">{pattern.explanation}</p>
                           {pattern.evidence.length > 0 && (
                             <div className="bg-black/20 p-2 rounded text-xs italic font-mono opacity-80 border-l-2 border-current">
                               "{pattern.evidence[0]}"
                             </div>
                           )}
                         </div>
                       ))}
                     </div>
                   </div>
                 )}

                 {/* Red Flags & Recommendations */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Red Flags
                      </h4>
                      <ul className="space-y-2">
                        {result.redFlags.map((flag, i) => (
                          <li key={i} className="text-sm text-vvv-text flex gap-2">
                            <span className="text-red-500">•</span> {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Recommendations
                      </h4>
                      <ul className="space-y-2">
                        {result.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm text-vvv-text flex gap-2">
                            <span className="text-emerald-500">→</span> {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                 </div>

               </div>
             )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default ToolAnalyzeConversation;
