'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useToast } from '@/components/ui/use-toast';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import Link from 'next/link';

export default function KontaktPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orderNumber: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      subject: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: 'Meddelande skickat',
        description: 'Vi återkommer till dig så snart som möjligt.',
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        orderNumber: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      toast({
        title: 'Det uppstod ett fel',
        description: 'Kunde inte skicka meddelandet. Försök igen senare.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-b from-purple-50 to-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Kontakta oss
            </h1>
            <p className="text-xl text-gray-600 mb-2 max-w-2xl mx-auto">
              Har du frågor eller funderingar? Vi finns här för att hjälpa dig.
            </p>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Ring oss</h3>
                <p className="text-gray-500 mb-4">Mån-Fre 09:00-17:00</p>
                <a
                  href="tel:+46101234567"
                  className="text-purple-600 font-medium hover:text-purple-800"
                >
                  010-123 45 67
                </a>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Maila oss</h3>
                <p className="text-gray-500 mb-4">Vi svarar inom 24 timmar</p>
                <a
                  href="mailto:kundservice@Marknadsplatsen.se"
                  className="text-purple-600 font-medium hover:text-purple-800"
                >
                  kundservice@Marknadsplatsen.se
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form and Map */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              <div>
                <h2 className="text-2xl font-bold mb-6">Kontaktformulär</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium mb-1"
                    >
                      Ditt namn *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Ange ditt namn"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-1"
                    >
                      E-postadress *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Ange din e-postadress"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="orderNumber"
                      className="block text-sm font-medium mb-1"
                    >
                      Ordernummer (om tillämpligt)
                    </label>
                    <Input
                      id="orderNumber"
                      name="orderNumber"
                      value={formData.orderNumber}
                      onChange={handleChange}
                      placeholder="T.ex. DM12345"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium mb-1"
                    >
                      Ärende *
                    </label>
                    <Select
                      value={formData.subject}
                      onValueChange={handleSelectChange}
                      required
                    >
                      <SelectTrigger id="subject">
                        <SelectValue placeholder="Välj ett ärende" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="order">
                          Frågor om beställning
                        </SelectItem>
                        <SelectItem value="delivery">Leveransstatus</SelectItem>
                        <SelectItem value="return">
                          Returer & Återbetalningar
                        </SelectItem>
                        <SelectItem value="product">Produktfrågor</SelectItem>
                        <SelectItem value="account">Kontofrågor</SelectItem>
                        <SelectItem value="other">Övrigt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium mb-1"
                    >
                      Meddelande *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder="Beskriv ditt ärende så detaljerat som möjligt"
                      rows={5}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Skickar...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Send className="mr-2 h-4 w-4" />
                        Skicka meddelande
                      </span>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 mt-2">
                    Genom att skicka detta formulär godkänner du vår{' '}
                    <Link
                      href="/privacy"
                      className="underline hover:text-purple-600"
                    >
                      integritetspolicy
                    </Link>
                  </p>
                </form>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-6">Hitta till oss</h2>
                <div className="rounded-lg overflow-hidden shadow-md mb-6">
                  <iframe
                    title="Marknadsplatsen Kontor"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2034.7891407539868!2d18.0669701!3d59.3349881!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x465f9d5ca0da5ed5%3A0x22e38f47046118d0!2sStockholm!5e0!3m2!1ssv!2sse!4v1649499900000!5m2!1ssv!2sse"
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                  ></iframe>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-start mb-4">
                    <MapPin className="h-5 w-5 mr-3 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold">Besöksadress</h3>
                      <p className="text-gray-600">
                        Marknadsplatsen AB
                        <br />
                        Sveavägen 123
                        <br />
                        113 50 Stockholm
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 mr-3 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold">Öppettider</h3>
                      <p className="text-gray-600">
                        Måndag-Fredag: 09:00-17:00
                        <br />
                        Lördag-Söndag: Stängt
                        <br />
                        Helgdagar: Stängt
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 text-center">
              Vanliga frågor
            </h2>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    Hur spårar jag min beställning?
                  </AccordionTrigger>
                  <AccordionContent>
                    För att spåra din beställning, logga in på ditt konto och gå
                    till "Mina beställningar". Där hittar du en spårningslänk
                    för varje skickad beställning. Alternativt kan du klicka på
                    spårningslänken i orderbekräftelsemeddelandet som skickades
                    till din e-post.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>
                    Hur returnerar jag en vara?
                  </AccordionTrigger>
                  <AccordionContent>
                    Du kan returnera en vara inom 14 dagar efter leverans. Logga
                    in på ditt konto, gå till "Mina beställningar" och välj
                    "Returnera". Följ instruktionerna för att skapa en
                    retursedel. Packa varan i originalförpackningen om möjligt,
                    bifoga retursedeln och lämna in paketet hos närmaste ombud.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>
                    Hur lång är leveranstiden?
                  </AccordionTrigger>
                  <AccordionContent>
                    Leveranstiden beror på vilken leveransmetod du valt vid
                    kassan. Standard leverans tar vanligtvis 1-3 arbetsdagar
                    inom Sverige. Express leverans är oftast framme nästa
                    arbetsdag om beställningen görs innan kl 12:00.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>
                    Kan jag ändra min beställning?
                  </AccordionTrigger>
                  <AccordionContent>
                    Du kan endast ändra din beställning om den inte har börjat
                    bearbetas. Kontakta vår kundtjänst omedelbart via telefon
                    eller mail för snabbast hjälp. Efter att beställningen har
                    börjat bearbetas kan vi tyvärr inte göra ändringar.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>
                    Vilka betalningsmetoder accepterar ni?
                  </AccordionTrigger>
                  <AccordionContent>
                    Vi accepterar följande betalningsmetoder: kreditkort (Visa,
                    Mastercard), Swish, direktbetalning via bank, och faktura
                    via Klarna. Alla transaktioner är säkra och krypterade.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="mt-8 text-center">
                <Link href="/faq">
                  <Button variant="outline">Se alla vanliga frågor</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 md:p-10 text-white">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Prenumerera på vårt nyhetsbrev
                </h2>
                <p className="text-lg opacity-90 mb-6">
                  Få exklusiva erbjudanden och uppdateringar direkt i din inbox
                </p>
                <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="Din e-postadress"
                    className="bg-white/90 border-0 text-gray-800 placeholder:text-gray-500"
                    required
                  />
                  <Button className="bg-white text-purple-600 hover:bg-gray-100">
                    Prenumerera
                  </Button>
                </form>
                <p className="text-xs opacity-75 mt-4">
                  Genom att prenumerera godkänner du att få marknadsföringsmejl
                  från oss. Du kan avsluta prenumerationen när som helst.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
