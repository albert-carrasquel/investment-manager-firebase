import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '../../utils/formatters';

const ReportsForm = memo(({
  reportFilters,
  reportResults,
  reportMetrics,
  reportLoading,
  reportErrors,
  availableActivos,
  USER_NAMES,
  onFilterChange,
  onClearFilters,
  onSearchReports,
}) => {
  return (
    <div className="hf-card" style={{maxWidth: '1200px', margin: '0 auto'}}>
      <h2 className="text-xl font-bold mb-4 hf-text-gradient text-center">
        Reportes y Análisis
      </h2>

      {/* Filtros */}
      <div className="hf-form mb-6">
        <div className="hf-grid-3">
          <div className="hf-field">
            <label>Tipo de Datos</label>
            <select 
              name="tipoDatos" 
              value={reportFilters.tipoDatos} 
              onChange={onFilterChange} 
              required 
              className="hf-select"
            >
              <option value="">Selecciona tipo...</option>
              <option value="inversiones">Inversiones</option>
              <option value="cashflow">Gastos/Ingresos</option>
            </select>
            {reportErrors.tipoDatos && (
              <p className="hf-field-error">{reportErrors.tipoDatos}</p>
            )}
          </div>

          <div className="hf-field">
            <label>Usuario</label>
            <select 
              name="usuario" 
              value={reportFilters.usuario} 
              onChange={onFilterChange} 
              className="hf-select"
            >
              <option value="todos">Todos los usuarios</option>
              {Object.entries(USER_NAMES).map(([uid, name]) => (
                <option key={uid} value={uid}>
                  {name.split(' ')[0]}
                </option>
              ))}
            </select>
          </div>

          <div className="hf-field">
            <label>
              <input
                type="checkbox"
                name="incluirAnulados"
                checked={reportFilters.incluirAnulados}
                onChange={onFilterChange}
                style={{marginRight: '0.5rem'}}
              />
              Incluir registros anulados
            </label>
          </div>
        </div>

        <div className="hf-grid-2">
          <div className="hf-field">
            <label>Fecha Desde</label>
            <input 
              name="fechaDesde" 
              type="date" 
              value={reportFilters.fechaDesde} 
              onChange={onFilterChange} 
              className="hf-input" 
            />
            {reportErrors.fechaDesde && (
              <p className="hf-field-error">{reportErrors.fechaDesde}</p>
            )}
          </div>

          <div className="hf-field">
            <label>Fecha Hasta</label>
            <input 
              name="fechaHasta" 
              type="date" 
              value={reportFilters.fechaHasta} 
              onChange={onFilterChange} 
              className="hf-input" 
            />
            {reportErrors.fechaHasta && (
              <p className="hf-field-error">{reportErrors.fechaHasta}</p>
            )}
          </div>
        </div>

        {/* Filtros específicos para inversiones */}
        {reportFilters.tipoDatos === 'inversiones' && (
          <InvestmentFilters 
            reportFilters={reportFilters}
            availableActivos={availableActivos}
            onFilterChange={onFilterChange}
          />
        )}

        {/* Filtros específicos para cashflow */}
        {reportFilters.tipoDatos === 'cashflow' && (
          <CashflowFilters 
            reportFilters={reportFilters}
            onFilterChange={onFilterChange}
          />
        )}

        <div className="hf-flex hf-gap-md" style={{justifyContent: 'center', marginTop: '1.5rem'}}>
          <button 
            onClick={onSearchReports} 
            disabled={reportLoading}
            className="hf-button hf-button-primary"
          >
            {reportLoading ? (
              <span className="hf-flex hf-gap-sm" style={{alignItems: 'center'}}>
                <span className="hf-loading" style={{width: '16px', height: '16px'}}></span>
                <span>Buscando...</span>
              </span>
            ) : 'Buscar'}
          </button>
          
          <button 
            onClick={onClearFilters} 
            className="hf-button hf-button-secondary"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Errores generales */}
      {reportErrors.general && (
        <div className="hf-alert hf-alert-error mb-4">
          {reportErrors.general}
        </div>
      )}

      {/* Métricas */}
      {reportMetrics && (
        <ReportMetrics 
          metrics={reportMetrics}
          tipoDatos={reportFilters.tipoDatos}
        />
      )}

      {/* Resultados */}
      {reportResults.length > 0 && (
        <ReportResults 
          results={reportResults}
          tipoDatos={reportFilters.tipoDatos}
          USER_NAMES={USER_NAMES}
        />
      )}
    </div>
  );
});

