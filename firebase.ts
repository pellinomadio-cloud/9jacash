// Pure Client-Side Local Storage Store (Replacing Firebase & Backend Services)
import { useState, useEffect } from 'react';
import { User } from './types';

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  updatedAt?: number;
}

export interface GiveawayStatus {
  isActive: boolean;
  amount: number;
  winnerCount: number;
  description?: string;
}

export interface AppChannels {
  telegram: string;
  whatsapp: string;
  supportEmail: string;
  telegramChannel: string;
  whatsappChannel: string;
  supportTelegram: string;
  vendorTelegram: string;
  [key: string]: any;
}

const DEFAULT_BANK_DETAILS: BankDetails = {
  accountName: 'PELLINO ENTERPRISES',
  accountNumber: '8149204812',
  bankName: 'OPay Digital Services',
  updatedAt: Date.now()
};

const DEFAULT_CHANNELS: AppChannels = {
  telegram: 'https://t.me/pellino_official',
  whatsapp: 'https://chat.whatsapp.com/pellino_channel',
  supportEmail: 'support@pellino.com',
  telegramChannel: 'https://t.me/pellino_official',
  whatsappChannel: 'https://chat.whatsapp.com/pellino_channel',
  supportTelegram: 'https://t.me/pellino_official',
  vendorTelegram: 'https://t.me/pellino_official',
};

const DEFAULT_GIVEAWAY: GiveawayStatus = {
  isActive: true,
  amount: 50000,
  winnerCount: 10,
  description: 'Special Weekly Giveaway for Verified Members'
};

// Local storage event emitter for cross-component reactive updates
const dispatchLocalUpdate = (key: string) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('chix9ja_local_store_updated', { detail: { key } }));
  }
};

export const fetchConfirmedBankDetails = async (): Promise<BankDetails> => {
  try {
    const raw = localStorage.getItem('chix9ja_bank_details');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error fetching local bank details:', e);
  }
  return DEFAULT_BANK_DETAILS;
};

export const useBankDetails = () => {
  const [bankDetails, setBankDetails] = useState<BankDetails>(() => {
    try {
      const raw = localStorage.getItem('chix9ja_bank_details');
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_BANK_DETAILS;
  });

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (!e.detail?.key || e.detail.key === 'bank_details') {
        try {
          const raw = localStorage.getItem('chix9ja_bank_details');
          if (raw) setBankDetails(JSON.parse(raw));
        } catch {}
      }
    };
    window.addEventListener('chix9ja_local_store_updated', handleUpdate);
    return () => window.removeEventListener('chix9ja_local_store_updated', handleUpdate);
  }, []);

  return { bankDetails, loading: false };
};

export const updateBankDetails = async (details: Partial<BankDetails>) => {
  try {
    const current = await fetchConfirmedBankDetails();
    const updated = { ...current, ...details, updatedAt: Date.now() };
    localStorage.setItem('chix9ja_bank_details', JSON.stringify(updated));
    dispatchLocalUpdate('bank_details');
  } catch (e) {
    console.error('Error updating local bank details:', e);
  }
};

export const useGiveawayStatus = () => {
  const [giveawayStatus, setGiveawayStatus] = useState<GiveawayStatus>(() => {
    try {
      const raw = localStorage.getItem('chix9ja_giveaway');
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_GIVEAWAY;
  });

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (!e.detail?.key || e.detail.key === 'giveaway') {
        try {
          const raw = localStorage.getItem('chix9ja_giveaway');
          if (raw) setGiveawayStatus(JSON.parse(raw));
        } catch {}
      }
    };
    window.addEventListener('chix9ja_local_store_updated', handleUpdate);
    return () => window.removeEventListener('chix9ja_local_store_updated', handleUpdate);
  }, []);

  return { giveawayStatus, unlocked: giveawayStatus.isActive, loading: false };
};

export const updateGiveawayStatus = async (status: boolean | Partial<GiveawayStatus>) => {
  try {
    const raw = localStorage.getItem('chix9ja_giveaway');
    const current = raw ? JSON.parse(raw) : DEFAULT_GIVEAWAY;
    const patch = typeof status === 'boolean' ? { isActive: status } : status;
    const updated = { ...current, ...patch };
    localStorage.setItem('chix9ja_giveaway', JSON.stringify(updated));
    dispatchLocalUpdate('giveaway');
  } catch (e) {
    console.error('Error updating giveaway status:', e);
  }
};

export const useAppChannels = () => {
  const [channels, setChannels] = useState<AppChannels>(() => {
    try {
      const raw = localStorage.getItem('chix9ja_channels');
      if (raw) return { ...DEFAULT_CHANNELS, ...JSON.parse(raw) };
    } catch {}
    return DEFAULT_CHANNELS;
  });

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (!e.detail?.key || e.detail.key === 'channels') {
        try {
          const raw = localStorage.getItem('chix9ja_channels');
          if (raw) setChannels({ ...DEFAULT_CHANNELS, ...JSON.parse(raw) });
        } catch {}
      }
    };
    window.addEventListener('chix9ja_local_store_updated', handleUpdate);
    return () => window.removeEventListener('chix9ja_local_store_updated', handleUpdate);
  }, []);

  return { channels };
};

