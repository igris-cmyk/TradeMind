-- Run: npx prisma migrate deploy  OR  npx prisma db push

CREATE TABLE IF NOT EXISTS "MilestoneUnlock" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MilestoneUnlock_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "MilestoneUnlock_userId_milestoneId_key" ON "MilestoneUnlock"("userId", "milestoneId");
CREATE INDEX IF NOT EXISTS "MilestoneUnlock_userId_idx" ON "MilestoneUnlock"("userId");

CREATE TABLE IF NOT EXISTS "DisciplineSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DisciplineSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "DisciplineSnapshot_userId_recordedAt_idx" ON "DisciplineSnapshot"("userId", "recordedAt");

CREATE TABLE IF NOT EXISTS "SessionRecap" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "summary" JSONB NOT NULL,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SessionRecap_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SessionRecap_userId_date_key" ON "SessionRecap"("userId", "date");
CREATE INDEX IF NOT EXISTS "SessionRecap_userId_idx" ON "SessionRecap"("userId");

ALTER TABLE "MilestoneUnlock" ADD CONSTRAINT "MilestoneUnlock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DisciplineSnapshot" ADD CONSTRAINT "DisciplineSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SessionRecap" ADD CONSTRAINT "SessionRecap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
