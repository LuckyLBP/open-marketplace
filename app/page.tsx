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
      <BannerAd position="top" />
      <Navbar />

      <main className="flex-1 relative">
        <div className="container mx-auto px-4 py-6">
          <CarouselBanner
            autoRotateInterval={5000}
            showArrows={true}
            showDots={true}
          />
        </div>

        {/* Single sidebar ad on right side only */}
        <FeaturedDealsSection />
        <CategoriesSection />

        <div className="container mx-auto px-4 py-6">
          <CategoryBanner category="hemmet" />
        </div>

        {/* Category sections */}
        <CategoryProductsSection categoryKey="elektronik" />

        <div className="container mx-auto px-4 py-6">
          <CategoryBanner category="elektronik" />
        </div>

        <CategoryProductsSection categoryKey="mode" />

        {/* Example Category Banner */}

        <FloatingAd className="lg:fixed lg:bottom-4" />

        <CategoryProductsSection categoryKey="hemmet" />

        <div className="container mx-auto px-4 py-6">
          <CategoryBanner category="hobby-fritid" />
        </div>

        <CategoryProductsSection categoryKey="halsa-skonhet" />

        <CategoryProductsSection categoryKey="hobby-fritid" />

        <div className="container mx-auto px-4 py-6">
          <CategoryBanner category="halsa-skonhet" />
        </div>

        <HowItWorksSection />

        <BusinessCTASection />
      </main>

      <Footer />
    </div>
  );
}
