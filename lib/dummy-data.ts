import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Categories and subcategories
const categories = [
  'elektronik',
  'mode',
  'hemmet',
  'halsa-skonhet',
  'hobby-fritid',
  'annat', // Changed from 'other' to 'annat'
];

// Subcategories
const subcategories = {
  elektronik: [
    'mobiltelefoner',
    'datorer',
    'ljud-bild',
    'wearables',
    'tillbehor',
  ],
  mode: ['herr', 'dam', 'barn', 'skor', 'vaska', 'accessoarer'],
  hemmet: ['mobler', 'inredning', 'kok', 'tradgard', 'belysning'],
  'halsa-skonhet': ['hudvard', 'makeup', 'harvard', 'dofter', 'valmaende'],
  'hobby-fritid': ['sport', 'bocker', 'spel-konsol', 'utomhus', 'handarbete'],
  annat: ['mat', 'dryck', 'present', 'ovrigt'], // Changed from 'other' to 'annat'
};

// Dummy company IDs - replace with actual company IDs if available
const dummyCompanyIds = ['company1', 'company2', 'company3'];

// Dummy product data
const dummyProducts = [
  {
    title: 'Premium Bluetooth Hörlurar',
    description:
      'Trådlösa hörlurar med aktiv brusreducering, 30 timmars batteritid och kristallklart ljud. Perfekt för musik, samtal och gaming.',
    price: 1299,
    originalPrice: 1599, // Added original price
    category: 'elektronik',
    subcategory: 'tillbehor',
    imageUrl:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    inStock: true,
    stockQuantity: 15,
    sku: 'HEADPH-001',
  },
  {
    title: 'Smart Fitness Klocka',
    description:
      'Håll koll på din hälsa med denna smarta klocka. Spårar steg, sömn, puls och har över 20 sportlägen. Vattentät och med lång batteritid.',
    price: 899,
    originalPrice: 1199, // Added original price
    category: 'elektronik',
    subcategory: 'wearables',
    imageUrl:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    inStock: true,
    stockQuantity: 8,
    sku: 'WATCH-002',
  },
  {
    title: 'Ekologisk Bomullströja',
    description:
      'Mjuk och bekväm tröja tillverkad av 100% ekologisk bomull. Perfekt för vardagsbruk och finns i flera färger.',
    price: 399,
    originalPrice: 499, // Added original price
    category: 'mode',
    subcategory: 'herr',
    imageUrl:
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    inStock: true,
    stockQuantity: 25,
    sku: 'SHIRT-003',
  },
  {
    title: 'Designerlampan Glow',
    description:
      'Modern bordslampa med justerbar ljusstyrka och färgtemperatur. Tidlös design som passar i alla hem.',
    price: 799,
    originalPrice: 999, // Added original price
    category: 'hemmet',
    subcategory: 'belysning',
    imageUrl:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    inStock: true,
    stockQuantity: 12,
    sku: 'LAMP-004',
  },
  {
    title: 'Lyxigt Ansiktsserum',
    description:
      'Anti-age serum med hyaluronsyra och vitamin C. Ger synbart resultat efter bara några veckors användning.',
    price: 599,
    originalPrice: 799, // Added original price
    category: 'halsa-skonhet',
    subcategory: 'hudvard',
    imageUrl:
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    inStock: true,
    stockQuantity: 20,
    sku: 'SERUM-005',
  },
  {
    title: 'Professionell Yogamatta',
    description:
      'Halkfri yogamatta av högsta kvalitet. Perfekt för alla typer av yoga och träning. Lätt att rengöra och transportera.',
    price: 499,
    originalPrice: 649, // Added original price
    category: 'hobby-fritid',
    subcategory: 'sport',
    imageUrl:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    inStock: true,
    stockQuantity: 18,
    sku: 'YOGA-006',
  },
  {
    title: 'Strategiskt Brädspel',
    description:
      'Utmanande strategispel för 2-6 spelare. Perfekt för spelkvällar med familj och vänner. Rekommenderas från 10 år.',
    price: 349,
    originalPrice: 449, // Added original price
    category: 'hobby-fritid',
    subcategory: 'spel-konsol',
    imageUrl:
      'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    inStock: true,
    stockQuantity: 7,
    sku: 'GAME-007',
  },
  {
    title: 'Gourmet Chokladask',
    description:
      'Handgjorda praliner i lyxig presentförpackning. Innehåller 24 olika smaker av högsta kvalitet.',
    price: 249,
    originalPrice: 299, // Added original price
    category: 'annat', // Changed from 'other' to 'annat'
    subcategory: 'mat',
    imageUrl:
      'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    inStock: true,
    stockQuantity: 30,
    sku: 'CHOC-008',
  },
  {
    title: 'Trådlös Laddare',
    description:
      'Snabb trådlös laddare kompatibel med alla moderna smartphones. Elegant design och LED-indikator.',
    price: 299,
    originalPrice: 399, // Added original price
    category: 'elektronik',
    subcategory: 'mobiltelefoner',
    imageUrl:
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    inStock: true,
    stockQuantity: 22,
    sku: 'CHARGE-009',
  },
  {
    title: 'Vattentät Ryggsäck',
    description:
      'Rymlig och slitstark ryggsäck perfekt för både vardagsbruk och äventyr. Flera fack och laptop-ficka.',
    price: 699,
    originalPrice: 899, // Added original price
    category: 'mode',
    subcategory: 'vaska',
    imageUrl:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    inStock: true,
    stockQuantity: 14,
    sku: 'BACKP-010',
  },
  {
    title: 'Aromaterapi Diffuser',
    description:
      'Stilren diffuser som sprider behagliga dofter i ditt hem. Har även färgskiftande ljus och timer-funktion.',
    price: 449,
    originalPrice: 599, // Added original price
    category: 'hemmet',
    subcategory: 'inredning',
    imageUrl:
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    inStock: true,
    stockQuantity: 9,
    sku: 'DIFF-011',
  },
  {
    title: 'Organisk Hudvårdsset',
    description:
      'Komplett hudvårdsrutin med rengöring, toner, serum och fuktkräm. Tillverkad av ekologiska ingredienser.',
    price: 899,
    originalPrice: 1199, // Added original price
    category: 'halsa-skonhet',
    subcategory: 'hudvard',
    imageUrl:
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    inStock: true,
    stockQuantity: 16,
    sku: 'SKIN-012',
  },
];

