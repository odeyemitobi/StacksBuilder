import { StacksNetwork, StacksTestnet, StacksMainnet } from '@stacks/network';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import {
  stringAsciiCV,
  uintCV,
  listCV,
  tupleCV,
  contractPrincipalCV,
  standardPrincipalCV
} from '@stacks/transactions';

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

// Contract configuration
export const CONTRACT_CONFIG = {
  testnet: {
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // Replace with your testnet address
    contractName: 'stacksbuilder-profiles',
  },
  mainnet: {
    contractAddress: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // Replace with your mainnet address
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

// Legacy function for backward compatibility
export const connectWallet = () => {
  return connectSpecificWallet('hiro');
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
