import { StacksNetwork, StacksTestnet, StacksMainnet } from '@stacks/network';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import {
  stringAsciiCV,
  listCV
} from '@stacks/transactions';
import { ProfileCookies, MigrationUtils } from './cookies';
import {
  checkProfileExists as contractCheckProfileExists,
  getProfileFromContract as contractGetProfile
} from './contracts';
import { DeveloperProfile } from '@/types';

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

// Prevent multiple wallet connection attempts
let isConnecting = false;

// Store the wallet that was used for authentication
// This ensures we use the same wallet for all operations
export const setConnectedWallet = (wallet: SupportedWallet) => {
  connectedWallet = wallet;
  if (typeof window !== 'undefined') {
    // Store in localStorage for persistence across page refreshes
    localStorage.setItem('stacksbuilder_connected_wallet', wallet);
    // Also store in sessionStorage to ensure it's available in the current session
    sessionStorage.setItem('stacksbuilder_session_wallet', wallet);
    console.log(`🔐 Wallet set for session: ${wallet}`);
  }
};

export const getConnectedWallet = (): SupportedWallet | null => {
  // First check memory variable for fastest access
  if (connectedWallet) return connectedWallet;

  // If user is signed in, try multiple sources to determine the wallet
  if (typeof window !== 'undefined' && isUserSignedIn()) {
    // 1. First check sessionStorage (highest priority - represents current session)
    const sessionWallet = sessionStorage.getItem('stacksbuilder_session_wallet');
    if (sessionWallet && ['hiro', 'leather', 'xverse', 'asigna'].includes(sessionWallet)) {
      connectedWallet = sessionWallet as SupportedWallet;
      console.log(`🔍 Retrieved session wallet: ${connectedWallet}`);
      return connectedWallet;
    }

    // 2. Then check localStorage (persisted from previous sessions)
    const storedWallet = localStorage.getItem('stacksbuilder_connected_wallet');
    if (storedWallet && ['hiro', 'leather', 'xverse', 'asigna'].includes(storedWallet)) {
      connectedWallet = storedWallet as SupportedWallet;
      console.log(`🔍 Retrieved stored wallet: ${connectedWallet}`);
      // Also update sessionStorage to maintain consistency
      sessionStorage.setItem('stacksbuilder_session_wallet', connectedWallet);
      return connectedWallet;
    }

    // 3. Only attempt detection if no wallet preference is stored anywhere
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
    sessionStorage.removeItem('stacksbuilder_session_wallet');
  }
};

// Detect which wallet is currently being used
export const detectCurrentWallet = (): SupportedWallet | null => {
  if (typeof window === 'undefined') return null;

  // First, check memory variable and storage directly (avoid circular dependency)
  if (connectedWallet) {
    console.log(`🔍 Found wallet in memory: ${connectedWallet}`);
    return connectedWallet;
  }

  // Check localStorage and sessionStorage directly
  const localWallet = localStorage.getItem('stacksbuilder_connected_wallet') as SupportedWallet | null;
  const sessionWallet = sessionStorage.getItem('stacksbuilder_session_wallet') as SupportedWallet | null;

  if (sessionWallet) {
    console.log(`🔍 Found wallet in session storage: ${sessionWallet}`);
    connectedWallet = sessionWallet; // Update memory variable
    return sessionWallet;
  }

  if (localWallet) {
    console.log(`🔍 Found wallet in local storage: ${localWallet}`);
    connectedWallet = localWallet; // Update memory variable
    return localWallet;
  }

  // If user is signed in but no wallet is stored, try to detect from available providers
  if (isUserSignedIn()) {
    console.log('🔍 User is signed in, attempting wallet detection from providers...');

    // Check which wallet providers are available
    const hasXverse = !!window.XverseProviders?.StacksProvider;
    const hasLeather = !!window.LeatherProvider || !!window.HiroWalletProvider;
    const hasAsigna = !!window.AsignaProvider;

    console.log(`🔍 Available providers: Xverse=${hasXverse}, Leather=${hasLeather}, Asigna=${hasAsigna}`);

    // If only one wallet is available, it's likely the one that was used
    const availableWallets = [];
    if (hasXverse) availableWallets.push('xverse');
    if (hasLeather) availableWallets.push('leather');
    if (hasAsigna) availableWallets.push('asigna');

    if (availableWallets.length === 1) {
      const detectedWallet = availableWallets[0] as SupportedWallet;
      console.log(`🎯 Only one wallet available, using: ${detectedWallet}`);
      return detectedWallet; // Don't auto-store, let the connection process handle it
    }

    // If multiple wallets are available, we cannot reliably detect which one was used
    // Return null to avoid overriding user's actual choice
    console.log('🔍 Multiple wallets available, cannot auto-detect - user must explicitly connect');
    return null;
  }

  console.log('🔍 Could not detect wallet - no providers available or user not signed in');
  return null;
};

