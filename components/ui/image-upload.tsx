// apps/web/components/ui/image-upload.tsx
'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from './button';
import { Input } from './input';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
    value?: string;
    onChange: (url: string | undefined) => void;
    disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const validateFile = (file: File): boolean => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({
                title: 'Erro',
                description: 'Apenas arquivos de imagem são permitidos.',
                variant: 'destructive',
            });
            return false;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: 'Erro',
                description: 'O arquivo deve ter no máximo 5MB.',
                variant: 'destructive',
            });
            return false;
        }

        return true;
    };

    const uploadFile = async (file: File) => {
        if (!validateFile(file)) return;

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await api.post('/upload/image', formData);

            onChange((response as any).data.data.imageUrl);

            toast({
                title: 'Sucesso',
                description: 'Imagem enviada com sucesso!',
            });
        } catch (error: any) {
            toast({
                title: 'Erro',
                description: error.response?.data?.message || 'Erro ao enviar imagem.',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        await uploadFile(file);
    };

    // Drag and Drop handlers
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled && !isUploading) {
            setIsDragOver(true);
        }
    }, [disabled, isUploading]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (disabled || isUploading) return;

        const files = Array.from(e.dataTransfer.files);
        const file = files[0];

        if (file) {
            await uploadFile(file);
        }
    }, [disabled, isUploading]);

    const handleRemove = () => {
        onChange(undefined);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-4">
            <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            {value ? (
                <div className="relative group">
                    <div className="aspect-video w-full max-w-md relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                        <img
                            src={`${process.env.NEXT_PUBLIC_API_URL}${value}`}
                            alt="Workshop"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={handleRemove}
                                disabled={disabled}
                            >
                                <X className="w-4 h-4 mr-2" />
                                Remover
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div
                    className={`aspect-video w-full max-w-md transition-all duration-200 ${isDragOver ? 'scale-105' : ''
                        }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <Button
                        type="button"
                        variant="outline"
                        className={`w-full h-full border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center space-y-2 ${isDragOver
                                ? 'border-blue-400 bg-blue-50 text-blue-600'
                                : 'border-gray-300 hover:border-gray-400'
                            } ${isUploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                        onClick={handleUploadClick}
                        disabled={disabled || isUploading}
                    >
                        {isUploading ? (
                            <>
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <p className="text-sm font-medium">Enviando imagem...</p>
                            </>
                        ) : isDragOver ? (
                            <>
                                <Upload className="w-8 h-8 text-blue-500 animate-bounce" />
                                <div className="text-center">
                                    <p className="text-sm font-medium text-blue-600">Solte a imagem aqui!</p>
                                    <p className="text-xs text-blue-500">PNG, JPG, GIF até 5MB</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <ImageIcon className="w-8 h-8 text-gray-400" />
                                <div className="text-center">
                                    <p className="text-sm font-medium">Clique ou arraste uma imagem</p>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF até 5MB</p>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <Upload className="w-4 h-4" />
                                    <span>Drag & Drop ou clique para enviar</span>
                                </div>
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
