// apps/api/src/chat/dto/create-message.dto.ts
import { IsString, IsNotEmpty, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
    @ApiProperty({ description: 'Message content', maxLength: 1000 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    message: string;

    @ApiProperty({ description: 'Workshop ID where message is sent' })
    @IsString()
    @IsNotEmpty()
    workshopId: string;

    @ApiProperty({
        description: 'Message type',
        enum: ['text', 'image', 'file'],
        default: 'text'
    })
    @IsEnum(['text', 'image', 'file'])
    @IsOptional()
    type?: string = 'text';

    @ApiProperty({ description: 'Attachment URL (for image/file types)', required: false })
    @IsString()
    @IsOptional()
    attachmentUrl?: string;
}

export class EditMessageDto {
    @ApiProperty({ description: 'Updated message content', maxLength: 1000 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    message: string;
}
