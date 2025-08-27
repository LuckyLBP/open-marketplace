import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import Link from 'next/link';
import { HelpCircle, MessageSquare, PhoneCall } from 'lucide-react';

export default function KundtjanstPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-gradient-to-b from-purple-50 to-white">
        {/* Header section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Kundtjänst
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Här hittar du hjälp och information om hur du kan kontakta oss. Vi
              finns här för att hjälpa dig med alla dina frågor och funderingar.
            </p>
          </div>
        </section>

        {/* Customer Service Links */}
        <section className="py-8 pb-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* FAQ */}
              <Link
                href="/faq"
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 flex flex-col items-center text-center h-full"
              >
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                  <HelpCircle className="h-8 w-8 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Vanliga frågor</h2>
                <p className="text-gray-600">
                  Hitta svar på de vanligaste frågorna om våra produkter,
                  leveranser, returer och betalningar.
                </p>
              </Link>

              {/* Contact */}
              <Link
                href="/kontakt"
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 flex flex-col items-center text-center h-full"
              >
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Kontakta oss</h2>
                <p className="text-gray-600">
                  Behöver du personlig hjälp? Kontakta vårt kundtjänstteam via
                  e-post, telefon eller kontaktformuläret.
                </p>
              </Link>

              {/* Direct Call */}
              <Link
                href="tel:+46101234567"
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 flex flex-col items-center text-center h-full"
              >
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                  <PhoneCall className="h-8 w-8 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Ring direkt</h2>
                <p className="text-gray-600">
                  Prata med vårt kundtjänstteam direkt på telefon 010-123 45 67.
                  Öppet vardagar 09:00-17:00.
                </p>
              </Link>
            </div>

            <div className="mt-12 bg-white rounded-lg shadow-md p-8 max-w-3xl mx-auto">
              <h2 className="text-xl font-semibold mb-4 text-center">
                Kundservice hos ClickFynd.se
              </h2>
              <p className="text-gray-600 mb-4">
                På ClickFynd.se strävar vi efter att erbjuda bästa möjliga
                kundupplevelse. Vår kundtjänst finns tillgänglig för att hjälpa
                dig med:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600 mb-6">
                <li>Frågor om beställningar och leveranser</li>
                <li>Produktinformation och teknisk support</li>
                <li>Returärenden och återbetalningar</li>
                <li>Konto- och betalningsfrågor</li>
                <li>Övriga frågor om våra tjänster</li>
              </ul>
              <p className="text-gray-600">
                Vi jobbar ständigt på att förbättra vår kundservice. Om du har
                förslag på hur vi kan bli bättre, hör gärna av dig till oss.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
