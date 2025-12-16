import React, { useRef, memo } from 'react';
import PropTypes from 'prop-types';
import { sanitizeActivo, sanitizeNombre, sanitizeDecimal } from '../../utils/formatters';

const TransactionForm = memo(({ 
  newTransaction, 
  fieldErrors, 
  activosList, 
  USER_NAMES,
  onInputChange,
  onSubmit,
  successMessage 
}) => {
  const compositionRef = useRef(false);

  const handleInputChange = (e) => {
    onInputChange(e, compositionRef);
  };

  const handlePaste = (e, sanitizer) => {
    const text = (e.clipboardData || window.clipboardData).getData('text') || '';
    const cleaned = sanitizer(text);
    if (!cleaned) {
      e.preventDefault();
    } else {
      e.preventDefault();
      const { name } = e.target;
      // Simular evento para mantener consistencia
      handleInputChange({ target: { name, value: cleaned } });
    }
  };

  return (
    <div className="hf-card" style={{maxWidth: '900px', margin: '0 auto'}}>
      <h2 className="text-2xl font-bold mb-6 hf-text-gradient text-center">
        Agregar nueva transacción
      </h2>

      {successMessage && (
        <div className="hf-alert hf-alert-success">
          {successMessage}
        </div>
      )}

      <form onSubmit={onSubmit} className="hf-form">
        <div className="hf-grid-2">
          <div className="hf-field">
            <label className="block text-sm font-medium">Tipo de Operación</label>
            <div className="hf-radio-group">
              <label className="hf-radio-label">
                <input 
                  type="radio" 
                  name="tipoOperacion" 
                  value="compra" 
                  checked={newTransaction.tipoOperacion === 'compra'} 
                  onChange={handleInputChange} 
                />
                <span>Compra</span>
              </label>
              <label className="hf-radio-label">
                <input 
                  type="radio" 
                  name="tipoOperacion" 
                  value="venta" 
                  checked={newTransaction.tipoOperacion === 'venta'} 
                  onChange={handleInputChange} 
                />
                <span>Venta</span>
              </label>
            </div>
          </div>
          
          <div className="hf-field">
            <label htmlFor="fechaTransaccion">Fecha de la transacción</label>
            <input 
              id="fechaTransaccion" 
              name="fechaTransaccion" 
              type="date" 
              required 
              value={newTransaction.fechaTransaccion || ''} 
              onChange={handleInputChange} 
              className="hf-input" 
            />
            {fieldErrors.fechaTransaccion && (
              <p className="hf-field-error">{fieldErrors.fechaTransaccion}</p>
            )}
          </div>
        </div>

        <div className="hf-field">
          <label htmlFor="usuarioId">Usuario</label>
          <select 
            id="usuarioId" 
            name="usuarioId" 
            value={newTransaction.usuarioId} 
            onChange={handleInputChange} 
            required 
            className="hf-select"
          >
            <option value="" disabled>Selecciona usuario...</option>
            {Object.entries(USER_NAMES).map(([uid, name]) => (
              <option key={uid} value={uid}>{name.split(' ')[0]}</option>
            ))}
          </select>
          {fieldErrors.usuarioId && (
            <p className="hf-field-error">{fieldErrors.usuarioId}</p>
          )}
        </div>

        <div className="hf-field">
          <label htmlFor="activo">Símbolo del Activo</label>
          {newTransaction.tipoOperacion === 'compra' ? (
            <input
              id="activo"
              name="activo"
              type="text"
              placeholder="Ej: BTC, AAPL, INTC"
              value={newTransaction.activo}
              onChange={handleInputChange}
              onPaste={(e) => handlePaste(e, sanitizeActivo)}
              onCompositionStart={() => { compositionRef.current = true; }}
              onCompositionEnd={(e) => {
                compositionRef.current = false;
                handleInputChange({ target: { name: 'activo', value: sanitizeActivo(e.target.value) }});
              }}
              required
              maxLength={10}
              className="hf-input uppercase"
            />
          ) : (
            <select
              id="activo"
              name="activo"
              value={newTransaction.activo}
              onChange={handleInputChange}
              required
              className="hf-select"
              disabled={activosList.length === 0}
            >
              {activosList.length === 0 ? (
                <option value="" disabled>No hay activos registrados</option>
              ) : (
                <>
                  <option value="" disabled>Selecciona símbolo...</option>
                  {activosList.map((sym) => (
                    <option key={sym} value={sym}>{sym}</option>
                  ))}
                </>
              )}
            </select>
          )}
          {fieldErrors.activo && (
            <p className="hf-field-error">{fieldErrors.activo}</p>
          )}
        </div>

        {/* Resto de campos del formulario... */}
        <div className="hf-field">
          <label htmlFor="nombreActivo">Nombre del Activo</label>
          <input 
            id="nombreActivo" 
            name="nombreActivo" 
            type="text" 
            placeholder="Ej: Bitcoin" 
            value={newTransaction.nombreActivo} 
            onChange={handleInputChange}
            onPaste={(e) => handlePaste(e, sanitizeNombre)}
            onCompositionStart={() => (compositionRef.current = true)} 
            onCompositionEnd={(e) => { 
              compositionRef.current = false; 
              handleInputChange(e); 
            }} 
            className="hf-input" 
          />
          {fieldErrors.nombreActivo && (
            <p className="hf-field-error">{fieldErrors.nombreActivo}</p>
          )}
        </div>

        <div className="hf-field">
          <label htmlFor="tipoActivo">Tipo de Activo</label>
          <select 
            id="tipoActivo" 
            name="tipoActivo" 
            value={newTransaction.tipoActivo} 
            onChange={handleInputChange} 
            required 
            className="hf-select"
          >
            <option value="" disabled>Selecciona tipo de activo...</option>
            <option value="Cripto">Cripto</option>
            <option value="Acciones">Acciones</option>
            <option value="Cedears">Cedears</option>
            <option value="Lecap">Lecap</option>
            <option value="Letra">Letra</option>
            <option value="Bono">Bono</option>
          </select>
          {fieldErrors.tipoActivo && (
            <p className="hf-field-error">{fieldErrors.tipoActivo}</p>
          )}
        </div>

        {/* Continuar con más campos según sea necesario... */}
        
        <button
          type="submit"
          disabled={newTransaction.tipoOperacion === 'venta' && activosList.length === 0}
          className="hf-button hf-button-primary w-full"
          style={{fontSize: '1.125rem', padding: '1rem'}}
        >
          Agregar Transacción
        </button>
      </form>
    </div>
  );
});

TransactionForm.propTypes = {
  newTransaction: PropTypes.shape({
    tipoOperacion: PropTypes.string.isRequired,
    activo: PropTypes.string.isRequired,
    usuarioId: PropTypes.string.isRequired,
    nombreActivo: PropTypes.string,
    tipoActivo: PropTypes.string.isRequired,
    cantidad: PropTypes.string.isRequired,
    precioUnitario: PropTypes.string.isRequired,
    moneda: PropTypes.string.isRequired,
    comision: PropTypes.string,
    monedaComision: PropTypes.string,
    exchange: PropTypes.string.isRequired,
    totalOperacion: PropTypes.string.isRequired,
    notas: PropTypes.string,
    fechaTransaccion: PropTypes.string.isRequired,
  }).isRequired,
  fieldErrors: PropTypes.object.isRequired,
  activosList: PropTypes.arrayOf(PropTypes.string).isRequired,
  USER_NAMES: PropTypes.object.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  successMessage: PropTypes.string,
};

TransactionForm.displayName = 'TransactionForm';

export default TransactionForm;
