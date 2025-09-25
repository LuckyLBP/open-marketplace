import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CategoriesSection } from '@/components/categories-section';
import { TrendingDealsSection } from '@/components/trending-deals-section';
import { FeaturedDealsSection } from '@/components/featured-deals-section';
import { CategoryProductsSection } from '@/components/category-products-section';
import { HowItWorksSection } from '@/components/how-it-works-section';
import { BusinessCTASection } from '@/components/business-cta-section';
import { ProductShowcaseSection } from '@/components/product-showcase-section';
import { BannerAd } from '@/components/banner-ad';
import { ProductSpotlight } from '@/components/product-spotlight';
import { FloatingAd } from '@/components/floating-ad';
import { InlineAd } from '@/components/inline-ad';
import BannerAdPreview from '@/components/boost/adPreview/bannerAdPreview';
import { RoundedBanner } from '@/components/rounded-banner';
import { CarouselBanner } from '@/components/carousel-banner';
import { CategoryBanner } from '@/components/category-banner';
import {
  HeaderBanner,
  SidebarBanner,
  FooterBanner,
  InlineBanner,
} from '@/components/dynamic-banner';

export default function Home() {
  // Main Category Keys
  /*
    elektronik
    mode
    hemmet
    halsa-skonhet
    hobby-fritid
  */

  return (
    <div className="flex min-h-screen flex-col">
      {/* Dynamic Header Banner */}

      <Navbar />

      <main className="flex-1 relative">
        <HeaderBanner className="w-full" />
        {/* <div className="container mx-auto px-4 py-3">
          <CarouselBanner
            autoRotateInterval={5000}
            showArrows={true}
            showDots={true}
          />
        </div> */}

        <FeaturedDealsSection />

        <CategoriesSection />

        {/* Dynamic Inline Banner between sections */}
        <div className="container mx-auto px-4 py-6">
          <InlineBanner className="w-full" />
        </div>

        <CategoryProductsSection categoryKey="halsa-skonhet" />
        <CategoryProductsSection categoryKey="hemmet" />
        <CategoryProductsSection categoryKey="hobby-fritid" />

        <FloatingAd className="lg:fixed lg:bottom-4" />

        {/* Dynamic Footer Banner */}
        <FooterBanner className="w-full" />

        <HowItWorksSection />

        <BusinessCTASection />
      </main>

      <Footer />
    </div>
  );
}
