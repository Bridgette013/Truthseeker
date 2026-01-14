
import React, { useState } from 'react';
import { UserProfile, SubscriptionTier } from '../types';
import { ShieldCheck, Fingerprint, Lock, ArrowRight, Loader2 } from 'lucide-react';
import QuickExitButton from './QuickExitButton';
import { logger } from '../services/logger';

interface AuthScreenProps {
  onLogin: (user: UserProfile) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // In a real production environment, this would call an API endpoint.
    // For this frontend-only refactor, we process immediately but use a real object structure.
    try {
      const newUser: UserProfile = {
        id: `usr_${Date.now().toString(36)}`,
        username: formData.username || 'Investigator',
        email: formData.email,
        avatarUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${formData.username || 'investigator'}`,
        tier: SubscriptionTier.FREE,
        dailyScansUsed: 0
      };
      
      logger.info("User Authenticated", { userId: newUser.id }, "AuthScreen");
      onLogin(newUser);
    } catch (error) {
      logger.error("Authentication Error", error, "AuthScreen");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-vvv-charcoal flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-vvv-purple rounded-full blur-[200px] opacity-20"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-vvv-coral rounded-full blur-[180px] opacity-15"></div>

      {/* Quick Exit Safety Feature */}
      <div className="fixed top-6 right-6 z-50">
        <QuickExitButton />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-vvv-coral to-vvv-purple mb-4 shadow-2xl vvv-glow-purple-lg">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight">
            <span className="vvv-gradient-text">VVV</span>Digitals
          </h1>
          <p className="text-vvv-muted mt-2 font-mono text-sm tracking-wider">FORENSIC ANALYSIS SUITE</p>
        </div>

        {/* Form Card */}
        <div className="bg-vvv-surface/80 backdrop-blur-xl border border-vvv-divider p-8 rounded-2xl shadow-2xl w-full">
          <div className="mb-6 text-center">
             <h2 className="text-xl font-bold text-white">{isLogin ? 'Secure Login' : 'New Identity'}</h2>
             <p className="text-sm text-vvv-muted">Enter credentials to access the mainframe.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-vvv-muted mb-1">Username</label>
                <div className="relative">
                  <input
                    type="text"
                    required={!isLogin}
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full bg-vvv-charcoal border border-vvv-divider rounded-xl pl-11 pr-4 py-3 text-white placeholder-vvv-muted focus:ring-2 focus:ring-vvv-purple/50 focus:border-vvv-purple outline-none transition-all"
                    placeholder="Create a username"
                  />
                  <Fingerprint className="absolute left-4 top-3.5 w-5 h-5 text-vvv-muted" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-vvv-muted mb-1">Email Access</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-vvv-charcoal border border-vvv-divider rounded-xl pl-11 pr-4 py-3 text-white placeholder-vvv-muted focus:ring-2 focus:ring-vvv-purple/50 focus:border-vvv-purple outline-none transition-all"
                  placeholder="name@agency.com"
                />
                <div className="absolute left-4 top-3.5 w-5 h-5 text-vvv-muted flex items-center justify-center font-bold">@</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-vvv-muted mb-1">Passphrase</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-vvv-charcoal border border-vvv-divider rounded-xl pl-11 pr-4 py-3 text-white placeholder-vvv-muted focus:ring-2 focus:ring-vvv-purple/50 focus:border-vvv-purple outline-none transition-all"
                  placeholder="••••••••••••"
                />
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-vvv-muted" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-vvv-coral to-vvv-purple text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 vvv-btn-shine shadow-lg hover:shadow-vvv-purple/30 disabled:opacity-70 mt-6"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                <>
                  {isLogin ? 'Authenticate' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-vvv-muted">
              {isLogin ? "Need a clearance level?" : "Already verified?"}{' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="vvv-gradient-text font-semibold hover:opacity-80 transition-opacity ml-1"
              >
                {isLogin ? 'Request Access' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
        
        <div className="mt-6 text-center text-xs text-vvv-muted opacity-50 font-mono">
          © {new Date().getFullYear()} VVV Digitals LLC • SECURE CONNECTION ESTABLISHED
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
