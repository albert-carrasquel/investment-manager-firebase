import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '../../utils/formatters';

const CashflowForm = memo(({
  newCashflow,
  cashflowFieldErrors,
  cashflows,
  USER_NAMES,
  onInputChange,
  onSubmit,
  onShowAnnulConfirm,
  successMessage,
}) => {
  return (
    <div className="hf-card" style={{maxWidth: '900px', margin: '0 auto'}}>
      <h2 className="text-xl font-bold mb-4 hf-text-gradient text-center">
        Registrar Gasto / Ingreso
      </h2>

      {successMessage && (
        <div className="hf-alert hf-alert-success">
          {successMessage}
        </div>
      )}

      <form onSubmit={onSubmit} className="hf-form">
        <div className="hf-grid-2">
          <div className="hf-field">
            <label>Tipo</label>
            <select 
              name="tipo" 
              value={newCashflow.tipo} 
              onChange={onInputChange} 
              required 
              className="hf-select"
            >
              <option value="gasto">Gasto</option>
              <option value="ingreso">Ingreso</option>
            </select>
            {cashflowFieldErrors.tipo && (
              <p className="hf-field-error">{cashflowFieldErrors.tipo}</p>
            )}
          </div>
          
          <div className="hf-field">
            <label>Fecha</label>
            <input 
              name="fechaOperacion" 
              value={newCashflow.fechaOperacion || ''} 
              onChange={onInputChange} 
              type="date" 
              required 
              className="hf-input" 
            />
            {cashflowFieldErrors.fechaOperacion && (
              <p className="hf-field-error">{cashflowFieldErrors.fechaOperacion}</p>
            )}
          </div>
        </div>

        <div className="hf-field">
          <label>Usuario</label>
          <select 
            name="usuarioId" 
            value={newCashflow.usuarioId} 
            onChange={onInputChange} 
            required 
            className="hf-select"
          >
            <option value="" disabled>Selecciona usuario...</option>
            {Object.entries(USER_NAMES).map(([uid, name]) => (
              <option key={uid} value={uid}>
                {name.split(' ')[0]}
              </option>
            ))}
          </select>
          {cashflowFieldErrors.usuarioId && (
            <p className="hf-field-error">{cashflowFieldErrors.usuarioId}</p>
          )}
        </div>

        <div className="hf-grid-3">
          <div className="hf-field">
            <label>Monto</label>
            <input 
              name="monto" 
              value={newCashflow.monto} 
              onChange={onInputChange} 
              inputMode="decimal" 
              placeholder="Ej: 1000.00" 
              className="hf-input" 
              required
            />
            {cashflowFieldErrors.monto && (
              <p className="hf-field-error">{cashflowFieldErrors.monto}</p>
            )}
          </div>
          
          <div className="hf-field">
            <label>Moneda</label>
            <select 
              name="moneda" 
              value={newCashflow.moneda} 
              onChange={onInputChange} 
              required 
              className="hf-select"
            >
              <option value="">Selecciona moneda...</option>
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>
            {cashflowFieldErrors.moneda && (
              <p className="hf-field-error">{cashflowFieldErrors.moneda}</p>
            )}
          </div>
          
          <div className="hf-field">
            <label>Categoría</label>
            <select 
              name="categoria" 
              value={newCashflow.categoria} 
              onChange={onInputChange} 
              required 
              className="hf-select"
            >
              <option value="">Selecciona categoría...</option>
              <option value="Comida">Comida</option>
              <option value="Servicios">Servicios</option>
              <option value="Transporte">Transporte</option>
              <option value="Salud">Salud</option>
              <option value="Entretenimiento">Entretenimiento</option>
              <option value="Sueldo">Sueldo</option>
              <option value="Otros">Otros</option>
            </select>
            {cashflowFieldErrors.categoria && (
              <p className="hf-field-error">{cashflowFieldErrors.categoria}</p>
            )}
          </div>
        </div>

        <div className="hf-field">
          <label>Descripción (opcional)</label>
          <input 
            name="descripcion" 
            value={newCashflow.descripcion} 
            onChange={onInputChange} 
            placeholder="Detalle breve..." 
            className="hf-input" 
          />
        </div>

        <button 
          type="submit" 
          className="hf-button hf-button-primary w-full" 
          style={{fontSize: '1rem', padding: '0.875rem'}}
        >
          Guardar
        </button>
      </form>

      <div className="hf-divider"></div>

      <h3 className="text-lg font-semibold mb-3">Últimos 5 registros</h3>
      <div className="hf-list">
        {cashflows.length === 0 ? (
          <div className="hf-empty-state">
            <p>No hay registros recientes.</p>
          </div>
        ) : (
          cashflows.map((c) => (
            <CashflowItem
              key={c.id}
              cashflow={c}
              USER_NAMES={USER_NAMES}
              onShowAnnulConfirm={onShowAnnulConfirm}
            />
          ))
        )}
      </div>
    </div>
  );
});

