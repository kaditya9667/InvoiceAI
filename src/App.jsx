import React, { useState } from 'react';
import MinimalLandingPage from './components/MinimalLandingPage';
import LoginPage from './components/LoginPage';
import DashboardPreview from './components/DashboardPreview';
import SecuritySection from './components/SecuritySection';
import Footer from './components/Footer';
import { Shield, LogOut, UserCheck } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [currentUser, setCurrentUser] = useState(null);
  const [notification, setNotification] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('invoiceshield_token');
    setCurrentUser(null);
    setCurrentView('landing');
  };

  // State 1: Pure 3D Spline Landing Page (100% Full-Screen Interactive Model)
  if (currentView === 'landing') {
    return <MinimalLandingPage onEnter={() => setCurrentView('login')} />;
  }

  // State 2: Clean Authentication Page
  if (currentView === 'login') {
    return (
      <LoginPage
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setCurrentView('dashboard');
          window.scrollTo({ top: 0, behavior: 'smooth' });

        }}
        onBackToLanding={() => setCurrentView('landing')}
      />
    );
  }

  // State 3: Protected Enterprise Console (Clean Matte Purple Theme)
  return (
    <div className="min-h-screen bg-[#090611] text-slate-100 font-sans selection:bg-purple-500/30 selection:text-purple-200">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-[#120b22] border border-purple-500/40 shadow-2xl text-xs font-mono flex items-center space-x-3 text-purple-300 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Matte Purple Header Bar */}
      <header className="sticky top-0 z-50 bg-[#090611]/95 backdrop-blur-xl border-b border-purple-900/40 px-6 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Shield className="w-5 h-5" />
          </div>
          <span className="font-bold text-base text-white">
            InvoiceShield <span className="text-purple-400 font-extrabold">AI</span>
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#120b22] border border-purple-900/50 text-xs">
            <UserCheck className="w-4 h-4 text-purple-400" />
            <span className="text-slate-200">{currentUser?.email || 'cfo@invoiceshield.ai'}</span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg bg-[#120b22] border border-purple-900/50 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Enterprise Console Components */}
      <main className="py-6 space-y-8 bg-[#090611]">
        <DashboardPreview />
        <SecuritySection />
      </main>

      <Footer onNavigate={(target) => {
        if (target === '#hero') handleLogout();
      }} />
    </div>
  );
}
