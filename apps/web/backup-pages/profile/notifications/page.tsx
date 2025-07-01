// apps/web/app/profile/notifications/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Bell, Mail, Smartphone } from 'lucide-react';

interface NotificationPreferences {
    emailEnabled: boolean;
    pushEnabled: boolean;
    emailWorkshopReminders: boolean;
    emailEnrollmentConfirmations: boolean;
    emailWorkshopUpdates: boolean;
    emailNewWorkshops: boolean;
    pushWorkshopReminders: boolean;
    pushEnrollmentConfirmations: boolean;
    pushWorkshopUpdates: boolean;
    pushNewWorkshops: boolean;
}

// Simple Switch component
const Switch = ({ checked, onCheckedChange, id }: {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    id?: string;
}) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={(e) => onCheckedChange(e.target.checked)}
            className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
);

// Simple Separator component
const Separator = () => <hr className="my-4 border-gray-200" />;

interface NotificationPreferences {
    emailEnabled: boolean;
    pushEnabled: boolean;
    emailWorkshopReminders: boolean;
    emailEnrollmentConfirmations: boolean;
    emailWorkshopUpdates: boolean;
    emailNewWorkshops: boolean;
    pushWorkshopReminders: boolean;
    pushEnrollmentConfirmations: boolean;
    pushWorkshopUpdates: boolean;
    pushNewWorkshops: boolean;
}

export default function NotificationPreferencesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { toast } = useToast();
    const [preferences, setPreferences] = useState<NotificationPreferences>({
        emailEnabled: true,
        pushEnabled: true,
        emailWorkshopReminders: true,
        emailEnrollmentConfirmations: true,
        emailWorkshopUpdates: true,
        emailNewWorkshops: false,
        pushWorkshopReminders: true,
        pushEnrollmentConfirmations: true,
        pushWorkshopUpdates: true,
        pushNewWorkshops: false,
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const token = (session?.user as any)?.accessToken;

    // Fetch current preferences
    const fetchPreferences = async () => {
        if (!token) return;

        try {
            setLoading(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/preferences`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setPreferences(data);
            }
        } catch (error) {
            console.error('Failed to fetch preferences:', error);
            toast({
                title: 'Erro',
                description: 'Não foi possível carregar as preferências.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    // Save preferences
    const savePreferences = async () => {
        if (!token) return;

        try {
            setSaving(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/preferences`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(preferences),
            });

            if (response.ok) {
                toast({
                    title: 'Sucesso',
                    description: 'Preferências salvas com sucesso!',
                });
            } else {
                throw new Error('Failed to save preferences');
            }
        } catch (error) {
            console.error('Failed to save preferences:', error);
            toast({
                title: 'Erro',
                description: 'Não foi possível salvar as preferências.',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        } else if (session && token) {
            fetchPreferences();
        }
    }, [session, status, token, router]);

    const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
    };

    if (status === 'loading' || loading) {
        return (
            <div className="container mx-auto py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="container mx-auto py-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft size={16} />
                        Voltar
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Configurações de Notificação</h1>
                        <p className="text-gray-600">Gerencie como você recebe notificações</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Email Notifications */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail size={20} />
                                Notificações por Email
                            </CardTitle>
                            <CardDescription>
                                Configure quando você quer receber emails sobre atividades da plataforma
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="emailEnabled" className="flex flex-col gap-1">
                                    <span>Habilitar emails</span>
                                    <span className="text-sm text-gray-500 font-normal">
                                        Receber notificações por email
                                    </span>
                                </Label>
                                <Switch
                                    id="emailEnabled"
                                    checked={preferences.emailEnabled}
                                    onCheckedChange={(checked) => updatePreference('emailEnabled', checked)}
                                />
                            </div>

                            <Separator />

                            <div className="space-y-3 opacity-60 pointer-events-none" style={{
                                opacity: preferences.emailEnabled ? 1 : 0.6,
                                pointerEvents: preferences.emailEnabled ? 'auto' : 'none'
                            }}>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="emailWorkshopReminders">Lembretes de workshops</Label>
                                    <Switch
                                        id="emailWorkshopReminders"
                                        checked={preferences.emailWorkshopReminders}
                                        onCheckedChange={(checked) => updatePreference('emailWorkshopReminders', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="emailEnrollmentConfirmations">Confirmações de inscrição</Label>
                                    <Switch
                                        id="emailEnrollmentConfirmations"
                                        checked={preferences.emailEnrollmentConfirmations}
                                        onCheckedChange={(checked) => updatePreference('emailEnrollmentConfirmations', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="emailWorkshopUpdates">Atualizações de workshops</Label>
                                    <Switch
                                        id="emailWorkshopUpdates"
                                        checked={preferences.emailWorkshopUpdates}
                                        onCheckedChange={(checked) => updatePreference('emailWorkshopUpdates', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="emailNewWorkshops">Novos workshops disponíveis</Label>
                                    <Switch
                                        id="emailNewWorkshops"
                                        checked={preferences.emailNewWorkshops}
                                        onCheckedChange={(checked) => updatePreference('emailNewWorkshops', checked)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Push Notifications */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Smartphone size={20} />
                                Notificações Push
                            </CardTitle>
                            <CardDescription>
                                Configure as notificações em tempo real no seu navegador
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="pushEnabled" className="flex flex-col gap-1">
                                    <span>Habilitar notificações push</span>
                                    <span className="text-sm text-gray-500 font-normal">
                                        Receber notificações instantâneas
                                    </span>
                                </Label>
                                <Switch
                                    id="pushEnabled"
                                    checked={preferences.pushEnabled}
                                    onCheckedChange={(checked) => updatePreference('pushEnabled', checked)}
                                />
                            </div>

                            <Separator />

                            <div className="space-y-3" style={{
                                opacity: preferences.pushEnabled ? 1 : 0.6,
                                pointerEvents: preferences.pushEnabled ? 'auto' : 'none'
                            }}>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="pushWorkshopReminders">Lembretes de workshops</Label>
                                    <Switch
                                        id="pushWorkshopReminders"
                                        checked={preferences.pushWorkshopReminders}
                                        onCheckedChange={(checked) => updatePreference('pushWorkshopReminders', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="pushEnrollmentConfirmations">Confirmações de inscrição</Label>
                                    <Switch
                                        id="pushEnrollmentConfirmations"
                                        checked={preferences.pushEnrollmentConfirmations}
                                        onCheckedChange={(checked) => updatePreference('pushEnrollmentConfirmations', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="pushWorkshopUpdates">Atualizações de workshops</Label>
                                    <Switch
                                        id="pushWorkshopUpdates"
                                        checked={preferences.pushWorkshopUpdates}
                                        onCheckedChange={(checked) => updatePreference('pushWorkshopUpdates', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="pushNewWorkshops">Novos workshops disponíveis</Label>
                                    <Switch
                                        id="pushNewWorkshops"
                                        checked={preferences.pushNewWorkshops}
                                        onCheckedChange={(checked) => updatePreference('pushNewWorkshops', checked)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <Button onClick={savePreferences} disabled={saving}>
                            {saving ? 'Salvando...' : 'Salvar Preferências'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
