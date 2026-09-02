import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { B2BQuoteRequest, B2BRequestStatus } from '../types';

const B2B_REQUESTS_COLLECTION = 'b2bQuoteRequests';
const LOCAL_B2B_REQUESTS_KEY = 'kalaconnect_b2b_requests_cache';

export const INITIAL_SAMPLE_B2B_REQUESTS: B2BQuoteRequest[] = [
  {
    id: 'b2b-req-001',
    requestId: 'b2b-req-001',
    productId: 'prod-002',
    productName: 'Handcrafted Terracotta Decorative Pot',
    productImage: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80',
    category: 'Kitchenware & Living',
    craftType: 'Traditional Terracotta',
    artisanId: 'sample-artist',
    artisanName: 'Rameshwar Lal Kumhar',
    artisanLocation: 'Sanganer, Jaipur',
    buyerName: 'ABC Handicrafts Pvt Ltd',
    buyerOrg: 'ABC Handicrafts Pvt Ltd',
    buyerLocation: 'Delhi',
    quantity: 50,
    targetPrice: 320,
    deliveryLocation: 'Delhi',
    requiredBy: '2026-09-20',
    message: 'Interested in bulk purchase for our festive corporate gifting order.',
    status: 'New',
    createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
  },
  {
    id: 'b2b-req-002',
    requestId: 'b2b-req-002',
    productId: 'prod-001',
    productName: 'Handcrafted Jaipur Blue Pottery Floral Peacock Vase (10 inch)',
    productImage: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    category: 'Home Decor & Pottery',
    craftType: 'Jaipur Blue Pottery (GI Tagged)',
    artisanId: 'sample-artist',
    artisanName: 'Rameshwar Lal Kumhar',
    artisanLocation: 'Sanganer, Jaipur',
    buyerName: 'FabIndia Craft Sourcing',
    buyerOrg: 'FabIndia Ltd',
    buyerLocation: 'Bengaluru',
    quantity: 40,
    targetPrice: 1100,
    deliveryLocation: 'Bengaluru Distribution Hub',
    requiredBy: '2026-10-01',
    message: 'Curating flagship retail showcase for authentic Blue Pottery.',
    status: 'Offer Sent',
    offeredPrice: 1150,
    offeredDeliveryDays: 12,
    artisanOfferMessage: 'We can supply 40 export-grade packed vases within 12 days at ₹1,150/unit.',
    offeredAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
  }
];

