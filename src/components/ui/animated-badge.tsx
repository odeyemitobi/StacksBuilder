'use client';

import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';

interface AnimatedBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedBadge({ children, className = '' }: AnimatedBadgeProps) {
  return (
    <div className={`relative inline-block ${className}`}>
      {/* Clean badge without rotating border */}
      <motion.div
        className="relative inline-flex items-center px-4 py-2 rounded-full bg-gray-900/90 backdrop-blur-sm text-white text-sm font-medium border border-gray-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{ duration: 0.6 }}
        whileHover={{
          scale: 1.02,
          borderColor: "rgba(34, 197, 94, 0.5)"
        }}
      >
        {/* Green dot indicator */}
        <motion.span
          className="w-2 h-2 bg-green-400 rounded-full mr-2"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <span className="font-normal text-gray-200 uppercase tracking-wide text-xs">
          {children}
        </span>

        {/* Arrow */}
        <FiArrowRight className="w-3 h-3 text-gray-400 ml-2" />
      </motion.div>
    </div>
  );
}