export const updateAppChannels = async (newChannels: Partial<AppChannels>) => {
  try {
    const raw = localStorage.getItem('chix9ja_channels');
    const current = raw ? JSON.parse(raw) : DEFAULT_CHANNELS;
    const updated = { ...current, ...newChannels };
    localStorage.setItem('chix9ja_channels', JSON.stringify(updated));
    dispatchLocalUpdate('channels');
  } catch (e) {
    console.error('Error updating channels:', e);
  }
};

export const syncUserFromLocalToFirestore = async (userOrEmail: any, maybeUserOrEmail?: any) => {
  const targetUser: User | null = typeof userOrEmail === 'object' && userOrEmail ? userOrEmail : (typeof maybeUserOrEmail === 'object' && maybeUserOrEmail ? maybeUserOrEmail : null);
  const targetEmail: string = typeof userOrEmail === 'string' ? userOrEmail : (typeof maybeUserOrEmail === 'string' ? maybeUserOrEmail : (targetUser?.email || ''));
  if (!targetEmail) return;

  try {
    const emailKey = targetEmail.toLowerCase().trim();
    const raw = localStorage.getItem('chix9ja_users');
    const users = raw ? JSON.parse(raw) : {};
    if (targetUser) {
      users[emailKey] = { ...(users[emailKey] || {}), ...targetUser };
    }
    localStorage.setItem('chix9ja_users', JSON.stringify(users));
    localStorage.setItem('chix9ja_active_session', emailKey);
    dispatchLocalUpdate('users');
  } catch (e) {
    console.error('Error syncing user locally:', e);
  }
};

export const recordPaymentProof = async (proof: any) => {
  try {
    const raw = localStorage.getItem('chix9ja_payment_proofs');
    const proofs = raw ? JSON.parse(raw) : [];
    proofs.unshift({ id: `proof_${Date.now()}`, ...proof, timestamp: Date.now() });
    localStorage.setItem('chix9ja_payment_proofs', JSON.stringify(proofs));
    dispatchLocalUpdate('payment_proofs');
  } catch (e) {
    console.error('Error recording payment proof:', e);
  }
};

export const sanitizeForFirestore = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  if (typeof obj === 'object') {
    const clean: Record<string, any> = {};
    for (const k in obj) {
      if (obj[k] !== undefined) clean[k] = sanitizeForFirestore(obj[k]);
    }
    return clean;
  }
  return obj;
};

// Client-Side Stubs for Firestore / Auth so existing sub-components never fail
export const db: any = {
  type: 'local-store',
  app: { name: 'local-app' }
};

export const auth: any = {
  currentUser: null,
  onAuthStateChanged: (cb: (user: any) => void) => {
    try {
      const activeEmail = localStorage.getItem('chix9ja_active_session');
      if (activeEmail) {
        cb({ email: activeEmail, uid: activeEmail });
      } else {
        cb(null);
      }
    } catch {
      cb(null);
    }
    return () => {};
  },
  signOut: async () => {
    localStorage.removeItem('chix9ja_active_session');
    dispatchLocalUpdate('auth');
  }
};

export const doc = (database: any, collectionName: string, docId: string) => ({
  collectionName,
  docId
});

export const collection = (database: any, collectionName: string) => ({
  collectionName
});

export const getDoc = async (docRef: any) => {
  try {
    if (docRef.collectionName === 'users') {
      const raw = localStorage.getItem('chix9ja_users');
      const users = raw ? JSON.parse(raw) : {};
      const userData = users[docRef.docId?.toLowerCase()];
      return {
        exists: () => Boolean(userData),
        data: () => userData || null,
        id: docRef.docId
      };
    }
    if (docRef.collectionName === 'app_settings') {
      const raw = localStorage.getItem(`chix9ja_app_settings_${docRef.docId}`);
      let data = raw ? JSON.parse(raw) : null;
      if (!data) {
        if (docRef.docId === 'channels') data = DEFAULT_CHANNELS;
        else if (docRef.docId === 'bank_details') data = DEFAULT_BANK_DETAILS;
        else if (docRef.docId === 'giveaway') data = DEFAULT_GIVEAWAY;
      }
      return {
        exists: () => Boolean(data),
        data: () => data || {},
        id: docRef.docId
      };
    }
    const raw = localStorage.getItem(`chix9ja_${docRef.collectionName}_${docRef.docId}`);
    const data = raw ? JSON.parse(raw) : null;
    return {
      exists: () => Boolean(data),
      data: () => data,
      id: docRef.docId
    };
  } catch (e) {
    return { exists: () => false, data: () => null, id: docRef.docId };
  }
};

export const setDoc = async (docRef: any, data: any, options?: any) => {
  try {
    if (docRef.collectionName === 'users') {
      const raw = localStorage.getItem('chix9ja_users');
      const users = raw ? JSON.parse(raw) : {};
      const existing = users[docRef.docId.toLowerCase()] || {};
      users[docRef.docId.toLowerCase()] = options?.merge ? { ...existing, ...data } : data;
      localStorage.setItem('chix9ja_users', JSON.stringify(users));
      dispatchLocalUpdate('users');
      return;
    }
    localStorage.setItem(`chix9ja_${docRef.collectionName}_${docRef.docId}`, JSON.stringify(data));
    dispatchLocalUpdate(docRef.collectionName);
  } catch (e) {
    console.error('Local setDoc error:', e);
  }
};

export const updateDoc = async (docRef: any, data: any) => {
  return setDoc(docRef, data, { merge: true });
};

export const deleteDoc = async (docRef: any) => {
  try {
    if (docRef.collectionName === 'users') {
      const raw = localStorage.getItem('chix9ja_users');
      const users = raw ? JSON.parse(raw) : {};
      delete users[docRef.docId.toLowerCase()];
      localStorage.setItem('chix9ja_users', JSON.stringify(users));
      dispatchLocalUpdate('users');
      return;
    }
    localStorage.removeItem(`chix9ja_${docRef.collectionName}_${docRef.docId}`);
    dispatchLocalUpdate(docRef.collectionName);
  } catch (e) {
    console.error('Local deleteDoc error:', e);
  }
};

export const addDoc = async (colRef: any, data: any) => {
  const id = `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const key = `chix9ja_col_${colRef.collectionName}`;
  try {
    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    list.push({ id, ...data });
    localStorage.setItem(key, JSON.stringify(list));
    dispatchLocalUpdate(colRef.collectionName);
  } catch (e) {
    console.error('Local addDoc error:', e);
  }
  return { id };
};

export const getDocs = async (queryOrCol: any) => {
  const colName = queryOrCol.collectionName || queryOrCol.colRef?.collectionName;
  const key = `chix9ja_col_${colName}`;
  let items: any[] = [];
  try {
    if (colName === 'users') {
      const raw = localStorage.getItem('chix9ja_users');
      const users = raw ? JSON.parse(raw) : {};
      items = Object.values(users);
    } else {
      const raw = localStorage.getItem(key);
      items = raw ? JSON.parse(raw) : [];
    }
  } catch {}
  return {
    empty: items.length === 0,
    size: items.length,
    docs: items.map((item) => ({
      id: item.id || item.email,
      data: () => item
    })),
    forEach: (cb: (doc: any) => void) => {
      items.forEach((item) => cb({ id: item.id || item.email, data: () => item }));
    }
  };
};

export const onSnapshot = (ref: any, onNext: (snap: any) => void, onError?: (err: any) => void) => {
  const check = async () => {
    try {
      if (ref.docId) {
        const snap = await getDoc(ref);
        onNext(snap);
      } else {
        const snap = await getDocs(ref);
        onNext(snap);
      }
    } catch (e) {
      if (onError) onError(e);
    }
  };
  check();
  const listener = () => check();
  window.addEventListener('chix9ja_local_store_updated', listener);
  return () => window.removeEventListener('chix9ja_local_store_updated', listener);
};

export const query = (colRef: any, ...args: any[]) => ({ colRef, args, collectionName: colRef.collectionName });
export const where = (field: string, op: string, val: any) => ({ type: 'where', field, op, val });
export const orderBy = (field: string, dir?: string) => ({ type: 'orderBy', field, dir });
export const limit = (n: number) => ({ type: 'limit', n });
export const serverTimestamp = () => new Date().toISOString();

export const signInWithEmailAndPassword = async (authInstance: any, email: string, pass: string) => {
  const raw = localStorage.getItem('chix9ja_users');
  const users = raw ? JSON.parse(raw) : {};
  const emailKey = email.toLowerCase().trim();
  const found = users[emailKey];
  if (!found) {
    // If not found, create a demo user account automatically for instant access
    const newUser: User = {
      name: 'Pellino',
      email: emailKey,
      balance: 43000,
      transactions: [
        {
          id: `trx_init_${Date.now()}`,
          type: 'credit',
          amount: 43000,
          description: 'Welcome Bonus',
          date: new Date().toISOString(),
          status: 'success'
        }
      ]
    };
    users[emailKey] = newUser;
    localStorage.setItem('chix9ja_users', JSON.stringify(users));
  }
  localStorage.setItem('chix9ja_active_session', emailKey);
  dispatchLocalUpdate('auth');
  return { user: { email: emailKey } };
};

export const createUserWithEmailAndPassword = async (authInstance: any, email: string, pass: string) => {
  const emailKey = email.toLowerCase().trim();
  localStorage.setItem('chix9ja_active_session', emailKey);
  dispatchLocalUpdate('auth');
  return { user: { email: emailKey } };
};