export async function saveB2BRequestToDb(
  requestData: Omit<B2BQuoteRequest, 'id' | 'requestId' | 'createdAt' | 'status'> & {
    id?: string;
    requestId?: string;
    createdAt?: string;
    status?: B2BRequestStatus;
  }
): Promise<B2BQuoteRequest> {
  const reqId = requestData.requestId || requestData.id || `b2b_req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = requestData.createdAt || new Date().toISOString();

  const fullReq: B2BQuoteRequest = {
    ...requestData,
    id: reqId,
    requestId: reqId,
    status: requestData.status || 'New',
    createdAt: now,
  };

  // 1. Firestore attempt
  try {
    const docRef = doc(db, B2B_REQUESTS_COLLECTION, reqId);
    await setDoc(docRef, {
      ...fullReq,
      dbCreatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Firestore B2B request save notice:', err);
  }

  // 2. Local cache
  try {
    const raw = localStorage.getItem(LOCAL_B2B_REQUESTS_KEY);
    const existing: B2BQuoteRequest[] = raw ? JSON.parse(raw) : INITIAL_SAMPLE_B2B_REQUESTS;
    const filtered = existing.filter((r) => r.id !== reqId && r.requestId !== reqId);
    const updated = [fullReq, ...filtered];
    localStorage.setItem(LOCAL_B2B_REQUESTS_KEY, JSON.stringify(updated));
  } catch (cacheErr) {
    console.warn('Local cache B2B request write notice:', cacheErr);
  }

  return fullReq;
}

export async function getB2BRequests(artistId?: string): Promise<B2BQuoteRequest[]> {
  const map = new Map<string, B2BQuoteRequest>();

  // Initialize with initial sample requests if nothing cached
  INITIAL_SAMPLE_B2B_REQUESTS.forEach((r) => map.set(r.id, r));

  // 1. Firestore
  try {
    const colRef = collection(db, B2B_REQUESTS_COLLECTION);
    const snapshot = await getDocs(colRef);
    snapshot.forEach((d) => {
      const data = d.data() as B2BQuoteRequest;
      if (!artistId || data.artisanId === artistId || !data.artisanId) {
        map.set(data.id || data.requestId, data);
      }
    });
  } catch (err) {
    console.warn('Firestore B2B requests fetch notice:', err);
  }

  // 2. Local cache fallback & merge
  try {
    const raw = localStorage.getItem(LOCAL_B2B_REQUESTS_KEY);
    if (raw) {
      const cached: B2BQuoteRequest[] = JSON.parse(raw);
      cached.forEach((r) => {
        if (!artistId || r.artisanId === artistId || !r.artisanId) {
          map.set(r.id || r.requestId, r);
        }
      });
    } else {
      localStorage.setItem(LOCAL_B2B_REQUESTS_KEY, JSON.stringify(INITIAL_SAMPLE_B2B_REQUESTS));
    }
  } catch (cacheErr) {
    console.warn('Local cache B2B request read notice:', cacheErr);
  }

  const list = Array.from(map.values());
  return list.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function updateB2BRequestStatusInDb(
  requestId: string,
  status: B2BRequestStatus,
  offerDetails?: {
    offeredPrice?: number;
    offeredDeliveryDays?: number;
    artisanOfferMessage?: string;
    rejectionReason?: string;
  }
): Promise<void> {
  const updatePayload: Partial<B2BQuoteRequest> & { updatedAt?: any } = {
    status,
    ...(offerDetails?.offeredPrice !== undefined ? { offeredPrice: offerDetails.offeredPrice } : {}),
    ...(offerDetails?.offeredDeliveryDays !== undefined ? { offeredDeliveryDays: offerDetails.offeredDeliveryDays } : {}),
    ...(offerDetails?.artisanOfferMessage ? { artisanOfferMessage: offerDetails.artisanOfferMessage } : {}),
    ...(offerDetails?.rejectionReason ? { rejectionReason: offerDetails.rejectionReason } : {}),
    ...(status === 'Offer Sent' ? { offeredAt: new Date().toISOString() } : {}),
    updatedAt: serverTimestamp(),
  };

  // Firestore update
  try {
    const docRef = doc(db, B2B_REQUESTS_COLLECTION, requestId);
    await updateDoc(docRef, updatePayload);
  } catch (err) {
    console.warn('Firestore update B2B request status notice:', err);
  }

  // Local cache update
  try {
    const raw = localStorage.getItem(LOCAL_B2B_REQUESTS_KEY);
    const cached: B2BQuoteRequest[] = raw ? JSON.parse(raw) : INITIAL_SAMPLE_B2B_REQUESTS;
    const updated = cached.map((r) =>
      r.id === requestId || r.requestId === requestId
        ? {
            ...r,
            status,
            ...(offerDetails?.offeredPrice !== undefined ? { offeredPrice: offerDetails.offeredPrice } : {}),
            ...(offerDetails?.offeredDeliveryDays !== undefined ? { offeredDeliveryDays: offerDetails.offeredDeliveryDays } : {}),
            ...(offerDetails?.artisanOfferMessage ? { artisanOfferMessage: offerDetails.artisanOfferMessage } : {}),
            ...(offerDetails?.rejectionReason ? { rejectionReason: offerDetails.rejectionReason } : {}),
            ...(status === 'Offer Sent' ? { offeredAt: new Date().toISOString() } : {}),
          }
        : r
    );
    localStorage.setItem(LOCAL_B2B_REQUESTS_KEY, JSON.stringify(updated));
  } catch (cacheErr) {
    console.warn('Local cache update B2B request status notice:', cacheErr);
  }
}
