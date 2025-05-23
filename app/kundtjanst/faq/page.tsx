'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import Link from 'next/link';

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('alla');

  // Helper function to filter questions based on search
  const filterQuestions = (
    questions: { question: string; answer: string }[]
  ) => {
    if (!searchQuery) return questions;

    return questions.filter(
      (q) =>
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Data for platform questions
  const platformQuestions = [
    {
      question: 'Vad är BudFynd.se?',
      answer:
        'BudFynd.se är en marknadsplats för tidsbegränsade erbjudanden. Företag kan lägga upp sina produkter med en specifik tidsgräns (12, 24 eller 48 timmar), och när tiden är ute försvinner erbjudandet. Detta koncept gör att företag kan erbjuda bättre priser på sina produkter under en kort tidsperiod, vilket ger dig som kund möjlighet att göra riktiga fynd.',
    },
    {
      question: 'Hur fungerar tidsbegränsade erbjudanden?',
      answer:
        'Tidsbegränsade erbjudanden finns endast tillgängliga under en viss period - 12, 24, eller 48 timmar. Ju kortare tidsperiod, desto bättre pris kan företag ofta erbjuda. När du ser ett erbjudande på vår plattform visas alltid en nedräkningstimer som visar exakt hur lång tid som är kvar innan erbjudandet försvinner. När tiden är ute tas produkten bort automatiskt från BudFynd.se, även om den inte skulle vara slutsåld.',
    },
    {
      question: 'Vad händer om jag missar ett erbjudande?',
      answer:
        'Om du missar ett tidsbegränsat erbjudande kan du tyvärr inte köpa produkten till det rabatterade priset. Företag kan välja att lägga upp samma produkt igen vid ett senare tillfälle, men vi kan inte garantera att detta kommer att ske eller att priset kommer att vara detsamma. Vi rekommenderar att du använder önskelistan för att markera produkter du är intresserad av och ställer in aviseringar för att få påminnelser innan erbjudanden löper ut.',
    },
    {
      question: 'Hur skapas ett konto på BudFynd.se?',
      answer:
        'För att skapa ett konto, klicka på "Registrera" i övre högra hörnet av sidan. Du kan registrera dig med din e-postadress eller genom att använda ditt Google- eller Facebook-konto. Efter registrering behöver du verifiera din e-postadress genom att klicka på länken som skickas till dig. Som registrerad användare kan du följa och bevaka erbjudanden, få tillgång till din orderhistorik och hantera dina personuppgifter.',
    },
    {
      question: 'Är det gratis att använda BudFynd.se?',
      answer:
        'Ja, det är helt gratis att registrera sig och använda BudFynd.se som kund. Vi tar inga avgifter för beställningar, och det finns inga dolda kostnader. BudFynd.se finansieras genom provisioner från säljande företag, som betalar en liten procentandel av försäljningen baserat på längden på deras tidsbegränsade erbjudande.',
    },
    {
      question: 'Hur får jag information om nya erbjudanden?',
      answer:
        'Du kan få information om nya erbjudanden på flera sätt: 1) Prenumerera på vårt nyhetsbrev för att få dagliga eller veckovis sammanfattningar av de bästa erbjudandena. 2) Aktivera push-notiser i din webbläsare eller vår app. 3) Följ oss på sociala medier där vi regelbundet delar nya och populära erbjudanden. 4) Skapa en önskelista med dina favoritkategorier för att få personanpassade rekommendationer.',
    },
  ];

  // Data for account questions
  const accountQuestions = [
    {
      question: 'Hur ändrar jag mitt lösenord?',
      answer:
        'För att ändra ditt lösenord, logga in på ditt konto och gå till "Inställningar". Under fliken "Säkerhet" kan du välja "Ändra lösenord". Du behöver ange ditt nuvarande lösenord samt ditt nya lösenord två gånger för att bekräfta ändringen. Om du har glömt ditt lösenord, kan du klicka på "Glömt lösenord?" på inloggningssidan för att återställa det via din e-post.',
    },
    {
      question:
        'Hur uppdaterar jag min e-postadress eller andra kontaktuppgifter?',
      answer:
        'För att uppdatera din e-postadress eller andra kontaktuppgifter, logga in på ditt konto och gå till "Inställningar". Under fliken "Profil" kan du ändra din e-post, telefonnummer och andra personuppgifter. Observera att om du ändrar e-postadress behöver du verifiera den nya adressen genom att klicka på länken som skickas till dig.',
    },
    {
      question: 'Hur raderar jag mitt konto?',
      answer:
        'För att radera ditt konto, logga in och gå till "Inställningar". Längst ner på sidan finns alternativet "Radera konto". När du klickar på denna knapp kommer du att behöva bekräfta ditt beslut genom att ange ditt lösenord. Observera att kontoborttagning är permanent och att all information kopplad till kontot, inklusive orderhistorik och sparade adresser, kommer att raderas. Pågående beställningar kommer dock att slutföras.',
    },
    {
      question: 'Vad är en önskelista och hur använder jag den?',
      answer:
        'Önskelistan är en funktion som låter dig spara produkter du är intresserad av för att enkelt kunna hitta dem senare eller bli notifierad när de är på rea. För att lägga till en produkt i din önskelista, klicka på hjärtsymbolen som finns på produktkortet eller produktsidan. Du kan se och hantera din önskelista genom att klicka på "Önskelista" i menyn efter att du loggat in. Du kan också dela din önskelista med vänner och familj.',
    },
    {
      question: 'Hur aktiverar eller inaktiverar jag e-postaviseringar?',
      answer:
        'För att hantera dina e-postaviseringar, logga in på ditt konto och gå till "Inställningar". Under fliken "Notifieringar" kan du aktivera eller inaktivera olika typer av e-postmeddelanden, som orderbekräftelser, leveransuppdateringar, påminnelser om erbjudanden som snart löper ut, och nyhetsbrev. Du kan anpassa frekvensen för vissa aviseringar, till exempel välja om du vill få dagliga eller veckovisa sammanfattningar.',
    },
  ];

  // Data for order questions
  const orderQuestions = [
    {
      question: 'Hur gör jag en beställning?',
      answer:
        'För att göra en beställning på BudFynd.se, bläddra bland erbjudandena och klicka på den produkt du är intresserad av. På produktsidan kan du se detaljerad information och välja att klicka på "Köp nu" eller "Lägg i kundvagn". Om du väljer att lägga produkten i kundvagnen kan du fortsätta handla och lägga till fler produkter innan du går till kassan. I kassan anger du leveransadress, väljer leveranssätt och betalningsmetod, och slutför sedan köpet.',
    },
    {
      question: 'Vilka betalningssätt accepterar ni?',
      answer:
        'Vi accepterar flera olika betalningssätt för att göra det så enkelt som möjligt för dig att handla: 1) Kreditkort/betalkort (Visa, Mastercard, American Express) 2) Swish 3) Direktbetalning via bank 4) Faktura via Klarna (14 dagars betalningsperiod) 5) Delbetalning via Klarna. Alla betalningar är säkra och krypterade för att skydda dina uppgifter.',
    },
    {
      question: 'Är det säkert att handla på BudFynd.se?',
      answer:
        'Ja, det är helt säkert att handla på BudFynd.se. Vi använder branschledande säkerhetsstandarder för att skydda dina person- och betaluppgifter. All kommunikation mellan din webbläsare och vår server är krypterad med SSL. Vi lagrar aldrig fullständiga kreditkortsuppgifter, och våra betalningslösningar hanteras av certifierade betalningsprocessorer som Stripe och Klarna, vilket innebär att dina kortuppgifter aldrig delas med oss eller säljarna.',
    },
    {
      question: 'Hur kan jag se status på min beställning?',
      answer:
        'Du kan enkelt se statusen på din beställning genom att logga in på ditt konto och gå till "Mina beställningar". Där visas alla dina tidigare och pågående beställningar med aktuell status. För varje beställning kan du se detaljerad information och spårningsnummer när produkten har skickats. Du kommer också att få e-postaviseringar när din beställning bekräftats, skickats och levererats om du har aktiverat aviseringar i dina kontoinställningar.',
    },
    {
      question: 'Kan jag ändra eller avbryta min beställning?',
      answer:
        'Du kan ändra eller avbryta din beställning endast om den inte har börjat bearbetas. För att göra detta, logga in på ditt konto, gå till "Mina beställningar" och välj den beställning du vill ändra. Om beställningen fortfarande visar status "Väntar" eller "Behandlas", kan du klicka på "Ändra" eller "Avbryt". Om beställningen redan har status "Skickad" kan du inte längre ändra eller avbryta den, utan måste istället returnera produkten efter att du fått den.',
    },
    {
      question:
        'Vad händer om en produkt tar slut medan den är i min kundvagn?',
      answer:
        'Produkter i din kundvagn är inte reserverade förrän du slutför köpet. Om en produkt tar slut medan den är i din kundvagn kommer du att få en notifiering när du försöker slutföra köpet, och produkten kommer att tas bort från kundvagnen. Vi rekommenderar att du slutför ditt köp snabbt, särskilt för populära erbjudanden med begränsat lager.',
    },
    {
      question: 'Hur gör jag om jag vill köpa flera exemplar av samma produkt?',
      answer:
        'När du är på produktsidan kan du justera antalet med plus- och minusknapparna bredvid siffran som anger kvantitet. Du kan öka antalet upp till det maximala antalet som finns tillgängligt i lager. Observera att vissa erbjudanden kan ha begränsningar för hur många exemplar en kund får köpa för att säkerställa att fler kunder får möjlighet att ta del av erbjudandet.',
    },
  ];

  // Data for shipping questions
  const shippingQuestions = [
    {
      question: 'Hur lång är leveranstiden?',
      answer:
        'Leveranstiden varierar beroende på produkten och leveransmetoden du väljer vid kassan. Standard leverans tar vanligtvis 1-3 arbetsdagar inom Sverige. Expressleverans är oftast framme nästa arbetsdag om beställningen görs innan kl 12:00. För vissa produkter kan leveranstiden vara längre, vilket alltid anges tydligt på produktsidan innan du genomför köpet. Internationella leveranser tar vanligtvis 5-10 arbetsdagar beroende på destination.',
    },
    {
      question: 'Vilka leveransalternativ finns?',
      answer:
        'Vi erbjuder flera leveransalternativ för att möta dina behov: 1) Standardleverans (1-3 arbetsdagar) 2) Expressleverans (nästa arbetsdag) 3) Leverans till utlämningsställe (PostNord, DHL, Instabox) 4) Hemleverans 5) Kvällsleverans (endast i storstäder). Tillgängliga leveransalternativ och kostnader visas i kassan och kan variera beroende på produktens storlek, vikt och ditt geografiska område.',
    },
    {
      question: 'Vad kostar frakten?',
      answer:
        'Fraktkostnaden beror på vilken leveransmetod du väljer och storleken/vikten på din beställning. Standardfrakt kostar vanligtvis 49-99 kr, medan expressleverans kostar 99-149 kr. Vid köp över 499 kr erbjuder vi ofta fri standardfrakt. Den exakta fraktkostnaden visas alltid i kassan innan du slutför ditt köp. För vissa skrymmande eller tunga produkter kan en extra fraktavgift tillkomma, vilket alltid anges tydligt.',
    },
    {
      question: 'Levererar ni internationellt?',
      answer:
        'Ja, vi levererar till de flesta länder i Europa. För leveranser utanför EU kan ytterligare tullavgifter och moms tillkomma, vilket betalas av mottagaren vid leverans. Leveranstiden för internationella beställningar är vanligtvis 5-10 arbetsdagar, men kan vara längre beroende på destinationsland och lokala tullprocesser. Internationella fraktkostnader beräknas baserat på destination, vikt och storlek, och visas vid kassan.',
    },
    {
      question: 'Hur spårar jag min leverans?',
      answer:
        'När din beställning har skickats får du ett spårningsnummer via e-post och/eller SMS. Du kan också se spårningsinformationen genom att logga in på ditt konto och gå till "Mina beställningar". Klicka på den aktuella beställningen och sedan på "Spåra försändelse" för att följa paketet i realtid via transportörens webbplats (t.ex. PostNord, DHL, etc.).',
    },
    {
      question: 'Vad händer om jag inte är hemma vid leveranstillfället?',
      answer:
        'Om du har valt hemleverans och inte är hemma när leveransen sker, kommer transportören vanligtvis att lämna ett meddelande med instruktioner om hur du kan hämta ut paketet eller boka en ny leveranstid. För leveranser till utlämningsställen får du en avisering när paketet finns tillgängligt för upphämtning. Paketet förvaras då på utlämningsstället i vanligtvis 7-14 dagar innan det returneras till oss om det inte hämtas ut.',
    },
    {
      question:
        'Vad gör jag om min leverans är skadad eller om det saknas produkter?',
      answer:
        'Om din leverans är skadad vid mottagandet eller om det saknas produkter, kontakta vårt kundtjänstteam omedelbart via e-post eller telefon. Bifoga gärna bilder på skadan och ange ditt ordernummer. Vi rekommenderar att du granskar paketet vid leveranstillfället och noterar eventuella skador på leveranskvittot. För att underlätta processen bör du anmäla skador eller fel inom 48 timmar efter mottagandet.',
    },
  ];

  // Data for return questions
  const returnQuestions = [
    {
      question: 'Vad är er returpolicy?',
      answer:
        'Vi följer svensk konsumentlagstiftning som ger dig 14 dagars ångerrätt från det datum du tog emot produkten. Under denna period kan du returnera produkten av vilken anledning som helst, förutsatt att den är i ursprungligt skick med alla etiketter och förpackningar intakta. Observera att vissa produktkategorier som hygienartiklar, öppnade förpackningar av livsmedel, och specialtillverkade produkter inte omfattas av ångerrätten. För varje produkt anges tydligt om det finns särskilda returvillkor.',
    },
    {
      question: 'Hur returnerar jag en produkt?',
      answer:
        'För att returnera en produkt, följ dessa steg: 1) Logga in på ditt konto och gå till "Mina beställningar". 2) Hitta den aktuella beställningen och klicka på "Returnera". 3) Välj vilka produkter du vill returnera och ange anledningen. 4) Skriv ut retursedeln som genereras. 5) Packa produkten i originalförpackningen om möjligt. 6) Fäst retursedeln på paketet och lämna in det hos närmaste utlämningsställe. Vi rekommenderar att du behåller kvittot som bevis på att du skickat returen.',
    },
    {
      question: 'Vem betalar för returfrakten?',
      answer:
        'Vid retur på grund av ångerrätt står kunden för returfraktkostnaden, om inget annat anges i produktbeskrivningen. Returfrakt kostar vanligtvis 49-99 kr beroende på produktens storlek och vikt. Vid retur på grund av defekt, felleverans eller skada under transport står vi för returfraktkostnaden. I sådana fall skickar vi en förbetald retursedel till dig via e-post när du registrerar din retur.',
    },
    {
      question: 'När får jag tillbaka pengarna för en retur?',
      answer:
        'Återbetalningen sker så snart vi har mottagit och godkänt din retur, vilket vanligtvis är inom 5-7 arbetsdagar efter att vi mottagit paketet. Pengarna återbetalas till samma betalningsmetod som användes vid köpet. Kreditkortsåterbetalningar kan ta ytterligare 3-5 arbetsdagar innan de syns på ditt kontoutdrag, beroende på din bank. Du får en bekräftelse via e-post när återbetalningen har genomförts.',
    },
    {
      question: 'Kan jag byta en produkt mot en annan storlek eller färg?',
      answer:
        'Vi erbjuder tyvärr inte direkta byten av produkter. Om du vill ha en annan storlek eller färg behöver du returnera den ursprungliga produkten och göra en ny beställning för den önskade varianten. Observera att priser kan förändras mellan beställningarna om du returnerar ett tidsbegränsat erbjudande som inte längre är aktivt.',
    },
    {
      question:
        'Vad gör jag om produkten är defekt eller inte fungerar som den ska?',
      answer:
        'Om produkten är defekt eller inte fungerar som utlovat, kontakta vårt kundtjänstteam omedelbart via e-post eller telefon. Ange ditt ordernummer och en detaljerad beskrivning av problemet, gärna med bilder. Enligt konsumentköplagen har du rätt till reparation, ersättningsprodukt eller full återbetalning om produkten är defekt. Vi täcker även returfraktkostnaden i dessa fall. Anmäl fel så snart som möjligt, helst inom 14 dagar från mottagandet.',
    },
    {
      question: 'Kan jag returnera en använd produkt?',
      answer:
        'Du har rätt att undersöka produkten på samma sätt som du skulle kunna göra i en fysisk butik, men produkten ska vara i säljbart skick för att kvalificera för full återbetalning. Om produkten har använts utöver vad som behövs för att inspektera den, eller om den är skadad på grund av hantering utöver vad som är nödvändigt, kan vi göra avdrag från återbetalningen motsvarande värdeminskningen. För hygienprodukter, underkläder och liknande varor gäller särskilda regler - dessa kan endast returneras om förseglingen är obruten.',
    },
    {
      question: 'Vad gäller för retur av tidsbegränsade erbjudanden?',
      answer:
        'Även tidsbegränsade erbjudanden omfattas av den lagstadgade 14 dagars ångerrätten. Du kan returnera dessa produkter enligt vår standardprocedur. Observera dock att om du returnerar en produkt från ett tidsbegränsat erbjudande och vill köpa samma produkt igen, kan priset ha ändrats om erbjudandet inte längre är aktivt. Vi kan inte garantera att samma erbjudande kommer att finnas tillgängligt igen.',
    },
  ];

  // Data for company questions
  const companyQuestions = [
    {
      question: 'Hur kan mitt företag sälja på BudFynd.se?',
      answer:
        'För att sälja på BudFynd.se, börja med att registrera ett företagskonto på vår webbplats. Klicka på "Registrera" och välj alternativet "Registrera företag". Du behöver ange företagets organisationsnummer, kontaktuppgifter och ladda upp relevanta dokument som bekräftar att du har rätt att representera företaget. Efter granskning och godkännande (vanligtvis inom 1-2 arbetsdagar) får du tillgång till vårt säljargränssnitt där du kan börja skapa tidsbegränsade erbjudanden.',
    },
    {
      question: 'Vilka avgifter tar ni för försäljning?',
      answer:
        'Våra avgifter baseras på längden på det tidsbegränsade erbjudandet. För 12-timmars erbjudanden tar vi 3% av försäljningspriset. För 24-timmars erbjudanden är avgiften 4%, och för 48-timmars erbjudanden 5%. Det finns inga fasta månadskostnader eller uppsättningsavgifter. Du betalar endast när du faktiskt säljer något. Utbetalningar sker varannan vecka, minus våra provisioner och eventuella returavgifter.',
    },
    {
      question: 'Vilka produkter kan jag sälja på BudFynd.se?',
      answer:
        'Du kan sälja de flesta typer av lagliga produkter på BudFynd.se, inklusive elektronik, mode, heminredning, skönhetsprodukter, hobby- och fritidsartiklar m.m. Det finns dock vissa restriktioner. Vi tillåter inte försäljning av alkohol, tobak, receptbelagda läkemedel, vapen, olagliga produkter, piratkopierade varor, eller produkter som bryter mot upphovsrätt. Vi har också kvalitetskrav och förbehåller oss rätten att neka produkter som inte uppfyller våra standarder.',
    },
    {
      question: 'Hur fungerar leverans och returer för säljare?',
      answer:
        'Som säljare ansvarar du för att skicka produkterna till kunderna inom den överenskomna tidsramen (vanligtvis 1-3 arbetsdagar efter beställning). Du kan antingen använda din egen leveranslösning eller våra integrerade partners med förhandlade rabatter. För returer kan du välja att hantera dem själv eller låta oss hantera returprocessen åt dig mot en liten avgift. Returer måste hanteras enligt svensk konsumentlagstiftning, med full återbetalning för produkter som returneras i ursprungligt skick inom 14 dagar.',
    },
    {
      question: 'Hur skapar jag ett framgångsrikt tidsbegränsat erbjudande?',
      answer:
        'För att skapa ett framgångsrikt tidsbegränsat erbjudande, fokusera på följande: 1) Erbjud en verklig rabatt jämfört med ordinarie pris. 2) Tillhandahåll högkvalitativa produktbilder och detaljerade beskrivningar. 3) Var tydlig med antal tillgängliga enheter. 4) Välj rätt varaktighet - kortare tid kräver mer attraktiva priser men kan ge högre konverteringsgrad. 5) Se till att du har tillräckligt med lager för att möta efterfrågan. 6) Utnyttja våra verktyg för att marknadsföra ditt erbjudande, såsom "Utvalda erbjudanden" och kategoriplacering.',
    },
    {
      question:
        'Vilka krav ställer ni på företag som vill sälja på plattformen?',
      answer:
        'För att sälja på BudFynd.se måste ditt företag: 1) Vara ett registrerat företag med giltigt organisationsnummer. 2) Ha F-skattebevis och momsregistreringsnummer. 3) Följa svensk lag och EU-förordningar gällande konsumenträtt, garanti och produktsäkerhet. 4) Kunna erbjuda verkliga rabatter på produkterna. 5) Ha kapacitet att hantera leveranser och kundservice. 6) Upprätthålla en kundnöjdhet på minst 4.0 (av 5) för att fortsätta sälja på plattformen. 7) Acceptera vår policy om returhantering och våra användarvillkor.',
    },
  ];

  // Data for technical questions
  const technicalQuestions = [
    {
      question: 'Vilka webbläsare stöder BudFynd.se?',
      answer:
        'BudFynd.se är optimerad för och stöder fullt ut följande moderna webbläsare: Google Chrome (version 90 och senare), Mozilla Firefox (version 88 och senare), Apple Safari (version 14 och senare), Microsoft Edge (version 90 och senare) och Opera (version 76 och senare). Vi rekommenderar att du alltid använder den senaste versionen av din webbläsare för bästa upplevelse och säkerhet. Äldre webbläsare eller Internet Explorer stöds inte fullt ut och kan resultera i begränsad funktionalitet.',
    },
    {
      question: 'Finns det en mobilapp för BudFynd.se?',
      answer:
        'Nej, vi har idag inga mobilappar. Detta är under utveckling och vi planerar att lansera en app för både iOS och Android inom kort. Under tiden kan du använda vår mobilanpassade webbplats som erbjuder samma funktioner och användarvänlighet som desktopversionen. Du kan också spara vår webbplats som en genväg på din hemskärm för snabb åtkomst.',
    },
    {
      question: 'Hur använder jag filter för att hitta produkter?',
      answer:
        'För att använda filter, gå till BudFynd.se och klicka på "Filter" i vänstra sidofältet (eller klicka på filterikonen högst upp på mobilversionen). Du kan filtrera produkter efter: Kategori, underkategori, prisintervall, varaktighet (12h, 24h, 48h), betyg, och mer. Du kan kombinera flera filter för att precisera dina sökresultat. Dina filterinställningar sparas under din session så att du inte behöver ställa in dem igen om du navigerar tillbaka till BudFynd.se.',
    },
    {
      question: 'Varför visas vissa bilder inte korrekt?',
      answer:
        'Om bilder inte visas korrekt kan det bero på: 1) Långsam internetanslutning - försök uppdatera sidan eller ansluta till ett starkare nätverk. 2) Webbläsarproblem - rensa din webbläsarcache och cookies, eller prova en annan webbläsare. 3) Enhetsbegränsningar - äldre enheter kanske inte kan visa högupplösta bilder korrekt. 4) Tillfälliga serverfel - vänta en stund och försök igen senare. Om problemet kvarstår, kontakta vår kundtjänst och ange din enhets- och webbläsarinformation.',
    },
    {
      question: 'Hur ofta uppdateras erbjudanden på webbplatsen?',
      answer:
        'Nya erbjudanden läggs upp kontinuerligt under dagen, när säljare skapar och aktiverar dem. Vår startsida uppdateras automatiskt varje timme för att visa de senaste och mest populära erbjudandena. För att se de allra senaste erbjudandena rekommenderar vi att du uppdaterar sidan manuellt eller använder sorteringsalternativet "Nyaste" i BudFynd.se. Vi har vanligtvis flest nya erbjudanden som aktiveras på morgonen (mellan 08:00-10:00) och kvällen (mellan 18:00-20:00).',
    },
    {
      question:
        'Hur ser jag till att jag inte missar ett erbjudande jag är intresserad av?',
      answer:
        'För att inte missa erbjudanden du är intresserad av kan du: 1) Lägga till produkten i din önskelista genom att klicka på hjärtsymbolen - du får då en avisering innan erbjudandet löper ut. 2) Aktivera e-post- eller push-notifikationer i dina kontoinställningar. 3) Ställa in påminnelser för specifika produkter genom att klicka på klockikonen på produktsidan. 4) Använda vår mobilapp för att få push-notifieringar i realtid om erbjudanden som snart tar slut. 5) Prenumerera på vårt nyhetsbrev för dagliga sammanfattningar av de bästa erbjudandena.',
    },
  ];

  // Data for privacy questions
  const privacyQuestions = [
    {
      question: 'Hur hanterar ni mina personuppgifter?',
      answer:
        'Vi hanterar dina personuppgifter i enlighet med GDPR och svensk lagstiftning. Vi samlar endast in uppgifter som är nödvändiga för att leverera våra tjänster, såsom namn, e-postadress, leveransadress och betalningsinformation för att slutföra beställningar. Vi använder också data för att förbättra användarupplevelsen och anpassa erbjudanden. Dina personuppgifter delas aldrig med tredje part för marknadsföringsändamål utan ditt uttryckliga samtycke. För fullständig information, se vår integritetspolicy.',
    },
    {
      question: 'Hur länge sparar ni min information?',
      answer:
        'Vi sparar din information så länge du har ett aktivt konto hos oss, plus en period därefter för att uppfylla lagliga skyldigheter som bokföring och garantiärenden. Orderhistorik sparas i 7 år enligt bokföringslagen. Betalningsinformation sparas endast under den tid som krävs för att slutföra transaktionen och eventuella återbetalningar. Inaktiva konton som inte använts på 24 månader anonymiseras automatiskt. Du kan när som helst begära att dina uppgifter raderas, med undantag för information vi måste behålla enligt lag.',
    },
    {
      question: 'Använder ni cookies och vad innebär det?',
      answer:
        'Ja, vi använder cookies för att förbättra din upplevelse på vår webbplats. Vi använder nödvändiga cookies för att webbplatsen ska fungera korrekt (t.ex. för kundvagn och inloggning), statistik-cookies för att förstå hur besökare använder vår webbplats, och funktionella cookies för att komma ihåg dina inställningar. Vi använder också marknadsföringscookies för att visa relevanta annonser, men dessa är valfria och kräver ditt samtycke. Du kan hantera dina cookie-inställningar genom att klicka på "Cookie-inställningar" längst ner på vår webbplats.',
    },
    {
      question: 'Hur kan jag begära ut eller radera min data?',
      answer:
        'För att begära ut eller radera dina personuppgifter, logga in på ditt konto och gå till "Integritet och data" under "Inställningar". Där kan du begära en komplett kopia av all data vi har om dig, vilket vi tillhandahåller inom 30 dagar. Om du vill radera din data kan du antingen välja att radera specifika delar eller begära en fullständig radering av ditt konto. Du kan också kontakta vårt dataskyddsombud direkt via dataskydd@BudFynd.se.se för alla frågor relaterade till dina personuppgifter.',
    },
    {
      question: 'Delar ni min information med säljarna?',
      answer:
        'När du gör ett köp delar vi nödvändig information med säljaren för att de ska kunna fullfölja din beställning, inklusive namn, leveransadress och kontaktuppgifter. Vi delar aldrig din betalningsinformation med säljare. Säljare är enligt vårt avtal bundna till strikta dataskyddsregler och får endast använda dina uppgifter för att slutföra din specifika beställning. De får inte använda dina uppgifter för direktmarknadsföring eller dela dem med tredje part utan ditt uttryckliga samtycke.',
    },
    {
      question: 'Hur skyddar ni mina betalningsuppgifter?',
      answer:
        'Vi lagrar aldrig dina fullständiga betalkortsuppgifter på våra servrar. Alla betalningar hanteras av certifierade betalningsprocessorer som Stripe och Klarna, som använder branschstandard kryptering (TLS/SSL). När du gör en betalning skickas uppgifterna direkt till betalningsprocessorn via en krypterad anslutning, utan att passera genom våra servrar. För återkommande kunder sparas endast en krypterad token, inte dina faktiska kortuppgifter, för att möjliggöra snabbare utcheckning i framtiden, och detta endast med ditt uttryckliga samtycke.',
    },
  ];

  // Combine all questions for the search functionality
  const allQuestions = [
    ...platformQuestions,
    ...accountQuestions,
    ...orderQuestions,
    ...shippingQuestions,
    ...returnQuestions,
    ...companyQuestions,
    ...technicalQuestions,
    ...privacyQuestions,
  ];

  // Filter questions based on active tab and search query
  const getDisplayQuestions = (
    categoryQuestions: { question: string; answer: string }[]
  ) => {
    if (activeTab === 'alla' && !searchQuery) {
      // Display a limited number of questions from each category in 'all' view
      return [
        ...platformQuestions.slice(0, 2),
        ...orderQuestions.slice(0, 2),
        ...shippingQuestions.slice(0, 2),
        ...returnQuestions.slice(0, 2),
      ];
    }

    if (searchQuery) {
      // When searching, show all matches regardless of tab
      return filterQuestions(allQuestions);
    }

    // Otherwise, filter by the selected category
    return filterQuestions(categoryQuestions);
  };

  // Get questions to display based on active tab
  const getQuestionsForTab = () => {
    switch (activeTab) {
      case 'platform':
        return getDisplayQuestions(platformQuestions);
      case 'account':
        return getDisplayQuestions(accountQuestions);
      case 'orders':
        return getDisplayQuestions(orderQuestions);
      case 'shipping':
        return getDisplayQuestions(shippingQuestions);
      case 'returns':
        return getDisplayQuestions(returnQuestions);
      case 'company':
        return getDisplayQuestions(companyQuestions);
      case 'technical':
        return getDisplayQuestions(technicalQuestions);
      case 'privacy':
        return getDisplayQuestions(privacyQuestions);
      case 'alla':
      default:
        return getDisplayQuestions([]);
    }
  };

  const displayQuestions = getQuestionsForTab();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow bg-gradient-to-b from-purple-50 to-white">
        {/* Hero section with search */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Vanliga frågor
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Hitta svar på de vanligaste frågorna om BudFynd.se. Kan du inte
              hitta det du söker? Kontakta oss direkt.
            </p>

            {/* Search box */}
            <div className="relative max-w-2xl mx-auto mb-10">
              <Input
                type="text"
                placeholder="Sök bland vanliga frågor..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>

            {/* Question category tabs */}
            <Tabs
              defaultValue="alla"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="mb-6 overflow-x-auto pb-2">
                <TabsList className="w-full md:w-auto">
                  <TabsTrigger value="alla">Alla</TabsTrigger>
                  <TabsTrigger value="platform">Plattformen</TabsTrigger>
                  <TabsTrigger value="account">Konto</TabsTrigger>
                  <TabsTrigger value="orders">Beställningar</TabsTrigger>
                  <TabsTrigger value="shipping">Leverans</TabsTrigger>
                  <TabsTrigger value="returns">Returer</TabsTrigger>
                  <TabsTrigger value="company">Företag</TabsTrigger>
                  <TabsTrigger value="technical">Tekniskt</TabsTrigger>
                  <TabsTrigger value="privacy">Integritet</TabsTrigger>
                </TabsList>
              </div>
            </Tabs>
          </div>
        </section>

        {/* Questions and answers section */}
        <section className="py-8 px-4 pb-16">
          <div className="container mx-auto max-w-4xl">
            {searchQuery && displayQuestions.length === 0 ? (
              <div className="text-center py-10">
                <h3 className="text-xl font-medium mb-2">
                  Inga svar matchade din sökning
                </h3>
                <p className="text-muted-foreground mb-6">
                  Vi kunde inte hitta några svar på "{searchQuery}". Prova en
                  annan sökfras eller kontakta vår kundtjänst direkt.
                </p>
                <Link href="/kontakt">
                  <Button>Kontakta oss</Button>
                </Link>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {displayQuestions.map((q, idx) => (
                  <AccordionItem key={idx} value={`item-${idx}`}>
                    <AccordionTrigger className="text-left">
                      <span className="font-medium">{q.question}</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="text-muted-foreground whitespace-pre-line">
                        {q.answer}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}

            {/* Contact section */}
            <div className="mt-16 text-center">
              <h2 className="text-2xl font-semibold mb-4">
                Hittar du inte svaret du söker?
              </h2>
              <p className="text-muted-foreground mb-8">
                Vår kundtjänst finns här för att hjälpa dig med alla dina
                frågor.
              </p>
              <Link href="/kontakt">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Kontakta oss
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
