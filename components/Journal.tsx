import React, { useState } from 'react';
import { JournalEntry } from '../types';
import { 
  NotebookPen, AlertTriangle, ShieldAlert, HeartCrack, 
  DollarSign, MapPin, PhoneOff, Lock, ExternalLink, 
  Save, Trash2, PlusCircle, Info
} from 'lucide-react';

interface JournalProps {
  entries: JournalEntry[];
  onUpdate: (entries: JournalEntry[]) => void;
}

const RED_FLAGS = [
  {
    title: "Love Bombing",
    icon: HeartCrack,
    prompt: "Note details about excessive affection, rapid declarations of love, or pushing for commitment very early.",
    template: "Interaction Date:\nAction: [Excessive compliments / Future faking]\nQuote: \"...\"\nHow it made me feel: "
  },
  {
    title: "Money Requests",
    icon: DollarSign,
    prompt: "Document any request for funds, crypto, or gift cards, regardless of the 'emergency' reason provided.",
    template: "Date Requested:\nAmount:\nMethod (Crypto/Wire/Gift Card):\nReason Given:\nMy Response:"
  },
  {
    title: "Refuses Meeting",
    icon: PhoneOff,
    prompt: "Track excuses for avoiding video calls or in-person meetings (e.g., camera broken, military deployment).",
    template: "Date Attempted:\nExcuse Given:\nPattern Frequency:"
  },
  {
    title: "Inconsistent Location",
    icon: MapPin,
    prompt: "Note discrepancies between where they say they are vs. time zones, weather, or background objects in photos.",
    template: "Claimed Location:\nEvidence to Contrary (Timezone/IP/Photo Background):"
  },
  {
    title: "Crisis Creation",
    icon: AlertTriangle,
    prompt: "Did they suddenly have a medical emergency, car accident, or arrest when you asked for proof or money?",
    template: "Crisis Event:\nTiming relative to my questions:\nOutcome requested:"
  }
];

const RESOURCES = [
  { name: "IC3 (FBI Cyber Crime)", url: "https://www.ic3.gov/", desc: "Report internet crimes and scams." },
  { name: "National Domestic Violence Hotline", url: "https://www.thehotline.org/", desc: "Support for manipulative/abusive relationships." },
  { name: "Social Catfish", url: "https://socialcatfish.com/blog/", desc: "Educational blog on latest scam tactics." },
  { name: "Love Is Respect", url: "https://www.loveisrespect.org/", desc: "Education on healthy vs unhealthy relationship signs." }
];

