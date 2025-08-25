import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export default function SekretesspolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-gradient-to-b from-purple-50 to-white">
        {/* Header section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Sekretesspolicy
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Din integritet är viktig för oss. Här beskriver vi hur
              ClickFynd.se samlar in, använder och skyddar dina personuppgifter.
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
                      href="#data-collection"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      2. Insamling av information
                    </a>
                    <a
                      href="#data-use"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      3. Användning av information
                    </a>
                    <a
                      href="#cookies"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      4. Cookies
                    </a>
                    <a
                      href="#data-sharing"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      5. Delning av uppgifter
                    </a>
                    <a
                      href="#data-security"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      6. Datasäkerhet
                    </a>
                    <a
                      href="#data-retention"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      7. Lagringstid
                    </a>
                    <a
                      href="#data-subject-rights"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      8. Dina rättigheter
                    </a>
                    <a
                      href="#children-privacy"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      9. Barns integritet
                    </a>
                    <a
                      href="#international-transfers"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      10. Internationella överföringar
                    </a>
                    <a
                      href="#policy-changes"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      11. Ändringar i policyn
                    </a>
                    <a
                      href="#contact-info"
                      className="block text-gray-600 hover:text-purple-600 py-1"
                    >
                      12. Kontaktinformation
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

                  <section id="introduction" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">1. Introduktion</h2>
                    <p className="mb-4">
                      Denna sekretesspolicy beskriver hur ClickFynd.se AB
                      (org.nr. 555555-5555) ("vi", "oss" eller "ClickFynd.se")
                      samlar in, använder, delar och skyddar personuppgifter när
                      du använder vår webbplats på www.ClickFynd.se.se, våra
                      mobilapplikationer eller andra tjänster (gemensamt kallade
                      "Tjänsterna").
                    </p>
                    <p>
                      Genom att använda våra Tjänster godkänner du insamling och
                      användning av information i enlighet med denna
                      sekretesspolicy. Vi behandlar alla personuppgifter i
                      enlighet med dataskyddsförordningen (GDPR) och annan
                      tillämplig dataskyddslagstiftning.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="data-collection" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                      2. Insamling av information
                    </h2>
                    <p className="mb-4">
                      Vi samlar in följande typer av information när du använder
                      våra Tjänster:
                    </p>

                    <h3 className="text-xl font-medium mt-6 mb-3">
                      2.1 Information du ger oss
                    </h3>
                    <p className="mb-4">
                      När du skapar ett konto, gör ett köp eller kontaktar vår
                      kundtjänst, kan du lämna vissa uppgifter till oss,
                      inklusive men inte begränsat till:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                      <li>
                        Kontaktuppgifter (namn, e-postadress, telefonnummer,
                        postadress)
                      </li>
                      <li>Kontouppgifter (användarnamn, lösenord)</li>
                      <li>
                        Betalningsinformation (kreditkortsinformation,
                        faktureringsadress)
                      </li>
                      <li>Demografisk information (födelsedata, kön)</li>
                      <li>
                        Kommunikation med oss (kundtjänstfrågor, recensioner,
                        kommentarer)
                      </li>
                      <li>
                        Information om företag (för säljare:
                        organisationsnummer, företagsnamn, företagsadress,
                        kontaktpersoner)
                      </li>
                    </ul>

                    <h3 className="text-xl font-medium mt-6 mb-3">
                      2.2 Information vi samlar in automatiskt
                    </h3>
                    <p className="mb-4">
                      När du använder våra Tjänster, samlar vi in viss teknisk
                      information automatiskt, inklusive:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                      <li>IP-adress och enhetsidentifierare</li>
                      <li>Webbläsare och operativsystem</li>
                      <li>Besökta sidor och hur du interagerar med dem</li>
                      <li>Tidpunkt och varaktighet för dina besök</li>
                      <li>Hänvisande webbplatser eller källor</li>
                      <li>Geografisk plats (på landsnivå eller region)</li>
                    </ul>

                    <h3 className="text-xl font-medium mt-6 mb-3">
                      2.3 Information från tredje part
                    </h3>
                    <p>
                      I vissa fall kan vi ta emot information om dig från tredje
                      part, såsom:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        Sociala medier när du väljer att skapa ett konto eller
                        logga in via dessa plattformar
                      </li>
                      <li>
                        Betalningsprocessorer och kreditupplysningsföretag för
                        att verifiera din identitet och betalningsförmåga
                      </li>
                      <li>
                        Marknadsföringspartners som hjälper oss att förstå våra
                        kunders intressen
                      </li>
                      <li>
                        Offentliga källor som företagsregister och folkbokföring
                      </li>
                    </ul>
                  </section>

                  <Separator className="my-8" />

                  <section id="data-use" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                      3. Användning av information
                    </h2>
                    <p className="mb-4">
                      Vi använder den information vi samlar in för följande
                      ändamål:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        <strong>Tillhandahålla våra Tjänster:</strong> Vi
                        använder din information för att hantera ditt konto,
                        behandla transaktioner, leverera produkter, och ge dig
                        kundtjänst.
                      </li>
                      <li>
                        <strong>Förbättra och anpassa:</strong> Vi använder data
                        för att förbättra våra Tjänster, utveckla nya
                        funktioner, och skapa en personligt anpassad upplevelse
                        baserad på dina preferenser och användarmönster.
                      </li>
                      <li>
                        <strong>Kommunikation:</strong> Vi kan använda din
                        kontaktinformation för att skicka:
                        <ul className="list-disc pl-5 mt-1 mb-2">
                          <li>
                            Transaktionsrelaterade meddelanden om dina köp
                          </li>
                          <li>
                            Kundtjänstmeddelanden för att svara på dina frågor
                            eller lösa problem
                          </li>
                          <li>Uppdateringar om våra produkter och tjänster</li>
                          <li>
                            Marknadsföring och nyhetsbrev (om du har samtyckt
                            till detta)
                          </li>
                        </ul>
                      </li>
                      <li>
                        <strong>Säkerhet och skydd:</strong> Vi använder
                        information för att upptäcka och förhindra bedrägeri,
                        obehörig åtkomst och andra potentiella säkerhetsproblem.
                      </li>
                      <li>
                        <strong>Lagkrav:</strong> Vi kan använda information för
                        att följa gällande lagar, förordningar eller rättsliga
                        förfaranden.
                      </li>
                      <li>
                        <strong>Analys och forskning:</strong> Vi analyserar
                        användarmönster för att förstå hur våra tjänster
                        används, mäta effektiviteten av vår marknadsföring och
                        förbättra vår verksamhet.
                      </li>
                    </ul>
                  </section>

                  <Separator className="my-8" />

                  <section id="cookies" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">4. Cookies</h2>
                    <p className="mb-4">
                      Vi använder cookies och liknande teknologier för att
                      förbättra din upplevelse på vår webbplats, förstå hur du
                      interagerar med våra tjänster och leverera personligt
                      anpassat innehåll och annonser.
                    </p>

                    <h3 className="text-xl font-medium mt-6 mb-3">
                      4.1 Typer av cookies vi använder
                    </h3>
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                      <li>
                        <strong>Nödvändiga cookies:</strong> Krävs för att vår
                        webbplats ska fungera korrekt. De möjliggör
                        grundläggande funktioner som sidnavigering, kundvagn och
                        säker åtkomst till ditt konto.
                      </li>
                      <li>
                        <strong>Preferenscookies:</strong> Sparar dina
                        inställningar och gör din upplevelse mer personlig, till
                        exempel språkpreferenser eller inloggningsinformation.
                      </li>
                      <li>
                        <strong>Statistik/analyscookies:</strong> Hjälper oss
                        att förstå hur besökare använder vår webbplats genom att
                        samla in anonym information, som vilka sidor som besöks
                        oftast, hur länge besökare stannar på en sida, etc.
                      </li>
                      <li>
                        <strong>Marknadsföringscookies:</strong> Används för att
                        visa relevanta annonser till användare baserat på deras
                        intressen och tidigare besök på vår webbplats.
                      </li>
                    </ul>

                    <h3 className="text-xl font-medium mt-6 mb-3">
                      4.2 Hantera cookie-inställningar
                    </h3>
                    <p>
                      Du kan själv bestämma hur cookies används genom att
                      justera inställningarna i din webbläsare. De flesta
                      webbläsare tillåter dig att blockera eller ta bort
                      cookies, även om detta kan påverka funktionaliteten på vår
                      webbplats. Du kan också när som helst ändra dina
                      cookie-inställningar på vår webbplats genom att klicka på
                      "Cookie-inställningar" länken i sidfoten.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="data-sharing" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                      5. Delning av uppgifter
                    </h2>
                    <p className="mb-4">
                      Vi delar endast dina personuppgifter i följande
                      situationer:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        <strong>Företag som säljer produkter:</strong> När du
                        gör ett köp delar vi nödvändig information (namn,
                        leveransadress, telefonnummer) med säljaren för att de
                        ska kunna fullgöra din beställning. Säljare får aldrig
                        tillgång till dina betalningsuppgifter.
                      </li>
                      <li>
                        <strong>Tjänsteleverantörer:</strong> Vi anlitar
                        tredjepartsleverantörer för att utföra viktiga
                        funktioner som betalningshantering, leverans,
                        kundtjänst, dataanalys och marknadsföring. Dessa
                        leverantörer har endast tillgång till den information de
                        behöver för att utföra sina specifika tjänster.
                      </li>
                      <li>
                        <strong>Lagkrav:</strong> Vi kan lämna ut information om
                        det krävs enligt lag, för att svara på juridiska
                        processer eller för att skydda våra rättigheter,
                        integritet, säkerhet eller egendom, eller allmänheten.
                      </li>
                      <li>
                        <strong>Företagsöverlåtelser:</strong> Om ClickFynd.se
                        är involverat i en fusion, förvärv eller försäljning av
                        alla eller en del av sina tillgångar, kan dina
                        personuppgifter överföras som en del av den
                        transaktionen. Vi kommer att meddela dig via e-post
                        och/eller genom ett framträdande meddelande på vår
                        webbplats om en sådan förändring sker.
                      </li>
                      <li>
                        <strong>Med samtycke:</strong> Vi kan dela dina
                        uppgifter i andra situationer med ditt uttryckliga
                        samtycke.
                      </li>
                    </ul>
                    <p className="mt-4">
                      Vi säljer aldrig dina personuppgifter till tredje part.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="data-security" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">6. Datasäkerhet</h2>
                    <p className="mb-4">
                      Vi tar säkerheten för dina personuppgifter på allvar och
                      har implementerat lämpliga tekniska och organisatoriska
                      åtgärder för att skydda dem mot obehörig tillgång,
                      förlust, ändring eller förstörelse.
                    </p>
                    <p className="mb-4">
                      Våra säkerhetsåtgärder inkluderar, men är inte begränsade
                      till:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        Kryptering av känslig information, särskilt
                        betalningsinformation
                      </li>
                      <li>
                        Säkra nätverk med brandväggar och intrångsdetektering
                      </li>
                      <li>
                        Strikta åtkomstbegränsningar för anställda baserat på
                        behov
                      </li>
                      <li>
                        Regelbundna säkerhetsuppdateringar och granskningar av
                        våra system
                      </li>
                      <li>
                        Utbildning av personal i datasäkerhet och
                        integritetsrutiner
                      </li>
                    </ul>
                    <p className="mt-4">
                      Även om vi gör vårt yttersta för att skydda dina
                      personuppgifter, kan ingen metod för överföring via
                      internet eller elektronisk lagring vara 100% säker. Därför
                      kan vi inte garantera absolut säkerhet. Om du har
                      anledning att tro att din interaktion med oss inte längre
                      är säker, vänligen kontakta oss omedelbart.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="data-retention" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">7. Lagringstid</h2>
                    <p className="mb-4">
                      Vi behåller dina personuppgifter så länge ditt konto är
                      aktivt eller så länge det behövs för att tillhandahålla
                      Tjänsterna till dig. Vi behåller också information för att
                      uppfylla våra juridiska skyldigheter, lösa tvister och
                      verkställa våra avtal.
                    </p>
                    <p className="mb-4">Specificerade lagringstider:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        <strong>Kontoinformation:</strong> Lagras så länge ditt
                        konto är aktivt, plus en period därefter för att hantera
                        eventuella uppföljningsfrågor eller tvister.
                      </li>
                      <li>
                        <strong>Orderhistorik:</strong> Behålls i 7 år för att
                        uppfylla bokföringskrav enligt svensk lag.
                      </li>
                      <li>
                        <strong>Kommunikation med kundtjänst:</strong> Sparas
                        vanligtvis i 2 år för att hantera eventuella
                        uppföljningsfrågor eller återkommande problem.
                      </li>
                      <li>
                        <strong>Betalningsinformation:</strong> Fullständiga
                        betalningsuppgifter lagras aldrig på våra servrar.
                        Tokeniserade referenser för återkommande betalningar
                        lagras så länge de behövs och med ditt samtycke.
                      </li>
                    </ul>
                    <p className="mt-4">
                      När personuppgifter inte längre behövs för det syfte de
                      samlats in för, kommer vi att radera eller anonymisera
                      dem. Konton som har varit inaktiva i mer än 24 månader kan
                      anonymiseras eller raderas, efter förvarning via e-post.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="data-subject-rights" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                      8. Dina rättigheter
                    </h2>
                    <p className="mb-4">
                      Enligt dataskyddsförordningen (GDPR) har du följande
                      rättigheter gällande dina personuppgifter:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        <strong>Rätt till tillgång:</strong> Du har rätt att få
                        bekräftelse på om vi behandlar dina personuppgifter och
                        få en kopia av dessa uppgifter.
                      </li>
                      <li>
                        <strong>Rätt till rättelse:</strong> Du har rätt att
                        begära rättelse av felaktiga personuppgifter eller
                        komplettering av ofullständiga personuppgifter.
                      </li>
                      <li>
                        <strong>
                          Rätt till radering (rätten att bli bortglömd):
                        </strong>{' '}
                        Du har rätt att begära radering av dina personuppgifter
                        under vissa omständigheter, till exempel när uppgifterna
                        inte längre behövs för de ändamål för vilka de samlades
                        in.
                      </li>
                      <li>
                        <strong>Rätt till begränsning av behandling:</strong> Du
                        har rätt att begära att behandlingen av dina
                        personuppgifter begränsas under vissa omständigheter,
                        till exempel när du bestrider uppgifternas korrekthet.
                      </li>
                      <li>
                        <strong>Rätt till dataportabilitet:</strong> Du har rätt
                        att få ut dina personuppgifter i ett strukturerat,
                        allmänt använt och maskinläsbart format och överföra
                        dessa uppgifter till en annan personuppgiftsansvarig.
                      </li>
                      <li>
                        <strong>Rätt att göra invändningar:</strong> Du har rätt
                        att när som helst invända mot behandling av dina
                        personuppgifter som baseras på vårt berättigade
                        intresse.
                      </li>
                      <li>
                        <strong>
                          Rätt att inte bli föremål för automatiserat
                          beslutsfattande:
                        </strong>{' '}
                        Du har rätt att inte bli föremål för ett beslut som
                        enbart grundas på automatiserad behandling som har
                        rättsliga följder för dig eller på liknande sätt i
                        betydande grad påverkar dig.
                      </li>
                    </ul>
                    <p className="mt-4">
                      För att utöva någon av dessa rättigheter, vänligen
                      kontakta oss via e-post på dataskydd@ClickFynd.se.se eller
                      genom vår kontaktsida. Vi kommer att svara på din begäran
                      inom 30 dagar. Om vi behöver mer tid, kommer vi att
                      informera dig om detta och ange orsaken till förseningen.
                    </p>
                    <p className="mt-4">
                      Om du inte är nöjd med hur vi hanterar din begäran, har du
                      rätt att klaga hos
                      <a
                        href="https://www.imy.se/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline"
                      >
                        {' '}
                        Integritetsskyddsmyndigheten
                      </a>
                      .
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="children-privacy" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                      9. Barns integritet
                    </h2>
                    <p className="mb-4">
                      Våra Tjänster är inte avsedda för barn under 16 år, och vi
                      samlar inte medvetet in personuppgifter från barn under 16
                      år. Om du är förälder eller vårdnadshavare och tror att
                      ditt barn har lämnat personuppgifter till oss, vänligen
                      kontakta oss omedelbart så att vi kan vidta lämpliga
                      åtgärder för att ta bort sådan information.
                    </p>
                    <p>
                      Om vi får kännedom om att vi har samlat in personuppgifter
                      från ett barn under 16 år utan verifiering av föräldrarnas
                      samtycke, kommer vi att ta bort dessa uppgifter från våra
                      system så snart som möjligt.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="international-transfers" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                      10. Internationella överföringar
                    </h2>
                    <p className="mb-4">
                      ClickFynd.se är baserat i Sverige, och din information kan
                      komma att överföras till, lagras och behandlas i Sverige
                      eller andra länder inom EU där våra tjänsteleverantörer är
                      verksamma.
                    </p>
                    <p className="mb-4">
                      När vi överför personuppgifter utanför EU/EES,
                      säkerställer vi att detta sker i enlighet med gällande
                      dataskyddslagstiftning och att lämpliga skyddsåtgärder är
                      på plats. Sådana skyddsåtgärder kan inkludera:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>EU:s standardavtalsklausuler</li>
                      <li>
                        Överföring till länder som enligt EU-kommissionen anses
                        ha en adekvat skyddsnivå
                      </li>
                      <li>
                        Bindande företagsbestämmelser för koncerninterna
                        överföringar
                      </li>
                    </ul>
                    <p className="mt-4">
                      Genom att använda våra Tjänster samtycker du till sådan
                      överföring, lagring och behandling av dina
                      personuppgifter.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="policy-changes" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                      11. Ändringar i policyn
                    </h2>
                    <p className="mb-4">
                      Vi kan komma att uppdatera denna sekretesspolicy från tid
                      till annan för att återspegla ändringar i vår praxis eller
                      av andra operativa, juridiska eller regulatoriska skäl.
                      När vi gör väsentliga ändringar i denna policy kommer vi
                      att meddela dig genom att lägga upp ett meddelande på vår
                      webbplats eller skicka ett e-postmeddelande till den
                      e-postadress som är kopplad till ditt konto.
                    </p>
                    <p className="mb-4">
                      Mindre ändringar eller förtydliganden kan göras när som
                      helst utan särskilt meddelande, men den senaste versionen
                      av policyn kommer alltid att finnas tillgänglig på vår
                      webbplats. Vi uppmuntrar dig att regelbundet granska denna
                      sekretesspolicy för att hålla dig informerad om hur vi
                      skyddar dina personuppgifter.
                    </p>
                    <p>
                      Den senaste uppdateringen av denna policy gjordes det
                      datum som anges överst i dokumentet.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="contact-info" className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                      12. Kontaktinformation
                    </h2>
                    <p className="mb-4">
                      Om du har frågor eller synpunkter om denna sekretesspolicy
                      eller om hur vi behandlar dina personuppgifter, vänligen
                      kontakta oss:
                    </p>
                    <div className="mb-4">
                      <p className="font-medium">ClickFynd.se AB</p>
                      <p>
                        Sveavägen 123
                        <br />
                        113 50 Stockholm
                      </p>
                    </div>
                    <div className="mb-4">
                      <p className="font-medium">Dataskyddsombud:</p>
                      <p>
                        E-post:{' '}
                        <a
                          href="mailto:dataskydd@ClickFynd.se.se"
                          className="text-purple-600 hover:underline"
                        >
                          dataskydd@ClickFynd.se.se
                        </a>
                        <br />
                        Telefon: 010-123 45 67
                      </p>
                    </div>
                    <p>
                      Du kan också använda vårt{' '}
                      <Link
                        href="/kundtjanst/kontakt"
                        className="text-purple-600 hover:underline"
                      >
                        kontaktformulär
                      </Link>
                      på vår webbplats.
                    </p>
                  </section>

                  <div className="mt-12 text-sm text-gray-500">
                    <p>
                      Denna sekretesspolicy är upphovsrättsskyddad och tillhör
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
