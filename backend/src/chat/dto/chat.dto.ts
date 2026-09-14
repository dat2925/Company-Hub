import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChatConversationType, ChatMemberRole, ChatMessageType, ChatTheme } from '@prisma/client';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUrl, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';
import { PaginationDto } from '../../common/pagination.dto';

export class ConversationQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ChatConversationType }) @IsOptional() @IsEnum(ChatConversationType) type?: ChatConversationType;
}

export class CreateDirectConversationDto {
  @ApiProperty() @IsUUID() employeeId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(16) icon?: string;
  @ApiPropertyOptional({ enum: ChatTheme }) @IsOptional() @IsEnum(ChatTheme) theme?: ChatTheme;
}

export class CreateGroupConversationDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(100) title!: string;
  @ApiProperty({ type: [String] }) @IsArray() @ArrayMinSize(1) @ArrayMaxSize(99) @IsUUID(undefined, { each: true }) memberIds!: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(16) icon?: string;
  @ApiPropertyOptional({ enum: ChatTheme }) @IsOptional() @IsEnum(ChatTheme) theme?: ChatTheme;
}

export class UpdateConversationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) @MaxLength(100) title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(16) icon?: string;
  @ApiPropertyOptional({ enum: ChatTheme }) @IsOptional() @IsEnum(ChatTheme) theme?: ChatTheme;
}

export class AddChatMembersDto {
  @ApiProperty({ type: [String] }) @IsArray() @ArrayMinSize(1) @ArrayMaxSize(99) @IsUUID(undefined, { each: true }) employeeIds!: string[];
}

export class UpdateChatMemberRoleDto {
  @ApiProperty({ enum: ChatMemberRole }) @IsEnum(ChatMemberRole) role!: ChatMemberRole;
}

export class TransferChatOwnershipDto {
  @ApiProperty() @IsUUID() employeeId!: string;
}

export class MuteConversationDto {
  @ApiProperty({ description: '0 unmutes; otherwise number of minutes' }) @Type(() => Number) @IsInt() @Min(0) @Max(525_600) minutes!: number;
}

export class MessageQueryDto extends PaginationDto {
  @ApiPropertyOptional() @IsOptional() @IsDateString() before?: string;
}

export class SendChatMessageDto {
  @ApiPropertyOptional({ enum: ChatMessageType }) @IsOptional() @IsEnum(ChatMessageType) type?: ChatMessageType;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(5000) content?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl({ require_protocol: true }) attachmentUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255) attachmentName?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() replyToId?: string;
}

export class UpdateChatMessageDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(5000) content!: string;
}

export class ToggleReactionDto {
  @ApiProperty({ example: '👍' }) @IsString() @MinLength(1) @MaxLength(16) emoji!: string;
}

export class MarkConversationReadDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() messageId?: string;
}

export class SearchMessagesDto extends PaginationDto {
  @ApiProperty() @IsString() @MinLength(2) q!: string;
}
