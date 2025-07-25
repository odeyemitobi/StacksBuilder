import { useState, useEffect, useCallback } from 'react';
import {
  connectWallet,
  connectSpecificWallet,
  disconnectWallet,
  isUserSignedIn,
  getUserData,
  getUserAddress,
  detectInstalledWallets,
  getWalletInfo,
  readProfileFromContract,
  getSessionWallet,
  type SupportedWallet
} from '@/lib/stacks';
import { DeveloperProfile, StacksUserData } from '@/types';
import { WalletCookies, MigrationUtils, ProfileCookies } from '@/lib/cookies';

export interface StacksAuthState {
  isSignedIn: boolean;
  userData: StacksUserData | null;
  userAddress: string | null;
  isLoading: boolean;
  connectedWallet: SupportedWallet | null;
  installedWallets: SupportedWallet[];
}

export const useStacksAuth = () => {
  const [authState, setAuthState] = useState<StacksAuthState>({
    isSignedIn: false,
    userData: null,
    userAddress: null,
    isLoading: true,
    connectedWallet: null,
    installedWallets: [],
  });

  const checkAuthState = useCallback(() => {
    const signedIn = isUserSignedIn();
    const userData = getUserData();
    const address = getUserAddress();
    const installedWallets = detectInstalledWallets();

    // Run migration from localStorage to cookies
    MigrationUtils.migrateWalletPreference();

    // Clean up old deletion markers
    ProfileCookies.cleanupOldDeletionMarkers();

    // Get the connected wallet using the enhanced tracking system
    let connectedWallet: SupportedWallet | null = null;
    if (signedIn && userData) {
      // Use the enhanced wallet tracking system
      connectedWallet = getSessionWallet();
      console.log('🔍 Session wallet from enhanced tracking:', connectedWallet);
    }

    setAuthState({
      isSignedIn: signedIn,
      userData,
      userAddress: address,
      isLoading: false,
      connectedWallet,
      installedWallets,
    });
  }, []);

  useEffect(() => {
    checkAuthState();

    // Listen for auth state changes
    const handleAuthChange = () => {
      setTimeout(checkAuthState, 100); // Small delay to ensure state is updated
    };

    // Listen for wallet connection/disconnection events
    const handleWalletConnected = () => {
      console.log('🔄 Wallet connected event received, refreshing auth state...');
      setTimeout(checkAuthState, 200); // Slightly longer delay for wallet events
    };

    const handleWalletDisconnected = () => {
      console.log('🔄 Wallet disconnected event received, refreshing auth state...');
      setTimeout(checkAuthState, 100);
    };

    const handleWalletStateRefreshed = () => {
      console.log('🔄 Wallet state refreshed event received, updating auth state...');
      setTimeout(checkAuthState, 100);
    };

    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('wallet-connected', handleWalletConnected);
    window.addEventListener('wallet-disconnected', handleWalletDisconnected);
    window.addEventListener('wallet-state-refreshed', handleWalletStateRefreshed);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('wallet-connected', handleWalletConnected);
      window.removeEventListener('wallet-disconnected', handleWalletDisconnected);
      window.removeEventListener('wallet-state-refreshed', handleWalletStateRefreshed);
    };
  }, [checkAuthState]);

  const connect = useCallback((walletId?: SupportedWallet) => {
    if (walletId) {
      // Store wallet preference in secure cookie
      WalletCookies.setWalletPreference(walletId);
      return connectSpecificWallet(walletId);
    } else {
      return connectWallet();
    }
  }, []);

  const disconnect = useCallback(() => {
    disconnectWallet();
    // Remove wallet preference from secure cookie
    WalletCookies.removeWalletPreference();
    setAuthState({
      isSignedIn: false,
      userData: null,
      userAddress: null,
      isLoading: false,
      connectedWallet: null,
      installedWallets: detectInstalledWallets(),
    });
  }, []);

  return {
    ...authState,
    connect,
    disconnect,
    refresh: checkAuthState,
  };
};

