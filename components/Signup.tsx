import React, { useState } from 'react';
import { UserPlus, Lock, Check, ArrowRight, KeyRound } from 'lucide-react';

interface AuthResult {
  success: boolean;
  message?: string;
}

interface SignupProps {
  onRegister: (u: string, p: string) => Promise<AuthResult>;
  onSwitchToLogin: () => void;
}

export const Signup: React.FC<SignupProps> = ({ onRegister, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPass) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await onRegister(username.trim(), password.trim());
      if (result.success) {
        alert('Account created! Please sign in.');
        onSwitchToLogin();
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
            <UserPlus className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Join League</h1>
          <p className="text-blue-400 font-bold text-sm mt-2 uppercase tracking-wide">Create Manager Account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Username</label>
            <input 
              type="text" 
              value={username}
onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Manager ID"
              required 
            />
          </div>
          
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Min 6 chars"
              required 
            />
          </div>
          
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Confirm Password</label>
            <input 
              type="password" 
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Repeat password"
              required 
            />
          </div>

{error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-4 rounded-xl font-bold uppercase tracking-wide shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
          >
{loading ? (
              <> 
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 
                Creating...
              </>
            ) : (
              <> 
                <UserPlus className="w-5 h-5" /> 
                Create Account
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-sm text-slate-400">
            Already registered? <button 
              onClick={onSwitchToLogin}
              className="text-blue-400 hover:text-blue-300 font-bold underline ml-1"
            >Sign In</button>
          </p>
        </div>
      </div>
    </div>
  );
};
