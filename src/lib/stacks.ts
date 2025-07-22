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
import {
  checkProfileExists as contractCheckProfileExists,
  getProfileFromContract as contractGetProfile,
  createProfileOnContract,
  updateProfileOnContract
} from './contracts';

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

// Track which wallet is currently connected
let connectedWallet: SupportedWallet | null = null;

export const setConnectedWallet = (wallet: SupportedWallet) => {
  connectedWallet = wallet;
  if (typeof window !== 'undefined') {
    localStorage.setItem('stacksbuilder_connected_wallet', wallet);
  }
};

export const getConnectedWallet = (): SupportedWallet | null => {
  if (connectedWallet) return connectedWallet;

  // If user is signed in, check localStorage for the stored wallet
  if (typeof window !== 'undefined' && isUserSignedIn()) {
    const stored = localStorage.getItem('stacksbuilder_connected_wallet');
    if (stored && ['hiro', 'leather', 'xverse', 'asigna'].includes(stored)) {
      connectedWallet = stored as SupportedWallet;
      console.log(`🔍 Retrieved stored wallet: ${connectedWallet}`);
      return connectedWallet;
    }

    // If no stored wallet but user is signed in, try to detect the wallet
    console.log('🔍 User is signed in but no wallet stored, attempting detection...');
    const detectedWallet = detectCurrentWallet();
    if (detectedWallet) {
      console.log(`🔍 Auto-detected wallet: ${detectedWallet}`);
      setConnectedWallet(detectedWallet);
      return detectedWallet;
    }

    console.warn('⚠️ User is signed in but no wallet type could be determined.');
  }

  return null;
};

export const clearConnectedWallet = () => {
  connectedWallet = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('stacksbuilder_connected_wallet');
  }
};

// Detect which wallet is currently being used
export const detectCurrentWallet = (): SupportedWallet | null => {
  if (typeof window === 'undefined') return null;

  // Check for wallet-specific indicators
  const hasLeather = window.LeatherProvider || window.HiroWalletProvider;
  const hasXverse = window.XverseProviders?.StacksProvider;
  const hasAsigna = window.AsignaProvider;

  // Try to determine which wallet was used for the current session
  // This is a best-guess approach based on available providers
  if (hasLeather) {
    return 'leather';
  } else if (hasXverse) {
    return 'xverse';
  } else if (hasAsigna) {
    return 'asigna';
  } else {
    // Default to hiro if no specific wallet is detected
    return 'hiro';
  }
};

// Force set a specific wallet (for debugging/fixing wallet detection issues)
export const forceSetWallet = (wallet: SupportedWallet) => {
  console.log(`🔧 Force setting wallet to: ${wallet}`);
  setConnectedWallet(wallet);
};

// Verify wallet consistency and availability
export const verifyWalletConsistency = (): {
  isConsistent: boolean;
  connectedWallet: SupportedWallet | null;
  isAvailable: boolean;
  message: string;
} => {
  // First check if user is actually signed in
  if (!isUserSignedIn()) {
    return {
      isConsistent: false,
      connectedWallet: null,
      isAvailable: false,
      message: 'User is not signed in'
    };
  }

  const wallet = getConnectedWallet();

  if (!wallet) {
    // Try one more time to detect the wallet
    const detectedWallet = detectCurrentWallet();
    if (detectedWallet) {
      console.log(`🔧 Auto-fixing wallet detection: ${detectedWallet}`);
      setConnectedWallet(detectedWallet);
      return {
        isConsistent: true,
        connectedWallet: detectedWallet,
        isAvailable: true,
        message: `Auto-detected ${detectedWallet} wallet`
      };
    }

    return {
      isConsistent: false,
      connectedWallet: null,
      isAvailable: false,
      message: 'No wallet connected'
    };
  }

  // Check if the connected wallet is still available
  const installedWallets = detectInstalledWallets();
  const isAvailable = installedWallets.includes(wallet);

  if (!isAvailable) {
    return {
      isConsistent: false,
      connectedWallet: wallet,
      isAvailable: false,
      message: `${wallet} wallet is no longer available`
    };
  }

  return {
    isConsistent: true,
    connectedWallet: wallet,
    isAvailable: true,
    message: `${wallet} wallet is ready for transactions`
  };
};

