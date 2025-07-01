// apps/web/components/Navigation.tsx
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
    BookOpen, 
    User, 
    Settings, 
    LogOut, 
    Plus,
    Home,
    Search
} from 'lucide-react';

export default function Navigation() {
    const { data: session, status } = useSession();
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === '/' && pathname === '/') return true;
        if (path !== '/' && pathname.startsWith(path)) return true;
        return false;
    };

    const handleSignOut = () => {
        signOut({ callbackUrl: '/' });
    };

    return (
        <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo and main navigation */}
                    <div className="flex items-center space-x-8">
                        <Link 
                            href="/" 
                            className="flex items-center space-x-2 text-xl font-bold text-blue-600 hover:text-blue-700"
                        >
                            <BookOpen className="h-6 w-6" />
                            <span>SkillShare Hub</span>
                        </Link>

                        <div className="hidden md:flex items-center space-x-4">
                            <Link
                                href="/"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    isActive('/') 
                                        ? 'text-blue-600 bg-blue-50' 
                                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                }`}
                            >
                                <Home className="h-4 w-4 inline mr-1" />
                                Início
                            </Link>
                            
                            <Link
                                href="/workshops"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    isActive('/workshops') 
                                        ? 'text-blue-600 bg-blue-50' 
                                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                }`}
                            >
                                <Search className="h-4 w-4 inline mr-1" />
                                Workshops
                            </Link>

                            {session?.user?.role === 'INSTRUCTOR' && (
                                <Link
                                    href="/workshops/create"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        isActive('/workshops/create') 
                                            ? 'text-blue-600 bg-blue-50' 
                                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <Plus className="h-4 w-4 inline mr-1" />
                                    Criar Workshop
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* User menu */}
                    <div className="flex items-center space-x-4">
                        {status === 'loading' ? (
                            <div className="animate-pulse h-8 w-8 bg-gray-200 rounded-full"></div>
                        ) : session ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-50 transition-colors">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="text-sm">
                                                {session.user?.name?.[0]?.toUpperCase() || 
                                                 session.user?.email?.[0]?.toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="hidden md:block text-left">
                                            <p className="text-sm font-medium text-gray-900">
                                                {session.user?.name || session.user?.email}
                                            </p>
                                            <Badge variant="secondary" className="text-xs">
                                                {session.user?.role === 'ADMIN' ? 'Admin' :
                                                 session.user?.role === 'INSTRUCTOR' ? 'Instrutor' : 'Estudante'}
                                            </Badge>
                                        </div>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <div className="px-2 py-1.5">
                                        <p className="text-sm font-medium">{session.user?.name || session.user?.email}</p>
                                        <p className="text-xs text-gray-500">{session.user?.email}</p>
                                    </div>
                                    <DropdownMenuSeparator />
                                    
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard" className="flex items-center cursor-pointer">
                                            <Home className="mr-2 h-4 w-4" />
                                            Dashboard
                                        </Link>
                                    </DropdownMenuItem>
                                    
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile" className="flex items-center cursor-pointer">
                                            <User className="mr-2 h-4 w-4" />
                                            Perfil
                                        </Link>
                                    </DropdownMenuItem>
                                    
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile/notifications" className="flex items-center cursor-pointer">
                                            <Settings className="mr-2 h-4 w-4" />
                                            Configurações
                                        </Link>
                                    </DropdownMenuItem>
                                    
                                    {session.user?.role === 'INSTRUCTOR' && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem asChild>
                                                <Link href="/workshops/create" className="flex items-center cursor-pointer">
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Criar Workshop
                                                </Link>
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                    
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                        onClick={handleSignOut}
                                        className="flex items-center cursor-pointer text-red-600 focus:text-red-600"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Sair
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Button 
                                    variant="ghost" 
                                    onClick={() => signIn()}
                                    className="text-sm font-medium"
                                >
                                    Entrar
                                </Button>
                                <Link href="/auth/register">
                                    <Button size="sm">
                                        Registrar
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile navigation */}
            {session && (
                <div className="md:hidden border-t bg-gray-50">
                    <div className="px-4 py-2 space-y-1">
                        <Link
                            href="/"
                            className={`block px-3 py-2 rounded-md text-sm font-medium ${
                                isActive('/') 
                                    ? 'text-blue-600 bg-blue-50' 
                                    : 'text-gray-700'
                            }`}
                        >
                            Início
                        </Link>
                        <Link
                            href="/workshops"
                            className={`block px-3 py-2 rounded-md text-sm font-medium ${
                                isActive('/workshops') 
                                    ? 'text-blue-600 bg-blue-50' 
                                    : 'text-gray-700'
                            }`}
                        >
                            Workshops
                        </Link>
                        <Link
                            href="/dashboard"
                            className={`block px-3 py-2 rounded-md text-sm font-medium ${
                                isActive('/dashboard') 
                                    ? 'text-blue-600 bg-blue-50' 
                                    : 'text-gray-700'
                            }`}
                        >
                            Dashboard
                        </Link>
                        {session.user?.role === 'INSTRUCTOR' && (
                            <Link
                                href="/workshops/create"
                                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                                    isActive('/workshops/create') 
                                        ? 'text-blue-600 bg-blue-50' 
                                        : 'text-gray-700'
                                }`}
                            >
                                Criar Workshop
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
