'use client';

import Link from 'next/link';
import { FiArrowRight, FiPlay, FiGithub } from 'react-icons/fi';
import { IoLogoBitcoin } from 'react-icons/io';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Section } from '@/components/ui/section';
import { AnimatedBadge } from '@/components/ui/animated-badge';
import { useStacksAuth } from '@/hooks/useStacks';

// Custom Stacks Icon Component
const StacksIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 0L2 6v12l10 6 10-6V6L12 0zm8 16.5l-8 4.8-8-4.8V7.5l8-4.8 8 4.8v9z"/>
    <path d="M12 3L6 6.5v7l6 3.5 6-3.5v-7L12 3zm4 9.5l-4 2.3-4-2.3V8.5l4-2.3 4 2.3v4z"/>
  </svg>
);

export function Hero() {
  const { isSignedIn } = useStacksAuth();

  return (
    <Section background="default" padding="xl" className="relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 -z-10">
        {/* Main gradient orbs */}
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-stacks-500/15 via-purple-500/8 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-bitcoin-500/15 via-orange-500/8 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />

        {/* Additional floating elements */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-[200px] h-[200px] bg-gradient-to-br from-stacks-400/10 to-transparent rounded-full blur-2xl"
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-[150px] h-[150px] bg-gradient-to-br from-bitcoin-400/10 to-transparent rounded-full blur-2xl"
          animate={{
            y: [20, -20, 20],
            x: [10, -10, 10],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      <div className="relative">
        {/* Main Content */}
        <div className="text-center max-w-5xl mx-auto">
          {/* Enhanced Animated Badge - Inspired by Augment Code */}
          <div className="mb-8">
            <AnimatedBadge>
              <span className="hidden sm:inline">Join 500+ Bitcoin developers </span>
              building the future
            </AnimatedBadge>
          </div>

          {/* Enhanced Main Headline with Floating Animation */}
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-foreground mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.span
              animate={{ y: [-2, 2, -2] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Showcase Your{' '}
            </motion.span>
            <motion.span
              className="text-gradient-stacks"
              animate={{ y: [2, -2, 2] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
              style={{ color: '#6366f1', display: 'inline-block' }}
            >
              Bitcoin
            </motion.span>
            <br />
            <motion.span
              animate={{ y: [-1, 1, -1] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            >
              Development Skills
            </motion.span>
          </motion.h1>

          {/* Enhanced Subheadline */}
          <motion.p
            className="text-sm sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            The premier platform for Stacks developers to build their reputation,
            showcase their projects, and connect with opportunities in the Bitcoin ecosystem.
          </motion.p>

          {/* Enhanced CTA Buttons with Floating Effects */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 sm:mb-16 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.div
              whileHover={{
                y: -2,
                boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.15)"
              }}
              whileTap={{ scale: 0.98 }}
              animate={{ y: [-1, 1, -1] }}
              transition={{
                y: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            >
              <Link href="/profile/create">
                <Button size="lg" className="text-lg px-8 py-4 group shadow-lg">
                  <span>Create Your Profile</span>
                  <FiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 ml-2" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{
                y: -2,
                borderColor: "rgba(99, 102, 241, 0.3)"
              }}
              whileTap={{ scale: 0.98 }}
              animate={{ y: [1, -1, 1] }}
              transition={{
                y: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }
              }}
            >
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 group backdrop-blur-sm">
                <Link href="/developers" className="flex items-center space-x-2">
                  <FiPlay className="w-4 h-4" />
                  <span>Watch Demo</span>
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Enhanced Trust Indicators with Floating Animation */}
          <motion.div
            className="flex flex-wrap justify-center items-center gap-8 text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {[
              {
                icon: StacksIcon,
                label: "Stacks Foundation",
                iconColor: "text-stacks-600 dark:text-stacks-400"
              },
              {
                icon: IoLogoBitcoin,
                label: "Bitcoin Ecosystem",
                iconColor: "text-bitcoin-600 dark:text-bitcoin-400"
              },
              {
                icon: FiGithub,
                label: "GitHub Integration",
                iconColor: "text-foreground"
              }
            ].map((item, index) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3 group cursor-pointer"
                  whileHover={{
                    y: -2,
                    scale: 1.05
                  }}
                  animate={{ y: [-1, 1, -1] }}
                  transition={{
                    y: {
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.3
                    }
                  }}
                >
                  <motion.div
                    className="w-10 h-10 bg-muted hover:bg-accent rounded-lg border border-border flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200"
                    whileHover={{ rotate: 5 }}
                  >
                    <IconComponent className={`w-5 h-5 ${item.iconColor}`} />
                  </motion.div>
                  <span className="text-sm font-medium group-hover:text-foreground transition-colors">{item.label}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </Section>
  );
}
