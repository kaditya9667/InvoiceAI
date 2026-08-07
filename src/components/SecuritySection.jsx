import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, ShieldCheck, History, BrainCircuit, Server } from 'lucide-react';

const iconMap = {
  Lock: Lock,
  ShieldCheck: ShieldCheck,
  History: History,
  BrainCircuit: BrainCircuit,
  Server: Server,
};

const securityHighlights = [
  {
    icon: "Lock",
    title: "Enterprise-grade Encryption",
    description: "AES-256 at rest and TLS 1.3 in transit with SOC2 Type II certified infrastructure."
  },
  {
    icon: "ShieldCheck",
    title: "Role-Based Access Control",
    description: "Granular permission policies for CFOs, AP managers, auditors, and compliance teams."
  },
  {
    icon: "History",
    title: "Complete Audit Trails",
    description: "Immutable cryptographically signed logs for every document upload, AI score, and approval decision."
  },
  {
    icon: "BrainCircuit",
    title: "Explainable AI Decisions",
    description: "Zero black-box AI — human-readable justification breakdown for legal compliance."
  },
  {
    icon: "Server",
    title: "Secure Invoice Processing",
    description: "Data privacy guaranteed with isolated single-tenant cloud deployment options."
  }
];

export default function SecuritySection() {
  return (
    <section id="security" className="relative py-16 bg-[#090611] border-t border-purple-900/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Security Built Into Every Decision
              </h2>
              <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
                Designed for institutional CFOs and enterprise audit teams. InvoiceShield AI enforces bank-grade data security and strict compliance controls.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {securityHighlights.map((item, idx) => {
                const IconComponent = iconMap[item.icon] || Shield;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    className="p-4 rounded-xl bg-[#120b22]/60 border border-purple-900/30 hover:border-purple-500/30 transition-all flex items-start space-x-3"
                  >
                    <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Column (Visual Shield Badge) */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="relative p-8 rounded-3xl bg-gradient-to-br from-[#1b1037] to-[#0d071d] border border-purple-500/30 shadow-2xl flex flex-col items-center text-center space-y-4 max-w-sm"
            >
              <div className="absolute inset-0 bg-purple-500/5 rounded-3xl blur-2xl pointer-events-none" />
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Military Grade Protection</h3>
              <p className="text-xs text-slate-300">
                Your invoices never train public models. All text extractions are processed inside secure, isolated sandboxes.
              </p>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
