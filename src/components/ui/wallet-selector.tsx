'use client';

import { useState } from 'react';
import { FiX, FiCheck, FiExternalLink, FiCreditCard } from 'react-icons/fi';
import { Button } from './button';
import { Card } from './card';
import { getWalletInfo, detectInstalledWallets, type SupportedWallet, type WalletInfo } from '@/lib/stacks';

interface WalletSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletSelect: (walletId: SupportedWallet) => void;
  isConnecting?: boolean;
  selectedWallet?: SupportedWallet | null;
}

export function WalletSelector({
  isOpen,
  onClose,
  onWalletSelect,
  isConnecting = false,
  selectedWallet
}: WalletSelectorProps) {
  const [hoveredWallet, setHoveredWallet] = useState<SupportedWallet | null>(null);

  const supportedWallets: SupportedWallet[] = ['hiro', 'leather', 'xverse', 'asigna'];
  const installedWallets = detectInstalledWallets();

  const handleWalletClick = (walletId: SupportedWallet, walletInfo: WalletInfo) => {
    if (!walletInfo.isInstalled) {
      window.open(walletInfo.downloadUrl, '_blank');
      return;
    }

    onWalletSelect(walletId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 min-h-screen">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md z-[10000] mx-auto my-auto">
        <Card className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Connect Wallet</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Choose your preferred Stacks wallet
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
              disabled={isConnecting}
            >
              <FiX className="h-4 w-4" />
            </Button>
          </div>

          {/* Wallet List */}
          <div className="space-y-3">
            {supportedWallets.map((walletId) => {
              const walletInfo = getWalletInfo(walletId);
              const isSelected = selectedWallet === walletId;

              return (
                <div key={walletId} className="relative">
                  <button
                    type="button"
                    onClick={() => handleWalletClick(walletId, walletInfo)}
                    disabled={isConnecting && !isSelected}
                    className={`
                      w-full p-4 rounded-lg border transition-all duration-200 text-left
                      ${walletInfo.isInstalled
                        ? 'border-border hover:border-border hover:bg-accent'
                        : 'border-dashed border-muted-foreground/30 hover:border-muted-foreground/50'
                      }
                      ${isSelected ? 'border-foreground bg-accent' : ''}
                      ${isConnecting && !isSelected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                      <div className="flex items-center space-x-3">
                        {/* Wallet Icon */}
                        <div className="relative">
                          <div className={`
                            w-10 h-10 rounded-lg flex items-center justify-center
                            ${walletInfo.isInstalled ? 'bg-background border border-border' : 'bg-muted'}
                          `}>
                            <FiCreditCard className="w-6 h-6 text-foreground" />
                          </div>
                          
                          {/* Status indicators */}
                          {walletInfo.isInstalled && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <FiCheck className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Wallet Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-foreground">{walletInfo.name}</h3>
                            {!walletInfo.isInstalled && (
                              <FiExternalLink className="w-3 h-3 text-muted-foreground" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                            {walletInfo.description}
                          </p>
                        </div>

                        {/* Action indicator */}
                        <div className="flex items-center">
                          {isConnecting && isSelected ? (
                            <div className="w-5 h-5 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                          ) : !walletInfo.isInstalled ? (
                            <div className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
                              Install
                            </div>
                          ) : (
                            <div className="w-2 h-2 bg-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                New to Stacks?{' '}
                <a
                  href="https://docs.stacks.co/stacks-101/wallets"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:underline"
                >
                  Learn about wallets
                </a>
              </p>
            </div>
        </Card>
      </div>
    </div>
  );
}
