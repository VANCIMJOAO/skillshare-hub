'use client'

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full text-center p-8">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-yellow-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33m0 0L3 9m3.92 3.67L9 12m6 0l2.08.67L20 9"
              />
            </svg>
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Página não encontrada
          </h2>
          <p className="text-gray-600 mb-6">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link href="/">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Ir para o início
            </Button>
          </Link>
          
          <Link href="/workshops">
            <Button variant="outline" className="w-full">
              Ver workshops
            </Button>
          </Link>
          
          <Button 
            variant="ghost"
            onClick={() => window.history.back()}
            className="w-full"
          >
            Voltar à página anterior
          </Button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Precisa de ajuda? Entre em contato conosco em{' '}
            <a 
              href="mailto:jvancim@gmail.com" 
              className="text-blue-600 hover:text-blue-800"
            >
              jvancim@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
