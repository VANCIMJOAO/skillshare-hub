// apps/api/src/upload/upload.controller.ts
import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    UseGuards,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Controller('upload')
export class UploadController {
    constructor(private readonly uploadService: UploadService) { }

    @Post('image')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('image'))
    async uploadImage(
        @UploadedFile() file: Express.Multer.File,
    ): Promise<ApiResponse<{ imageUrl: string }>> {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        const imageUrl = await this.uploadService.uploadFile(file);

        return {
            data: { imageUrl },
            message: 'Image uploaded successfully',
        };
    }
}
