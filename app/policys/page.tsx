import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import Link from 'next/link';
import { FileText, TruckIcon, RefreshCcw, ShieldIcon } from 'lucide-react';

export default function PolicyIndexPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-gradient-to-b from-purple-50 to-white">
        {/* Header section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Policys och villkor
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Här hittar du all information om våra policys och villkor. Vi
              värdesätter öppenhet och vill att du ska känna dig trygg när du
              handlar hos oss.
            </p>
          </div>
        </section>

        {/* Policy links */}
        <section className="py-8 pb-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Användarvillkor */}
              <Link
                href="/policys/anvandarvillkor"
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Användarvillkor</h2>
                <p className="text-gray-600">
                  Villkoren som gäller för användning av vår plattform, köp,
                  rättigheter och skyldigheter.
                </p>
              </Link>

              {/* Frakt */}
              <Link
                href="/policys/frakt"
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                  <TruckIcon className="h-8 w-8 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Frakt</h2>
                <p className="text-gray-600">
                  Information om leveranstider, leveranssätt, fraktpriser och
                  spårning av dina paket.
                </p>
              </Link>

              {/* Returer */}
              <Link
                href="/policys/returer"
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                  <RefreshCcw className="h-8 w-8 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  Returer & Ångerrätt
                </h2>
                <p className="text-gray-600">
                  Hur du returnerar varor, ångerrätt, återbetalning och
                  reklamationer.
                </p>
              </Link>

              {/* Sekretesspolicy */}
              <Link
                href="/policys/sekretesspolicy"
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                  <ShieldIcon className="h-8 w-8 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Sekretesspolicy</h2>
                <p className="text-gray-600">
                  Hur vi samlar in, använder och skyddar dina personuppgifter
                  och din integritet.
                </p>
              </Link>
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-600">
                Har du frågor om våra policys eller villkor?{' '}
                <Link
                  href="/kundtjanst/kontakt"
                  className="text-purple-600 hover:underline"
                >
                  Kontakta oss
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
