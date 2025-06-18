'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

const RelatedProducts = () => {
  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6">Du kanske också gillar</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-md overflow-hidden group"
          >
            <Link href={`/product/related-${i}`}>
              <div className="aspect-square relative overflow-hidden bg-gray-100">
                <Image
                  src={`https://picsum.photos/seed/${i + 10}/300/300`}
                  alt={`Relaterad Produkt ${i}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2">
                  <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                    24h
                  </span>
                </div>
              </div>
            </Link>
            <div className="p-4">
              <Link href={`/product/related-${i}`}>
                <h3 className="font-medium mb-1 line-clamp-1 group-hover:text-purple-600 transition-colors">
                  Produkt {i}
                </h3>
              </Link>
              <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                En produkt du kanske är intresserad av baserat på dina val.
              </p>
              <div className="flex justify-between items-center">
                <span className="font-bold">
                  {new Intl.NumberFormat('sv-SE', {
                    style: 'currency',
                    currency: 'SEK',
                  }).format(300 + i * 100)}
                </span>
                <Button size="sm" variant="outline">
                  Lägg i varukorg
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
