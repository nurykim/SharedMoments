
import React, { useState } from 'react';
import { LogIn, Cloud, ShieldCheck, AlertCircle, Github } from 'lucide-react';

interface AuthPageProps {
  onLogin: (remember: boolean) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = () => {
    onLogin(rememberMe);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 text-white relative">
      <div className="mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="w-24 h-24 bg-white/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl backdrop-blur-2xl border border-white/20">
          <Cloud className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter mb-2">SharedMoments</h1>
        <div className="flex items-center justify-center gap-2 text-indigo-300">
          <ShieldCheck className="w-4 h-4" />
          <p className="text-xs font-bold uppercase tracking-widest">Google Identity Required</p>
        </div>
      </div>

      <div className="w-full space-y-6 max-w-xs">
        <div className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-sm">
          <p className="text-center text-sm text-indigo-100 mb-6 leading-relaxed">
            This app uses your private <strong>Google Drive</strong> to store photos. Sign in with your Google Account to continue.
          </p>
          
          <button 
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white text-indigo-600 py-4 px-6 rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all mb-4"
          >
            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-5 h-5" alt="G" />
            Continue with Google
          </button>
          
          <button 
            onClick={() => window.open('https://accounts.google.com/signup', '_blank')}
            className="w-full text-center text-xs font-bold text-white/60 hover:text-white transition-colors"
          >
            Don't have a Google ID? Sign Up
          </button>
        </div>

        <div className="flex items-center justify-center gap-3 py-4">
          <input 
            type="checkbox" 
            id="remember" 
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-5 h-5 rounded-lg text-indigo-600 focus:ring-indigo-500 bg-white/10 border-white/20"
          />
          <label htmlFor="remember" className="text-sm font-bold cursor-pointer select-none text-indigo-200">Keep me logged in</label>
        </div>
      </div>

      <footer className="absolute bottom-10 flex flex-col items-center gap-4">
        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest opacity-50">
          Your photos stay in your drive. We never see them.
        </p>
        <a 
          href="https://github.com/nurykim/SharedMoments/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-[0.2em]"
        >
          <Github className="w-4 h-4" />
          nurykim/SharedMoments
        </a>
      </footer>
    </div>
  );
};

export default AuthPage;
