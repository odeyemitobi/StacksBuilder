import { useState, useEffect, useCallback } from 'react';
import {
  userSession,
  connectWallet,
  connectSpecificWallet,
  disconnectWallet,
  isUserSignedIn,
  getUserData,
  getUserAddress,
  detectInstalledWallets,
  getWalletInfo,
  type SupportedWallet
} from '@/lib/stacks';
import { DeveloperProfile } from '@/types';

export interface StacksAuthState {
  isSignedIn: boolean;
  userData: any | null;
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

    // Determine connected wallet type from userData or localStorage
    let connectedWallet: SupportedWallet | null = null;
    if (signedIn && userData) {
      // Try to determine wallet type from user data or stored preference
      connectedWallet = localStorage.getItem('stacksbuilder-wallet') as SupportedWallet || 'hiro';
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

    window.addEventListener('storage', handleAuthChange);
    return () => window.removeEventListener('storage', handleAuthChange);
  }, [checkAuthState]);

  const connect = useCallback((walletId?: SupportedWallet) => {
    if (walletId) {
      localStorage.setItem('stacksbuilder-wallet', walletId);
      return connectSpecificWallet(walletId);
    } else {
      return connectWallet();
    }
  }, []);

  const disconnect = useCallback(() => {
    disconnectWallet();
    localStorage.removeItem('stacksbuilder-wallet');
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
      // TODO: Replace with actual contract call
      const response = await fetch(`/api/profiles/${userAddress}`);
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      setProfile(data.profile);
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
    functionArgs: any[],
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
  const [transaction, setTransaction] = useState<any>(null);
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