// Force set a specific wallet (for debugging/fixing wallet detection issues)
export const forceSetWallet = (wallet: SupportedWallet) => {
  console.log(`🔧 Force setting wallet to: ${wallet}`);
  setConnectedWallet(wallet);

  // Also dispatch event to update UI
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('wallet-connected', {
      detail: { wallet }
    }));
  }
};

// Force refresh wallet state after connection issues
export const refreshWalletState = () => {
  console.log('🔄 Refreshing wallet state...');

  // Clear memory cache
  connectedWallet = null;

  // Try to get the wallet again
  const wallet = getConnectedWallet();
  console.log(`🔄 Refreshed wallet state: ${wallet}`);

  // Dispatch event to update UI
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('wallet-state-refreshed', {
      detail: { wallet }
    }));
  }

  return wallet;
};

// Monitor and protect wallet selection after connection
export const protectWalletSelection = (expectedWallet: SupportedWallet) => {
  console.log(`🛡️ Protecting wallet selection: ${expectedWallet}`);

  // Set up a monitoring interval
  let attempts = 0;
  const maxAttempts = 10;

  const monitor = setInterval(() => {
    attempts++;
    const currentWallet = getConnectedWallet();

    if (currentWallet !== expectedWallet) {
      console.warn(`⚠️ Wallet selection changed from ${expectedWallet} to ${currentWallet}, restoring...`);
      setConnectedWallet(expectedWallet);
    } else {
      console.log(`✅ Wallet selection protected: ${currentWallet}`);
    }

    if (attempts >= maxAttempts) {
      clearInterval(monitor);
      console.log(`🛡️ Wallet protection monitoring completed after ${attempts} checks`);
    }
  }, 500);

  // Clear monitoring after 5 seconds
  setTimeout(() => {
    clearInterval(monitor);
    console.log('🛡️ Wallet protection monitoring timeout');
  }, 5000);
};

// Debug function to check wallet state (can be called from browser console)
export const debugWalletState = () => {
  console.log('🔍 === WALLET DEBUG INFO ===');
  console.log('Memory variable:', connectedWallet);
  console.log('LocalStorage:', localStorage.getItem('stacksbuilder_connected_wallet'));
  console.log('SessionStorage:', sessionStorage.getItem('stacksbuilder_session_wallet'));
  console.log('User signed in:', isUserSignedIn());
  console.log('User address:', getUserAddress());
  console.log('getConnectedWallet():', getConnectedWallet());
  console.log('detectCurrentWallet():', detectCurrentWallet());
  console.log('Available providers:', {
    xverse: !!window.XverseProviders?.StacksProvider,
    leather: !!window.LeatherProvider || !!window.HiroWalletProvider,
    asigna: !!window.AsignaProvider
  });
  console.log('=========================');
};

// Test wallet provider availability and conflicts
export const testWalletProviders = () => {
  console.log('🔍 === WALLET PROVIDER TEST ===');

  // Test Xverse providers
  console.log('Xverse Providers:');
  console.log('  window.XverseProviders:', !!window.XverseProviders);
  console.log('  window.XverseProviders.StacksProvider:', !!window.XverseProviders?.StacksProvider);

  // Test Leather providers
  console.log('Leather Providers:');
  console.log('  window.LeatherProvider:', !!window.LeatherProvider);
  console.log('  window.HiroWalletProvider:', !!window.HiroWalletProvider);

  // Test Asigna providers
  console.log('Asigna Providers:');
  console.log('  window.AsignaProvider:', !!window.AsignaProvider);

  // Test for provider conflicts
  const providers = [];
  if (window.XverseProviders?.StacksProvider) providers.push('Xverse');
  if (window.LeatherProvider) providers.push('Leather');
  if (window.HiroWalletProvider) providers.push('Hiro');
  if (window.AsignaProvider) providers.push('Asigna');

  console.log(`Active providers: ${providers.join(', ')}`);

  if (providers.length > 1) {
    console.warn('⚠️ Multiple wallet providers detected - this may cause conflicts');
  }

  console.log('================================');
};

