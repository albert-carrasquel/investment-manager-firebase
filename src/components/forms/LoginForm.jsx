import React, { useState, memo } from 'react';
import PropTypes from 'prop-types';

const LoginForm = memo(({ onLogin, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onLogin({ email, password });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hf-login-container">
      <div className="hf-card hf-login-card">
        <h2 className="text-2xl font-bold mb-6 hf-text-gradient text-center">
          Iniciar Sesión
        </h2>
        {error && (
          <div className="hf-alert hf-alert-error hf-mb-md">{error}</div>
        )}
        <form onSubmit={handleEmailLogin} className="hf-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="hf-input"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="hf-input"
          />
          <button
            type="submit"
            disabled={loading}
            className="hf-button hf-button-primary w-full"
          >
            {loading ? (
              <span className="hf-flex hf-gap-sm" style={{alignItems: 'center', justifyContent: 'center'}}>
                <span className="hf-loading"></span>
                <span>Ingresando...</span>
              </span>
            ) : 'Ingresar'}
          </button>
        </form>
        <div className="hf-divider"></div>
        <button
          type="button"
          onClick={() => onLogin({ google: true })}
          className="hf-button hf-button-secondary w-full"
          style={{background: '#EA4335', color: 'white', border: 'none'}}
        >
          Ingresar con Google
        </button>
      </div>
    </div>
  );
});

LoginForm.propTypes = {
  onLogin: PropTypes.func.isRequired,
  error: PropTypes.string,
};

LoginForm.displayName = 'LoginForm';

export default LoginForm;
