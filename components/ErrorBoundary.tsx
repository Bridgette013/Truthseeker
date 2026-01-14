

import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { logger } from '../services/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Uncaught Exception in UI', { error, errorInfo }, 'ErrorBoundary');
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-vvv-charcoal flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-vvv-surface border border-vvv-divider p-8 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2 font-display">System Critical Error</h1>
            <p className="text-vvv-muted mb-6 text-sm">
              The TruthSeeker interface encountered an unexpected anomaly. 
              Our forensic logs have captured the event.
            </p>

            {this.state.error && (
              <div className="bg-black/30 p-4 rounded-lg mb-6 text-left overflow-auto max-h-32 border border-vvv-divider">
                <code className="text-xs text-red-300 font-mono">
                  {this.state.error.toString()}
                </code>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-6 py-3 bg-vvv-purple hover:bg-vvv-purple/80 text-white rounded-xl font-bold transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Reload System
              </button>
              <button
                onClick={this.handleHome}
                className="flex items-center gap-2 px-6 py-3 bg-vvv-charcoal border border-vvv-divider hover:border-vvv-muted text-vvv-muted hover:text-white rounded-xl font-bold transition-all"
              >
                <Home className="w-4 h-4" />
                Safe Mode
              </button>
            </div>
          </div>
          
          <p className="mt-8 text-xs text-vvv-muted opacity-50 font-mono">
            ERROR_CODE: UI_CRASH_0x99 • VVV DIGITALS LLC
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;