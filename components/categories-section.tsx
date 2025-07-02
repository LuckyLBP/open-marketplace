'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';
import categoriesData from '@/lib/categories.json';

type Category = {
  title: string;
  href: string;
  description: string;
  items: {
    name: string;
    href: string;
  }[];
};

const categoryIcons: Record<string, string> = {
  Elektronik: '📱',
  Mode: '👕',
  Hemmet: '🏠',
  'Hälsa & Skönhet': '💄',
  'Hobby & Fritid': '🎯',
};

const categoryColors: Record<string, string> = {
  Elektronik: 'from-blue-50 to-blue-100 border-blue-200',
  Mode: 'from-pink-50 to-pink-100 border-pink-200',
  Hemmet: 'from-green-50 to-green-100 border-green-200',
  'Hälsa & Skönhet': 'from-purple-50 to-purple-100 border-purple-200',
  'Hobby & Fritid': 'from-orange-50 to-orange-100 border-orange-200',
};

export function CategoriesSection() {
  const { t } = useLanguage();
  const [categories] = useState<Category[]>(categoriesData.categories);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Populära kategorier</h2>
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
          {categories.slice(0, 5).map((category, index) => (
            <Link key={category.title} href={category.href} className="group">
              <div
                className={`bg-gradient-to-br ${
                  categoryColors[category.title] ||
                  'from-gray-50 to-gray-100 border-gray-200'
                } rounded-xl p-6 text-center transition-all duration-300 group-hover:shadow-lg group-hover:scale-105 border`}
              >
                <div className="text-4xl mb-3">
                  {categoryIcons[category.title] || '📦'}
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  {category.title}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {category.description}
                </p>
                <div className="mt-3 text-xs text-purple-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  {category.items.length} underkategorier
                </div>
              </div>
            </Link>
          ))}
        </div>     
      </div>
    </section>
  );
}
