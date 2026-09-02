import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { compressDataUrl } from '../utils/imageCompression';
import { INITIAL_PRODUCTS } from '../data/mockData';

const PRODUCTS_COLLECTION = 'products';
export const CANONICAL_PRODUCTS_KEY = 'kalaconnect_canonical_products_inventory';
const LOCAL_PRODUCTS_KEY = 'kalaconnect_artisan_products_cache';

// Helper to get all local canonical products with auto-migration from legacy caches
function getCanonicalLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(CANONICAL_PRODUCTS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // Auto-migrate from any legacy per-user caches
    const canonicalMap = new Map<string, Product>();
    INITIAL_PRODUCTS.forEach((p) => canonicalMap.set(p.id, p));

    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith(LOCAL_PRODUCTS_KEY) || k.startsWith('kalaconnect_artisan_products_'))) {
        try {
          const item = localStorage.getItem(k);
          if (item) {
            const arr = JSON.parse(item);
            if (Array.isArray(arr)) {
              arr.forEach((p: Product) => {
                if (p && p.id) {
                  canonicalMap.set(p.id, {
                    ...p,
                    artisanId: p.artisanId || p.userId || 'sample-artist',
                    userId: p.userId || p.artisanId || 'sample-artist',
                    publishedToB2B: p.publishedToB2B ?? p.isB2BListed ?? (p.status === 'published'),
                    isB2BListed: p.isB2BListed ?? p.publishedToB2B ?? (p.status === 'published'),
                    status: p.status || 'published',
                  });
                }
              });
            }
          }
        } catch (_) {}
      }
    }

    const merged = Array.from(canonicalMap.values());
    localStorage.setItem(CANONICAL_PRODUCTS_KEY, JSON.stringify(merged));
    return merged;
  } catch (err) {
    console.warn('Error reading canonical local products:', err);
    return INITIAL_PRODUCTS;
  }
}

// Helper to write canonical local products
function saveCanonicalLocalProducts(products: Product[]): void {
  try {
    localStorage.setItem(CANONICAL_PRODUCTS_KEY, JSON.stringify(products));
  } catch (err) {
    console.warn('Error saving canonical local products:', err);
  }
}

// 1. Canonical Fetch: Fetch ALL products from the single canonical data source
export async function getAllProducts(): Promise<Product[]> {
  const productsMap = new Map<string, Product>();

  // Initialize with local canonical products
  const localList = getCanonicalLocalProducts();
  localList.forEach((p) => productsMap.set(p.id, p));

  // Fetch from Firestore collection 'products'
  try {
    const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    snapshot.forEach((d) => {
      const data = d.data() as Product;
      if (data && data.id) {
        productsMap.set(data.id, {
          ...data,
          artisanId: data.artisanId || data.userId || 'sample-artist',
          userId: data.userId || data.artisanId || 'sample-artist',
          publishedToB2B: data.publishedToB2B ?? data.isB2BListed ?? (data.status === 'published'),
          isB2BListed: data.isB2BListed ?? data.publishedToB2B ?? (data.status === 'published'),
          status: data.status || 'published',
        });
      }
    });
  } catch (err: any) {
    console.warn('Firestore canonical products fetch notice:', err);
  }

  const list = Array.from(productsMap.values());
  list.sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );

  // Keep local store synchronized
  saveCanonicalLocalProducts(list);
  return list;
}

// 2. Fetch User Products (returns canonical products so all parts of the app stay in sync)
export async function getUserProducts(userId?: string): Promise<Product[]> {
  return getAllProducts();
}

// 3. Fetch B2B Marketplace Products (status === 'published' && (publishedToB2B === true || isB2BListed === true))
export async function getB2BMarketplaceProducts(): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter(
    (p) =>
      p.status === 'published' &&
      (p.publishedToB2B === true || p.isB2BListed === true || (p.wholesalePrice !== undefined && p.wholesalePrice > 0))
  );
}

