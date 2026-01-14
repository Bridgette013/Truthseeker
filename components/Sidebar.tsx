
import React from 'react';
import { AppView, UserProfile, SubscriptionTier } from '../types';
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  Video, 
  Mic, 
  Search, 
  Ghost, 
  BookOpen,
  LogOut,
  Sparkles,
  Shield,
  NotebookPen,
  Library,
  Globe,
  MessageSquareWarning,
  FileText,
  Info,
  HelpCircle
} from 'lucide-react';

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  user?: UserProfile;
  onLogout: () => void;
  onOpenPricing: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, user, onLogout, onOpenPricing }) => {
  const menuItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { type: 'divider', label: 'Forensic Tools' },
    { id: AppView.ANALYZE_IMAGE, label: 'Image Analysis', icon: ImageIcon },
    { id: AppView.ANALYZE_VIDEO, label: 'Video Forensics', icon: Video },
    { id: AppView.ANALYZE_AUDIO, label: 'Audio & Voice', icon: Mic },
    { id: AppView.ANALYZE_CONVERSATION, label: 'Chat Analyzer', icon: MessageSquareWarning },
    { id: AppView.REVERSE_SEARCH, label: 'Reverse Image Search', icon: Globe },
    { id: AppView.VERIFY_IDENTITY, label: 'Identity Check', icon: Search },
    { type: 'divider', label: 'Investigation' },
    { id: AppView.JOURNAL, label: 'Case Journal', icon: NotebookPen },
    { id: AppView.EVIDENCE_PACKAGE, label: 'Evidence Package', icon: FileText },
    { id: AppView.SIMULATOR, label: 'Profile Simulator', icon: Ghost },
    { type: 'divider', label: 'Education' },
    { id: AppView.LEARNING_CENTER, label: 'Knowledge Base', icon: Library },
    { id: AppView.TUTORIAL, label: 'App Tutorials', icon: BookOpen },
  ];

  return (
    <aside className="w-64 bg-vvv-surface border-r border-vvv-divider flex-shrink-0 flex flex-col relative overflow-hidden">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-vvv-purple/5 to-transparent pointer-events-none"></div>

      {/* Logo Section */}
      <div className="p-6 relative z-10">
        <div className="flex items-center gap-3 mb-2">
           <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vvv-coral to-vvv-purple flex items-center justify-center text-white shadow-lg vvv-glow-purple">
              <Shield className="w-6 h-6" />
           </div>
           <div>
              <span className="font-display font-bold text-xl text-white block leading-none">
                <span className="vvv-gradient-text">VVV</span>Digitals
              </span>
           </div>
        </div>
        <p className="text-[10px] text-vvv-muted uppercase tracking-[0.2em] font-mono pl-1 mt-1">
          TruthSeeker Suite
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto relative z-10 custom-scrollbar">
        {menuItems.map((item, idx) => {
          if (item.type === 'divider') {
            return (
              <div key={idx} className="pt-6 pb-2 px-3">
                <p className="text-[10px] font-semibold text-vvv-muted uppercase tracking-[0.15em] font-mono">
                  {item.label}
                </p>
              </div>
            );
          }

          const Icon = item.icon as React.ElementType;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as AppView)}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative border
                ${isActive 
                  ? 'bg-gradient-to-r from-vvv-coral/20 to-vvv-purple/20 text-white border-vvv-purple/30 shadow-lg vvv-glow-purple' 
                  : 'text-vvv-muted hover:text-white hover:bg-vvv-charcoal border-transparent'
                }
              `}
            >
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-vvv-purple' : 'text-vvv-muted group-hover:text-white'}`} />
              {item.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-vvv-coral shadow-[0_0_8px_rgba(233,98,45,0.5)]"></div>
              )}
            </button>
          );
        })}
        
        {/* Footer Links in Nav */}
        <div className="mt-8 pt-6 border-t border-vvv-divider mb-6">
            <button onClick={() => onViewChange(AppView.ABOUT)} className="w-full flex items-center gap-3 px-4 py-2 text-xs text-vvv-muted hover:text-white transition-colors">
                <Info className="w-4 h-4" /> About
            </button>
             <button onClick={() => onViewChange(AppView.CONTACT)} className="w-full flex items-center gap-3 px-4 py-2 text-xs text-vvv-muted hover:text-white transition-colors">
                <HelpCircle className="w-4 h-4" /> Contact
            </button>
            <div className="flex gap-4 px-4 mt-2 text-[10px] text-vvv-muted opacity-60">
                <button onClick={() => onViewChange(AppView.TERMS)} className="hover:underline hover:text-white">Terms</button>
                <button onClick={() => onViewChange(AppView.PRIVACY)} className="hover:underline hover:text-white">Privacy</button>
            </div>
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-vvv-divider bg-vvv-charcoal/50 relative z-10">
        {user ? (
          <div className="space-y-3">
             {/* Tier Badge */}
             <div className="flex items-center justify-between">
                <span className={`
                    text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border
                    ${user.tier === SubscriptionTier.PREMIUM ? 'bg-gradient-to-r from-vvv-coral/20 to-vvv-purple/20 text-vvv-purple border-vvv-purple/30' :
                      user.tier === SubscriptionTier.PRO ? 'bg-blue-900/30 text-blue-400 border-blue-500/30' :
                      'bg-vvv-surface text-vvv-muted border-vvv-divider'}
                `}>
                    {user.tier} TIER
                </span>
                
                {user.tier !== SubscriptionTier.PREMIUM && (
                    <button 
                        onClick={onOpenPricing}
                        className="text-[10px] flex items-center gap-1 text-vvv-coral hover:text-white transition-colors font-medium"
                    >
                        <Sparkles className="w-3 h-3" /> Upgrade
                    </button>
                )}
             </div>

             <div className="flex items-center gap-3">
                <img 
                  src={user.avatarUrl} 
                  alt="User" 
                  className="w-8 h-8 rounded-lg bg-vvv-surface border border-vvv-divider"
                />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user.username}</p>
                </div>
                <button 
                    onClick={onLogout}
                    className="p-2 text-vvv-muted hover:text-vvv-coral hover:bg-vvv-surface rounded-lg transition-colors"
                    title="Logout"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
          </div>
        ) : (
          <div className="bg-vvv-surface rounded-lg p-3 border border-vvv-divider">
             <p className="text-xs text-vvv-muted">
               Not authenticated
             </p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
