import React, { useState, useRef, useEffect } from 'react';
import { LoadingState, SubscriptionTier } from '../types';
import { analyzeVideo } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { 
  Upload, Video, Loader2, SplitSquareHorizontal, Lock, 
  Play, Pause, RefreshCw, Rewind, FastForward, 
  Settings2, Sun, Moon, Droplet, EyeOff, Gauge
} from 'lucide-react';

interface ToolAnalyzeVideoProps {
  initialFile?: File | null;
  onAnalysisComplete?: (fileName: string, result: string, risk: 'LOW'|'MEDIUM'|'HIGH') => void;
  userTier?: SubscriptionTier;
  onOpenUpgrade?: () => void;
}

interface VisualFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  grayscale: number;
  invert: number;
}

const DEFAULT_FILTERS: VisualFilters = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  grayscale: 0,
  invert: 0
};

const ToolAnalyzeVideo: React.FC<ToolAnalyzeVideoProps> = ({ initialFile, onAnalysisComplete, userTier = SubscriptionTier.FREE, onOpenUpgrade }) => {
  const [file, setFile] = useState<File | null>(initialFile || null);
  const [fileUrl, setFileUrl] = useState<string|null>(initialFile ? URL.createObjectURL(initialFile) : null);
  
  const [loading, setLoading] = useState<LoadingState>(LoadingState.IDLE);
  const [result, setResult] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Comparison & Playback State
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [comparisonFile, setComparisonFile] = useState<File|null>(null);
  const [comparisonUrl, setComparisonUrl] = useState<string|null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showVisuals, setShowVisuals] = useState(false);
  const [filters, setFilters] = useState<VisualFilters>(DEFAULT_FILTERS);
  
  const videoRef1 = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);
  const compareInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialFile) {
        setFile(initialFile);
        setFileUrl(URL.createObjectURL(initialFile));
    }
  }, [initialFile]);

  // Apply playback speed effect
  useEffect(() => {
    if (videoRef1.current) videoRef1.current.playbackRate = playbackSpeed;
    if (videoRef2.current) videoRef2.current.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 50 * 1024 * 1024) {
        alert("For this demo, please upload videos smaller than 50MB.");
        return;
      }
      setFile(selectedFile);
      setFileUrl(URL.createObjectURL(selectedFile));
      setResult('');
    }
  };

  const handleComparisonFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const selectedFile = e.target.files[0];
        setComparisonFile(selectedFile);
        setComparisonUrl(URL.createObjectURL(selectedFile));
    }
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
            // Stream results
            const response = await analyzeVideo(
                base64Data, 
                file.type,
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
            if (fullText.toLowerCase().includes('high')) risk = 'HIGH';
            else if (fullText.toLowerCase().includes('medium')) risk = 'MEDIUM';

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

  // --- Playback Controls ---

  const togglePlay = () => {
      if (!videoRef1.current) return;
      
      if (isPlaying) {
          videoRef1.current.pause();
          if (videoRef2.current) videoRef2.current.pause();
      } else {
          videoRef1.current.play();
          if (videoRef2.current) videoRef2.current.play();
      }
      setIsPlaying(!isPlaying);
  };

  const skip = (seconds: number) => {
    if (videoRef1.current) videoRef1.current.currentTime += seconds;
    if (videoRef2.current) videoRef2.current.currentTime += seconds;
  };

  const syncVideos = () => {
      // Keep reference video synced to main video
      if (videoRef1.current && videoRef2.current) {
         // Only sync if the difference is significant to avoid jitter
         if (Math.abs(videoRef1.current.currentTime - videoRef2.current.currentTime) > 0.1) {
             videoRef2.current.currentTime = videoRef1.current.currentTime;
         }
      }
  };

  // --- Visual Filter Logic ---
  
  const filterStyle = {
    filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) grayscale(${filters.grayscale}%) invert(${filters.invert}%)`
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <Video className="text-vvv-purple" />
          Video Deepfake Scanner
        </h2>

         <div className="flex items-center gap-3">
             <button
                onClick={() => setShowVisuals(!showVisuals)}
                className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all
                    ${showVisuals 
                        ? 'bg-vvv-purple border-vvv-purple/50 text-white shadow-lg' 
                        : 'bg-vvv-surface border-vvv-divider text-vvv-muted hover:text-white'}
                `}
            >
                <Settings2 className="w-4 h-4" />
                Visual Adjustments
            </button>
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
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0 flex-1">
        
        {/* Left Column: Visuals */}
        <div className="flex flex-col gap-4">
           
           {/* Visual Settings Panel */}
           {showVisuals && (
               <div className="bg-vvv-surface border border-vvv-divider p-4 rounded-xl animate-fade-in mb-2">
                   <div className="flex justify-between items-center mb-4 border-b border-vvv-divider pb-2">
                       <h3 className="text-sm font-bold text-white flex items-center gap-2">
                           <Settings2 className="w-4 h-4 text-vvv-purple" /> Forensic Filters
                       </h3>
                       <button onClick={resetFilters} className="text-xs text-vvv-purple hover:text-white flex items-center gap-1">
                           <RefreshCw className="w-3 h-3" /> Reset
                       </button>
                   </div>
                   <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                       <div className="space-y-1">
                           <label className="text-xs text-vvv-muted flex items-center gap-2"><Sun className="w-3 h-3" /> Brightness ({filters.brightness}%)</label>
                           <input type="range" min="0" max="200" value={filters.brightness} onChange={(e) => setFilters({...filters, brightness: parseInt(e.target.value)})} className="w-full accent-vvv-purple h-1 bg-vvv-charcoal rounded-lg appearance-none" />
                       </div>
                       <div className="space-y-1">
                           <label className="text-xs text-vvv-muted flex items-center gap-2"><Moon className="w-3 h-3" /> Contrast ({filters.contrast}%)</label>
                           <input type="range" min="0" max="200" value={filters.contrast} onChange={(e) => setFilters({...filters, contrast: parseInt(e.target.value)})} className="w-full accent-vvv-purple h-1 bg-vvv-charcoal rounded-lg appearance-none" />
                       </div>
                       <div className="space-y-1">
                           <label className="text-xs text-vvv-muted flex items-center gap-2"><Droplet className="w-3 h-3" /> Saturation ({filters.saturation}%)</label>
                           <input type="range" min="0" max="200" value={filters.saturation} onChange={(e) => setFilters({...filters, saturation: parseInt(e.target.value)})} className="w-full accent-vvv-purple h-1 bg-vvv-charcoal rounded-lg appearance-none" />
                       </div>
                       <div className="space-y-1">
                           <label className="text-xs text-vvv-muted flex items-center gap-2"><EyeOff className="w-3 h-3" /> Invert Colors</label>
                           <input type="range" min="0" max="100" step="100" value={filters.invert} onChange={(e) => setFilters({...filters, invert: parseInt(e.target.value)})} className="w-full accent-vvv-purple h-1 bg-vvv-charcoal rounded-lg appearance-none" />
                       </div>
                   </div>
                   <p className="text-[10px] text-vvv-muted mt-3 italic">
                       * Tip: High contrast and saturation can reveal "glitching" skin textures in deepfakes. Inverting colors helps spot masking edges.
                   </p>
               </div>
           )}

           {/* Video Player Container */}
           <div className={`
               flex-1 bg-vvv-charcoal border border-vvv-divider rounded-xl p-4 flex flex-col gap-4 relative
               ${isComparisonMode ? 'min-h-[450px]' : 'min-h-[350px]'}
           `}>
                <div className={`grid ${isComparisonMode ? 'grid-cols-2' : 'grid-cols-1'} gap-4 flex-1 h-full`}>
                    
                    {/* Evidence Video */}
                    <div className="relative bg-vvv-surface rounded-lg overflow-hidden border border-vvv-divider flex items-center justify-center">
                        {fileUrl ? (
                            <video 
                                ref={videoRef1} 
                                src={fileUrl} 
                                className="w-full h-full object-contain" 
                                style={filterStyle}
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                onTimeUpdate={syncVideos}
                                loop
                                playsInline
                            />
                        ) : (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex flex-col items-center justify-center h-full text-vvv-muted cursor-pointer hover:bg-vvv-surface/80 w-full transition-colors"
                            >
                                <Upload className="w-8 h-8 mb-2 opacity-50" />
                                <span className="text-sm font-medium">Upload Evidence Video</span>
                            </div>
                        )}
                        <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 text-xs text-white rounded font-bold">EVIDENCE</div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={handleFileChange} />
                    </div>

                    {/* Reference Video (Comparison Mode Only) */}
                    {isComparisonMode && (
                        <div 
                            className="relative bg-vvv-surface rounded-lg overflow-hidden border border-vvv-divider cursor-pointer flex items-center justify-center"
                            onClick={() => !comparisonUrl && compareInputRef.current?.click()}
                        >
                            {comparisonUrl ? (
                                <video 
                                    ref={videoRef2} 
                                    src={comparisonUrl} 
                                    className="w-full h-full object-contain"
                                    style={filterStyle} // Apply same filters for A/B testing
                                    muted 
                                    loop
                                    playsInline
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-vvv-muted">
                                    <Upload className="w-8 h-8 mb-2 opacity-50" />
                                    <span className="text-xs">Upload Reference</span>
                                </div>
                            )}
                            <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 text-xs text-vvv-purple rounded font-bold">REFERENCE</div>
                            <input type="file" ref={compareInputRef} className="hidden" accept="video/*" onChange={handleComparisonFileChange} />
                        </div>
                    )}
                </div>
           </div>

           {/* Playback Controls Bar */}
           <div className="bg-vvv-surface p-3 rounded-lg border border-vvv-divider flex flex-wrap items-center justify-between gap-4">
                {/* Transport Controls */}
                <div className="flex items-center gap-2">
                    <button onClick={() => skip(-5)} className="p-2 text-vvv-muted hover:text-white hover:bg-vvv-charcoal rounded-full" title="Rewind 5s">
                        <Rewind className="w-5 h-5" />
                    </button>
                    <button onClick={togglePlay} className="p-3 bg-gradient-to-r from-vvv-coral to-vvv-purple hover:opacity-90 rounded-full text-white transition-all shadow-lg shadow-vvv-purple/30">
                        {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                    </button>
                    <button onClick={() => skip(5)} className="p-2 text-vvv-muted hover:text-white hover:bg-vvv-charcoal rounded-full" title="Forward 5s">
                        <FastForward className="w-5 h-5" />
                    </button>
                    <button onClick={() => { if(videoRef1.current) videoRef1.current.currentTime = 0; }} className="p-2 text-vvv-muted hover:text-white hover:bg-vvv-charcoal rounded-full" title="Reset">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>

                {/* Speed Controls */}
                <div className="flex items-center gap-2 bg-vvv-charcoal p-1 rounded-lg border border-vvv-divider">
                    <Gauge className="w-4 h-4 text-vvv-muted ml-2" />
                    {[0.25, 0.5, 1, 2].map((speed) => (
                        <button
                            key={speed}
                            onClick={() => setPlaybackSpeed(speed)}
                            className={`
                                px-2 py-1 text-xs font-mono font-bold rounded transition-colors
                                ${playbackSpeed === speed ? 'bg-vvv-surface text-white border border-vvv-divider' : 'text-vvv-muted hover:text-white'}
                            `}
                        >
                            {speed}x
                        </button>
                    ))}
                </div>
           </div>

           {/* Analysis Button */}
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
                <Loader2 className="w-5 h-5 animate-spin" /> Deep Scanning Frames...
              </span>
            ) : (
              "Run AI Forensic Analysis"
            )}
          </button>
        </div>

        {/* Right Column: AI Report */}
        <div className="bg-vvv-surface border border-vvv-divider rounded-xl p-6 overflow-y-auto custom-scrollbar flex flex-col">
           <h3 className="text-lg font-bold text-white mb-4 border-b border-vvv-divider pb-2 flex items-center gap-2 font-display">
            <Video className="w-4 h-4" /> AI Analysis Report
          </h3>
          
          <div className="flex-1">
            {result || loading === LoadingState.ANALYZING ? (
                <div className="prose prose-invert max-w-none prose-sm prose-p:text-vvv-text prose-strong:text-vvv-purple animate-fade-in">
                  {loading === LoadingState.ANALYZING && !result && (
                     <div className="text-vvv-muted text-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                        <p>Initializing Stream...</p>
                     </div>
                  )}
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-vvv-muted space-y-4 opacity-60">
                    <Video className="w-16 h-16 opacity-20" />
                    <p className="text-sm italic text-center max-w-xs">
                        Upload a video to begin. <br/>
                        Use the <strong className="text-vvv-purple">Visual Adjustments</strong> to manually inspect for flickering faces or unnatural lighting before running AI.
                    </p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolAnalyzeVideo;