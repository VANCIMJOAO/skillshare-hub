import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { BadRequestException } from '@nestjs/common';

describe('UploadController', () => {
    let controller: UploadController;
    let service: UploadService;

    const mockFile: Express.Multer.File = {
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
    };

    const mockUploadService = {
        uploadFile: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UploadController],
            providers: [
                {
                    provide: UploadService,
                    useValue: mockUploadService,
                },
            ],
        }).compile();

        controller = module.get<UploadController>(UploadController);
        service = module.get<UploadService>(UploadService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('uploadImage', () => {
        it('should upload image successfully', async () => {
            const imageUrl = 'https://example.com/uploaded-image.jpg';
            mockUploadService.uploadFile.mockResolvedValue(imageUrl);

            const result = await controller.uploadImage(mockFile);

            expect(service.uploadFile).toHaveBeenCalledWith(mockFile);
            expect(result).toEqual({
                data: { imageUrl },
                message: 'Image uploaded successfully',
            });
        });

        it('should throw BadRequestException when no file is provided', async () => {
            await expect(controller.uploadImage(null)).rejects.toThrow(
                new BadRequestException('No file provided'),
            );

            expect(service.uploadFile).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when file is undefined', async () => {
            await expect(controller.uploadImage(undefined)).rejects.toThrow(
                new BadRequestException('No file provided'),
            );

            expect(service.uploadFile).not.toHaveBeenCalled();
        });

        it('should handle upload service errors', async () => {
            const error = new Error('Upload failed');
            mockUploadService.uploadFile.mockRejectedValue(error);

            await expect(controller.uploadImage(mockFile)).rejects.toThrow(error);

            expect(service.uploadFile).toHaveBeenCalledWith(mockFile);
        });
    });
});
