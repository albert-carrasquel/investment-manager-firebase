import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  doc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  sanitizeDecimal, 
  sanitizeActivo, 
  sanitizeNombre, 
  getUniqueActivos, 
  dateStringToTimestamp 
} from '../utils/formatters';

const getTransactionsCollectionPath = (appId) => `artifacts/${appId}/public/data/transactions`;

export const useTransactions = ({ db, userId, isAuthReady, appId, USER_NAMES }) => {
  const [transactions, setTransactions] = useState([]);
  const [activosList, setActivosList] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    tipoOperacion: 'compra',
    activo: '',
    usuarioId: '',
    nombreActivo: '',
    tipoActivo: '',
    cantidad: '',
    precioUnitario: '',
    moneda: '',
    comision: '',
    monedaComision: '',
    exchange: '',
    totalOperacion: '',
    notas: '',
    fechaTransaccion: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

  // Suscripción en tiempo real a las transacciones
  useEffect(() => {
    if (!isAuthReady || !db || !userId) return;

    const transactionsPath = getTransactionsCollectionPath(appId);
    const q = query(collection(db, transactionsPath));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedTransactions = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          fetchedTransactions.push({
            id: docSnap.id,
            ...data,
            timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(),
          });
        });
        fetchedTransactions.sort((a, b) => b.timestamp - a.timestamp);
        setTransactions(fetchedTransactions);
      },
      (err) => {
        console.error('Error fetching transactions:', err);
      }
    );

    return () => unsubscribe();
  }, [db, userId, isAuthReady, appId]);

  // Construir lista única de activos
  useEffect(() => {
    const list = getUniqueActivos(transactions, newTransaction.usuarioId);
    setActivosList(list);
    if (newTransaction.activo && !list.includes(newTransaction.activo.toUpperCase())) {
      setNewTransaction((prev) => ({ ...prev, activo: '' }));
    }
  }, [transactions, newTransaction.usuarioId]);

  const handleInputChange = (e, compositionRef) => {
    const { name, value } = e.target;

    if (compositionRef?.current) {
      setNewTransaction((prev) => ({ ...prev, [name]: value }));
      return setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }

    let sanitized = value;
    switch (name) {
      case 'activo':
        sanitized = sanitizeActivo(value);
        break;
      case 'nombreActivo':
        sanitized = sanitizeNombre(value);
        break;
      case 'cantidad':
        sanitized = sanitizeDecimal(value, 8);
        break;
      case 'precioUnitario':
        sanitized = sanitizeDecimal(value, 8);
        break;
      case 'totalOperacion':
        sanitized = sanitizeDecimal(value, 2);
        break;
      case 'comision':
        sanitized = sanitizeDecimal(value, 4);
        break;
      default:
        sanitized = value;
    }

    setNewTransaction((prev) => ({ ...prev, [name]: sanitized }));
    setFieldErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateTransaction = () => {
    const errors = {};
    const assetSymbol = (newTransaction.activo || '').toUpperCase();
    
    if (!/^[A-Z]{2,10}$/.test(assetSymbol)) {
      errors.activo = 'El campo "Activo" debe contener solo letras (A-Z), entre 2 y 10 caracteres.';
    }
    if (!/^\d+(\.\d+)?$/.test(newTransaction.cantidad) || parseFloat(newTransaction.cantidad) <= 0) {
      errors.cantidad = 'La "Cantidad" debe ser un número positivo.';
    }
    if (!/^\d+(\.\d+)?$/.test(newTransaction.precioUnitario) || parseFloat(newTransaction.precioUnitario) <= 0) {
      errors.precioUnitario = 'El "Precio Unitario" debe ser un número positivo.';
    }
    
    // ... resto de validaciones
    
    return errors;
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    const errors = validateTransaction();
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const cantidad = parseFloat(newTransaction.cantidad);
    const precioUnitario = parseFloat(newTransaction.precioUnitario);
    const totalOperacion = parseFloat(newTransaction.totalOperacion);
    const montoTotal = cantidad * precioUnitario;
    const diferenciaOperacion = totalOperacion - montoTotal;

    const transactionToSave = {
      ...newTransaction,
      activo: (newTransaction.activo || '').toUpperCase(),
      cantidad,
      precioUnitario,
      totalOperacion,
      montoTotal,
      diferenciaOperacion,
      comision: newTransaction.comision ? parseFloat(newTransaction.comision) : null,
      monedaComision: newTransaction.monedaComision || null,
      usuarioId: newTransaction.usuarioId || userId,
      createdAt: serverTimestamp(),
      occurredAt: dateStringToTimestamp(newTransaction.fechaTransaccion),
    };

    try {
      const transactionsPath = getTransactionsCollectionPath(appId);
      await addDoc(collection(db, transactionsPath), transactionToSave);

      setSuccessMessage('✅ Transacción guardada correctamente');
      setTimeout(() => setSuccessMessage(null), 2500);

      setNewTransaction({
        tipoOperacion: 'compra',
        activo: '',
        usuarioId: '',
        nombreActivo: '',
        tipoActivo: '',
        cantidad: '',
        precioUnitario: '',
        moneda: '',
        comision: '',
        monedaComision: '',
        exchange: '',
        notas: '',
        totalOperacion: '',
        fechaTransaccion: '',
      });
      setFieldErrors({});
    } catch (e) {
      console.error('Error adding transaction: ', e);
    }
  };

  const handleShowDeleteConfirm = (id) => {
    setDocToDelete(id);
    setShowConfirmModal(true);
  };

  const handleCancelDelete = () => {
    setDocToDelete(null);
    setShowConfirmModal(false);
  };

  const handleDeleteTransaction = async () => {
    if (!docToDelete) return;

    try {
      const transactionsPath = getTransactionsCollectionPath(appId);
      const docRef = doc(db, transactionsPath, docToDelete);
      await deleteDoc(docRef);
      handleCancelDelete();
    } catch (e) {
      console.error('Error deleting document: ', e);
      handleCancelDelete();
    }
  };

  return {
    transactions,
    activosList,
    newTransaction,
    setNewTransaction,
    fieldErrors,
    setFieldErrors,
    successMessage,
    showConfirmModal,
    docToDelete,
    handleInputChange,
    handleAddTransaction,
    handleShowDeleteConfirm,
    handleCancelDelete,
    handleDeleteTransaction,
  };
};
