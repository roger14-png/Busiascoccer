
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import InstallBanner from './components/InstallBanner';
import { ViewState, Team, Match, Standing, Category } from './types';
import { generateFixtures, calculateStandings, generateUniqueId } from './services/leagueService';
import { analyzeLeague, predictMatch } from './services/geminiService';
import { 
  Users, Calendar, Trophy, Plus, Trash2, ArrowRight, Save, 
  CheckCircle, AlertCircle, Sparkles, TrendingUp, ClipboardList, Activity,
  Pencil, X, Check, Search, User, Layers, Lock, Settings, Shield, UserPlus, Shirt, MonitorPlay
} from 'lucide-react';



type UserAccount = {
  id?: string;
  user: string;
  pass?: string;
};

// JerseyIcon component (same as original)
const JerseyIcon = ({ color, shortName, size = "md" }: { color: string, shortName: string, size?: "sm" | "md" | "lg" | "xl" }) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-[8px]",
    md: "w-12 h-12 text-[10px]",
    lg: "w-16 h-16 text-xs",
    xl: "w-24 h-24 text-sm"
  };

  return (
    <div className={`${sizeClasses[size as keyof typeof sizeClasses]} relative flex items-center justify-center drop-shadow-lg transform transition-transform hover:scale-105 group`}>
       <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" style={{ fill: color }}>
          <path d="M25 25 L15 35 L20 45 L30 40 L30 85 L70 85 L70 40 L80 45 L85 35 L75 25 Q50 35 25 25 Z" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          <path d="M40 25 Q50 35 60 25" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="3" />
       </svg>
       <span className="absolute top-[45%] font-black font-sport text-white tracking-wider mix-blend-overlay opacity-90">{shortName}</span>
       <div className="absolute inset-0 bg-mesh opacity-30 pointer-events-none mask-jersey"></div>
    </div>
  );
};

// Extract all subcomponents (TeamsView, FixturesView, etc.) exactly as from App.tsx
// [PASTE ALL SUBCOMPONENTS HERE - TeamsView, FixturesView, ResultsView, StandingsView, DashboardView, SettingsView]

// Main AppViews component



// TeamsView stub
const TeamsView = ({ teams }: { teams: Team[], setTeams: React.Dispatch<React.SetStateAction<Team[]>> }) => {
  return <div className="p-8 text-center text-slate-400">Teams management coming soon ({teams.length} teams)</div>;
};

// FixturesView stub
const FixturesView = ({ teams, matches, category, isAdmin }: { teams: Team[], matches: Match[], setMatches: React.Dispatch<React.SetStateAction<Match[]>>, category: 'ALL' | Category, isAdmin: boolean }) => {
  return <div className="p-8 text-center text-slate-400">Fixtures view coming soon</div>;
};

const ResultsView = ({ 
  teams, matches, setMatches, category, isAdmin 
}: { 
  teams: Team[], matches: Match[], setMatches: React.Dispatch<React.SetStateAction<Match[]>>, category: 'ALL' | Category,
  isAdmin: boolean
}) => {
  return <div className="p-8 text-center text-slate-400">Results view stub</div>;
};

// StandingsTable
const StandingsTable = ({ teams, matches, category, label }: { teams: Team[], matches: Match[], category: Category, label?: string }) => {
  // [exact code from App.tsx]
};

// StandingsView
const StandingsView = ({ teams, matches }: { teams: Team[], matches: Match[] }) => {
  return <div className="p-8 text-center text-slate-400">Standings stub</div>;
};

// DashboardView
const DashboardView = ({ teams, matches, setView }: { teams: Team[], matches: Match[], setView: (v: ViewState) => void }) => {
  return <div className="p-8 text-center text-slate-400">Dashboard stub</div>;
};

// SettingsView
const SettingsView = (props: {
  currentUser: string;
  users: UserAccount[];
  updateCredentials: (u: string, p: string) => Promise<{ success: boolean; message?: string }>;
  addUser: (u: string, p: string) => Promise<boolean>;
  deleteUser: (u: string) => void;
}) => {
  const { currentUser } = props;
  return <div className="p-8 text-center text-slate-400">Settings stub</div>;
};

interface AppViewsProps {
  currentUser: string;
  users: UserAccount[];
  updateCredentials: (u: string, p: string) => Promise<{ success: boolean; message?: string }>;
  addUser: (u: string, p: string) => Promise<boolean>;
  deleteUser: (u: string) => void;
  onLogout: () => void;
}

export const AppViews: React.FC<AppViewsProps> = ({ currentUser, users, updateCredentials, addUser, deleteUser, onLogout }) => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [activeCategory, setActiveCategory] = useState<'ALL' | Category>('ALL');
  const isAdmin = currentUser.toLowerCase() === 'admin';

  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem('fm_teams');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = localStorage.getItem('fm_matches');
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return parsed.map((m: any) => ({
      ...m,
      category: m.category || 'BOYS'
    }));
  });

  useEffect(() => {
    localStorage.setItem('fm_teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('fm_matches', JSON.stringify(matches));
  }, [matches]);

  const renderView = () => {
    switch (currentView) {
      case ViewState.TEAMS:
        return <TeamsView teams={teams} setTeams={setTeams} />;
      case ViewState.FIXTURES:
        return <FixturesView teams={teams} matches={matches} setMatches={setMatches} category={activeCategory} isAdmin={isAdmin} />;
      case ViewState.RESULTS:
        return <ResultsView teams={teams} matches={matches} setMatches={setMatches} category={activeCategory} isAdmin={isAdmin} />;
      case ViewState.STANDINGS:
        return <StandingsView teams={teams} matches={matches} />;
      case ViewState.SETTINGS:
        return <SettingsView 
            currentUser={currentUser}
            users={users}
            updateCredentials={updateCredentials} 
            addUser={addUser}
            deleteUser={deleteUser}
        />;
      case ViewState.DASHBOARD:
      case ViewState.AI_ASSISTANT:
      default:
        return <DashboardView teams={teams} matches={matches} setView={setCurrentView} />;
    }
  };

  return (
    <>
      <Layout currentView={currentView} setView={setCurrentView} onLogout={onLogout}>
        <InstallBanner />
        {currentView !== ViewState.SETTINGS && (
          <div className="absolute top-4 right-4 md:right-8 z-50">
            <div className="bg-black/60 backdrop-blur-md p-1.5 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/10 flex items-center">
              <button 
                onClick={() => setActiveCategory('BOYS')}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeCategory === 'BOYS' 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 scale-105' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Boys
              </button>
              <button 
                onClick={() => setActiveCategory('GIRLS')}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeCategory === 'GIRLS' 
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/50 scale-105' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Girls
              </button>
              <div className="w-px h-4 bg-white/10 mx-2"></div>
              <button 
                onClick={() => setActiveCategory('ALL')}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeCategory === 'ALL' 
                    ? 'bg-slate-700 text-white shadow-lg ring-1 ring-white/20' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
            </div>
          </div>
        )}
        {renderView()}
      </Layout>
    </>
  );
};


