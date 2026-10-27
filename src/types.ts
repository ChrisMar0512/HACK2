export type WantedStatus = 'AT_LARGE' | 'CAPTURED' | 'MISSING'
export type FruitType = 'PARAMECIA' | 'ZOAN' | 'LOGIA'
export type CrewRole =
  | 'CAPTAIN'
  | 'FIRST_MATE'
  | 'NAVIGATOR'
  | 'SNIPER'
  | 'COOK'
  | 'DOCTOR'
  | 'SHIPWRIGHT'
  | 'MUSICIAN'
  | 'ARCHAEOLOGIST'
  | 'HELMSMAN'
  | 'FIGHTER'
export type NewsType =
  | 'BOUNTY_UPDATE'
  | 'BATTLE'
  | 'MARINE_OPERATION'
  | 'WORLD_GOVERNMENT'
  | 'DISCOVERY'
export type NewsPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type NewsStatus = 'RUMOR' | 'CONFIRMED' | 'DEBUNKED'

export interface User {
  id: string
  name: string
  email: string
}

export interface Team {
  code: string
  name: string
}

export interface LoginResponse {
  token: string
  tokenType: 'Bearer'
  expiresAt: string
  user: User
  team: Team
}

export interface MeResponse {
  user: User
  team: Team
  expiresAt: string
}

export interface CrewRef {
  id: string
  name: string
}

export interface Crew extends CrewRef {
  shipName: string
  jollyRogerColor: string
  memberCount: number
  totalBounty: number
}

export interface DevilFruit {
  name: string
  type: FruitType
}

export interface WantedSummary {
  id: string
  name: string
  epithet: string
  bounty: number
  status: WantedStatus
  crew: CrewRef
  role: CrewRole
  devilFruit: DevilFruit | null
  threatLevel: number
  lastSeenIsland: string
  updatedAt: string
}

export interface WantedDetail extends WantedSummary {
  age: number
  heightCm: number
  bio: string
  lastSeen: { island: string; seenAt: string }
  bountyHistory: Array<{ amount: number; issuedAt: string }>
}

export interface WantedPage {
  content: WantedSummary[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}

export interface DashboardSummary {
  team: Team
  wanted: {
    total: number
    totalBounty: number
    averageBounty: number
    byStatus: Record<WantedStatus, number>
    byFruit: Record<FruitType | 'NONE', number>
  }
  crews: { total: number; mostWanted: Crew | null }
  topBounties: WantedSummary[]
  generatedAt: string
}

export interface LogPose {
  status: 'LOCKED' | 'UNLOCKED'
  grandLineUnlocked: boolean
  unlockedAt: string | null
  message: string
}

export interface NewsItem {
  id: string
  type: NewsType
  priority: NewsPriority
  status: NewsStatus
  title: string
  summary: string
  source: string
  island: string
  relatedWanted: { id: string; name: string } | null
  publishedAt: string
  updatedAt: string
  verifiedAt: string | null
}

export interface NewsDetail extends NewsItem {
  body: string[]
}

export interface NewsFeed {
  items: NewsItem[]
  nextCursor: string | null
  hasMore: boolean
}

export interface Palette {
  background: string
  surface: string
  primary: string
  accent: string
  text: string
}

export interface SagaSummary {
  id: string
  order: number
  title: string
  subtitle: string
  synopsis: string
  stageCount: number
  totalDistanceNm: number
  firstIsland: string
  lastIsland: string
  palette: Palette
}

export interface StageMetric {
  key: 'distanceNm' | 'crewMorale' | 'bountyPool' | 'marineThreat'
  label: string
  value: number
  unit: string
}

export interface SagaStage {
  id: string
  order: number
  slug: string
  title: string
  narrative: string[]
  island: { id: string; name: string; x: number; y: number }
  palette: Palette
  metrics: StageMetric[]
}

export interface SagaStory {
  saga: SagaSummary & { intro: string }
  map: { width: number; height: number }
  stages: SagaStage[]
}

export interface ApiErrorBody {
  status: number
  code: string
  message: string
  traceId: string
  details?: Array<{ field: string; message: string }>
  retryAfterSeconds?: number
  current?: NewsDetail
}
