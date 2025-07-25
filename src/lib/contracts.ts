import {
  callReadOnlyFunction,
  standardPrincipalCV,
  stringAsciiCV,
  listCV,
  cvToValue,
  AnchorMode,
  PostConditionMode,
  uintCV,
  intCV,
  boolCV,
  principalCV,
  bufferCV,
  tupleCV,
  someCV,
  noneCV,
  responseOkCV,
  responseErrorCV,
  type ClarityValue
} from '@stacks/transactions';
import { getStacksNetwork, ensureWalletConsistency } from './stacks';
import { openContractCall } from '@stacks/connect';
import { ContractFunctionArg, ContractCallData } from '@/types';

// Convert our custom ContractFunctionArg type to actual Clarity values
function convertToClarity(arg: ContractFunctionArg): ClarityValue {
  switch (arg.type) {
    case 'uint':
      return uintCV(arg.value);
    case 'int':
      return intCV(arg.value);
    case 'bool':
      return boolCV(arg.value);
    case 'principal':
      return principalCV(arg.value);
    case 'string-ascii':
      return stringAsciiCV(arg.value);
    case 'string-utf8':
      return stringAsciiCV(arg.value); // Note: using stringAsciiCV for simplicity
    case 'buffer':
      return bufferCV(arg.value);
    case 'list':
      return listCV(arg.value.map(convertToClarity));
    case 'tuple':
      const tupleData: Record<string, ClarityValue> = {};
      for (const [key, value] of Object.entries(arg.value)) {
        tupleData[key] = convertToClarity(value);
      }
      return tupleCV(tupleData);
    case 'optional':
      return arg.value ? someCV(convertToClarity(arg.value)) : noneCV();
    case 'response':
      if ('ok' in arg.value) {
        return responseOkCV(convertToClarity(arg.value.ok));
      } else {
        return responseErrorCV(convertToClarity(arg.value.error));
      }
    default:
      throw new Error(`Unsupported ContractFunctionArg type: ${(arg as { type: string }).type}`);
  }
}

// Contract configuration - using the deployed testnet contract with delete functionality
export const CONTRACT_CONFIG = {
  // Use environment variables for contract configuration, with deployed testnet contract as default
  CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  CONTRACT_NAME: process.env.NEXT_PUBLIC_CONTRACT_NAME || 'developer-profiles-v2',
  get NETWORK() {
    return getStacksNetwork();
  },
};

// Wallet-specific contract call function
async function callContractWithWallet(
  functionName: string,
  functionArgs: ContractFunctionArg[],
  onFinish?: (data: ContractCallData) => void,
  onCancel?: () => void
): Promise<void> {
  // Ensure wallet consistency before making contract call
  // This will throw an error if the wallet is not consistent
  const connectedWallet = ensureWalletConsistency();
  console.log('🔗 Using session wallet for contract call:', connectedWallet);

  // Additional protection: verify the wallet is still the expected one
  if (typeof window !== 'undefined') {
    const sessionWallet = sessionStorage.getItem('stacksbuilder_session_wallet');
    if (sessionWallet && sessionWallet !== connectedWallet &&
        ['hiro', 'leather', 'xverse', 'asigna'].includes(sessionWallet)) {
      console.warn(`⚠️ Wallet mismatch detected! Session: ${sessionWallet}, Connected: ${connectedWallet}`);
      // Force the session wallet to be used
      const { manuallySetWallet } = await import('./stacks');
      manuallySetWallet(sessionWallet as 'hiro' | 'leather' | 'xverse' | 'asigna');

      // Update the connected wallet to match session
      const updatedWallet = ensureWalletConsistency();
      console.log('🔄 Updated wallet to match session:', updatedWallet);
    }

    // Extra protection for Xverse: ensure it's really selected
    if (connectedWallet === 'xverse') {
      console.log('🔒 Enforcing Xverse wallet selection');
      // Store a flag to indicate we're specifically using Xverse
      sessionStorage.setItem('stacksbuilder_force_xverse', 'true');
    }
  }

  // Handle each wallet with its specific API
  switch (connectedWallet) {
    case 'xverse':
      console.log('📱 Calling contract with Xverse wallet (protected)');
      return callContractWithXverse(functionName, functionArgs, onFinish, onCancel);

    case 'leather':
      console.log('🧳 Calling contract with Leather wallet');
      return callContractWithLeather(functionName, functionArgs, onFinish, onCancel);

    case 'hiro':
      console.log('🏛️ Calling contract with Hiro wallet');
      return callContractWithHiro(functionName, functionArgs, onFinish, onCancel);

    case 'asigna':
      console.log('🔐 Calling contract with Asigna wallet');
      return callContractWithAsigna(functionName, functionArgs, onFinish, onCancel);

    default:
      console.log('🔄 Using generic Stacks Connect for wallet:', connectedWallet);
      return callContractGeneric(functionName, functionArgs, onFinish, onCancel);
  }
}

// Xverse-specific contract call using direct provider access
async function callContractWithXverse(
  functionName: string,
  functionArgs: ContractFunctionArg[],
  onFinish?: (data: ContractCallData) => void,
  onCancel?: () => void
): Promise<void> {
  console.log('📱 Using Xverse wallet for contract call (direct provider)');

  try {
    // Verify we should be using Xverse
    const forceXverse = sessionStorage.getItem('stacksbuilder_force_xverse');
    if (!forceXverse) {
      console.warn('⚠️ Xverse not explicitly selected, this might be a wallet conflict');
    }

    // Verify Xverse is available
    if (!window.XverseProviders?.StacksProvider) {
      throw new Error('Xverse wallet not available');
    }

    // Force Xverse to be the active provider
    console.log('📱 Activating Xverse provider...');
    try {
      await window.XverseProviders.StacksProvider.request('stx_requestAccounts', null);
      console.log('✅ Xverse provider activated successfully');
    } catch (activationError) {
      console.warn('⚠️ Xverse activation warning (may still work):', activationError);
      // Continue anyway as the user might already be connected
    }

    // Use a more direct approach with Xverse provider
    console.log('📱 Calling contract with Xverse provider directly');

    // Create the transaction options
    const txOptions = {
      network: CONTRACT_CONFIG.NETWORK,
      anchorMode: AnchorMode.Any,
      contractAddress: CONTRACT_CONFIG.CONTRACT_ADDRESS,
      contractName: CONTRACT_CONFIG.CONTRACT_NAME,
      functionName,
      functionArgs: functionArgs.map(convertToClarity),
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: ContractCallData) => {
        console.log('✅ Xverse contract call successful:', data.txId);
        if (onFinish) onFinish(data);
      },
      onCancel: () => {
        console.log('❌ Xverse contract call cancelled');
        if (onCancel) onCancel();
      },
    };

    // Skip problematic request methods and go directly to openContractCall with wallet isolation
    console.log('📱 Skipping problematic request methods, using openContractCall directly');

    // Use openContractCall with aggressive wallet isolation
    console.log('📱 Using openContractCall with aggressive Xverse isolation');

    // Store references to other wallet providers
    const otherProviders = {
      leather: window.LeatherProvider,
      hiro: window.HiroWalletProvider,
      asigna: window.AsignaProvider
    };

    try {
      // Temporarily set other providers to undefined (not delete, just override)
      (window as typeof window & { LeatherProvider?: undefined }).LeatherProvider = undefined;
      (window as typeof window & { HiroWalletProvider?: undefined }).HiroWalletProvider = undefined;
      (window as typeof window & { AsignaProvider?: undefined }).AsignaProvider = undefined;

      console.log('🔒 Temporarily isolated Xverse by hiding other providers');
      console.log('📱 Transaction options:', {
        network: txOptions.network.version,
        contractAddress: txOptions.contractAddress,
        contractName: txOptions.contractName,
        functionName: txOptions.functionName,
        functionArgsCount: txOptions.functionArgs.length,
        postConditionMode: txOptions.postConditionMode
      });

      // Wait a moment to ensure provider changes take effect
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('📱 Calling openContractCall with isolated Xverse...');
      await openContractCall(txOptions);
      console.log('✅ openContractCall with isolated Xverse successful');

    } finally {
      // Always restore other providers
      if (otherProviders.leather) {
        window.LeatherProvider = otherProviders.leather;
      }
      if (otherProviders.hiro) {
        window.HiroWalletProvider = otherProviders.hiro;
      }
      if (otherProviders.asigna) {
        window.AsignaProvider = otherProviders.asigna;
      }
      console.log('🔓 Restored other wallet providers');
    }

  } catch (error) {
    console.error('❌ Xverse contract call error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    if (onCancel) onCancel();
    throw error;
  } finally {
    // Clean up the force flag
    sessionStorage.removeItem('stacksbuilder_force_xverse');
  }
}

