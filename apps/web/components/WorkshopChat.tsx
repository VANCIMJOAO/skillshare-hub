// apps/web/components/WorkshopChat.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
    Send,
    Users,
    MoreVertical,
    Edit2,
    Trash2,
    Image as ImageIcon,
    File
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { io, Socket } from 'socket.io-client';

interface ChatMessage {
    id: string;
    message: string;
    type: 'text' | 'image' | 'file';
    attachmentUrl?: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    userId: string;
    workshopId: string;
    isEdited: boolean;
    editedAt?: string;
    createdAt: string;
}

interface WorkshopChatProps {
    workshopId: string;
    workshopTitle: string;
    userRole?: 'owner' | 'enrolled' | 'none';
}

export default function WorkshopChat({ workshopId, workshopTitle, userRole = 'none' }: WorkshopChatProps) {
    const { data: session } = useSession();
    const { toast } = useToast();

    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [activeUsers, setActiveUsers] = useState(0);
    const [typingUsers, setTypingUsers] = useState<{ [userId: string]: string }>({});
    const [editingMessage, setEditingMessage] = useState<string | null>(null);
    const [editText, setEditText] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!session || userRole === 'none') return;

        // Initialize socket connection
        const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
            auth: {
                token: session.accessToken
            },
            query: {
                userId: session.user.id
            }
        });

        setSocket(newSocket);

        // Connection events
        newSocket.on('connect', () => {
            setIsConnected(true);
            newSocket.emit('join_workshop', { workshopId });
            toast({
                title: 'Conectado ao chat',
                description: 'Você agora pode enviar mensagens.',
            });
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
        });

        // Chat events
        newSocket.on('recent_messages', (data: { messages: ChatMessage[] }) => {
            setMessages(data.messages);
        });

        newSocket.on('new_message', (message: ChatMessage) => {
            setMessages(prev => [...prev, message]);
        });

        newSocket.on('message_edited', (updatedMessage: ChatMessage) => {
            setMessages(prev => prev.map(msg =>
                msg.id === updatedMessage.id ? updatedMessage : msg
            ));
        });

        newSocket.on('message_deleted', (data: { messageId: string }) => {
            setMessages(prev => prev.filter(msg => msg.id !== data.messageId));
        });

        newSocket.on('user_joined', (data: { userId: string, activeCount: number }) => {
            setActiveUsers(data.activeCount);
        });

        newSocket.on('user_left', (data: { userId: string, activeCount: number }) => {
            setActiveUsers(data.activeCount);
        });

        newSocket.on('user_typing', (data: { userId: string, userName?: string, isTyping: boolean }) => {
            if (data.userId === session.user.id) return; // Ignore own typing

            setTypingUsers(prev => {
                const newTyping = { ...prev };
                if (data.isTyping && data.userName) {
                    newTyping[data.userId] = data.userName;
                } else {
                    delete newTyping[data.userId];
                }
                return newTyping;
            });
        });

        newSocket.on('error', (error: { message: string }) => {
            toast({
                title: 'Erro no chat',
                description: error.message,
                variant: 'destructive',
            });
        });

        return () => {
            newSocket.emit('leave_workshop', { workshopId });
            newSocket.disconnect();
        };
    }, [session, workshopId, userRole, toast]);

    const sendMessage = () => {
        if (!socket || !newMessage.trim()) return;

        socket.emit('send_message', {
            message: newMessage,
            workshopId,
            type: 'text'
        });

        setNewMessage('');
        stopTyping();
    };

    const startTyping = () => {
        if (!socket) return;

        socket.emit('typing_start', {
            workshopId,
            userName: session?.user?.name
        });

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to stop typing
        typingTimeoutRef.current = setTimeout(() => {
            stopTyping();
        }, 3000);
    };

    const stopTyping = () => {
        if (!socket) return;

        socket.emit('typing_stop', { workshopId });

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        } else {
            startTyping();
        }
    };

    const startEdit = (message: ChatMessage) => {
        setEditingMessage(message.id);
        setEditText(message.message);
    };

    const saveEdit = () => {
        if (!socket || !editingMessage || !editText.trim()) return;

        socket.emit('edit_message', {
            messageId: editingMessage,
            editMessageDto: { message: editText }
        });

        setEditingMessage(null);
        setEditText('');
    };

    const deleteMessage = (messageId: string) => {
        if (!socket) return;

        socket.emit('delete_message', { messageId });
    };

    const canEditDelete = (message: ChatMessage) => {
        return message.userId === session?.user?.id || userRole === 'owner';
    };

    if (!session || userRole === 'none') {
        return (
            <Card>
                <CardContent className="flex items-center justify-center h-64">
                    <p className="text-gray-500">
                        Você precisa estar inscrito no workshop para acessar o chat.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-[500px] flex flex-col">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Chat do Workshop</CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge variant={isConnected ? 'default' : 'secondary'}>
                            {isConnected ? 'Conectado' : 'Desconectado'}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Users className="w-4 h-4" />
                            <span>{activeUsers}</span>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages Area */}
                <ScrollArea className="flex-1 px-4">
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div key={message.id} className="flex gap-3">
                                <Avatar className="w-8 h-8">
                                    <AvatarFallback className="text-xs">
                                        {message.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm">{message.user.name}</span>
                                        <span className="text-xs text-gray-500">
                                            {formatDistanceToNow(new Date(message.createdAt), {
                                                addSuffix: true,
                                                locale: ptBR
                                            })}
                                        </span>
                                        {message.isEdited && (
                                            <span className="text-xs text-gray-400">(editado)</span>
                                        )}

                                        {canEditDelete(message) && (
                                            <div className="flex gap-1 ml-auto">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0"
                                                    onClick={() => startEdit(message)}
                                                >
                                                    <Edit2 className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                                    onClick={() => deleteMessage(message.id)}
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {editingMessage === message.id ? (
                                        <div className="flex gap-2">
                                            <Input
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                                                className="text-sm"
                                            />
                                            <Button size="sm" onClick={saveEdit}>Salvar</Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setEditingMessage(null);
                                                    setEditText('');
                                                }}
                                            >
                                                Cancelar
                                            </Button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-700 break-words">
                                            {message.message}
                                        </p>
                                    )}

                                    {message.attachmentUrl && (
                                        <div className="mt-2">
                                            {message.type === 'image' ? (
                                                <img
                                                    src={message.attachmentUrl}
                                                    alt="Imagem"
                                                    className="max-w-xs rounded border"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2 p-2 border rounded">
                                                    <File className="w-4 h-4" />
                                                    <a
                                                        href={message.attachmentUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline text-sm"
                                                    >
                                                        Arquivo anexado
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicators */}
                        {Object.keys(typingUsers).length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 italic">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                </div>
                                {Object.values(typingUsers).join(', ')} digitando...
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t p-4">
                    <div className="flex gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Digite sua mensagem..."
                            disabled={!isConnected}
                            className="flex-1"
                        />
                        <Button
                            onClick={sendMessage}
                            disabled={!isConnected || !newMessage.trim()}
                            size="sm"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
