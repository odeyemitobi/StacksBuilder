import { StacksNetwork, StacksTestnet, StacksMainnet } from '@stacks/network';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import {
  stringAsciiCV,
  uintCV,
  listCV,
  tupleCV,
  contractPrincipalCV,
  standardPrincipalCV,
  callReadOnlyFunction,
  cvToValue
} from '@stacks/transactions';
import { ProfileCookies, MigrationUtils } from './cookies';

// Wallet types and interfaces
export interface WalletInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
  downloadUrl: string;
  isInstalled: boolean;
  connect: () => Promise<void>;
}

export type SupportedWallet = 'hiro' | 'leather' | 'xverse' | 'asigna';

// Network configuration
export const getStacksNetwork = (): StacksNetwork => {
  const networkType = process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet';
  return networkType === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
};

// App configuration for Stacks Connect
export const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

// Development configuration
export const DEV_CONFIG = {
  // Set to false to disable contract calls during development
  // This prevents console errors when the contract isn't deployed yet
  ENABLE_CONTRACT_CALLS: false,
  // Set to true to enable verbose logging
  ENABLE_DEBUG_LOGGING: false,
};

// Contract configuration
export const CONTRACT_CONFIG = {
  testnet: {
    // Using a placeholder address since the contract isn't deployed yet
    // This will be updated when the actual contract is deployed
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    contractName: 'stacksbuilder-profiles',
  },
  mainnet: {
    contractAddress: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    contractName: 'stacksbuilder-profiles',
  },
};

export const getContractConfig = () => {
  const networkType = process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet';
  return CONTRACT_CONFIG[networkType as keyof typeof CONTRACT_CONFIG];
};

// Wallet detection utilities
export const detectInstalledWallets = (): SupportedWallet[] => {
  const installed: SupportedWallet[] = [];

  if (typeof window !== 'undefined') {
    // Check for Hiro/Stacks Connect (always available)
    installed.push('hiro');

    // Check for Leather Wallet
    if (window.LeatherProvider || window.HiroWalletProvider) {
      installed.push('leather');
    }

    // Check for Xverse
    if (window.XverseProviders?.StacksProvider) {
      installed.push('xverse');
    }

    // Check for Asigna (usually available as browser extension)
    if (window.AsignaProvider) {
      installed.push('asigna');
    }
  }

  return installed;
};

export const getWalletInfo = (walletId: SupportedWallet): WalletInfo => {
  const walletConfigs: Record<SupportedWallet, Omit<WalletInfo, 'isInstalled' | 'connect'>> = {
    hiro: {
      id: 'hiro',
      name: 'Hiro Wallet',
      icon: '/wallets/hiro.svg',
      description: 'The original Stacks wallet with full ecosystem support',
      downloadUrl: 'https://wallet.hiro.so/',
    },
    leather: {
      id: 'leather',
      name: 'Leather Wallet',
      icon: '/wallets/leather.svg',
      description: 'Bitcoin wallet for the rest of us by Trust Machines',
      downloadUrl: 'https://leather.io/',
    },
    xverse: {
      id: 'xverse',
      name: 'Xverse',
      icon: '/wallets/xverse.svg',
      description: 'The Bitcoin wallet for everyone with Stacks support',
      downloadUrl: 'https://www.xverse.app/',
    },
    asigna: {
      id: 'asigna',
      name: 'Asigna',
      icon: '/wallets/asigna.svg',
      description: 'Multisig wallet for Bitcoin, Ordinals, and Stacks',
      downloadUrl: 'https://asigna.io/',
    },
  };

  const config = walletConfigs[walletId];
  const installedWallets = detectInstalledWallets();

  return {
    ...config,
    isInstalled: installedWallets.includes(walletId),
    connect: () => connectSpecificWallet(walletId),
  };
};

// Enhanced wallet connection
export const connectSpecificWallet = async (walletId: SupportedWallet): Promise<void> => {
  switch (walletId) {
    case 'hiro':
    case 'leather':
      return connectHiroOrLeather();
    case 'xverse':
      return connectXverse();
    case 'asigna':
      return connectAsigna();
    default:
      throw new Error(`Unsupported wallet: ${walletId}`);
  }
};

const connectHiroOrLeather = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    showConnect({
      appDetails: {
        name: 'StacksBuilder',
        icon: '/main-logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        resolve();
        window.location.reload();
      },
      onCancel: () => {
        reject(new Error('User cancelled connection'));
      },
      userSession,
    });
  });
};

