export type ChatConversationType = 'DIRECT' | 'GROUP';
export type ChatMemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export type ChatMessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
export type ChatTheme = 'DEFAULT' | 'OCEAN' | 'FOREST' | 'SUNSET' | 'LAVENDER' | 'MIDNIGHT';

export type EmployeeBrief = {
  id: string;
  employeeCode: string;
  fullName: string;
  department: { id: string; name: string } | null;
  position: { id: string; name: string } | null;
};

export type ChatReaction = {
  id: string;
  employeeId: string;
  emoji: string;
  createdAt: string;
  employee: EmployeeBrief;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderEmployeeId: string;
  replyToId: string | null;
  type: ChatMessageType;
  content: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  editedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  sender: EmployeeBrief;
  replyTo: null | {
    id: string;
    content: string | null;
    type: ChatMessageType;
    deletedAt: string | null;
    sender: EmployeeBrief;
  };
  reactions: ChatReaction[];
};

export type ChatMember = {
  id: string;
  employeeId: string;
  role: ChatMemberRole;
  lastReadAt: string | null;
  mutedUntil: string | null;
  joinedAt: string;
  leftAt: string | null;
  employee: EmployeeBrief;
};

export type ChatConversation = {
  id: string;
  type: ChatConversationType;
  title: string | null;
  icon: string | null;
  theme: ChatTheme;
  lastMessageAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  members: ChatMember[];
  messages: ChatMessage[];
  unreadCount: number;
};
