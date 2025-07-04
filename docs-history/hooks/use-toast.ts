import { toast as sonnerToast } from 'sonner';

type ToastProps = {
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive';
};

export const useToast = () => {
    const toast = ({ title, description, variant = 'default' }: ToastProps) => {
        if (variant === 'destructive') {
            sonnerToast.error(title || 'Erro', {
                description,
            });
        } else {
            sonnerToast.success(title || 'Sucesso', {
                description,
            });
        }
    };

    return { toast };
};
