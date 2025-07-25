'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCreditCard, FiChevronDown, FiLogOut, FiUser, FiCopy, FiCheck } from 'react-icons/fi';
import { Button } from './button';
import { WalletSelector } from './wallet-selector';
import { useStacksAuth } from '@/hooks/useStacks';
import { truncateAddress, type SupportedWallet } from '@/lib/stacks';

interface ConnectWalletButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showText?: boolean;
  className?: string;
}

export function ConnectWalletButton({
  variant = 'default',
  size = 'default',
  showText = true,
  className = ''
}: ConnectWalletButtonProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<SupportedWallet | null>(null);

  const {
    isSignedIn,
    userAddress,
    connectedWallet,
    isLoading,
    connect,
    disconnect,
  } = useStacksAuth();

  const [isConnecting, setIsConnecting] = useState(false);

  // Map variant to Button component variants
  const buttonVariant = variant === 'default' ? 'primary' : variant;
  // Map size to Button component sizes
  const buttonSize = size === 'default' ? 'md' : size;

  const handleConnectWallet = () => {
    setShowWalletSelector(true);
  };

  const handleWalletSelect = async (walletId: SupportedWallet) => {
    setSelectedWallet(walletId);
    setIsConnecting(true);
    try {
      await connect(walletId); // Connect to the specific wallet
      setShowWalletSelector(false);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
      setSelectedWallet(null);
    }
  };

  const handleCopyAddress = async () => {
    if (userAddress) {
      await navigator.clipboard.writeText(userAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowDropdown(false);
  };

  if (isLoading) {
    return (
      <Button variant={buttonVariant} size={buttonSize} disabled className={className}>
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        {showText && <span className="ml-2">Loading...</span>}
      </Button>
    );
  }

  if (!isSignedIn) {
    return (
      <Button
        variant={buttonVariant}
        size={buttonSize}
        onClick={handleConnectWallet}
        className={`group ${className}`}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <FiCreditCard className="w-4 h-4" />
        )}
        {showText && (
          <span className="ml-2">
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </span>
        )}
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        variant={buttonVariant}
        size={buttonSize}
        onClick={() => setShowDropdown(!showDropdown)}
        className={`group ${className}`}
      >
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          {showText && (
            <span className="font-mono text-sm">
              {truncateAddress(userAddress || '', 4)}
            </span>
          )}
          <FiChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </div>
      </Button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown */}
          <motion.div
            className="absolute right-0 top-full mt-2 w-64 bg-background border border-border rounded-lg shadow-lg z-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Wallet Info */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-foreground rounded-lg flex items-center justify-center">
                  <FiCreditCard className="w-5 h-5 text-background" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {connectedWallet ? connectedWallet.charAt(0).toUpperCase() + connectedWallet.slice(1) : 'Connected'}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {truncateAddress(userAddress || '', 6)}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <button
                type="button"
                onClick={handleCopyAddress}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-foreground hover:bg-accent rounded-md transition-colors cursor-pointer"
              >
                {copied ? (
                  <FiCheck className="w-4 h-4 text-green-500" />
                ) : (
                  <FiCopy className="w-4 h-4" />
                )}
                <span>{copied ? 'Copied!' : 'Copy Address'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowDropdown(false);
                  // Navigate to profile when implemented
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-foreground hover:bg-accent rounded-md transition-colors cursor-pointer"
              >
                <FiUser className="w-4 h-4" />
                <span>View Profile</span>
              </button>

              <div className="border-t border-border my-2" />

              <button
                type="button"
                onClick={handleDisconnect}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors cursor-pointer"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            </div>
          </motion.div>
        </>
      )}

      {/* Wallet Selector Modal */}
      <WalletSelector
        isOpen={showWalletSelector}
        onClose={() => setShowWalletSelector(false)}
        onWalletSelect={handleWalletSelect}
        isConnecting={isConnecting}
        selectedWallet={selectedWallet}
      />
    </div>
  );
}

// Compact version for mobile/header use
export function ConnectWalletButtonCompact(props: Omit<ConnectWalletButtonProps, 'showText'>) {
  return <ConnectWalletButton {...props} showText={false} />;
}
