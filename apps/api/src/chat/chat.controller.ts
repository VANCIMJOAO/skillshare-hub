// apps/api/src/chat/chat.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateMessageDto, EditMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Chat')
@Controller('api/chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post('messages')
    @ApiOperation({ summary: 'Send a message to workshop chat' })
    @ApiResponse({ status: 201, description: 'Message sent successfully' })
    async sendMessage(@Body() createMessageDto: CreateMessageDto, @Request() req) {
        return this.chatService.createMessage(createMessageDto, req.user.id);
    }

    @Get('workshops/:workshopId/messages')
    @ApiOperation({ summary: 'Get messages for a workshop' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
    async getWorkshopMessages(
        @Param('workshopId') workshopId: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 50,
        @Request() req
    ) {
        return this.chatService.getWorkshopMessages(workshopId, req.user.id, page, limit);
    }

    @Put('messages/:messageId')
    @ApiOperation({ summary: 'Edit a message' })
    @ApiResponse({ status: 200, description: 'Message edited successfully' })
    async editMessage(
        @Param('messageId') messageId: string,
        @Body() editMessageDto: EditMessageDto,
        @Request() req
    ) {
        return this.chatService.editMessage(messageId, editMessageDto, req.user.id);
    }

    @Delete('messages/:messageId')
    @ApiOperation({ summary: 'Delete a message' })
    @ApiResponse({ status: 200, description: 'Message deleted successfully' })
    async deleteMessage(@Param('messageId') messageId: string, @Request() req) {
        await this.chatService.deleteMessage(messageId, req.user.id);
        return { message: 'Message deleted successfully' };
    }

    @Get('active')
    @ApiOperation({ summary: 'Get active chats for the user' })
    @ApiResponse({ status: 200, description: 'Active chats retrieved successfully' })
    async getActiveChats(@Request() req) {
        return this.chatService.getActiveChats(req.user.id);
    }
}
