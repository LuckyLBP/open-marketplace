// filepath: /Users/lucaspohl/Documents/Effektiv Media/Projekt/open-marketplace/app/page.tsx
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { HeroBanner } from '@/components/hero-banner';
import { CategoriesSection } from '@/components/categories-section';
import { TrendingDealsSection } from '@/components/trending-deals-section';
import { FeaturedDealsSection } from '@/components/featured-deals-section';
import { HowItWorksSection } from '@/components/how-it-works-section';
import { BusinessCTASection } from '@/components/business-cta-section';
import { ProductShowcaseSection } from '@/components/product-showcase-section';
import { SidebarAd } from '@/components/sidebar-ad';
import { BannerAd } from '@/components/banner-ad';
import { ProductSpotlight } from '@/components/product-spotlight';
import { FloatingAd } from '@/components/floating-ad';
import { InlineAd } from '@/components/inline-ad';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <BannerAd position="top" />
      <Navbar />

      <main className="flex-1 relative">
        {/* Single sidebar ad on right side only */}

        <HeroBanner />

        <CategoriesSection />

        <FloatingAd className="lg:fixed lg:bottom-4" />

        <FeaturedDealsSection />

        <TrendingDealsSection />

        <ProductShowcaseSection />

        <HowItWorksSection />

        <BusinessCTASection />
      </main>

      <Footer />
    </div>
  );
}
