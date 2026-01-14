import React, { useState } from 'react';
import { 
  Library, UserX, Smartphone, 
  CreditCard, Heart, Eye, Lock,
  BrainCircuit
} from 'lucide-react';

type SectionType = 'MOTIVES' | 'TACTICS' | 'TECH';

const LearningCenter: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionType>('MOTIVES');

  const renderContent = () => {
    switch(activeSection) {
      case 'MOTIVES':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
             <div className="bg-vvv-surface border border-vvv-divider p-6 rounded-xl vvv-card-hover group">
               <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-pink-500/10 border border-pink-500/20 rounded-lg group-hover:border-pink-500/50 transition-colors"><Heart className="text-pink-400 w-6 h-6" /></div>
                 <h3 className="text-xl font-bold text-white font-display">Romance & Emotional</h3>
               </div>
               <p className="text-vvv-text text-sm mb-4 leading-relaxed">
                 The most common motive. The perpetrator seeks emotional validation, love, or companionship they feel they cannot get as their authentic self. 
                 <br/><br/>
                 <strong className="text-pink-400">Key Signs:</strong> They want intense intimacy very quickly but refuse to meet. They often act possessive.
               </p>
             </div>

             <div className="bg-vvv-surface border border-vvv-divider p-6 rounded-xl vvv-card-hover group">
               <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg group-hover:border-emerald-500/50 transition-colors"><CreditCard className="text-emerald-400 w-6 h-6" /></div>
                 <h3 className="text-xl font-bold text-white font-display">Financial Fraud (Pig Butchering)</h3>
               </div>
               <p className="text-vvv-text text-sm mb-4 leading-relaxed">
                 A long-con investment scam. They build a relationship (often romantic) over months before introducing a "sure thing" crypto investment.
                 <br/><br/>
                 <strong className="text-emerald-400">Key Signs:</strong> Discusses "wealth mindset," screenshots of crypto gains, or sends you to a specific "trading platform" link.
               </p>
             </div>

             <div className="bg-vvv-surface border border-vvv-divider p-6 rounded-xl vvv-card-hover group">
               <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg group-hover:border-red-500/50 transition-colors"><Eye className="text-red-400 w-6 h-6" /></div>
                 <h3 className="text-xl font-bold text-white font-display">Sextortion & Coercion</h3>
               </div>
               <p className="text-vvv-text text-sm mb-4 leading-relaxed">
                 The goal is to obtain compromising photos or videos to blackmail the victim.
                 <br/><br/>
                 <strong className="text-red-400">Key Signs:</strong> Pushes for nudity very quickly, often sends a 'fake' nude first to build trust.
               </p>
             </div>

             <div className="bg-vvv-surface border border-vvv-divider p-6 rounded-xl vvv-card-hover group">
               <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg group-hover:border-blue-500/50 transition-colors"><UserX className="text-blue-400 w-6 h-6" /></div>
                 <h3 className="text-xl font-bold text-white font-display">Identity Theft</h3>
               </div>
               <p className="text-vvv-text text-sm mb-4 leading-relaxed">
                 Gathering personal information to open accounts in your name or sell your data.
                 <br/><br/>
                 <strong className="text-blue-400">Key Signs:</strong> Asks for mother's maiden name, pet names, or birth city early in conversation (security questions).
               </p>
             </div>
          </div>
        );

      case 'TACTICS':
        return (
          <div className="space-y-6 animate-fade-in">
             <div className="bg-vvv-surface border border-vvv-divider p-6 rounded-xl">
               <h3 className="text-lg font-bold text-white mb-2">Love Bombing</h3>
               <p className="text-vvv-text text-sm">Overwhelming the victim with affection, compliments, and promises of a future together very early in the interaction to create a dependency.</p>
             </div>
             <div className="bg-vvv-surface border border-vvv-divider p-6 rounded-xl">
               <h3 className="text-lg font-bold text-white mb-2">Mirroring</h3>
               <p className="text-vvv-text text-sm">Adopting the victim's interests, values, and manner of speaking to create a false sense of "soulmate" connection.</p>
             </div>
             <div className="bg-vvv-surface border border-vvv-divider p-6 rounded-xl">
               <h3 className="text-lg font-bold text-white mb-2">Crisis Fabrication</h3>
               <p className="text-vvv-text text-sm">Inventing emergencies (medical, legal, travel) that require immediate financial assistance, exploiting the victim's empathy.</p>
             </div>
          </div>
        );

      case 'TECH':
         return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                <div className="bg-vvv-surface border border-vvv-divider p-6 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                        <Smartphone className="text-vvv-purple" />
                        <h3 className="font-bold text-white">Spoofing Tools</h3>
                    </div>
                    <p className="text-vvv-text text-sm">Apps that alter caller ID, location data (GPS), and voice pitch during calls.</p>
                </div>
                <div className="bg-vvv-surface border border-vvv-divider p-6 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                        <BrainCircuit className="text-vvv-purple" />
                        <h3 className="font-bold text-white">Generative AI</h3>
                    </div>
                    <p className="text-vvv-text text-sm">Used to create unique faces that don't exist on reverse image search, or to write perfect scripts in different languages.</p>
                </div>
            </div>
         );
         
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
       <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <Library className="text-vvv-purple" />
          Knowledge Base
        </h2>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-vvv-divider">
        {(['MOTIVES', 'TACTICS', 'TECH'] as SectionType[]).map((section) => (
            <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`
                    px-4 py-2 rounded-lg text-sm font-bold tracking-wide transition-all
                    ${activeSection === section 
                        ? 'bg-vvv-purple text-white shadow-lg' 
                        : 'bg-transparent text-vvv-muted hover:text-white hover:bg-vvv-surface'}
                `}
            >
                {section}
            </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
          {renderContent()}
      </div>
    </div>
  );
};

export default LearningCenter;