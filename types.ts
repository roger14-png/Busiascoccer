export enum ViewState {
  DASHBOARD = 'dashboard',
  TEAMS = 'teams',
  FIXTURES = 'fixtures',
  RESULTS = 'results',
  STANDINGS = 'standings',
  SETTINGS = 'settings',
  AI_ASSISTANT = 'ai_assistant'
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  addedAt: number;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  round: number;
  leg: number;
  category: Category;
  played?: boolean;
  homeScore?: number;
  awayScore?: number;
}

export type Category = 'BOYS' | 'GIRLS';

export type ViewCategory = Category | 'ALL';

export interface User {
  user: string;
  pass: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: string;
  isLoading: boolean;
}