const CashflowItem = memo(({ cashflow, USER_NAMES, onShowAnnulConfirm }) => {
  const formatDate = (date) => {
    if (date && date.toDate) return date.toDate().toLocaleDateString();
    if (date) return new Date(date).toLocaleDateString();
    return '';
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp || Date.now()).toLocaleString();
  };

  const getUserName = (usuarioId) => {
    return USER_NAMES[usuarioId] ? USER_NAMES[usuarioId].split(' ')[0] : 'Usuario';
  };

  return (
    <div className="hf-list-item hf-flex-between">
      <div>
        <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem'}}>
          <span className={`hf-badge ${cashflow.tipo === 'gasto' ? 'hf-badge-error' : 'hf-badge-success'}`}>
            {cashflow.tipo.toUpperCase()}
          </span>
          <span className="text-sm" style={{color: 'var(--hf-text-secondary)'}}>
            {cashflow.categoria}
          </span>
          <span className="text-sm font-medium" style={{color: 'var(--hf-accent-primary)'}}>
            {getUserName(cashflow.usuarioId)}
          </span>
        </div>
        <div className="font-bold text-lg">
          {formatCurrency(cashflow.monto || 0, cashflow.moneda || 'ARS')}
        </div>
        <div className="text-sm" style={{color: 'var(--hf-text-muted)'}}>
          {formatDate(cashflow.fechaOperacion)}
        </div>
        {cashflow.descripcion && (
          <div className="text-sm mt-1" style={{color: 'var(--hf-text-secondary)'}}>
            {cashflow.descripcion}
          </div>
        )}
        {cashflow.anulada && (
          <div className="mt-2">
            <span className="hf-badge hf-badge-warning">ANULADA</span>
          </div>
        )}
      </div>
      <div className="hf-flex" style={{flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem'}}>
        <div className="text-sm" style={{color: 'var(--hf-text-muted)'}}>
          {formatTimestamp(cashflow.timestamp)}
        </div>
        {!cashflow.anulada ? (
          <button 
            onClick={() => onShowAnnulConfirm(cashflow.id)} 
            className="hf-button hf-button-danger" 
            style={{padding: '0.5rem 1rem', fontSize: '0.875rem'}}
          >
            Anular
          </button>
        ) : (
          <button 
            disabled 
            className="hf-button" 
            style={{padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: 0.5}}
          >
            Anulada
          </button>
        )}
      </div>
    </div>
  );
});

CashflowForm.propTypes = {
  newCashflow: PropTypes.shape({
    tipo: PropTypes.string.isRequired,
    monto: PropTypes.string.isRequired,
    usuarioId: PropTypes.string.isRequired,
    moneda: PropTypes.string.isRequired,
    fechaOperacion: PropTypes.string.isRequired,
    categoria: PropTypes.string.isRequired,
    descripcion: PropTypes.string,
  }).isRequired,
  cashflowFieldErrors: PropTypes.object.isRequired,
  cashflows: PropTypes.arrayOf(PropTypes.object).isRequired,
  USER_NAMES: PropTypes.object.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onShowAnnulConfirm: PropTypes.func.isRequired,
  successMessage: PropTypes.string,
};

CashflowItem.propTypes = {
  cashflow: PropTypes.object.isRequired,
  USER_NAMES: PropTypes.object.isRequired,
  onShowAnnulConfirm: PropTypes.func.isRequired,
};

CashflowForm.displayName = 'CashflowForm';
CashflowItem.displayName = 'CashflowItem';

export default CashflowForm;
