'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function ConnectionTestPage() {
    const [status, setStatus] = useState('Testing...');
    const [results, setResults] = useState<any[]>([]);

    useEffect(() => {
        async function runTests() {
            const testResults: any[] = [];
            
            try {
                // Test 1: Health Check
                setStatus('Testing health endpoint...');
                const healthResponse = await fetch('http://localhost:3004/health');
                const healthData = await healthResponse.json();
                testResults.push({
                    test: 'Health Check',
                    status: '✅ SUCCESS',
                    data: healthData
                });
                
                // Test 2: Workshops via fetch
                setStatus('Testing workshops endpoint with fetch...');
                const workshopsResponse = await fetch('http://localhost:3004/workshops');
                const workshopsData = await workshopsResponse.json();
                testResults.push({
                    test: 'Workshops Direct Fetch',
                    status: '✅ SUCCESS',
                    data: `${workshopsData.data?.length || 0} workshops found`
                });
                
                // Test 3: Workshops via API client
                setStatus('Testing workshops via API client...');
                try {
                    const apiData = await api.get('/workshops');
                    testResults.push({
                        test: 'Workshops API Client',
                        status: '✅ SUCCESS',
                        data: `${(apiData as any).data?.length || 0} workshops via API client`
                    });
                } catch (apiError) {
                    testResults.push({
                        test: 'Workshops API Client',
                        status: '❌ ERROR',
                        data: (apiError as Error).message
                    });
                }
                
                // Test 4: Environment Variables
                setStatus('Checking environment variables...');
                testResults.push({
                    test: 'Environment Variables',
                    status: '📋 INFO',
                    data: {
                        API_URL: process.env.NEXT_PUBLIC_API_URL || 'NOT SET',
                        NODE_ENV: process.env.NODE_ENV
                    }
                });
                
                setStatus('Tests completed!');
                
            } catch (error) {
                testResults.push({
                    test: 'Connection Test',
                    status: '❌ ERROR',
                    data: (error as Error).message
                });
                setStatus('Tests failed!');
            }
            
            setResults(testResults);
        }
        
        runTests();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Frontend-Backend Connection Test</h1>
            
            <div className="bg-white rounded-lg border shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Status: {status}</h2>
                
                <div className="space-y-4">
                    {results.map((result, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4">
                            <h3 className="font-semibold">
                                {result.test}: <span className={
                                    result.status.includes('SUCCESS') ? 'text-green-600' :
                                    result.status.includes('ERROR') ? 'text-red-600' :
                                    'text-blue-600'
                                }>{result.status}</span>
                            </h3>
                            <pre className="text-sm text-gray-600 mt-2 bg-gray-100 p-2 rounded">
                                {typeof result.data === 'object' ? 
                                    JSON.stringify(result.data, null, 2) : 
                                    result.data
                                }
                            </pre>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