// Leather-specific contract call
async function callContractWithLeather(
  functionName: string,
  functionArgs: ContractFunctionArg[],
  onFinish?: (data: ContractCallData) => void,
  onCancel?: () => void
): Promise<void> {
  if (typeof window === 'undefined' || !window.LeatherProvider) {
    throw new Error('Leather wallet not available');
  }

  try {
    console.log('🧳 Using Leather wallet for contract call');

    // Leather uses the standard Stacks Connect interface
    await openContractCall({
      network: CONTRACT_CONFIG.NETWORK,
      anchorMode: AnchorMode.Any,
      contractAddress: CONTRACT_CONFIG.CONTRACT_ADDRESS,
      contractName: CONTRACT_CONFIG.CONTRACT_NAME,
      functionName,
      functionArgs: functionArgs.map(convertToClarity),
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        console.log('✅ Leather contract call successful:', data.txId);
        if (onFinish) onFinish(data);
      },
      onCancel: () => {
        console.log('❌ Leather contract call cancelled');
        if (onCancel) onCancel();
      },
    });
  } catch (error) {
    console.error('❌ Leather contract call error:', error);
    if (onCancel) onCancel();
    throw error;
  }
}

// Hiro-specific contract call
async function callContractWithHiro(
  functionName: string,
  functionArgs: ContractFunctionArg[],
  onFinish?: (data: ContractCallData) => void,
  onCancel?: () => void
): Promise<void> {
  console.log('🟣 Using Hiro wallet for contract call');

  try {
    await openContractCall({
      network: CONTRACT_CONFIG.NETWORK,
      anchorMode: AnchorMode.Any,
      contractAddress: CONTRACT_CONFIG.CONTRACT_ADDRESS,
      contractName: CONTRACT_CONFIG.CONTRACT_NAME,
      functionName,
      functionArgs: functionArgs.map(convertToClarity),
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        console.log('✅ Hiro contract call successful:', data.txId);
        if (onFinish) onFinish(data);
      },
      onCancel: () => {
        console.log('❌ Hiro contract call cancelled');
        if (onCancel) onCancel();
      },
    });
  } catch (error) {
    console.error('❌ Hiro contract call error:', error);
    if (onCancel) onCancel();
    throw error;
  }
}

// Asigna-specific contract call
async function callContractWithAsigna(
  functionName: string,
  functionArgs: ContractFunctionArg[],
  onFinish?: (data: ContractCallData) => void,
  onCancel?: () => void
): Promise<void> {
  if (typeof window === 'undefined' || !window.AsignaProvider) {
    throw new Error('Asigna wallet not available');
  }

  console.log('🔐 Using Asigna wallet for contract call');

  try {
    // Asigna typically uses standard Stacks Connect interface
    await openContractCall({
      network: CONTRACT_CONFIG.NETWORK,
      anchorMode: AnchorMode.Any,
      contractAddress: CONTRACT_CONFIG.CONTRACT_ADDRESS,
      contractName: CONTRACT_CONFIG.CONTRACT_NAME,
      functionName,
      functionArgs: functionArgs.map(convertToClarity),
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        console.log('✅ Asigna contract call successful:', data.txId);
        if (onFinish) onFinish(data);
      },
      onCancel: () => {
        console.log('❌ Asigna contract call cancelled');
        if (onCancel) onCancel();
      },
    });
  } catch (error) {
    console.error('❌ Asigna contract call error:', error);
    if (onCancel) onCancel();
    throw error;
  }
}

