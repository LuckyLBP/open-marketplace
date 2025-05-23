'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink, ArrowRight } from 'lucide-react';

type Partner = {
  id: string;
  companyName: string;
  logoUrl?: string;
  website?: string;
  description?: string;
  category?: string;
  featured?: boolean;
};

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'companies'));

        // For demo/testing, create a mix of partners with and without complete info
        const partnersData: Partner[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            companyName: data.companyName || `Company ${doc.id.slice(-4)}`,
            logoUrl: data.logoUrl || getRandomLogoPlaceholder(),
            website: data.website || 'https://example.com',
            description:
              data.description ||
              'En partner i BudFynd.se-nätverket som erbjuder exklusiva tidsbegränsade erbjudanden.',
            category: data.category || getRandomCategory(),
            featured: Math.random() > 0.7, // Randomly mark some as featured
          };
        });

        setPartners(partnersData);
      } catch (error) {
        console.error('Error fetching partners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  // Helper function to get random logo placeholder
  const getRandomLogoPlaceholder = () => {
    const placeholders = [
      'https://placehold.co/400x200/purple/white?text=Company+Logo',
      'https://placehold.co/400x200/6366f1/white?text=Partner',
      'https://placehold.co/400x200/d946ef/white?text=Brand',
      'https://placehold.co/400x200/3b82f6/white?text=Enterprise',
      'https://placehold.co/400x200/ec4899/white?text=Retailer',
    ];
    return placeholders[Math.floor(Math.random() * placeholders.length)];
  };

  // Helper function to get random category
  const getRandomCategory = () => {
    const categories = [
      'Elektronik',
      'Mode',
      'Hemmet',
      'Hälsa & Skönhet',
      'Hobby & Fritid',
    ];
    return categories[Math.floor(Math.random() * categories.length)];
  };

  // Filter partners based on active tab
  const filteredPartners = partners.filter((partner) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'featured') return partner.featured;
    return partner.category?.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-gradient-to-b from-purple-50 to-white">
        {/* Hero section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Våra Partners
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Upptäck de ledande företagen som samarbetar med BudFynd.se för att
              erbjuda exklusiva tidsbegränsade erbjudanden.
            </p>
          </div>
        </section>

        {/* Featured Partners Carousel */}
        <section className="py-8 md:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Utvalda Partners</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Våra främsta samarbetspartners som regelbundet erbjuder
                exceptionella deals till våra kunder.
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {partners
                  .filter((partner) => partner.featured)
                  .slice(0, 3)
                  .map((partner) => (
                    <Card
                      key={partner.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="h-40 w-full relative bg-gray-100">
                        <Image
                          src={partner.logoUrl || '/placeholder.svg'}
                          alt={partner.companyName}
                          fill
                          style={{ objectFit: 'contain' }}
                          className="p-6"
                        />
                      </div>
                      <CardContent className="p-6">
                        <h3 className="font-bold text-xl mb-2">
                          {partner.companyName}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {partner.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <Link
                            href={`/marketplace?company=${encodeURIComponent(
                              partner.companyName
                            )}`}
                            className="text-purple-600 hover:text-purple-800 text-sm flex items-center"
                          >
                            Se erbjudanden{' '}
                            <ArrowRight className="ml-1 h-4 w-4" />
                          </Link>

                          {partner.website && (
                            <a
                              href={partner.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-500 hover:text-gray-700 flex items-center text-sm"
                            >
                              Besök webbplats{' '}
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </section>

        {/* All Partners Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Alla Partners</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Utforska vårt växande nätverk av partners som erbjuder exklusiva
                deals genom BudFynd.se.
              </p>
            </div>

            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={setActiveTab}
              className="mb-8"
            >
              <TabsList className="mx-auto flex flex-wrap justify-center">
                <TabsTrigger value="all">Alla</TabsTrigger>
                <TabsTrigger value="featured">Utvalda</TabsTrigger>
                <TabsTrigger value="Elektronik">Elektronik</TabsTrigger>
                <TabsTrigger value="Mode">Mode</TabsTrigger>
                <TabsTrigger value="Hemmet">Hemmet</TabsTrigger>
                <TabsTrigger value="Hälsa & Skönhet">
                  Hälsa & Skönhet
                </TabsTrigger>
                <TabsTrigger value="Hobby & Fritid">Hobby & Fritid</TabsTrigger>
              </TabsList>
            </Tabs>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : filteredPartners.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {filteredPartners.map((partner) => (
                  <Link
                    key={partner.id}
                    href={`/marketplace?company=${encodeURIComponent(
                      partner.companyName
                    )}`}
                    className="group"
                  >
                    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                      <div className="h-32 w-full relative bg-gray-50 p-4 flex items-center justify-center">
                        <Image
                          src={partner.logoUrl || '/placeholder.svg'}
                          alt={partner.companyName}
                          fill
                          style={{ objectFit: 'contain' }}
                          className="p-6 group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="p-4 flex-grow flex flex-col">
                        <h3 className="font-medium text-center group-hover:text-purple-600">
                          {partner.companyName}
                        </h3>
                        <p className="text-xs text-gray-500 text-center mt-auto">
                          {partner.category}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  Inga partners hittades i denna kategori.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Become a Partner */}
        <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Bli en Partner</h2>
              <p className="text-lg opacity-90 mb-8">
                Vill du nå nya kunder och öka din försäljning? Anslut dig till
                BudFynd.se och erbjud tidsbegränsade erbjudanden till tusentals
                engagerade kunder.
              </p>
              <div className="grid sm:grid-cols-3 gap-6 mb-10">
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                  <h3 className="font-bold text-xl mb-3">Ökad Räckvidd</h3>
                  <p className="text-sm opacity-90">
                    Nå nya kunder som är redo att handla direkt
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                  <h3 className="font-bold text-xl mb-3">Snabb Lagerrörelse</h3>
                  <p className="text-sm opacity-90">
                    Perfekt för att sälja ut lager under begränsad tid
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                  <h3 className="font-bold text-xl mb-3">Flexibla Villkor</h3>
                  <p className="text-sm opacity-90">
                    Välj mellan 12, 24 eller 48 timmars erbjudanden
                  </p>
                </div>
              </div>
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100"
                >
                  Bli Partner Idag
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
