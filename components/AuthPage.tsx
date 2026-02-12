
import React, { useState } from 'react';
import { LogIn, Cloud, ShieldCheck, Github, Settings, Smartphone, MoreVertical, PlusSquare, Info, ExternalLink, Globe } from 'lucide-react';

interface AuthPageProps {
  onLogin: () => void;
  isConfigured: boolean;
  onOpenSetup: () => void;
  canInstall?: boolean;
  onInstall?: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, isConfigured, onOpenSetup, canInstall, onInstall }) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 text-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>

      <button 
        onClick={onOpenSetup}
        className="absolute top-14 right-10 p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all active:scale-90 z-20"
      >
        <Settings className="w-5 h-5" />
      </button>

      <div className="mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 z-10">
        <div className="w-24 h-24 bg-white/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl backdrop-blur-2xl border border-white/20">
          <Cloud className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter mb-2 text-white">SharedMoments</h1>
        <div className="flex items-center justify-center gap-2 text-indigo-300">
          <ShieldCheck className="w-4 h-4" />
          <p className="text-xs font-bold uppercase tracking-widest">Official Google Drive App</p>
        </div>
      </div>

      <div className="w-full space-y-4 max-w-xs z-10">
        <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] backdrop-blur-sm">
          <p className="text-center text-sm text-indigo-100 mb-8 leading-relaxed font-medium">
            Your photos stay in your personal <span className="text-white font-bold">Google Drive</span>. No middleman, just memories.
          </p>
          
          <button 
            onClick={onLogin}
            className="w-full flex flex-col items-center justify-center gap-2 bg-white text-indigo-600 py-8 px-6 rounded-[2.5rem] font-black shadow-2xl hover:scale-[1.02] active:scale-95 transition-all text-xl leading-tight"
          >
            <div className="flex items-center gap-4">
              <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-8 h-8" alt="G" />
              <span>{isConfigured ? "Sign in" : "Setup Project"}</span>
            </div>
          </button>
          
          {!isConfigured && (
            <p className="text-[10px] text-center text-indigo-300 font-bold uppercase tracking-widest animate-pulse mt-4">
              One-time setup required
            </p>
          )}
        </div>

        <div className="flex flex-col items-center">
          {canInstall ? (
            <button 
              onClick={onInstall}
              className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 py-5 px-6 rounded-2xl font-black shadow-lg shadow-indigo-900/20 hover:bg-white transition-all active:scale-95"
            >
              <Smartphone className="w-5 h-5" />
              <span className="text-xs uppercase tracking-widest">Install Now</span>
            </button>
          ) : (
            <button 
              onClick={() => setShowHelp(true)}
              className="w-full flex items-center justify-center gap-2 text-indigo-200/40 py-2 font-bold hover:text-white transition-colors"
            >
              <Info className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-widest">Installation Instructions</span>
            </button>
          )}
        </div>
      </div>

      <footer className="absolute bottom-6 flex flex-col items-center z-10 opacity-30">
        <div className="flex items-center gap-2 text-white text-[9px] font-bold uppercase tracking-[0.2em]">
          <Github className="w-3 h-3" />
          Production v3.2
        </div>
      </footer>

      {/* Installation Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl text-slate-900 animate-in zoom-in-95 duration-200">
            <div className="p-8 bg-indigo-600 text-white">
              <h3 className="text-2xl font-black tracking-tighter">Get the App</h3>
              <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest mt-1">Add to your Android device</p>
            </div>
            
            <div className="p-8 space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 font-black text-indigo-600">1</div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">Goto <span className="text-indigo-600">github</span></p>
                  <button 
                    onClick={() => window.open('https://github.com/nurykim/SharedMoments', '_blank')}
                    className="mt-2 flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-black transition-all active:scale-95"
                  >
                    <Github className="w-3 h-3" />
                    Open GitHub Page
                  </button>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 font-black text-slate-400">2</div>
                <p className="text-sm font-bold text-slate-800">Tap <span className="text-indigo-600">three dots</span></p>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 font-black text-slate-400">3</div>
                <p className="text-sm font-bold text-slate-800">Add to <span className="text-indigo-600">home</span></p>
              </div>

              <div className="pt-4 flex flex-col gap-2">
                <button 
                  onClick={() => setShowHelp(false)}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95 transition-all"
                >
                  Close Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;