// 4. Save or update product in the canonical data source (Firestore + Local Store)
export async function saveProductToDb(
  userId: string,
  productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; userId?: string; artisanId?: string; createdAt?: string }
): Promise<Product> {
  const prodId = productData.id || `prod_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const now = new Date().toISOString();
  const effectiveArtisanId = productData.artisanId || productData.userId || userId || 'sample-artist';

  // Compress images to ensure payload is comfortably under Firestore 1MB document limit
  let originalImage = productData.originalImage || productData.image || '';
  let enhancedImage = productData.enhancedImage || productData.originalImage || productData.image || '';

  try {
    if (originalImage && originalImage.startsWith('data:')) {
      originalImage = await compressDataUrl(originalImage, 1000, 0.75);
    }
    if (enhancedImage && enhancedImage.startsWith('data:')) {
      enhancedImage = await compressDataUrl(enhancedImage, 1000, 0.75);
    }
  } catch (compErr) {
    console.warn('Image compression warning:', compErr);
  }

  const retailPrice = productData.actualPrice || productData.retailPrice || productData.suggestedPrice || 0;
  const wholesalePrice = productData.wholesalePrice || productData.b2bWholesalePrice || Math.round((retailPrice || 1000) * 0.75);
  const moq = productData.moq || productData.wholesaleMOQ || productData.b2bMOQ || 5;
  const stock = productData.stock || productData.b2bStock || productData.inventory || 10;
  const isPublished = productData.status === 'published';
  const publishedToB2B = productData.publishedToB2B !== undefined ? productData.publishedToB2B : (productData.isB2BListed !== undefined ? productData.isB2BListed : isPublished);
  const isB2BListed = productData.isB2BListed !== undefined ? productData.isB2BListed : publishedToB2B;

  const canonicalProduct: Product = {
    ...productData,
    id: prodId,
    artisanId: effectiveArtisanId,
    userId: effectiveArtisanId,
    originalImage,
    enhancedImage,
    image: enhancedImage || originalImage,
    retailPrice,
    actualPrice: retailPrice,
    suggestedPrice: productData.suggestedPrice || retailPrice,
    wholesalePrice,
    b2bWholesalePrice: wholesalePrice,
    moq,
    wholesaleMOQ: moq,
    b2bMOQ: moq,
    stock,
    inventory: stock,
    b2bStock: stock,
    status: productData.status || 'published',
    publishedToB2B,
    isB2BListed,
    createdAt: productData.createdAt || now,
    updatedAt: now,
  };

  // 1. Save to Cloud Firestore
  try {
    const prodRef = doc(db, PRODUCTS_COLLECTION, prodId);
    await setDoc(prodRef, {
      ...canonicalProduct,
      dbCreatedAt: serverTimestamp(),
      dbUpdatedAt: serverTimestamp(),
    });
  } catch (err: any) {
    console.warn('Firestore write warning, caching product locally in canonical store:', err);
  }

  // 2. Update canonical local store
  try {
    const existing = getCanonicalLocalProducts();
    const filtered = existing.filter((p) => p.id !== prodId);
    const updated = [canonicalProduct, ...filtered];
    saveCanonicalLocalProducts(updated);

    // Also update legacy per-user key for compatibility
    const legacyKey = `${LOCAL_PRODUCTS_KEY}_${effectiveArtisanId}`;
    localStorage.setItem(legacyKey, JSON.stringify(updated));
  } catch (cacheErr) {
    console.warn('Local cache write notice:', cacheErr);
  }

  return canonicalProduct;
}

// 5. Delete product from canonical data source
export async function deleteProductFromDb(productId: string, userId?: string): Promise<void> {
  const effectiveUserId = userId || 'sample-artist';

  // 1. Delete from Firestore
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
  } catch (err) {
    console.warn('Firestore delete notice:', err);
  }

  // 2. Delete from Canonical Local Store
  try {
    const existing = getCanonicalLocalProducts();
    const filtered = existing.filter((p) => p.id !== productId);
    saveCanonicalLocalProducts(filtered);

    // Also update legacy key
    const legacyKey = `${LOCAL_PRODUCTS_KEY}_${effectiveUserId}`;
    localStorage.setItem(legacyKey, JSON.stringify(filtered));
  } catch (cacheErr) {
    console.error('Local canonical cache delete error:', cacheErr);
    throw cacheErr;
  }
}

