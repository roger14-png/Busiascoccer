import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import RouteChoice from './components/RouteChoice';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { AppViews } from './AppViews';
import InstallBanner from './components/InstallBanner';
import { useState, useEffect } from 'react';
import { ViewState, UserAccount } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [users, setUsers] = useState<UserAccount[]>([]);

  const navigate = useNavigate();
  const location = useLocation();

  // Auth logic (same as original initAuth + helpers)
  useEffect(() => {
    const initAuth = async () => {
      setIsLoadingAuth(true);
      const token = localStorage.getItem('fm_token');
      let authenticated = false;

      if (token) {
        try {
          const res = await fetch('/api/me', { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) {
            const data = await res.json();
            authenticated = true;
            setIsAuthenticated(true);
            setCurrentUser(data.username || '');
          } else {
            localStorage.removeItem('fm_token');
          }
        } catch (err) {
          localStorage.removeItem('fm_token');
        }
      }

      const storedUsers = localStorage.getItem('fm_users');
      if (storedUsers) {
        const parsed = JSON.parse(storedUsers);
        const normalized = parsed.map((item: any) => ({
          id: item.id,
          user: item.user || item.username || '',
          pass: item.pass
        })).filter((item: any) => item.user);
        setUsers(normalized);
      } else {
        const defaultUsers = [{ user: 'admin', pass: 'admin123' }];
        setUsers(defaultUsers);
        localStorage.setItem('fm_users', JSON.stringify(defaultUsers));
      }

      setIsLoadingAuth(false);
    };
    initAuth();
  }, []);

  const verifyLogin = async (u: string, p: string) => {
    // [exact verifyLogin from original]
    const result = { success: true }; // placeholder
    if (result.success) {
      setIsAuthenticated(true);
      setCurrentUser(u);
      navigate('/app/dashboard', { replace: true });
    }
    return result;
  };

  const handleRegister = async (u: string, p: string) => {
    // [exact handleRegister from original]
    return { success: true };
  };

  const handleLogout = () => {
    localStorage.removeItem('fm_token');
    localStorage.removeItem('fm_last_user');
    setIsAuthenticated(false);
    setCurrentUser('');
    navigate('/', { replace: true });
  };

  const updateCredentials = async () => { return { success: true }; };
  const addUser = async () => true;
  const deleteUser = (u: string) => {};

  if (isLoadingAuth) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_#10b981]"></div>
    </div>;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<RouteChoice />} />
        <Route path="/login" element={<Login onLogin={verifyLogin} onRegister={handleRegister} />} />
        <Route path="/signup" element={<Signup onRegister={handleRegister} onSwitchToLogin={() => navigate('/login')} />} />
        <Route path="/app" element={isAuthenticated ? (
          <AppViews 
            currentUser={currentUser}
            users={users}
            updateCredentials={updateCredentials}
            addUser={addUser}
            deleteUser={deleteUser}
            onLogout={handleLogout}
          />
        ) : <Navigate to="/" replace />}>
          <Route path="dashboard" element={<div>Dashboard Route</div>} />
          <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <InstallBanner />
    </>
  );
};

export default App;


