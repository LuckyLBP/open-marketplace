import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export default function ReturnerPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-gradient-to-b from-purple-50 to-white">
        {/* Header section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Returer & Ångerrätt
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Här hittar du information om hur du returnerar varor och vilka
              villkor som gäller för ångerrätt hos ClickFynd.se.
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
                      href="#angerratt"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      1. Ångerrätt
                    </a>
                    <a
                      href="#returprocess"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      2. Returprocess
                    </a>
                    <a
                      href="#fraktavgifter"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      3. Fraktavgifter vid retur
                    </a>
                    <a
                      href="#aterbetalningar"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      4. Återbetalningar
                    </a>
                    <a
                      href="#undantag"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      5. Undantag från ångerrätten
                    </a>
                    <a
                      href="#defekt"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      6. Defekta varor
                    </a>
                    <a
                      href="#reklamation"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      7. Reklamation
                    </a>
                    <a
                      href="#returgodkannande"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      8. Godkännande av returer
                    </a>
                    <a
                      href="#fragor"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      9. Vanliga frågor
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

                  <div className="bg-purple-50 rounded-lg p-6 mb-8">
                    <h2 className="text-lg font-medium text-purple-800 mb-2">
                      Behöver du göra en retur?
                    </h2>
                    <p className="mb-4">
                      Följ vår steg-för-steg guide nedan eller kontakta vår
                      kundtjänst för personlig hjälp med din retur.
                    </p>
                    <Link href="/kundtjanst/kontakt">
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                        Kontakta oss för returhjälp
                      </Button>
                    </Link>
                  </div>

                  <section id="angerratt" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">1. Ångerrätt</h2>
                    <p className="mb-4">
                      I enlighet med svensk konsumentlagstiftning har du som
                      kund rätt att ångra ditt köp inom 14 dagar från den dag du
                      tog emot varan, utan att behöva ange någon orsak. Detta
                      kallas ångerrätt och regleras i Lag (2005:59) om
                      distansavtal och avtal utanför affärslokaler.
                    </p>
                    <p className="mb-4">
                      Ångerfristen löper ut 14 dagar efter den dag då du, eller
                      någon tredje part som du har anlitat, tar emot varan. Om
                      du beställt flera varor i samma order men de levereras vid
                      olika tillfällen, löper ångerfristen ut 14 dagar efter den
                      dag då du tar emot den sista varan.
                    </p>
                    <p>
                      För att utöva ångerrätten måste du meddela oss
                      (ClickFynd.se AB) ditt beslut att frånträda avtalet genom
                      en tydlig förklaring, exempelvis via telefon, e-post eller
                      via returformulär. Du kan använda standardblanketten för
                      utövande av ångerrätt, men det är inte ett krav.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="returprocess" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">2. Returprocess</h2>
                    <p className="mb-4">
                      För att returnera en produkt, följ dessa steg:
                    </p>
                    <ol className="list-decimal pl-5 space-y-4">
                      <li>
                        <strong>
                          Meddela oss om din önskan att returnera:
                        </strong>
                        <ul className="list-disc pl-5 mt-2">
                          <li>
                            Logga in på ditt konto på ClickFynd.se och gå till
                            "Mina beställningar"
                          </li>
                          <li>
                            Hitta den aktuella beställningen och klicka på
                            "Returnera"
                          </li>
                          <li>
                            Följ instruktionerna och välj de produkter du vill
                            returnera
                          </li>
                          <li>
                            Alternativt kan du{' '}
                            <Link
                              href="/kundtjanst/kontakt"
                              className="text-purple-600 hover:underline"
                            >
                              kontakta vår kundtjänst
                            </Link>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <strong>Skriv ut retursedel:</strong> När du har
                        registrerat din retur i systemet, får du en retursedel
                        via e-post som du ska skriva ut och fästa på ditt
                        returpaket.
                      </li>
                      <li>
                        <strong>Förbered varan för retur:</strong> Packa
                        produkten i originalförpackningen om möjligt. Se till
                        att produkten är i samma skick som när du mottog den -
                        oanvänd och med alla etiketter och förpackningar
                        intakta.
                      </li>
                      <li>
                        <strong>Skicka returen:</strong> Lämna in paketet med
                        den utskrivna retursedeln på närmaste utlämningsställe
                        för PostNord eller enligt instruktionerna på
                        retursedeln.
                      </li>
                      <li>
                        <strong>Spara kvitto:</strong> Spara kvittot från
                        inlämningen som bevis på att du har skickat returen.
                      </li>
                    </ol>
                    <p className="mt-4">
                      När vi har mottagit och godkänt din retur, kommer vi att
                      meddela dig och behandla din återbetalning enligt
                      beskrivningen nedan.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="fraktavgifter" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                      3. Fraktavgifter vid retur
                    </h2>
                    <p className="mb-4">
                      Vid utövande av ångerrätt står du som kund för
                      returfraktkostnaden, om inget annat angivits i
                      produktbeskrivningen. Returfraktkostnaden varierar
                      beroende på produktens storlek och vikt, men ligger
                      vanligtvis mellan 49-99 kr.
                    </p>
                    <p className="mb-4">
                      I följande fall står ClickFynd.se för returfraktkostnaden:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Om varan är defekt eller skadad vid leverans</li>
                      <li>Om vi har levererat fel vara eller fel antal</li>
                      <li>
                        Om varan på något annat sätt avviker från beskrivningen
                      </li>
                    </ul>
                    <p className="mb-4">
                      I dessa fall kommer vi att skicka en förbetald retursedel
                      till dig när du registrerar din retur. Kontakta vår
                      kundtjänst via{' '}
                      <Link
                        href="/kundtjanst/kontakt"
                        className="text-purple-600 hover:underline"
                      >
                        kontaktformuläret
                      </Link>{' '}
                      eller telefon för att få hjälp med gratis returfrakt.
                    </p>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Observera:</strong> För att kvalificeras för
                        gratis returfrakt vid defekt vara måste du rapportera
                        problemet inom 3 dagar efter mottagandet och kunna
                        styrka att varan var felaktig vid leveranstillfället.
                      </p>
                    </div>
                  </section>

                  <Separator className="my-8" />

                  <section id="aterbetalningar" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                      4. Återbetalningar
                    </h2>
                    <p className="mb-4">
                      När vi har mottagit din retur och kontrollerat att varan
                      är i samma skick som när den levererades till dig, kommer
                      vi att behandla din återbetalning utan onödigt dröjsmål,
                      och senast inom 14 dagar från den dag då vi tog emot
                      meddelandet om din åtgärd att frånträda avtalet.
                    </p>
                    <p className="mb-4">
                      Återbetalningen sker till samma betalningsmetod som du
                      använde vid köpet:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                      <li>
                        <strong>Kreditkort/betalkort:</strong> Återbetalning
                        direkt till ditt kort. Detta kan ta 3-5 bankdagar
                        beroende på din bank.
                      </li>
                      <li>
                        <strong>Swish:</strong> Återbetalning till samma
                        telefonnummer som du betalade från, vanligtvis samma
                        dag.
                      </li>
                      <li>
                        <strong>Faktura via Klarna:</strong> Fakturan makuleras
                        eller minskas med returbeloppet, beroende på om du
                        returnerar hela eller delar av beställningen.
                      </li>
                      <li>
                        <strong>Delbetalning via Klarna:</strong>{' '}
                        Återbetalningen görs till ditt Klarna-konto, vilket
                        minskar skulden eller ger dig ett tillgodohavande.
                      </li>
                    </ul>
                    <p className="mb-4">
                      Vi återbetalar alla betalningar som vi har tagit emot från
                      dig, inklusive leveranskostnader (förutom extra
                      leveranskostnader till följd av att du valt något annat
                      leveranssätt än den billigaste standardleverans som vi
                      erbjuder). Returfraktkostnaden dras av från
                      återbetalningsbeloppet om du står för denna enligt punkt 3
                      ovan.
                    </p>
                    <p>
                      Vid delretur räknas beloppet ut proportionerligt baserat
                      på värdet av de returnerade varorna i förhållande till det
                      totala ordervärdet.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="undantag" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                      5. Undantag från ångerrätten
                    </h2>
                    <p className="mb-4">
                      Enligt konsumentköplagen finns vissa undantag från
                      ångerrätten. Du har inte ångerrätt för följande typer av
                      produkter:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        Varor som har förseglats av hälso- eller hygienskäl och
                        där förseglingen har brutits efter leverans (t.ex.
                        underkläder, öronproppar, kosmetika)
                      </li>
                      <li>
                        Varor som snabbt kan försämras eller bli för gamla
                        (t.ex. färskvaror)
                      </li>
                      <li>
                        Förseglad ljud- eller bildupptagning eller datorprogram
                        där förseglingen har brutits
                      </li>
                      <li>
                        Tjänster som har börjat utföras med ditt samtycke under
                        ångerfristen
                      </li>
                      <li>
                        Produkter som tillverkats enligt dina anvisningar eller
                        som tydligt är personliga
                      </li>
                      <li>
                        Digitalt innehåll som levereras på annat sätt än på ett
                        fysiskt medium, om leveransen har påbörjats med ditt
                        samtycke
                      </li>
                    </ul>
                    <p className="mt-4">
                      För varje produkt anges tydligt i produktbeskrivningen om
                      särskilda returvillkor gäller eller om produkten omfattas
                      av något av ovanstående undantag.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="defekt" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                      6. Defekta varor
                    </h2>
                    <p className="mb-4">
                      Om du upptäcker att en vara är defekt eller skadad vid
                      leverans, ska du kontakta oss så snart som möjligt, men
                      senast inom 3 dagar efter att du mottagit varan. För att
                      registrera ett ärende gällande defekta varor, följ dessa
                      steg:
                    </p>
                    <ol className="list-decimal pl-5 space-y-2 mb-4">
                      <li>Ta bilder som visar defekten</li>
                      <li>
                        Gå till{' '}
                        <Link
                          href="/kundtjanst/kontakt"
                          className="text-purple-600 hover:underline"
                        >
                          vår kontaktsida
                        </Link>{' '}
                        och fyll i formuläret
                      </li>
                      <li>
                        Välj ämnet "Defekt vara" och ange ditt ordernummer
                      </li>
                      <li>Beskriv problemet detaljerat och bifoga bilderna</li>
                    </ol>
                    <p className="mb-4">
                      Efter att vi har mottagit din reklamation kommer vi att
                      utreda ärendet och kontakta dig med information om nästa
                      steg. Beroende på situationen kan vi erbjuda:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Reparation av produkten</li>
                      <li>Utbyte till en ny produkt</li>
                      <li>Prisavdrag</li>
                      <li>Full återbetalning</li>
                    </ul>
                    <p className="mt-4">
                      För defekta varor skickar vi alltid en förbetald
                      retursedel, så att du inte behöver stå för returfrakten.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="reklamation" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">7. Reklamation</h2>
                    <p className="mb-4">
                      Enligt konsumentköplagen har du rätt att reklamera en vara
                      i upp till tre år från köptillfället om den är felaktig
                      (har ursprungliga fel). För att reklamera en vara,
                      kontakta vår kundtjänst så snart som möjligt efter att du
                      upptäckt felet.
                    </p>
                    <p className="mb-4">
                      Vid reklamation gör vi en bedömning av felet för att
                      avgöra om det är ett så kallat ursprungligt fel (fel som
                      fanns vid köptillfället) eller om det har uppstått som en
                      följd av normalt slitage, olyckshändelse eller felaktig
                      användning.
                    </p>
                    <p className="mb-4">
                      Du kan reklamera din vara på följande sätt:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Via telefon: 010-123 45 67 (vardagar 09:00-17:00)</li>
                      <li>
                        Via e-post:{' '}
                        <a
                          href="mailto:reklamation@ClickFynd.se.se"
                          className="text-purple-600 hover:underline"
                        >
                          reklamation@ClickFynd.se.se
                        </a>
                      </li>
                      <li>
                        Via{' '}
                        <Link
                          href="/kundtjanst/kontakt"
                          className="text-purple-600 hover:underline"
                        >
                          kontaktformuläret
                        </Link>{' '}
                        på vår webbplats
                      </li>
                    </ul>
                    <p className="mt-4">
                      När du reklamerar en vara behöver du beskriva felet så
                      detaljerat som möjligt och gärna bifoga bilder. Ange
                      alltid ditt ordernummer och kontaktuppgifter så att vi
                      enkelt kan hjälpa dig.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="returgodkannande" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                      8. Godkännande av returer
                    </h2>
                    <p className="mb-4">
                      När vi tar emot din retur inspekterar vi varan för att
                      säkerställa att den är i samma skick som när den
                      levererades till dig. För att en retur ska godkännas måste
                      följande kriterier uppfyllas:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        Varan måste vara oanvänd (förutom den inspektion som
                        behövs för att avgöra varans egenskaper)
                      </li>
                      <li>
                        Alla etiketter och originalförpackningar måste vara
                        intakta
                      </li>
                      <li>
                        Alla medföljande tillbehör, bruksanvisningar och
                        dokumentation måste returneras
                      </li>
                      <li>
                        Varan får inte visa tecken på onormalt slitage eller
                        skador
                      </li>
                    </ul>
                    <p className="mb-4 mt-4">
                      Om varan har använts utöver vad som är nödvändigt för att
                      inspektera den, eller om den har skadats på grund av din
                      hantering, kan vi göra ett värdeminskningsavdrag från
                      återbetalningen. Avdraget motsvarar då värdeminskningen
                      jämfört med varans ursprungliga värde.
                    </p>
                    <p>
                      I vissa fall kan vi neka att ta emot en retur, exempelvis
                      om varan är betydligt skadad, om alla delar inte är
                      returnerade, eller om varan omfattas av undantagen från
                      ångerrätten enligt punkt 5 ovan.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="fragor" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                      9. Vanliga frågor om returer
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">
                          Kan jag returnera en vara som jag har använt?
                        </h3>
                        <p className="text-gray-600">
                          Du har rätt att undersöka varan på samma sätt som du
                          skulle göra i en fysisk butik, men om du har använt
                          den utöver detta kan vi göra ett värdeminskningsavdrag
                          från återbetalningen. För hygienartiklar och
                          underkläder accepteras endast retur om förseglingen
                          inte är bruten.
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium mb-2">
                          Vad händer om min retur kommer fram efter 14 dagar?
                        </h3>
                        <p className="text-gray-600">
                          Det viktiga är att du har meddelat oss om ditt beslut
                          att returnera varan inom 14 dagar från mottagandet.
                          Själva retursändningen ska skickas inom rimlig tid
                          efter detta meddelande, vanligtvis inom ytterligare 14
                          dagar. Så länge du kan visa att du har skickat varan
                          inom denna tid (behåll kvittot från inlämningen),
                          accepterar vi returen även om leveransen tar längre
                          tid.
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium mb-2">
                          Kan jag byta en produkt mot en annan storlek eller
                          färg?
                        </h3>
                        <p className="text-gray-600">
                          Vi erbjuder tyvärr inte direktbyte av produkter. Om du
                          önskar en annan storlek eller färg behöver du
                          returnera den ursprungliga produkten och göra en ny
                          beställning. Observera att priserna kan förändras om
                          du returnerar en tidsbegränsad erbjudande som inte
                          längre är aktivt.
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium mb-2">
                          Hur lång tid tar det innan jag får mina pengar
                          tillbaka?
                        </h3>
                        <p className="text-gray-600">
                          Vi behandlar din återbetalning så snart vi har
                          kontrollerat den returnerade varan, normalt inom 1-3
                          arbetsdagar efter att vi mottagit returen. Därefter
                          tar det oftast 3-5 bankdagar innan pengarna syns på
                          ditt konto, beroende på din bank eller
                          betalningsmetod.
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium mb-2">
                          Hur returnerar jag en present?
                        </h3>
                        <p className="text-gray-600">
                          Om du har fått en produkt som present och vill
                          returnera den, kontakta vår kundtjänst via{' '}
                          <Link
                            href="/kundtjanst/kontakt"
                            className="text-purple-600 hover:underline"
                          >
                            kontaktsidan
                          </Link>
                          . Vi kan erbjuda ett presentkort som motsvarar varans
                          värde istället för återbetalning till den ursprungliga
                          betalaren.
                        </p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <p>
                        Hittar du inte svaret på din fråga? Kontakta oss gärna
                        via vår{' '}
                        <Link
                          href="/kundtjanst/kontakt"
                          className="text-purple-600 hover:underline"
                        >
                          kontaktsida
                        </Link>
                        , telefon eller e-post för personlig hjälp med just din
                        retur.
                      </p>
                    </div>
                  </section>

                  <div className="bg-purple-50 rounded-lg p-6 mt-10">
                    <h2 className="text-lg font-medium text-purple-800 mb-2">
                      Behöver du ytterligare hjälp?
                    </h2>
                    <p className="mb-4">
                      Om du har frågor om returer eller behöver hjälp med att
                      registrera en retur, tveka inte att kontakta vår
                      kundservice. Vi finns här för att hjälpa dig.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link href="/kundtjanst/kontakt">
                        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                          Kontakta kundservice
                        </Button>
                      </Link>
                      <Link href="/kundtjanst/faq">
                        <Button variant="outline">
                          Se alla vanliga frågor
                        </Button>
                      </Link>
                    </div>
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
