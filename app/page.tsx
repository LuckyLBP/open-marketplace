import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, TrendingUp } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="py-20 bg-gradient-to-b from-purple-50 to-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Hitta de bästa tidsbegränsade erbjudandena
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Upptäck exklusiva erbjudanden från ledande företag med begränsad tid. Ju kortare tid, desto bättre pris!
            </p>
            <Link href="/marketplace">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                Utforska erbjudanden
              </Button>
            </Link>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Populära kategorier</h2>
              <Link href="/marketplace" className="text-purple-600 hover:text-purple-800 flex items-center">
                Visa alla <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/marketplace?category=electronics" className="group">
                <div className="bg-purple-50 rounded-lg p-6 text-center transition-all group-hover:shadow-md group-hover:bg-purple-100">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-medium">Elektronik</h3>
                </div>
              </Link>

              <Link href="/marketplace?category=clothing" className="group">
                <div className="bg-pink-50 rounded-lg p-6 text-center transition-all group-hover:shadow-md group-hover:bg-pink-100">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-pink-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-pink-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L7 12l5.714-2.143L15 3z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-medium">Kläder</h3>
                </div>
              </Link>

              <Link href="/marketplace?category=home" className="group">
                <div className="bg-blue-50 rounded-lg p-6 text-center transition-all group-hover:shadow-md group-hover:bg-blue-100">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                  </div>
                  <h3 className="font-medium">Hem & Trädgård</h3>
                </div>
              </Link>

              <Link href="/marketplace?category=beauty" className="group">
                <div className="bg-green-50 rounded-lg p-6 text-center transition-all group-hover:shadow-md group-hover:bg-green-100">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                      />
                    </svg>
                  </div>
                  <h3 className="font-medium">Skönhet & Hälsa</h3>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Trending erbjudanden</h2>
              <Link href="/marketplace" className="text-purple-600 hover:text-purple-800 flex items-center">
                Visa alla <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                    alt="Premium Hörlurar"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">12h</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1 line-clamp-1">Premium Bluetooth Hörlurar</h3>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                    Trådlösa hörlurar med aktiv brusreducering och kristallklart ljud.
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>11:24:36</span>
                    </div>
                    <span className="font-bold">1 299 kr</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                    alt="Smart Fitness Klocka"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">24h</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1 line-clamp-1">Smart Fitness Klocka</h3>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                    Håll koll på din hälsa med denna smarta klocka. Spårar steg, sömn och puls.
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>23:45:12</span>
                    </div>
                    <span className="font-bold">899 kr</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                    alt="Gourmet Chokladask"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">48h</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1 line-clamp-1">Gourmet Chokladask</h3>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                    Handgjorda praliner i lyxig presentförpackning. Innehåller 24 olika smaker.
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>47:12:33</span>
                    </div>
                    <span className="font-bold">249 kr</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                    alt="Organisk Hudvårdsset"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">24h</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1 line-clamp-1">Organisk Hudvårdsset</h3>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                    Komplett hudvårdsrutin med rengöring, toner, serum och fuktkräm.
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>22:08:45</span>
                    </div>
                    <span className="font-bold">899 kr</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Hur det fungerar</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Företag skapar erbjudanden</h3>
                <p className="text-gray-600">Företag lägger upp tidsbegränsade erbjudanden med olika varaktighet.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Kunder hittar erbjudanden</h3>
                <p className="text-gray-600">
                  Bläddra bland aktiva erbjudanden och se realtidsräknare för varje erbjudande.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Säker betalning</h3>
                <p className="text-gray-600">Köp erbjudanden enkelt och säkert med Stripe-betalningar.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 md:p-12 text-white">
              <div className="md:flex items-center justify-between">
                <div className="mb-6 md:mb-0 md:mr-8">
                  <h2 className="text-3xl font-bold mb-4">Är du ett företag?</h2>
                  <p className="text-lg opacity-90 mb-6">
                    Registrera dig idag och börja sälja dina produkter med tidsbegränsade erbjudanden.
                  </p>
                  <Link href="/auth/signup">
                    <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100">
                      Registrera ditt företag
                    </Button>
                  </Link>
                </div>
                <div className="hidden md:block">
                  <TrendingUp className="h-32 w-32 opacity-20" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
