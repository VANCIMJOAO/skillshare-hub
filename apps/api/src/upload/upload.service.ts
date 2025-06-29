// apps/api/src/upload/upload.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
    private readonly uploadPath = path.join(process.cwd(), 'uploads');

    constructor() {
        // Ensure upload directory exists
        if (!fs.existsSync(this.uploadPath)) {
            fs.mkdirSync(this.uploadPath, { recursive: true });
        }
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        // Validate file type
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException('Invalid file type. Only images are allowed.');
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new BadRequestException('File too large. Maximum size is 5MB.');
        }

        // Generate unique filename
        const fileExtension = path.extname(file.originalname);
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExtension}`;
        const filePath = path.join(this.uploadPath, fileName);

        // Save file
        fs.writeFileSync(filePath, file.buffer);

        // Return relative URL
        return `/uploads/${fileName}`;
    }

    deleteFile(fileUrl: string): void {
        try {
            if (fileUrl && fileUrl.startsWith('/uploads/')) {
                const fileName = fileUrl.split('/uploads/')[1];
                const filePath = path.join(this.uploadPath, fileName);

                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        } catch (error) {
            // Log error but don't throw - file deletion is not critical
            console.error('Error deleting file:', error);
        }
    }
}
