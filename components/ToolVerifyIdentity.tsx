import React, { useState } from 'react';
import { LoadingState } from '../types';
import { verifyIdentity, deepForensicThink } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { Search, BrainCircuit, Loader2, Globe, AlertOctagon } from 'lucide-react';

const ToolVerifyIdentity: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState<LoadingState>(LoadingState.IDLE);
  const [result, setResult] = useState<string>('');
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [groundingUrls, setGroundingUrls] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(LoadingState.ANALYZING);
    setResult('');
    setGroundingUrls([]);

    try {
      if (isThinkingMode) {
        // Use Gemini 3 Pro with thinking budget + Streaming
        const response = await deepForensicThink(
            query,
            (chunk) => setResult(prev => prev + chunk)
        );
        
        if (!response.text && !result) {
            setResult("No detailed analysis produced.");
        }
      } else {
        // Use Gemini 3 Flash with Search Grounding + Streaming
        const response = await verifyIdentity(
            query,
            (chunk) => setResult(prev => prev + chunk)
        );
        
        if (!response.text && !result) {
            setResult("No results found.");
        }
        
        // Extract grounding chunks if available
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
           setGroundingUrls(chunks);
        }
      }
      setLoading(LoadingState.COMPLETE);
    } catch (error) {
      console.error(error);
      setResult("Error processing request. Please check connection.");
      setLoading(LoadingState.ERROR);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <Search className="text-vvv-coral" />
          Identity Verification
        </h2>
        
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer bg-vvv-surface px-3 py-2 rounded-lg border border-vvv-divider select-none hover:border-vvv-purple/50 transition-colors">
            <input 
              type="checkbox" 
              checked={isThinkingMode}
              onChange={(e) => setIsThinkingMode(e.target.checked)}
              className="w-4 h-4 rounded border-vvv-divider text-vvv-purple focus:ring-vvv-purple bg-vvv-charcoal"
            />
            <span className={`text-sm font-medium ${isThinkingMode ? 'text-vvv-purple' : 'text-vvv-muted'}`}>
              Deep Thinking Mode
            </span>
            <BrainCircuit className={`w-4 h-4 ${isThinkingMode ? 'text-vvv-purple' : 'text-vvv-muted'}`} />
          </label>
        </div>
      </div>
      
      {isThinkingMode && (
        <div className="bg-vvv-purple/10 border border-vvv-purple/30 p-3 rounded-lg flex items-center gap-3">
          <AlertOctagon className="text-vvv-purple w-5 h-5" />
          <p className="text-vvv-text text-sm">
            <strong>Thinking Mode Enabled:</strong> Uses Gemini 3 Pro (Budget: 32k tokens) for complex scenario reasoning. Best for analyzing full stories or behavioral patterns, not just simple name checks.
          </p>
        </div>
      )}

      <div className="flex gap-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isThinkingMode ? "Paste the entire suspicious conversation history or scenario description..." : "Enter name, email, or username to search..."}
          className="flex-1 bg-vvv-surface border border-vvv-divider rounded-xl px-4 py-3 text-white placeholder-vvv-muted focus:outline-none focus:border-vvv-purple focus:ring-1 focus:ring-vvv-purple transition-all"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={loading === LoadingState.ANALYZING || !query.trim()}
          className="bg-gradient-to-r from-vvv-coral to-vvv-purple hover:shadow-vvv-purple/30 text-white px-8 rounded-xl font-bold transition-all disabled:opacity-50 vvv-btn-shine"
        >
          {loading === LoadingState.ANALYZING ? <Loader2 className="animate-spin" /> : "Verify"}
        </button>
      </div>

      <div className="flex-1 bg-vvv-surface border border-vvv-divider rounded-xl p-6 overflow-y-auto custom-scrollbar">
         {loading === LoadingState.ANALYZING && !result ? (
           <div className="flex flex-col items-center justify-center h-full text-vvv-muted">
             <Loader2 className="w-8 h-8 animate-spin mb-2" />
             <p>{isThinkingMode ? "Deep thinking in progress..." : "Searching global databases..."}</p>
           </div>
         ) : result ? (
           <div className="space-y-6 animate-fade-in">
             <div className="prose prose-invert max-w-none prose-p:text-vvv-text prose-strong:text-vvv-purple">
               <ReactMarkdown>{result}</ReactMarkdown>
             </div>
             
             {groundingUrls.length > 0 && (
               <div className="border-t border-vvv-divider pt-4 mt-4">
                 <h4 className="text-sm font-bold text-vvv-muted mb-2 flex items-center gap-2">
                   <Globe className="w-4 h-4" />
                   Sources Found
                 </h4>
                 <ul className="space-y-2">
                   {groundingUrls.map((chunk, i) => (
                     chunk.web?.uri ? (
                       <li key={i}>
                         <a 
                            href={chunk.web.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-vvv-purple hover:text-vvv-coral hover:underline truncate block"
                          >
                           {chunk.web.title || chunk.web.uri}
                         </a>
                       </li>
                     ) : null
                   ))}
                 </ul>
               </div>
             )}
           </div>
         ) : (
           <div className="text-vvv-muted text-center mt-20">
             Results will appear here.
           </div>
         )}
      </div>
    </div>
  );
};

export default ToolVerifyIdentity;