const InvestmentFilters = memo(({ reportFilters, availableActivos, onFilterChange }) => (
  <div className="hf-grid-3">
    <div className="hf-field">
      <label>Operación</label>
      <select name="operacion" value={reportFilters.operacion} onChange={onFilterChange} className="hf-select">
        <option value="todas">Todas</option>
        <option value="compra">Compras</option>
        <option value="venta">Ventas</option>
      </select>
    </div>

    <div className="hf-field">
      <label>Símbolo Activo</label>
      <select name="simboloActivo" value={reportFilters.simboloActivo} onChange={onFilterChange} className="hf-select">
        <option value="todos">Todos</option>
        {availableActivos.map((activo) => (
          <option key={activo} value={activo}>{activo}</option>
        ))}
      </select>
    </div>

    <div className="hf-field">
      <label>Moneda</label>
      <select name="monedaInv" value={reportFilters.monedaInv} onChange={onFilterChange} className="hf-select">
        <option value="todas">Todas</option>
        <option value="ARS">ARS</option>
        <option value="USD">USD</option>
      </select>
    </div>
  </div>
));

const CashflowFilters = memo(({ reportFilters, onFilterChange }) => (
  <div className="hf-grid-3">
    <div className="hf-field">
      <label>Tipo</label>
      <select name="tipoCashflow" value={reportFilters.tipoCashflow} onChange={onFilterChange} className="hf-select">
        <option value="todos">Todos</option>
        <option value="gasto">Gastos</option>
        <option value="ingreso">Ingresos</option>
      </select>
    </div>

    <div className="hf-field">
      <label>Categoría</label>
      <select name="categoria" value={reportFilters.categoria} onChange={onFilterChange} className="hf-select">
        <option value="todos">Todas</option>
        <option value="Comida">Comida</option>
        <option value="Servicios">Servicios</option>
        <option value="Transporte">Transporte</option>
        <option value="Salud">Salud</option>
        <option value="Entretenimiento">Entretenimiento</option>
        <option value="Sueldo">Sueldo</option>
        <option value="Otros">Otros</option>
      </select>
    </div>

    <div className="hf-field">
      <label>Moneda</label>
      <select name="monedaCash" value={reportFilters.monedaCash} onChange={onFilterChange} className="hf-select">
        <option value="todas">Todas</option>
        <option value="ARS">ARS</option>
        <option value="USD">USD</option>
      </select>
    </div>
  </div>
));

const ReportMetrics = memo(({ metrics, tipoDatos }) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold mb-3">Resumen</h3>
    <div className="hf-grid-3">
      <div className="hf-card" style={{padding: '1rem', textAlign: 'center'}}>
        <p className="text-sm" style={{color: 'var(--hf-text-muted)'}}>Total Registros</p>
        <p className="text-xl font-bold">{metrics.count}</p>
      </div>

      {tipoDatos === 'inversiones' ? (
        <>
          <div className="hf-card" style={{padding: '1rem', textAlign: 'center'}}>
            <p className="text-sm" style={{color: 'var(--hf-text-muted)'}}>Total Compras</p>
            <p className="text-xl font-bold" style={{color: 'var(--hf-success)'}}>
              {formatCurrency(metrics.totalCompras, 'ARS')}
            </p>
          </div>
          <div className="hf-card" style={{padding: '1rem', textAlign: 'center'}}>
            <p className="text-sm" style={{color: 'var(--hf-text-muted)'}}>Total Ventas</p>
            <p className="text-xl font-bold" style={{color: 'var(--hf-error)'}}>
              {formatCurrency(metrics.totalVentas, 'ARS')}
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="hf-card" style={{padding: '1rem', textAlign: 'center'}}>
            <p className="text-sm" style={{color: 'var(--hf-text-muted)'}}>Total Ingresos</p>
            <p className="text-xl font-bold" style={{color: 'var(--hf-success)'}}>
              {formatCurrency(metrics.totalIngresos, 'ARS')}
            </p>
          </div>
          <div className="hf-card" style={{padding: '1rem', textAlign: 'center'}}>
            <p className="text-sm" style={{color: 'var(--hf-text-muted)'}}>Total Gastos</p>
            <p className="text-xl font-bold" style={{color: 'var(--hf-error)'}}>
              {formatCurrency(metrics.totalGastos, 'ARS')}
            </p>
          </div>
        </>
      )}
    </div>
  </div>
));

