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
import { CustomOrder, OrderStatus, ArtworkProgressUpdate } from '../types';

const ORDERS_COLLECTION = 'orders';
const LOCAL_ORDERS_KEY = 'kalaconnect_custom_orders_cache';

export async function saveOrderToDb(
  artistId: string,
  orderData: Omit<CustomOrder, 'id' | 'artistId' | 'createdAt'> & { id?: string }
): Promise<CustomOrder> {
  const orderId拼 = orderData.id || `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const fullOrder: CustomOrder = {
    ...orderData,
    id: orderId拼,
    artistId,
    createdAt: now,
  };

  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId拼);
    await setDoc(docRef, {
      ...fullOrder,
      dbCreatedAt: serverTimestamp(),
      dbUpdatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Firestore order save notice:', err);
  }

  // Local cache
  try {
    const cacheKey = `${LOCAL_ORDERS_KEY}_${artistId}`;
    const raw = localStorage.getItem(cacheKey);
    const existing: CustomOrder[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter((o) => o.id !== orderId拼);
    const updated = [fullOrder, ...filtered];
    localStorage.setItem(cacheKey, JSON.stringify(updated));
  } catch (cacheErr) {
    console.warn('Local cache order write notice:', cacheErr);
  }

  return fullOrder;
}

export async function getArtistOrders(artistId: string): Promise<CustomOrder[]> {
  const map = new Map<string, CustomOrder>();

  // 1. Firestore
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('artistId', '==', artistId)
    );
    const snapshot = await getDocs(q);
    snapshot.forEach((d) => {
      const data = d.data() as CustomOrder;
      map.set(data.id, data);
    });
  } catch (err) {
    console.warn('Firestore order fetch notice:', err);
  }

  // 2. Local cache
  try {
    const cacheKey = `${LOCAL_ORDERS_KEY}_${artistId}`;
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      const cached: CustomOrder[] = JSON.parse(raw);
      cached.forEach((o) => {
        if (!map.has(o.id)) {
          map.set(o.id, o);
        }
      });
    }
  } catch (cacheErr) {
    console.warn('Local cache order read notice:', cacheErr);
  }

  const list = Array.from(map.values());
  return list.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function updateOrderStatus(
  orderId: string,
  artistId: string,
  status: OrderStatus
): Promise<void> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      status,
      dbUpdatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Firestore update order status notice:', err);
  }

  try {
    const cacheKey = `${LOCAL_ORDERS_KEY}_${artistId}`;
    const raw四周 = localStorage.getItem(cacheKey);
    if (raw四周) {
      const cached: CustomOrder[] = JSON.parse(raw四周);
      const updated = cached.map((o) =>
        o.id === orderId ? { ...o, status } : o
      );
      localStorage.setItem(cacheKey, JSON.stringify(updated));
    }
  } catch (cacheErr) {
    console.warn('Local cache order status update notice:', cacheErr);
  }
}

export async function addOrderProgressUpdate(
  orderId: string,
  artistId: string,
  progress: ArtworkProgressUpdate
): Promise<void> {
  let existingOrder: CustomOrder | null = null;
  const cacheKey = `${LOCAL_ORDERS_KEY}_${artistId}`;

  try {
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      const cached: CustomOrder[] = JSON.parse(raw);
      const target = cached.find((o) => o.id === orderId);
      if (target) {
        existingOrder = target;
      }
    }
  } catch (e) {
    // ignore
  }

  const newProgressUpdates = existingOrder
    ? [...existingOrder.progressUpdates, progress]
    : [progress];

  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      progressUpdates: newProgressUpdates,
      status: 'progress_update',
      dbUpdatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Firestore order progress update notice:', err);
  }

  try {
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      const cached: CustomOrder[] = JSON.parse(raw);
      const updated = cached.map((o) =>
        o.id === orderId
          ? {
              ...o,
              progressUpdates: newProgressUpdates,
              status: 'progress_update' as OrderStatus,
            }
          : o
      );
      localStorage.setItem(cacheKey, JSON.stringify(updated));
    }
  } catch (cacheErr) {
    console.warn('Local cache order progress write notice:', cacheErr);
  }
}

export async function togglePaymentMilestoneStatus(
  orderId: string,
  artistId: string,
  milestoneId: string
): Promise<void> {
  const cacheKey = `${LOCAL_ORDERS_KEY}_${artistId}`;
  try {
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      const cached: CustomOrder[] = JSON.parse(raw);
      const target = cached.find((o) => o.id === orderId);
      if (target) {
        const updatedMilestones = target.paymentMilestones.map((m) =>
          m.id === milestoneId
            ? {
                ...m,
                status: m.status === 'paid' ? ('pending' as const) : ('paid' as const),
                paidAt: m.status === 'paid' ? undefined : new Date().toISOString(),
              }
            : m
        );
        const updatedOrder = { ...target, paymentMilestones: updatedMilestones };

        try {
          const docRef = doc(db, ORDERS_COLLECTION, orderId);
          await updateDoc(docRef, {
            paymentMilestones: updatedMilestones,
            dbUpdatedAt: serverTimestamp(),
          });
        } catch (dbErr) {
          console.warn('Firestore update milestone notice:', dbErr);
        }

        const updated = cached.map((o) => (o.id === orderId ? updatedOrder : o));
        localStorage.setItem(cacheKey, JSON.stringify(updated));
      }
    }
  } catch (err) {
    console.warn('Local cache milestone toggle notice:', err);
  }
}
