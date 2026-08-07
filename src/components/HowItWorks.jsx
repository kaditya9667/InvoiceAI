import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Cpu, ShieldAlert, CheckCircle2 } from 'lucide-react';

const stepIcons = [Upload, Cpu, ShieldAlert, CheckCircle2];

const howItWorksSteps = [
  {
    step: "01",
    title: "Upload Invoice",
    description: "Connect ERP or upload PDF, scanned image, or EDI invoice directly to the secure portal."
  },
  {
    step: "02",
    title: "AI Extracts Data",
    description: "Multi-modal AI reads vendor details, GSTIN, line items, bank accounts, and invoice metadata in seconds."
  },
  {
    step: "03",
    title: "InvoiceShield Analyzes Risk",
    description: "Deep learning models cross-verify GST registers, historical patterns, duplicate databases, and bank records."
  },
  {
    step: "04",
    title: "Approve, Review, or Block",
    description: "Automated workflow routes safe invoices directly to ERP while high-risk payments are immediately blocked."
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 bg-slate-950/80 border-b border-slate-800/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <span>Automated Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How InvoiceShield AI Operates
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            Seamlessly integrating into your financial stack to detect risks in real-time before payments are disbursed.
          </p>
        </div>

        {/* 4-Step Process Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          
          {/* Connector Line for Desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500/20 via-cyan-500/50 to-blue-500/20 -translate-y-6 z-0" />

          {howItWorksSteps.map((item, idx) => {
            const IconComponent = stepIcons[idx] || Upload;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="relative z-10 flex flex-col items-center text-center p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-cyan-500/40 transition-all duration-300 group shadow-xl"
              >
                {/* Step Number Badge */}
                <div className="w-16 h-16 mb-6 rounded-2xl bg-slate-950 border border-cyan-500/30 flex items-center justify-center relative group-hover:scale-105 transition-transform shadow-lg shadow-cyan-950/50">
                  <IconComponent className="w-8 h-8 text-cyan-400" />
                  <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-950 border border-cyan-500/20 flex items-center justify-center text-xs font-bold text-cyan-400 shadow-md">
                    {item.step}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