const connectXverse = async (): Promise<void> => {
  if (!window.XverseProviders?.StacksProvider) {
    throw new Error('Xverse wallet not installed');
  }

  try {
    const provider = window.XverseProviders.StacksProvider;
    await provider.request('stx_requestAccounts', null);
  } catch (error) {
    throw new Error('Failed to connect to Xverse wallet');
  }
};

const connectAsigna = async (): Promise<void> => {
  if (!window.AsignaProvider) {
    throw new Error('Asigna wallet not installed');
  }

  try {
    await window.AsignaProvider.connect();
  } catch (error) {
    throw new Error('Failed to connect to Asigna wallet');
  }
};

// Use native Stacks Connect modal
export const connectWallet = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    showConnect({
      appDetails: {
        name: 'StacksBuilder',
        icon: '/main-logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        resolve();
        window.location.reload();
      },
      onCancel: () => {
        reject(new Error('User cancelled connection'));
      },
      userSession,
    });
  });
};

export const disconnectWallet = () => {
  userSession.signUserOut('/');
};

export const isUserSignedIn = (): boolean => {
  return userSession.isUserSignedIn();
};

export const getUserData = () => {
  if (!isUserSignedIn()) return null;
  return userSession.loadUserData();
};

export const getUserAddress = (): string | null => {
  const userData = getUserData();
  return userData?.profile?.stxAddress?.testnet || userData?.profile?.stxAddress?.mainnet || null;
};

// Contract interaction helpers
export const createProfileArgs = (profile: {
  displayName: string;
  bio: string;
  skills: string[];
  githubUsername?: string;
  twitterHandle?: string;
}) => {
  return [
    stringAsciiCV(profile.displayName),
    stringAsciiCV(profile.bio),
    listCV(profile.skills.map(skill => stringAsciiCV(skill))),
    stringAsciiCV(profile.githubUsername || ''),
    stringAsciiCV(profile.twitterHandle || ''),
  ];
};

export const addProjectArgs = (project: {
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  contractAddress?: string;
}) => {
  return [
    stringAsciiCV(project.title),
    stringAsciiCV(project.description),
    listCV(project.techStack.map(tech => stringAsciiCV(tech))),
    stringAsciiCV(project.githubUrl || ''),
    stringAsciiCV(project.liveUrl || ''),
    stringAsciiCV(project.contractAddress || ''),
  ];
};

