import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ReactNode } from 'react';

const ProductPageLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow bg-gradient-to-b from-white to-purple-50/30 py-10">
        <div className="mx-auto max-w-6xl px-4">{children}</div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductPageLayout;
