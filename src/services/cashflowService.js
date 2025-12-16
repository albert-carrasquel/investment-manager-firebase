import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getCashflowPath } from './firestorePaths';

/**
 * Cashflow Service
 * Handles all Firestore operations for gastos/ingresos (cashflow)
 */

// --- CREATE ---

export const createCashflow = async (appId, cashflowData) => {
  try {
    const path = getCashflowPath(appId);
    const docRef = await addDoc(collection(db, path), cashflowData);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating cashflow:', error);
    return { success: false, error: error.message };
  }
};

// --- UPDATE (Annulation) ---

export const annulCashflow = async (appId, cashflowId, annulationData) => {
  try {
    const path = getCashflowPath(appId);
    const docRef = doc(db, path, cashflowId);
    await updateDoc(docRef, annulationData);
    return { success: true };
  } catch (error) {
    console.error('Error annulling cashflow:', error);
    return { success: false, error: error.message };
  }
};

// --- READ (Real-time last N) ---

export const listenToLastNCashflows = (appId, n, callback, onError) => {
  const path = getCashflowPath(appId);
  const q = query(
    collection(db, path),
    orderBy('createdAt', 'desc'),
    limit(n)
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const cashflows = [];
      snapshot.forEach((doc) => {
        cashflows.push({ id: doc.id, ...doc.data() });
      });
      callback(cashflows);
    },
    (error) => {
      console.error('Error listening to cashflows:', error);
      if (onError) onError(error);
    }
  );

  return unsubscribe;
};

// --- READ (Query all for reports) ---

export const getAllCashflows = async (appId) => {
  try {
    const path = getCashflowPath(appId);
    const q = query(collection(db, path));
    const snapshot = await getDocs(q);
    const cashflows = [];
    snapshot.forEach((doc) => {
      cashflows.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: cashflows };
  } catch (error) {
    console.error('Error fetching all cashflows:', error);
    return { success: false, error: error.message, data: [] };
  }
};
