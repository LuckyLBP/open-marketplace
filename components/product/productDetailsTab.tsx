import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductSpecifications } from '@/components/product-specifications';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const ProductDetailsTabs = ({ description, specifications, t }: any) => {
  return (
    <div className="mt-10">
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="space-x-2 mb-4">
          <TabsTrigger value="description">{t('Detaljer')}</TabsTrigger>
          <TabsTrigger value="specifications">{t('Specifikation')}</TabsTrigger>
        </TabsList>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <TabsContent value="description" className="space-y-4">
            <h2 className="text-lg font-semibold">{t('Produktdetaljer')}</h2>
            <div className="prose max-w-none">
              <p className="text-muted-foreground whitespace-pre-line">
                {description}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="specifications">
            <h2 className="text-lg font-semibold">{t('Specifikationer')}</h2>
            <div className="mt-2">
              {specifications && specifications.length > 0 ? (
                <ProductSpecifications specifications={specifications} />
              ) : (
                <p className="text-muted-foreground">
                  {t('Inga specifikationer finns för denna produkt.')}
                </p>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ProductDetailsTabs;
