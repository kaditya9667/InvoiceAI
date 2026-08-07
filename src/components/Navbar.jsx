import React, { useState, useEffect } from 'react';
import { Shield, Menu, X, ChevronRight, Lock } from 'lucide-react';

export default function Navbar({ onNavigate }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#hero' },
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Security', href: '#security' },
    { name: 'Dashboard', href: '#dashboard' },
  ];

  const handleNavClick = (href) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(href);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-slate-950/80 backdrop-blur-xl border-b border-cyan-500/15 py-3 shadow-lg shadow-cyan-950/20'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Left: Brand Logo */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('#hero');
            }}
            className="flex items-center space-x-3 group"
          >
            <div className="relative p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 group-hover:border-cyan-400 transition-all">
              <Shield className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-cyan-400/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-[56px] font-black text-white tracking-wide flex items-center gap-1">
                InvoiceShield <span className="text-cyan-400 font-extrabold">AI</span>
              </h1>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider">ENTERPRISE FRAUD SHIELD</span>
            </div>
          </a>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 bg-slate-900/60 p-1.5 rounded-full border border-slate-800 backdrop-blur-md">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="px-4 py-1.5 text-[18px] font-bold text-slate-300 hover:text-cyan-400 hover:bg-slate-800/80 rounded-full transition-all duration-200"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right: Auth Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <button 
              onClick={() => handleNavClick('#dashboard')}
              className="text-[18px] font-bold text-slate-300 hover:text-white px-4 py-2 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => handleNavClick('#dashboard')}
              className="relative group overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 p-[1px] font-bold text-[18px] text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 cursor-pointer"
            >
              <span className="flex items-center space-x-2 rounded-[11px] bg-slate-950 px-4 py-2 transition-colors group-hover:bg-transparent">
                <Lock className="w-3.5 h-3.5 text-cyan-400 group-hover:text-white" />
                <span>Get Started</span>
              </span>
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-cyan-400" /> : <Menu className="w-6 h-6 text-slate-300" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-Out Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 backdrop-blur-2xl border-b border-cyan-500/20 px-4 pt-4 pb-6 mt-3 space-y-3 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="flex items-center justify-between px-4 py-3 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-200 hover:text-cyan-400 hover:border-cyan-500/30 text-sm font-medium transition-all"
              >
                <span>{link.name}</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </a>
            ))}
          </div>

          <div className="pt-2 flex flex-col space-y-2">
            <button
              onClick={() => handleNavClick('#dashboard')}
              className="w-full py-2.5 rounded-lg border border-slate-700 text-slate-200 text-sm font-medium hover:bg-slate-900 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => handleNavClick('#dashboard')}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/30 transition-transform active:scale-95"
            >
              Get Started Now
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
