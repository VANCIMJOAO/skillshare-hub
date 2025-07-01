'use client';

import { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export default function AuthTestPage() {
    const { data: session, status } = useSession();
    const [testResult, setTestResult] = useState<string>('');

    const testAuth = async () => {
        setTestResult('Testing authentication...');
        
        try {
            // Test protected endpoint
            const response = await fetch('/api/auth/session');
            const sessionData = await response.json();
            
            setTestResult(`Session: ${JSON.stringify(sessionData, null, 2)}`);
        } catch (error) {
            setTestResult(`Error: ${(error as Error).message}`);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Authentication Test</h1>
            
            <div className="space-y-6">
                <div className="bg-white rounded-lg border shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4">Session Status</h2>
                    <p><strong>Status:</strong> {status}</p>
                    {session ? (
                        <div>
                            <p><strong>User:</strong> {session.user?.email}</p>
                            <p><strong>Name:</strong> {session.user?.name}</p>
                            <Button onClick={() => signOut()} className="mt-4" variant="outline">
                                Sign Out
                            </Button>
                        </div>
                    ) : (
                        <div>
                            <p>Not signed in</p>
                            <Button onClick={() => signIn()} className="mt-4">
                                Sign In
                            </Button>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg border shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4">API Test</h2>
                    <Button onClick={testAuth} className="mb-4">
                        Test Auth API
                    </Button>
                    {testResult && (
                        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                            {testResult}
                        </pre>
                    )}
                </div>
            </div>
        </div>
    );
}
