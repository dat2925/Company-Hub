import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ChatConversationType, ChatMemberRole, ChatMessageType, Prisma } from '@prisma/client';
import { pageMeta } from '../common/pagination.dto';
import { AuthUser } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';
import { directConversationKey, uniqueEmployeeIds } from './chat-utils';
import { AddChatMembersDto, ConversationQueryDto, CreateDirectConversationDto, CreateGroupConversationDto, MarkConversationReadDto, MessageQueryDto, MuteConversationDto, SearchMessagesDto, SendChatMessageDto, ToggleReactionDto, TransferChatOwnershipDto, UpdateChatMemberRoleDto, UpdateChatMessageDto, UpdateConversationDto } from './dto/chat.dto';

const employeeSelect = {
  id: true,
  employeeCode: true,
  fullName: true,
  department: { select: { id: true, name: true } },
  position: { select: { id: true, name: true } },
} as const;

const memberInclude = { employee: { select: employeeSelect } } as const;
const messageInclude = {
  sender: { select: employeeSelect },
  replyTo: { select: { id: true, content: true, type: true, deletedAt: true, sender: { select: employeeSelect } } },
  reactions: { include: { employee: { select: employeeSelect } }, orderBy: { createdAt: 'asc' as const } },
} as const;
const conversationInclude = {
  members: { where: { leftAt: null }, include: memberInclude, orderBy: { joinedAt: 'asc' as const } },
  messages: { where: { deletedAt: null }, include: messageInclude, orderBy: { createdAt: 'desc' as const }, take: 1 },
} as const;
const paging = (query: { page: number; pageSize: number }) => ({ skip: (query.page - 1) * query.pageSize, take: query.pageSize });

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  private async currentEmployee(user: AuthUser) {
    const employee = await this.prisma.employee.findFirst({ where: { companyId: user.companyId!, userId: user.id }, select: employeeSelect });
    if (!employee) throw new ForbiddenException('Your account is not linked to an employee');
    return employee;
  }

  private async access(user: AuthUser, conversationId: string) {
    const employee = await this.currentEmployee(user);
    const conversation = await this.prisma.chatConversation.findFirst({
      where: { id: conversationId, companyId: user.companyId!, deletedAt: null, members: { some: { employeeId: employee.id, leftAt: null } } },
      include: conversationInclude,
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    const membership = conversation.members.find((member) => member.employeeId === employee.id);
    if (!membership) throw new ForbiddenException('You are not a conversation member');
    return { employee, conversation, membership };
  }

  private ensureGroupManager(conversation: { type: ChatConversationType }, role: ChatMemberRole) {
    if (conversation.type !== ChatConversationType.GROUP) throw new BadRequestException('This operation is only available for group chats');
    if (role !== ChatMemberRole.OWNER && role !== ChatMemberRole.ADMIN) throw new ForbiddenException('Only group owners and admins can do this');
  }

  private async createSystemMessage(companyId: string, conversationId: string, senderEmployeeId: string, content: string) {
    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.chatMessage.create({ data: { companyId, conversationId, senderEmployeeId, type: ChatMessageType.SYSTEM, content } }),
      this.prisma.chatConversation.update({ where: { id: conversationId }, data: { lastMessageAt: now } }),
    ]);
  }

  async conversations(user: AuthUser, query: ConversationQueryDto) {
    const employee = await this.currentEmployee(user);
    const where: Prisma.ChatConversationWhereInput = {
      companyId: user.companyId!,
      deletedAt: null,
      members: { some: { employeeId: employee.id, leftAt: null } },
      ...(query.type && { type: query.type }),
      ...(query.search && { OR: [{ title: { contains: query.search, mode: 'insensitive' } }, { members: { some: { employee: { fullName: { contains: query.search, mode: 'insensitive' } }, leftAt: null } } }] }),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.chatConversation.findMany({ where, ...paging(query), include: conversationInclude, orderBy: [{ lastMessageAt: 'desc' }, { createdAt: 'desc' }] }),
      this.prisma.chatConversation.count({ where }),
    ]);
    const data = await Promise.all(rows.map(async (conversation) => {
      const membership = conversation.members.find((member) => member.employeeId === employee.id)!;
      const unreadCount = await this.prisma.chatMessage.count({
        where: { conversationId: conversation.id, deletedAt: null, senderEmployeeId: { not: employee.id }, createdAt: { gt: membership.lastReadAt ?? membership.joinedAt } },
      });
      return { ...conversation, unreadCount };
    }));
    return { data, meta: pageMeta(query.page, query.pageSize, total) };
  }

  async conversation(user: AuthUser, id: string) {
    const result = await this.access(user, id);
    const unreadCount = await this.prisma.chatMessage.count({ where: { conversationId: id, deletedAt: null, senderEmployeeId: { not: result.employee.id }, createdAt: { gt: result.membership.lastReadAt ?? result.membership.joinedAt } } });
    return { ...result.conversation, unreadCount };
  }

  async unreadCount(user: AuthUser) {
    const employee = await this.currentEmployee(user);
    const memberships = await this.prisma.chatMember.findMany({
      where: { companyId: user.companyId!, employeeId: employee.id, leftAt: null, conversation: { deletedAt: null } },
      select: { conversationId: true, joinedAt: true, lastReadAt: true },
    });
    const counts = await Promise.all(memberships.map((membership) => this.prisma.chatMessage.count({
      where: { conversationId: membership.conversationId, deletedAt: null, senderEmployeeId: { not: employee.id }, createdAt: { gt: membership.lastReadAt ?? membership.joinedAt } },
    })));
    return { count: counts.reduce((sum, count) => sum + count, 0) };
  }

  async createDirect(user: AuthUser, dto: CreateDirectConversationDto) {
    const employee = await this.currentEmployee(user);
    if (employee.id === dto.employeeId) throw new BadRequestException('You cannot create a direct chat with yourself');
    const target = await this.prisma.employee.findFirst({ where: { id: dto.employeeId, companyId: user.companyId!, status: 'ACTIVE' }, select: employeeSelect });
    if (!target) throw new BadRequestException('Invalid chat recipient');
    const directKey = directConversationKey(employee.id, target.id);
    const existing = await this.prisma.chatConversation.findUnique({ where: { companyId_directKey: { companyId: user.companyId!, directKey } }, include: conversationInclude });
    if (existing) return existing;
    try {
      return await this.prisma.chatConversation.create({
        data: { companyId: user.companyId!, createdByEmployeeId: employee.id, type: ChatConversationType.DIRECT, directKey, icon: dto.icon, theme: dto.theme, members: { create: [{ companyId: user.companyId!, employeeId: employee.id, role: ChatMemberRole.OWNER }, { companyId: user.companyId!, employeeId: target.id, role: ChatMemberRole.MEMBER }] } },
        include: conversationInclude,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return this.prisma.chatConversation.findUnique({ where: { companyId_directKey: { companyId: user.companyId!, directKey } }, include: conversationInclude });
      throw error;
    }
  }

  async createGroup(user: AuthUser, dto: CreateGroupConversationDto) {
    const employee = await this.currentEmployee(user);
    const memberIds = uniqueEmployeeIds(dto.memberIds).filter((id) => id !== employee.id);
    const validMembers = await this.prisma.employee.findMany({ where: { companyId: user.companyId!, status: 'ACTIVE', id: { in: memberIds } }, select: { id: true } });
    if (validMembers.length !== memberIds.length) throw new BadRequestException('One or more group members are invalid');
    const group = await this.prisma.chatConversation.create({
      data: { companyId: user.companyId!, createdByEmployeeId: employee.id, type: ChatConversationType.GROUP, title: dto.title.trim(), icon: dto.icon, theme: dto.theme, members: { create: [{ companyId: user.companyId!, employeeId: employee.id, role: ChatMemberRole.OWNER }, ...memberIds.map((employeeId) => ({ companyId: user.companyId!, employeeId, role: ChatMemberRole.MEMBER }))] } },
      include: conversationInclude,
    });
    await this.createSystemMessage(user.companyId!, group.id, employee.id, `${employee.fullName} created the group`);
    return this.conversation(user, group.id);
  }

  async updateConversation(user: AuthUser, id: string, dto: UpdateConversationDto) {
    const { conversation, membership } = await this.access(user, id);
    const data = { ...dto };
    if (conversation.type === ChatConversationType.GROUP) this.ensureGroupManager(conversation, membership.role);
    else delete data.title;
    return this.prisma.chatConversation.update({ where: { id }, data, include: conversationInclude });
  }

  async deleteGroup(user: AuthUser, id: string) {
    const { conversation, membership } = await this.access(user, id);
    if (conversation.type !== ChatConversationType.GROUP) throw new BadRequestException('Direct chats cannot be deleted');
    if (membership.role !== ChatMemberRole.OWNER) throw new ForbiddenException('Only the group owner can delete this group');
    await this.prisma.chatConversation.update({ where: { id }, data: { deletedAt: new Date() } });
    return { deleted: true };
  }

  async addMembers(user: AuthUser, id: string, dto: AddChatMembersDto) {
    const { employee, conversation, membership } = await this.access(user, id);
    this.ensureGroupManager(conversation, membership.role);
    const employeeIds = uniqueEmployeeIds(dto.employeeIds).filter((employeeId) => !conversation.members.some((member) => member.employeeId === employeeId));
    const valid = await this.prisma.employee.findMany({ where: { companyId: user.companyId!, status: 'ACTIVE', id: { in: employeeIds } }, select: { id: true } });
    if (valid.length !== employeeIds.length) throw new BadRequestException('One or more employees are invalid');
    await this.prisma.$transaction(employeeIds.map((employeeId) => this.prisma.chatMember.upsert({ where: { conversationId_employeeId: { conversationId: id, employeeId } }, create: { companyId: user.companyId!, conversationId: id, employeeId }, update: { leftAt: null, joinedAt: new Date(), role: ChatMemberRole.MEMBER, lastReadAt: null } })));
    if (employeeIds.length) await this.createSystemMessage(user.companyId!, id, employee.id, `${employee.fullName} added ${employeeIds.length} member(s)`);
    return this.conversation(user, id);
  }

  async removeMember(user: AuthUser, id: string, employeeId: string) {
    const { employee, conversation, membership } = await this.access(user, id);
    this.ensureGroupManager(conversation, membership.role);
    const target = conversation.members.find((member) => member.employeeId === employeeId);
    if (!target) throw new NotFoundException('Group member not found');
    if (target.role === ChatMemberRole.OWNER) throw new ConflictException('Transfer ownership before removing the owner');
    if (membership.role === ChatMemberRole.ADMIN && target.role === ChatMemberRole.ADMIN) throw new ForbiddenException('Admins cannot remove other admins');
    await this.prisma.chatMember.update({ where: { id: target.id }, data: { leftAt: new Date() } });
    await this.createSystemMessage(user.companyId!, id, employee.id, `${target.employee.fullName} was removed from the group`);
    return { removed: true };
  }

  async leaveGroup(user: AuthUser, id: string) {
    const { employee, conversation, membership } = await this.access(user, id);
    if (conversation.type !== ChatConversationType.GROUP) throw new BadRequestException('You cannot leave a direct chat');
    if (membership.role === ChatMemberRole.OWNER) throw new ConflictException('Transfer ownership before leaving the group');
    await this.prisma.chatMember.update({ where: { id: membership.id }, data: { leftAt: new Date() } });
    await this.createSystemMessage(user.companyId!, id, employee.id, `${employee.fullName} left the group`);
    return { left: true };
  }

  async updateMemberRole(user: AuthUser, id: string, employeeId: string, dto: UpdateChatMemberRoleDto) {
    const { conversation, membership } = await this.access(user, id);
    this.ensureGroupManager(conversation, membership.role);
    if (membership.role !== ChatMemberRole.OWNER) throw new ForbiddenException('Only the owner can change member roles');
    if (dto.role === ChatMemberRole.OWNER) throw new BadRequestException('Use ownership transfer instead');
    const target = conversation.members.find((member) => member.employeeId === employeeId);
    if (!target) throw new NotFoundException('Group member not found');
    if (target.role === ChatMemberRole.OWNER) throw new BadRequestException('The owner role cannot be changed directly');
    return this.prisma.chatMember.update({ where: { id: target.id }, data: { role: dto.role }, include: memberInclude });
  }

  async transferOwnership(user: AuthUser, id: string, dto: TransferChatOwnershipDto) {
    const { conversation, membership } = await this.access(user, id);
    this.ensureGroupManager(conversation, membership.role);
    if (membership.role !== ChatMemberRole.OWNER) throw new ForbiddenException('Only the owner can transfer ownership');
    const target = conversation.members.find((member) => member.employeeId === dto.employeeId);
    if (!target) throw new NotFoundException('Target member not found');
    if (target.id === membership.id) throw new BadRequestException('You already own this group');
    await this.prisma.$transaction([
      this.prisma.chatMember.update({ where: { id: membership.id }, data: { role: ChatMemberRole.ADMIN } }),
      this.prisma.chatMember.update({ where: { id: target.id }, data: { role: ChatMemberRole.OWNER } }),
    ]);
    return this.conversation(user, id);
  }

  async mute(user: AuthUser, id: string, dto: MuteConversationDto) {
    const { membership } = await this.access(user, id);
    const mutedUntil = dto.minutes === 0 ? null : new Date(Date.now() + dto.minutes * 60_000);
    return this.prisma.chatMember.update({ where: { id: membership.id }, data: { mutedUntil }, include: memberInclude });
  }

  async messages(user: AuthUser, conversationId: string, query: MessageQueryDto) {
    await this.access(user, conversationId);
    const where: Prisma.ChatMessageWhereInput = { companyId: user.companyId!, conversationId, ...(query.before && { createdAt: { lt: new Date(query.before) } }), ...(query.search && { content: { contains: query.search, mode: 'insensitive' } }) };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.chatMessage.findMany({ where, ...paging(query), include: messageInclude, orderBy: { createdAt: 'desc' } }),
      this.prisma.chatMessage.count({ where }),
    ]);
    return { data, meta: pageMeta(query.page, query.pageSize, total) };
  }

  async sendMessage(user: AuthUser, conversationId: string, dto: SendChatMessageDto) {
    const { employee } = await this.access(user, conversationId);
    const type = dto.type ?? ChatMessageType.TEXT;
    if (type === ChatMessageType.SYSTEM) throw new BadRequestException('System messages cannot be sent manually');
    if (type === ChatMessageType.TEXT && !dto.content?.trim()) throw new BadRequestException('Text messages require content');
    if ((type === ChatMessageType.IMAGE || type === ChatMessageType.FILE) && !dto.attachmentUrl) throw new BadRequestException('Attachment messages require an attachment URL');
    if (dto.replyToId) {
      const reply = await this.prisma.chatMessage.findFirst({ where: { id: dto.replyToId, conversationId, companyId: user.companyId!, deletedAt: null }, select: { id: true } });
      if (!reply) throw new BadRequestException('Invalid reply message');
    }
    const now = new Date();
    const [message] = await this.prisma.$transaction([
      this.prisma.chatMessage.create({ data: { ...dto, content: dto.content?.trim(), type, companyId: user.companyId!, conversationId, senderEmployeeId: employee.id }, include: messageInclude }),
      this.prisma.chatConversation.update({ where: { id: conversationId }, data: { lastMessageAt: now } }),
      this.prisma.chatMember.updateMany({ where: { conversationId, employeeId: employee.id }, data: { lastReadAt: now } }),
    ]);
    return message;
  }

  private async editableMessage(user: AuthUser, id: string) {
    const employee = await this.currentEmployee(user);
    const message = await this.prisma.chatMessage.findFirst({ where: { id, companyId: user.companyId!, senderEmployeeId: employee.id, deletedAt: null } });
    if (!message) throw new NotFoundException('Editable message not found');
    await this.access(user, message.conversationId);
    if (message.type !== ChatMessageType.TEXT) throw new BadRequestException('Only text messages can be edited');
    return message;
  }

  async updateMessage(user: AuthUser, id: string, dto: UpdateChatMessageDto) {
    await this.editableMessage(user, id);
    return this.prisma.chatMessage.update({ where: { id }, data: { content: dto.content.trim(), editedAt: new Date() }, include: messageInclude });
  }

  async deleteMessage(user: AuthUser, id: string) {
    const employee = await this.currentEmployee(user);
    const message = await this.prisma.chatMessage.findFirst({ where: { id, companyId: user.companyId!, deletedAt: null } });
    if (!message) throw new NotFoundException('Message not found');
    const { conversation, membership } = await this.access(user, message.conversationId);
    const canModerate = conversation.type === ChatConversationType.GROUP && (membership.role === ChatMemberRole.OWNER || membership.role === ChatMemberRole.ADMIN);
    if (message.senderEmployeeId !== employee.id && !canModerate) throw new ForbiddenException('You cannot delete this message');
    return this.prisma.chatMessage.update({ where: { id }, data: { content: null, attachmentUrl: null, attachmentName: null, deletedAt: new Date() }, include: messageInclude });
  }

  async toggleReaction(user: AuthUser, messageId: string, dto: ToggleReactionDto) {
    const employee = await this.currentEmployee(user);
    const emoji = dto.emoji.trim();
    const message = await this.prisma.chatMessage.findFirst({ where: { id: messageId, companyId: user.companyId!, deletedAt: null, conversation: { deletedAt: null, members: { some: { employeeId: employee.id, leftAt: null } } } }, select: { id: true } });
    if (!message) throw new NotFoundException('Message not found');
    const existing = await this.prisma.chatReaction.findUnique({ where: { messageId_employeeId_emoji: { messageId, employeeId: employee.id, emoji } } });
    if (existing) {
      await this.prisma.chatReaction.delete({ where: { id: existing.id } });
      return { active: false, emoji };
    }
    const reaction = await this.prisma.chatReaction.create({ data: { companyId: user.companyId!, messageId, employeeId: employee.id, emoji }, include: { employee: { select: employeeSelect } } });
    return { active: true, emoji, reaction };
  }

  async markRead(user: AuthUser, conversationId: string, dto: MarkConversationReadDto) {
    const { membership } = await this.access(user, conversationId);
    let readAt = new Date();
    if (dto.messageId) {
      const message = await this.prisma.chatMessage.findFirst({ where: { id: dto.messageId, conversationId, companyId: user.companyId! }, select: { createdAt: true } });
      if (!message) throw new BadRequestException('Invalid read message');
      readAt = message.createdAt;
    }
    if (membership.lastReadAt && membership.lastReadAt > readAt) readAt = membership.lastReadAt;
    await this.prisma.chatMember.update({ where: { id: membership.id }, data: { lastReadAt: readAt } });
    return { readAt };
  }

  async searchMessages(user: AuthUser, query: SearchMessagesDto) {
    const employee = await this.currentEmployee(user);
    const where: Prisma.ChatMessageWhereInput = { companyId: user.companyId!, deletedAt: null, content: { contains: query.q, mode: 'insensitive' }, conversation: { deletedAt: null, members: { some: { employeeId: employee.id, leftAt: null } } } };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.chatMessage.findMany({ where, ...paging(query), include: { ...messageInclude, conversation: { select: { id: true, type: true, title: true, icon: true, theme: true } } }, orderBy: { createdAt: 'desc' } }),
      this.prisma.chatMessage.count({ where }),
    ]);
    return { data, meta: pageMeta(query.page, query.pageSize, total) };
  }
}
