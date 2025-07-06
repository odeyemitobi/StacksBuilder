'use client';

import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Section } from '@/components/ui/section';
import { Button } from '@/components/ui/button';

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
  const isGradient = background.includes('gradient');
  // Proper text colors for both light and dark modes
  const textColor = isGradient ? 'text-gray-900 dark:text-white' : 'text-foreground';
  const descriptionColor = isGradient ? 'text-gray-800 dark:text-gray-100' : 'text-muted-foreground';
  
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
        className="text-center max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <motion.h2
          className={`text-3xl md:text-4xl font-bold mb-6 ${textColor}`}
          animate={{
            y: [-2, 2, -2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {title}
        </motion.h2>
        <motion.p
          className={`text-xl mb-8 leading-relaxed ${descriptionColor}`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {description}
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
          {isGradient ? (
            <Button
              size="lg"
              className="text-lg px-8 py-4 group shadow-lg btn-cta-gradient"
            >
              <Link href={buttonHref} className="flex items-center space-x-2">
                <span>{buttonText}</span>
                <FiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          ) : (
            <Button
              size="lg"
              variant="primary"
              className="text-lg px-8 py-4 group shadow-lg"
            >
              <Link href={buttonHref} className="flex items-center space-x-2">
                <span>{buttonText}</span>
                <FiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          )}
        </motion.div>
      </motion.div>
    </Section>
  );
}
