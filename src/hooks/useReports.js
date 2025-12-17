import { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { getOccurredAtFromDoc } from '../utils/formatters';

const getTransactionsCollectionPath = (appId) => `artifacts/${appId}/public/data/transactions`;
const getCashflowCollectionPath = (appId) => `artifacts/${appId}/public/data/cashflow`;

export const useReports = ({ db, appId }) => {
  const [reportFilters, setReportFilters] = useState({
    tipoDatos: '',
    usuario: 'todos',
    fechaDesde: '',
    fechaHasta: '',
    operacion: 'todas',
    simboloActivo: 'todos',
    monedaInv: 'todas',
    tipoCashflow: 'todos',
    categoria: 'todos',
    medioPago: 'todos',
    monedaCash: 'todas',
    incluirAnulados: false,
  });
  
  const [reportResults, setReportResults] = useState([]);
  const [reportMetrics, setReportMetrics] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportErrors, setReportErrors] = useState({});
  const [availableActivos, setAvailableActivos] = useState([]);

  // Fetch available activos for reports
  useEffect(() => {
    if (!db || reportFilters.tipoDatos !== 'inversiones') return;
    
    const fetchActivos = async () => {
      try {
        const transactionsPath = getTransactionsCollectionPath(appId);
        const q = query(collection(db, transactionsPath));
        const snapshot = await getDocs(q);
        const activos = new Set();
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.activo) activos.add(data.activo);
        });
        setAvailableActivos(Array.from(activos).sort());
      } catch (e) {
        console.error('Error fetching activos for reports:', e);
      }
    };
    
    fetchActivos();
  }, [db, reportFilters.tipoDatos, appId]);

  const handleReportFilterChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setReportFilters((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    setReportErrors((prev) => ({ ...prev, [name]: null }));
  }, []);

  const handleClearReportFilters = useCallback(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString().split('T')[0];
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      .toISOString().split('T')[0];
    
    setReportFilters({
      tipoDatos: '',
      usuario: 'todos',
      fechaDesde: firstDay,
      fechaHasta: lastDay,
      operacion: 'todas',
      simboloActivo: 'todos',
      monedaInv: 'todas',
      tipoCashflow: 'todos',
      categoria: 'todos',
      medioPago: 'todos',
      monedaCash: 'todas',
      incluirAnulados: false,
    });
    setReportResults([]);
    setReportMetrics(null);
    setReportErrors({});
  }, []);

  const validateReportFilters = useCallback(() => {
    const errors = {};
    if (!reportFilters.tipoDatos) errors.tipoDatos = 'Selecciona el tipo de datos.';
    if (!reportFilters.fechaDesde) errors.fechaDesde = 'Indica la fecha desde.';
    if (!reportFilters.fechaHasta) errors.fechaHasta = 'Indica la fecha hasta.';
    if (reportFilters.fechaDesde && reportFilters.fechaHasta && 
        reportFilters.fechaDesde > reportFilters.fechaHasta) {
      errors.fechaHasta = 'La fecha "Hasta" debe ser mayor o igual a "Desde".';
    }
    return errors;
  }, [reportFilters]);

  const calculateMetrics = useCallback((filtered, tipoDatos) => {
    if (tipoDatos === 'inversiones') {
      const compras = filtered.filter((r) => r.tipoOperacion === 'compra');
      const ventas = filtered.filter((r) => r.tipoOperacion === 'venta');
      const totalCompras = compras.reduce((sum, r) => sum + (r.montoTotal || 0), 0);
      const totalVentas = ventas.reduce((sum, r) => sum + (r.montoTotal || 0), 0);
      return { 
        count: filtered.length, 
        totalCompras, 
        totalVentas, 
        neto: totalVentas - totalCompras 
      };
    } else {
      const gastos = filtered.filter((r) => r.tipo === 'gasto');
      const ingresos = filtered.filter((r) => r.tipo === 'ingreso');
      const totalGastos = gastos.reduce((sum, r) => sum + (r.monto || 0), 0);
      const totalIngresos = ingresos.reduce((sum, r) => sum + (r.monto || 0), 0);
      return { 
        count: filtered.length, 
        totalGastos, 
        totalIngresos, 
        neto: totalIngresos - totalGastos 
      };
    }
  }, []);

  const filterResults = useCallback((allResults, filters) => {
    const fromDate = new Date(`${filters.fechaDesde}T00:00:00`);
    const toDate = new Date(`${filters.fechaHasta}T23:59:59`);
    const dataType = filters.tipoDatos === 'inversiones' ? 'inversiones' : 'cashflow';

    return allResults.filter((r) => {
      // Date range filter
      const docDate = getOccurredAtFromDoc(r, dataType);
      if (!docDate || docDate < fromDate || docDate > toDate) return false;

      // Usuario filter
      if (filters.usuario !== 'todos' && r.usuarioId !== filters.usuario) return false;

      // Tipo-specific filters
      if (filters.tipoDatos === 'inversiones') {
        if (filters.operacion !== 'todas' && r.tipoOperacion !== filters.operacion) return false;
        if (filters.simboloActivo !== 'todos' && r.activo !== filters.simboloActivo) return false;
        if (filters.monedaInv !== 'todas' && r.moneda !== filters.monedaInv) return false;
      } else {
        if (filters.tipoCashflow !== 'todos' && r.tipo !== filters.tipoCashflow) return false;
        if (filters.categoria !== 'todos' && r.categoria !== filters.categoria) return false;
        if (filters.monedaCash !== 'todas' && r.moneda !== filters.monedaCash) return false;
      }

      // Exclude anulados unless explicitly included
      if (!filters.incluirAnulados && r.anulada) return false;

      return true;
    });
  }, []);

  const handleSearchReports = useCallback(async () => {
    const errors = validateReportFilters();
    
    if (Object.keys(errors).length > 0) {
      setReportErrors(errors);
      return;
    }

    setReportLoading(true);
    setReportErrors({});

    try {
      const collectionPath = reportFilters.tipoDatos === 'inversiones' 
        ? getTransactionsCollectionPath(appId) 
        : getCashflowCollectionPath(appId);

      const q = query(collection(db, collectionPath));
      const snapshot = await getDocs(q);
      const allResults = [];
      
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        allResults.push({ id: docSnap.id, ...data });
      });

      const filtered = filterResults(allResults, reportFilters);
      const metrics = calculateMetrics(filtered, reportFilters.tipoDatos);

      setReportResults(filtered);
      setReportMetrics(metrics);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setReportErrors({ general: 'Error al consultar reportes. Verifica las reglas de Firestore.' });
    } finally {
      setReportLoading(false);
    }
  }, [reportFilters, validateReportFilters, appId, db, filterResults, calculateMetrics]);

  // Memoized values for performance
  const memoizedFilters = useMemo(() => reportFilters, [reportFilters]);
  const memoizedResults = useMemo(() => reportResults, [reportResults]);
  const memoizedMetrics = useMemo(() => reportMetrics, [reportMetrics]);

  return {
    reportFilters: memoizedFilters,
    setReportFilters,
    reportResults: memoizedResults,
    reportMetrics: memoizedMetrics,
    reportLoading,
    reportErrors,
    availableActivos,
    handleReportFilterChange,
    handleClearReportFilters,
    handleSearchReports,
  };
};
