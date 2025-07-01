// apps/web/components/Navbar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { User, LogOut, Settings, PlusCircle, BookOpen } from 'lucide-react';
import NotificationCenter from './notifications/NotificationCenter';

const Navbar: React.FC = () => {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return (
            <nav className="border-b bg-white shadow-sm">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between">
                        <Link href="/" className="text-xl font-bold text-primary">
                            SkillShare Hub
                        </Link>
                        <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="border-b bg-white shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    <Link href="/" className="text-xl font-bold text-primary">
                        SkillShare Hub
                    </Link>

                    <div className="flex items-center space-x-4">
                        {session ? (
                            <>
                                {session.user.role === 'STUDENT' && (
                                    <Button asChild variant="outline" size="sm">
                                        <Link href="/student/dashboard">
                                            <BookOpen className="mr-2 h-4 w-4" />
                                            Meus Workshops
                                        </Link>
                                    </Button>
                                )}

                                {session.user.role === 'INSTRUCTOR' && (
                                    <Button asChild variant="outline" size="sm">
                                        <Link href="/instructor/dashboard">
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Dashboard
                                        </Link>
                                    </Button>
                                )}

                                {session.user.role === 'ADMIN' && (
                                    <Button asChild variant="outline" size="sm">
                                        <Link href="/admin">
                                            <Settings className="mr-2 h-4 w-4" />
                                            Admin
                                        </Link>
                                    </Button>
                                )}

                                {/* Notification Center */}
                                <NotificationCenter />

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>
                                                    {session.user.name
                                                        ?.split(' ')
                                                        .map((n) => n[0])
                                                        .join('')
                                                        .toUpperCase() || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56" align="end" forceMount>
                                        <DropdownMenuItem asChild>
                                            <Link href="/profile" className="flex items-center">
                                                <User className="mr-2 h-4 w-4" />
                                                Profile
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <button
                                                onClick={() => signOut({ callbackUrl: '/' })}
                                                className="flex items-center w-full"
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                Sign out
                                            </button>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Button asChild variant="ghost" size="sm">
                                    <Link href="/auth/signin">Sign in</Link>
                                </Button>
                                <Button asChild size="sm">
                                    <Link href="/auth/register">Sign up</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
