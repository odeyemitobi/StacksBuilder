'use client';

import { useState, useEffect } from 'react';
import { FiAlertTriangle, FiX, FiCheck } from 'react-icons/fi';
import { Card } from './card';
import { Button } from './button';
import { useStacksAuth } from '@/hooks/useStacks';
import { manuallySetWallet, detectInstalledWallets, type SupportedWallet } from '@/lib/stacks';

interface WalletDetectionHelperProps {
  className?: string;
}

export function WalletDetectionHelper({ className = '' }: WalletDetectionHelperProps) {
  const [showHelper, setShowHelper] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [fixedWallet, setFixedWallet] = useState<SupportedWallet | null>(null);
  const { isSignedIn, connectedWallet } = useStacksAuth();

  useEffect(() => {
    // Show helper if user is signed in but no wallet is detected
    const shouldShow = isSignedIn && !connectedWallet;
    setShowHelper(shouldShow);
    
    // Reset fixed wallet state when wallet is properly detected
    if (connectedWallet) {
      setFixedWallet(null);
    }
  }, [isSignedIn, connectedWallet]);

  const handleWalletFix = async (walletId: SupportedWallet) => {
    setIsFixing(true);
    try {
      console.log(`🔧 User manually selected wallet: ${walletId}`);
      manuallySetWallet(walletId);
      setFixedWallet(walletId);
      
      // Hide the helper after a short delay
      setTimeout(() => {
        setShowHelper(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to fix wallet detection:', error);
    } finally {
      setIsFixing(false);
    }
  };

  const handleDismiss = () => {
    setShowHelper(false);
  };

  if (!showHelper) {
    return null;
  }

  const installedWallets = detectInstalledWallets();
  const availableWallets = installedWallets.filter(wallet => wallet !== 'hiro'); // Exclude Hiro as it's always available

  return (
    <div className={`fixed bottom-4 left-4 z-50 max-w-sm ${className}`}>
      <Card className="p-4 border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
        <div className="flex items-start space-x-3">
          <FiAlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            {fixedWallet ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <FiCheck className="w-4 h-4 text-green-600" />
                  <h4 className="text-sm font-medium text-green-900 dark:text-green-100">
                    Wallet Fixed!
                  </h4>
                </div>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Your {fixedWallet} wallet is now properly detected.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-orange-900 dark:text-orange-100">
                    Wallet Detection Issue
                  </h4>
                  <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                    You're connected but we can't detect which wallet you're using. 
                    This is due to multiple wallets being installed.
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mb-2">
                    Which wallet did you use to connect?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableWallets.map((walletId) => (
                      <Button
                        key={walletId}
                        variant="outline"
                        size="sm"
                        onClick={() => handleWalletFix(walletId)}
                        disabled={isFixing}
                        className="text-xs h-7 px-2 border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900"
                      >
                        {walletId.charAt(0).toUpperCase() + walletId.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
          >
            <FiX className="h-3 w-3" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
