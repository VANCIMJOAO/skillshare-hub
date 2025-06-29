import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from './upload.service';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('UploadService', () => {
    let service: UploadService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [UploadService],
        }).compile();

        service = module.get<UploadService>(UploadService);

        // Reset mocks
        jest.clearAllMocks();
    });

    const createMockFile = (overrides: Partial<Express.Multer.File> = {}): Express.Multer.File => ({
        fieldname: 'image',
        originalname: 'test-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('fake-image-data'),
        destination: '/tmp',
        filename: 'test-image.jpg',
        path: '/tmp/test-image.jpg',
        stream: null,
        ...overrides,
    });

    describe('constructor', () => {
        it('should create upload directory if it does not exist', () => {
            mockFs.existsSync.mockReturnValue(false);
            mockFs.mkdirSync.mockImplementation(() => undefined);

            // Create new service instance to trigger constructor
            new UploadService();

            expect(mockFs.existsSync).toHaveBeenCalled();
            expect(mockFs.mkdirSync).toHaveBeenCalledWith(
                expect.stringContaining('uploads'),
                { recursive: true }
            );
        });

        it('should not create directory if it already exists', () => {
            mockFs.existsSync.mockReturnValue(true);

            // Create new service instance to trigger constructor
            new UploadService();

            expect(mockFs.existsSync).toHaveBeenCalled();
            expect(mockFs.mkdirSync).not.toHaveBeenCalled();
        });
    });

    describe('uploadFile', () => {
        beforeEach(() => {
            mockFs.writeFileSync.mockImplementation(() => undefined);
            jest.spyOn(Date, 'now').mockReturnValue(1234567890000);
            jest.spyOn(Math, 'random').mockReturnValue(0.5);
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should upload a valid image file successfully', async () => {
            const mockFile = createMockFile();

            const result = await service.uploadFile(mockFile);

            expect(mockFs.writeFileSync).toHaveBeenCalledWith(
                expect.stringContaining('1234567890000-500000000.jpg'),
                mockFile.buffer
            );
            expect(result).toBe('/uploads/1234567890000-500000000.jpg');
        });

        it('should handle different image formats', async () => {
            const formats = [
                { ext: '.png', mimetype: 'image/png' },
                { ext: '.gif', mimetype: 'image/gif' },
                { ext: '.webp', mimetype: 'image/webp' },
            ];

            for (const format of formats) {
                const mockFile = createMockFile({
                    originalname: `test${format.ext}`,
                    mimetype: format.mimetype,
                });

                const result = await service.uploadFile(mockFile);

                expect(result).toBe(`/uploads/1234567890000-500000000${format.ext}`);
            }
        });

        it('should throw BadRequestException when no file is provided', async () => {
            await expect(service.uploadFile(null)).rejects.toThrow(
                new BadRequestException('No file provided')
            );

            expect(mockFs.writeFileSync).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException for invalid file types', async () => {
            const invalidFile = createMockFile({
                mimetype: 'application/pdf',
                originalname: 'test.pdf',
            });

            await expect(service.uploadFile(invalidFile)).rejects.toThrow(
                new BadRequestException('Invalid file type. Only images are allowed.')
            );

            expect(mockFs.writeFileSync).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException for files that are too large', async () => {
            const largeFile = createMockFile({
                size: 6 * 1024 * 1024, // 6MB (exceeds 5MB limit)
            });

            await expect(service.uploadFile(largeFile)).rejects.toThrow(
                new BadRequestException('File too large. Maximum size is 5MB.')
            );

            expect(mockFs.writeFileSync).not.toHaveBeenCalled();
        });

        it('should generate unique filenames', async () => {
            const mockFile = createMockFile();

            // First call
            jest.spyOn(Date, 'now').mockReturnValueOnce(1000);
            jest.spyOn(Math, 'random').mockReturnValueOnce(0.1);
            const result1 = await service.uploadFile(mockFile);

            // Second call
            jest.spyOn(Date, 'now').mockReturnValueOnce(2000);
            jest.spyOn(Math, 'random').mockReturnValueOnce(0.9);
            const result2 = await service.uploadFile(mockFile);

            expect(result1).toBe('/uploads/1000-100000000.jpg');
            expect(result2).toBe('/uploads/2000-900000000.jpg');
            expect(result1).not.toBe(result2);
        });
    });

    describe('deleteFile', () => {
        beforeEach(() => {
            mockFs.existsSync.mockReturnValue(true);
            mockFs.unlinkSync.mockImplementation(() => undefined);
            jest.spyOn(console, 'error').mockImplementation(() => { });
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should delete an existing file', () => {
            const fileUrl = '/uploads/test-image.jpg';

            service.deleteFile(fileUrl);

            expect(mockFs.existsSync).toHaveBeenCalledWith(
                expect.stringContaining('test-image.jpg')
            );
            expect(mockFs.unlinkSync).toHaveBeenCalledWith(
                expect.stringContaining('test-image.jpg')
            );
        });

        it('should not attempt to delete file if it does not exist', () => {
            mockFs.existsSync.mockReturnValue(false);
            const fileUrl = '/uploads/non-existent.jpg';

            service.deleteFile(fileUrl);

            expect(mockFs.existsSync).toHaveBeenCalled();
            expect(mockFs.unlinkSync).not.toHaveBeenCalled();
        });

        it('should ignore files with invalid URLs', () => {
            const invalidUrls = [
                '',
                null,
                undefined,
                '/other/path/file.jpg',
                'uploads/file.jpg',
                'https://example.com/file.jpg',
            ];

            invalidUrls.forEach(url => {
                service.deleteFile(url as string);
            });

            expect(mockFs.existsSync).not.toHaveBeenCalled();
            expect(mockFs.unlinkSync).not.toHaveBeenCalled();
        });

        it('should handle errors gracefully without throwing', () => {
            const fileUrl = '/uploads/test-image.jpg';
            mockFs.unlinkSync.mockImplementation(() => {
                throw new Error('Permission denied');
            });

            expect(() => service.deleteFile(fileUrl)).not.toThrow();
            expect(console.error).toHaveBeenCalledWith('Error deleting file:', expect.any(Error));
        });

        it('should handle filesystem errors gracefully', () => {
            const fileUrl = '/uploads/test-image.jpg';
            mockFs.existsSync.mockImplementation(() => {
                throw new Error('Filesystem error');
            });

            expect(() => service.deleteFile(fileUrl)).not.toThrow();
            expect(console.error).toHaveBeenCalledWith('Error deleting file:', expect.any(Error));
        });
    });
});