const Journal: React.FC<JournalProps> = ({ entries, onUpdate }) => {
  const [activeEntryId, setActiveEntryId] = useState<string | null>(entries[0]?.id || null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // Effect to load active entry into editor
  React.useEffect(() => {
    if (activeEntryId) {
      const entry = entries.find(e => e.id === activeEntryId);
      if (entry) {
        setEditTitle(entry.title);
        setEditContent(entry.content);
      }
    } else {
      setEditTitle('');
      setEditContent('');
    }
  }, [activeEntryId, entries]);

  const handleCreateNew = () => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      createdAt: new Date().toISOString(),
      title: 'New Entry',
      content: '',
      tags: []
    };
    const newEntries = [newEntry, ...entries];
    onUpdate(newEntries);
    setActiveEntryId(newEntry.id);
  };

  const handleSave = () => {
    onUpdate(entries.map(e => 
      e.id === activeEntryId 
        ? { ...e, title: editTitle, content: editContent }
        : e
    ));
    alert("Entry saved locally.");
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure? This cannot be undone.")) {
      const newEntries = entries.filter(e => e.id !== id);
      onUpdate(newEntries);
      if (activeEntryId === id) {
        setActiveEntryId(newEntries[0]?.id || null);
      }
    }
  };

  const insertTemplate = (template: string) => {
    setEditContent(prev => prev + (prev ? '\n\n' : '') + template);
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in">
      {/* Header & Disclaimer */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <NotebookPen className="text-vvv-purple" />
            Investigation Journal
          </h2>
        </div>
        
        <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl flex gap-4">
          <ShieldAlert className="text-red-400 w-8 h-8 flex-shrink-0" />
          <div>
            <h3 className="text-red-300 font-bold text-sm uppercase tracking-wide mb-1 font-display">Critical Safety Disclaimer</h3>
            <p className="text-red-100/70 text-sm leading-relaxed">
              This journal is for your personal documentation only. <strong>The results and notes within this app do not constitute definitive legal proof.</strong> Catfishing can escalate into dangerous situations including blackmail or physical threats.
            </p>
            <p className="text-red-100/70 text-sm mt-2 font-semibold">
              If you feel you or someone else is in immediate danger, do not investigate further. Contact local law enforcement immediately.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-full min-h-0">
        
        {/* Left Column: List */}
        <div className="col-span-3 bg-vvv-surface border border-vvv-divider rounded-xl flex flex-col overflow-hidden shadow-lg">
          <div className="p-4 border-b border-vvv-divider flex justify-between items-center bg-vvv-charcoal/50">
            <span className="text-xs font-bold uppercase tracking-wider text-vvv-muted font-mono">Case Files</span>
            <button onClick={handleCreateNew} className="text-vvv-purple hover:text-white transition-colors" title="New Entry">
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2 custom-scrollbar">
            {entries.map(entry => (
              <button
                key={entry.id}
                onClick={() => setActiveEntryId(entry.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 group ${
                  activeEntryId === entry.id 
                    ? 'bg-vvv-charcoal border-vvv-purple/50 shadow-md' 
                    : 'bg-transparent border-transparent hover:bg-vvv-charcoal/50 hover:border-vvv-divider'
                }`}
              >
                <div className="flex justify-between mb-1">
                  <span className={`font-semibold text-sm truncate ${activeEntryId === entry.id ? 'text-white' : 'text-vvv-text group-hover:text-white'}`}>{entry.title}</span>
                  <span className="text-[10px] text-vvv-muted font-mono">{entry.date}</span>
                </div>
                <p className="text-xs text-vvv-muted truncate opacity-70">{entry.content || "No content..."}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Middle Column: Editor */}
        <div className="col-span-6 bg-vvv-surface border border-vvv-divider rounded-xl flex flex-col p-6 shadow-lg">
          {activeEntryId ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <input 
                  type="text" 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="bg-transparent text-xl font-display font-bold text-white border-b border-transparent focus:border-vvv-purple/50 focus:outline-none w-full placeholder-vvv-muted/50 transition-colors"
                  placeholder="Entry Title..."
                />
                <div className="flex gap-2 ml-4">
                  <button onClick={() => handleDelete(activeEntryId)} className="p-2 text-vvv-muted hover:text-red-400 hover:bg-vvv-charcoal rounded-lg transition-colors" title="Delete">
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button onClick={handleSave} className="p-2 text-vvv-purple hover:text-white hover:bg-vvv-purple/20 rounded-lg transition-colors" title="Save">
                    <Save className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <textarea 
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="flex-1 bg-vvv-charcoal border border-vvv-divider rounded-xl p-4 text-vvv-text focus:outline-none focus:border-vvv-purple focus:ring-1 focus:ring-vvv-purple/50 resize-none font-mono text-sm leading-relaxed placeholder-vvv-muted/30 transition-all"
                placeholder="Start typing details related to the suspect..."
              />
              <div className="mt-4">
                <p className="text-[10px] uppercase font-bold text-vvv-muted mb-2 tracking-wider">Quick Templates:</p>
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {RED_FLAGS.map((flag, idx) => (
                    <button 
                      key={idx}
                      onClick={() => insertTemplate(flag.template)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-vvv-charcoal hover:bg-vvv-charcoal/80 border border-vvv-divider hover:border-vvv-purple/50 rounded-lg text-xs text-vvv-muted hover:text-white whitespace-nowrap transition-all"
                      title={flag.prompt}
                    >
                      <flag.icon className="w-3 h-3 text-vvv-coral" />
                      {flag.title}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-vvv-muted space-y-4">
               <NotebookPen className="w-16 h-16 opacity-10" />
               <p>Select or create an entry to begin documenting evidence.</p>
             </div>
          )}
        </div>

        {/* Right Column: Guide & Resources */}
        <div className="col-span-3 space-y-6 flex flex-col h-full overflow-hidden">
          
          {/* Red Flag Guide */}
          <div className="bg-vvv-surface border border-vvv-divider rounded-xl flex-1 flex flex-col min-h-0 shadow-lg">
             <div className="p-4 border-b border-vvv-divider bg-vvv-charcoal/30">
               <h3 className="font-bold text-white flex items-center gap-2 text-sm font-display">
                 <Info className="w-4 h-4 text-vvv-purple" /> 
                 Tactics Guide
               </h3>
             </div>
             <div className="overflow-y-auto p-4 space-y-5 custom-scrollbar">
                {RED_FLAGS.map((flag, i) => (
                  <div key={i} className="text-sm group">
                    <div className="flex items-center gap-2 mb-1 text-vvv-text font-bold group-hover:text-vvv-coral transition-colors">
                      <flag.icon className="w-3 h-3 text-vvv-muted group-hover:text-vvv-coral transition-colors" />
                      {flag.title}
                    </div>
                    <p className="text-xs text-vvv-muted leading-relaxed opacity-80">{flag.prompt}</p>
                  </div>
                ))}
             </div>
          </div>

          {/* External Resources */}
          <div className="bg-vvv-surface border border-vvv-divider rounded-xl p-4 flex-shrink-0 shadow-lg">
             <h3 className="font-bold text-white mb-3 text-sm flex items-center gap-2 font-display">
                <Lock className="w-4 h-4 text-emerald-400" />
                Professional Help
             </h3>
             <div className="space-y-2">
               {RESOURCES.map((res, i) => (
                 <a 
                   key={i} 
                   href={res.url} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="block p-3 rounded-lg bg-vvv-charcoal/50 hover:bg-vvv-charcoal border border-transparent hover:border-vvv-purple/30 transition-all group"
                 >
                    <div className="flex items-center justify-between mb-1">
                       <span className="text-xs font-bold text-vvv-purple group-hover:text-white transition-colors">{res.name}</span>
                       <ExternalLink className="w-3 h-3 text-vvv-muted" />
                    </div>
                    <p className="text-[10px] text-vvv-muted opacity-70 line-clamp-1">{res.desc}</p>
                 </a>
               ))}
             </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Journal;