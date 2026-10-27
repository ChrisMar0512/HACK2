export type LogPoseStatus = 'LOCKED' | 'UNLOCKED';

export interface LogPose {
  status: LogPoseStatus;
  grandLineUnlocked: boolean;
  unlockedAt: string | null;
  message: string;
}