const ReportResults = memo(({ results, tipoDatos, USER_NAMES }) => (
  <div>
    <h3 className="text-lg font-semibold mb-3">Resultados ({results.length})</h3>
    <div className="hf-table-container">
      <table className="hf-table">
        <thead>
          <tr>
            {tipoDatos === 'inversiones' ? (
              <>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Operación</th>
                <th>Activo</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Total</th>
                <th>Moneda</th>
              </>
            ) : (
              <>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th>Monto</th>
                <th>Moneda</th>
                <th>Descripción</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {results.map((item) => (
            <ReportRow 
              key={item.id} 
              item={item} 
              tipoDatos={tipoDatos} 
              USER_NAMES={USER_NAMES} 
            />
          ))}
        </tbody>
      </table>
    </div>
  </div>
));

const ReportRow = memo(({ item, tipoDatos, USER_NAMES }) => {
  const formatDate = (occurredAt, timestamp) => {
    if (occurredAt && occurredAt.toDate) return occurredAt.toDate().toLocaleDateString();
    if (timestamp && timestamp.toDate) return timestamp.toDate().toLocaleDateString();
    if (occurredAt) return new Date(occurredAt).toLocaleDateString();
    return '';
  };

  const getUserName = (usuarioId) => {
    return USER_NAMES[usuarioId] ? USER_NAMES[usuarioId].split(' ')[0] : 'Usuario';
  };

  if (tipoDatos === 'inversiones') {
    return (
      <tr>
        <td>{formatDate(item.occurredAt, item.timestamp)}</td>
        <td>{getUserName(item.usuarioId)}</td>
        <td>
          <span className={`hf-badge ${item.tipoOperacion === 'compra' ? 'hf-badge-success' : 'hf-badge-error'}`}>
            {item.tipoOperacion?.toUpperCase()}
          </span>
        </td>
        <td>{item.activo}</td>
        <td>{item.cantidad}</td>
        <td>{formatCurrency(item.precioUnitario || 0, item.moneda || 'ARS')}</td>
        <td>{formatCurrency(item.totalOperacion || item.montoTotal || 0, item.moneda || 'ARS')}</td>
        <td>{item.moneda}</td>
      </tr>
    );
  }

  return (
    <tr>
      <td>{formatDate(item.occurredAt, item.timestamp)}</td>
      <td>{getUserName(item.usuarioId)}</td>
      <td>
        <span className={`hf-badge ${item.tipo === 'gasto' ? 'hf-badge-error' : 'hf-badge-success'}`}>
          {item.tipo?.toUpperCase()}
        </span>
      </td>
      <td>{item.categoria}</td>
      <td>{formatCurrency(item.monto || 0, item.moneda || 'ARS')}</td>
      <td>{item.moneda}</td>
      <td>{item.descripcion || '-'}</td>
    </tr>
  );
});

// PropTypes
ReportsForm.propTypes = {
  reportFilters: PropTypes.object.isRequired,
  reportResults: PropTypes.array.isRequired,
  reportMetrics: PropTypes.object,
  reportLoading: PropTypes.bool.isRequired,
  reportErrors: PropTypes.object.isRequired,
  availableActivos: PropTypes.array.isRequired,
  USER_NAMES: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onClearFilters: PropTypes.func.isRequired,
  onSearchReports: PropTypes.func.isRequired,
};

InvestmentFilters.propTypes = {
  reportFilters: PropTypes.object.isRequired,
  availableActivos: PropTypes.array.isRequired,
  onFilterChange: PropTypes.func.isRequired,
};

CashflowFilters.propTypes = {
  reportFilters: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
};

ReportMetrics.propTypes = {
  metrics: PropTypes.object.isRequired,
  tipoDatos: PropTypes.string.isRequired,
};

ReportResults.propTypes = {
  results: PropTypes.array.isRequired,
  tipoDatos: PropTypes.string.isRequired,
  USER_NAMES: PropTypes.object.isRequired,
};

ReportRow.propTypes = {
  item: PropTypes.object.isRequired,
  tipoDatos: PropTypes.string.isRequired,
  USER_NAMES: PropTypes.object.isRequired,
};

// Display names
ReportsForm.displayName = 'ReportsForm';
InvestmentFilters.displayName = 'InvestmentFilters';
CashflowFilters.displayName = 'CashflowFilters';
ReportMetrics.displayName = 'ReportMetrics';
ReportResults.displayName = 'ReportResults';
ReportRow.displayName = 'ReportRow';

export default ReportsForm;
