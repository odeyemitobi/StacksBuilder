'use client';

// Link import removed as it's not used in this component
import { FiArrowRight, FiStar, FiGithub, FiExternalLink } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Section, SectionHeader } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Project {
  title: string;
  description: string;
  techStack: string[];
  author: string;
  stars: number;
  githubUrl: string;
  liveUrl: string;
}

interface FeaturedProjectsProps {
  projects?: Project[];
  title?: string;
  description?: string;
  showViewAll?: boolean;
}

const defaultProjects: Project[] = [
  {
    title: 'DeFi Yield Optimizer',
    description: 'Smart contract system for optimizing STX staking rewards with automated rebalancing and risk management.',
    techStack: ['Clarity', 'React', 'TypeScript'],
    author: 'alice.btc',
    stars: 24,
    githubUrl: '#',
    liveUrl: '#',
  },
  {
    title: 'Bitcoin NFT Marketplace',
    description: 'Decentralized marketplace for Bitcoin Ordinals with Stacks integration and cross-chain functionality.',
    techStack: ['Clarity', 'Next.js', 'Tailwind'],
    author: 'bob.btc',
    stars: 18,
    githubUrl: '#',
    liveUrl: '#',
  },
  {
    title: 'DAO Governance Tool',
    description: 'Comprehensive governance platform for Bitcoin DAOs with voting mechanisms and treasury management.',
    techStack: ['Clarity', 'Vue.js', 'Web3'],
    author: 'charlie.btc',
    stars: 31,
    githubUrl: '#',
    liveUrl: '#',
  },
];

export function FeaturedProjects({ 
  projects = defaultProjects,
  title = "Featured Projects",
  description = "Discover amazing projects built by our community",
  showViewAll = true
}: FeaturedProjectsProps) {
  return (
    <Section background="default" padding="lg">
      <div className="flex justify-between items-end mb-12">
        <SectionHeader 
          title={title}
          description={description}
          centered={false}
        />
        {showViewAll && (
          <Button variant="outline" className="hidden md:inline-flex cursor-pointer">
            <div className="flex items-center space-x-2">
              <span>Coming Soon</span>
              <FiArrowRight className="w-4 h-4" />
            </div>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{
              y: -6,
              transition: { duration: 0.2 }
            }}
            animate={{
              y: [-1, 1, -1],
            }}
            transition={{
              opacity: { duration: 0.6, delay: index * 0.1 },
              y: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.4
              }
            }}
          >
            <Card hover className="group h-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-foreground group-hover:text-stacks-600 transition-colors">
                {project.title}
              </h3>
              <motion.div
                className="flex items-center space-x-1 text-muted-foreground"
                whileHover={{ scale: 1.1 }}
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  scale: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                <FiStar className="w-4 h-4 fill-current text-yellow-500" />
                <span className="text-sm font-medium">{project.stars}</span>
              </motion.div>
            </div>
            
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {project.techStack.map((tech, techIndex) => (
                <Badge key={techIndex} variant="secondary">
                  {tech}
                </Badge>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                by <span className="font-medium text-foreground">{project.author}</span>
              </span>
              <div className="flex space-x-3">
                <motion.div
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Coming Soon"
                  whileHover={{
                    scale: 1.2,
                    rotate: 5
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiGithub className="w-5 h-5" />
                </motion.div>
                <motion.div
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Coming Soon"
                  whileHover={{
                    scale: 1.2,
                    rotate: -5
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiExternalLink className="w-5 h-5" />
                </motion.div>
              </div>
            </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {showViewAll && (
        <div className="text-center mt-12 md:hidden">
          <Button variant="outline" className="cursor-pointer">
            <div className="flex items-center space-x-2">
              <span>Coming Soon</span>
              <FiArrowRight className="w-4 h-4" />
            </div>
          </Button>
        </div>
      )}
    </Section>
  );
}
