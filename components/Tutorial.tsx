import React, { useState } from 'react';
import { BookOpen, Eye, CheckCircle2, Layout, Video, Mic, ShieldAlert, Cpu, User } from 'lucide-react';

const Tutorial: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tools' | 'forensics'>('overview');

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-vvv-purple/20 rounded-xl border border-vvv-purple/30">
          <BookOpen className="w-8 h-8 text-vvv-purple" />
        </div>
        <div>
           <h2 className="text-3xl font-display font-bold text-white">Investigator Training Module</h2>
           <p className="text-vvv-muted">Master the art of digital detection.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-vvv-divider mb-8">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'overview' ? 'border-vvv-purple text-white' : 'border-transparent text-vvv-muted hover:text-white'}`}
        >
          App Overview
        </button>
        <button 
          onClick={() => setActiveTab('tools')}
          className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'tools' ? 'border-vvv-purple text-white' : 'border-transparent text-vvv-muted hover:text-white'}`}
        >
          Tools Menu
        </button>
        <button 
          onClick={() => setActiveTab('forensics')}
          className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'forensics' ? 'border-vvv-purple text-white' : 'border-transparent text-vvv-muted hover:text-white'}`}
        >
          Forensics Guide (Start Here)
        </button>
      </div>

      {/* Content */}
      <div className="animate-fade-in">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="bg-vvv-surface border border-vvv-divider rounded-2xl p-8">
               <h3 className="text-2xl font-bold text-white mb-4 font-display">How TruthSeeker Works</h3>
               <p className="text-vvv-text leading-relaxed mb-6">
                 TruthSeeker is a hybrid intelligence platform designed to combat catfishing and deepfakes. 
                 Unlike standard detectors, we offer two distinct modes for every analysis:
               </p>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-vvv-charcoal border border-vvv-divider p-5 rounded-xl">
                   <div className="flex items-center gap-2 mb-3">
                     <Cpu className="text-vvv-purple" />
                     <h4 className="font-bold text-white">AI Auto-Execution</h4>
                   </div>
                   <p className="text-sm text-vvv-muted">
                     The system runs a full forensic scan using Gemini 3 Pro. It looks for noise inconsistencies, metadata anomalies (if available), and deepfake artifacts. It delivers a verdict immediately.
                   </p>
                 </div>
                 <div className="bg-vvv-charcoal border border-vvv-divider p-5 rounded-xl">
                   <div className="flex items-center gap-2 mb-3">
                     <User className="text-emerald-500" />
                     <h4 className="font-bold text-white">User-Executed (Guided)</h4>
                   </div>
                   <p className="text-sm text-vvv-muted">
                     The AI becomes a tutor. Instead of giving you the answer, it analyzes the file silently and then generates a specific checklist for YOU. It teaches you to spot the fake yourself.
                   </p>
                 </div>
               </div>
            </div>
            
            <div className="bg-vvv-surface border border-vvv-divider rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-4 font-display">Data Privacy & Security</h3>
              <p className="text-vvv-muted text-sm">
                All uploaded files are processed in ephemeral containers. Your analysis history is linked to your secure profile, ensuring that sensitive investigations remain private. 
              </p>
            </div>
          </div>
        )}

        {/* TOOLS TAB */}
        {activeTab === 'tools' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: Layout, title: "Dashboard", desc: "Your command center. Upload files quickly here or view past case files." },
              { icon: Eye, title: "Image Analysis", desc: "Detects Photoshop editing (liquify, cloning) and Generative AI artifacts." },
              { icon: Video, title: "Video Forensics", desc: "Scans for face-swaps, deepfakes, and 'jump cuts' that hide context." },
              { icon: Mic, title: "Audio Analysis", desc: "Transcribes audio and checks for voice synthesis or splicing." },
              { icon: ShieldAlert, title: "Identity Verify", desc: "Uses Google Search to cross-reference names, emails, and usernames." },
            ].map((tool, i) => (
              <div key={i} className="flex gap-4 bg-vvv-surface border border-vvv-divider p-6 rounded-xl hover:border-vvv-purple/30 transition-colors">
                <tool.icon className="w-8 h-8 text-vvv-purple flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-white text-lg font-display">{tool.title}</h4>
                  <p className="text-vvv-muted text-sm mt-1">{tool.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FORENSICS GUIDE TAB */}
        {activeTab === 'forensics' && (
          <div className="space-y-12">
            
            {/* Image Section */}
            <div className="space-y-4">
               <h3 className="text-2xl font-bold text-white flex items-center gap-3 font-display">
                 <Eye className="text-vvv-purple" />
                 Image Forensics: What to Look For
               </h3>
               <div className="bg-vvv-surface border border-vvv-divider rounded-xl p-6 space-y-6">
                 <div>
                   <h4 className="font-bold text-white mb-2 text-lg">1. Detecting Generative AI (Deepfakes)</h4>
                   <ul className="space-y-2 text-vvv-text text-sm">
                     <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> <strong>Eyes & Reflections:</strong> Zoom in on the pupils. The reflection (catchlight) must match in shape and position. AI often renders one square and one round.</li>
                     <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> <strong>Accessories:</strong> Look at earrings, glasses, or jewelry. Are they symmetrical? AI often melts glasses frames into the skin.</li>
                     <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> <strong>Background Logic:</strong> Look for objects that fade into nothingness or texture changes that don't make sense (e.g., a brick wall turning into a curtain).</li>
                   </ul>
                 </div>
                 <div className="border-t border-vvv-divider pt-6">
                   <h4 className="font-bold text-white mb-2 text-lg">2. Detecting Human Tampering (Photoshop)</h4>
                   <ul className="space-y-2 text-vvv-text text-sm">
                     <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> <strong>Clone Stamp:</strong> Look for repeated patterns in the background (e.g., the same cloud or grass patch appearing twice) used to cover up an object.</li>
                     <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> <strong>Lighting Direction:</strong> If the sun is on the left, shadows must fall to the right. Composite images often combine photos with different lighting sources.</li>
                     <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> <strong>Warping (Liquify):</strong> Check straight lines in the background (door frames, tiles) near the subject's body. If they curve, the subject has been slimmed or altered.</li>
                   </ul>
                 </div>
               </div>
            </div>

            {/* Video Section */}
            <div className="space-y-4">
               <h3 className="text-2xl font-bold text-white flex items-center gap-3 font-display">
                 <Video className="text-vvv-purple" />
                 Video Forensics: Moving Targets
               </h3>
               <div className="bg-vvv-surface border border-vvv-divider rounded-xl p-6">
                 <ul className="space-y-4 text-vvv-text">
                    <li>
                      <strong className="text-white block mb-1">Context Hiding (Jump Cuts):</strong>
                      <p className="text-sm">Scammers often cut videos to remove incriminating context. Watch for sudden "jumps" in the person's head position while they are speaking a continuous sentence.</p>
                    </li>
                    <li>
                      <strong className="text-white block mb-1">Deepfake Glitches:</strong>
                      <p className="text-sm">Watch the mouth closely. Does it look blurry compared to the rest of the face? When the person turns their head sideways (profile view), does the face mask slip or flicker?</p>
                    </li>
                 </ul>
               </div>
            </div>

             {/* Audio Section */}
            <div className="space-y-4">
               <h3 className="text-2xl font-bold text-white flex items-center gap-3 font-display">
                 <Mic className="text-vvv-purple" />
                 Audio Forensics: The Ear Test
               </h3>
               <div className="bg-vvv-surface border border-vvv-divider rounded-xl p-6">
                  <p className="text-vvv-text text-sm mb-4">
                    In "Hybrid" catfishing, a scammer might use a real video but dub over it with AI audio, or splice words together.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-vvv-charcoal p-4 rounded-lg">
                      <strong className="text-white">Room Tone Splicing</strong>
                      <p className="text-xs text-vvv-muted mt-1">Every room has a hum. If the hum changes instantly between words, the audio was pasted together.</p>
                    </div>
                    <div className="bg-vvv-charcoal p-4 rounded-lg">
                      <strong className="text-white">Breath Patterns</strong>
                      <p className="text-xs text-vvv-muted mt-1">AI voice generators often forget to add breath sounds between long sentences, or they add them in unnatural places.</p>
                    </div>
                  </div>
               </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Tutorial;