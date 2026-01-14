import React, { useState, useRef, useEffect } from 'react';
import { AnalysisMode, LoadingState, SubscriptionTier } from '../types';
import { analyzeImage } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { Upload, Cpu, User, Loader2, Image as ImageIcon, SplitSquareHorizontal, Lock, AlertCircle, Wand2 } from 'lucide-react';

interface ToolAnalyzeImageProps {
  initialFile?: File | null;
  onAnalysisComplete?: (fileName: string, result: string, risk: 'LOW'|'MEDIUM'|'HIGH') => void;
  userTier?: SubscriptionTier;
  onOpenUpgrade?: () => void;
}

const ToolAnalyzeImage: React.FC<ToolAnalyzeImageProps> = ({ initialFile, onAnalysisComplete, userTier = SubscriptionTier.FREE, onOpenUpgrade }) => {
  const [file, setFile] = useState<File | null>(initialFile || null);
  const [preview, setPreview] = useState<string | null>(initialFile ? URL.createObjectURL(initialFile) : null);
  
  // Comparison State
  const [comparisonFile, setComparisonFile] = useState<File | null>(null);
  const [comparisonPreview, setComparisonPreview] = useState<string | null>(null);
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  
  const [mode, setMode] = useState<AnalysisMode>(AnalysisMode.AI_AUTO);
  const [loading, setLoading] = useState<LoadingState>(LoadingState.IDLE);
  const [result, setResult] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const comparisonInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialFile) {
        setFile(initialFile);
        setPreview(URL.createObjectURL(initialFile));
    }
  }, [initialFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult('');
    }
  };

  const handleComparisonFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const selectedFile = e.target.files[0];
        setComparisonFile(selectedFile);
        setComparisonPreview(URL.createObjectURL(selectedFile));
      }
  };

  const loadExampleFake = async () => {
      const response = await fetch("https://upload.wikimedia.org/wikipedia/commons/8/85/Elon_Musk_Royal_Society_%28crop1%29.jpg"); 
      const blob = await response.blob();
      const exampleFile = new File([blob], "example_deepfake.jpg", { type: "image/jpeg" });
      setComparisonFile(exampleFile);
      setComparisonPreview("https://upload.wikimedia.org/wikipedia/commons/8/85/Elon_Musk_Royal_Society_%28crop1%29.jpg");
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(LoadingState.ANALYZING);
    setResult('');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
            const base64Data = (reader.result as string).split(',')[1];
            
            // Stream the result update
            const response = await analyzeImage(
                base64Data, 
                file.type, 
                mode,
                (chunk) => {
                    setResult(prev => prev + chunk);
                }
            );
            
            const text = response.text || "";
            if (!text && !result) {
                setResult("Analysis complete, but no text was generated.");
            }
            
            setLoading(LoadingState.COMPLETE);

            let risk: 'LOW'|'MEDIUM'|'HIGH' = 'LOW';
            const fullText = result || text;
            if (fullText.toLowerCase().includes('high risk') || fullText.toLowerCase().includes('highly edited') || fullText.toLowerCase().includes('ai generated')) risk = 'HIGH';
            else if (fullText.toLowerCase().includes('suspicious') || fullText.toLowerCase().includes('medium')) risk = 'MEDIUM';

            if (onAnalysisComplete) {
                onAnalysisComplete(file.name, fullText, risk);
            }
        } catch (e) {
             console.error(e);
             setResult("Secure connection failed. Please ensure your API Key is valid.");
             setLoading(LoadingState.ERROR);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setResult("Error processing file.");
      setLoading(LoadingState.ERROR);
    }
  };

  const toggleComparisonMode = () => {
      if (userTier === SubscriptionTier.PREMIUM) {
          setIsComparisonMode(!isComparisonMode);
      } else {
          if(onOpenUpgrade) onOpenUpgrade();
      }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <ImageIcon className="text-vvv-purple" />
          Image Forensics
        </h2>
        
        <div className="flex items-center gap-3">
            {/* Comparison Toggle */}
            <button
                onClick={toggleComparisonMode}
                className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all
                    ${isComparisonMode 
                        ? 'bg-gradient-to-r from-vvv-coral to-vvv-purple border-vvv-purple/50 text-white shadow-lg' 
                        : 'bg-vvv-surface border-vvv-divider text-vvv-muted hover:text-white'}
                `}
            >
                {userTier !== SubscriptionTier.PREMIUM && <Lock className="w-3 h-3" />}
                <SplitSquareHorizontal className="w-4 h-4" />
                Comparison Tool
            </button>

            <div className="bg-vvv-charcoal p-1 rounded-lg border border-vvv-divider flex">
            <button
                onClick={() => setMode(AnalysisMode.AI_AUTO)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                mode === AnalysisMode.AI_AUTO ? 'bg-gradient-to-r from-vvv-coral to-vvv-purple text-white shadow-lg' : 'text-vvv-muted hover:text-white'
                }`}
            >
                <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                AI Analysis
                </div>
            </button>
            <button
                onClick={() => setMode(AnalysisMode.USER_GUIDED)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                mode === AnalysisMode.USER_GUIDED ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'text-vvv-muted hover:text-white'
                }`}
            >
                <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Guided Tutorial
                </div>
            </button>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-0">
        {/* Left Col: Upload & Preview & Comparison */}
        <div className="flex flex-col gap-4">
          
          {/* Main Visualizer Area */}
          <div className="relative flex-1 bg-vvv-surface rounded-xl border-2 border-vvv-divider overflow-hidden min-h-[400px] flex items-center justify-center">
            
            {/* If Comparison Mode is Active */}
            {isComparisonMode && preview ? (
                <div className="relative w-full h-full flex items-center justify-center bg-black/50">
                    {/* If no second file, ask for it */}
                    {!comparisonPreview ? (
                         <div className="text-center p-8 space-y-4">
                             <SplitSquareHorizontal className="w-12 h-12 text-vvv-purple mx-auto" />
                             <h3 className="text-white font-bold text-lg">Comparison Mode Active</h3>
                             <p className="text-vvv-muted text-sm max-w-xs mx-auto">Upload a reference image (e.g. the original) or load a known deepfake example to compare side-by-side.</p>
                             
                             <div className="flex flex-wrap gap-3 justify-center items-center">
                                <button 
                                    onClick={() => comparisonInputRef.current?.click()}
                                    className="px-4 py-2 bg-vvv-purple hover:opacity-90 text-white rounded-lg text-sm font-bold flex items-center gap-2"
                                >
                                    <Upload className="w-4 h-4" />
                                    Upload Reference
                                </button>
                                <span className="text-vvv-muted text-xs font-medium">OR</span>
                                <button 
                                    onClick={loadExampleFake}
                                    className="px-4 py-2 bg-vvv-surface hover:bg-vvv-charcoal text-white rounded-lg text-sm font-bold flex items-center gap-2 border border-vvv-divider"
                                >
                                    <Wand2 className="w-4 h-4 text-vvv-purple" />
                                    Load Example Deepfake
                                </button>
                             </div>
                             <input type="file" ref={comparisonInputRef} className="hidden" onChange={handleComparisonFileChange} />
                         </div>
                    ) : (
                        // Slider Comparison View
                        <div className="relative w-full h-full select-none group cursor-ew-resize" 
                             onMouseMove={(e) => {
                                 const rect = e.currentTarget.getBoundingClientRect();
                                 const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                                 setSliderPosition((x / rect.width) * 100);
                             }}
                             onTouchMove={(e) => {
                                 const rect = e.currentTarget.getBoundingClientRect();
                                 const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
                                 setSliderPosition((x / rect.width) * 100);
                             }}
                        >
                             {/* Bottom Image (Original) */}
                             <img src={preview} alt="Original" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
                             
                             {/* Top Image (Comparison), clipped */}
                             <div 
                                className="absolute inset-0 overflow-hidden pointer-events-none border-r-2 border-vvv-purple bg-vvv-surface"
                                style={{ width: `${sliderPosition}%` }}
                             >
                                 <img src={comparisonPreview} alt="Comparison" className="absolute inset-0 w-[100vw] h-full object-contain max-w-none" style={{ width: '100%' }} /> 
                             </div>
                             
                             {/* Slider Handle */}
                             <div 
                                className="absolute top-0 bottom-0 w-1 bg-vvv-purple shadow-[0_0_10px_rgba(98,70,234,0.5)] pointer-events-none flex items-center justify-center"
                                style={{ left: `${sliderPosition}%` }}
                             >
                                 <div className="w-8 h-8 bg-vvv-purple rounded-full flex items-center justify-center shadow-xl">
                                     <SplitSquareHorizontal className="w-5 h-5 text-white" />
                                 </div>
                             </div>

                             {/* Labels */}
                             <div className="absolute bottom-4 left-4 bg-black/60 px-2 py-1 rounded text-xs text-vvv-purple font-bold pointer-events-none">Reference/Fake</div>
                             <div className="absolute bottom-4 right-4 bg-black/60 px-2 py-1 rounded text-xs text-blue-300 font-bold pointer-events-none">Analyzed Image</div>
                        </div>
                    )}
                </div>
            ) : (
                // Standard Single View
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                    w-full h-full flex flex-col items-center justify-center cursor-pointer
                    ${preview ? '' : 'hover:bg-vvv-surface/80'}
                    `}
                >
                    <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    />
                    
                    {preview ? (
                        <img src={preview} alt="Preview" className="max-h-full max-w-full object-contain p-4" />
                    ) : (
                        <div className="text-center p-8">
                            <div className="w-16 h-16 bg-vvv-charcoal rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-vvv-surface transition-colors">
                            <Upload className="w-8 h-8 text-vvv-muted" />
                            </div>
                            <p className="text-vvv-text font-medium">Click or Drag to Upload Image</p>
                            <p className="text-vvv-muted text-sm mt-2">Supports JPG, PNG, WEBP</p>
                        </div>
                    )}
                </div>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!file || loading === LoadingState.ANALYZING}
            className={`
              w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all vvv-btn-shine
              ${!file 
                ? 'bg-vvv-surface text-vvv-muted cursor-not-allowed border border-vvv-divider' 
                : loading === LoadingState.ANALYZING
                  ? 'bg-vvv-charcoal text-vvv-muted cursor-wait border border-vvv-divider'
                  : 'bg-gradient-to-r from-vvv-coral to-vvv-purple text-white hover:shadow-vvv-purple/30'
              }
            `}
          >
            {loading === LoadingState.ANALYZING ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Analyzing...
              </span>
            ) : (
              "Run Analysis"
            )}
          </button>
          
          {mode === AnalysisMode.USER_GUIDED && (
            <div className="bg-emerald-900/20 border border-emerald-900/50 p-4 rounded-lg text-sm text-emerald-200">
              <p><strong>Guided Mode:</strong> The AI will not just give you the answer. It will act as a tutor, pointing out specific regions in <em>this</em> image for you to inspect manually, teaching you forensic skills.</p>
            </div>
          )}
        </div>

        {/* Right Col: Results */}
        <div className="bg-vvv-surface border border-vvv-divider rounded-xl p-6 overflow-y-auto custom-scrollbar shadow-inner">
          <h3 className="text-lg font-bold text-white mb-4 border-b border-vvv-divider pb-2 font-display">
            Analysis Report
          </h3>
          
          {loading === LoadingState.ANALYZING && !result && (
             <div className="flex flex-col items-center justify-center h-64 text-vvv-muted space-y-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-vvv-divider rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-vvv-purple border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="animate-pulse">Gemini 3 Pro is initializing stream...</p>
             </div>
          )}

          {!loading && !result && (
            <div className="text-vvv-muted text-center mt-20 italic">
              Ready to analyze. Upload an image to begin.
            </div>
          )}

          {result && (
            <div className="prose prose-invert max-w-none prose-p:text-vvv-text prose-headings:text-white prose-strong:text-vvv-purple animate-fade-in">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolAnalyzeImage;