
import React from 'react';
import { AppView } from '../types';
import { Shield, FileText, Lock, Mail, Globe } from 'lucide-react';

interface StaticPagesProps {
  view: AppView;
}

const StaticPages: React.FC<StaticPagesProps> = ({ view }) => {
  const renderContent = () => {
    switch (view) {
      case AppView.ABOUT:
        return (
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-vvv-coral to-vvv-purple mb-4">
                    <Shield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-display font-bold text-white">About VVV Digitals</h2>
                <p className="text-vvv-muted mt-2">Uncovering truth in the digital age.</p>
            </div>
            
            <div className="bg-vvv-surface border border-vvv-divider rounded-xl p-8 space-y-4 text-vvv-text leading-relaxed">
                <h3 className="text-xl font-bold text-white font-display">Our Mission</h3>
                <p>
                    VVV Digitals was founded with a singular purpose: to democratize digital forensics. In an era of Deepfakes, AI-generated personas, and complex online scams, the average person is often left defenseless against sophisticated bad actors.
                </p>
                <p>
                    TruthSeeker, our flagship platform, leverages cutting-edge AI (Gemini Pro/Flash) to analyze media artifacts for signs of manipulation. We believe that safety tools should be accessible, intuitive, and rigorously accurate.
                </p>
                
                <h3 className="text-xl font-bold text-white font-display mt-8">The Technology</h3>
                <p>
                    We utilize a hybrid analysis approach. While our Automated AI scans for pixel-level inconsistencies and metadata anomalies, we also prioritize education. Our "Guided Mode" teaches users to become investigators themselves, spotting the subtle flaws in deepfakes that machines might miss.
                </p>
            </div>
          </div>
        );

      case AppView.TERMS:
        return (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
                <FileText className="w-8 h-8 text-vvv-purple" />
                <h2 className="text-2xl font-display font-bold text-white">Terms of Service</h2>
            </div>
            
            <div className="bg-vvv-surface border border-vvv-divider rounded-xl p-8 text-sm text-vvv-muted space-y-6">
                <p><strong>Effective Date:</strong> January 1, 2024</p>
                
                <section>
                    <h3 className="text-white font-bold mb-2">1. Acceptance of Terms</h3>
                    <p>By accessing or using the TruthSeeker platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-2">2. Usage Restrictions</h3>
                    <p>You agree not to use the platform for any illegal purpose. Specifically, you may not use our forensic tools to harass, stalk, or doxx individuals. The tools are intended for personal safety and verification purposes only.</p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-2">3. Accuracy Disclaimer</h3>
                    <p>While we strive for high accuracy, AI-based analysis is probabilistic. Results provided by TruthSeeker should not be considered definitive legal proof. VVV Digitals is not liable for actions taken based on our analysis reports.</p>
                </section>

                 <section>
                    <h3 className="text-white font-bold mb-2">4. User Content</h3>
                    <p>You retain ownership of any media you upload. By uploading content, you grant VVV Digitals a temporary license to process the file for the purpose of generating the analysis. We do not permanently store user media without explicit consent (e.g., saving to a Case Journal).</p>
                </section>
            </div>
          </div>
        );

      case AppView.PRIVACY:
        return (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
                <Lock className="w-8 h-8 text-emerald-400" />
                <h2 className="text-2xl font-display font-bold text-white">Privacy Policy</h2>
            </div>
            
            <div className="bg-vvv-surface border border-vvv-divider rounded-xl p-8 text-sm text-vvv-muted space-y-6">
                <p><strong>Last Updated:</strong> January 1, 2024</p>
                
                <div className="bg-vvv-purple/10 border border-vvv-purple/30 p-4 rounded-lg">
                    <p className="text-white font-medium">Your privacy is our priority. As a forensic tool, we understand the sensitivity of the data you handle.</p>
                </div>

                <section>
                    <h3 className="text-white font-bold mb-2">1. Data Collection</h3>
                    <p>We collect minimal data necessary for operation. This includes account credentials (if registered) and usage logs. Uploaded media files (images, audio, video) are processed in ephemeral containers and are deleted immediately after analysis is complete, unless saved to your personal Case History.</p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-2">2. Third-Party Processors</h3>
                    <p>We use Google Gemini API for AI analysis. Data sent to the API is subject to Google's enterprise data privacy policies and is not used to train their public models.</p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-2">3. Cookies & Tracking</h3>
                    <p>We use essential cookies for session management. We do not use advertising cookies or sell user data to third parties.</p>
                </section>
            </div>
          </div>
        );

      case AppView.CONTACT:
        return (
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-display font-bold text-white">Contact Support</h2>
                <p className="text-vvv-muted mt-2">Need help with a case or have a technical issue?</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-vvv-surface border border-vvv-divider p-8 rounded-xl flex flex-col items-center text-center hover:border-vvv-purple/50 transition-colors">
                    <Mail className="w-10 h-10 text-vvv-coral mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">General Support</h3>
                    <p className="text-vvv-muted text-sm mb-4">For account issues, bug reports, or general inquiries.</p>
                    <a href="mailto:support@vvvdigitals.com" className="text-vvv-purple font-bold hover:underline">support@vvvdigitals.com</a>
                </div>

                <div className="bg-vvv-surface border border-vvv-divider p-8 rounded-xl flex flex-col items-center text-center hover:border-vvv-purple/50 transition-colors">
                    <Globe className="w-10 h-10 text-blue-400 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Media & Press</h3>
                    <p className="text-vvv-muted text-sm mb-4">For interviews, partnership inquiries, or press kits.</p>
                    <a href="mailto:press@vvvdigitals.com" className="text-vvv-purple font-bold hover:underline">press@vvvdigitals.com</a>
                </div>
            </div>

            <div className="bg-vvv-charcoal border border-vvv-divider rounded-xl p-6 mt-8">
                <h4 className="font-bold text-white mb-2">Mailing Address</h4>
                <p className="text-vvv-muted text-sm">
                    VVV Digitals LLC<br/>
                    123 Cyber Security Way, Suite 404<br/>
                    San Francisco, CA 94103
                </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pb-12">
      {renderContent()}
    </div>
  );
};

export default StaticPages;
