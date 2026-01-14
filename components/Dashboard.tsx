import React, { useCallback } from 'react';
import { AppView, CaseHistoryItem } from '../types';
import { Image, Video, Mic, Search, AlertTriangle, ArrowRight, Upload, Clock, FileText, CheckCircle, Globe, MessageSquareWarning } from 'lucide-react';

interface DashboardProps {
  onViewChange: (view: AppView) => void;
  onFileSelect?: (file: File, type: AppView) => void;
  history: CaseHistoryItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ onViewChange, onFileSelect, history }) => {
  const stats = [
    { label: 'Total Cases', value: history.length.toString(), color: 'vvv-gradient-text', isGradient: true },
    { label: 'High Risk', value: history.filter(h => h.riskLevel === 'HIGH').length.toString(), color: 'text-red-400', isGradient: false },
    { label: 'System Status', value: 'SECURE', color: 'text-emerald-400', isGradient: false },
  ];

  const quickActions = [
    { id: AppView.ANALYZE_IMAGE, title: 'Analyze Image', desc: 'Detect photoshopping & AI.', icon: Image, gradient: 'from-blue-500' },
    { id: AppView.ANALYZE_VIDEO, title: 'Analyze Video', desc: 'Scan for deepfakes & cuts.', icon: Video, gradient: 'from-vvv-purple' },
    { id: AppView.ANALYZE_CONVERSATION, title: 'Chat Analyzer', desc: 'Detect love bombing & scams.', icon: MessageSquareWarning, gradient: 'from-orange-500' },
    { id: AppView.REVERSE_SEARCH, title: 'Reverse Search', desc: 'Find stolen photos online.', icon: Globe, gradient: 'from-pink-500' },
    { id: AppView.ANALYZE_AUDIO, title: 'Analyze Audio', desc: 'Voice authenticity check.', icon: Mic, gradient: 'from-violet-500' },
    { id: AppView.VERIFY_IDENTITY, title: 'Identity Verify', desc: 'Google Search verify.', icon: Search, gradient: 'from-vvv-coral' },
  ];

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) onFileSelect?.(file, AppView.ANALYZE_IMAGE);
      else if (file.type.startsWith('video/')) onFileSelect?.(file, AppView.ANALYZE_VIDEO);
      else if (file.type.startsWith('audio/')) onFileSelect?.(file, AppView.ANALYZE_AUDIO);
    }
  }, [onFileSelect]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-display font-bold text-white">Investigator Dashboard</h2>
        <p className="text-vvv-muted max-w-2xl">
          Welcome back. Drag and drop evidence files to begin an immediate scan, or select a tool below.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-vvv-surface border border-vvv-divider p-6 rounded-xl vvv-card-hover">
            <p className="text-vvv-muted text-xs font-medium uppercase tracking-wider">{stat.label}</p>
            <p className={`text-3xl font-mono font-bold mt-2 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column: Quick Actions & Drop Zone */}
        <div className="lg:col-span-2 space-y-6">
           {/* Drop Zone */}
           <div 
             onDragOver={(e) => e.preventDefault()}
             onDrop={handleDrop}
             className="border-2 border-dashed border-vvv-divider bg-vvv-surface/50 rounded-2xl p-8 text-center hover:border-vvv-purple transition-all cursor-default group"
           >
             <div className="w-16 h-16 bg-vvv-charcoal rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-gradient-to-br group-hover:from-vvv-coral/20 group-hover:to-vvv-purple/20 transition-all">
               <Upload className="w-8 h-8 text-vvv-muted group-hover:text-vvv-purple transition-colors" />
             </div>
             <h3 className="text-xl font-bold text-white font-display">Quick Scan Evidence</h3>
             <p className="text-vvv-muted mt-2">Drag & Drop any Image, Video, or Audio file here to auto-launch the analyzer.</p>
           </div>

           {/* Tool Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {quickActions.map((action) => {
               const Icon = action.icon;
               return (
                 <button
                   key={action.id}
                   onClick={() => onViewChange(action.id)}
                   className="group relative overflow-hidden bg-vvv-surface border border-vvv-divider hover:border-vvv-purple/50 p-6 rounded-xl text-left transition-all vvv-card-hover shadow-md"
                 >
                   <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${action.gradient} to-transparent`}></div>
                   <div className="flex items-start justify-between mb-3">
                     <Icon className="w-6 h-6 text-vvv-muted group-hover:text-vvv-purple transition-colors" />
                     <ArrowRight className="w-5 h-5 text-vvv-muted group-hover:text-white transition-colors" />
                   </div>
                   <h3 className="text-lg font-bold text-white font-display">{action.title}</h3>
                   <p className="text-vvv-muted text-xs mt-1">{action.desc}</p>
                 </button>
               );
             })}
           </div>
        </div>

        {/* Sidebar Column: Recent History */}
        <div className="bg-vvv-surface border border-vvv-divider rounded-2xl p-6 shadow-lg flex flex-col h-[500px]">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 font-display">
            <Clock className="w-5 h-5 text-vvv-muted" />
            Recent Case Files
          </h3>
          
          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
            {history.length === 0 ? (
              <div className="text-center text-vvv-muted mt-20">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No analysis history found.</p>
              </div>
            ) : (
              history.slice().reverse().map((item) => (
                <div key={item.id} className="bg-vvv-charcoal border border-vvv-divider p-3 rounded-lg hover:border-vvv-purple/30 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-mono text-vvv-muted group-hover:text-white transition-colors">{item.date}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      item.riskLevel === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      item.riskLevel === 'MEDIUM' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                      'bg-green-500/20 text-green-400 border border-green-500/30'
                    }`}>
                      {item.riskLevel}
                    </span>
                  </div>
                  <p className="text-white text-sm font-medium truncate group-hover:text-vvv-purple transition-colors">{item.fileName}</p>
                  <p className="text-vvv-muted text-xs mt-1 line-clamp-2 opacity-70">{item.resultSummary}</p>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-vvv-divider text-center">
            <button className="text-xs text-vvv-coral hover:text-white font-medium transition-colors">View Full Case Archive</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;