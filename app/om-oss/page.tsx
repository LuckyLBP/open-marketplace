import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Clock,
  ShieldCheck,
  Users,
  Lightbulb,
  Gift,
  ChevronDown,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-purple-50 to-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Om ClickFynd.se
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Vi gör det enkelt att hitta fantastiska erbjudanden med begränsad
              tid från de bästa företagen i Sverige.
            </p>
          </div>
        </section>

        {/* Our Mission */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-center">
                Vårt uppdrag
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                ClickFynd.se grundades 2025 med en enkel vision: att skapa en
                plattform där företag kan möta kunder genom spännande
                tidsbegränsade erbjudanden.
              </p>
              <p className="text-gray-600 mb-6 text-lg">
                I ett digitalt landskap där överflöd av information ofta gör det
                svårt för konsumenter att hitta genuint bra erbjudanden, skapar
                vi en marknadsplats där tiden är den ultimata faktorn för värde.
              </p>
              <p className="text-gray-600 mb-6 text-lg">
                Ju kortare tid ett erbjudande är tillgängligt, desto bättre pris
                kan företagen erbjuda. Detta ger våra kunder möjlighet att göra
                fantastiska fynd, samtidigt som företag får en ny effektiv
                marknadsföringskanal.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits/Features */}
        <section className="py-16 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">
              Varför välja oss
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Tidsbegränsade erbjudanden
                </h3>
                <p className="text-gray-600">
                  Alla våra erbjudanden är tillgängliga under en begränsad tid,
                  vilket garanterar exklusivitet och bättre priser.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Säkra betalningar
                </h3>
                <p className="text-gray-600">
                  Alla transaktioner på vår plattform är säkra, krypterade och
                  skyddade genom vår samarbetspartner Stripe.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Kvalitetsprodukter
                </h3>
                <p className="text-gray-600">
                  Vi samarbetar endast med pålitliga företag och varumärken för
                  att säkerställa hög kvalitet på alla erbjudanden.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-16 bg-gradient-to-b from-purple-50 to-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">
              Våra värderingar
            </h2>
            <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">Transparens</h3>
                  <p className="text-gray-600">
                    Vi tror på fullständig öppenhet i alla delar av vår
                    verksamhet. Från prissättning till hur våra erbjudanden
                    fungerar - vi vill att du ska förstå exakt hur ClickFynd.se
                    fungerar.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Lightbulb className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">Innovation</h3>
                  <p className="text-gray-600">
                    Vi utmanar ständigt oss själva att förbättra vår plattform
                    och skapa nya sätt för företag att nå ut med sina
                    erbjudanden.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    Kvalitetssäkring
                  </h3>
                  <p className="text-gray-600">
                    Vi granskar alla företag som ansluter sig till vår plattform
                    för att säkerställa att endast pålitliga aktörer kan erbjuda
                    sina produkter här.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">Tidsvärde</h3>
                  <p className="text-gray-600">
                    Vi tror att tid är den mest värdefulla valutan, både för
                    företag och kunder. Därför fokuserar vår plattform på
                    tidsbegränsade erbjudanden.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">
              Vanliga frågor
            </h2>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-lg font-medium">
                    Hur fungerar tidsbegränsade erbjudanden?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Företag publicerar erbjudanden på vår plattform med en
                    specifik tidsbegränsning (12, 24 eller 48 timmar). När tiden
                    går ut, försvinner erbjudandet från ClickFynd.se. Kortare
                    tidsperioder har ofta bättre priser, eftersom företag kan
                    erbjuda större rabatter när de säljer en begränsad mängd
                    produkter snabbt.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-lg font-medium">
                    Hur vet jag att företagen är pålitliga?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Vi gör en grundlig granskning av alla företag som ansluter
                    sig till ClickFynd.se. Vi kontrollerar deras
                    företagsinformation, kundrecensioner och produktkvalitet
                    innan de får börja sälja på vår plattform. Dessutom kan du
                    se kundbetyg för varje företag direkt på deras produktsidor.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-lg font-medium">
                    Hur är betalningar och leveranser säkrade?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Vi använder Stripe, en av världens ledande
                    betalningsprocessorer, för alla transaktioner. Dina
                    kortuppgifter delas aldrig med oss eller säljarna. För
                    leveranser samarbetar vi med etablerade leveranspartners och
                    spårning finns tillgänglig för alla beställningar.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-lg font-medium">
                    Vad är er returpolicy?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Vi följer svensk konsumentlagstiftning som ger dig 14 dagars
                    ångerrätt för de flesta produkter. Specifika returvillkor
                    kan variera mellan säljare och står tydligt angivna på
                    produktsidorna. Kontakta vår kundtjänst om du har frågor
                    kring en specifik retur.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-lg font-medium">
                    Hur kan mitt företag sälja på ClickFynd.se?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Om du vill sälja på vår plattform, börja med att registrera
                    ett företagskonto på webbplatsen. Du kommer att guidas genom
                    processen för att verifiera ditt företag och lägga upp dina
                    första produkter. Vi tar en liten avgift på varje
                    försäljning, som varierar beroende på längden på dina
                    tidsbegränsade erbjudanden.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 md:p-12 text-white">
              <div className="md:flex items-center justify-between">
                <div className="mb-6 md:mb-0 md:mr-8">
                  <h2 className="text-3xl font-bold mb-4">
                    Redo att hitta dagens bästa erbjudanden?
                  </h2>
                  <p className="text-lg opacity-90 mb-6">
                    Utforska vår marknadsplats nu för att hitta exklusiva
                    tidsbegränsade erbjudanden.
                  </p>
                  <Link href="/marketplace">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="bg-white text-purple-600 hover:bg-gray-100"
                    >
                      Utforska erbjudanden
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
