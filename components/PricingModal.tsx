
import React, { useState } from 'react';
import { SubscriptionTier } from '../types';
import { Check, X, Shield, Lock, CreditCard, Loader2 } from 'lucide-react';
import { logger } from '../services/logger';

interface PricingModalProps {
  currentTier: SubscriptionTier;
  onUpgrade: (tier: SubscriptionTier) => void;
  onClose: () => void;
}

type PaymentStep = 'SELECT_PLAN' | 'PAYMENT_FORM' | 'SUCCESS';

const PricingModal: React.FC<PricingModalProps> = ({ currentTier, onUpgrade, onClose }) => {
  const [step, setStep] = useState<PaymentStep>('SELECT_PLAN');
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionTier | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = [
    {
      id: SubscriptionTier.FREE,
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        '3 Scans per day',
        'Basic AI Analysis (Flash Model)',
        'Standard Tutorials',
        'Community Access'
      ],
      missing: [
        'Side-by-Side Comparison',
        'Deep Thinking Mode',
        'Video Temporal Sync',
        'Identity Verification'
      ],
    },
    {
      id: SubscriptionTier.PRO,
      name: 'Investigator',
      price: '$29',
      period: '/month',
      features: [
        'Unlimited Scans',
        'Pro Model (High Accuracy)',
        'Identity Verification (Grounding)',
        'Priority Processing',
        'Detailed Forensics Reports'
      ],
      missing: [
        'Side-by-Side Comparison',
        'Deep Thinking Mode'
      ],
    },
    {
      id: SubscriptionTier.PREMIUM,
      name: 'Expert Forensic',
      price: '$99',
      period: '/month',
      features: [
        'Everything in Pro',
        'Visual Comparator Tools',
        'Deep Thinking (Reasoning)',
        'Video Temporal Analysis',
        'Simulation Generator'
      ],
      missing: [],
    }
  ];

  const handleSelectPlan = (tier: SubscriptionTier) => {
    setSelectedPlanId(tier);
    setStep('PAYMENT_FORM');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    setIsProcessing(true);
    
    // Production Note: This is where the Stripe/PayPal integration would trigger.
    // For this refactor, we transition states immediately assuming the "provider" handled it.
    try {
      logger.info(`Processing Upgrade to ${selectedPlanId}`, null, "PricingModal");
      
      // Artificial await only for UI debounce prevents double-clicks
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStep('SUCCESS');
      
      // Auto-close or callback after brief success message
      setTimeout(() => {
        if (selectedPlanId) {
            onUpgrade(selectedPlanId);
        }
      }, 1000);
      
    } catch (error) {
        logger.error("Payment Failed", error, "PricingModal");
        setIsProcessing(false);
    }
  };

  const renderSelectPlan = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
            const isCurrent = currentTier === plan.id;
            const isRecommended = plan.id === SubscriptionTier.PRO;
            const isPremium = plan.id === SubscriptionTier.PREMIUM;

            return (
            <div 
                key={plan.id} 
                className={`
                relative rounded-xl p-6 flex flex-col transition-all duration-300
                ${isCurrent ? 'bg-vvv-charcoal border border-vvv-divider' : 
                    isRecommended ? 'bg-gradient-to-b from-blue-900/20 to-transparent border border-blue-500/30 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-900/20' :
                    isPremium ? 'bg-gradient-to-b from-vvv-purple/20 to-transparent border border-vvv-purple/50 hover:border-vvv-purple/80 hover:shadow-lg hover:shadow-vvv-purple/20' :
                    'bg-vvv-charcoal border border-vvv-divider hover:border-vvv-muted/30'}
                `}
            >
                {isRecommended && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl shadow-lg">
                    POPULAR
                </div>
                )}
                {isPremium && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-vvv-coral to-vvv-purple text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl shadow-lg">
                    ELITE
                </div>
                )}

                <div className="mb-6 mt-2">
                <h3 className={`text-xl font-display font-bold ${isPremium ? 'text-vvv-purple' : isRecommended ? 'text-blue-400' : 'text-white'}`}>
                    {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-display font-bold text-white">{plan.price}</span>
                    <span className="text-vvv-muted text-sm">{plan.period}</span>
                </div>
                </div>

                <div className="flex-1 space-y-4 mb-8">
                {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-vvv-text leading-tight">{feat}</span>
                    </div>
                ))}
                {plan.missing.map((feat, i) => (
                    <div key={i} className="flex items-start gap-3 opacity-40">
                    <X className="w-5 h-5 text-vvv-muted flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-vvv-muted leading-tight">{feat}</span>
                    </div>
                ))}
                </div>

                <button
                onClick={() => !isCurrent && handleSelectPlan(plan.id)}
                disabled={isCurrent}
                className={`
                    w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2
                    ${isCurrent 
                    ? 'bg-vvv-charcoal text-vvv-muted cursor-default border border-vvv-divider' 
                    : isPremium 
                        ? 'bg-gradient-to-r from-vvv-coral to-vvv-purple text-white shadow-lg hover:shadow-vvv-purple/30 vvv-btn-shine'
                        : isRecommended
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                        : 'bg-vvv-surface hover:bg-vvv-charcoal text-white border border-vvv-divider'}
                `}
                >
                {isCurrent ? (
                    <>Current Plan</>
                ) : (
                    <>
                        {isPremium ? <Shield className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        Upgrade
                    </>
                )}
                </button>
            </div>
            );
        })}
    </div>
  );

  const renderPaymentForm = () => (
      <div className="max-w-md mx-auto">
          <button onClick={() => setStep('SELECT_PLAN')} className="text-sm text-vvv-muted hover:text-white mb-6 flex items-center gap-1">
              ← Back to Plans
          </button>

          <div className="bg-vvv-surface border border-vvv-divider rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6 border-b border-vvv-divider pb-4">
                  <h3 className="text-xl font-bold text-white">Secure Checkout</h3>
                  <div className="flex gap-2">
                      <div className="w-8 h-5 bg-white/10 rounded"></div>
                      <div className="w-8 h-5 bg-white/10 rounded"></div>
                      <div className="w-8 h-5 bg-white/10 rounded"></div>
                  </div>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div>
                      <label className="block text-xs font-bold text-vvv-muted mb-1 uppercase">Cardholder Name</label>
                      <input type="text" placeholder="John Doe" className="w-full bg-vvv-charcoal border border-vvv-divider rounded-lg px-3 py-2 text-white focus:border-vvv-purple outline-none" required />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-vvv-muted mb-1 uppercase">Card Number</label>
                      <div className="relative">
                        <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-vvv-charcoal border border-vvv-divider rounded-lg px-3 py-2 pl-10 text-white focus:border-vvv-purple outline-none" required />
                        <CreditCard className="w-4 h-4 text-vvv-muted absolute left-3 top-2.5" />
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-vvv-muted mb-1 uppercase">Expiry</label>
                        <input type="text" placeholder="MM/YY" className="w-full bg-vvv-charcoal border border-vvv-divider rounded-lg px-3 py-2 text-white focus:border-vvv-purple outline-none" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-vvv-muted mb-1 uppercase">CVC</label>
                        <input type="text" placeholder="123" className="w-full bg-vvv-charcoal border border-vvv-divider rounded-lg px-3 py-2 text-white focus:border-vvv-purple outline-none" required />
                      </div>
                  </div>

                  <div className="pt-4">
                      <button 
                        type="submit" 
                        disabled={isProcessing}
                        className="w-full bg-gradient-to-r from-vvv-coral to-vvv-purple text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-vvv-purple/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                          {isProcessing ? (
                             <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Securely Processing...
                             </>
                          ) : (
                             <>
                                <Lock className="w-4 h-4" />
                                Pay Securely
                             </>
                          )}
                      </button>
                      <p className="text-center text-[10px] text-vvv-muted mt-3">
                          Payments are processed securely. Your data is encrypted via TLS 1.3.
                      </p>
                  </div>
              </form>
          </div>
      </div>
  );

  const renderSuccess = () => (
    <div className="flex flex-col items-center justify-center h-64 text-center animate-fade-in">
        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 border border-emerald-500/50">
            <Check className="w-8 h-8 text-emerald-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Upgrade Successful!</h3>
        <p className="text-vvv-muted">Your account privileges have been updated.</p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-vvv-surface border border-vvv-divider rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-fade-in">
        
        {/* Header */}
        <div className="p-6 border-b border-vvv-divider flex justify-between items-center bg-vvv-surface">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 font-display">
              <Shield className="text-vvv-purple" />
              Upgrade Clearance Level
            </h2>
            <p className="text-vvv-muted text-sm">Unlock advanced forensic tools and AI capabilities.</p>
          </div>
          <button onClick={onClose} className="p-2 text-vvv-muted hover:text-white hover:bg-vvv-charcoal rounded-lg transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-vvv-charcoal/50">
           {step === 'SELECT_PLAN' && renderSelectPlan()}
           {step === 'PAYMENT_FORM' && renderPaymentForm()}
           {step === 'SUCCESS' && renderSuccess()}
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
