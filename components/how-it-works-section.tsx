'use client';

import { Clock, Search, CreditCard, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';

export function HowItWorksSection() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: Search,
      title: 'Företag skapar erbjudanden',
      description:
        'Företag lägger upp tidsbegränsade erbjudanden med olika varaktighet och rabatter.',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Clock,
      title: 'Kunder hittar erbjudanden',
      description:
        'Bläddra bland aktiva erbjudanden och se realtidsräknare för varje erbjudande.',
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: CreditCard,
      title: 'Säker betalning',
      description:
        'Köp erbjudanden enkelt och säkert med våra säkra betalningslösningar.',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <section className="py-12 bg-gradient-to-br from-purple-50 via-white to-pink-50 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-white rounded-full px-4 py-2 shadow-md border mb-6">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              Så enkelt fungerar det
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Hur det fungerar
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Följ dessa enkla steg för att hitta och köpa de bästa tidsbegränsade
            erbjudandena
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative group">
                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-gray-200 to-gray-300 transform translate-x-4 z-0" />
                )}

                <div className="relative bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2">
                  {/* Step number */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                  </div>

                  <div
                    className={`w-20 h-20 ${step.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`h-10 w-10 ${step.iconColor}`} />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>

                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to action */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Redo att börja?
            </h3>
            <p className="text-gray-600 mb-6">
              Gå med idag och upptäck tusentals exklusiva tidsbegränsade
              erbjudanden
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/marketplace"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Börja shoppa nu
              </a>
              <a
                href="/auth/signup"
                className="border-2 border-purple-200 text-purple-700 hover:bg-purple-50 px-8 py-3 rounded-full font-medium transition-all duration-300"
              >
                Registrera företag
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
