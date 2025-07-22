/**
 * Admin Profile Deletion Page
 * 
 * This is a utility page for manually deleting profiles from the blockchain
 * when the normal deletion process fails.
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Section } from '@/components/ui/section';
import { useStacksAuth } from '@/hooks/useStacks';

export default function AdminDeleteProfile() {
  const { isSignedIn, userAddress } = useStacksAuth();
  const [targetAddress, setTargetAddress] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [profileExists, setProfileExists] = useState<boolean | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [message, setMessage] = useState('');

  const checkProfile = async () => {
    if (!targetAddress) {
      setMessage('Please enter a valid address');
      return;
    }

    setIsChecking(true);
    setMessage('');
    
    try {
      const { checkProfileExists, readProfileFromContract } = await import('@/lib/stacks');
      
      console.log('Checking profile for:', targetAddress);
      const exists = await checkProfileExists(targetAddress);
      setProfileExists(exists);
      
      if (exists) {
        const data = await readProfileFromContract(targetAddress);
        setProfileData(data);
        setMessage(`Profile found for ${targetAddress}`);
      } else {
        setProfileData(null);
        setMessage(`No profile found for ${targetAddress}`);
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      setMessage(`Error checking profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsChecking(false);
    }
  };

  const deleteProfile = async () => {
    if (!targetAddress || !profileExists) {
      setMessage('No profile to delete');
      return;
    }

    if (targetAddress !== userAddress) {
      setMessage('You can only delete your own profile. Please connect with the wallet that owns this profile.');
      return;
    }

    setIsDeleting(true);
    setMessage('');

    try {
      const { deleteProfileOnContract } = await import('@/lib/contracts');
      
      console.log('Deleting profile for:', targetAddress);
      await deleteProfileOnContract();
      
      setMessage('Profile deletion transaction submitted successfully!');
      setProfileExists(false);
      setProfileData(null);
      
      // Recheck after a delay
      setTimeout(() => {
        checkProfile();
      }, 3000);
      
    } catch (error) {
      console.error('Error deleting profile:', error);
      setMessage(`Error deleting profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isSignedIn) {
    return (
      <Section className="min-h-screen py-20">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Admin Profile Deletion</h1>
            <p className="text-muted-foreground mb-6">
              Please connect your wallet to use this admin tool.
            </p>
          </Card>
        </div>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen py-20">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <h1 className="text-2xl font-bold mb-6">Admin Profile Deletion Tool</h1>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Target Address
              </label>
              <input
                type="text"
                value={targetAddress}
                onChange={(e) => setTargetAddress(e.target.value)}
                placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Enter the Stacks address of the profile to check/delete
              </p>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={checkProfile}
                disabled={isChecking || !targetAddress}
                variant="outline"
              >
                {isChecking ? 'Checking...' : 'Check Profile'}
              </Button>

              {profileExists && (
                <Button
                  onClick={deleteProfile}
                  disabled={isDeleting || targetAddress !== userAddress}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Profile'}
                </Button>
              )}
            </div>

            {message && (
              <div className={`p-4 rounded-md ${
                message.includes('Error') || message.includes('can only delete')
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : message.includes('successfully') || message.includes('found')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {message}
              </div>
            )}

            {profileData && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold mb-2">Profile Data:</h3>
                <pre className="text-sm overflow-x-auto">
                  {JSON.stringify(profileData, null, 2)}
                </pre>
              </div>
            )}

            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-2">Important Notes:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• You can only delete profiles that belong to your connected wallet</li>
                <li>• Profile deletion is permanent and cannot be undone</li>
                <li>• After deletion, you can create a new profile with the same address</li>
                <li>• This tool directly interacts with the blockchain contract</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Manual Deletion via Stacks Explorer:</h3>
              <p className="text-sm text-blue-700 mb-2">
                If this tool doesn't work, you can manually delete via Stacks Explorer:
              </p>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Go to <a href="https://explorer.stacks.co/?chain=testnet" target="_blank" rel="noopener noreferrer" className="underline">Stacks Explorer (Testnet)</a></li>
                <li>Search for the contract: <code className="bg-blue-100 px-1 rounded">ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.developer-profiles</code></li>
                <li>Click "Call Function" and select "delete-profile"</li>
                <li>Connect your wallet and submit the transaction</li>
              </ol>
            </div>
          </div>
        </Card>
      </div>
    </Section>
  );
}
