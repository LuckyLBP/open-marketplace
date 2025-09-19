'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';
import categoriesData from '@/lib/categories.json';
import Image from 'next/image';

type Category = {
  title: string;
  href: string;
  description: string;
  items: {
    name: string;
    href: string;
  }[];
};

export function CategoriesSection() {
  const { t } = useLanguage();
  const [categories] = useState<Category[]>(categoriesData.categories);

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-extrabold mb-2">
              Populära kategorier
            </h2>
            <p className="text-gray-600">
              Utforska våra mest populära produktkategorier
            </p>
          </div>
          <Link
            href="/marketplace"
            className="text-purple-600 hover:text-purple-800 flex items-center font-medium transition-colors"
          >
            Visa alla kategorier
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.slice(0, 5).map((category) => (
            <Link key={category.title} href={category.href} className="group">
              <div className="rounded-xl overflow-hidden shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:scale-105">
                <div className="bg-gray-100 flex items-center justify-center h-40">
                  <Image
                    src={`/assets/category-section/${category.title}.png`}
                    alt={category.title}
                    width={500}
                    height={500}
                    className="object-contain w-full h-full"
                  />
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 pw-4 pb-1 text-center">
                  <h3 className=" text-white text-md text-center">
                    {category.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
