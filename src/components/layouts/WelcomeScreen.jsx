import React, { memo } from 'react';
import PropTypes from 'prop-types';
import logo from '../../assets/logo.png';

const WelcomeScreen = memo(({ userName, onSelectTab }) => {
  return (
    <div className="hf-welcome">
      <div className="hf-card hf-welcome-card hf-text-center">
        <h1 className="hf-text-gradient">
          <img 
            src={logo} 
            alt="HomeFlow Logo" 
            className="inline-block mr-2" 
            style={{
              width: '48px', 
              height: '48px', 
              filter: 'drop-shadow(0 0 20px rgba(255, 176, 136, 0.4))'
            }} 
          />
          HomeFlow
        </h1>
        <p className="hf-welcome p">Bienvenido, {userName}</p>
        
        <div className="hf-divider"></div>
        
        <h2 className="text-xl font-bold mb-6">¿Qué sección deseas consultar?</h2>
        
        <div className="hf-features-grid">
          <button 
            className="hf-button hf-button-primary" 
            onClick={() => onSelectTab('inversiones')}
          >
            <span className="hf-feature-icon">📈</span>
            <span>Inversiones</span>
          </button>
          <button 
            className="hf-button hf-button-primary" 
            onClick={() => onSelectTab('gastos')}
          >
            <span className="hf-feature-icon">💰</span>
            <span>Gastos/Ingresos</span>
          </button>
          <button 
            className="hf-button hf-button-primary" 
            onClick={() => onSelectTab('reportes')}
          >
            <span className="hf-feature-icon">📊</span>
            <span>Reportes</span>
          </button>
        </div>
      </div>
    </div>
  );
});

WelcomeScreen.propTypes = {
  userName: PropTypes.string.isRequired,
  onSelectTab: PropTypes.func.isRequired,
};

WelcomeScreen.displayName = 'WelcomeScreen';

export default WelcomeScreen;
