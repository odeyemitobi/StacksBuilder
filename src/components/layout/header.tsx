'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useStacksAuth } from '@/hooks/useStacks';
import { truncateAddress } from '@/lib/stacks';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isSignedIn, userAddress, connect, disconnect, isLoading } = useStacksAuth();

  const navigation = [
    { name: 'Developers', href: '/developers' },
    { name: 'Projects', href: '/projects' },
    { name: 'Jobs', href: '/jobs' },
    { name: 'About', href: '/about' },
  ];

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-md shadow-lg border-b border-border/50'
          : 'bg-background/80 backdrop-blur-sm border-b border-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/main-logo.png"
                alt="StacksBuilder"
                width={180}
                height={40}
                className="h-8 w-auto hidden sm:block"
                priority
              />
              {/* Mobile logo - just the icon */}
              <Image
                src="/single-favicon.png"
                alt="StacksBuilder"
                width={32}
                height={32}
                className="h-8 w-8 sm:hidden"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
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
          <div className="flex items-center space-x-3">
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
                  <span className="text-sm font-medium hidden sm:inline">{truncateAddress(userAddress)}</span>
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
                className="shadow-md hover:shadow-lg text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2"
              >
                Connect Wallet
              </Button>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              {isMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="lg:hidden py-4 border-t border-border/50"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <nav className="flex flex-col space-y-2">
                {navigation.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium transition-colors duration-200 block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