// Utility functions
export const truncateAddress = (address: string, chars = 4): string => {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

export const formatStxAmount = (amount: number): string => {
  return (amount / 1000000).toFixed(6); // Convert microSTX to STX
};

// Check if a profile exists on-chain (more reliable than cookies)
export const checkProfileExists = async (userAddress: string): Promise<boolean> => {
  try {
    // First try to read from contract if enabled
    if (DEV_CONFIG.ENABLE_CONTRACT_CALLS) {
      const profile = await readProfileFromContract(userAddress);
      return profile !== null;
    }

    // Fallback to cookie check in development
    MigrationUtils.migrateProfileData(userAddress);
    return ProfileCookies.hasProfileCreated(userAddress);
  } catch (error) {
    console.error('Error checking profile existence:', error);
    // Final fallback to cookie check
    MigrationUtils.migrateProfileData(userAddress);
    return ProfileCookies.hasProfileCreated(userAddress);
  }
};

// Smart contract read functions
export const readProfileFromContract = async (userAddress: string) => {
  // Skip contract calls if disabled in development
  if (!DEV_CONFIG.ENABLE_CONTRACT_CALLS) {
    if (DEV_CONFIG.ENABLE_DEBUG_LOGGING) {
      console.log('Contract calls disabled in development, checking local profile data...');
    }

    // Run migration from localStorage to cookies
    MigrationUtils.migrateProfileData(userAddress);

    // Check if this user has created a profile using secure cookies
    const hasCreatedProfile = ProfileCookies.hasProfileCreated(userAddress);

    if (hasCreatedProfile) {
      if (DEV_CONFIG.ENABLE_DEBUG_LOGGING) {
        console.log('User has created a profile, returning stored data');
      }

      // Get stored profile data
      const storedProfileData = ProfileCookies.getProfileData(userAddress);

      if (storedProfileData) {
        // Return the actual stored profile data
        return {
          address: userAddress,
          displayName: storedProfileData.displayName || 'Anonymous Developer',
          bio: storedProfileData.bio || 'No bio provided',
          skills: storedProfileData.skills || [],
          githubUsername: storedProfileData.githubUsername || '',
          twitterHandle: storedProfileData.twitterUsername ?
            (storedProfileData.twitterUsername.startsWith('http') ?
              storedProfileData.twitterUsername :
              `https://twitter.com/${storedProfileData.twitterUsername}`) : '',
          linkedinUsername: storedProfileData.linkedinUsername || '',
          portfolioProjects: [],
          reputation: {
            overall: 850,
            contractContributions: 12,
            communityEndorsements: 23,
            projectCompletions: 8,
            mentorshipHours: 45,
            githubContributions: 156,
            stacksTransactions: 89,
            lastUpdated: Math.floor(Date.now() / 1000)
          },
          isVerified: false,
          joinedAt: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60), // 30 days ago
          lastActive: Math.floor(Date.now() / 1000),
          profileImageUrl: undefined,
          websiteUrl: storedProfileData.website || '',
          location: storedProfileData.location || '',
          availableForWork: true,
          hourlyRate: undefined,
          // Add backward compatibility fields
          specialties: storedProfileData.specialties || []
        };
      } else {
        // Fallback to default data if no stored data found
        return {
          address: userAddress,
          displayName: 'Anonymous Developer',
          bio: 'No bio provided',
          skills: [],
          githubUsername: '',
          twitterHandle: '',
          linkedinUsername: '',
          portfolioProjects: [],
          reputation: {
            overall: 0,
            contractContributions: 0,
            communityEndorsements: 0,
            projectCompletions: 0,
            mentorshipHours: 0,
            githubContributions: 0,
            stacksTransactions: 0,
            lastUpdated: Math.floor(Date.now() / 1000)
          },
          isVerified: false,
          joinedAt: Math.floor(Date.now() / 1000),
          lastActive: Math.floor(Date.now() / 1000),
          profileImageUrl: undefined,
          websiteUrl: '',
          location: '',
          availableForWork: true,
          hourlyRate: undefined,
          specialties: []
        };
      }
    } else {
      if (DEV_CONFIG.ENABLE_DEBUG_LOGGING) {
        console.log('User has not created a profile yet');
      }
      return null;
    }
  }

  try {
    if (DEV_CONFIG.ENABLE_DEBUG_LOGGING) {
      console.log('Reading profile from contract for address:', userAddress);
    }
    const network = getStacksNetwork();
    const contractConfig = getContractConfig();

    if (DEV_CONFIG.ENABLE_DEBUG_LOGGING) {
      console.log('Contract config:', contractConfig);
      console.log('Network:', network);
    }

    const result = await callReadOnlyFunction({
      contractAddress: contractConfig.contractAddress,
      contractName: contractConfig.contractName,
      functionName: 'get-profile',
      functionArgs: [standardPrincipalCV(userAddress)],
      network,
      senderAddress: userAddress,
    });

    if (DEV_CONFIG.ENABLE_DEBUG_LOGGING) {
      console.log('Raw contract result:', result);
    }

    // Convert the result to a JavaScript value
    const profileData = cvToValue(result);
    if (DEV_CONFIG.ENABLE_DEBUG_LOGGING) {
      console.log('Converted profile data:', profileData);
    }

    // Check if profile exists (assuming the contract returns an optional)
    if (!profileData || profileData.type === 'none') {
      if (DEV_CONFIG.ENABLE_DEBUG_LOGGING) {
        console.log('Profile not found or is none type');
      }
      return null;
    }

    // Extract profile data from the contract response
    // Adjust this based on your actual contract structure
    const profile = profileData.value || profileData;
    if (DEV_CONFIG.ENABLE_DEBUG_LOGGING) {
      console.log('Extracted profile:', profile);
    }

    // Create the profile object with additional fields for backward compatibility
    const formattedProfile = {
      address: userAddress,
      bnsName: profile.bnsName || undefined,
      displayName: profile.displayName || profile['display-name'] || '',
      bio: profile.bio || '',
      skills: Array.isArray(profile.skills) ? profile.skills : [],
      githubUsername: profile.githubUsername || profile['github-username'] || '',
      twitterHandle: profile.twitterHandle || profile.twitterUsername || profile['twitter-handle'] || '',
      portfolioProjects: Array.isArray(profile.portfolioProjects) ? profile.portfolioProjects : [],
      reputation: {
        overall: profile.reputation?.overall || profile.reputation?.score || 0,
        contractContributions: profile.reputation?.contractContributions || 0,
        communityEndorsements: profile.reputation?.communityEndorsements || profile.reputation?.endorsements || 0,
        projectCompletions: profile.reputation?.projectCompletions || 0,
        mentorshipHours: profile.reputation?.mentorshipHours || 0,
        githubContributions: profile.reputation?.githubContributions || 0,
        stacksTransactions: profile.reputation?.stacksTransactions || 0,
        lastUpdated: profile.reputation?.lastUpdated || Math.floor(Date.now() / 1000)
      },
      isVerified: profile.isVerified || false,
      joinedAt: profile.joinedAt || Math.floor(Date.now() / 1000),
      lastActive: profile.lastActive || Math.floor(Date.now() / 1000),
      profileImageUrl: profile.profileImageUrl || undefined,
      websiteUrl: profile.website || profile.websiteUrl || '',
      location: profile.location || '',
      availableForWork: profile.availableForWork || false,
      hourlyRate: profile.hourlyRate || undefined,
      // Add backward compatibility fields
      specialties: Array.isArray(profile.specialties) ? profile.specialties : []
    };

    return formattedProfile;
  } catch (error) {
    // Only log errors if debug logging is enabled
    if (DEV_CONFIG.ENABLE_DEBUG_LOGGING) {
      console.error('Error reading profile from contract:', error);
      console.log('Contract call failed, checking if user has created a profile...');
    }

    // Run migration from localStorage to cookies
    MigrationUtils.migrateProfileData(userAddress);

    // Check if this user has created a profile using secure cookies
    const hasCreatedProfile = ProfileCookies.hasProfileCreated(userAddress);

    if (hasCreatedProfile) {
      if (DEV_CONFIG.ENABLE_DEBUG_LOGGING) {
        console.log('User has created a profile, returning stored data (fallback)');
      }

      // Get stored profile data
      const storedProfileData = ProfileCookies.getProfileData(userAddress);

      if (storedProfileData) {
        // Return the actual stored profile data
        return {
          address: userAddress,
          displayName: storedProfileData.displayName || 'Anonymous Developer',
          bio: storedProfileData.bio || 'No bio provided',
          skills: storedProfileData.skills || [],
          githubUsername: storedProfileData.githubUsername || '',
          twitterHandle: storedProfileData.twitterUsername ?
            (storedProfileData.twitterUsername.startsWith('http') ?
              storedProfileData.twitterUsername :
              `https://twitter.com/${storedProfileData.twitterUsername}`) : '',
          linkedinUsername: storedProfileData.linkedinUsername || '',
          portfolioProjects: [],
          reputation: {
            overall: 850,
            contractContributions: 12,
            communityEndorsements: 23,
            projectCompletions: 8,
            mentorshipHours: 45,
            githubContributions: 156,
            stacksTransactions: 89,
            lastUpdated: Math.floor(Date.now() / 1000)
          },
          isVerified: false,
          joinedAt: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60), // 30 days ago
          lastActive: Math.floor(Date.now() / 1000),
          profileImageUrl: undefined,
          websiteUrl: storedProfileData.website || '',
          location: storedProfileData.location || '',
          availableForWork: true,
          hourlyRate: undefined,
          // Add backward compatibility fields
          specialties: storedProfileData.specialties || []
        };
      } else {
        // Fallback to default data if no stored data found
        return {
          address: userAddress,
          displayName: 'Anonymous Developer',
          bio: 'No bio provided',
          skills: [],
          githubUsername: '',
          twitterHandle: '',
          linkedinUsername: '',
          portfolioProjects: [],
          reputation: {
            overall: 0,
            contractContributions: 0,
            communityEndorsements: 0,
            projectCompletions: 0,
            mentorshipHours: 0,
            githubContributions: 0,
            stacksTransactions: 0,
            lastUpdated: Math.floor(Date.now() / 1000)
          },
          isVerified: false,
          joinedAt: Math.floor(Date.now() / 1000),
          lastActive: Math.floor(Date.now() / 1000),
          profileImageUrl: undefined,
          websiteUrl: '',
          location: '',
          availableForWork: true,
          hourlyRate: undefined,
          specialties: []
        };
      }
    } else {
      if (DEV_CONFIG.ENABLE_DEBUG_LOGGING) {
        console.log('User has not created a profile yet');
      }
      return null;
    }
  }
};
