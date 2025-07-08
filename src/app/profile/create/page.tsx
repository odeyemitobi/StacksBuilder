'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiUser, FiGithub, FiGlobe, FiTwitter, FiLinkedin, FiArrowLeft, FiCheck, FiSave } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Section } from '@/components/ui/section';
import { useStacksAuth, useProfile } from '@/hooks/useStacks';
import { CreateProfileForm } from '@/types';
import { ProfileCookies, MigrationUtils } from '@/lib/cookies';
import Link from 'next/link';

const SKILL_OPTIONS = [
  'Clarity Smart Contracts',
  'Bitcoin Development',
  'Stacks Blockchain',
  'DeFi Protocols',
  'NFT Development',
  'Frontend Development',
  'Backend Development',
  'Full Stack Development',
  'DevOps',
  'Security Auditing',
  'Technical Writing',
  'Community Building'
];

const SPECIALTY_OPTIONS = [
  'sBTC Integration',
  'Stacking Protocols',
  'Bitcoin L1/L2 Bridge',
  'Ordinals & BRC-20',
  'DeFi Yield Farming',
  'NFT Marketplaces',
  'Wallet Integration',
  'Smart Contract Security',
  'Cross-chain Development',
  'Developer Tooling'
];

export default function CreateProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';
  const { isSignedIn, userAddress, isLoading } = useStacksAuth();
  const { profile, isLoading: profileLoading } = useProfile(isEditMode && userAddress ? userAddress : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState<CreateProfileForm>({
    displayName: '',
    bio: '',
    location: '',
    website: '',
    githubUsername: '',
    twitterUsername: '',
    linkedinUsername: '',
    skills: [],
    specialties: []
  });

  // Run migration from localStorage to cookies on component mount
  useEffect(() => {
    if (userAddress) {
      MigrationUtils.migrateProfileData(userAddress);
    }
  }, [userAddress]);

  // Populate form with existing profile data when in edit mode
  useEffect(() => {
    if (isEditMode && profile) {
      setFormData({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.websiteUrl || '',
        githubUsername: profile.githubUsername || '',
        twitterUsername: profile.twitterHandle?.replace('https://twitter.com/', '') || '',
        linkedinUsername: '',
        skills: profile.skills || [],
        specialties: profile.specialties || []
      });
    }
  }, [isEditMode, profile]);

  // Show loading while profile is being fetched in edit mode
  if (isEditMode && profileLoading) {
    return (
      <Section className="min-h-screen py-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </Section>
    );
  }

  // Redirect if not signed in
  if (!isLoading && !isSignedIn) {
    return (
      <Section className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-muted-foreground mb-6">
            You need to connect your Stacks wallet to {isEditMode ? 'edit your profile' : 'create a developer profile'}.
          </p>
          <Link href="/">
            <Button>Go Back Home</Button>
          </Link>
        </Card>
      </Section>
    );
  }

  // In edit mode, redirect if no profile exists
  if (isEditMode && !profileLoading && !profile) {
    return (
      <Section className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">No Profile Found</h1>
          <p className="text-muted-foreground mb-6">
            You need to create a profile first before you can edit it.
          </p>
          <Link href="/profile/create">
            <Button>Create Profile</Button>
          </Link>
        </Card>
      </Section>
    );
  }

  const handleInputChange = (field: keyof CreateProfileForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSkillToggle = (skill: string, type: 'skills' | 'specialties') => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].includes(skill)
        ? prev[type].filter(s => s !== skill)
        : [...prev[type], skill]
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Implement smart contract call to save/update profile
      console.log(isEditMode ? 'Updated profile data:' : 'Profile data:', formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (userAddress) {
        // Store the actual profile data
        ProfileCookies.setProfileData(userAddress, formData);

        // Mark that this user has created a profile using secure cookies (only for create mode)
        if (!isEditMode) {
          ProfileCookies.setProfileCreated(userAddress);
          console.log('Profile creation marked in secure cookie for user:', userAddress);
        }

        console.log('Profile data stored in secure cookie for user:', userAddress);
      }

      // Redirect to profile page
      router.push(`/profile/${userAddress}`);
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} profile:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.displayName.trim() && formData.bio.trim();
      case 2:
        return formData.skills.length > 0;
      case 3:
        return true; // Social links are optional
      default:
        return false;
    }
  };

  if (isLoading) {
    return (
      <Section className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen py-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={isEditMode ? `/profile/${userAddress}` : "/"}
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 cursor-pointer"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            {isEditMode ? 'Back to Profile' : 'Back to Home'}
          </Link>

          <h1 className="text-3xl font-bold mb-2">
            {isEditMode ? 'Edit Your Profile' : 'Create Your Developer Profile'}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode
              ? 'Update your developer profile information'
              : 'Showcase your Bitcoin and Stacks development skills to the community'
            }
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${step <= currentStep ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}
              `}>
                {step < currentStep ? <FiCheck className="w-4 h-4" /> : step}
              </div>
              {step < 3 && (
                <div className={`
                  w-16 h-0.5 mx-2
                  ${step < currentStep ? 'bg-foreground' : 'bg-muted'}
                `} />
              )}
            </div>
          ))}
        </div>

        <Card className="p-8">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Display Name *</label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      placeholder="Your name or handle"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Bio *</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell us about yourself and your development experience..."
                      rows={4}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="City, Country"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Skills & Specialties */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-semibold mb-4">Skills & Specialties</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-3">Core Skills *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {SKILL_OPTIONS.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => handleSkillToggle(skill, 'skills')}
                          className={`
                            px-3 py-2 text-sm rounded-lg border transition-colors text-left cursor-pointer
                            ${formData.skills.includes(skill)
                              ? 'bg-foreground text-background border-foreground'
                              : 'bg-background border-border hover:border-foreground'
                            }
                          `}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3">Stacks Specialties</label>
                    <div className="grid grid-cols-2 gap-2">
                      {SPECIALTY_OPTIONS.map((specialty) => (
                        <button
                          key={specialty}
                          type="button"
                          onClick={() => handleSkillToggle(specialty, 'specialties')}
                          className={`
                            px-3 py-2 text-sm rounded-lg border transition-colors text-left cursor-pointer
                            ${formData.specialties.includes(specialty)
                              ? 'bg-foreground text-background border-foreground'
                              : 'bg-background border-border hover:border-foreground'
                            }
                          `}
                        >
                          {specialty}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Social Links */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-semibold mb-4">Social Links</h2>
                <p className="text-muted-foreground mb-6">Connect your social profiles (optional)</p>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <FiGlobe className="w-5 h-5 text-muted-foreground" />
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://yourwebsite.com"
                      className="flex-1 px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <FiGithub className="w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.githubUsername}
                      onChange={(e) => handleInputChange('githubUsername', e.target.value)}
                      placeholder="github-username"
                      className="flex-1 px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <FiTwitter className="w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.twitterUsername}
                      onChange={(e) => handleInputChange('twitterUsername', e.target.value)}
                      placeholder="twitter-handle"
                      className="flex-1 px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <FiLinkedin className="w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.linkedinUsername}
                      onChange={(e) => handleInputChange('linkedinUsername', e.target.value)}
                      placeholder="linkedin-username"
                      className="flex-1 px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            {currentStep < 3 ? (
              <Button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!isStepValid()}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>{isEditMode ? 'Updating...' : 'Creating Profile...'}</span>
                  </>
                ) : (
                  <>
                    {isEditMode ? <FiSave className="w-4 h-4" /> : <FiCheck className="w-4 h-4" />}
                    <span>{isEditMode ? 'Update Profile' : 'Create Profile'}</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </Section>
  );
}
