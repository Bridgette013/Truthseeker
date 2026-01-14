import React, { useState, useCallback } from 'react';
import { 
  Upload, Search, ExternalLink, AlertTriangle, 
  CheckCircle, Globe, Camera, Loader2, Settings, Key,
  Copy, Trash2
} from 'lucide-react';
import { generateSearchUrls, searchTinEye, TinEyeResult } from '../services/reverseImageSearch';
import { SubscriptionTier } from '../types';

interface ToolReverseSearchProps {
  userTier: SubscriptionTier;
}

const ToolReverseSearch: React.FC<ToolReverseSearchProps> = ({ userTier }) => {
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [tinEyeResult, setTinEyeResult] = useState<TinEyeResult | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [searchUrls, setSearchUrls] = useState<ReturnType<typeof generateSearchUrls>>([]);

  const handleFileUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImage(dataUrl);
      setFileName(file.name);
      setSearchUrls(generateSearchUrls(dataUrl));
      setTinEyeResult(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) handleFileUpload(file);
        break;
      }
    }
  }, [handleFileUpload]);

  const performTinEyeSearch = async () => {
    if (!image || !apiKey) return;
    
    setIsSearching(true);
    try {
      const base64 = image.split(',')[1]; // Remove data URL prefix
      const result = await searchTinEye(base64, apiKey);
      setTinEyeResult(result);
    } finally {
      setIsSearching(false);
    }
  };

  const openSearchService = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const copyImageToClipboard = async () => {
    if (!image) return;
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      alert('Image copied! Paste it into the search service.');
    } catch (err) {
      // Fallback: open image in new tab for manual copy
      window.open(image, '_blank');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" onPaste={handlePaste}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <Globe className="text-vvv-purple" />
            Reverse Image Search
          </h2>
          <p className="text-vvv-muted mt-1 text-sm">Detect stolen photos and find social profiles.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowApiSettings(!showApiSettings)}
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-vvv-surface border border-vvv-divider hover:border-vvv-purple text-vvv-muted hover:text-white rounded-lg transition-all"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>

      {/* API Settings Panel */}
      {showApiSettings && (
        <div className="bg-vvv-surface border border-vvv-divider rounded-xl p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <Key className="w-4 h-4 text-vvv-purple" />
            <span className="text-sm font-medium text-white">TinEye API Key (Optional)</span>
          </div>
          <p className="text-xs text-vvv-muted mb-3">
            Add your TinEye API key for automated searching within the app. Otherwise, use the manual links below.
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter TinEye API key..."
            className="w-full bg-vvv-charcoal border border-vvv-divider rounded-lg px-4 py-2 text-white placeholder-vvv-muted focus:ring-2 focus:ring-vvv-purple/50 focus:border-vvv-purple outline-none text-sm"
          />
        </div>
      )}

      {/* Upload Area */}
      {!image ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-vvv-divider bg-vvv-surface/50 rounded-2xl p-12 text-center hover:border-vvv-purple transition-all cursor-pointer group"
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            className="hidden"
            id="reverse-search-upload"
          />
          <label htmlFor="reverse-search-upload" className="cursor-pointer">
            <div className="w-20 h-20 bg-vvv-charcoal rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-gradient-to-br group-hover:from-vvv-coral/20 group-hover:to-vvv-purple/20 transition-all">
              <Camera className="w-10 h-10 text-vvv-muted group-hover:text-vvv-purple transition-colors" />
            </div>
            <h3 className="text-xl font-display font-bold text-white mb-2">Upload Image to Search</h3>
            <p className="text-vvv-muted text-sm">Drag & drop, click to browse, or paste (Ctrl+V) from clipboard</p>
            <p className="text-xs text-vvv-muted mt-4 opacity-60">Supports JPG, PNG, WebP</p>
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
          {/* Left Col: Image & Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-vvv-surface border border-vvv-divider rounded-xl p-4">
                <img
                    src={image}
                    alt="Uploaded"
                    className="w-full h-auto max-h-[300px] object-contain rounded-lg border border-vvv-divider bg-black/20"
                />
                <div className="mt-4">
                    <p className="font-medium text-white text-sm truncate" title={fileName}>{fileName}</p>
                    <div className="flex gap-2 mt-3">
                    <button
                        type="button"
                        onClick={copyImageToClipboard}
                        className="flex-1 flex items-center justify-center gap-2 text-xs bg-vvv-charcoal border border-vvv-divider text-vvv-text px-3 py-2 rounded-lg hover:border-vvv-purple/30 transition-all hover:text-white"
                    >
                        <Copy className="w-3 h-3" /> Copy
                    </button>
                      <span>Image</span>
                    <button
                        type="button"
                        aria-label="Remove uploaded image"
                        title="Remove uploaded image"
                        onClick={() => {
                        setImage(null);
                        setFileName('');
                        setSearchUrls([]);
                        setTinEyeResult(null);
                        }}
                        className="flex items-center justify-center gap-2 text-xs text-vvv-muted hover:text-red-400 bg-vvv-charcoal border border-vvv-divider px-3 py-2 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                    </div>
                </div>
            </div>

            {/* TinEye Auto Search (if API key provided) */}
            {apiKey && (
                <div className="bg-vvv-surface border border-vvv-divider rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-vvv-coral to-vvv-purple rounded-lg flex items-center justify-center">
                        <Search className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-white text-sm">TinEye Auto</span>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={performTinEyeSearch}
                    disabled={isSearching}
                    className="w-full bg-gradient-to-r from-vvv-coral to-vvv-purple text-white font-bold py-2 px-4 rounded-lg transition-all vvv-btn-shine disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                    {isSearching ? (
                        <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Scanning...
                        </>
                    ) : (
                        <>
                        <Search className="w-4 h-4" />
                        Run Search
                        </>
                    )}
                </button>
                </div>
            )}
          </div>

          {/* Right Col: Results & Links */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* TinEye Results */}
            {tinEyeResult && (
                <div className="bg-vvv-surface border border-vvv-divider rounded-xl p-6 animate-fade-in">
                  <div className={`flex items-center gap-2 mb-4 ${
                    tinEyeResult.totalMatches > 0 ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {tinEyeResult.totalMatches > 0 ? (
                      <>
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-bold">{tinEyeResult.totalMatches} matches found online</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-bold">No exact matches found</span>
                      </>
                    )}
                  </div>

                  {tinEyeResult.matches.length > 0 && (
                    <div className="space-y-2">
                      {tinEyeResult.matches.map((match, idx) => (
                        <a 
                          key={idx}
                          href={match.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-vvv-charcoal rounded-lg hover:border-vvv-purple/30 border border-transparent transition-all group"
                        >
                          <Globe className="w-4 h-4 text-vvv-muted group-hover:text-vvv-purple" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate group-hover:text-vvv-purple transition-colors">{match.domain}</p>
                            <p className="text-xs text-vvv-muted">First seen: {match.crawlDate}</p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-vvv-muted group-hover:text-white" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}

            {/* Manual Search Links */}
            <div className="bg-vvv-surface border border-vvv-divider rounded-xl p-6">
                <h3 className="font-display font-bold text-white mb-2">Manual Search Services</h3>
                <p className="text-sm text-vvv-muted mb-4">
                Click a service below. Since automated access is restricted, you must <strong>copy/paste</strong> or <strong>upload</strong> your image on their site.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {searchUrls.map((service, idx) => (
                    <button
                    type="button"
                    key={idx}
                    onClick={() => openSearchService(service.searchUrl)}
                    className="flex items-center gap-3 p-4 bg-vvv-charcoal border border-vvv-divider rounded-xl hover:border-vvv-purple/30 text-left transition-all group hover:bg-vvv-charcoal/80"
                    >
                    <div className="w-10 h-10 bg-vvv-surface rounded-lg flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-vvv-coral/20 group-hover:to-vvv-purple/20 transition-all">
                        <Globe className="w-5 h-5 text-vvv-muted group-hover:text-vvv-purple transition-colors" />
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-white text-sm group-hover:text-vvv-purple transition-colors">{service.service}</p>
                        <p className="text-[10px] text-vvv-muted opacity-70">{service.description}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-vvv-muted group-hover:text-vvv-purple transition-colors" />
                    </button>
                ))}
                </div>
            </div>

            {/* Tips */}
            <div className="bg-vvv-purple/10 border border-vvv-purple/30 rounded-xl p-4">
                <h4 className="font-bold text-vvv-purple mb-2 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Pro Tips
                </h4>
                <ul className="text-xs text-vvv-text space-y-2 leading-relaxed opacity-80">
                    <li>• <strong>Yandex</strong> is currently the best for finding social media profiles from face photos.</li>
                    <li>• <strong>TinEye</strong> is excellent for finding if an image has been cropped or edited.</li>
                    <li>• <strong>Google Lens</strong> is best for identifying objects, locations (landmarks), or products in the background.</li>
                </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolReverseSearch;