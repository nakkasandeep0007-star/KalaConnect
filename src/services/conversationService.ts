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
import { Conversation, ChatMessage } from '../types';

const CONVERSATIONS_COLLECTION = 'conversations';
const LOCAL_CONVERSATIONS_KEY = 'kalaconnect_conversations_cache';

export async function saveConversationToDb(
  artistId: string,
  convData: Omit<Conversation, 'id' | 'artistId'> & { id?: string }
): Promise<Conversation> {
  const convId = convData.id || `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const fullConv: Conversation = {
    ...convData,
    id: convId,
    artistId,
  };

  try {
    const docRef = doc(db, CONVERSATIONS_COLLECTION, convId);
    await setDoc(docRef, {
      ...fullConv,
      dbCreatedAt: serverTimestamp(),
      dbUpdatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Firestore conversation write notice:', err);
  }

  try {
    const cacheKey = `${LOCAL_CONVERSATIONS_KEY}_${artistId}`;
    const raw = localStorage.getItem(cacheKey);
    const existing: Conversation[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter((c) => c.id !== convId);
    const updated = [fullConv, ...filtered];
    localStorage.setItem(cacheKey, JSON.stringify(updated));
  } catch (cacheErr) {
    console.warn('Local cache conversation write notice:', cacheErr);
  }

  return fullConv;
}

export async function getArtistConversations(artistId: string): Promise<Conversation[]> {
  const map = new Map<string, Conversation>();

  try {
    const q = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where('artistId', '==', artistId)
    );
    const snapshot = await getDocs(q);
    snapshot.forEach((d) => {
      const data = d.data() as Conversation;
      map.set(data.id, data);
    });
  } catch (err) {
    console.warn('Firestore conversation fetch notice:', err);
  }

  try {
    const cacheKey = `${LOCAL_CONVERSATIONS_KEY}_${artistId}`;
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      const cached: Conversation[] = JSON.parse(raw);
      cached.forEach((c) => {
        if (!map.has(c.id)) {
          map.set(c.id, c);
        }
      });
    }
  } catch (cacheErr) {
    console.warn('Local cache conversation read notice:', cacheErr);
  }

  const list = Array.from(map.values());
  return list.sort((a, b) => {
    const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return timeB - timeA;
  });
}

export async function sendChatMessage(
  convId: string,
  artistId: string,
  message: ChatMessage
): Promise<void> {
  const cacheKey = `${LOCAL_CONVERSATIONS_KEY}_${artistId}`;
  let currentConv: Conversation | null = null;

  try {
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      const cached: Conversation[] = JSON.parse(raw);
      const target = cached.find((c) => c.id === convId);
      if (target) currentConv = target;
    }
  } catch (e) {
    // ignore
  }

  const updatedMessages = currentConv ? [...currentConv.messages, message] : [message];
  const lastMessage = message.text;
  const lastMessageAt = message.createdAt;

  try {
    const docRef = doc(db, CONVERSATIONS_COLLECTION, convId);
    await updateDoc(docRef, {
      messages: updatedMessages,
      lastMessage,
      lastMessageAt,
      dbUpdatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Firestore message send notice:', err);
  }

  try {
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      const cached: Conversation[] = JSON.parse(raw);
      const updated = cached.map((c) =>
        c.id === convId
          ? {
              ...c,
              messages: updatedMessages,
              lastMessage,
              lastMessageAt,
            }
          : c
      );
      localStorage.setItem(cacheKey, JSON.stringify(updated));
    }
  } catch (cacheErr) {
    console.warn('Local cache message write notice:', cacheErr);
  }
}
