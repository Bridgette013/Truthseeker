import React, { useState } from 'react';
import { X, LogOut } from 'lucide-react';
import { useQuickExit } from '../hooks/useQuickExit';

const QuickExitButton: React.FC = () => {
  const { performExit } = useQuickExit();
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative group">
      <button
        onClick={performExit}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg transition-all shadow-lg hover:shadow-red-500/30 border border-red-400/20 active:scale-95"
        aria-label="Quick Exit - Leave site immediately"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline tracking-wide">EXIT</span>
      </button>
      
      {showTooltip && (
        <div className="absolute top-full right-0 mt-3 w-56 p-3 bg-vvv-surface border border-vvv-divider rounded-lg shadow-xl z-[100] text-xs animate-fade-in pointer-events-none">
          <p className="text-white font-bold mb-1 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
             Safety Feature
          </p>
          <p className="text-vvv-muted leading-relaxed">
             Click or press <kbd className="bg-vvv-charcoal px-1 rounded border border-vvv-divider text-white font-mono">ESC</kbd> twice quickly to leave this site immediately. History will be cleared.
          </p>
          <div className="absolute top-[-5px] right-6 w-3 h-3 bg-vvv-surface border-t border-l border-vvv-divider transform rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export default QuickExitButton;