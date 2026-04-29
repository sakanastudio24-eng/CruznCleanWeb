import { SiteShell } from '@/components/layout/site-shell';
import { CtaSection } from '@/components/sections/cta-section';
import { GalleryPreviewSection } from '@/components/sections/gallery-preview-section';
import { HeroSection } from '@/components/sections/hero-section';
import { ProcessSection } from '@/components/sections/process-section';
import { ResultsSection } from '@/components/sections/results-section';
import { ServicesSection } from '@/components/sections/services-section';
import { TestimonialsSection } from '@/components/sections/testimonials-section';

/**
 * Composes a long-form homepage with trust, process, and conversion sections.
 */
export default function HomePage(): JSX.Element {
  return (
    <SiteShell>
      <HeroSection />
      <div className="relative overflow-hidden bg-[linear-gradient(180deg,#0D0D0D_0%,#141414_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,transparent_28%,transparent_100%)]" />
        <div className="relative">
          <ServicesSection />
          <ProcessSection />
        </div>
      </div>
      <div className="relative overflow-hidden bg-[linear-gradient(180deg,#0D0D0D_0%,#141414_100%)]">
        <div className="relative">
          <GalleryPreviewSection />
          <ResultsSection />
        </div>
      </div>
      <div className="relative overflow-hidden bg-[linear-gradient(180deg,#141414_0%,#0D0D0D_100%)]">
        <div className="relative">
          <TestimonialsSection />
        </div>
      </div>
      <CtaSection />
    </SiteShell>
  );
}
