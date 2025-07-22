'use client';

import { useState } from 'react';
import { useStacksAuth } from '@/hooks/useStacks';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function DebugProfilePage() {
  const { userAddress } = useStacksAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testContractRead = async () => {
    if (!userAddress) {
      alert('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    try {
      // Import the contract function
      const { getProfileFromContract } = await import('@/lib/contracts');
      
      console.log('🔍 Testing contract read for:', userAddress);
      const result = await getProfileFromContract(userAddress);
      
      setDebugInfo({
        userAddress,
        contractResult: result,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Debug test failed:', error);
      setDebugInfo({
        userAddress,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Profile Debug Tool</h1>
        
        <div className="space-y-4">
          <div>
            <p><strong>Connected Address:</strong> {userAddress || 'Not connected'}</p>
          </div>
          
          <Button 
            onClick={testContractRead} 
            disabled={!userAddress || isLoading}
            className="w-full"
          >
            {isLoading ? 'Testing...' : 'Test Contract Read'}
          </Button>
          
          {debugInfo && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-3">Debug Results:</h2>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="mt-6 text-sm text-muted-foreground">
            <p><strong>Instructions:</strong></p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Connect your wallet</li>
              <li>Click "Test Contract Read" to see raw contract response</li>
              <li>Check the browser console for detailed logs</li>
              <li>Compare the contract response with expected data structure</li>
            </ol>
          </div>
        </div>
      </Card>
    </div>
  );
}