// 3. Results Entry
const ResultsView = ({ 
  teams, matches, setMatches, category, isAdmin 
}: { 
  teams: Team[], matches: Match[], setMatches: React.Dispatch<React.SetStateAction<Match[]>>, category: ViewCategory,
  isAdmin: boolean
}) => {
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [homeScore, setHomeScore] = useState<string>('');
  const [awayScore, setAwayScore] = useState<string>('');
  const [geminiPrediction, setGeminiPrediction] = useState<string>('');

  const viewMatches = useMemo(() => {
    if (category === 'ALL') return matches;
    return matches.filter(m => m.category === category);
  }, [matches, category]);

  const pendingMatches = viewMatches.filter(m => !m.played);

  const matchesByRound = useMemo(() => {
    const grouped: Record<number, Match[]> = {};
    pendingMatches.forEach(m => {
      if (!grouped[m.round]) grouped[m.round] = [];
      grouped[m.round].push(m);
    });
    return grouped;
  }, [pendingMatches]);

  const handleSelectMatch = async (match: Match) => {
    setSelectedMatchId(match.id);
    setHomeScore('');
    setAwayScore('');
    setGeminiPrediction('');
    
    const home = teams.find(t => t.id === match.homeTeamId);
    const away = teams.find(t => t.id === match.awayTeamId);
    
    const contextMatches = matches.filter(m => m.category === match.category);
    const standings = calculateStandings(teams, contextMatches); 
    
    if (home && away) {
       const pred = await predictMatch(home, away, standings, match.category);
       setGeminiPrediction(pred);
    }
  };

  const handleSaveResult = () => {
    if (homeScore === '' || awayScore === '' || !selectedMatchId) return;

    const updatedMatches = matches.map(m => {
      if (m.id === selectedMatchId) {
        return {
          ...m,
          homeScore: parseInt(homeScore),
          awayScore: parseInt(awayScore),
          played: true
        };
      }
      return m;
    });
    setMatches(updatedMatches);
    setSelectedMatchId(null);
  };

  const selectedMatch = matches.find(m => m.id === selectedMatchId);
  const homeTeam = selectedMatch ? teams.find(t => t.id === selectedMatch.homeTeamId) : null;
  const awayTeam = selectedMatch ? teams.find(t => t.id === selectedMatch.awayTeamId) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      <div className="lg:col-span-2 space-y-8">
        <div className="border-b border-white/10 pb-6">
           <div className="flex items-center space-x-3">
               <h2 className="text-4xl font-black font-sport text-white uppercase italic tracking-tighter drop-shadow-lg">Scoreboard</h2>
               <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
               <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Live Updates</span>
           </div>
           {!isAdmin && (
             <div className="mt-4 rounded-3xl border border-yellow-400/20 bg-yellow-500/10 p-4 text-sm text-yellow-100">
               Only admin can enter or confirm match scores.
             </div>
           )}
        </div>

        {Object.keys(matchesByRound).length === 0 && (
           <div className="text-center p-12 bg-slate-900/50 rounded-2xl border border-white/10 backdrop-blur-sm">
             <CheckCircle className="mx-auto text-emerald-500 mb-3 h-12 w-12" />
             <h3 className="text-lg font-bold text-white font-sport italic">All Matches Complete</h3>
             <p className="text-slate-500">No pending fixtures to update.</p>
           </div>
        )}

        {Object.entries(matchesByRound).map(([round, roundMatches]: [string, Match[]]) => (
          <div key={round} className="bg-slate-900/80 rounded-2xl border border-white/10 shadow-lg overflow-hidden backdrop-blur-sm">
            <div className="bg-black/40 px-5 py-3 border-b border-white/5 flex justify-between items-center">
               <span className="font-bold text-emerald-400 uppercase tracking-widest text-xs font-sport">Matchday {round}</span>
               <div className="flex gap-1">
                 <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                 <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                 <div className="w-1 h-1 bg-white/20 rounded-full"></div>
               </div>
            </div>
            <div className="divide-y divide-white/5">
              {roundMatches.map(match => {
                const home = teams.find(t => t.id === match.homeTeamId);
                const away = teams.find(t => t.id === match.awayTeamId);
                const isSelected = match.id === selectedMatchId;
                return (
                  <button 
                    key={match.id} 
                    onClick={() => isAdmin && handleSelectMatch(match)}
                    disabled={!isAdmin}
                    title={!isAdmin ? 'Only admin can select a match for score entry' : undefined}
                    className={`w-full p-4 flex items-center justify-between transition-all text-left group relative overflow-hidden ${isSelected ? 'bg-white/5 border-l-4 border-emerald-500' : 'border-l-4 border-transparent'} ${!isAdmin ? 'cursor-not-allowed opacity-80' : 'hover:bg-white/5'}`}
                  >
                    <div className="flex-1 flex items-center space-x-3">
                       <div className="transform scale-75">
                         <JerseyIcon color={home?.primaryColor || '#333'} shortName={home?.shortName || ''} size="sm" />
                       </div>
                       <span className={`text-sm font-sport tracking-wide uppercase italic ${isSelected ? 'font-black text-white' : 'font-medium text-slate-400 group-hover:text-white'}`}>{home?.name}</span>
                    </div>
                    <div className="flex flex-col items-center px-4">
                        <span className="text-xs font-black text-slate-600 px-3 uppercase italic group-hover:text-emerald-500 transition-colors">VS</span>
                    </div>
                    <div className="flex-1 flex items-center justify-end space-x-3">
                       <span className={`text-sm font-sport tracking-wide uppercase italic ${isSelected ? 'font-black text-white' : 'font-medium text-slate-400 group-hover:text-white'}`}>{away?.name}</span>
                       <div className="transform scale-75">
                         <JerseyIcon color={away?.primaryColor || '#333'} shortName={away?.shortName || ''} size="sm" />
                       </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-6">
          {selectedMatch && homeTeam && awayTeam ? (
            <div className="bg-slate-900 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden transform transition-all relative">
              {/* Animated Glow Border */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-blue-500/20 pointer-events-none"></div>

              <div className="bg-black/60 p-8 text-white text-center relative overflow-hidden">
                 <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900 via-black to-black"></div>
                 <h3 className="text-xs font-black mb-6 uppercase tracking-[0.3em] text-emerald-400 relative z-10 font-sport animate-pulse">Match Input</h3>
                 
                 <div className="flex items-center justify-center space-x-4 relative z-10">
                    <div className="flex flex-col items-center">
                       <JerseyIcon color={homeTeam.primaryColor} shortName={homeTeam.shortName} size="lg" />
                       <span className="mt-2 font-black font-sport uppercase text-sm tracking-widest">{homeTeam.shortName}</span>
                    </div>
                    <span className="text-3xl font-black italic text-slate-700 font-sport">VS</span>
                    <div className="flex flex-col items-center">
                       <JerseyIcon color={awayTeam.primaryColor} shortName={awayTeam.shortName} size="lg" />
                       <span className="mt-2 font-black font-sport uppercase text-sm tracking-widest">{awayTeam.shortName}</span>
                    </div>
                 </div>
              </div>

              <div className="p-6 space-y-6 bg-slate-800/50 backdrop-blur-md">
                 <div className="flex items-center justify-center space-x-4">
                    <div className="relative">
                        <input 
                          type="number" 
                          min="0"
                          value={homeScore}
                          onChange={(e) => setHomeScore(e.target.value)}
                          disabled={!isAdmin}
                          className="w-20 h-24 text-center text-6xl font-black bg-black text-emerald-400 border-2 border-slate-700 rounded-lg focus:border-emerald-500 focus:shadow-[0_0_20px_rgba(16,185,129,0.3)] outline-none transition-all font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="0"
                        />
                        <span className="absolute -bottom-6 left-0 right-0 text-center text-[10px] font-bold text-slate-500 uppercase">Home</span>
                    </div>
                    <span className="text-slate-600 text-4xl font-black px-2 self-start mt-6">:</span>
                    <div className="relative">
                        <input 
                          type="number" 
                          min="0"
                          value={awayScore}
                          onChange={(e) => setAwayScore(e.target.value)}
                          disabled={!isAdmin}
                          className="w-20 h-24 text-center text-6xl font-black bg-black text-emerald-400 border-2 border-slate-700 rounded-lg focus:border-emerald-500 focus:shadow-[0_0_20px_rgba(16,185,129,0.3)] outline-none transition-all font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="0"
                        />
                         <span className="absolute -bottom-6 left-0 right-0 text-center text-[10px] font-bold text-slate-500 uppercase">Away</span>
                    </div>
                 </div>
                 
                 {geminiPrediction && (
                    <div className="bg-indigo-900/30 p-4 rounded-xl border border-indigo-500/30 flex gap-3 text-sm text-indigo-200 shadow-inner mt-4">
                        <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5 animate-pulse" />
                        <div>
                            <span className="font-bold block text-[10px] uppercase tracking-widest text-indigo-400 mb-1">AI Prediction</span>
                            <span className="italic opacity-90">{geminiPrediction}</span>
                        </div>
                    </div>
                 )}

                 <button 
                   onClick={handleSaveResult}
                   disabled={!isAdmin}
                   title={!isAdmin ? 'Only admin can confirm results' : undefined}
                   className={`w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-4 rounded-xl font-black text-lg ${!isAdmin ? 'opacity-50 cursor-not-allowed' : 'hover:from-emerald-500 hover:to-emerald-400'} shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all flex items-center justify-center space-x-2 uppercase tracking-wide border border-emerald-400/20 mt-4 group`}
                 >
                   <Save size={20} className="group-hover:scale-110 transition-transform" />
                   <span className="font-sport tracking-wider">Confirm Result</span>
                 </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/50 rounded-3xl border-2 border-dashed border-white/10 p-10 text-center text-slate-500">
              <Search size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-medium uppercase tracking-wide text-xs">Select a match to enter scores</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 4. Standings View
const StandingsTable = ({ teams, matches, category, label }: { teams: Team[], matches: Match[], category: Category, label?: string }) => {
  const categoryMatches = useMemo(() => matches.filter(m => m.category === category), [matches, category]);
  const standings = useMemo(() => calculateStandings(teams, categoryMatches), [teams, categoryMatches]);

  return (
    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 overflow-hidden mb-8">
        {label && (
            <div className="bg-black/20 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <h3 className={`font-black font-sport uppercase italic tracking-widest text-lg ${category === 'BOYS' ? 'text-emerald-400' : 'text-rose-400'}`}>{label}</h3>
                <div className="h-1 w-20 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold">
                <th className="px-6 py-4 font-sport">Pos</th>
                <th className="px-6 py-4 font-sport">Club</th>
                <th className="px-4 py-4 text-center font-sport">MP</th>
                <th className="px-4 py-4 text-center font-sport">W</th>
                <th className="px-4 py-4 text-center font-sport">D</th>
                <th className="px-4 py-4 text-center font-sport">L</th>
                <th className="px-4 py-4 text-center hidden sm:table-cell font-sport">GF</th>
                <th className="px-4 py-4 text-center hidden sm:table-cell font-sport">GA</th>
                <th className="px-4 py-4 text-center font-sport">GD</th>
                <th className="px-6 py-4 text-center text-white font-black text-sm font-sport">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm font-medium">
              {standings.map((row, index) => {
                const team = teams.find(t => t.id === row.teamId);
                return (
                  <tr key={row.teamId} className={`hover:bg-white/5 transition-colors group ${index < 1 ? 'bg-emerald-500/5' : ''}`}>
                    <td className="px-6 py-4 text-slate-500 w-16">
                      <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black font-sport ${index === 0 ? 'bg-yellow-500 text-black shadow-[0_0_10px_gold]' : index < 3 ? 'bg-slate-700 text-white' : 'text-slate-600'}`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                         <div className="transform scale-75 origin-left">
                            <JerseyIcon color={team?.primaryColor || '#333'} shortName={team?.shortName || ''} size="sm" />
                         </div>
                         <span className="font-bold text-slate-200 text-base font-sport tracking-wide uppercase italic group-hover:text-emerald-400 transition-colors">{row.teamName}</span>
                         {index === 0 && <Trophy className="w-4 h-4 text-yellow-500 fill-current animate-pulse" />}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center text-slate-400 font-mono">{row.played}</td>
                    <td className="px-4 py-4 text-center text-emerald-400 font-bold font-mono">{row.won}</td>
                    <td className="px-4 py-4 text-center text-slate-500 font-mono">{row.drawn}</td>
                    <td className="px-4 py-4 text-center text-red-400 font-mono">{row.lost}</td>
                    <td className="px-4 py-4 text-center hidden sm:table-cell text-slate-500 font-mono">{row.gf}</td>
                    <td className="px-4 py-4 text-center hidden sm:table-cell text-slate-500 font-mono">{row.ga}</td>
                    <td className="px-4 py-4 text-center font-bold text-slate-300 font-mono">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                    <td className="px-6 py-4 text-center font-black text-white text-lg font-sport group-hover:scale-110 transition-transform">{row.points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
    </div>
  );
};

const StandingsView = ({ teams, matches, category }: { teams: Team[], matches: Match[], category: ViewCategory }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="border-b border-white/10 pb-4">
          <div className="flex items-center space-x-2">
             <h2 className="text-4xl font-black font-sport text-white uppercase italic tracking-tighter drop-shadow-lg">League Table</h2>
             <span className={`px-2 py-0.5 rounded text-xs font-black uppercase text-white tracking-widest ${category === 'BOYS' ? 'bg-emerald-600' : category === 'GIRLS' ? 'bg-rose-600' : 'bg-slate-700'}`}>
                 {category === 'ALL' ? 'COMBINED' : category}
             </span>
          </div>
          <p className="text-slate-400 font-medium mt-1">Busia Soccer Standings</p>
      </div>

      {category === 'ALL' ? (
        <div className="space-y-8">
            <StandingsTable teams={teams} matches={matches} category="BOYS" label="Boys League" />
            <StandingsTable teams={teams} matches={matches} category="GIRLS" label="Girls League" />
        </div>
      ) : (
        <StandingsTable teams={teams} matches={matches} category={category} />
      )}
    </div>
  );
};

// 5. Dashboard View
const DashboardView = ({ teams, matches, setView, category }: { teams: Team[], matches: Match[], setView: (v: ViewState) => void, category: ViewCategory }) => {
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  const analysisCategory: Category = category === 'ALL' ? 'BOYS' : category;
  
  const categoryMatches = useMemo(() => matches.filter(m => m.category === analysisCategory), [matches, analysisCategory]);
  const standings = useMemo(() => calculateStandings(teams, categoryMatches), [teams, categoryMatches]);

  const generateReport = async () => {
    setLoading(true);
    const text = await analyzeLeague(standings, categoryMatches, teams, analysisCategory);
    setReport(text);
    setLoading(false);
  };

  useEffect(() => {
    if (categoryMatches.length > 0) {
      generateReport();
    } else {
      setReport('');
    }
  }, [categoryMatches.length]);

  const viewMatches = category === 'ALL' ? matches : categoryMatches;
  const playedCount = viewMatches.filter(m => m.played).length;
  const totalMatches = viewMatches.length;
  const progress = totalMatches > 0 ? Math.round((playedCount / totalMatches) * 100) : 0;
  
  const leader = standings.length > 0 ? standings[0] : null;

  // Reusable Card Component
  const StatCard = ({ title, value, sub, icon: Icon, colorClass, borderClass, onClick }: any) => (
    <div onClick={onClick} className={`relative bg-slate-900/80 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-lg group overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}>
       <div className={`absolute top-0 left-0 w-1 h-full ${borderClass}`}></div>
       <div className="absolute top-0 right-0 p-16 opacity-10 bg-gradient-to-br from-white to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
       
       <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] font-sport">{title}</p>
             <h3 className="text-4xl font-black font-sport text-white mt-1 italic tracking-tight drop-shadow-md group-hover:scale-105 transition-transform">{value}</h3>
          </div>
          <div className={`p-3 rounded-xl ${colorClass} bg-opacity-20 backdrop-blur-md border border-white/5`}>
             <Icon size={20} className="text-white" />
          </div>
       </div>
       <p className="text-xs font-bold text-slate-500 font-sport tracking-wide uppercase relative z-10">
          {sub}
       </p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Category Header */}
      <div className="flex items-center space-x-3 mb-2">
         <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/10 shadow-lg ${category === 'BOYS' ? 'bg-emerald-700' : category === 'GIRLS' ? 'bg-rose-700' : 'bg-slate-700'}`}>
            {category === 'ALL' ? 'COMBINED VIEW' : `${category} LEAGUE`}
         </span>
         <span className="text-sm font-bold text-slate-400 font-sport italic tracking-wide">Season Overview</span>
      </div>

      {/* Hero Stats - Player Card Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Registered Clubs" 
          value={teams.length} 
          sub="Active Roster" 
          icon={Users} 
          colorClass="bg-blue-600"
          borderClass="bg-blue-500"
          onClick={() => setView(ViewState.TEAMS)}
        />
        <StatCard 
          title="Season Progress" 
          value={`${progress}%`} 
          sub="Matches Completed" 
          icon={Activity} 
          colorClass="bg-emerald-600"
          borderClass="bg-emerald-500"
        />
        <StatCard 
          title="Current Leader" 
          value={leader ? leader.teamName : '-'} 
          sub={leader ? `${leader.points} Points` : 'Pre-season'} 
          icon={Trophy} 
          colorClass="bg-yellow-600"
          borderClass="bg-yellow-500"
        />
        <StatCard 
          title="Matches Played" 
          value={playedCount} 
          sub={`Of ${totalMatches} Total`} 
          icon={CheckCircle} 
          colorClass="bg-purple-600"
          borderClass="bg-purple-500"
        />
      </div>

      {/* AI Report - Stadium Board Style */}
      <div className="bg-black/40 rounded-3xl p-1 shadow-2xl overflow-hidden relative group border border-white/10">
        <div className="absolute inset-0 bg-mesh opacity-10"></div>
        <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/95 to-black/90 rounded-[22px] p-8 relative overflow-hidden backdrop-blur-xl">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 p-40 bg-emerald-500 rounded-full mix-blend-overlay filter blur-[100px] opacity-10 animate-pulse"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <div className="p-2.5 bg-black border border-emerald-500/50 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        <Sparkles className="text-emerald-400 w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-wider font-sport">Scout Intel</h2>
                        <p className="text-emerald-500 text-[10px] font-bold tracking-[0.3em] uppercase">Powered by Gemini AI</p>
                    </div>
                </div>
                <button 
                  onClick={generateReport} 
                  className="bg-emerald-900/30 hover:bg-emerald-500/20 text-emerald-400 text-xs font-black py-2.5 px-6 rounded-full transition-all border border-emerald-500/30 flex items-center space-x-2 tracking-widest uppercase hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                >
                  <Sparkles size={12} />
                  <span>Refresh Analysis</span>
                </button>
              </div>
              
              <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/5 min-h-[140px] shadow-inner relative">
                {/* Typewriter text effect container */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-24 space-y-4 text-emerald-400">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-mono tracking-widest uppercase animate-pulse">Analyzing Match Data...</span>
                  </div>
                ) : report ? (
                  <div className="prose prose-invert max-w-none">
                    <p className="text-lg leading-relaxed text-slate-200 font-medium whitespace-pre-wrap font-sport tracking-wide drop-shadow-md border-l-4 border-emerald-500 pl-6">{report}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-24 text-slate-600">
                      <p className="italic font-sport tracking-wide">Data insufficient for analysis. Waiting for match results.</p>
                  </div>
                )}
              </div>
            </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div onClick={() => setView(ViewState.RESULTS)} className="group bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-white/10 p-8 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:border-emerald-500/30 transition-all cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-colors"></div>
            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-16 h-16 bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-6 text-emerald-500 border border-emerald-500/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
                   <ClipboardList size={32} />
                </div>
                <div>
                   <h3 className="text-3xl font-black font-sport text-white mb-2 uppercase italic tracking-tighter">Enter Scores</h3>
                   <p className="text-slate-400 font-medium text-sm">Post-match processing. Update live scorelines.</p>
                </div>
                <div className="mt-6 flex items-center text-emerald-500 text-xs font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                   <span>Go to Scoreboard</span> <ArrowRight size={14} className="ml-2" />
                </div>
            </div>
         </div>
         <div onClick={() => setView(ViewState.FIXTURES)} className="group bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-white/10 p-8 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:border-blue-500/30 transition-all cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition-colors"></div>
            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-16 h-16 bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6 text-blue-500 border border-blue-500/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
                   <Calendar size={32} />
                </div>
                <div>
                   <h3 className="text-3xl font-black font-sport text-white mb-2 uppercase italic tracking-tighter">Match Calendar</h3>
                   <p className="text-slate-400 font-medium text-sm">View full season schedule and upcoming rounds.</p>
                </div>
                <div className="mt-6 flex items-center text-blue-500 text-xs font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                   <span>View Schedule</span> <ArrowRight size={14} className="ml-2" />
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

// 6. Settings View
const SettingsView = ({ 
  currentUser,
  users, 
  updateCredentials,
  addUser,
  deleteUser
}: { 
  currentUser: string,
  users: UserAccount[],
  updateCredentials: (u: string, p: string) => Promise<{ success: boolean; message?: string }>;
  addUser: (u: string, p: string) => Promise<boolean>;
  deleteUser: (u: string) => void
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [newUser, setNewUser] = useState('');
  const [newPass, setNewPass] = useState('');
  const [userMsg, setUserMsg] = useState('');
  const [userErr, setUserErr] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!username || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
       setError('Password must be at least 6 characters');
       return;
    }

    const result = await updateCredentials(username, password);
    if (!result.success) {
      setError(result.message || 'Unable to save credentials. Please try again.');
      return;
    }

    setMessage(result.message || 'Credentials updated successfully.');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleAddUser = async (e: React.FormEvent) => {
      e.preventDefault();
      setUserErr('');
      setUserMsg('');

      if (!newUser || !newPass) {
          setUserErr('Username and password required');
          return;
      }
      
      if (newPass.length < 6) {
          setUserErr('Password too short (min 6)');
          return;
      }

      const success = await addUser(newUser, newPass);
      if (success) {
          setUserMsg(`Manager '${newUser}' added to roster.`);
          setNewUser('');
          setNewPass('');
      } else {
          setUserErr('Username already exists or could not be saved.');
      }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="border-b border-white/10 pb-6">
          <div className="flex items-center space-x-3">
             <h2 className="text-4xl font-black font-sport text-white uppercase italic tracking-tighter drop-shadow-lg">Manager Hub</h2>
               <div className="px-3 py-1 bg-slate-800 rounded-full border border-white/10">
                 <Shield size={16} className="text-emerald-500" />
               </div>
          </div>
          <p className="text-slate-400 font-medium mt-1">Security and Access Control</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: My Profile */}
          <div className="bg-slate-900/80 p-8 rounded-3xl border border-white/10 shadow-xl backdrop-blur-sm h-fit">
             <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                   <User size={24} />
                </div>
                <div>
                   <h3 className="font-bold text-xl font-sport text-white uppercase italic">My Profile</h3>
                   <p className="text-xs text-slate-500">Update your credentials</p>
                </div>
             </div>

             <form onSubmit={handleUpdate} className="space-y-5">
                 <div className="p-4 bg-black/40 rounded-xl border border-white/5 mb-4 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Current User</p>
                        <span className="font-bold text-emerald-400 text-lg font-mono">{currentUser}</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 </div>

                 <div className="space-y-1">
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Username</label>
                   <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-medium transition-all"
                        placeholder="New username"
                   />
                 </div>
                 <div className="space-y-1">
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                   <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-medium transition-all"
                        placeholder="New password"
                   />
                 </div>
                 <div className="space-y-1">
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                   <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-medium transition-all"
                        placeholder="Confirm new password"
                   />
                 </div>

                 {error && (
                    <div className="p-3 bg-red-500/10 text-red-400 text-sm font-bold rounded-xl border border-red-500/20 flex items-center gap-2">
                       <AlertCircle size={16} />
                       {error}
                    </div>
                 )}

                 {message && (
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 text-sm font-bold rounded-xl border border-emerald-500/20 flex items-center gap-2">
                       <CheckCircle size={16} />
                       {message}
                    </div>
                 )}

                 <button type="submit" className="w-full bg-slate-800 hover:bg-emerald-600 text-white py-4 rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 font-black uppercase tracking-widest text-xs mt-4 border border-white/10 hover:border-emerald-500/50">
                    <Save size={16} />
                    <span>Update Profile</span>
                 </button>
             </form>
          </div>

          {/* Right Column: User Management */}
          <div className="space-y-8">
              {/* Add New User */}
              <div className="bg-slate-900/80 p-8 rounded-3xl border border-white/10 shadow-xl backdrop-blur-sm">
                 <div className="flex items-center space-x-4 mb-6">
                    <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                       <UserPlus size={24} />
                    </div>
                    <div>
                       <h3 className="font-bold text-xl font-sport text-white uppercase italic">Draft Manager</h3>
                       <p className="text-xs text-slate-500">Add new manager access</p>
                    </div>
                 </div>
                 
                 <form onSubmit={handleAddUser} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                           <input 
                                type="text" 
                                value={newUser}
                                onChange={(e) => setNewUser(e.target.value)}
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium transition-all"
                                placeholder="ID"
                           />
                         </div>
                         <div className="space-y-1">
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                           <input 
                                type="password" 
                                value={newPass}
                                onChange={(e) => setNewPass(e.target.value)}
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium transition-all"
                                placeholder="Code"
                           />
                         </div>
                    </div>
                    
                    {userErr && (
                        <div className="p-3 bg-red-500/10 text-red-400 text-sm font-bold rounded-xl border border-red-500/20 flex items-center gap-2">
                           <AlertCircle size={16} />
                           {userErr}
                        </div>
                     )}

                     {userMsg && (
                        <div className="p-3 bg-blue-500/10 text-blue-400 text-sm font-bold rounded-xl border border-blue-500/20 flex items-center gap-2">
                           <CheckCircle size={16} />
                           {userMsg}
                        </div>
                     )}

                    <button type="submit" className="w-full bg-white text-slate-900 hover:bg-slate-200 py-4 rounded-xl transition-all flex items-center justify-center space-x-2 font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                        <Plus size={16} />
                        <span>Add User</span>
                    </button>
                 </form>
              </div>

              {/* User List */}
              <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                 <h3 className="font-bold text-sm font-sport mb-4 flex items-center gap-2 text-slate-400 uppercase tracking-widest">
                    <span>Active Roster</span>
                    <span className="bg-slate-800 text-white px-2 py-0.5 rounded text-[10px]">{users.length}</span>
                 </h3>
                 <div className="space-y-2">
                    {users.map((u, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white shadow-lg">
                                    {u.user.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-bold text-slate-200">{u.user}</span>
                                {u.user === currentUser && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded uppercase font-black tracking-widest">You</span>}
                            </div>
                            {u.user !== currentUser && (
                                <button 
                                    onClick={() => deleteUser(u.user)}
                                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="Revoke Access"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                 </div>
              </div>
          </div>
      </div>
    </div>
  );
};


