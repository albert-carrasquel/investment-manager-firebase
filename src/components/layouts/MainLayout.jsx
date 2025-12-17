import React, { memo } from 'react';
import PropTypes from 'prop-types';
import logo from '../../assets/logo.png';

const MainLayout = memo(({ children, title, onBack, userName }) => {
  return (
    <div className="hf-page">
      <div className="hf-header">
        <div className="hf-flex hf-gap-md" style={{alignItems: 'center'}}>
          <img 
            src={logo} 
            alt="HomeFlow Logo" 
            style={{
              width: '40px', 
              height: '40px', 
              filter: 'drop-shadow(0 0 12px rgba(255, 176, 136, 0.3))'
            }} 
          />
          <h2>{title}</h2>
          {userName && (
            <span className="text-sm" style={{color: 'var(--hf-text-muted)', marginLeft: 'auto'}}>
              {userName}
            </span>
          )}
        </div>
        {onBack && (
          <button className="hf-button hf-button-ghost" onClick={onBack}>
            Volver
          </button>
        )}
      </div>
      {children}
    </div>
  );
});

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  onBack: PropTypes.func,
  userName: PropTypes.string,
};

MainLayout.displayName = 'MainLayout';

export default MainLayout;
