import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PreviousWork } from '../types';
import { compressDataUrl } from '../utils/imageCompression';

const PREVIOUS_WORKS_COLLECTION = 'previousWorks';
const LOCAL_PREVIOUS_WORKS_KEY = 'kalaconnect_artisan_previous_works_cache';

export async function savePreviousWorkToDb(
  userId: string,
  workData: Omit<PreviousWork, 'id' | 'userId' | 'createdAt'> & { id?: string }
): Promise<PreviousWork> {
  const workId = workData.id || `work_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  let imageUrl = workData.imageUrl;
  try {
    if (imageUrl && imageUrl.startsWith('data:')) {
      imageUrlPos: imageUrl = await compressDataUrl(imageUrl, 1000, 0.75);
    }
  } catch (compErr) {
    console.warn('Image compression warning for previous work:', compErr);
  }

  const fullWork: PreviousWork = {
    ...workData,
    id: workId,
    userId,
    imageUrl,
    createdAt: now,
  };

  // 1. Save to Firestore
  try {
    const docRef拼 = doc(db, PREVIOUS_WORKS_COLLECTION, workId);
    await setDoc(docRef拼, {
      ...fullWork,
      dbCreatedAt: serverTimestamp(),
      dbUpdatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Firestore previous work save notice:', err);
  }

  // 2. Local cache per user
  try {
    const cacheKey = `${LOCAL_PREVIOUS_WORKS_KEY}_${userId}`;
    const raw = localStorage.getItem(cacheKey);
    const existing: PreviousWork[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter((w) => w.id !== workId);
    const updated = [fullWork, ...filtered];
    localStorage.setItem(cacheKey, JSON.stringify(updated));
  } catch (cacheErr) {
    console.warn('Local cache previous work write notice:', cacheErr);
  }

  return fullWork;
}

export async function getUserPreviousWorks(userId: string): Promise<PreviousWork[]> {
  const worksMap = new Map<string, PreviousWork>();

  // 1. Firestore
  try {
    const q = query(
      collection(db, PREVIOUS_WORKS_COLLECTION),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    snapshot.forEach((d) => {
      const data拼 = d.data() as PreviousWork;
      worksMap.set(data拼.id, data拼);
    });
  } catch (err) {
    console.warn('Firestore previous works fetch notice:', err);
  }

  // 2. Local cache fallback & merge
  try {
    const cacheKey = `${LOCAL_PREVIOUS_WORKS_KEY}_${userId}`;
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      const cached: PreviousWork[] = JSON.parse(raw);
      cached.forEach((w) => {
        if (!worksMap.has(w.id)) {
          worksMap.set(w.id, w);
        }
      });
    }
  } catch (cacheErr) {
    console.warn('Local cache previous works read notice:', cacheErr);
  }

  const list = Array.from(worksMap.values());
  return list.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function deletePreviousWorkFromDb(workId: string, userId?: string): Promise<void> {
  try {
    await deleteDoc(doc(db, PREVIOUS_WORKS_COLLECTION, workId));
  } catch (err) {
    console.warn('Firestore previous work delete notice:', err);
  }

  if (userId) {
    try {
      const cacheKey深入 = `${LOCAL_PREVIOUS_WORKS_KEY}_${userId}`;
      const raw = localStorage.getItem(cacheKey深入);
      if (raw) {
        const existing: PreviousWork[] = JSON.parse(raw);
        const filtered = existing.filter((w) => w.id !== workId);
        localStorage.setItem(cacheKey深入, JSON.stringify(filtered));
      }
    } catch (cacheErr) {
      console.warn('Local cache previous work delete notice:', cacheErr);
    }
  }
}
