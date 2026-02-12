
import React from 'react';
import { LogIn, Cloud, ShieldCheck, Github, Settings } from 'lucide-react';

interface AuthPageProps {
  onLogin: () => void;
  isConfigured: boolean;
  onOpenSetup: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, isConfigured, onOpenSetup }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 text-white relative">
      <button 
        onClick={onOpenSetup}
        className="absolute top-10 right-10 p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all active:scale-90"
      >
        <Settings className="w-5 h-5" />
      </button>

      <div className="mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="w-24 h-24 bg-white/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl backdrop-blur-2xl border border-white/20">
          <Cloud className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter mb-2">SharedMoments</h1>
        <div className="flex items-center justify-center gap-2 text-indigo-300">
          <ShieldCheck className="w-4 h-4" />
          <p className="text-xs font-bold uppercase tracking-widest">Official Google Drive App</p>
        </div>
      </div>

      <div className="w-full space-y-6 max-w-xs">
        <div className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-sm">
          <p className="text-center text-sm text-indigo-100 mb-6 leading-relaxed">
            Your photos are stored directly in your personal <strong>Google Drive</strong>. Private, secure, and permanent.
          </p>
          
          <button 
            onClick={onLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-indigo-600 py-4 px-6 rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all mb-4"
          >
            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-5 h-5" alt="G" />
            {isConfigured ? "Sign in with Google" : "Setup Google Project"}
          </button>
          
          {!isConfigured && (
            <p className="text-[9px] text-center text-indigo-300 font-bold uppercase tracking-widest animate-pulse">
              Requires Project Configuration
            </p>
          )}
        </div>
      </div>

      <footer className="absolute bottom-10 flex flex-col items-center gap-4">
        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest opacity-50">
          Privacy First: Drive-to-Device Encryption
        </p>
        <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">
          <Github className="w-4 h-4" />
          v2.5 AUTOMATED SETUP
        </div>
      </footer>
    </div>
  );
};

export default AuthPage;