// Generic fallback contract call
async function callContractGeneric(
  functionName: string,
  functionArgs: ContractFunctionArg[],
  onFinish?: (data: ContractCallData) => void,
  onCancel?: () => void
): Promise<void> {
  console.log('🔄 Using generic Stacks Connect');

  try {
    await openContractCall({
      network: CONTRACT_CONFIG.NETWORK,
      anchorMode: AnchorMode.Any,
      contractAddress: CONTRACT_CONFIG.CONTRACT_ADDRESS,
      contractName: CONTRACT_CONFIG.CONTRACT_NAME,
      functionName,
      functionArgs: functionArgs.map(convertToClarity),
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        console.log('✅ Generic contract call successful:', data.txId);
        if (onFinish) onFinish(data);
      },
      onCancel: () => {
        console.log('❌ Generic contract call cancelled');
        if (onCancel) onCancel();
      },
    });
  } catch (error) {
    console.error('❌ Generic contract call error:', error);
    if (onCancel) onCancel();
    throw error;
  }
}

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
 * Throws error if unable to check (network/provider issues)
 * Returns boolean only when we can successfully check
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
    // Re-throw the error so calling code can distinguish between
    // "profile doesn't exist" vs "unable to check due to network/provider issues"
    throw new Error(`Unable to check profile existence: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

    // Debug: Log the raw contract response
    console.log('🔍 Raw contract response:', result);
    console.log('🔍 Converted profile data:', profileData);
    console.log('🔍 Profile data type:', typeof profileData);
    console.log('🔍 Profile data keys:', profileData ? Object.keys(profileData) : 'null');

    if (!profileData) {
      return null;
    }

    // The contract might return data in a nested structure or with different field names
    // Let's try to handle different possible structures
    let actualData = profileData;

    // If the data is wrapped in a 'value' property, unwrap it
    if (profileData.value && typeof profileData.value === 'object') {
      actualData = profileData.value;
      console.log('🔍 Using nested value:', actualData);
    }

    // If the data is wrapped in a 'some' property (optional type), unwrap it
    if (actualData.some && typeof actualData.some === 'object') {
      actualData = actualData.some;
      console.log('🔍 Using optional value:', actualData);
    }

    // Helper function to safely extract string values
    const extractStringValue = (value: unknown): string => {
      if (typeof value === 'string') return value;
      if (value && typeof value === 'object' && 'value' in value) return String(value.value);
      if (value && typeof value === 'object' && 'type' in value && value.type === 'buff') return '';
      return '';
    };

    // Helper function to safely extract array values
    const extractArrayValue = (value: unknown): string[] => {
      if (Array.isArray(value)) {
        return value.map(item => extractStringValue(item));
      }
      if (value && typeof value === 'object' && 'value' in value && Array.isArray(value.value)) {
        return (value.value as unknown[]).map((item: unknown) => extractStringValue(item));
      }
      return [];
    };

    // Helper function to safely extract number values
    const extractNumberValue = (value: unknown): number => {
      if (typeof value === 'number') return value;
      if (value && typeof value === 'object' && 'value' in value && typeof value.value === 'number') return value.value;
      if (typeof value === 'string') return parseInt(value) || 0;
      return 0;
    };

    // Helper function to safely extract boolean values
    const extractBooleanValue = (value: unknown): boolean => {
      if (typeof value === 'boolean') return value;
      if (value && typeof value === 'object' && 'value' in value && typeof value.value === 'boolean') return value.value;
      if (typeof value === 'string') return value.toLowerCase() === 'true';
      return false;
    };

    // Convert contract field names to app field names with safe extraction
    const convertedProfile: ContractProfile = {
      'display-name': extractStringValue(actualData['display-name'] || actualData.displayName),
      bio: extractStringValue(actualData['bio'] || actualData.bio),
      location: extractStringValue(actualData['location'] || actualData.location),
      website: extractStringValue(actualData['website'] || actualData.website),
      'github-username': extractStringValue(actualData['github-username'] || actualData.githubUsername),
      'twitter-username': extractStringValue(actualData['twitter-username'] || actualData.twitterUsername),
      'linkedin-username': extractStringValue(actualData['linkedin-username'] || actualData.linkedinUsername),
      skills: extractArrayValue(actualData['skills'] || actualData.skills),
      specialties: extractArrayValue(actualData['specialties'] || actualData.specialties),
      'created-at': extractNumberValue(actualData['created-at'] || actualData.createdAt),
      'updated-at': extractNumberValue(actualData['updated-at'] || actualData.updatedAt),
      'is-verified': extractBooleanValue(actualData['is-verified'] || actualData.isVerified)
    };

    console.log('🔍 Final converted profile:', convertedProfile);

    return convertedProfile;
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

    if (!statsData) {
      return null;
    }

    // Convert contract field names to app field names
    const convertedStats: ContractProfileStats = {
      'reputation-score': statsData['reputation-score'] || 0,
      'endorsements-received': statsData['endorsements-received'] || 0,
      'projects-count': statsData['projects-count'] || 0,
      'contributions-count': statsData['contributions-count'] || 0
    };

    return convertedStats;
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
  // Debug: Log the profile data being sent
  console.log('Creating profile with data:', profileData);

  // Validate field lengths before creating Clarity values
  const fieldLimits = {
    displayName: 50,
    bio: 500,
    location: 100,
    website: 200,
    githubUsername: 50,
    twitterUsername: 50,
    linkedinUsername: 50
  };

  // Check each field length
  Object.entries(fieldLimits).forEach(([field, limit]) => {
    const value = profileData[field as keyof typeof profileData] as string;
    if (value && value.length > limit) {
      throw new Error(`${field} is too long: ${value.length} characters (max: ${limit})`);
    }
    console.log(`${field}: "${value}" (${value.length}/${limit} chars)`);
  });

  // Validate skills and specialties
  if (profileData.skills.length > 20) {
    throw new Error(`Too many skills: ${profileData.skills.length} (max: 20)`);
  }
  if (profileData.specialties.length > 10) {
    throw new Error(`Too many specialties: ${profileData.specialties.length} (max: 10)`);
  }

  // Check individual skill/specialty lengths
  profileData.skills.forEach((skill, index) => {
    if (skill.length > 30) {
      throw new Error(`Skill ${index + 1} is too long: ${skill.length} characters (max: 30)`);
    }
  });

  profileData.specialties.forEach((specialty, index) => {
    if (specialty.length > 50) {
      throw new Error(`Specialty ${index + 1} is too long: ${specialty.length} characters (max: 50)`);
    }
  });

  let functionArgs: ContractFunctionArg[];
  try {
    functionArgs = [
      { type: 'string-ascii', value: profileData.displayName },
      { type: 'string-ascii', value: profileData.bio },
      { type: 'string-ascii', value: profileData.location },
      { type: 'string-ascii', value: profileData.website },
      { type: 'string-ascii', value: profileData.githubUsername },
      { type: 'string-ascii', value: profileData.twitterUsername },
      { type: 'string-ascii', value: profileData.linkedinUsername },
      { type: 'list', value: profileData.skills.map(skill => ({ type: 'string-ascii', value: skill } as ContractFunctionArg)) },
      { type: 'list', value: profileData.specialties.map(specialty => ({ type: 'string-ascii', value: specialty } as ContractFunctionArg)) },
    ];

    console.log('Function args created successfully');
  } catch (error) {
    console.error('Error creating function arguments:', error);
    throw new Error(`Failed to create contract arguments: ${error}`);
  }

  return new Promise<void>((resolve, reject) => {
    callContractWithWallet(
      'create-profile',
      functionArgs,
      (data) => {
        console.log('Profile creation transaction submitted:', data.txId);
        resolve();
      },
      () => {
        console.log('Profile creation cancelled');
        reject(new Error('Profile creation was cancelled by user'));
      }
    ).catch((error) => {
      console.error('Profile creation failed:', error);
      reject(error);
    });
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
  const functionArgs: ContractFunctionArg[] = [
    { type: 'string-ascii', value: profileData.displayName },
    { type: 'string-ascii', value: profileData.bio },
    { type: 'string-ascii', value: profileData.location },
    { type: 'string-ascii', value: profileData.website },
    { type: 'string-ascii', value: profileData.githubUsername },
    { type: 'string-ascii', value: profileData.twitterUsername },
    { type: 'string-ascii', value: profileData.linkedinUsername },
    { type: 'list', value: profileData.skills.map(skill => ({ type: 'string-ascii', value: skill } as ContractFunctionArg)) },
    { type: 'list', value: profileData.specialties.map(specialty => ({ type: 'string-ascii', value: specialty } as ContractFunctionArg)) },
  ];

  return new Promise<void>((resolve, reject) => {
    callContractWithWallet(
      'update-profile',
      functionArgs,
      (data) => {
        console.log('Profile update transaction submitted:', data.txId);
        resolve();
      },
      () => {
        console.log('Profile update cancelled');
        reject(new Error('Profile update was cancelled by user'));
      }
    ).catch((error) => {
      console.error('Profile update failed:', error);
      reject(error);
    });
  });
}

/**
 * Delete a profile on the blockchain
 * Only the profile owner can delete their own profile
 */
export async function deleteProfileOnContract(): Promise<void> {
  console.log('🗑️ Deleting profile on contract');

  // First verify the wallet is connected and ready
  const walletCheck = await import('@/lib/stacks').then(m => m.verifyWalletConsistency());
  if (!walletCheck.isConsistent || !walletCheck.isAvailable) {
    throw new Error(`Wallet not ready: ${walletCheck.message}`);
  }

  // Check if user is signed in
  const { isUserSignedIn } = await import('@/lib/stacks');
  if (!isUserSignedIn()) {
    throw new Error('User is not signed in. Please sign in with your wallet.');
  }

  // No function arguments needed - the contract uses tx-sender
  const functionArgs: ContractFunctionArg[] = [];

  return new Promise((resolve, reject) => {
    callContractWithWallet(
      'delete-profile',
      functionArgs,
      (data) => {
        console.log('✅ Profile deletion transaction submitted:', data.txId);
        console.log('⏳ Transaction is being processed on the blockchain...');
        // Transaction was submitted successfully
        // Note: This doesn't mean it's confirmed yet, but it's been accepted by the network
        resolve();
      },
      () => {
        console.log('❌ Profile deletion cancelled by user');
        reject(new Error('Profile deletion was cancelled by user. Please try again and approve the transaction.'));
      }
    ).catch((error) => {
      console.error('❌ Profile deletion failed:', error);

      // Provide more specific error messages
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.toLowerCase().includes('insufficient funds')) {
        reject(new Error('Insufficient funds to pay for the transaction. Please ensure you have enough STX for gas fees.'));
      } else if (errorMessage.toLowerCase().includes('nonce')) {
        reject(new Error('Transaction nonce error. Please try again in a few moments.'));
      } else if (errorMessage.toLowerCase().includes('not found')) {
        reject(new Error('Profile not found on the blockchain. It may have already been deleted.'));
      } else {
        reject(new Error(`Profile deletion failed: ${errorMessage}`));
      }
    });
  });
}

/**
 * Test function to verify Xverse wallet integration
 * This creates a minimal profile to test the transaction flow
 */
export async function testXverseIntegration(): Promise<void> {
  console.log('🧪 Testing Xverse integration with minimal profile...');

  const testProfileData = {
    displayName: 'Test User',
    bio: 'Test bio',
    location: 'Test Location',
    website: '',
    githubUsername: '',
    twitterUsername: '',
    linkedinUsername: '',
    skills: [],
    specialties: [],
  };

  return createProfileOnContract(testProfileData);
}
