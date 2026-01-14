import React, { useState, useRef, useEffect } from 'react';
import { LoadingState } from '../types';
import { analyzeAudio } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { Upload, Mic, Loader2, Music } from 'lucide-react';

interface ToolAnalyzeAudioProps {
  initialFile?: File | null;
  onAnalysisComplete?: (fileName: string, result: string, risk: 'LOW'|'MEDIUM'|'HIGH') => void;
}

const ToolAnalyzeAudio: React.FC<ToolAnalyzeAudioProps> = ({ initialFile, onAnalysisComplete }) => {
  const [file, setFile] = useState<File | null>(initialFile || null);
  const [loading, setLoading] = useState<LoadingState>(LoadingState.IDLE);
  const [result, setResult] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialFile) setFile(initialFile);
  }, [initialFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult('');
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
            
            // Stream the result
            const response = await analyzeAudio(
                base64Data, 
                file.type,
                (chunk) => {
                    setResult(prev => prev + chunk);
                }
            );
            
            const text = response.text || "";
            if (!text && !result) {
                setResult("Analysis complete, but no result generated.");
            }

            setLoading(LoadingState.COMPLETE);

            let risk: 'LOW'|'MEDIUM'|'HIGH' = 'LOW';
            const fullText = result || text;
            if (fullText.toLowerCase().includes('splicing') || fullText.toLowerCase().includes('synthetic')) risk = 'HIGH';

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
      setResult("Error analyzing audio.");
      setLoading(LoadingState.ERROR);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <Mic className="text-vvv-purple" />
          Audio Transcription & Analysis
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          <div
            role="button"
            tabIndex={0}
            aria-controls="audio-upload"
            aria-label="Upload an audio file to transcribe and analyze"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
            }}
            className="flex-1 border-2 border-dashed border-vvv-divider hover:border-vvv-purple bg-vvv-surface/50 rounded-xl flex flex-col items-center justify-center cursor-pointer min-h-[250px] transition-colors group"
          >
            <label htmlFor="audio-upload" className="sr-only">Upload audio file</label>
            <input
              id="audio-upload"
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="audio/*"
              onChange={handleFileChange}
              aria-label="Upload audio file"
            />
             {file ? (
               <div className="text-center">
                 <Music className="w-12 h-12 text-vvv-purple mx-auto mb-4" />
                 <p className="text-white font-medium">{file.name}</p>
               </div>
            ) : (
               <div className="text-center">
                 <Mic className="w-12 h-12 text-vvv-muted group-hover:text-vvv-purple transition-colors mx-auto mb-4" />
                 <p className="text-vvv-muted">Upload Voice Message / Audio</p>
               </div>
            )}
          </div>
          
           <button
            onClick={handleAnalyze}
            disabled={!file || loading === LoadingState.ANALYZING}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-vvv-coral to-vvv-purple text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-vvv-purple/30 vvv-btn-shine"
          >
             {loading === LoadingState.ANALYZING ? "Processing Stream..." : "Transcribe & Check"}
          </button>
        </div>

        <div className="bg-vvv-surface border border-vvv-divider rounded-xl p-6 overflow-y-auto h-[500px] custom-scrollbar">
           <h3 className="text-sm uppercase tracking-wider text-vvv-muted mb-4 font-mono font-bold">Transcript & Analysis</h3>
           {result || loading === LoadingState.ANALYZING ? (
            <div className="prose prose-invert prose-sm prose-p:text-vvv-text prose-strong:text-vvv-purple animate-fade-in">
              {loading === LoadingState.ANALYZING && !result && <Loader2 className="w-6 h-6 animate-spin mb-2" />}
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
           ) : (
             <p className="text-vvv-muted italic">Results will appear here...</p>
           )}
        </div>
      </div>
    </div>
  );
};

export default ToolAnalyzeAudio;