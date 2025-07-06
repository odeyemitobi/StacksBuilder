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

// Authentication helpers
export const connectWallet = () => {
  showConnect({
    appDetails: {
      name: 'StacksBuilder',
      icon: '/logo.png', // Add your logo
    },
    redirectTo: '/',
    onFinish: () => {
      window.location.reload();
    },
    userSession,
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
