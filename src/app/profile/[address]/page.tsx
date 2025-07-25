'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { FiMapPin, FiGlobe, FiGithub, FiTwitter, FiLinkedin, FiEdit, FiStar, FiUsers, FiCode, FiTrash2, FiCheck } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Section } from '@/components/ui/section';
import { useStacksAuth, useProfile } from '@/hooks/useStacks';
import { ProfileCookies } from '@/lib/cookies';
import { ErrorBoundary } from '@/components/error-boundary';
import Link from 'next/link';

export default function ProfilePage() {
  const params = useParams();
  const address = params?.address as string;
  const { userAddress } = useStacksAuth();
  const { profile, isLoading, error } = useProfile(address);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionMessage, setDeletionMessage] = useState('');

  const isOwnProfile = userAddress === address;

  // Debug: Log the profile data to see what we're working with
  if (profile) {
    console.log('🔍 Profile data in UI:', profile);
    console.log('🔍 Profile displayName:', profile.displayName);
    console.log('🔍 Profile displayName type:', typeof profile.displayName);
    console.log('🔍 Profile displayName value:', JSON.stringify(profile.displayName));
  }

  if (isLoading) {
    return (
      <Section className="min-h-screen py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </Section>
    );
  }

  if (error || !profile) {
    return (
      <Section className="min-h-screen py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="p-8">
            <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
            <p className="text-muted-foreground mb-6">
              {error || 'This developer profile does not exist or has not been created yet.'}
            </p>
            <Link href="/">
              <Button>Go Back Home</Button>
            </Link>
          </Card>
        </div>
      </Section>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Helper function to safely render profile data
  const safeRender = (value: unknown, fallback: string = ''): string => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string') return value || fallback;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') {
      // If it's an object with a value property, extract it
      if (value && 'value' in value) return safeRender(value.value, fallback);
      // Otherwise, try to stringify it safely
      try {
        return JSON.stringify(value);
      } catch {
        return '[Object]';
      }
    }
    return String(value) || fallback;
  };

  const handleDeleteProfile = async () => {
    if (!isOwnProfile || !userAddress) return;

    setIsDeleting(true);
    try {
      console.log('🗑️ Deleting profile for user:', userAddress);

      // Import the contract deletion function and utilities
      const { deleteProfileOnContract } = await import('@/lib/contracts');
      const { DEV_CONFIG, ensureWalletConsistency, isUserSignedIn } = await import('@/lib/stacks');

      // Delete from blockchain first - the contract is deployed and working
      if (DEV_CONFIG.ENABLE_CONTRACT_CALLS) {
        console.log('🔗 Deleting profile from blockchain...');

        // Check if user is signed in first
        if (!isUserSignedIn()) {
          throw new Error('User is not signed in. Please sign in with your wallet and try again.');
        }

        // Ensure wallet consistency - this will throw an error if wallet is not consistent
        try {
          const sessionWallet = ensureWalletConsistency();
          console.log('✅ Wallet consistency verified for profile deletion:', sessionWallet);
        } catch (error) {
          console.error('❌ Wallet consistency error:', error);
          throw new Error('Wallet connection issue. Please reconnect your wallet and try again.');
        }

        await deleteProfileOnContract();
        console.log('✅ Profile deleted from blockchain successfully');
      } else {
        console.log('⚠️ Contract calls disabled, skipping blockchain deletion');
      }

      // Clean up local data after successful blockchain deletion
      ProfileCookies.deleteAllProfileData(userAddress);
      console.log('✅ Local profile data cleaned up successfully');

      console.log('✅ Profile deletion completed successfully');

      // Set success message
      if (DEV_CONFIG.ENABLE_CONTRACT_CALLS) {
        setDeletionMessage('Your profile has been successfully deleted from both the blockchain and local storage. You can now create a new profile if desired.');
      } else {
        setDeletionMessage('Your profile has been deleted from local storage. Blockchain deletion is currently disabled. You can now create a new profile.');
      }

      // Hide delete confirmation and show success modal
      setShowDeleteConfirm(false);
      setShowDeleteSuccess(true);

    } catch (error) {
      console.error('❌ Error deleting profile:', error);

      // Show the error message to the user
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setDeletionMessage(errorMessage);
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSuccessClose = () => {
    setShowDeleteSuccess(false);
    // Force a complete page reload to ensure all state is cleared
    // This prevents any cached profile data from showing
    window.location.href = '/';
  };

  return (
    <ErrorBoundary>
      <Section className="min-h-screen py-20">
        <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              {/* Avatar & Basic Info */}
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-stacks-600 to-bitcoin-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {safeRender(profile.displayName, 'Anonymous Developer').charAt(0).toUpperCase()}
                </div>

                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-2">{safeRender(profile.displayName, 'Anonymous Developer')}</h1>
                  <p className="text-muted-foreground font-mono text-sm mb-2">
                    {truncateAddress(profile.address)}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    {profile.location && (
                      <div className="flex items-center space-x-1">
                        <FiMapPin className="w-4 h-4" />
                        <span>{safeRender(profile.location)}</span>
                      </div>
                    )}
                    <div>Joined {formatDate(profile.joinedAt)}</div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <p className="text-foreground mb-6 leading-relaxed">{safeRender(profile.bio)}</p>

              {/* Social Links */}
              <div className="flex items-center space-x-4">
                {profile.websiteUrl && (
                  <a
                    href={profile.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <FiGlobe className="w-4 h-4" />
                    <span className="text-sm">Website</span>
                  </a>
                )}
                
                {profile.githubUsername && (
                  <a
                    href={`https://github.com/${profile.githubUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <FiGithub className="w-4 h-4" />
                    <span className="text-sm">GitHub</span>
                  </a>
                )}
                
                {profile.twitterHandle && (
                  <a
                    href={profile.twitterHandle.startsWith('http') ? profile.twitterHandle : `https://twitter.com/${profile.twitterHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <FiTwitter className="w-4 h-4" />
                    <span className="text-sm">Twitter</span>
                  </a>
                )}

                {profile.linkedinUsername && (
                  <a
                    href={profile.linkedinUsername.startsWith('http') ? profile.linkedinUsername : `https://linkedin.com/in/${profile.linkedinUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <FiLinkedin className="w-4 h-4" />
                    <span className="text-sm">LinkedIn</span>
                  </a>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {isOwnProfile && (
              <div className="mt-6 md:mt-0 flex space-x-3">
                <Link href="/profile/create?edit=true">
                  <Button variant="outline" className="flex items-center space-x-2 cursor-pointer">
                    <FiEdit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  className="flex items-center space-x-2 cursor-pointer text-red-600 border-red-600 hover:bg-red-50 hover:border-red-300"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <FiTrash2 className="w-4 h-4" />
                  <span>Delete Profile</span>
                </Button>
              </div>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats */}
          <div className="lg:col-span-1">
            <Card className="p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FiStar className="w-4 h-4 text-stacks-600" />
                    <span className="text-sm">Reputation</span>
                  </div>
                  <span className="font-semibold">{profile.reputation?.overall || 0}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FiUsers className="w-4 h-4 text-bitcoin-600" />
                    <span className="text-sm">Endorsements</span>
                  </div>
                  <span className="font-semibold">{profile.reputation?.communityEndorsements || 0}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FiCode className="w-4 h-4 text-foreground" />
                    <span className="text-sm">Projects</span>
                  </div>
                  <span className="font-semibold">{profile.portfolioProjects?.length || 0}</span>
                </div>
              </div>
            </Card>

            {/* Skills */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Skills</h2>
              <div className="space-y-2">
                {(profile.skills || []).map((skill, index) => (
                  <div
                    key={index}
                    className="px-3 py-1 bg-accent rounded-full text-sm"
                  >
                    {safeRender(skill)}
                  </div>
                ))}
              </div>
              
              {profile && 'specialties' in profile && Array.isArray(profile.specialties) && profile.specialties.length > 0 && (
                <>
                  <h3 className="text-md font-medium mt-6 mb-3">Stacks Specialties</h3>
                  <div className="space-y-2">
                    {(profile.specialties || []).map((specialty: string, index: number) => (
                      <div
                        key={index}
                        className="px-3 py-1 bg-stacks-600/10 text-stacks-600 rounded-full text-sm"
                      >
                        {safeRender(specialty)}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </div>

          {/* Projects & Activity */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Projects</h2>
              <div className="text-center py-12">
                <FiCode className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No projects yet</p>
                {isOwnProfile && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Add your first project to showcase your work
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md mx-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTrash2 className="w-6 h-6 text-red-600" />
              </div>

              <h3 className="text-lg font-semibold mb-2">Delete Profile</h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete your profile? This action cannot be undone and will permanently remove all your profile data from the blockchain.
              </p>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>

                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleDeleteProfile}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Deleting...</span>
                    </div>
                  ) : (
                    'Delete Profile'
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Success Modal */}
      {showDeleteSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md mx-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck className="w-6 h-6 text-green-600" />
              </div>

              <h3 className="text-lg font-semibold mb-2">Profile Deleted Successfully</h3>
              <p className="text-muted-foreground mb-6">
                {deletionMessage || 'Your profile has been successfully deleted. All your profile data has been removed from the platform.'}
              </p>

              <Button
                variant="primary"
                className="w-full"
                onClick={handleDeleteSuccessClose}
                animated
              >
                Continue to Home
              </Button>
            </div>
          </Card>
        </div>
      )}
      </Section>
    </ErrorBoundary>
  );
}
