import {
  collection,
  addDoc,
  onSnapshot,
  query,
  getDocs,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getTransactionsPath } from './firestorePaths';

/**
 * Transactions Service
 * Handles all Firestore operations for investments (transactions)
 */

// --- CREATE ---

export const createTransaction = async (appId, transactionData) => {
  try {
    const path = getTransactionsPath(appId);
    const docRef = await addDoc(collection(db, path), transactionData);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating transaction:', error);
    return { success: false, error: error.message };
  }
};

// --- READ (Real-time listener) ---

export const listenToTransactions = (appId, callback, onError) => {
  const path = getTransactionsPath(appId);
  const q = query(collection(db, path));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const transactions = [];
      snapshot.forEach((doc) => {
        transactions.push({ id: doc.id, ...doc.data() });
      });
      callback(transactions);
    },
    (error) => {
      console.error('Error listening to transactions:', error);
      if (onError) onError(error);
    }
  );

  return unsubscribe;
};

// --- READ (Query all for reports) ---

export const getAllTransactions = async (appId) => {
  try {
    const path = getTransactionsPath(appId);
    const q = query(collection(db, path));
    const snapshot = await getDocs(q);
    const transactions = [];
    snapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: transactions };
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    return { success: false, error: error.message, data: [] };
  }
};
