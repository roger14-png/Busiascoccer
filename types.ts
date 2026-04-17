export interface Team {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  addedAt: number;
}

export type Category = 'BOYS' | 'GIRLS';

export interface Match {
  id: string;
  round: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  played: boolean;
  leg: 1 | 2;
  category: Category;
}

export interface Standing {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

export interface AppState {
  teams: Team[];
  matches: Match[];
  standings: Standing[];
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  TEAMS = 'TEAMS',
  FIXTURES = 'FIXTURES',
  RESULTS = 'RESULTS',
  STANDINGS = 'STANDINGS',
  AI_ASSISTANT = 'AI_ASSISTANT',
  SETTINGS = 'SETTINGS'
}