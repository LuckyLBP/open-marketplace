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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div>
            <h3 className="text-2xl font-bold mb-2">{t('Stay Updated')}</h3>
            <p className="text-gray-400 mb-4">
              {t('Subscribe to our newsletter for exclusive deals and updates')}
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input
                type="email"
                placeholder={t('Your email address')}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-purple-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {t('Subscribe')}
              </Button>
            </form>
          </div>
          <div className="flex flex-col md:items-end justify-center">
            <div className="flex items-center mb-4">
              <div className="relative h-10 w-10 mr-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-xl">
                D
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                DealsMarket
              </span>
            </div>
            <p className="text-gray-400 md:text-right">
              {t('The best marketplace for limited-time deals')}
            </p>
          </div>
        </div>

        <Separator className="bg-gray-800 my-8" />

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="font-semibold text-lg mb-4">{t('Shop')}</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/marketplace"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t('All Products')}
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace?category=electronics"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t('Electronics')}
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace?category=clothing"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t('Clothing')}
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace?category=home"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t('Home & Garden')}
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace?category=beauty"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t('Beauty & Health')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4">{t('Company')}</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/om-oss"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t('Om oss')}
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t('Blog')}
                </Link>
              </li>
              <li>
                <Link
                  href="/partners"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t('Partners')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4">{t('Support')}</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/kontakt"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t('Kontakta oss')}
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t('FAQ')}
                </Link>
              </li>
              <li>
                <Link
                  href="/frakt"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t('Frakt')}
                </Link>
              </li>
              <li>
                <Link
                  href="/returer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t('Returer')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4">{t('Legal')}</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/anvandarvillkor"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t('Användarvillkor')}
                </Link>
              </li>
              <li>
                <Link
                  href="/sekretesspolicy"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t('Sekretesspolicy')}
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t('Cookie Policy')}
                </Link>
              </li>
              <li>
                <Link
                  href="/compliance"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t('Compliance')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact and Social */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Link
              href="/contact"
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <Mail className="h-5 w-5 mr-2" />
              <span>support@dealsmarket.com</span>
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

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>
            © {currentYear} DealsMarket. {t('All rights reserved.')}
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-4 md:mt-0">
            <Link
              href="/accessibility"
              className="hover:text-gray-300 transition-colors"
            >
              {t('Accessibility')}
            </Link>
            <Link
              href="/sitemap"
              className="hover:text-gray-300 transition-colors"
            >
              {t('Sitemap')}
            </Link>
            <Link
              href="/responsible-disclosure"
              className="hover:text-gray-300 transition-colors"
            >
              {t('Responsible Disclosure')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
