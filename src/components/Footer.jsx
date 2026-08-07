import React, { useState } from 'react';
import { Shield, Globe, Share2, MessageSquare, Mail, X, Lock } from 'lucide-react';

export default function Footer({ onNavigate }) {
  const [activeModal, setActiveModal] = useState(null);

  const modalContent = {
    privacy: {
      title: "Privacy Policy",
      content: "InvoiceShield AI is SOC2 Type II certified. All uploaded invoice documents, GSTIN metadata, and financial records are encrypted using AES-256 at rest and TLS 1.3 in transit. Zero document data is retained for AI model training."
    },
    terms: {
      title: "Terms of Service",
      content: "InvoiceShield AI provides automated invoice anomaly detection and fraud risk scoring. Usage of the enterprise API and console is governed by your organization's Master Services Agreement (MSA)."
    },
    compliance: {
      title: "Compliance & Security Portal",
      content: "View live SOC2 Type II audit compliance reports, ISO 27001 certifications, GDPR data processing agreements, and third-party penetration test results."
    },
    contact: {
      title: "Contact Security & Incident Team",
      content: "For security incidents, emergency fraud holds, or urgent API compliance assistance, contact security@invoiceshield.ai or reach our 24/7 SOC hotline at +1 (800) 555-SHIELD."
    },
    status: {
      title: "System Operational Status",
      content: "All InvoiceShield AI Systems Operational: AI Neural Processing Engine (100% Uptime), GST Validation API (100% Uptime), Webhook Engine (100% Uptime)."
    }
  };

  return (
    <footer className="bg-[#06040b] border-t border-purple-900/40 pt-12 pb-10 text-slate-400 text-sm relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-purple-900/30">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <span className="font-bold text-lg text-white">
                InvoiceShield <span className="text-purple-400">AI</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Autonomous fraud detection and compliance verification platform protecting enterprise accounts payable workflows.
            </p>

            {/* Quick Action Icons */}
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setActiveModal('compliance')}
                className="p-2 rounded-lg bg-[#120b22] border border-purple-900/40 text-slate-400 hover:text-purple-300 hover:border-purple-500/40 transition-colors cursor-pointer"
                title="Compliance Portal"
              >
                <Globe className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Portal link copied to clipboard!');
                }}
                className="p-2 rounded-lg bg-[#120b22] border border-purple-900/40 text-slate-400 hover:text-purple-300 hover:border-purple-500/40 transition-colors cursor-pointer"
                title="Share Portal"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveModal('contact')}
                className="p-2 rounded-lg bg-[#120b22] border border-purple-900/40 text-slate-400 hover:text-purple-300 hover:border-purple-500/40 transition-colors cursor-pointer"
                title="Support Chat"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveModal('contact')}
                className="p-2 rounded-lg bg-[#120b22] border border-purple-900/40 text-slate-400 hover:text-purple-300 hover:border-purple-500/40 transition-colors cursor-pointer"
                title="Email Security Team"
              >
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-mono font-bold uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-purple-400 transition-colors cursor-pointer">AI Fraud Scoring</button></li>
              <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-purple-400 transition-colors cursor-pointer">GST Validation</button></li>
              <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-purple-400 transition-colors cursor-pointer">Duplicate Detection</button></li>
              <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-purple-400 transition-colors cursor-pointer">Live Dashboard</button></li>
            </ul>
          </div>

          {/* Security Links */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-mono font-bold uppercase tracking-wider">Security & Trust</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => setActiveModal('compliance')} className="hover:text-purple-400 transition-colors cursor-pointer">SOC2 Type II</button></li>
              <li><button onClick={() => setActiveModal('compliance')} className="hover:text-purple-400 transition-colors cursor-pointer">Explainable AI</button></li>
              <li><button onClick={() => setActiveModal('compliance')} className="hover:text-purple-400 transition-colors cursor-pointer">Audit Logging</button></li>
              <li><button onClick={() => setActiveModal('privacy')} className="hover:text-purple-400 transition-colors cursor-pointer">Data Privacy</button></li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-mono font-bold uppercase tracking-wider">Legal & Contact</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => setActiveModal('privacy')} className="hover:text-purple-400 transition-colors cursor-pointer">Privacy Policy</button></li>
              <li><button onClick={() => setActiveModal('terms')} className="hover:text-purple-400 transition-colors cursor-pointer">Terms of Service</button></li>
              <li><button onClick={() => setActiveModal('compliance')} className="hover:text-purple-400 transition-colors cursor-pointer">Compliance Portal</button></li>
              <li><button onClick={() => setActiveModal('contact')} className="hover:text-purple-400 transition-colors cursor-pointer">Contact Security Team</button></li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono">
          <p>© 2026 InvoiceShield AI. Every Invoice. Verified. Every Payment. Protected.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <button onClick={() => setActiveModal('privacy')} className="hover:text-slate-400 transition-colors cursor-pointer">Privacy</button>
            <span>•</span>
            <button onClick={() => setActiveModal('terms')} className="hover:text-slate-400 transition-colors cursor-pointer">Terms</button>
            <span>•</span>
            <button onClick={() => setActiveModal('status')} className="hover:text-slate-400 transition-colors cursor-pointer">Status</button>
          </div>
        </div>

      </div>

      {/* Interactive Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05030a]/85 backdrop-blur-md">
          <div className="relative w-full max-w-md p-6 rounded-2xl bg-[#120b22] border border-purple-500/40 text-left shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-400" />
                <span>{modalContent[activeModal]?.title}</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded bg-[#090611] text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {modalContent[activeModal]?.content}
            </p>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
