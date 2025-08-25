'use client';

import type React from 'react';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/language-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Mail,
} from 'lucide-react';

export function Footer() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    alert(`Subscribed with email: ${email}`);
    setEmail('');
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-950 text-gray-200">
      {/* Newsletter Section */}
      <div className="container mx-auto px-4 pt-16 pb-8">
        {/* Main Footer Links - Keep the original hrefs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="font-semibold text-lg mb-4">Marknadsplats</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/marketplace"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Alla produkter
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace?category=elektronik"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Elektronik
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace?category=mode"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Mode
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace?category=hemmet"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Hemmet
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace?category=halsa-skonhet"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Hälsa & Skönhet
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace?category=hobby-fritid"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Hobby & Fritid
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4">ClickFynd.se</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/om-oss"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Om oss
                </Link>
              </li>

              <li>
                <Link
                  href="/partners"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Samarbetspartners
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4">Kundtjänst</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/kundtjanst/kontakt"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Kontakta oss
                </Link>
              </li>
              <li>
                <Link
                  href="/kundtjanst/faq"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Vanliga frågor
                </Link>
              </li>
              <li>
                <Link
                  href="/policys/frakt"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Frakt
                </Link>
              </li>
              <li>
                <Link
                  href="/policys/returer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Returer
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4">Policys</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/policys/anvandarvillkor"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Användarvillkor
                </Link>
              </li>
              <li>
                <Link
                  href="/policys/sekretesspolicy"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Sekretesspolicy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact and Social - Keep the original href */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Link
              href="/contact"
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <Mail className="h-5 w-5 mr-2" />
              <span>kundservice@ClickFynd.se.se</span>
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Facebook className="h-5 w-5" />
              <span className="sr-only">Facebook</span>
            </Link>
            <Link
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </Link>
            <Link
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </Link>
            <Link
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Youtube className="h-5 w-5" />
              <span className="sr-only">YouTube</span>
            </Link>
          </div>
        </div>

        <Separator className="bg-gray-800 my-8" />

        {/* Bottom Footer - Keep the original href */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>© {currentYear} ClickFynd.se. Alla rättigheter förbehållna.</p>
          <div className="flex flex-wrap justify-center gap-4 mt-4 md:mt-0">
            <Link
              href="/accessibility"
              className="hover:text-gray-300 transition-colors"
            >
              Tillgänglighet
            </Link>
            <Link
              href="/sitemap"
              className="hover:text-gray-300 transition-colors"
            >
              Sidkarta
            </Link>
            <Link
              href="/responsible-disclosure"
              className="hover:text-gray-300 transition-colors"
            >
              Ansvarsfullt avslöjande
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
