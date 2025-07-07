import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductSpecifications } from '@/components/product-specifications';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const ProductDetailsTabs = ({ description, specifications, t }: any) => {
    return (
        <div className="mt-12">
            <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-none lg:flex">
                    <TabsTrigger value="description">{t('Description')}</TabsTrigger>
                    <TabsTrigger value="specifications">{t('Specifikation')}</TabsTrigger>
                </TabsList>
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
                    <TabsContent value="description" className="space-y-4">
                        <h2 className="text-2xl font-bold mb-4">{t('Produktdetaljer')}</h2>
                        <div className="prose max-w-none">
                            <p className="text-muted-foreground whitespace-pre-line">{description}</p>
                        </div>
                    </TabsContent>
                    <TabsContent value="specifications">
                        <h2 className="text-2xl font-bold mb-4">{t('Product Specifications')}</h2>
                        {specifications && specifications.length > 0 ? (
                            <ProductSpecifications specifications={specifications} />
                        ) : (
                            <p className="text-muted-foreground">{t('No specifications available for this product.')}</p>
                        )}
                    </TabsContent>
                    
                </div>
            </Tabs>
        </div>
    );
};

export default ProductDetailsTabs;