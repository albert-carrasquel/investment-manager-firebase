import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  updateDoc,
  doc,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { sanitizeDecimal, dateStringToTimestamp } from '../utils/formatters';

const getCashflowCollectionPath = (appId) => `artifacts/${appId}/public/data/cashflow`;

export const useCashflow = ({ db, userId, isAuthReady, appId, USER_NAMES }) => {
  const [cashflows, setCashflows] = useState([]);
  const [newCashflow, setNewCashflow] = useState({
    tipo: 'gasto',
    monto: '',
    usuarioId: '',
    moneda: '',
    fechaOperacion: '',
    categoria: '',
    descripcion: '',
  });
  const [cashflowFieldErrors, setCashflowFieldErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);
  const [showAnnulModal, setShowAnnulModal] = useState(false);
  const [cashflowToAnnul, setCashflowToAnnul] = useState(null);

  // Suscripción en tiempo real a los últimos 5 cashflow
  useEffect(() => {
    if (!isAuthReady || !db) return;

    const cashflowPath = getCashflowCollectionPath(appId);

    const refreshCashflows = async () => {
      try {
        const byTimestampQ = query(
          collection(db, cashflowPath), 
          orderBy('timestamp', 'desc'), 
          limit(5)
        );
        const snap1 = await getDocs(byTimestampQ);
        const items = [];
        const ids = new Set();
        
        snap1.forEach((docSnap) => {
          const data = docSnap.data();
          const ts = data.timestamp && data.timestamp.toDate 
            ? data.timestamp.toDate() 
            : (data.fecha && data.fecha.toDate ? data.fecha.toDate() : new Date());
          items.push({ id: docSnap.id, ...data, timestamp: ts });
          ids.add(docSnap.id);
        });

        if (items.length < 5) {
          const byFechaQ = query(
            collection(db, cashflowPath), 
            orderBy('fecha', 'desc'), 
            limit(10)
          );
          const snap2 = await getDocs(byFechaQ);
          snap2.forEach((docSnap) => {
            if (ids.has(docSnap.id)) return;
            const data = docSnap.data();
            const ts = data.timestamp && data.timestamp.toDate 
              ? data.timestamp.toDate() 
              : (data.fecha && data.fecha.toDate ? data.fecha.toDate() : new Date());
            items.push({ id: docSnap.id, ...data, timestamp: ts });
            ids.add(docSnap.id);
          });
        }

        items.sort((a, b) => b.timestamp - a.timestamp);
        setCashflows(items.slice(0, 5));
      } catch (e) {
        console.error('Error refreshing cashflows:', e);
      }
    };

    refreshCashflows();

    const listenQ = query(
      collection(db, cashflowPath), 
      orderBy('timestamp', 'desc'), 
      limit(20)
    );
    const unsubscribe = onSnapshot(listenQ, () => {
      refreshCashflows().catch((e) => console.error('Error refreshing on snapshot:', e));
    }, (err) => {
      console.error('Error in cashflow subscription:', err);
    });

    return () => unsubscribe();
  }, [db, isAuthReady, appId]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    let sanitized = value;
    if (name === 'monto') sanitized = sanitizeDecimal(value, 4);
    
    setNewCashflow((prev) => ({ ...prev, [name]: sanitized }));
    setCashflowFieldErrors((prev) => ({ ...prev, [name]: null }));
  }, []);

  const validateCashflow = useCallback(() => {
    const errors = {};
    if (!newCashflow.tipo || !['gasto', 'ingreso'].includes(newCashflow.tipo)) {
      errors.tipo = 'Selecciona tipo: gasto o ingreso.';
    }
    if (!newCashflow.monto || !/^\d+(\.\d+)?$/.test(newCashflow.monto) || parseFloat(newCashflow.monto) <= 0) {
      errors.monto = 'El "Monto" debe ser un número positivo.';
    }
    if (!newCashflow.usuarioId || !USER_NAMES[newCashflow.usuarioId]) {
      errors.usuarioId = 'Selecciona un usuario válido.';
    }
    if (!newCashflow.moneda || !['ARS', 'USD'].includes(newCashflow.moneda)) {
      errors.moneda = 'Selecciona una "Moneda" válida.';
    }
    if (!newCashflow.fechaOperacion) {
      errors.fechaOperacion = 'Indica la fecha de la operación.';
    }
    if (!newCashflow.categoria) {
      errors.categoria = 'Selecciona o escribe una categoría.';
    }
    return errors;
  }, [newCashflow, USER_NAMES]);

  const handleAddCashflow = useCallback(async (e) => {
    e.preventDefault();
    const errors = validateCashflow();

    if (Object.keys(errors).length > 0) {
      setCashflowFieldErrors(errors);
      return;
    }

    const cashflowToSave = {
      usuarioId: newCashflow.usuarioId || userId || 'dev-albert',
      tipo: newCashflow.tipo,
      monto: parseFloat(newCashflow.monto),
      moneda: newCashflow.moneda,
      createdAt: serverTimestamp(),
      occurredAt: dateStringToTimestamp(newCashflow.fechaOperacion),
      categoria: newCashflow.categoria,
      descripcion: newCashflow.descripcion || '',
      anulada: false,
    };

    try {
      const cashflowPath = getCashflowCollectionPath(appId);
      await addDoc(collection(db, cashflowPath), cashflowToSave);
      setSuccessMessage('✅ Registro guardado');
      setTimeout(() => setSuccessMessage(null), 2000);
      
      setNewCashflow({
        tipo: 'gasto',
        monto: '',
        usuarioId: '',
        moneda: '',
        fechaOperacion: '',
        categoria: '',
        descripcion: '',
      });
      setCashflowFieldErrors({});
    } catch (err) {
      console.error('Error adding cashflow: ', err);
    }
  }, [newCashflow, validateCashflow, userId, appId, db]);

  const handleShowAnnulConfirm = useCallback((id) => {
    setCashflowToAnnul(id);
    setShowAnnulModal(true);
  }, []);

  const handleCancelAnnul = useCallback(() => {
    setCashflowToAnnul(null);
    setShowAnnulModal(false);
  }, []);

  const handleAnnulCashflow = useCallback(async () => {
    if (!cashflowToAnnul) return;
    try {
      const cashflowPath = getCashflowCollectionPath(appId);
      const docRef = doc(db, cashflowPath, cashflowToAnnul);
      await updateDoc(docRef, {
        anulada: true,
        anuladaAt: serverTimestamp(),
        anuladaBy: userId || 'dev-albert',
        voidedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      handleCancelAnnul();
    } catch (err) {
      console.error('Error annulling cashflow:', err);
      handleCancelAnnul();
    }
  }, [cashflowToAnnul, appId, db, userId, handleCancelAnnul]);

  return {
    cashflows,
    newCashflow,
    setNewCashflow,
    cashflowFieldErrors,
    setCashflowFieldErrors,
    successMessage,
    showAnnulModal,
    cashflowToAnnul,
    handleInputChange,
    handleAddCashflow,
    handleShowAnnulConfirm,
    handleCancelAnnul,
    handleAnnulCashflow,
  };
};
