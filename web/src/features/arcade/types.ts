export type ArcadeChallengeType = 'TRIVIA' | 'POLL' | 'CAPTION' | 'GUESS_COLLEAGUE';
export type ArcadeContentStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';
export type ArcadeSubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ArcadeRoomStatus = 'WAITING' | 'ACTIVE' | 'FINISHED' | 'CANCELLED';
export type ArcadeRoomMode = 'QUICK_QUIZ' | 'ICEBREAKER';
export type ArcadeLeaderboardPeriod = 'WEEKLY' | 'MONTHLY' | 'ALL_TIME';

export type EmployeeBrief = {
  id: string;
  employeeCode: string;
  fullName: string;
  department: { id: string; name: string } | null;
  position: { id: string; name: string } | null;
};

export type ArcadeBadge = 'FIRST_PLAY' | 'QUIZ_ROOKIE' | 'ARCADE_STAR' | 'STREAK_3' | 'MISSION_HERO';

export type ArcadeProfile = {
  employee: EmployeeBrief;
  totalPoints: number;
  weeklyPoints: number;
  playCount: number;
  approvedMissionCount: number;
  streak: number;
  badges: ArcadeBadge[];
};

export type ArcadePlay = {
  answer: string;
  durationMs?: number;
};

export type EmployeeChallenge = {
  id: string;
  title: string;
  description?: string;
  type: ArcadeChallengeType;
  question: string;
  options?: string[];
  points: number;
  status: ArcadeContentStatus;
  startsAt: string;
  endsAt: string;
  play: ArcadePlay | null;
  hasPlayed: boolean;
  isPlayable: boolean;
  correctAnswer?: never; // Explicitly absent for employees
};

export type ChallengeResult = {
  totalPlays: number;
  answers: { answer: string; count: number }[];
  ownPlay?: ArcadePlay;
  correctAnswer?: string;
};

export type EmployeeMission = {
  id: string;
  title: string;
  description?: string;
  points: number;
  requiresProof: boolean;
  status: ArcadeContentStatus;
  startsAt: string;
  endsAt: string;
  submissions: MissionSubmission[];
};

export type MissionSubmission = {
  id: string;
  employee: EmployeeBrief;
  missionId: string;
  proofText?: string;
  proofUrl?: string;
  status: ArcadeSubmissionStatus;
  managerComment?: string;
  createdAt: string;
};

export type LeaderboardItem = {
  rank: number;
  employee: EmployeeBrief;
  points: number;
};

export type ArcadeRoom = {
  id: string;
  code: string;
  mode: ArcadeRoomMode;
  status: ArcadeRoomStatus;
  maxPlayers: number;
  expiresAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  members: {
    id: string;
    employeeId: string;
    isReady: boolean;
    joinedAt: string;
    leftAt: string | null;
    employee: EmployeeBrief;
  }[];
};

export type ArcadeHomeResponse = {
  profile: ArcadeProfile;
  challenges: EmployeeChallenge[];
  missions: EmployeeMission[];
  leaderboard: LeaderboardItem[];
  room: ArcadeRoom | null;
};
