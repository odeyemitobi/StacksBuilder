import Link from 'next/link';
import {
  FiArrowRight,
  FiCode,
  FiUsers,
  FiBriefcase,
  FiStar,
  FiGithub,
  FiExternalLink
} from 'react-icons/fi';

export default function HomePage() {
  const features = [
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

  const stats = [
    { label: 'Developers', value: '500+' },
    { label: 'Projects', value: '1,200+' },
    { label: 'Job Placements', value: '150+' },
    { label: 'Companies', value: '50+' },
  ];

  const featuredProjects = [
    {
      title: 'DeFi Yield Optimizer',
      description: 'Smart contract system for optimizing STX staking rewards',
      techStack: ['Clarity', 'React', 'TypeScript'],
      author: 'alice.btc',
      stars: 24,
      githubUrl: '#',
      liveUrl: '#',
    },
    {
      title: 'Bitcoin NFT Marketplace',
      description: 'Decentralized marketplace for Bitcoin Ordinals with Stacks integration',
      techStack: ['Clarity', 'Next.js', 'Tailwind'],
      author: 'bob.btc',
      stars: 18,
      githubUrl: '#',
      liveUrl: '#',
    },
    {
      title: 'DAO Governance Tool',
      description: 'Comprehensive governance platform for Bitcoin DAOs',
      techStack: ['Clarity', 'Vue.js', 'Web3'],
      author: 'charlie.btc',
      stars: 31,
      githubUrl: '#',
      liveUrl: '#',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-background py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Showcase Your{' '}
              <span className="text-gradient-stacks">Bitcoin</span>{' '}
              Development Skills
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              The premier platform for Stacks developers to build their reputation,
              showcase their projects, and connect with opportunities in the Bitcoin ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="btn-primary text-lg px-8 py-3 inline-flex items-center space-x-2"
              >
                <span>Create Your Profile</span>
                <FiArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/developers"
                className="btn-outline text-lg px-8 py-3"
              >
                Explore Developers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-stacks-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Build your professional presence in the Bitcoin ecosystem with tools
              designed specifically for Stacks developers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center">
                <div className="w-12 h-12 bg-stacks-100 dark:bg-stacks-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-stacks-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Featured Projects
              </h2>
              <p className="text-xl text-muted-foreground">
                Discover amazing projects built by our community
              </p>
            </div>
            <Link
              href="/projects"
              className="btn-outline hidden md:inline-flex items-center space-x-2"
            >
              <span>View All Projects</span>
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((project, index) => (
              <div key={index} className="card-hover">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-foreground">
                    {project.title}
                  </h3>
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <FiStar className="w-4 h-4" />
                    <span className="text-sm">{project.stars}</span>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-4">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.techStack.map((tech, techIndex) => (
                    <span key={techIndex} className="badge-secondary">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    by {project.author}
                  </span>
                  <div className="flex space-x-2">
                    <a
                      href={project.githubUrl}
                      className="text-muted-foreground hover:text-foreground"
                      title="View on GitHub"
                    >
                      <FiGithub className="w-4 h-4" />
                    </a>
                    <a
                      href={project.liveUrl}
                      className="text-muted-foreground hover:text-foreground"
                      title="View live project"
                    >
                      <FiExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Link
              href="/projects"
              className="btn-outline inline-flex items-center space-x-2"
            >
              <span>View All Projects</span>
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-stacks">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Build Your Reputation?
          </h2>
          <p className="text-xl text-stacks-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of developers who are already showcasing their skills 
            and connecting with opportunities in the Bitcoin ecosystem.
          </p>
          <Link
            href="/signup"
            className="bg-white text-stacks-600 hover:bg-gray-100 font-semibold px-8 py-3 rounded-lg inline-flex items-center space-x-2 transition-colors duration-200"
          >
            <span>Get Started Today</span>
            <FiArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
