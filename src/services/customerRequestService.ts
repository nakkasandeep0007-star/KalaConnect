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
import { CustomerRequest, RequestStatus } from '../types';

const REQUESTS_COLLECTION = 'customerRequests';
const LOCAL_REQUESTS_KEY = 'kalaconnect_customer_requests_cache';

export async function saveCustomerRequestToDb(
  artistId: string,
  requestData: Omit<CustomerRequest, 'id' | 'artistId' | 'requestedAt'> & { id?: string }
): Promise<CustomerRequest> {
  const reqId = requestData.id || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const fullReq: CustomerRequest = {
    ...requestData,
    id: reqId,
    artistId,
    requestedAt: now,
  };

  try {
    const docRef = doc(db, REQUESTS_COLLECTION, reqId);
    await setDoc(docRef, {
      ...fullReq,
      dbCreatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Firestore request save notice:', err);
  }

  // Local cache
  try {
    const cacheKey = `${LOCAL_REQUESTS_KEY}_${artistId}`;
    const raw = localStorage.getItem(cacheKey);
    const existing: CustomerRequest[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter((r) => r.id !== reqId);
    const updated = [fullReq, ...filtered];
    localStorage.setItem(cacheKey, JSON.stringify(updated));
  } catch (cacheErr) {
    console.warn('Local cache request write notice:', cacheErr);
  }

  return fullReq;
}

export async function getArtistRequests(artistId: string): Promise<CustomerRequest[]> {
  const map = new Map<string, CustomerRequest>();

  // 1. Firestore
  try {
    const q = query(
      collection(db, REQUESTS_COLLECTION),
      where('artistId', '==', artistId)
    );
    const snapshot = await getDocs(q);
    snapshot.forEach((d) => {
      const data = d.data() as CustomerRequest;
      map.set(data.id, data);
    });
  } catch (err) {
    console.warn('Firestore request fetch notice:', err);
  }

  // 2. Local cache fallback
  try {
    const cacheKey = `${LOCAL_REQUESTS_KEY}_${artistId}`;
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      const cached: CustomerRequest[] = JSON.parse(raw);
      cached.forEach((r) => {
        if (!map.has(r.id)) {
          map.set(r.id, r);
        }
      });
    }
  } catch (cacheErr) {
    console.warn('Local cache request read notice:', cacheErr);
  }

  const list = Array.from(map.values());
  return list.sort(
    (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
  );
}

export async function updateRequestStatusInDb(
  requestId: string,
  artistId: string,
  status: RequestStatus,
  linkedOrderId?: string,
  linkedConversationId?: string
): Promise<void> {
  try {
    const docRef = doc(db, REQUESTS_COLLECTION, requestId);
    await updateDoc(docRef, {
      status,
      ...(linkedOrderId ? { linkedOrderId } : {}),
      ...(linkedConversationId ? { linkedConversationId } : {}),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Firestore update request status notice:', err);
  }

  // Local cache update
  try {
    const cacheKey = `${LOCAL_REQUESTS_KEY}_${artistId}`;
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      const cached: CustomerRequest[] = JSON.parse(raw);
      const updated = cached.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status,
              ...(linkedOrderId ? { linkedOrderId } : {}),
              ...(linkedConversationId ? { linkedConversationId } : {}),
            }
          : r
      );
      localStorage.setItem(cacheKey, JSON.stringify(updated));
    }
  } catch (cacheErr) {
    console.warn('Local cache update request status notice:', cacheErr);
  }
}
