'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiMapPin, FiGlobe, FiGithub, FiTwitter, FiLinkedin, FiEdit, FiStar, FiUsers, FiCode } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Section } from '@/components/ui/section';
import { useStacksAuth, useProfile } from '@/hooks/useStacks';
import { DeveloperProfile } from '@/types';
import Link from 'next/link';

export default function ProfilePage() {
  const params = useParams();
  const address = params.address as string;
  const { userAddress } = useStacksAuth();
  const { profile, isLoading, error } = useProfile(address);

  const isOwnProfile = userAddress === address;

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

  return (
    <Section className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              {/* Avatar & Basic Info */}
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-stacks-600 to-bitcoin-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {profile.displayName.charAt(0).toUpperCase()}
                </div>
                
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-2">{profile.displayName}</h1>
                  <p className="text-muted-foreground font-mono text-sm mb-2">
                    {truncateAddress(profile.address)}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    {profile.location && (
                      <div className="flex items-center space-x-1">
                        <FiMapPin className="w-4 h-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    <div>Joined {formatDate(profile.joinedAt)}</div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <p className="text-foreground mb-6 leading-relaxed">{profile.bio}</p>

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

            {/* Action Button */}
            {isOwnProfile && (
              <div className="mt-6 md:mt-0">
                <Link href="/profile/create?edit=true">
                  <Button variant="outline" className="flex items-center space-x-2 cursor-pointer">
                    <FiEdit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </Button>
                </Link>
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
                {profile.skills.map((skill) => (
                  <div
                    key={skill}
                    className="px-3 py-1 bg-accent rounded-full text-sm"
                  >
                    {skill}
                  </div>
                ))}
              </div>
              
              {(profile as any).specialties && (profile as any).specialties.length > 0 && (
                <>
                  <h3 className="text-md font-medium mt-6 mb-3">Stacks Specialties</h3>
                  <div className="space-y-2">
                    {(profile as any).specialties.map((specialty: string) => (
                      <div
                        key={specialty}
                        className="px-3 py-1 bg-stacks-600/10 text-stacks-600 rounded-full text-sm"
                      >
                        {specialty}
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
    </Section>
  );
}
