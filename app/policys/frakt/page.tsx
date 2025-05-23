import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export default function FraktPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-gradient-to-b from-purple-50 to-white">
        {/* Header section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Fraktinformation
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Här hittar du information om våra leveranssätt, leveranstider och
              fraktvillkor för beställningar gjorda via Marknadsplatsen.
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
                      href="#leveransalternativ"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      1. Leveransalternativ
                    </a>
                    <a
                      href="#leveranstider"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      2. Leveranstider
                    </a>
                    <a
                      href="#fraktpriser"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      3. Fraktpriser
                    </a>
                    <a
                      href="#utrikes"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      4. Utrikesleveranser
                    </a>
                    <a
                      href="#spara"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      5. Spåra din leverans
                    </a>
                    <a
                      href="#frakt-skadade"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      6. Skadade leveranser
                    </a>
                    <a
                      href="#miljo"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      7. Miljöarbete
                    </a>
                    <a
                      href="#frakt-retur"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      8. Returer
                    </a>
                    <a
                      href="#kontakt"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      9. Kontakt vid fraktfrågor
                    </a>
                  </nav>
                </div>
              </div>

              {/* Main content */}
              <div className="flex-1 bg-white p-6 md:p-8 rounded-lg shadow-md">
                <div className="prose max-w-none">
                  <p className="text-sm text-gray-500 mb-6">
                    Senast uppdaterad: 15 maj 2025
                  </p>

                  <section id="leveransalternativ" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                      1. Leveransalternativ
                    </h2>
                    <p className="mb-4">
                      För att möta dina behov erbjuder Marknadsplatsen flera
                      olika leveransalternativ. Alla leveranser hanteras av våra
                      samarbetspartners för att garantera pålitliga och
                      effektiva leveranser.
                    </p>

                    <h3 className="text-xl font-medium mt-6 mb-3">
                      1.1 Leverans till utlämningsställe
                    </h3>
                    <p className="mb-4">
                      Detta är vårt mest populära leveranssätt. Din beställning
                      levereras till ditt närmaste utlämningsställe (PostNord,
                      DHL eller Instabox) beroende på din valda leveranspartner.
                      Du får ett meddelande via SMS och/eller e-post när paketet
                      finns att hämta.
                    </p>

                    <h3 className="text-xl font-medium mt-6 mb-3">
                      1.2 Hemleverans
                    </h3>
                    <p className="mb-4">
                      Vid hemleverans körs paketet hem till din dörr. Det finns
                      två olika hemleveransalternativ:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                      <li>
                        <strong>Standard hemleverans:</strong> Leverans sker
                        dagtid på vardagar mellan 08:00-17:00. Du kommer att
                        kontaktas för att boka leveransdag.
                      </li>
                      <li>
                        <strong>Kvällsleverans:</strong> Leverans sker på
                        kvällen mellan 17:00-21:00. Detta alternativ är endast
                        tillgängligt i vissa områden.
                      </li>
                    </ul>

                    <h3 className="text-xl font-medium mt-6 mb-3">
                      1.3 Expressleverans
                    </h3>
                    <p>
                      För dig som vill ha din beställning snabbt erbjuder vi
                      expressleverans. Din beställning levereras nästa vardag om
                      du beställer innan kl 12:00. Observera att denna tjänst
                      inte är tillgänglig för alla postnummer och att en högre
                      fraktavgift tillkommer.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="leveranstider" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                      2. Leveranstider
                    </h2>
                    <p className="mb-4">
                      Leveranstiderna varierar beroende på produkttillgänglighet
                      och valt leveranssätt. Observera att säljaren har upp till
                      48 timmar på sig att skicka din beställning efter att du
                      har beställt, vilket kan påverka den totala leveranstiden.
                    </p>

                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white my-6">
                        <thead>
                          <tr>
                            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-medium text-gray-700">
                              Leveranssätt
                            </th>
                            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-medium text-gray-700">
                              Uppskattad leveranstid
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="py-3 px-4 border-b border-gray-200">
                              Utlämningsställe (Standard)
                            </td>
                            <td className="py-3 px-4 border-b border-gray-200">
                              1-3 arbetsdagar
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4 border-b border-gray-200">
                              Hemleverans
                            </td>
                            <td className="py-3 px-4 border-b border-gray-200">
                              1-4 arbetsdagar
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4 border-b border-gray-200">
                              Kvällsleverans
                            </td>
                            <td className="py-3 px-4 border-b border-gray-200">
                              1-4 arbetsdagar
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4 border-b border-gray-200">
                              Expressleverans
                            </td>
                            <td className="py-3 px-4 border-b border-gray-200">
                              Nästa arbetsdag
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4 border-b border-gray-200">
                              Utrikesleverans (inom EU)
                            </td>
                            <td className="py-3 px-4 border-b border-gray-200">
                              3-8 arbetsdagar
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4 border-b border-gray-200">
                              Utrikesleverans (utanför EU)
                            </td>
                            <td className="py-3 px-4 border-b border-gray-200">
                              5-14 arbetsdagar
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <p>
                      Leveranstiderna ovan är uppskattningar och kan påverkas av
                      faktorer utanför vår kontroll, såsom väderförhållanden,
                      tull eller andra logistiska utmaningar. För
                      expressleverans måste din order läggas innan kl 12:00 för
                      att levereras nästa arbetsdag.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="fraktpriser" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">3. Fraktpriser</h2>
                    <p className="mb-4">
                      Fraktkostnaden beräknas baserat på ditt val av
                      leveransmetod, beställningens storlek och vikt, samt
                      leveransadress. Den exakta fraktkostnaden visas alltid i
                      kassan innan du slutför ditt köp.
                    </p>

                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white my-6">
                        <thead>
                          <tr>
                            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-medium text-gray-700">
                              Leveranssätt
                            </th>
                            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-medium text-gray-700">
                              Pris
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="py-3 px-4 border-b border-gray-200">
                              Utlämningsställe (Standard)
                            </td>
                            <td className="py-3 px-4 border-b border-gray-200">
                              49-99 kr
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4 border-b border-gray-200">
                              Hemleverans
                            </td>
                            <td className="py-3 px-4 border-b border-gray-200">
                              99-149 kr
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4 border-b border-gray-200">
                              Kvällsleverans
                            </td>
                            <td className="py-3 px-4 border-b border-gray-200">
                              149-199 kr
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4 border-b border-gray-200">
                              Expressleverans
                            </td>
                            <td className="py-3 px-4 border-b border-gray-200">
                              199-299 kr
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <h3 className="text-xl font-medium mt-6 mb-3">
                      3.1 Fri frakt
                    </h3>
                    <p className="mb-4">
                      Vi erbjuder fri standardfrakt på alla beställningar över
                      499 kr. Detta gäller leverans till utlämningsställe inom
                      Sverige. Övriga leveransmetoder debiteras enligt ordinarie
                      taxa.
                    </p>

                    <h3 className="text-xl font-medium mt-6 mb-3">
                      3.2 Tillägg för skrymmande produkter
                    </h3>
                    <p>
                      För större och tyngre produkter kan ett frakttillägg
                      tillkomma. Detta anges tydligt på produktsidan och i
                      kassan innan du slutför ditt köp.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="utrikes" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                      4. Utrikesleveranser
                    </h2>
                    <p className="mb-4">
                      Marknadsplatsen levererar till de flesta länder i Europa.
                      För leveranser utanför Sverige gäller följande:
                    </p>

                    <h3 className="text-xl font-medium mt-6 mb-3">
                      4.1 Leveranser inom EU
                    </h3>
                    <p className="mb-4">
                      Alla priser inkluderar moms. Inga ytterligare tullavgifter
                      tillkommer för leveranser inom EU. Leveranstiden är
                      vanligtvis 3-8 arbetsdagar beroende på destination.
                    </p>

                    <h3 className="text-xl font-medium mt-6 mb-3">
                      4.2 Leveranser utanför EU
                    </h3>
                    <p className="mb-4">
                      För leveranser till länder utanför EU kan ytterligare
                      tullavgifter och moms tillkomma. Dessa avgifter betalas av
                      mottagaren vid leverans och är inte inkluderade i priset
                      på vår webbplats. Leveranstiden är vanligtvis 5-14
                      arbetsdagar men kan vara längre beroende på tullhantering
                      i mottagarlandet.
                    </p>

                    <h3 className="text-xl font-medium mt-6 mb-3">
                      4.3 Fraktpriser för utrikesleveranser
                    </h3>
                    <p>
                      Fraktkostnaden för internationella leveranser beräknas
                      baserat på destination, vikt och storlek. Den exakta
                      fraktkostnaden visas alltid i kassan innan du slutför ditt
                      köp.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="spara" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                      5. Spåra din leverans
                    </h2>
                    <p className="mb-4">
                      Du kan enkelt spåra din beställning för att se var den
                      befinner sig och när den förväntas levereras. För att
                      spåra din beställning:
                    </p>

                    <ol className="list-decimal pl-5 space-y-2 mb-4">
                      <li>Logga in på ditt konto på Marknadsplatsen</li>
                      <li>Gå till "Mina beställningar"</li>
                      <li>Välj den beställning du vill spåra</li>
                      <li>Klicka på knappen "Spåra leverans"</li>
                    </ol>

                    <p className="mb-4">
                      Du kommer även att få ett spårningsnummer via e-post
                      och/eller SMS när din beställning har skickats. Med detta
                      nummer kan du spåra ditt paket direkt på transportörens
                      webbplats (t.ex. PostNord, DHL, etc.).
                    </p>

                    <p>
                      Observera att det kan ta upp till 24 timmar efter att
                      beställningen har skickats innan spårningsinformationen
                      uppdateras i transportörens system.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="frakt-skadade" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                      6. Skadade leveranser
                    </h2>
                    <p className="mb-4">
                      Om ditt paket är skadat vid leverans, vänligen följ dessa
                      steg:
                    </p>

                    <ol className="list-decimal pl-5 space-y-2 mb-4">
                      <li>
                        Kontrollera paketet noggrant redan vid
                        leveranstillfället
                      </li>
                      <li>
                        Om paketet är skadat, notera detta på leveranskvittot
                      </li>
                      <li>
                        Ta bilder på det skadade paketet innan du öppnar det
                      </li>
                      <li>
                        Kontakta vår kundtjänst inom 48 timmar med ditt
                        ordernummer och bilder på skadan
                      </li>
                    </ol>

                    <p className="mb-4">
                      Om produkten inuti paketet är skadad, även om paketet ser
                      oskadat ut:
                    </p>

                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Ta bilder på den skadade produkten</li>
                      <li>
                        Kontakta vår kundtjänst inom 48 timmar med ditt
                        ordernummer och bilder
                      </li>
                      <li>
                        Behåll all originalförpackning tills ärendet är löst
                      </li>
                    </ol>
                  </section>

                  <Separator className="my-8" />

                  <section id="miljo" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">7. Miljöarbete</h2>
                    <p className="mb-4">
                      På Marknadsplatsen arbetar vi aktivt för att minska
                      miljöpåverkan av våra leveranser genom:
                    </p>

                    <ul className="list-disc pl-5 space-y-2 mb-4">
                      <li>
                        Optimering av paketeringen för att minimera onödigt
                        material
                      </li>
                      <li>
                        Användning av återvinningsbara förpackningsmaterial
                      </li>
                      <li>
                        Samarbete med transportörer som har tydliga miljömål
                      </li>
                      <li>
                        Konsolidering av leveranser när möjligt för att minska
                        antalet transporter
                      </li>
                      <li>
                        Klimatkompensation för vissa leveranser (se vid kassan
                        vilka alternativ som är klimatkompenserade)
                      </li>
                    </ul>

                    <p>
                      Genom att välja leverans till utlämningsställe istället
                      för hemleverans bidrar du också till att minska
                      miljöpåverkan, eftersom det möjliggör effektivare
                      ruttplanering och färre leveransstopp.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="frakt-retur" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">8. Returer</h2>
                    <p className="mb-4">
                      Om du behöver returnera en vara, vänligen se vår separata{' '}
                      <Link
                        href="/policys/retur"
                        className="text-purple-600 hover:underline"
                      >
                        returpolicy
                      </Link>{' '}
                      för fullständig information. Nedan följer en
                      sammanfattning av fraktrelaterad information för returer:
                    </p>

                    <h3 className="text-xl font-medium mt-6 mb-3">
                      8.1 Returfrakt
                    </h3>
                    <p className="mb-4">
                      Vid retur på grund av ångerrätt står kunden för
                      returfraktkostnaden, som vanligtvis är 49-99 kr beroende
                      på produktens storlek och vikt.
                    </p>

                    <h3 className="text-xl font-medium mt-6 mb-3">
                      8.2 Fri returfrakt
                    </h3>
                    <p>
                      Vid retur på grund av defekt vara, felleverans eller
                      transportskada står Marknadsplatsen för
                      returfraktkostnaden. I dessa fall skickar vi en förbetald
                      retursedel till dig via e-post.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="kontakt" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                      9. Kontakt vid fraktfrågor
                    </h2>
                    <p className="mb-4">
                      Om du har frågor om din leverans, kontakta vår kundtjänst:
                    </p>

                    <ul className="list-none space-y-2 mb-4">
                      <li>
                        <strong>E-post:</strong>{' '}
                        <a
                          href="mailto:frakt@Marknadsplatsen.se"
                          className="text-purple-600 hover:underline"
                        >
                          frakt@Marknadsplatsen.se
                        </a>
                      </li>
                      <li>
                        <strong>Telefon:</strong> 010-123 45 67 (vardagar
                        09:00-17:00)
                      </li>
                      <li>
                        <strong>Kontaktformulär:</strong>{' '}
                        <Link
                          href="/kontakt"
                          className="text-purple-600 hover:underline"
                        >
                          www.Marknadsplatsen.se/kontakt
                        </Link>
                      </li>
                    </ul>

                    <p>
                      För snabbare hjälp, vänligen ha ditt ordernummer och
                      eventuellt spårningsnummer tillgängligt när du kontaktar
                      oss.
                    </p>
                  </section>

                  <div className="mt-12 text-sm text-gray-500">
                    <p>
                      Denna fraktpolicy är upphovsrättsskyddad och tillhör
                      Marknadsplatsen AB.
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
