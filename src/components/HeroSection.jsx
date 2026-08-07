import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle2, ArrowRight, Play, Sparkles } from 'lucide-react';
import SplineHero from './SplineHero';

export default function HeroSection({ onNavigate }) {
  const trustPoints = [
    { label: "AI Fraud Detection", icon: ShieldCheck },
    { label: "GST Validation", icon: CheckCircle2 },
    { label: "Duplicate Invoice Detection", icon: CheckCircle2 },
  ];

  return (
    <section id="hero" className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden cyber-grid">
      {/* Dynamic Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Side: Hero Text & Call to Action */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-6 flex flex-col text-left space-y-6"
          >
            {/* Small Badge */}
            <div className="inline-flex items-center space-x-2 self-start px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-xs font-semibold text-cyan-300 tracking-wider uppercase">
                AI-Powered Invoice Security
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              Every Invoice. <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">Verified.</span>
              <br />
              Every Payment. <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Protected.</span>
            </h1>

            {/* Hero One-Liner / Supporting Text */}
            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed font-normal max-w-2xl">
              AI-powered fraud intelligence that detects suspicious invoices, validates GST data, and prevents costly payments before they happen.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
              <button
                onClick={() => onNavigate('#dashboard')}
                className="flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-600 font-bold text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200 active:scale-[0.98] cursor-pointer"
              >
                <span>Protect Your Payments</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => onNavigate('#dashboard')}
                className="flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-cyan-500/40 font-semibold text-slate-200 hover:text-white backdrop-blur-md transition-all duration-200 cursor-pointer"
              >
                <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                <span>Explore Dashboard</span>
              </button>
            </div>

            {/* Trust Row */}
            <div className="pt-6 border-t border-slate-800/80">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {trustPoints.map((point, index) => {
                  const Icon = point.icon;
                  return (
                    <div key={index} className="flex items-center space-x-2 text-slate-400 text-xs sm:text-xs font-medium">
                      <Icon className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{point.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Right Side: Spline 3D Scene Integration */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="lg:col-span-6 relative"
          >
            <SplineHero />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
