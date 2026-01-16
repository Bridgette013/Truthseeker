
import React, { useState } from 'react';
import { AppView, UserProfile, CaseHistoryItem, SubscriptionTier, JournalEntry } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ToolAnalyzeImage from './components/ToolAnalyzeImage';
import ToolAnalyzeVideo from './components/ToolAnalyzeVideo';
import ToolAnalyzeAudio from './components/ToolAnalyzeAudio';
import ToolVerifyIdentity from './components/ToolVerifyIdentity';
import ToolReverseSearch from './components/ToolReverseSearch';
import ToolAnalyzeConversation from './components/ToolAnalyzeConversation';
import ToolSimulator from './components/ToolSimulator';
import EvidencePackageGenerator from './components/EvidencePackageGenerator';
import Tutorial from './components/Tutorial';
import Journal from './components/Journal';
import LearningCenter from './components/LearningCenter';
import StaticPages from './components/StaticPages';
import AuthScreen from './components/AuthScreen';
import PricingModal from './components/PricingModal';
import QuickExitButton from './components/QuickExitButton';
import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | undefined>(undefined);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [showPricing, setShowPricing] = useState(false);
  
  // State for handling drag-and-drop file passing to tools
  const [droppedFile, setDroppedFile] = useState<File | null>(null);

  const [history, setHistory] = useState<CaseHistoryItem[]>([]);

  // Lifted Journal State
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([
    {
      id: '1',
      date: new Date().toLocaleDateString(),
      createdAt: new Date().toISOString(),
      title: 'Initial Suspicion',
      content: 'Met on dating app. They moved conversation to WhatsApp immediately. Profile photo looks professional but they claim to be working on an oil rig.',
      tags: ['Platform Switch', 'Oil Rig Script']
    }
  ]);

  const handleLogin = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(undefined);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleUpgrade = (tier: SubscriptionTier) => {
      if (user) {
          setUser({ ...user, tier });
      }
      setShowPricing(false);
  };

  const handleAnalysisComplete = (fileName: string, result: string, risk: 'LOW'|'MEDIUM'|'HIGH') => {
    const newCase: CaseHistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      fileName,
      fileType: currentView === AppView.ANALYZE_IMAGE ? 'image' : currentView === AppView.ANALYZE_VIDEO ? 'video' : 'audio',
      date: new Date().toLocaleDateString(),
      timestamp: new Date().toISOString(),
      resultSummary: result.substring(0, 100) + '...',
      riskLevel: risk,
    };
    setHistory(prev => [...prev, newCase]);
  };

  const handleFileSelectFromDashboard = (file: File, targetView: AppView) => {
    setDroppedFile(file);
    setCurrentView(targetView);
  };

  if (!user) {
    return (
      <ErrorBoundary>
        <AuthScreen onLogin={handleLogin} />
      </ErrorBoundary>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard onViewChange={setCurrentView} onFileSelect={handleFileSelectFromDashboard} history={history} />;
      case AppView.ANALYZE_IMAGE:
        return <ToolAnalyzeImage 
            initialFile={droppedFile} 
            onAnalysisComplete={handleAnalysisComplete} 
            userTier={user.tier}
            onOpenUpgrade={() => setShowPricing(true)}
        />;
      case AppView.ANALYZE_VIDEO:
        return <ToolAnalyzeVideo 
            initialFile={droppedFile} 
            onAnalysisComplete={handleAnalysisComplete}
            userTier={user.tier}
            onOpenUpgrade={() => setShowPricing(true)}
        />;
      case AppView.ANALYZE_AUDIO:
        return <ToolAnalyzeAudio initialFile={droppedFile} onAnalysisComplete={handleAnalysisComplete} />;
      case AppView.VERIFY_IDENTITY:
        return <ToolVerifyIdentity />;
      case AppView.REVERSE_SEARCH:
        return <ToolReverseSearch userTier={user.tier} />;
      case AppView.ANALYZE_CONVERSATION:
        return <ToolAnalyzeConversation />;
      case AppView.SIMULATOR:
        return <ToolSimulator />;
      case AppView.EVIDENCE_PACKAGE:
        return <EvidencePackageGenerator caseHistory={history} journalEntries={journalEntries} />;
      case AppView.TUTORIAL:
        return <Tutorial />;
      case AppView.JOURNAL:
        return <Journal entries={journalEntries} onUpdate={setJournalEntries} />;
      case AppView.LEARNING_CENTER:
        return <LearningCenter />;
      case AppView.ABOUT:
      case AppView.TERMS:
      case AppView.PRIVACY:
      case AppView.CONTACT:
        return <StaticPages view={currentView} />;
      default:
        return <Dashboard onViewChange={setCurrentView} history={history} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-vvv-charcoal text-vvv-text overflow-hidden font-sans">
        
        {/* Ambient Background Glow */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-vvv-purple rounded-full blur-[180px] opacity-10"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-vvv-coral rounded-full blur-[150px] opacity-10"></div>
        </div>

        <div className="relative z-10 flex w-full h-full">
          {/* Sidebar Navigation */}
          <Sidebar 
            currentView={currentView} 
            onViewChange={setCurrentView} 
            user={user}
            onLogout={handleLogout}
            onOpenPricing={() => setShowPricing(true)}
          />

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col h-full overflow-hidden relative">
            {/* Header */}
            <header className="h-16 border-b border-vvv-divider bg-vvv-surface/80 backdrop-blur-xl flex items-center justify-between px-8 z-10 relative">
              <div className="flex items-center gap-3">
                <div className="p-1 rounded-xl overflow-hidden">
                  <img src="/logo.png" alt="TruthSeeker Logo" className="w-8 h-8 object-cover" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-white font-display">
                    <span className="vvv-gradient-text">Truth</span>Seeker
                  </h1>
                  <p className="text-[10px] text-vvv-muted font-mono tracking-wider uppercase">
                    VVV DIGITALS • FORENSIC SUITE
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-vvv-charcoal border border-vvv-divider">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-glow shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                    <span className="text-xs font-mono text-vvv-muted font-medium">SYSTEM ONLINE</span>
                </div>
                <QuickExitButton />
              </div>
            </header>

            {/* Scrollable View Content */}
            <div className="flex-1 overflow-y-auto p-8 relative">
              <div className="max-w-6xl mx-auto h-full">
                {renderView()}
              </div>
            </div>
          </main>
        </div>

        {/* Pricing Modal Overlay */}
        {showPricing && (
            <PricingModal 
              currentTier={user.tier} 
              onUpgrade={handleUpgrade} 
              onClose={() => setShowPricing(false)} 
            />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