// Development configuration
export const DEV_CONFIG = {
  // Set to false to disable contract calls during development
  // This prevents console errors when the contract isn't deployed yet
  ENABLE_CONTRACT_CALLS: true, // Enable contract calls for testing
  // Set to true to enable verbose logging
  ENABLE_DEBUG_LOGGING: true, // Enable debug logging
};

// Global error handler for wallet provider conflicts and chunk load errors
if (typeof window !== 'undefined') {
  // Suppress common wallet provider errors that don't affect functionality
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');

    // Suppress known harmless wallet provider errors
    if (
      message.includes('Unable to set StacksProvider') ||
      message.includes('StacksProvider already exists') ||
      message.includes('Provider conflict') ||
      message.includes('Multiple wallet providers detected')
    ) {
      // Log as debug instead of error for these known issues
      console.debug('🔧 Wallet provider conflict (harmless):', ...args);
      return;
    }

    // Handle ChunkLoadError gracefully
    if (message.includes('ChunkLoadError') || message.includes('Loading chunk')) {
      console.warn('⚠️ Chunk load error detected, this is usually harmless:', ...args);
      return;
    }

    // Let other errors through normally
    originalConsoleError.apply(console, args);
  };

  // Handle unhandled promise rejections for chunk errors
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.name === 'ChunkLoadError' ||
        event.reason?.message?.includes('Loading chunk') ||
        event.reason?.message?.includes('ChunkLoadError')) {
      console.warn('⚠️ Chunk load error caught and handled gracefully');
      event.preventDefault(); // Prevent the error from being logged
    }
  });
}

