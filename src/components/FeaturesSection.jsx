import React from 'react';
import { motion } from 'framer-motion';
import { Brain, ShieldAlert, FileCheck, CopyX, Building2, Cpu } from 'lucide-react';

const featureIcons = {
  Brain: Brain,
  ShieldAlert: ShieldAlert,
  FileCheck: FileCheck,
  Cpu: Cpu,
};

const featuresData = [
  {
    id: "f1",
    icon: "Brain",
    title: "GSTIN PAN Decoders",
    description: "Instantly decodes GSTIN structure, verifying matching state jurisdiction, entity validation and registration age."
  },
  {
    id: "f2",
    icon: "ShieldAlert",
    title: "Tax Filing Compliance",
    description: "Queries national tax registries in real-time to alert if a supplier has defaulted on GST returns."
  },
  {
    id: "f3",
    icon: "FileCheck",
    title: "Cryptographic Verification",
    description: "Detects digital modifications, font structure reuse, altered metadata and copy-paste layout patterns."
  },
  {
    id: "f4",
    icon: "Cpu",
    title: "Isolated AI Processing",
    description: "Google Cloud Vision API integration extracts and validates records under military-grade data privacy."
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 bg-[#07090e] border-b border-slate-800/60">
      {/* Glow Orbs */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <span>Enterprise Protection</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Intelligence That Protects Every Payment
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            InvoiceShield AI analyzes every invoice before approval, helping finance teams detect fraud, validate compliance, and reduce financial risk.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {featuresData.map((feature, idx) => {
            const IconComponent = featureIcons[feature.icon] || Brain;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/30 hover:bg-slate-900/90 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-105 transition-transform">
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
