import { GoogleGenAI } from "@google/genai";
import { Standing, Match, Team, Category } from '../types';

let aiClient: GoogleGenAI | null = null;

// Initialize strictly with process.env.API_KEY
if (process.env.API_KEY) {
  aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export const analyzeLeague = async (standings: Standing[], matches: Match[], teams: Team[], category: Category) => {
  if (!aiClient) {
    throw new Error("Gemini API Key is missing. Please configure the environment.");
  }

  const topTeams = standings.slice(0, 3).map(t => t.teamName).join(', ');
  const recentMatches = matches
    .filter(m => m.played)
    .slice(-5)
    .map(m => {
        const home = teams.find(t => t.id === m.homeTeamId)?.name || 'Unknown';
        const away = teams.find(t => t.id === m.awayTeamId)?.name || 'Unknown';
        return `${home} ${m.homeScore}-${m.awayScore} ${away}`;
    })
    .join('; ');

  const prompt = `
    Act as a professional sports commentator. Analyze the current football league standings and recent form for the Busia Soccer ${category} League.
    
    Data:
    - League Category: ${category} (Boys/Girls)
    - League Leaderboard Top 3: ${topTeams}
    - Recent Results: ${recentMatches || "No matches played yet."}
    - Total Teams: ${standings.length}
    
    Task:
    Write a short, exciting 2-paragraph news summary about the current state of the ${category} league. 
    Highlight the title contenders and any surprising results. 
    If no matches have been played, hype up the upcoming season.
  `;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The commentary team is currently experiencing technical difficulties. Back to the studio!";
  }
};

export const predictMatch = async (homeTeam: Team, awayTeam: Team, standings: Standing[], category: Category) => {
  if (!aiClient) {
    throw new Error("Gemini API Key is missing.");
  }

  const homeStats = standings.find(s => s.teamId === homeTeam.id);
  const awayStats = standings.find(s => s.teamId === awayTeam.id);

  const prompt = `
    Predict the outcome of a match between ${homeTeam.name} (Home) and ${awayTeam.name} (Away) in the Busia Soccer ${category} League.
    
    Stats:
    - ${homeTeam.name}: Played ${homeStats?.played || 0}, Points ${homeStats?.points || 0}, GD ${homeStats?.gd || 0}
    - ${awayTeam.name}: Played ${awayStats?.played || 0}, Points ${awayStats?.points || 0}, GD ${awayStats?.gd || 0}
    
    Provide a percentage chance of winning for each side and a predicted scoreline. Keep it brief.
  `;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "Prediction unavailable.";
  }
};