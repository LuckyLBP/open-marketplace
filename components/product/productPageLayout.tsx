import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ReactNode } from 'react';

const ProductPageLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow bg-gradient-to-b from-purple-50 to-white py-12 px-4">
                <div className="container mx-auto max-w-7xl">{children}</div>
            </main>
            <Footer />
        </div>
    );
};

export default ProductPageLayout;