// Manual wallet selection for provider conflict situations
export const manuallySetWallet = (walletId: SupportedWallet) => {
  console.log(`🔧 Manually setting wallet to: ${walletId}`);

  // Clear any existing wallet data
  clearConnectedWallet();

  // Set the new wallet
  setConnectedWallet(walletId);

  // Start protection
  protectWalletSelection(walletId);

  // Dispatch events
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('wallet-connected', {
      detail: { wallet: walletId }
    }));
    window.dispatchEvent(new CustomEvent('wallet-state-refreshed', {
      detail: { wallet: walletId }
    }));
  }

  console.log(`✅ Wallet manually set to: ${walletId}`);
  return walletId;
};

// Auto-detect and fix wallet issues on page load
export const autoFixWalletDetection = () => {
  if (typeof window === 'undefined') return;

  // Only run if user is signed in but no wallet is detected
  if (isUserSignedIn() && !getConnectedWallet()) {
    console.log('🔍 Auto-fixing wallet detection...');

    const installedWallets = detectInstalledWallets().filter(w => w !== 'hiro');

    // If only one non-Hiro wallet is installed, automatically select it
    if (installedWallets.length === 1) {
      const autoWallet = installedWallets[0];
      console.log(`🔧 Auto-selecting ${autoWallet} wallet (only option available)`);
      manuallySetWallet(autoWallet);
      return autoWallet;
    }

    // If multiple wallets, check for common patterns or preferences
    const preferredOrder = ['xverse', 'leather', 'asigna'] as const;
    for (const preferred of preferredOrder) {
      if (installedWallets.includes(preferred)) {
        console.log(`🔧 Auto-selecting ${preferred} wallet (preferred option)`);
        manuallySetWallet(preferred);
        return preferred;
      }
    }
  }

  return null;
};

// Make debug function available globally for console access
if (typeof window !== 'undefined') {
  window.debugWalletState = debugWalletState;
  window.forceSetWallet = forceSetWallet;
  window.refreshWalletState = refreshWalletState;
  window.protectWalletSelection = protectWalletSelection;
  window.testWalletProviders = testWalletProviders;
  window.manuallySetWallet = manuallySetWallet;
  window.autoFixWalletDetection = autoFixWalletDetection;

  // Auto-run wallet detection fix on page load
  setTimeout(() => {
    autoFixWalletDetection();
  }, 1000);
}

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

// Get the wallet that should be used for all operations
// This ensures consistency throughout the user session
export const getSessionWallet = (): SupportedWallet | null => {
  const wallet = getConnectedWallet();
  if (wallet) {
    console.log(`🎯 Using session wallet: ${wallet}`);
    return wallet;
  }

  console.warn('⚠️ No session wallet found');
  return null;
};

