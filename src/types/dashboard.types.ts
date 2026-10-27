import type { Team } from './auth.types';
import type { Crew, WantedSummary } from './bounty.types';

export interface WantedStatusCounts {
  AT_LARGE: number;
  CAPTURED: number;
  MISSING: number;
}

export interface WantedFruitCounts {
  PARAMECIA: number;
  ZOAN: number;
  LOGIA: number;
  NONE: number;
}

export interface DashboardWantedStats {
  total: number;
  totalBounty: number;
  averageBounty: number;
  byStatus: WantedStatusCounts;
  byFruit: WantedFruitCounts;
}

export interface DashboardCrewsStats {
  total: number;
  mostWanted: Crew | null;
}

export interface DashboardSummary {
  team: Team;
  wanted: DashboardWantedStats;
  crews: DashboardCrewsStats;
  topBounties: WantedSummary[];
  generatedAt: string;
}
