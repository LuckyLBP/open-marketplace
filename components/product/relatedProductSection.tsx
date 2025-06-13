import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

const RelatedProductsSection = ({ t }: { t: any }) => {
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">{t('You May Also Like')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden transition-all hover:shadow-lg h-full flex flex-col group">
            <Link href="#" className="group">
              <div className="aspect-video w-full overflow-hidden bg-gray-100">
                <img
                  src={`https://picsum.photos/seed/${i}/400/300`}
                  alt={`Related Product ${i}`}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
            </Link>
            <CardHeader className="pb-2">
              <Link href="#">
                <CardTitle className="line-clamp-1 hover:text-purple-600 transition-colors">
                  {t('Related Product')} {i}
                </CardTitle>
              </Link>
            </CardHeader>
            <CardContent className="pb-2 flex-grow">
              <p className="line-clamp-2 text-sm text-muted-foreground mb-4">
                {t('This is a related product that you might be interested in.')}
              </p>
              <div className="text-xl font-bold">
                {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(499 + i * 100)}
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <ShoppingCart className="h-4 w-4 mr-2" />
                {t('View Product')}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RelatedProductsSection;
