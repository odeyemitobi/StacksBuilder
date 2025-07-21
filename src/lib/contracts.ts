import {
  callReadOnlyFunction,
  contractPrincipalCV,
  standardPrincipalCV,
  stringAsciiCV,
  listCV,
  uintCV,
  cvToValue,
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
} from '@stacks/transactions';
import { getStacksNetwork } from './stacks';
import { openContractCall } from '@stacks/connect';

// Contract configuration
export const CONTRACT_CONFIG = {
  // Use environment variables for contract configuration
  CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  CONTRACT_NAME: process.env.NEXT_PUBLIC_CONTRACT_NAME || 'developer-profiles',
  get NETWORK() {
    return getStacksNetwork();
  },
};

// Types for our contract data
export interface ContractProfile {
  'display-name': string;
  bio: string;
  location: string;
  website: string;
  'github-username': string;
  'twitter-username': string;
  'linkedin-username': string;
  skills: string[];
  specialties: string[];
  'created-at': number;
  'updated-at': number;
  'is-verified': boolean;
}

export interface ContractProfileStats {
  'reputation-score': number;
  'endorsements-received': number;
  'projects-count': number;
  'contributions-count': number;
}

// Read-only contract functions

/**
 * Check if a profile exists for a given address
 */
export async function checkProfileExists(userAddress: string): Promise<boolean> {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_CONFIG.CONTRACT_ADDRESS,
      contractName: CONTRACT_CONFIG.CONTRACT_NAME,
      functionName: 'profile-exists',
      functionArgs: [standardPrincipalCV(userAddress)],
      network: CONTRACT_CONFIG.NETWORK,
      senderAddress: userAddress,
    });

    return cvToValue(result) as boolean;
  } catch (error) {
    console.error('Error checking profile existence:', error);
    return false;
  }
}

/**
 * Get profile data from contract
 */
export async function getProfileFromContract(userAddress: string): Promise<ContractProfile | null> {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_CONFIG.CONTRACT_ADDRESS,
      contractName: CONTRACT_CONFIG.CONTRACT_NAME,
      functionName: 'get-profile',
      functionArgs: [standardPrincipalCV(userAddress)],
      network: CONTRACT_CONFIG.NETWORK,
      senderAddress: userAddress,
    });

    const profileData = cvToValue(result);
    return profileData ? (profileData as ContractProfile) : null;
  } catch (error) {
    console.error('Error getting profile from contract:', error);
    return null;
  }
}

/**
 * Get profile statistics from contract
 */
export async function getProfileStatsFromContract(userAddress: string): Promise<ContractProfileStats | null> {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_CONFIG.CONTRACT_ADDRESS,
      contractName: CONTRACT_CONFIG.CONTRACT_NAME,
      functionName: 'get-profile-stats',
      functionArgs: [standardPrincipalCV(userAddress)],
      network: CONTRACT_CONFIG.NETWORK,
      senderAddress: userAddress,
    });

    const statsData = cvToValue(result);
    return statsData ? (statsData as ContractProfileStats) : null;
  } catch (error) {
    console.error('Error getting profile stats from contract:', error);
    return null;
  }
}

/**
 * Get total number of profiles
 */
export async function getTotalProfiles(): Promise<number> {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_CONFIG.CONTRACT_ADDRESS,
      contractName: CONTRACT_CONFIG.CONTRACT_NAME,
      functionName: 'get-total-profiles',
      functionArgs: [],
      network: CONTRACT_CONFIG.NETWORK,
      senderAddress: CONTRACT_CONFIG.CONTRACT_ADDRESS, // Use contract address as sender for read-only
    });

    return cvToValue(result) as number;
  } catch (error) {
    console.error('Error getting total profiles:', error);
    return 0;
  }
}

// Write contract functions (require user interaction)

/**
 * Create a new profile on the blockchain
 */
export async function createProfileOnContract(profileData: {
  displayName: string;
  bio: string;
  location: string;
  website: string;
  githubUsername: string;
  twitterUsername: string;
  linkedinUsername: string;
  skills: string[];
  specialties: string[];
}): Promise<void> {
  const functionArgs = [
    stringAsciiCV(profileData.displayName),
    stringAsciiCV(profileData.bio),
    stringAsciiCV(profileData.location),
    stringAsciiCV(profileData.website),
    stringAsciiCV(profileData.githubUsername),
    stringAsciiCV(profileData.twitterUsername),
    stringAsciiCV(profileData.linkedinUsername),
    listCV(profileData.skills.map(skill => stringAsciiCV(skill))),
    listCV(profileData.specialties.map(specialty => stringAsciiCV(specialty))),
  ];

  await openContractCall({
    network: CONTRACT_CONFIG.NETWORK,
    anchorMode: AnchorMode.Any,
    contractAddress: CONTRACT_CONFIG.CONTRACT_ADDRESS,
    contractName: CONTRACT_CONFIG.CONTRACT_NAME,
    functionName: 'create-profile',
    functionArgs,
    postConditionMode: PostConditionMode.Allow,
    onFinish: (data) => {
      console.log('Profile creation transaction submitted:', data.txId);
    },
    onCancel: () => {
      console.log('Profile creation cancelled');
    },
  });
}

/**
 * Update an existing profile on the blockchain
 */
export async function updateProfileOnContract(profileData: {
  displayName: string;
  bio: string;
  location: string;
  website: string;
  githubUsername: string;
  twitterUsername: string;
  linkedinUsername: string;
  skills: string[];
  specialties: string[];
}): Promise<void> {
  const functionArgs = [
    stringAsciiCV(profileData.displayName),
    stringAsciiCV(profileData.bio),
    stringAsciiCV(profileData.location),
    stringAsciiCV(profileData.website),
    stringAsciiCV(profileData.githubUsername),
    stringAsciiCV(profileData.twitterUsername),
    stringAsciiCV(profileData.linkedinUsername),
    listCV(profileData.skills.map(skill => stringAsciiCV(skill))),
    listCV(profileData.specialties.map(specialty => stringAsciiCV(specialty))),
  ];

  await openContractCall({
    network: CONTRACT_CONFIG.NETWORK,
    anchorMode: AnchorMode.Any,
    contractAddress: CONTRACT_CONFIG.CONTRACT_ADDRESS,
    contractName: CONTRACT_CONFIG.CONTRACT_NAME,
    functionName: 'update-profile',
    functionArgs,
    postConditionMode: PostConditionMode.Allow,
    onFinish: (data) => {
      console.log('Profile update transaction submitted:', data.txId);
    },
    onCancel: () => {
      console.log('Profile update cancelled');
    },
  });
}
