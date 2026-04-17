import React, { useState } from 'react';
import { Trophy, Lock, User, ArrowRight, ShieldCheck, KeyRound, UserPlus, Check } from 'lucide-react';

interface AuthResult {
  success: boolean;
  message?: string;
}

interface LoginProps {
  onLogin: (u: string, p: string) => Promise<AuthResult>;
  onRegister: (u: string, p: string) => Promise<AuthResult>;
  initialMode?: 'login' | 'register';
  onBack?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onRegister, initialMode = 'login', onBack }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    (async () => {
      if (isRegistering && password !== confirmPass) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (isRegistering && password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      try {
        if (isRegistering) {
          const result = await onRegister(username, password);
          if (result.success) {
            setSuccessMsg('Account created. Signing in...');
            const loginResult = await onLogin(username, password);
            if (!loginResult.success) {
              setError(loginResult.message || 'Account created but login failed. Please sign in manually.');
            }
          } else {
            setError(result.message || 'Unable to create account.');
          }
        } else {
          const result = await onLogin(username, password);
          if (!result.success) {
            setError(result.message || 'Invalid credentials. Access denied.');
          }
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    })();
  };

  const autoFillDemo = () => {
    setUsername('admin');
    setPassword('admin123');
    setError('');
    setIsRegistering(false);
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setSuccessMsg('');
    setUsername('');
    setPassword('');
    setConfirmPass('');
  };

  React.useEffect(() => {
    setIsRegistering(initialMode === 'register');
  }, [initialMode]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Immersive Stadium Background */}
       <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-emerald-900/90 mix-blend-multiply z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1522778119026-d647f0565c6a?q=80&w=2070&auto=format&fit=crop" 
            alt="Stadium" 
            className="w-full h-full object-cover opacity-40 filter blur-sm transform scale-105"
          />
       </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 p-96 bg-emerald-500 rounded-full mix-blend-overlay filter blur-[150px] opacity-20 animate-pulse pointer-events-none z-10"></div>
      <div className="absolute bottom-0 left-0 p-80 bg-blue-600 rounded-full mix-blend-overlay filter blur-[150px] opacity-20 pointer-events-none z-10"></div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md relative z-20 overflow-hidden group transition-all duration-500">
        
        {/* Top Shine Effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

        <div className="text-center mb-8">
          <div className="relative inline-block">
             <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/50 mx-auto mb-5 transform rotate-3 group-hover:rotate-6 transition-transform duration-500 border border-white/10">
               {isRegistering ? <UserPlus className="w-10 h-10 text-white" /> : <Trophy className="w-10 h-10 text-white" />}
             </div>
             {!isRegistering && (
               <div className="absolute -bottom-2 -right-2 bg-slate-800 rounded-full p-1.5 border border-slate-700 shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
               </div>
             )}
          </div>
          <h1 className="text-4xl font-sport font-black text-white italic tracking-tighter uppercase drop-shadow-md">
            {isRegistering ? 'Join The League' : 'Busia Soccer'}
          </h1>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <div className="h-px w-8 bg-emerald-500/50"></div>
            <p className="text-emerald-400 font-bold text-xs tracking-[0.2em] uppercase">
              {isRegistering ? 'New Manager Registration' : 'League Manager Portal'}
            </p>
            <div className="h-px w-8 bg-emerald-500/50"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Username</label>
            <div className="relative group/input">
              <User className="absolute left-4 top-3.5 text-slate-500 w-5 h-5 group-focus-within/input:text-emerald-400 transition-colors" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700/50 text-white pl-12 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all font-medium placeholder-slate-600 hover:border-slate-600"
                placeholder="Manager ID"
                autoComplete="off"
                required
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
            <div className="relative group/input">
              <Lock className="absolute left-4 top-3.5 text-slate-500 w-5 h-5 group-focus-within/input:text-emerald-400 transition-colors" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700/50 text-white pl-12 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all font-medium placeholder-slate-600 hover:border-slate-600"
                placeholder={isRegistering ? "Min 6 chars" : "••••••••"}
                required
              />
            </div>
          </div>

          {isRegistering && (
            <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Confirm Password</label>
              <div className="relative group/input">
                <Check className="absolute left-4 top-3.5 text-slate-500 w-5 h-5 group-focus-within/input:text-emerald-400 transition-colors" />
                <input 
                  type="password" 
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700/50 text-white pl-12 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all font-medium placeholder-slate-600 hover:border-slate-600"
                  placeholder="Repeat password"
                  required
                />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-sm px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
               <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
               <span className="font-medium">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
               <span className="font-medium">{successMsg}</span>
            </div>
          )}

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 uppercase tracking-wide group/btn disabled:opacity-70 disabled:cursor-not-allowed
                ${isRegistering 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-blue-900/30' 
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-emerald-900/30'
                }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="font-sport tracking-wider text-lg">{isRegistering ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-6 pt-6 border-t border-white/5 flex flex-col items-center space-y-4">
           <button 
             onClick={toggleMode}
             className="text-slate-400 hover:text-white text-xs font-medium uppercase tracking-wide transition-colors"
           >
             {isRegistering ? (
               <span>Already registered? <span className="text-emerald-400 underline decoration-emerald-500/50 underline-offset-4 decoration-2">Sign In here</span></span>
             ) : (
               <span>New Manager? <span className="text-blue-400 underline decoration-blue-500/50 underline-offset-4 decoration-2">Register Club Access</span></span>
             )}
           </button>
           
           {!isRegistering && (
            <button 
              onClick={autoFillDemo}
              className="inline-flex items-center space-x-2 bg-slate-800/50 hover:bg-slate-700/50 px-3 py-1.5 rounded-lg border border-slate-700/50 hover:border-emerald-500/30 transition-all group/demo cursor-pointer"
            >
               <KeyRound size={12} className="text-emerald-400 group-hover/demo:text-emerald-300" />
               <span className="text-slate-500 group-hover/demo:text-slate-400 font-mono text-[10px]">Demo: admin / admin123</span>
            </button>
           )}
        </div>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-6 text-slate-500 text-[10px] font-medium tracking-wider z-20">
        &copy; {new Date().getFullYear()} BUSIA SOCCER MANAGEMENT SYSTEM
      </div>
    </div>
  );
};