export const useProfile = (address?: string) => {
  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (userAddress: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Read profile data from smart contract
      const profileData = await readProfileFromContract(userAddress);
      setProfile(profileData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (address) {
      fetchProfile(address);
    }
  }, [address, fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    refetch: () => address && fetchProfile(address),
  };
};

export const useContractCall = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callContract = useCallback(async (
    contractAddress: string,
    contractName: string,
    functionName: string,
    functionArgs: (string | import('@stacks/transactions').ClarityValue)[],
    onSuccess?: (txId: string) => void,
    onError?: (error: string) => void
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const { openContractCall } = await import('@stacks/connect');
      
      await openContractCall({
        contractAddress,
        contractName,
        functionName,
        functionArgs,
        onFinish: (data) => {
          setIsLoading(false);
          if (onSuccess) {
            onSuccess(data.txId);
          }
        },
        onCancel: () => {
          setIsLoading(false);
          setError('Transaction cancelled');
          if (onError) {
            onError('Transaction cancelled');
          }
        },
      });
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Contract call failed';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    }
  }, []);

  return {
    callContract,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};

export const useTransaction = (txId?: string) => {
  const [transaction, setTransaction] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransaction = useCallback(async (transactionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/transactions/${transactionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transaction');
      }
      const data = await response.json();
      setTransaction(data.transaction);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setTransaction(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (txId) {
      fetchTransaction(txId);
    }
  }, [txId, fetchTransaction]);

  return {
    transaction,
    isLoading,
    error,
    refetch: () => txId && fetchTransaction(txId),
  };
};

// Multi-wallet management hook
export const useMultiWallet = () => {
  const [isWalletSelectorOpen, setIsWalletSelectorOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<SupportedWallet | null>(null);
  const { connect, ...authState } = useStacksAuth();

  const openWalletSelector = useCallback(() => {
    setIsWalletSelectorOpen(true);
  }, []);

  const closeWalletSelector = useCallback(() => {
    setIsWalletSelectorOpen(false);
    setIsConnecting(false);
    setSelectedWallet(null);
  }, []);

  const handleWalletSelect = useCallback(async (walletId: SupportedWallet) => {
    setSelectedWallet(walletId);
    setIsConnecting(true);

    try {
      // This will automatically store the wallet preference in cookies via the connect function
      await connect(walletId);
      closeWalletSelector();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setIsConnecting(false);
      setSelectedWallet(null);
    }
  }, [connect, closeWalletSelector]);

  const getAvailableWallets = useCallback(() => {
    const supportedWallets: SupportedWallet[] = ['hiro', 'leather', 'xverse', 'asigna'];
    return supportedWallets.map(walletId => getWalletInfo(walletId));
  }, []);

  return {
    ...authState,
    isWalletSelectorOpen,
    isConnecting,
    selectedWallet,
    openWalletSelector,
    closeWalletSelector,
    handleWalletSelect,
    getAvailableWallets,
  };
};

// Hook to check profile existence across browsers
export const useProfileCheck = (userAddress: string | null) => {
  const [hasProfile, setHasProfile] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshProfileCheck = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const checkProfile = async () => {
      if (!userAddress) {
        setHasProfile(false);
        return;
      }

      setIsChecking(true);
      try {
        // Import the function dynamically to avoid circular dependencies
        const { checkProfileExists } = await import('@/lib/stacks');
        const exists = await checkProfileExists(userAddress);
        setHasProfile(exists);
      } catch (error) {
        console.error('Error checking profile:', error);
        // Fallback to cookie check
        MigrationUtils.migrateProfileData(userAddress);
        setHasProfile(ProfileCookies.hasProfileCreated(userAddress));
      } finally {
        setIsChecking(false);
      }
    };

    checkProfile();
  }, [userAddress, refreshTrigger]);

  return { hasProfile, isChecking, refreshProfileCheck };
};
