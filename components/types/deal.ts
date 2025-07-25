export interface ProductImage {
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

export interface Feature {
  id: string;
  text: string;
}

export interface Specification {
  id: string;
  key: string;
  value: string;
}

export type Deal = {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  duration: number;

  images: ProductImage[];
  imageUrl?: string;

  companyId: string;        
  companyName: string;

  category: string;
  subcategory?: string;

  feePercentage: number;

  createdAt: Date;
  expiresAt: Date;

  boostStart?: Date;
  boostEnd?: Date;
  boostType?: string;

  specifications?: Specification[];
  features?: Feature[];

  inStock?: boolean;
  stockQuantity?: number;
  sku?: string;

  accountType: 'company' | 'customer';
  role?: string;
};