// Ensure the same wallet is used for all blockchain operations
export const ensureWalletConsistency = (): SupportedWallet => {
  const walletCheck = verifyWalletConsistency();

  if (!walletCheck.isConsistent || !walletCheck.connectedWallet) {
    throw new Error(`Wallet consistency error: ${walletCheck.message}. Please reconnect your wallet.`);
  }

  console.log(`✅ Wallet consistency verified: ${walletCheck.connectedWallet}`);
  return walletCheck.connectedWallet;
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
  if (isConnecting) {
    throw new Error('Another wallet connection is already in progress. Please wait.');
  }

  isConnecting = true;
  console.log(`🔗 Connecting to specific wallet: ${walletId}`);

  try {
    switch (walletId) {
      case 'hiro':
        return await connectHiroOrLeather('hiro');
      case 'leather':
        return await connectHiroOrLeather('leather');
      case 'xverse':
        return await connectXverse();
      case 'asigna':
        return await connectAsigna();
      default:
        throw new Error(`Unsupported wallet: ${walletId}`);
    }
  } finally {
    isConnecting = false;
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
          // Use the manual wallet setting to bypass any provider conflicts
          manuallySetWallet(specificWallet);
          console.log(`✅ Connected to ${specificWallet} wallet`);
        } else {
          // When no specific wallet is provided, we can't reliably detect which one was used
          // The Stacks Connect modal doesn't provide this information
          // Default to 'leather' since it's the most common wallet used with Stacks Connect
          const defaultWallet: SupportedWallet = 'leather';
          manuallySetWallet(defaultWallet);
          console.log(`✅ Connected via Stacks Connect - defaulting to: ${defaultWallet}`);
          console.log(`ℹ️ For precise wallet tracking, use the wallet selector to connect to a specific wallet`);
        }
        resolve();
        // Use router refresh instead of hard reload to prevent chunk errors
        if (typeof window !== 'undefined') {
          // Make sure the wallet is properly stored
          setTimeout(() => {
            const currentWallet = getConnectedWallet();
            if (!currentWallet && specificWallet) {
              console.log(`🔧 Post-connection wallet fix: ${specificWallet}`);
              setConnectedWallet(specificWallet);
              protectWalletSelection(specificWallet);
            } else if (!currentWallet) {
              const detected = detectCurrentWallet();
              if (detected) {
                console.log(`🔧 Post-connection wallet fix: ${detected}`);
                setConnectedWallet(detected);
                protectWalletSelection(detected);
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
  console.log('🔗 Connecting to Xverse wallet...');

  try {
    // Check if Xverse is available
    if (!window.XverseProviders?.StacksProvider) {
      throw new Error('Xverse wallet not installed');
    }

    // Try the provider connection, but handle conflicts gracefully
    let connectionSucceeded = false;

    try {
      await window.XverseProviders.StacksProvider.request('stx_requestAccounts', null);
      connectionSucceeded = true;
      console.log('✅ Xverse provider connection succeeded');
    } catch (providerError) {
      console.warn('⚠️ Provider connection failed due to conflicts, but connection may have succeeded:', providerError);

      // Wait a moment for the connection to potentially complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user is actually signed in (connection may have succeeded despite error)
      if (isUserSignedIn()) {
        console.log('✅ User is signed in - connection succeeded despite provider error');
        connectionSucceeded = true;
      }
    }

    if (connectionSucceeded) {
      // Automatically set wallet to Xverse since user explicitly chose it
      manuallySetWallet('xverse');
      console.log('✅ Successfully connected to Xverse wallet');
    } else {
      throw new Error('Failed to establish Xverse connection');
    }

  } catch (error) {
    console.error('❌ Xverse connection error:', error);
    throw new Error(`Failed to connect to Xverse wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const connectAsigna = async (): Promise<void> => {
  if (!window.AsignaProvider) {
    throw new Error('Asigna wallet not installed');
  }

  console.log('🔗 Connecting to Asigna wallet...');

  try {
    await window.AsignaProvider.connect();
    // Track that Asigna is connected - this is crucial for session consistency
    setConnectedWallet('asigna');
    console.log('✅ Connected to Asigna wallet');
    console.log('🎯 Asigna wallet set as session wallet for all future operations');
  } catch {
    throw new Error('Failed to connect to Asigna wallet');
  }
};

// Use native Stacks Connect modal
export const connectWallet = (): Promise<void> => {
  if (isConnecting) {
    return Promise.reject(new Error('Another wallet connection is already in progress. Please wait.'));
  }

  isConnecting = true;

  return new Promise((resolve, reject) => {
    showConnect({
      appDetails: {
        name: 'StacksBuilder',
        icon: '/main-logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        try {
          // Ensure wallet is properly tracked after connection
          if (typeof window !== 'undefined') {
            setTimeout(() => {
              const currentWallet = getConnectedWallet();
              if (!currentWallet) {
                const detected = detectCurrentWallet();
                if (detected) {
                  console.log(`🔧 Post-connection wallet detection: ${detected}`);
                  setConnectedWallet(detected);
                }
              } else {
                console.log(`✅ Wallet already tracked: ${currentWallet}`);
              }

              // Verify wallet consistency after connection
              const walletCheck = verifyWalletConsistency();
              console.log('🔍 Post-connection wallet verification:', walletCheck);

              window.dispatchEvent(new Event('wallet-connected'));
            }, 100);
          }
          resolve();
        } finally {
          isConnecting = false;
        }
      },
      onCancel: () => {
        isConnecting = false;
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
export const readProfileFromContract = async (userAddress: string): Promise<DeveloperProfile | null> => {

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
          displayName: (storedProfileData.displayName as string) || 'Anonymous Developer',
          bio: (storedProfileData.bio as string) || 'No bio provided',
          skills: (storedProfileData.skills as string[]) || [],
          githubUsername: (storedProfileData.githubUsername as string) || '',
          twitterHandle: storedProfileData.twitterUsername ?
            (typeof storedProfileData.twitterUsername === 'string' && storedProfileData.twitterUsername.startsWith('http') ?
              storedProfileData.twitterUsername :
              `https://twitter.com/${storedProfileData.twitterUsername}`) : '',
          linkedinUsername: (storedProfileData.linkedinUsername as string) || '',
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
          websiteUrl: (storedProfileData.website as string) || '',
          location: (storedProfileData.location as string) || '',
          availableForWork: true,
          hourlyRate: undefined,
          // Add backward compatibility fields
          specialties: (storedProfileData.specialties as string[]) || []
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
            displayName: (storedProfileData.displayName as string) || 'Anonymous Developer',
            bio: (storedProfileData.bio as string) || 'No bio provided',
            skills: (storedProfileData.skills as string[]) || [],
            githubUsername: (storedProfileData.githubUsername as string) || '',
            twitterHandle: (storedProfileData.twitterUsername as string) || '',
            linkedinUsername: (storedProfileData.linkedinUsername as string) || '',
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
            websiteUrl: (storedProfileData.website as string) || '',
            location: (storedProfileData.location as string) || '',
            availableForWork: true,
            hourlyRate: undefined,
            specialties: (storedProfileData.specialties as string[]) || []
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
      console.log('Profile displayName from contract:', profileData['display-name']);
      console.log('Profile displayName type:', typeof profileData['display-name']);
    }

    // Create the profile object with additional fields for backward compatibility
    // Note: contractProfile already has camelCase field names from the conversion
    const formattedProfile = {
      address: userAddress,
      bnsName: undefined,
      displayName: profileData['display-name'] || '',
      bio: profileData.bio || '',
      location: profileData.location || '',
      website: profileData.website || '',
      skills: Array.isArray(profileData.skills) ? profileData.skills : [],
      specialties: Array.isArray(profileData.specialties) ? profileData.specialties : [],
      githubUsername: profileData['github-username'] || '',
      twitterHandle: profileData['twitter-username'] ?
        (profileData['twitter-username'].startsWith('http') ?
          profileData['twitter-username'] :
          `https://twitter.com/${profileData['twitter-username']}`) : '',
      linkedinUsername: profileData['linkedin-username'] || '',
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
      isVerified: profileData['is-verified'] || false,
      joinedAt: profileData['created-at'] || Math.floor(Date.now() / 1000),
      lastActive: profileData['updated-at'] || Math.floor(Date.now() / 1000),
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
          displayName: (storedProfileData.displayName as string) || 'Anonymous Developer',
          bio: (storedProfileData.bio as string) || 'No bio provided',
          skills: (storedProfileData.skills as string[]) || [],
          githubUsername: (storedProfileData.githubUsername as string) || '',
          twitterHandle: storedProfileData.twitterUsername ?
            (typeof storedProfileData.twitterUsername === 'string' && storedProfileData.twitterUsername.startsWith('http') ?
              storedProfileData.twitterUsername :
              `https://twitter.com/${storedProfileData.twitterUsername}`) : '',
          linkedinUsername: (storedProfileData.linkedinUsername as string) || '',
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
          websiteUrl: (storedProfileData.website as string) || '',
          location: (storedProfileData.location as string) || '',
          availableForWork: true,
          hourlyRate: undefined,
          // Add backward compatibility fields
          specialties: (storedProfileData.specialties as string[]) || []
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
