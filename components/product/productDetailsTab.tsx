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
                    <TabsTrigger value="specifications">{t('Specifications')}</TabsTrigger>
                    <TabsTrigger value="reviews">{t('Reviews')}</TabsTrigger>
                </TabsList>
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
                    <TabsContent value="description" className="space-y-4">
                        <h2 className="text-2xl font-bold mb-4">{t('Product Description')}</h2>
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
                    <TabsContent value="reviews">
                        <h2 className="text-2xl font-bold mb-4">{t('Customer Reviews')}</h2>
                        <div className="flex items-center mb-6">
                            <div className="flex mr-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} className={cn('h-5 w-5', star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300')} />
                                ))}
                            </div>
                            <span className="text-lg font-medium">4.0</span>
                            <span className="text-muted-foreground ml-2">({t('24 reviews')})</span>
                        </div>
                        <div className="space-y-6">
                            <div className="border-b pb-6">
                                <h3 className="font-medium mb-1">Great product, highly recommend!</h3>
                                <p className="text-muted-foreground">
                                    I've been using this for a month now and I'm very impressed with the quality.
                                </p>
                            </div>
                            <div className="border-b pb-6">
                                <h3 className="font-medium mb-1">Good but could be better</h3>
                                <p className="text-muted-foreground">
                                    Works well overall, but I had some issues with the Bluetooth connection.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium mb-1">Decent but overpriced</h3>
                                <p className="text-muted-foreground">
                                    Decent, but I think it's a bit overpriced for what it offers.
                                </p>
                            </div>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
};

export default ProductDetailsTabs;