import React from 'react';
import { Link } from 'react-router-dom';
import { Login, UserPlus } from 'lucide-react';

const RouteChoice = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
    <div className="text-center space-y-8 max-w-md w-full">
      <div className="space-y-4">
        <h1 className="text-5xl md:text-6xl font-black font-sport text-white uppercase italic tracking-tighter drop-shadow-2xl">Busia Soccer</h1>
        <p className="text-xl text-slate-400 font-medium">League Management Portal</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 max-w-2xl w-full mx-auto">
        <Link to="/login" className="group relative bg-gradient-to-br from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white p-8 rounded-2xl shadow-2xl hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300 flex flex-col items-center text-center h-48 justify-center border border-emerald-400/20 hover:scale-[1.02]">
          <Login className="w-16 h-16 text-white/90 group-hover:scale-110 transition-transform mb-4" />
          <h2 className="text-2xl font-black font-sport tracking-tight mb-2">Sign In</h2>
          <p className="text-emerald-100 font-medium">Access your league dashboard</p>
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-slate-950 px-6 py-1 rounded-full text-xs font-bold text-slate-400 border border-slate-700">
            Demo: admin / admin123
          </div>
        </Link>
        
        <Link to="/signup" className="group relative bg-gradient-to-br from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white p-8 rounded-2xl shadow-2xl hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all duration-300 flex flex-col items-center text-center h-48 justify-center border border-blue-400/20 hover:scale-[1.02]">
          <UserPlus className="w-16 h-16 text-white/90 group-hover:scale-110 transition-transform mb-4" />
          <h2 className="text-2xl font-black font-sport tracking-tight mb-2">Join League</h2>
          <p className="text-blue-100 font-medium">Create manager account</p>
        </Link>
      </div>
      
      <p className="text-sm text-slate-500 tracking-wide">Official Busia County Soccer League System © 2024</p>
    </div>
  </div>
);

export default RouteChoice;

