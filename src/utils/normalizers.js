import { serverTimestamp } from 'firebase/firestore';
import { dateStringToTimestamp } from './formatters';

/**
 * Normalizers: prepare data for Firestore storage
 * Ensure consistent data types and structure
 */

// --- TRANSACTIONS NORMALIZERS ---

export const normalizeTransactionForSave = (formData, userId) => {
  const assetSymbol = (formData.activo || '').toUpperCase();
  const cantidad = parseFloat(formData.cantidad);
  const precioUnitario = parseFloat(formData.precioUnitario);
  const totalOperacion = parseFloat(formData.totalOperacion);

  // Calculate montoTotal (theoretical: cantidad * precioUnitario)
  const montoTotal = cantidad * precioUnitario;

  // Calculate diferenciaOperacion (totalOperacion - montoTotal)
  const diferenciaOperacion = totalOperacion - montoTotal;

  return {
    tipoOperacion: formData.tipoOperacion,
    activo: assetSymbol,
    nombreActivo: formData.nombreActivo || '',
    tipoActivo: formData.tipoActivo,
    cantidad,
    precioUnitario,
    moneda: formData.moneda,
    // NEW STANDARD: totalOperacion as source of truth (official receipt amount)
    totalOperacion,
    // NEW STANDARD: montoTotal as calculated theoretical amount
    montoTotal,
    // NEW STANDARD: diferenciaOperacion shows implicit fees/spreads/rounding
    diferenciaOperacion,
    // Comisión como number o null
    comision: formData.comision ? parseFloat(formData.comision) : null,
    monedaComision: formData.monedaComision ? formData.monedaComision : null,
    usuarioId: formData.usuarioId || userId,
    // NEW STANDARD: createdAt (audit timestamp) and occurredAt (user-chosen date)
    createdAt: serverTimestamp(),
    occurredAt: dateStringToTimestamp(formData.fechaTransaccion),
    exchange: formData.exchange || '',
    notas: formData.notas || '',
  };
};

// --- CASHFLOW NORMALIZERS ---

export const normalizeCashflowForSave = (formData, userId) => {
  return {
    usuarioId: formData.usuarioId || userId || 'dev-albert',
    tipo: formData.tipo,
    monto: parseFloat(formData.monto),
    moneda: formData.moneda,
    // NEW STANDARD: createdAt (audit timestamp) and occurredAt (user-chosen date)
    createdAt: serverTimestamp(),
    occurredAt: dateStringToTimestamp(formData.fechaOperacion),
    categoria: formData.categoria,
    descripcion: formData.descripcion || '',
    anulada: false,
  };
};

// --- ANNULATION NORMALIZERS ---

export const normalizeAnnulationData = (userId) => {
  return {
    anulada: true,
    anuladaAt: serverTimestamp(), // legacy field (keep for compatibility)
    anuladaBy: userId || 'dev-albert',
    voidedAt: serverTimestamp(), // NEW STANDARD
    updatedAt: serverTimestamp(), // NEW STANDARD
  };
};
