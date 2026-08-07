import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Lock, Play } from 'lucide-react';

export default function CTASection({ onNavigate }) {
  return (
    <section className="relative py-24 bg-gradient-to-b from-[#07090e] via-slate-950 to-[#07090e] border-b border-slate-800/60 overflow-hidden">
      {/* Glow Center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-cyan-500/15 via-blue-600/15 to-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Protect Enterprise Capital</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Stop Invoice Fraud Before Payment
          </h2>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Give your finance team the intelligence to verify invoices faster, detect risks earlier, and protect every transaction.
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4"
        >
          <button
            onClick={() => onNavigate('#dashboard')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-600 font-bold text-slate-950 text-base hover:brightness-110 shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <Lock className="w-4 h-4 text-slate-950" />
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => onNavigate('#dashboard')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-cyan-500/40 font-semibold text-slate-200 hover:text-white text-base transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
            <span>View Live Dashboard</span>
          </button>
        </motion.div>

      </div>
    </section>
  );
}
