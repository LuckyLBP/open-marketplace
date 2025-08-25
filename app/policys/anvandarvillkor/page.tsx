import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export default function UserTermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-gradient-to-b from-purple-50 to-white">
        {/* Header section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Användarvillkor
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Dessa användarvillkor reglerar din användning av ClickFynd.se och
              de tjänster vi erbjuder. Genom att använda vår plattform
              accepterar du dessa villkor.
            </p>
          </div>
        </section>

        {/* Table of contents and content */}
        <section className="py-8 pb-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Table of contents - sticky on desktop */}
              <div className="lg:w-64 shrink-0">
                <div className="sticky top-24 bg-white p-5 rounded-lg shadow-md">
                  <h2 className="font-medium mb-3 text-lg">Innehåll</h2>
                  <nav className="space-y-1 text-sm">
                    <a
                      href="#introduction"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      1. Introduktion
                    </a>
                    <a
                      href="#definitions"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      2. Definitioner
                    </a>
                    <a
                      href="#account"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      3. Konto och registrering
                    </a>
                    <a
                      href="#platform-use"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      4. Användning av plattformen
                    </a>
                    <a
                      href="#purchase"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      5. Köp och betalningar
                    </a>
                    <a
                      href="#limited-time"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      6. Tidsbegränsade erbjudanden
                    </a>
                    <a
                      href="#reviews"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      7. Recensioner och betyg
                    </a>
                    <a
                      href="#company-terms"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      8. Särskilda villkor för företag
                    </a>
                    <a
                      href="#liability"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      9. Ansvarsbegränsningar
                    </a>
                    <a
                      href="#intellectual-property"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      10. Immateriella rättigheter
                    </a>
                    <a
                      href="#termination"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      11. Uppsägning av konto
                    </a>
                    <a
                      href="#changes"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      12. Ändringar i villkoren
                    </a>
                    <a
                      href="#applicable-law"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      13. Tillämplig lag
                    </a>
                    <a
                      href="#contact"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      14. Kontakt
                    </a>
                  </nav>
                </div>
              </div>

              {/* Main content */}
              <div className="flex-1 bg-white p-6 md:p-8 rounded-lg shadow-md">
                <div className="prose max-w-none">
                  <p className="text-sm text-gray-500 mb-6">
                    Senast uppdaterad: 15 Maj 2025
                  </p>

                  <section id="introduction" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">1. Introduktion</h2>
                    <p className="mb-4">
                      Välkommen till ClickFynd.se, en plattform för
                      tidsbegränsade erbjudanden som drivs av ClickFynd.se AB
                      (org.nr. 555555-5555). Genom att använda vår webbplats
                      godkänner du dessa användarvillkor i sin helhet. Om du
                      inte accepterar dessa villkor bör du inte använda vår
                      tjänst.
                    </p>
                    <p>
                      ClickFynd.se är en marknadsplats där företag kan erbjuda
                      tidsbegränsade produkter och tjänster till konsumenter.
                      Vår plattform fungerar som en mellanhand för att
                      underlätta transaktioner mellan köpare och säljare, och vi
                      är inte själva säljare av de produkter som erbjuds på
                      plattformen.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="definitions" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">2. Definitioner</h2>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        <strong>"Plattformen"</strong> avser webbplatsen
                        ClickFynd.se, tillgänglig via www.ClickFynd.se.se och
                        alla tillhörande appar.
                      </li>
                      <li>
                        <strong>"Användare"</strong> avser varje person som
                        besöker eller använder plattformen.
                      </li>
                      <li>
                        <strong>"Kund"</strong> avser en användare som köper
                        eller avser att köpa produkter via plattformen.
                      </li>
                      <li>
                        <strong>"Företag"</strong> avser näringsidkare som
                        säljer produkter eller tjänster via plattformen.
                      </li>
                      <li>
                        <strong>"Tidsbegränsat erbjudande"</strong> avser
                        produkter eller tjänster som finns tillgängliga för köp
                        under en begränsad tidsperiod (12, 24 eller 48 timmar).
                      </li>
                      <li>
                        <strong>"Innehåll"</strong> avser all text, bilder,
                        video och annat material som publiceras på plattformen.
                      </li>
                    </ul>
                  </section>

                  <Separator className="my-8" />

                  <section id="account" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                      3. Konto och registrering
                    </h2>
                    <p className="mb-4">
                      För att kunna göra köp på ClickFynd.se behöver du skapa
                      ett konto. Du ansvarar för att tillhandahålla korrekt och
                      aktuell information vid registrering och för att hålla
                      dina inloggningsuppgifter konfidentiella.
                    </p>
                    <p className="mb-4">
                      Du måste vara minst 18 år gammal för att skapa ett konto
                      och använda våra tjänster. Om du är under 18 år måste du
                      ha föräldrarnas eller vårdnadshavarens tillstånd för att
                      använda plattformen.
                    </p>
                    <p>
                      Du ansvarar för all aktivitet som sker på ditt konto och
                      får inte överlåta ditt konto till någon annan. Du måste
                      omedelbart meddela ClickFynd.se om eventuell obehörig
                      användning av ditt konto eller andra säkerhetsrelaterade
                      problem.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="platform-use" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                      4. Användning av plattformen
                    </h2>
                    <p className="mb-4">
                      Du förbinder dig att använda plattformen i enlighet med
                      dessa villkor och tillämplig lag. Du får inte:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                      <li>
                        Använda plattformen för olagliga eller bedrägliga
                        ändamål
                      </li>
                      <li>
                        Ladda upp skadligt innehåll, virus eller annan skadlig
                        kod
                      </li>
                      <li>
                        Kringgå, inaktivera eller på annat sätt störa
                        plattformens säkerhetsfunktioner
                      </li>
                      <li>
                        Använda automatiserade metoder för att skrapa eller
                        extrahera data från plattformen
                      </li>
                      <li>
                        Störa eller avbryta plattformens funktion eller servrar
                      </li>
                      <li>
                        Skapa flera konton för vilseledande eller olagliga
                        ändamål
                      </li>
                    </ul>
                    <p>
                      ClickFynd.se förbehåller sig rätten att begränsa eller
                      avsluta din åtkomst till plattformen om du bryter mot
                      dessa villkor eller av någon annan anledning, efter eget
                      gottfinnande.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="purchase" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                      5. Köp och betalningar
                    </h2>
                    <p className="mb-4">
                      När du genomför ett köp på ClickFynd.se ingår du ett avtal
                      direkt med det företag som säljer produkten, inte med
                      ClickFynd.se. ClickFynd.se fungerar endast som förmedlare
                      och betalningshanterare.
                    </p>
                    <p className="mb-4">
                      Alla priser som visas på plattformen inkluderar moms och
                      andra tillämpliga skatter enligt svensk lagstiftning.
                      Fraktkostnader kan tillkomma och visas tydligt innan du
                      genomför ditt köp.
                    </p>
                    <p className="mb-4">
                      Vi accepterar betalningar via de metoder som visas under
                      betalningsprocessen, inklusive kreditkort, Swish och
                      faktura via Klarna. Alla betalningsuppgifter krypteras och
                      behandlas säkert av våra betalningspartners.
                    </p>
                    <p>
                      När ett köp har genomförts får du en bekräftelse via
                      e-post. Denna bekräftelse utgör ditt inköpsbevis. Vi
                      rekommenderar att du sparar denna för eventuella framtida
                      behov.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="limited-time" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                      6. Tidsbegränsade erbjudanden
                    </h2>
                    <p className="mb-4">
                      ClickFynd.se specialiserar sig på tidsbegränsade
                      erbjudanden. När tiden för ett erbjudande löper ut är det
                      inte längre tillgängligt för köp, även om produkten inte
                      har sålt slut.
                    </p>
                    <p className="mb-4">
                      Alla tidsstämplar och nedräkningar på plattformen följer
                      svensk tid (CET/CEST). Vi strävar efter att vara så exakta
                      som möjligt gällande nedräkningarna, men mindre avvikelser
                      kan förekomma beroende på faktorer som din
                      internetanslutning eller webbläsarinställningar.
                    </p>
                    <p className="mb-4">
                      ClickFynd.se garanterar inte att ett erbjudande kommer att
                      finnas tillgängligt under hela den annonserade perioden,
                      då produkter kan sälja slut före tidens utgång. Vi kan
                      inte heller garantera att samma erbjudande kommer att
                      upprepas i framtiden.
                    </p>
                    <p>
                      Vi förbehåller oss rätten att förlänga eller avsluta
                      erbjudanden tidigare än planerat på grund av tekniska
                      problem, felaktig prissättning eller andra oförutsedda
                      omständigheter.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="reviews" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                      7. Recensioner och betyg
                    </h2>
                    <p className="mb-4">
                      Som användare kan du ha möjlighet att lämna recensioner
                      och betyg på produkter och företag. Du ansvarar för att
                      allt innehåll du lägger upp är korrekt, ärligt och följer
                      alla lagar och förordningar.
                    </p>
                    <p className="mb-4">
                      Du får inte publicera innehåll som är olagligt, kränkande,
                      hotfullt, ärekränkande, obscent eller på annat sätt
                      olämpligt. ClickFynd.se förbehåller sig rätten att ta bort
                      recensioner som bryter mot dessa riktlinjer utan
                      föregående meddelande.
                    </p>
                    <p>
                      Genom att publicera recensioner eller annat innehåll på
                      plattformen ger du ClickFynd.se en icke-exklusiv,
                      kostnadsfri licens att använda, kopiera, modifiera,
                      distribuera och visa sådant innehåll i samband med våra
                      tjänster.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="company-terms" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                      8. Särskilda villkor för företag
                    </h2>
                    <p className="mb-4">
                      Företag som vill sälja på ClickFynd.se måste genomgå en
                      verifieringsprocess och acceptera våra villkor för
                      säljare. Som företag ansvarar du för att:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                      <li>
                        Tillhandahålla korrekta och fullständiga uppgifter om
                        ditt företag och produkter
                      </li>
                      <li>
                        Endast sälja produkter som du har rätt att sälja och som
                        följer alla lagar och förordningar
                      </li>
                      <li>Leverera produkter inom den angivna leveranstiden</li>
                      <li>
                        Hantera returer och reklamationer i enlighet med svensk
                        konsumentlagstiftning
                      </li>
                      <li>
                        Betala överenskomna avgifter till ClickFynd.se för
                        användning av plattformen
                      </li>
                    </ul>
                    <p>
                      ClickFynd.se tar ut en provision på försäljningen baserat
                      på varaktigheten för det tidsbegränsade erbjudandet. För
                      12-timmars erbjudanden är provisionen 3%, för 24-timmars
                      erbjudanden 4%, och för 48-timmars erbjudanden 5%.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="liability" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                      9. Ansvarsbegränsningar
                    </h2>
                    <p className="mb-4">
                      ClickFynd.se tillhandahåller plattformen "i befintligt
                      skick" och "enligt tillgänglighet" utan några garantier av
                      något slag, vare sig uttryckliga eller underförstådda. Vi
                      garanterar inte att plattformen alltid kommer att vara
                      tillgänglig, felfri eller säker.
                    </p>
                    <p className="mb-4">
                      ClickFynd.se ansvarar inte för kvaliteten, säkerheten
                      eller lämpligheten av produkter som säljs på plattformen.
                      Avtalsförhållandet för köp uppstår mellan köparen och
                      säljaren, och konsumentköplagen reglerar detta
                      förhållande.
                    </p>
                    <p className="mb-4">
                      I den utsträckning som tillåts enligt lag, är ClickFynd.se
                      inte ansvarig för några direkta, indirekta, tillfälliga,
                      särskilda eller följdskador som uppstår från din
                      användning av plattformen eller produkter köpta genom
                      plattformen.
                    </p>
                    <p>
                      Vår totala ansvarsskyldighet, oavsett orsak och oberoende
                      av åtgärdsform, är begränsad till det belopp du betalat
                      via plattformen under de senaste 12 månaderna.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="intellectual-property" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                      10. Immateriella rättigheter
                    </h2>
                    <p className="mb-4">
                      All text, grafik, användargränssnitt, visuella gränssnitt,
                      fotografier, varumärken, logotyper, ljud, musik,
                      illustrationer och datorkod som används på ClickFynd.se är
                      ClickFynd.se:s egendom eller licensieras till oss.
                    </p>
                    <p className="mb-4">
                      Du får inte kopiera, reproducera, modifiera, distribuera
                      eller på annat sätt använda något innehåll från
                      plattformen utan uttryckligt skriftligt tillstånd från
                      ClickFynd.se eller respektive rättighetsinnehavare.
                    </p>
                    <p>
                      Företag som lägger upp innehåll på plattformen behåller
                      sina immateriella rättigheter men ger ClickFynd.se rätt
                      att använda detta innehåll i syfte att driva och
                      marknadsföra plattformen.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="termination" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                      11. Uppsägning av konto
                    </h2>
                    <p className="mb-4">
                      Du kan när som helst avsluta ditt konto genom att kontakta
                      vår kundservice eller använda funktionen för
                      kontoborttagning i dina kontoinställningar.
                    </p>
                    <p className="mb-4">
                      ClickFynd.se förbehåller sig rätten att stänga av eller
                      avsluta ditt konto om du bryter mot dessa användarvillkor,
                      missbrukar plattformen eller av någon annan anledning
                      enligt vårt rimliga gottfinnande.
                    </p>
                    <p>
                      Vid uppsägning av ditt konto kan vi behålla viss
                      information i enlighet med vår integritetspolicy och
                      lagliga skyldigheter, såsom bokföringslagen.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="changes" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                      12. Ändringar i villkoren
                    </h2>
                    <p className="mb-4">
                      ClickFynd.se förbehåller sig rätten att när som helst
                      ändra dessa användarvillkor. Vid väsentliga förändringar
                      kommer vi att meddela dig genom att publicera ett
                      meddelande på plattformen eller skicka ett
                      e-postmeddelande innan ändringarna träder i kraft.
                    </p>
                    <p>
                      Din fortsatta användning av plattformen efter att
                      ändringar har trätt i kraft innebär att du accepterar de
                      nya villkoren. Om du inte godkänner de ändrade villkoren
                      bör du sluta använda plattformen och avsluta ditt konto.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="applicable-law" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                      13. Tillämplig lag
                    </h2>
                    <p className="mb-4">
                      Dessa användarvillkor styrs av och tolkas i enlighet med
                      svensk lag, utan hänsyn till lagvalsregler.
                    </p>
                    <p>
                      Eventuella tvister som uppstår i samband med dessa
                      användarvillkor eller din användning av plattformen ska
                      först försöka lösas genom förhandling. Om detta inte är
                      möjligt ska tvisten avgöras av svensk allmän domstol, med
                      Stockholms tingsrätt som första instans.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="contact" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">14. Kontakt</h2>
                    <p className="mb-4">
                      Om du har frågor eller synpunkter angående dessa
                      användarvillkor, vänligen kontakta oss på:
                    </p>
                    <p className="mb-2">
                      <strong>ClickFynd.se AB</strong>
                    </p>
                    <p className="mb-2">
                      Sveavägen 123
                      <br />
                      113 50 Stockholm
                    </p>
                    <p className="mb-2">
                      E-post:{' '}
                      <a
                        href="mailto:info@ClickFynd.se.se"
                        className="text-purple-600 hover:underline"
                      >
                        info@ClickFynd.se.se
                      </a>
                    </p>
                    <p>Telefon: 010-123 45 67</p>
                  </section>

                  <div className="mt-12 text-sm text-gray-500">
                    <p>
                      Dessa användarvillkor är upphovsrättsskyddade och tillhör
                      ClickFynd.se AB. All användning utan tillstånd är
                      förbjuden.
                    </p>
                  </div>
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
