CREATE TYPE "ChatConversationType" AS ENUM ('DIRECT', 'GROUP');
CREATE TYPE "ChatMemberRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');
CREATE TYPE "ChatMessageType" AS ENUM ('TEXT', 'IMAGE', 'FILE', 'SYSTEM');
CREATE TYPE "ChatTheme" AS ENUM ('DEFAULT', 'OCEAN', 'FOREST', 'SUNSET', 'LAVENDER', 'MIDNIGHT');

CREATE TABLE "ChatConversation" (
  "id" UUID NOT NULL,
  "companyId" UUID NOT NULL,
  "createdByEmployeeId" UUID NOT NULL,
  "type" "ChatConversationType" NOT NULL,
  "directKey" TEXT,
  "title" TEXT,
  "icon" TEXT,
  "theme" "ChatTheme" NOT NULL DEFAULT 'DEFAULT',
  "lastMessageAt" TIMESTAMP(3),
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ChatConversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChatMember" (
  "id" UUID NOT NULL,
  "companyId" UUID NOT NULL,
  "conversationId" UUID NOT NULL,
  "employeeId" UUID NOT NULL,
  "role" "ChatMemberRole" NOT NULL DEFAULT 'MEMBER',
  "lastReadAt" TIMESTAMP(3),
  "mutedUntil" TIMESTAMP(3),
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "leftAt" TIMESTAMP(3),
  CONSTRAINT "ChatMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChatMessage" (
  "id" UUID NOT NULL,
  "companyId" UUID NOT NULL,
  "conversationId" UUID NOT NULL,
  "senderEmployeeId" UUID NOT NULL,
  "replyToId" UUID,
  "type" "ChatMessageType" NOT NULL DEFAULT 'TEXT',
  "content" TEXT,
  "attachmentUrl" TEXT,
  "attachmentName" TEXT,
  "editedAt" TIMESTAMP(3),
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChatReaction" (
  "id" UUID NOT NULL,
  "companyId" UUID NOT NULL,
  "messageId" UUID NOT NULL,
  "employeeId" UUID NOT NULL,
  "emoji" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ChatReaction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ChatConversation_companyId_directKey_key" ON "ChatConversation"("companyId", "directKey");
CREATE INDEX "ChatConversation_companyId_type_lastMessageAt_idx" ON "ChatConversation"("companyId", "type", "lastMessageAt");
CREATE INDEX "ChatConversation_companyId_deletedAt_idx" ON "ChatConversation"("companyId", "deletedAt");
CREATE UNIQUE INDEX "ChatMember_conversationId_employeeId_key" ON "ChatMember"("conversationId", "employeeId");
CREATE INDEX "ChatMember_companyId_employeeId_leftAt_idx" ON "ChatMember"("companyId", "employeeId", "leftAt");
CREATE INDEX "ChatMember_conversationId_leftAt_idx" ON "ChatMember"("conversationId", "leftAt");
CREATE INDEX "ChatMessage_companyId_conversationId_createdAt_idx" ON "ChatMessage"("companyId", "conversationId", "createdAt");
CREATE INDEX "ChatMessage_senderEmployeeId_createdAt_idx" ON "ChatMessage"("senderEmployeeId", "createdAt");
CREATE INDEX "ChatMessage_replyToId_idx" ON "ChatMessage"("replyToId");
CREATE UNIQUE INDEX "ChatReaction_messageId_employeeId_emoji_key" ON "ChatReaction"("messageId", "employeeId", "emoji");
CREATE INDEX "ChatReaction_companyId_messageId_idx" ON "ChatReaction"("companyId", "messageId");
CREATE INDEX "ChatReaction_employeeId_createdAt_idx" ON "ChatReaction"("employeeId", "createdAt");

ALTER TABLE "ChatConversation" ADD CONSTRAINT "ChatConversation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatConversation" ADD CONSTRAINT "ChatConversation_createdByEmployeeId_fkey" FOREIGN KEY ("createdByEmployeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ChatMember" ADD CONSTRAINT "ChatMember_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatMember" ADD CONSTRAINT "ChatMember_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ChatConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatMember" ADD CONSTRAINT "ChatMember_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ChatConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderEmployeeId_fkey" FOREIGN KEY ("senderEmployeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "ChatMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ChatReaction" ADD CONSTRAINT "ChatReaction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatReaction" ADD CONSTRAINT "ChatReaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatReaction" ADD CONSTRAINT "ChatReaction_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
