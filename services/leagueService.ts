import { Team, Match, Standing, Category } from '../types';

export const generateUniqueId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

/**
 * Generates Round Robin fixtures (Home & Away) for a specific category
 */
export const generateFixtures = (teams: Team[], category: Category): Match[] => {
  if (teams.length < 2) return [];

  const matches: Match[] = [];
  // Clone teams array so we can manipulate it for rotation
  let workingTeams = [...teams];
  
  // If odd number of teams, add a dummy team for "Bye" weeks
  const hasGhost = workingTeams.length % 2 !== 0;
  if (hasGhost) {
    workingTeams.push({ id: 'ghost', name: 'Bye', shortName: 'BYE', primaryColor: '#000', addedAt: 0 });
  }

  const n = workingTeams.length;
  const rounds = n - 1;
  const matchesPerRound = n / 2;

  // 1st Leg
  for (let r = 0; r < rounds; r++) {
    for (let i = 0; i < matchesPerRound; i++) {
      const teamA = workingTeams[i];
      const teamB = workingTeams[n - 1 - i];

      // Skip match if it involves the ghost team
      if (teamA.id !== 'ghost' && teamB.id !== 'ghost') {
        // Alternate home/away based on round/index to balance it slightly
        const isHome = i === 0 ? r % 2 === 0 : true; 
        
        matches.push({
          id: generateUniqueId(),
          round: r + 1,
          leg: 1,
          homeTeamId: teamA.id, 
          awayTeamId: teamB.id,
          homeScore: null,
          awayScore: null,
          played: false,
          category: category
        });
      }
    }

    // Rotate array
    const fixed = workingTeams[0];
    const tail = workingTeams.slice(1);
    const last = tail.pop();
    if (last) tail.unshift(last);
    workingTeams = [fixed, ...tail];
  }

  // 2nd Leg
  const secondLegMatches: Match[] = matches.map(m => ({
    id: generateUniqueId(),
    round: m.round + rounds, 
    leg: 2,
    homeTeamId: m.awayTeamId,
    awayTeamId: m.homeTeamId,
    homeScore: null,
    awayScore: null,
    played: false,
    category: category
  }));

  return [...matches, ...secondLegMatches];
};

/**
 * Calculates the League Table based on played matches
 */
export const calculateStandings = (teams: Team[], matches: Match[]): Standing[] => {
  // Initialize standings map
  const stats: Record<string, Standing> = {};

  teams.forEach(team => {
    stats[team.id] = {
      teamId: team.id,
      teamName: team.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      points: 0
    };
  });

  matches.forEach(match => {
    if (match.played && match.homeScore !== null && match.awayScore !== null) {
      const homeStats = stats[match.homeTeamId];
      const awayStats = stats[match.awayTeamId];

      if (homeStats && awayStats) {
        // Update Played
        homeStats.played += 1;
        awayStats.played += 1;

        // Update Goals
        homeStats.gf += match.homeScore;
        homeStats.ga += match.awayScore;
        homeStats.gd = homeStats.gf - homeStats.ga;

        awayStats.gf += match.awayScore;
        awayStats.ga += match.homeScore;
        awayStats.gd = awayStats.gf - awayStats.ga;

        // Update W/D/L and Points
        if (match.homeScore > match.awayScore) {
          homeStats.won += 1;
          homeStats.points += 3;
          awayStats.lost += 1;
        } else if (match.homeScore < match.awayScore) {
          awayStats.won += 1;
          homeStats.lost += 1;
          awayStats.points += 3;
        } else {
          homeStats.drawn += 1;
          homeStats.points += 1;
          awayStats.drawn += 1;
          awayStats.points += 1;
        }
      }
    }
  });

  // Convert to array and Sort
  // PTS -> GD -> GF
  return Object.values(stats).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    return b.gf - a.gf;
  });
};