export async function generateDummyProducts() {
  try {
    // Check if there are any existing products
    const snapshot = await getDocs(collection(db, 'deals'));

    if (!snapshot.empty) {
      console.log(
        'Database already has products, skipping dummy data generation'
      );
      return false;
    }

    console.log('Generating dummy products...');

    // Create dummy companies if they don't exist
    for (const companyId of dummyCompanyIds) {
      await addDoc(collection(db, 'companies'), {
        companyId,
        companyName: `Company ${companyId.slice(-1)}`,
        email: `company${companyId.slice(-1)}@example.com`,
        createdAt: serverTimestamp(),
      });
    }

    // Add dummy products
    for (const product of dummyProducts) {
      // Random duration: 12, 24, or 48 hours
      const durations = [12, 24, 48];
      const duration = durations[Math.floor(Math.random() * durations.length)];

      // Calculate fee percentage based on duration
      let feePercentage;
      switch (duration) {
        case 12:
          feePercentage = 3;
          break;
        case 24:
          feePercentage = 4;
          break;
        case 48:
          feePercentage = 5;
          break;
        default:
          feePercentage = 3;
      }

      // Calculate expiration time
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + duration);

      // Random company
      const companyId =
        dummyCompanyIds[Math.floor(Math.random() * dummyCompanyIds.length)];

      await addDoc(collection(db, 'deals'), {
        title: product.title,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        duration,
        imageUrl: product.imageUrl,
        companyId,
        feePercentage,
        category: product.category,
        subcategory: product.subcategory || null,
        inStock: product.inStock,
        stockQuantity: product.stockQuantity,
        sku: product.sku,
        expiresAt: Timestamp.fromDate(expiresAt),
        createdAt: serverTimestamp(),
      });
    }

    console.log('Dummy products generated successfully');
    return true;
  } catch (error) {
    console.error('Error generating dummy products:', error);
    return false;
  }
}
