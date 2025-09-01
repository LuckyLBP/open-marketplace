'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TrendingUp, Building, Users, DollarSign } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';

export function BusinessCTASection() {
  const { t } = useLanguage();

  const benefits = [
    {
      icon: DollarSign,
      title: 'Öka försäljningen',
      description: 'Locka fler kunder med tidsbegränsade erbjudanden',
    },
    {
      icon: Users,
      title: 'Nå nya kunder',
      description: 'Få tillgång till vår växande kundbas',
    },
    {
      icon: Building,
      title: 'Enkel hantering',
      description: 'Skapa och hantera erbjudanden på minuter',
    },
  ];

  return (
    <section className="py-12 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600" />

      {/* Pattern overlay */}
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />

      {/* Floating elements */}
      <div className="absolute top-20 right-20 text-white/20">
        <TrendingUp className="h-32 w-32" />
      </div>
      <div className="absolute bottom-20 left-20 text-white/20">
        <Building className="h-24 w-24" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-white">
              <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Building className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">För företag</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Är du ett företag?
              </h2>

              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Registrera dig idag och börja sälja dina produkter med
                tidsbegränsade erbjudanden. Nå tusentals potentiella kunder och
                öka din försäljning.
              </p>

              {/* Benefits */}
              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={index} className="flex items-start">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 mr-4 mt-1">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{benefit.title}</h3>
                        <p className="text-white/80 text-sm">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    className="bg-white text-purple-700 hover:bg-gray-100 px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Registrera ditt företag
                  </Button>
                </Link>

                <Link href="/om-oss">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/30 bg-transparent text-white hover:bg-white/10 backdrop-blur-sm px-8 py-6 text-lg rounded-full"
                  >
                    Läs mer
                  </Button>
                </Link>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center text-white border border-white/20">
                <div className="text-3xl font-bold mb-2">500+</div>
                <div className="text-sm text-white/80">
                  Registrerade företag
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center text-white border border-white/20">
                <div className="text-3xl font-bold mb-2">10k+</div>
                <div className="text-sm text-white/80">Sålda produkter</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center text-white border border-white/20">
                <div className="text-3xl font-bold mb-2">85%</div>
                <div className="text-sm text-white/80">
                  Genomsnittlig rabatt
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center text-white border border-white/20">
                <div className="text-3xl font-bold mb-2">24h</div>
                <div className="text-sm text-white/80">Genomsnittlig tid</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
