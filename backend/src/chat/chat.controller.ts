import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { AuthUser } from '../common/types';
import { ChatService } from './chat.service';
import { AddChatMembersDto, ConversationQueryDto, CreateDirectConversationDto, CreateGroupConversationDto, MarkConversationReadDto, MessageQueryDto, MuteConversationDto, SearchMessagesDto, SendChatMessageDto, ToggleReactionDto, TransferChatOwnershipDto, UpdateChatMemberRoleDto, UpdateChatMessageDto, UpdateConversationDto } from './dto/chat.dto';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.EMPLOYEE)
export class ChatController {
  constructor(private readonly service: ChatService) {}

  @Get('conversations') conversations(@CurrentUser() user: AuthUser, @Query() query: ConversationQueryDto) { return this.service.conversations(user, query); }
  @Get('unread-count') unreadCount(@CurrentUser() user: AuthUser) { return this.service.unreadCount(user); }
  @Post('conversations/direct') createDirect(@CurrentUser() user: AuthUser, @Body() dto: CreateDirectConversationDto) { return this.service.createDirect(user, dto); }
  @Post('conversations/group') createGroup(@CurrentUser() user: AuthUser, @Body() dto: CreateGroupConversationDto) { return this.service.createGroup(user, dto); }
  @Get('conversations/:id') conversation(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.conversation(user, id); }
  @Patch('conversations/:id') updateConversation(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateConversationDto) { return this.service.updateConversation(user, id, dto); }
  @Delete('conversations/:id') deleteGroup(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.deleteGroup(user, id); }
  @Post('conversations/:id/members') addMembers(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: AddChatMembersDto) { return this.service.addMembers(user, id, dto); }
  @Delete('conversations/:id/members/:employeeId') removeMember(@CurrentUser() user: AuthUser, @Param('id') id: string, @Param('employeeId') employeeId: string) { return this.service.removeMember(user, id, employeeId); }
  @Post('conversations/:id/leave') leaveGroup(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.leaveGroup(user, id); }
  @Patch('conversations/:id/members/:employeeId/role') updateMemberRole(@CurrentUser() user: AuthUser, @Param('id') id: string, @Param('employeeId') employeeId: string, @Body() dto: UpdateChatMemberRoleDto) { return this.service.updateMemberRole(user, id, employeeId, dto); }
  @Post('conversations/:id/transfer-ownership') transferOwnership(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: TransferChatOwnershipDto) { return this.service.transferOwnership(user, id, dto); }
  @Post('conversations/:id/mute') mute(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: MuteConversationDto) { return this.service.mute(user, id, dto); }

  @Get('conversations/:id/messages') messages(@CurrentUser() user: AuthUser, @Param('id') id: string, @Query() query: MessageQueryDto) { return this.service.messages(user, id, query); }
  @Post('conversations/:id/messages') sendMessage(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: SendChatMessageDto) { return this.service.sendMessage(user, id, dto); }
  @Post('conversations/:id/read') markRead(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: MarkConversationReadDto) { return this.service.markRead(user, id, dto); }
  @Get('messages/search') searchMessages(@CurrentUser() user: AuthUser, @Query() query: SearchMessagesDto) { return this.service.searchMessages(user, query); }
  @Patch('messages/:id') updateMessage(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateChatMessageDto) { return this.service.updateMessage(user, id, dto); }
  @Delete('messages/:id') deleteMessage(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.deleteMessage(user, id); }
  @Post('messages/:id/reactions/toggle') toggleReaction(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: ToggleReactionDto) { return this.service.toggleReaction(user, id, dto); }
}
