CREATE TYPE "ArcadeChallengeType" AS ENUM ('TRIVIA', 'POLL', 'CAPTION', 'GUESS_COLLEAGUE');
CREATE TYPE "ArcadeContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED');
CREATE TYPE "ArcadeSubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "ArcadeRoomStatus" AS ENUM ('WAITING', 'ACTIVE', 'FINISHED', 'CANCELLED');
CREATE TYPE "ArcadeRoomMode" AS ENUM ('QUICK_QUIZ', 'ICEBREAKER');

CREATE TABLE "ArcadeChallenge" (
  "id" UUID NOT NULL,
  "companyId" UUID NOT NULL,
  "createdById" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "type" "ArcadeChallengeType" NOT NULL,
  "question" TEXT NOT NULL,
  "options" JSONB,
  "correctAnswer" TEXT,
  "points" INTEGER NOT NULL DEFAULT 10,
  "status" "ArcadeContentStatus" NOT NULL DEFAULT 'DRAFT',
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ArcadeChallenge_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ArcadePlay" (
  "id" UUID NOT NULL,
  "companyId" UUID NOT NULL,
  "challengeId" UUID NOT NULL,
  "employeeId" UUID NOT NULL,
  "answer" TEXT NOT NULL,
  "isCorrect" BOOLEAN,
  "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
  "durationMs" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ArcadePlay_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ArcadeMission" (
  "id" UUID NOT NULL,
  "companyId" UUID NOT NULL,
  "createdById" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "points" INTEGER NOT NULL DEFAULT 20,
  "requiresProof" BOOLEAN NOT NULL DEFAULT true,
  "status" "ArcadeContentStatus" NOT NULL DEFAULT 'DRAFT',
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ArcadeMission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ArcadeMissionSubmission" (
  "id" UUID NOT NULL,
  "companyId" UUID NOT NULL,
  "missionId" UUID NOT NULL,
  "employeeId" UUID NOT NULL,
  "proofText" TEXT,
  "proofUrl" TEXT,
  "status" "ArcadeSubmissionStatus" NOT NULL DEFAULT 'PENDING',
  "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
  "managerComment" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ArcadeMissionSubmission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ArcadeRoom" (
  "id" UUID NOT NULL,
  "companyId" UUID NOT NULL,
  "code" TEXT NOT NULL,
  "mode" "ArcadeRoomMode" NOT NULL,
  "status" "ArcadeRoomStatus" NOT NULL DEFAULT 'WAITING',
  "maxPlayers" INTEGER NOT NULL DEFAULT 4,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "startedAt" TIMESTAMP(3),
  "finishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ArcadeRoom_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ArcadeRoomMember" (
  "id" UUID NOT NULL,
  "roomId" UUID NOT NULL,
  "employeeId" UUID NOT NULL,
  "isReady" BOOLEAN NOT NULL DEFAULT false,
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "leftAt" TIMESTAMP(3),
  CONSTRAINT "ArcadeRoomMember_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ArcadeChallenge_companyId_status_startsAt_endsAt_idx" ON "ArcadeChallenge"("companyId", "status", "startsAt", "endsAt");
CREATE INDEX "ArcadeChallenge_companyId_type_idx" ON "ArcadeChallenge"("companyId", "type");
CREATE UNIQUE INDEX "ArcadePlay_challengeId_employeeId_key" ON "ArcadePlay"("challengeId", "employeeId");
CREATE INDEX "ArcadePlay_companyId_createdAt_idx" ON "ArcadePlay"("companyId", "createdAt");
CREATE INDEX "ArcadePlay_employeeId_createdAt_idx" ON "ArcadePlay"("employeeId", "createdAt");
CREATE INDEX "ArcadeMission_companyId_status_startsAt_endsAt_idx" ON "ArcadeMission"("companyId", "status", "startsAt", "endsAt");
CREATE UNIQUE INDEX "ArcadeMissionSubmission_missionId_employeeId_key" ON "ArcadeMissionSubmission"("missionId", "employeeId");
CREATE INDEX "ArcadeMissionSubmission_companyId_status_createdAt_idx" ON "ArcadeMissionSubmission"("companyId", "status", "createdAt");
CREATE INDEX "ArcadeMissionSubmission_employeeId_createdAt_idx" ON "ArcadeMissionSubmission"("employeeId", "createdAt");
CREATE UNIQUE INDEX "ArcadeRoom_companyId_code_key" ON "ArcadeRoom"("companyId", "code");
CREATE INDEX "ArcadeRoom_companyId_status_expiresAt_idx" ON "ArcadeRoom"("companyId", "status", "expiresAt");
CREATE UNIQUE INDEX "ArcadeRoomMember_roomId_employeeId_key" ON "ArcadeRoomMember"("roomId", "employeeId");
CREATE INDEX "ArcadeRoomMember_employeeId_leftAt_idx" ON "ArcadeRoomMember"("employeeId", "leftAt");

ALTER TABLE "ArcadeChallenge" ADD CONSTRAINT "ArcadeChallenge_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ArcadeChallenge" ADD CONSTRAINT "ArcadeChallenge_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ArcadePlay" ADD CONSTRAINT "ArcadePlay_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ArcadePlay" ADD CONSTRAINT "ArcadePlay_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "ArcadeChallenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ArcadePlay" ADD CONSTRAINT "ArcadePlay_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ArcadeMission" ADD CONSTRAINT "ArcadeMission_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ArcadeMission" ADD CONSTRAINT "ArcadeMission_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ArcadeMissionSubmission" ADD CONSTRAINT "ArcadeMissionSubmission_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ArcadeMissionSubmission" ADD CONSTRAINT "ArcadeMissionSubmission_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "ArcadeMission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ArcadeMissionSubmission" ADD CONSTRAINT "ArcadeMissionSubmission_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ArcadeRoom" ADD CONSTRAINT "ArcadeRoom_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ArcadeRoomMember" ADD CONSTRAINT "ArcadeRoomMember_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ArcadeRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ArcadeRoomMember" ADD CONSTRAINT "ArcadeRoomMember_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
