'use client';

import { motion } from 'framer-motion';
import { Section } from '@/components/ui/section';

interface Stat {
  label: string;
  value: string;
  description?: string;
}

interface StatsProps {
  stats?: Stat[];
}

const defaultStats: Stat[] = [
  { 
    label: 'Developers', 
    value: '500+',
    description: 'Active builders'
  },
  { 
    label: 'Projects', 
    value: '1,200+',
    description: 'Showcased works'
  },
  { 
    label: 'Job Placements', 
    value: '150+',
    description: 'Successful hires'
  },
  { 
    label: 'Companies', 
    value: '50+',
    description: 'Hiring partners'
  },
];

export function Stats({ stats = defaultStats }: StatsProps) {
  return (
    <Section background="card" padding="lg">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            className="text-center group"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{
              y: -4,
              transition: { duration: 0.2 }
            }}
            animate={{
              y: [-1, 1, -1],
            }}
            transition={{
              y: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.2
              }
            }}
          >
            <motion.div
              className="text-4xl md:text-5xl font-bold text-stacks-600 mb-2"
              whileHover={{
                scale: 1.1,
                color: "rgb(var(--color-stacks-500))"
              }}
              animate={{
                scale: [1, 1.02, 1],
              }}
              transition={{
                scale: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.3
                }
              }}
            >
              {stat.value}
            </motion.div>
            <div className="text-foreground font-medium mb-1 group-hover:text-stacks-600 transition-colors">{stat.label}</div>
            {stat.description && (
              <div className="text-sm text-muted-foreground">{stat.description}</div>
            )}
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
