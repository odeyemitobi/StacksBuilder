import { Hero } from '@/components/sections/hero';
import { Stats } from '@/components/sections/stats';
import { Features } from '@/components/sections/features';
import { FeaturedProjects } from '@/components/sections/featured-projects';
import { CTA } from '@/components/sections/cta';

export default function HomePage() {

  return (
    <div className="min-h-screen">
      <Hero />
      <Stats />
      <Features />
      <FeaturedProjects />
      <CTA />
    </div>
  );
}
