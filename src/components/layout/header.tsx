'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { useStacksAuth } from '@/hooks/useStacks';
import { truncateAddress } from '@/lib/stacks';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSignedIn, userAddress, connect, disconnect, isLoading } = useStacksAuth();

  const navigation = [
    { name: 'Developers', href: '/developers' },
    { name: 'Projects', href: '/projects' },
    { name: 'Jobs', href: '/jobs' },
    { name: 'About', href: '/about' },
  ];

  return (
    <header className="bg-background shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-stacks-500 to-stacks-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SB</span>
              </div>
              <span className="text-xl font-bold text-foreground">StacksBuilder</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {isLoading ? (
              <div className="w-6 h-6 loading-spinner"></div>
            ) : isSignedIn && userAddress ? (
              <div className="relative group">
                <Button
                  variant="outline"
                  size="md"
                  className="flex items-center space-x-2"
                >
                  <FiUser className="w-4 h-4" />
                  <span className="text-sm font-medium">{truncateAddress(userAddress)}</span>
                </Button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <Link
                      href="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      <FiUser className="w-4 h-4" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      <FiSettings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                    <hr className="my-1 border-border" />
                    <button
                      type="button"
                      onClick={disconnect}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                    >
                      <FiLogOut className="w-4 h-4" />
                      <span>Disconnect</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Button
                onClick={connect}
                variant="primary"
                size="md"
                animated
                className="shadow-md hover:shadow-lg"
              >
                Connect Wallet
              </Button>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              {isMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
