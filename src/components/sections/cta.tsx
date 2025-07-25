'use client';

import React from 'react';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Section } from '@/components/ui/section';
import { Button } from '@/components/ui/button';
import { useStacksAuth, useProfileCheck } from '@/hooks/useStacks';
// Removed unused imports

interface CTAProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
  background?: 'gradient-stacks' | 'gradient-bitcoin' | 'default';
}

export function CTA({
  title = "Ready to Build Your Reputation?",
  description = "Join hundreds of developers who are already showcasing their skills and connecting with opportunities in the Bitcoin ecosystem.",
  buttonText = "Get Started Today",
  buttonHref = "/signup",
  background = "gradient-stacks"
}: CTAProps) {
  const { isSignedIn, userAddress } = useStacksAuth();
  const { hasProfile: hasCreatedProfile } = useProfileCheck(userAddress);

  const isGradient = background.includes('gradient');
  // Proper text colors for both light and dark modes
  const textColor = isGradient ? 'text-gray-900 dark:text-white' : 'text-foreground';
  const descriptionColor = isGradient ? 'text-gray-800 dark:text-gray-100' : 'text-muted-foreground';

  // Dynamic content based on user state
  const dynamicTitle = isSignedIn && hasCreatedProfile
    ? "Keep Building Your Reputation!"
    : title;
  const dynamicDescription = isSignedIn && hasCreatedProfile
    ? "Continue showcasing your projects and connecting with opportunities in the Bitcoin ecosystem."
    : description;
  const dynamicButtonText = isSignedIn && hasCreatedProfile
    ? "View Your Profile"
    : buttonText;
  const dynamicButtonHref = isSignedIn && hasCreatedProfile
    ? `/profile/${userAddress}`
    : buttonHref;
  
  return (
    <Section background={background} padding="lg" className="relative overflow-hidden">
      {/* Floating background elements for gradient sections */}
      {isGradient && (
        <div className="absolute inset-0 -z-10">
          <motion.div
            className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-white/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-[200px] h-[200px] bg-white/5 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
        </div>
      )}

      <motion.div
        className="text-center max-w-4xl mx-auto px-4"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <motion.h2
          className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight ${textColor}`}
          animate={{
            y: [-2, 2, -2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {dynamicTitle}
        </motion.h2>
        <motion.p
          className={`text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 leading-relaxed ${descriptionColor}`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {dynamicDescription}
        </motion.p>

        <motion.div
          whileHover={{
            y: -4,
            boxShadow: isGradient
              ? "0 20px 40px -10px rgba(255, 255, 255, 0.3)"
              : "0 20px 40px -10px rgba(0, 0, 0, 0.15)"
          }}
          whileTap={{ scale: 0.98 }}
          animate={{
            y: [-1, 1, -1],
          }}
          transition={{
            y: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        >
          {isSignedIn && hasCreatedProfile ? (
            // Show working link for users with profiles
            isGradient ? (
              <Button
                size="lg"
                className="text-lg px-8 py-4 group shadow-lg btn-cta-gradient"
              >
                <Link href={dynamicButtonHref} className="flex items-center space-x-2">
                  <span>{dynamicButtonText}</span>
                  <FiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            ) : (
              <Button
                size="lg"
                variant="primary"
                className="text-lg px-8 py-4 group shadow-lg"
              >
                <Link href={dynamicButtonHref} className="flex items-center space-x-2">
                  <span>{dynamicButtonText}</span>
                  <FiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            )
          ) : (
            // Show "Coming Soon" for users without profiles or not signed in
            isGradient ? (
              <Button
                size="lg"
                className="text-lg px-8 py-4 group shadow-lg btn-cta-gradient cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <span>Coming Soon</span>
                  <FiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </div>
              </Button>
            ) : (
              <Button
                size="lg"
                variant="primary"
                className="text-lg px-8 py-4 group shadow-lg cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <span>Coming Soon</span>
                  <FiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </div>
              </Button>
            )
          )}
        </motion.div>
      </motion.div>
    </Section>
  );
}