// Contract configuration - using the deployed contracts with delete functionality
export const CONTRACT_CONFIG = {
  testnet: {
    // Using the actual deployed testnet contract with delete functionality
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    contractName: 'developer-profiles-v2',
  },
  mainnet: {
    contractAddress: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    contractName: 'developer-profiles-v2',
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
    try {
      if (window.LeatherProvider || window.HiroWalletProvider) {
        installed.push('leather');
      }
    } catch (error) {
      // Silently handle provider detection errors
      console.debug('Leather wallet detection failed:', error);
    }

    // Check for Xverse
    try {
      if (window.XverseProviders?.StacksProvider) {
        installed.push('xverse');
      }
    } catch (error) {
      // Silently handle provider detection errors
      console.debug('Xverse wallet detection failed:', error);
    }

    // Check for Asigna (usually available as browser extension)
    try {
      if (window.AsignaProvider) {
        installed.push('asigna');
      }
    } catch (error) {
      // Silently handle provider detection errors
      console.debug('Asigna wallet detection failed:', error);
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
  console.log(`🔗 Connecting to specific wallet: ${walletId}`);

  switch (walletId) {
    case 'hiro':
      return connectHiroOrLeather('hiro');
    case 'leather':
      return connectHiroOrLeather('leather');
    case 'xverse':
      return connectXverse();
    case 'asigna':
      return connectAsigna();
    default:
      throw new Error(`Unsupported wallet: ${walletId}`);
  }
};

const connectHiroOrLeather = (specificWallet?: 'hiro' | 'leather'): Promise<void> => {
  return new Promise((resolve, reject) => {
    showConnect({
      appDetails: {
        name: 'StacksBuilder',
        icon: '/main-logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        // Track the specific wallet that was connected
        if (specificWallet) {
          setConnectedWallet(specificWallet);
          console.log(`✅ Connected to ${specificWallet} wallet`);
        } else {
          // Try to detect which wallet was actually used for the connection
          const hasLeather = typeof window !== 'undefined' &&
            ((window as any).LeatherProvider || (window as any).HiroWalletProvider);
          const hasXverse = typeof window !== 'undefined' &&
            (window as any).XverseProviders?.StacksProvider;
          const hasAsigna = typeof window !== 'undefined' &&
            (window as any).AsignaProvider;

          // Default detection logic - prefer Leather if available since it's commonly used with Stacks Connect
          let detectedWallet: SupportedWallet = 'hiro';
          if (hasLeather) {
            detectedWallet = 'leather';
          } else if (hasXverse) {
            detectedWallet = 'xverse';
          } else if (hasAsigna) {
            detectedWallet = 'asigna';
          }

          setConnectedWallet(detectedWallet);
          console.log(`✅ Connected to detected wallet: ${detectedWallet}`);
          console.log(`🔍 Detection details: Leather=${hasLeather}, Xverse=${hasXverse}, Asigna=${hasAsigna}`);
        }
        resolve();
        // Use router refresh instead of hard reload to prevent chunk errors
        if (typeof window !== 'undefined') {
          // Make sure the wallet is properly stored
          setTimeout(() => {
            const currentWallet = getConnectedWallet();
            if (!currentWallet) {
              const detected = detectCurrentWallet();
              if (detected) {
                console.log(`🔧 Post-connection wallet fix: ${detected}`);
                setConnectedWallet(detected);
              }
            }
            window.dispatchEvent(new Event('wallet-connected'));
          }, 100);
        }
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
    // Track that Xverse is connected
    setConnectedWallet('xverse');
    console.log('✅ Successfully connected to Xverse wallet');
  } catch (error) {
    // Handle provider conflicts gracefully
    if (error instanceof Error && error.message.includes('StacksProvider')) {
      console.warn('⚠️ Xverse provider conflict detected, but connection may still work');
      // Still try to set the wallet as connected since the user interaction succeeded
      setConnectedWallet('xverse');
      return;
    }
    throw new Error(`Failed to connect to Xverse wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const connectAsigna = async (): Promise<void> => {
  if (!window.AsignaProvider) {
    throw new Error('Asigna wallet not installed');
  }

  try {
    await window.AsignaProvider.connect();
    // Track that Asigna is connected
    setConnectedWallet('asigna');
    console.log('✅ Connected to Asigna wallet');
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
        // Use router refresh instead of hard reload to prevent chunk errors
        if (typeof window !== 'undefined') {
          // Make sure the wallet is properly stored
          setTimeout(() => {
            const currentWallet = getConnectedWallet();
            if (!currentWallet) {
              const detected = detectCurrentWallet();
              if (detected) {
                console.log(`🔧 Post-connection wallet fix: ${detected}`);
                setConnectedWallet(detected);
              }
            }
            window.dispatchEvent(new Event('wallet-connected'));
          }, 100);
        }
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
  clearConnectedWallet();
  // Dispatch event to update UI state without page reload
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('wallet-disconnected'));
  }
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
      if (DEV_CONFIG.ENABLE_DEBUG_LOGGING) {
        console.log('Checking profile existence on contract for:', userAddress);
      }

      try {
        const contractExists = await contractCheckProfileExists(userAddress);

        // Only update local state if we successfully checked the contract
        // If contract says profile doesn't exist, make sure local state is consistent
        if (!contractExists) {
          if (DEV_CONFIG.ENABLE_DEBUG_LOGGING) {
            console.log('Contract confirmed profile does not exist, cleaning up local data');
          }
          ProfileCookies.removeProfileCreated(userAddress);
          ProfileCookies.removeProfileData(userAddress);
        }

        return contractExists;
      } catch (contractError) {
        // Contract call failed - this could be due to network issues, provider problems, etc.
        // DO NOT delete local data in this case, just fall back to local check
        console.warn('⚠️ Contract call failed, falling back to local check. This is normal during wallet connection issues.');
        console.warn('Error details:', contractError);

        // Fallback to cookie check when contract is unreachable
        MigrationUtils.migrateProfileData(userAddress);
        const cookieExists = ProfileCookies.hasProfileCreated(userAddress);

        if (DEV_CONFIG.ENABLE_DEBUG_LOGGING) {
          console.log('📋 Contract unreachable, using local cookie check. Profile exists:', cookieExists);
        } else {
          console.log('📋 Using local profile data due to network issues. Profile exists:', cookieExists);
        }

        return cookieExists;
      }
    }

    // Fallback to cookie check in development
    MigrationUtils.migrateProfileData(userAddress);
    const cookieExists = ProfileCookies.hasProfileCreated(userAddress);

    if (DEV_CONFIG.ENABLE_DEBUG_LOGGING) {
      console.log('Contract calls disabled, using cookie check. Profile exists:', cookieExists);
    }

    return cookieExists;
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

    // Use our new contract function
    const contractProfile = await contractGetProfile(userAddress);

    if (!contractProfile) {
      if (DEV_CONFIG.ENABLE_DEBUG_LOGGING) {
        console.log('Profile not found on contract, checking if user has local profile data...');
      }

      // Check if user has created a profile but blockchain hasn't confirmed yet
      const hasCreatedProfile = ProfileCookies.hasProfileCreated(userAddress);
      if (hasCreatedProfile) {
        if (DEV_CONFIG.ENABLE_DEBUG_LOGGING) {
          console.log('User has created profile locally, returning stored data while waiting for blockchain confirmation');
        }

        // Get stored profile data as fallback
        const storedProfileData = ProfileCookies.getProfileData(userAddress);
        if (storedProfileData) {
          return {
            address: userAddress,
            displayName: storedProfileData.displayName || 'Anonymous Developer',
            bio: storedProfileData.bio || 'No bio provided',
            skills: storedProfileData.skills || [],
            githubUsername: storedProfileData.githubUsername || '',
            twitterHandle: storedProfileData.twitterUsername || '',
            linkedinUsername: storedProfileData.linkedinUsername || '',
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
            websiteUrl: storedProfileData.website || '',
            location: storedProfileData.location || '',
            availableForWork: true,
            hourlyRate: undefined,
            specialties: storedProfileData.specialties || []
          };
        }
      }

      return null;
    }

    if (DEV_CONFIG.ENABLE_DEBUG_LOGGING) {
      console.log('Contract profile data:', contractProfile);
    }

    // Convert contract profile to our expected format
    const profileData = contractProfile;
    if (DEV_CONFIG.ENABLE_DEBUG_LOGGING) {
      console.log('Converted profile data:', profileData);
      console.log('Profile displayName from contract:', profileData.displayName);
      console.log('Profile displayName type:', typeof profileData.displayName);
    }

    // Create the profile object with additional fields for backward compatibility
    // Note: contractProfile already has camelCase field names from the conversion
    const formattedProfile = {
      address: userAddress,
      bnsName: undefined,
      displayName: profileData.displayName || '',
      bio: profileData.bio || '',
      location: profileData.location || '',
      website: profileData.website || '',
      skills: Array.isArray(profileData.skills) ? profileData.skills : [],
      specialties: Array.isArray(profileData.specialties) ? profileData.specialties : [],
      githubUsername: profileData.githubUsername || '',
      twitterHandle: profileData.twitterUsername ?
        (profileData.twitterUsername.startsWith('http') ?
          profileData.twitterUsername :
          `https://twitter.com/${profileData.twitterUsername}`) : '',
      linkedinUsername: profileData.linkedinUsername || '',
      portfolioProjects: [],
      reputation: {
        overall: 850, // Default reputation score
        contractContributions: 12,
        communityEndorsements: 23,
        projectCompletions: 8,
        mentorshipHours: 45,
        githubContributions: 156,
        stacksTransactions: 89,
        lastUpdated: Math.floor(Date.now() / 1000)
      },
      isVerified: profileData.isVerified || false,
      joinedAt: profileData.createdAt || Math.floor(Date.now() / 1000),
      lastActive: profileData.updatedAt || Math.floor(Date.now() / 1000),
      profileImageUrl: undefined,
      websiteUrl: profileData.website || '',
      availableForWork: false,
      hourlyRate: undefined
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
        console.log('User has created a profile, returning stored data (fallback due to contract read failure)');
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
