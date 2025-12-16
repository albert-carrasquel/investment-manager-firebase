import { MONEDAS, TIPOS_ACTIVO, EXCHANGES, USER_NAMES, TIPOS_CASHFLOW } from '../config/constants';

/**
 * Validation utilities for forms
 * Returns field-specific error objects
 */

// --- TRANSACTIONS (INVERSIONES) VALIDATORS ---

export const validateTransactionFields = (transaction, activosList = []) => {
  const errors = {};

  // Activo (símbolo)
  const assetSymbol = (transaction.activo || '').toUpperCase();
  if (!/^[A-Z]{2,10}$/.test(assetSymbol)) {
    errors.activo = 'El campo "Activo" debe contener solo letras (A-Z), entre 2 y 10 caracteres.';
  }

  // Cantidad
  if (!/^\d+(\.\d+)?$/.test(transaction.cantidad) || parseFloat(transaction.cantidad) <= 0) {
    errors.cantidad = 'La "Cantidad" debe ser un número positivo.';
  }

  // Precio unitario
  if (!/^\d+(\.\d+)?$/.test(transaction.precioUnitario) || parseFloat(transaction.precioUnitario) <= 0) {
    errors.precioUnitario = 'El "Precio Unitario" debe ser un número positivo.';
  }

  // Nombre del activo (opcional pero si existe debe ser válido)
  if (transaction.nombreActivo && !/^[A-Za-zÀ-ÖØ-öø-ÿ\s]{2,50}$/.test(transaction.nombreActivo)) {
    errors.nombreActivo = 'El "Nombre del Activo" debe contener solo letras y espacios (2-50 caracteres).';
  }

  // Tipo de activo
  if (!transaction.tipoActivo) {
    errors.tipoActivo = 'Selecciona un "Tipo de Activo".';
  } else if (!TIPOS_ACTIVO.includes(transaction.tipoActivo)) {
    errors.tipoActivo = 'Selecciona un "Tipo de Activo" válido.';
  }

  // Moneda
  if (!transaction.moneda) {
    errors.moneda = 'Selecciona la "Moneda".';
  } else if (!MONEDAS.includes(transaction.moneda)) {
    errors.moneda = 'Selecciona una "Moneda" válida (ARS o USD).';
  }

  // Moneda de comisión (opcional)
  if (transaction.monedaComision && !MONEDAS.includes(transaction.monedaComision)) {
    errors.monedaComision = 'Selecciona una "Moneda Comisión" válida (ARS o USD).';
  }

  // Fecha de transacción
  if (!transaction.fechaTransaccion) {
    errors.fechaTransaccion = 'Debes indicar la fecha de la transacción.';
  }

  // Usuario
  if (!transaction.usuarioId) {
    errors.usuarioId = 'Selecciona un usuario.';
  } else if (!USER_NAMES[transaction.usuarioId]) {
    errors.usuarioId = 'Selecciona un usuario válido.';
  }

  // Total operación (monto oficial del recibo)
  if (!/^\d+(\.\d+)?$/.test(transaction.totalOperacion) || parseFloat(transaction.totalOperacion) <= 0) {
    errors.totalOperacion = 'El "Total (según recibo)" debe ser un número positivo.';
  }

  // Comisión (opcional pero si existe debe ser numérico)
  if (transaction.comision && !/^\d+(\.\d+)?$/.test(transaction.comision)) {
    errors.comision = 'La "Comisión" debe ser un número válido.';
  }

  // Venta-specific: verificar que el activo exista para el usuario
  if (transaction.tipoOperacion === 'venta') {
    if (activosList.length === 0) {
      errors.activo = 'No hay activos registrados para el usuario seleccionado. No es posible registrar ventas.';
    } else if (!activosList.includes(assetSymbol)) {
      errors.activo = 'El activo seleccionado no está disponible para venta para este usuario.';
    }
  }

  // Exchange
  if (!transaction.exchange) {
    errors.exchange = 'Selecciona un "Exchange".';
  } else if (!EXCHANGES.includes(transaction.exchange)) {
    errors.exchange = 'Selecciona un "Exchange" válido.';
  }

  return errors;
};

// --- CASHFLOW VALIDATORS ---

export const validateCashflowFields = (cashflow) => {
  const errors = {};

  // Tipo (gasto o ingreso)
  if (!cashflow.tipo || !TIPOS_CASHFLOW.includes(cashflow.tipo)) {
    errors.tipo = 'Selecciona tipo: gasto o ingreso.';
  }

  // Monto
  if (!cashflow.monto || !/^\d+(\.\d+)?$/.test(cashflow.monto) || parseFloat(cashflow.monto) <= 0) {
    errors.monto = 'El "Monto" debe ser un número positivo.';
  }

  // Usuario
  if (!cashflow.usuarioId || !USER_NAMES[cashflow.usuarioId]) {
    errors.usuarioId = 'Selecciona un usuario válido.';
  }

  // Moneda
  if (!cashflow.moneda || !MONEDAS.includes(cashflow.moneda)) {
    errors.moneda = 'Selecciona una "Moneda" válida.';
  }

  // Fecha
  if (!cashflow.fechaOperacion) {
    errors.fechaOperacion = 'Indica la fecha de la operación.';
  }

  // Categoría
  if (!cashflow.categoria) {
    errors.categoria = 'Selecciona o escribe una categoría.';
  }

  return errors;
};

// --- REPORTS VALIDATORS ---

export const validateReportFilters = (filters) => {
  const errors = {};

  if (!filters.tipoDatos) {
    errors.tipoDatos = 'Selecciona el tipo de datos.';
  }

  if (!filters.fechaDesde) {
    errors.fechaDesde = 'Indica la fecha desde.';
  }

  if (!filters.fechaHasta) {
    errors.fechaHasta = 'Indica la fecha hasta.';
  }

  if (filters.fechaDesde && filters.fechaHasta && filters.fechaDesde > filters.fechaHasta) {
    errors.fechaHasta = 'La fecha "Hasta" debe ser mayor o igual a "Desde".';
  }

  return errors;
};
