import { getOccurredAtFromDoc } from '../utils/formatters';
import { getAllTransactions } from './transactionsService';
import { getAllCashflows } from './cashflowService';

/**
 * Reports Service
 * Handles report generation with client-side filtering (no composite indexes required)
 */

// --- FILTER LOGIC ---

const filterByDateRange = (doc, fromDate, toDate, dataType) => {
  const docDate = getOccurredAtFromDoc(doc, dataType);
  if (!docDate || docDate < fromDate || docDate > toDate) return false;
  return true;
};

const filterByUser = (doc, usuarioId) => {
  if (usuarioId === 'todos') return true;
  return doc.usuarioId === usuarioId;
};

const filterInvestmentSpecific = (doc, filters) => {
  if (filters.operacion !== 'todas' && doc.tipoOperacion !== filters.operacion) return false;
  if (filters.simboloActivo !== 'todos' && doc.activo !== filters.simboloActivo) return false;
  if (filters.tipoActivo !== 'todos' && doc.tipoActivo !== filters.tipoActivo) return false;
  if (filters.monedaInv !== 'todas' && doc.moneda !== filters.monedaInv) return false;
  return true;
};

const filterCashflowSpecific = (doc, filters) => {
  if (filters.tipoCashflow !== 'todos' && doc.tipo !== filters.tipoCashflow) return false;
  if (filters.categoria !== 'todos' && doc.categoria !== filters.categoria) return false;
  if (filters.monedaCash !== 'todas' && doc.moneda !== filters.monedaCash) return false;
  return true;
};

const filterAnnulled = (doc, includeAnnulled) => {
  if (!includeAnnulled && doc.anulada) return false;
  return true;
};

// --- METRICS CALCULATION ---

const calculateInvestmentMetrics = (results) => {
  const compras = results.filter((r) => r.tipoOperacion === 'compra');
  const ventas = results.filter((r) => r.tipoOperacion === 'venta');
  const totalCompras = compras.reduce((sum, r) => sum + (r.totalOperacion || r.montoTotal || 0), 0);
  const totalVentas = ventas.reduce((sum, r) => sum + (r.totalOperacion || r.montoTotal || 0), 0);

  return {
    count: results.length,
    totalCompras,
    totalVentas,
    neto: totalVentas - totalCompras,
  };
};

const calculateCashflowMetrics = (results) => {
  const gastos = results.filter((r) => r.tipo === 'gasto');
  const ingresos = results.filter((r) => r.tipo === 'ingreso');
  const totalGastos = gastos.reduce((sum, r) => sum + (r.monto || 0), 0);
  const totalIngresos = ingresos.reduce((sum, r) => sum + (r.monto || 0), 0);

  return {
    count: results.length,
    totalGastos,
    totalIngresos,
    neto: totalIngresos - totalGastos,
  };
};

// --- MAIN SEARCH FUNCTION ---

export const searchReports = async (appId, filters) => {
  try {
    const dataType = filters.tipoDatos === 'inversiones' ? 'inversiones' : 'cashflow';
    const fromDate = new Date(`${filters.fechaDesde}T00:00:00`);
    const toDate = new Date(`${filters.fechaHasta}T23:59:59`);

    // Fetch all documents from the appropriate collection
    const result = dataType === 'inversiones'
      ? await getAllTransactions(appId)
      : await getAllCashflows(appId);

    if (!result.success) {
      return { success: false, error: result.error, results: [], metrics: {} };
    }

    // Filter in-memory (client-side) to avoid Firestore composite index requirements
    const filtered = result.data.filter((doc) => {
      // Date range filter
      if (!filterByDateRange(doc, fromDate, toDate, dataType)) return false;

      // Usuario filter
      if (!filterByUser(doc, filters.usuario)) return false;

      // Type-specific filters
      if (dataType === 'inversiones') {
        if (!filterInvestmentSpecific(doc, filters)) return false;
      } else {
        if (!filterCashflowSpecific(doc, filters)) return false;
      }

      // Exclude annulled unless explicitly included
      if (!filterAnnulled(doc, filters.incluirAnulados)) return false;

      return true;
    });

    // Calculate metrics
    const metrics = dataType === 'inversiones'
      ? calculateInvestmentMetrics(filtered)
      : calculateCashflowMetrics(filtered);

    return {
      success: true,
      results: filtered,
      metrics,
    };
  } catch (error) {
    console.error('Error searching reports:', error);
    return {
      success: false,
      error: error.message,
      results: [],
      metrics: {},
    };
  }
};
