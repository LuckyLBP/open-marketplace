import { ProductImageGallery } from '@/components/product-image-gallery';

const ImageGallerySection = ({ images, title }: { images: any[]; title: string }) => {
    return <ProductImageGallery images={images} title={title} />;
};

export default ImageGallerySection;
