'use client';

import { motion } from 'framer-motion';

interface FloatingElementsProps {
  variant?: 'hero' | 'section' | 'minimal';
  className?: string;
}

export function FloatingElements({ variant = 'section', className = '' }: FloatingElementsProps) {
  const elements = {
    hero: [
      {
        size: 'w-[800px] h-[800px]',
        position: 'top-0 left-1/2 -translate-x-1/2',
        gradient: 'from-stacks-500/15 via-purple-500/8 to-transparent',
        blur: 'blur-3xl',
        animation: { scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] },
        duration: 8,
        delay: 0
      },
      {
        size: 'w-[600px] h-[600px]',
        position: 'bottom-0 right-0',
        gradient: 'from-bitcoin-500/15 via-orange-500/8 to-transparent',
        blur: 'blur-3xl',
        animation: { scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] },
        duration: 10,
        delay: 2
      },
      {
        size: 'w-[200px] h-[200px]',
        position: 'top-1/4 left-1/4',
        gradient: 'from-stacks-400/10 to-transparent',
        blur: 'blur-2xl',
        animation: { y: [-20, 20, -20], x: [-10, 10, -10] },
        duration: 6,
        delay: 0
      },
      {
        size: 'w-[150px] h-[150px]',
        position: 'top-3/4 right-1/4',
        gradient: 'from-bitcoin-400/10 to-transparent',
        blur: 'blur-2xl',
        animation: { y: [20, -20, 20], x: [10, -10, 10] },
        duration: 7,
        delay: 1
      }
    ],
    section: [
      {
        size: 'w-[400px] h-[400px]',
        position: 'top-0 right-0',
        gradient: 'from-stacks-400/8 to-transparent',
        blur: 'blur-3xl',
        animation: { scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] },
        duration: 8,
        delay: 0
      },
      {
        size: 'w-[300px] h-[300px]',
        position: 'bottom-0 left-0',
        gradient: 'from-bitcoin-400/8 to-transparent',
        blur: 'blur-3xl',
        animation: { scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] },
        duration: 9,
        delay: 1
      }
    ],
    minimal: [
      {
        size: 'w-[200px] h-[200px]',
        position: 'top-1/4 right-1/4',
        gradient: 'from-stacks-300/5 to-transparent',
        blur: 'blur-2xl',
        animation: { y: [-10, 10, -10] },
        duration: 6,
        delay: 0
      }
    ]
  };

  const selectedElements = elements[variant];

  return (
    <div className={`absolute inset-0 -z-10 ${className}`}>
      {selectedElements.map((element, index) => (
        <motion.div
          key={index}
          className={`absolute ${element.position} ${element.size} bg-gradient-to-br ${element.gradient} rounded-full ${element.blur}`}
          animate={element.animation}
          transition={{
            duration: element.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: element.delay
          }}
        />
      ))}
    </div>
  );
}
