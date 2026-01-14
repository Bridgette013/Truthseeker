import React, { useState } from 'react';
import { generateSimulationImage } from '../services/geminiService';
import { ASPECT_RATIOS, AspectRatio, LoadingState } from '../types';
import { Ghost, Sparkles, AlertTriangle, Loader2, ShieldBan } from 'lucide-react';

const ToolSimulator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<LoadingState>(LoadingState.IDLE);

  const applyWatermark = (base64Image: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            resolve(base64Image);
            return;
        }

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // 1. Tiled Watermark
        const text = "TRUTHSEEKER • SIMULATION";
        const fontSize = Math.max(24, img.width / 15);
        ctx.font = `900 ${fontSize}px sans-serif`;
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.save();
        // Rotate specifically for diagonal tiling
        ctx.translate(img.width / 2, img.height / 2);
        ctx.rotate(-45 * Math.PI / 180);
        ctx.translate(-img.width / 2, -img.height / 2);

        const tileSize = fontSize * 10; 
        for (let x = -img.width; x < img.width * 2; x += tileSize / 2) {
            for (let y = -img.height; y < img.height * 2; y += tileSize / 4) {
                ctx.fillText(text, x, y);
            }
        }
        ctx.restore();

        // 2. Bottom Warning Banner
        const bannerHeight = img.height * 0.12;
        ctx.fillStyle = "rgba(15, 23, 42, 0.9)"; // Dark Slate background
        ctx.fillRect(0, img.height - bannerHeight, img.width, bannerHeight);
        
        ctx.fillStyle = "#ef4444"; // Red text
        ctx.font = `bold ${Math.max(14, img.width / 30)}px monospace`;
        ctx.textAlign = "center";
        ctx.fillText("⚠️ SYNTHETIC ID - NOT REAL - DO NOT DISTRIBUTE", img.width / 2, img.height - (bannerHeight / 2));

        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.src = base64Image;
    });
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(LoadingState.GENERATING);
    setGeneratedImage(null);

    try {
      const response = await generateSimulationImage(prompt, aspectRatio);
      
      let foundImage = null;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
             foundImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
             break;
          }
        }
      }

      if (foundImage) {
        // Apply security watermark before setting state
        const safeImage = await applyWatermark(foundImage);
        setGeneratedImage(safeImage);
      } else {
        alert("No image generated. Policy safety block may have been triggered.");
      }
      setLoading(LoadingState.COMPLETE);
    } catch (e) {
      console.error(e);
      setLoading(LoadingState.ERROR);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <Ghost className="text-vvv-purple" />
          Profile Simulator
        </h2>
      </div>

      <div className="bg-vvv-purple/10 border border-vvv-purple/20 p-4 rounded-xl flex gap-3">
        <ShieldBan className="text-vvv-purple w-5 h-5 flex-shrink-0" />
        <div>
           <p className="text-sm text-vvv-text font-bold mb-1">
             Security Protocols Active
           </p>
           <p className="text-xs text-vvv-muted">
             All generated personas are automatically watermarked and logged to prevent misuse. 
             This tool uses <em>gemini-3-pro-image-preview</em> for educational demonstration only.
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full">
        {/* Controls */}
        <div className="md:col-span-1 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-vvv-muted">Persona Description</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., A professional headshot of a doctor in their 30s, warm lighting, trustworthy smile..."
              className="w-full h-32 bg-vvv-surface border border-vvv-divider rounded-lg p-3 text-white focus:border-vvv-purple focus:ring-1 focus:ring-vvv-purple resize-none"
            />
          </div>

          <div className="space-y-2">
             <label className="text-sm font-medium text-vvv-muted">Aspect Ratio</label>
             <div className="grid grid-cols-3 gap-2">
               {ASPECT_RATIOS.map((ratio) => (
                 <button
                   key={ratio}
                   onClick={() => setAspectRatio(ratio)}
                   className={`py-2 px-1 rounded border text-xs font-mono transition-colors ${
                     aspectRatio === ratio 
                       ? 'bg-vvv-purple border-vvv-purple text-white shadow-lg' 
                       : 'bg-vvv-surface border-vvv-divider text-vvv-muted hover:border-vvv-purple/50'
                   }`}
                 >
                   {ratio}
                 </button>
               ))}
             </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading === LoadingState.GENERATING || !prompt}
            className="w-full py-3 bg-gradient-to-r from-vvv-coral to-vvv-purple text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 vvv-btn-shine shadow-lg hover:shadow-vvv-purple/30"
          >
            {loading === LoadingState.GENERATING ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            Generate Fake
          </button>
        </div>

        {/* Output */}
        <div className="md:col-span-2 bg-vvv-charcoal border-2 border-dashed border-vvv-divider rounded-xl flex items-center justify-center relative overflow-hidden">
           {loading === LoadingState.GENERATING && (
             <div className="absolute inset-0 bg-vvv-surface/80 z-10 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-vvv-purple animate-spin mb-4" />
                <p className="text-vvv-text animate-pulse">Generating synthetic persona...</p>
             </div>
           )}
           
           {generatedImage ? (
             <div className="relative group max-h-full max-w-full">
               <img 
                 src={generatedImage} 
                 alt="Generated Persona" 
                 className="max-h-[500px] w-auto object-contain shadow-2xl rounded-lg"
                 onContextMenu={(e) => e.preventDefault()} // Disable right click
               />
               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity pointer-events-none rounded-lg">
                 <p className="text-white font-bold bg-red-600 px-4 py-2 rounded">
                    COPYRIGHT BLOCKED
                 </p>
               </div>
             </div>
           ) : (
             <div className="text-center text-vvv-muted p-8">
               <Ghost className="w-16 h-16 mx-auto mb-4 opacity-20" />
               <p>Generated image will appear here.</p>
               <p className="text-xs mt-2 text-vvv-muted opacity-60">Watermark applied automatically.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ToolSimulator;