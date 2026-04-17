import React from 'react';
import { Trophy, Users, Calendar, ClipboardList, Activity, Sparkles, LayoutDashboard, LogOut, Settings, Shirt } from 'lucide-react';
import { ViewState } from '../types';

interface LayoutProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  children: React.ReactNode;
  onLogout: () => void;
}

const NavItem = ({ 
  label, 
  icon: Icon, 
  active, 
  onClick 
}: { 
  label: string; 
  icon: React.ElementType; 
  active: boolean; 
  onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
      active 
        ? 'bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-500/50' 
        : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
    }`}
  >
    {active && <div className="absolute inset-0 bg-mesh opacity-20"></div>}
    {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400 shadow-[0_0_10px_#34d399]"></div>}
    
    <Icon className={`w-5 h-5 relative z-10 ${active ? 'text-white animate-pulse' : 'text-slate-500 group-hover:text-emerald-400 transition-colors'}`} />
    <span className={`font-sport tracking-wide relative z-10 text-sm ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ currentView, setView, children, onLogout }) => {
  return (
    <div className="flex h-screen bg-transparent overflow-hidden">
      {/* Sidebar - Dark "Dugout" Theme */}
      <aside className="w-72 bg-slate-900/95 backdrop-blur-xl border-r border-white/5 flex flex-col hidden md:flex z-10 shadow-2xl relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        
        <div className="p-8 border-b border-white/5 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-40"></div>
                <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-950 rounded-xl flex items-center justify-center shadow-lg border border-white/10 relative z-10 group cursor-pointer hover:border-emerald-500/50 transition-colors">
                  <Trophy className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform duration-300" />
                </div>
            </div>
            <div>
              <span className="text-2xl font-sport font-black tracking-wide uppercase italic block leading-none text-white drop-shadow-lg">Busia</span>
              <span className="text-2xl font-sport font-black tracking-wide uppercase italic block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600 leading-none filter drop-shadow">Soccer</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4">
             <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse"></div>
             <p className="text-[10px] text-emerald-500/80 font-bold tracking-[0.2em] uppercase">Official League Manager</p>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto relative z-10 scrollbar-thin scrollbar-thumb-slate-700">
          <NavItem 
            label="Command Center" 
            icon={LayoutDashboard} 
            active={currentView === ViewState.DASHBOARD} 
            onClick={() => setView(ViewState.DASHBOARD)} 
          />
          
          <div className="pt-6 pb-2 px-4 flex items-center space-x-2 opacity-50">
            <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-1"></div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-sport">Clubhouse</p>
            <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-1"></div>
          </div>
          
          <NavItem 
            label="Club Management" 
            icon={Shirt} 
            active={currentView === ViewState.TEAMS} 
            onClick={() => setView(ViewState.TEAMS)} 
          />
          <NavItem 
            label="Fixture List" 
            icon={Calendar} 
            active={currentView === ViewState.FIXTURES} 
            onClick={() => setView(ViewState.FIXTURES)} 
          />
          
          <div className="pt-6 pb-2 px-4 flex items-center space-x-2 opacity-50">
            <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-1"></div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-sport">Match Day</p>
            <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-1"></div>
          </div>
          
          <NavItem 
            label="Match Results" 
            icon={ClipboardList} 
            active={currentView === ViewState.RESULTS} 
            onClick={() => setView(ViewState.RESULTS)} 
          />
          <NavItem 
            label="League Table" 
            icon={Trophy} 
            active={currentView === ViewState.STANDINGS} 
            onClick={() => setView(ViewState.STANDINGS)} 
          />
          
          <div className="pt-6 pb-2 px-4 flex items-center space-x-2 opacity-50">
            <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-1"></div>
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-sport">Intelligence</p>
             <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-1"></div>
          </div>
           <NavItem 
            label="Scout AI" 
            icon={Sparkles} 
            active={currentView === ViewState.AI_ASSISTANT} 
            onClick={() => setView(ViewState.AI_ASSISTANT)} 
          />
        </nav>

        <div className="p-6 border-t border-white/5 bg-black/20 space-y-2 relative z-10 backdrop-blur-sm">
           <NavItem 
            label="Settings" 
            icon={Settings} 
            active={currentView === ViewState.SETTINGS} 
            onClick={() => setView(ViewState.SETTINGS)} 
           />
           <button 
             onClick={onLogout}
             className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all group border border-transparent hover:border-red-500/20"
           >
             <LogOut className="w-5 h-5 group-hover:rotate-180 transition-transform" />
             <span className="font-sport font-medium tracking-wide text-sm">Log Out</span>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden bg-slate-900/90 backdrop-blur-lg border-b border-white/10 p-4 flex items-center justify-between z-20 shadow-xl sticky top-0">
           <div className="flex items-center space-x-3 text-white">
             <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg border border-white/10">
                <Trophy className="w-5 h-5" />
             </div>
             <div className="leading-tight">
                <span className="font-sport font-black text-lg italic tracking-tighter block uppercase">Busia</span>
                <span className="font-sport font-bold text-xs text-emerald-400 tracking-widest uppercase block">Soccer</span>
             </div>
           </div>
           <div className="flex items-center space-x-1">
              <button onClick={() => setView(ViewState.SETTINGS)} className={`p-2 rounded-lg transition-colors ${currentView === ViewState.SETTINGS ? 'text-emerald-400 bg-white/10' : 'text-slate-400 hover:text-white'}`}>
                <Settings size={20} />
              </button>
              <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-400">
                <LogOut size={20} />
              </button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative scroll-smooth">
           {children}
        </div>
      </main>

      {/* Mobile Bottom Nav - Glassmorphism */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-white/10 flex justify-around p-3 pb-safe z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <button onClick={() => setView(ViewState.DASHBOARD)} className={`p-2 rounded-xl transition-all ${currentView === ViewState.DASHBOARD ? 'text-emerald-400 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'text-slate-500'}`}><LayoutDashboard size={24} /></button>
        <button onClick={() => setView(ViewState.FIXTURES)} className={`p-2 rounded-xl transition-all ${currentView === ViewState.FIXTURES ? 'text-emerald-400 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'text-slate-500'}`}><Calendar size={24} /></button>
        <button onClick={() => setView(ViewState.RESULTS)} className={`p-2 rounded-xl transition-all ${currentView === ViewState.RESULTS ? 'text-emerald-400 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'text-slate-500'}`}><ClipboardList size={24} /></button>
        <button onClick={() => setView(ViewState.STANDINGS)} className={`p-2 rounded-xl transition-all ${currentView === ViewState.STANDINGS ? 'text-emerald-400 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'text-slate-500'}`}><Trophy size={24} /></button>
      </div>
    </div>
  );
};