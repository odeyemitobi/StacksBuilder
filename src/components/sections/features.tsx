'use client';

import { IconType } from 'react-icons';
import { FiCode, FiUsers, FiBriefcase, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Section, SectionHeader } from '@/components/ui/section';
import { Card } from '@/components/ui/card';

interface Feature {
  icon: IconType;
  title: string;
  description: string;
}

interface FeaturesProps {
  features?: Feature[];
  title?: string;
  description?: string;
}

const defaultFeatures: Feature[] = [
  {
    icon: FiCode,
    title: 'Showcase Your Work',
    description: 'Create a professional portfolio highlighting your Stacks and Bitcoin projects with verified GitHub integration.',
  },
  {
    icon: FiUsers,
    title: 'Build Your Reputation',
    description: 'Earn reputation points through community endorsements, project contributions, and ecosystem participation.',
  },
  {
    icon: FiBriefcase,
    title: 'Find Opportunities',
    description: 'Connect with Bitcoin companies, discover job openings, and participate in bounty programs.',
  },
  {
    icon: FiStar,
    title: 'Get Discovered',
    description: 'Make your skills visible to the entire Bitcoin ecosystem and attract opportunities that match your expertise.',
  },
];

export function Features({ 
  features = defaultFeatures,
  title = "Everything You Need to Succeed",
  description = "Build your professional presence in the Bitcoin ecosystem with tools designed specifically for Stacks developers."
}: FeaturesProps) {
  return (
    <Section background="muted" padding="lg">
      <SectionHeader 
        title={title}
        description={description}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{
              y: -8,
              transition: { duration: 0.2 }
            }}
            animate={{
              y: [-2, 2, -2],
            }}
            transition={{
              y: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.5
              }
            }}
          >
            <Card hover className="text-center group h-full">
              <motion.div
                className="w-16 h-16 bg-stacks-100 dark:bg-stacks-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-300 group-hover:bg-stacks-200 dark:group-hover:bg-stacks-800/30 shadow-lg"
                whileHover={{
                  scale: 1.1,
                  rotate: 5,
                  boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.3)"
                }}
                animate={{
                  rotate: [0, 2, 0, -2, 0],
                }}
                transition={{
                  rotate: {
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.3
                  }
                }}
              >
                <feature.icon className="w-8 h-8 text-stacks-600" />
              </motion.div>
              <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-stacks-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
