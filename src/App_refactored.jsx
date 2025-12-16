import React, { useState } from 'react';
import { useFirebase } from './hooks/useFirebase';
import { useTransactions } from './hooks/useTransactions';
import LoginForm from './components/forms/LoginForm';
import WelcomeScreen from './components/layouts/WelcomeScreen';
import MainLayout from './components/layouts/MainLayout';
import TransactionForm from './components/forms/TransactionForm';
import ConfirmationModal from './components/ConfirmationModal';

const App = () => {
  const [tab, setTab] = useState(''); // '', 'inversiones', 'gastos', 'reportes'
  
  const firebase = useFirebase();
  const {
    db,
    userId,
    isAuthReady,
    isLoading,
    error,
    isSuperAdmin,
    userName,
    showLogin,
    loginError,
    handleLogin,
    appId,
    USER_NAMES,
    DEV_BYPASS_AUTH,
  } = firebase;

  const transactions = useTransactions({
    db,
    userId,
    isAuthReady,
    appId,
    USER_NAMES,
  });

  // Estados para cashflow (simplificado por ahora)
  const [cashflows, setCashflows] = useState([]);
  const [newCashflow, setNewCashflow] = useState({
    tipo: 'gasto',
    monto: '',
    usuarioId: '',
    moneda: '',
    fechaOperacion: '',
    categoria: '',
    descripcion: '',
  });

  // Estados para reportes (simplificado por ahora)
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

  // Renderizado condicional
  if (isLoading) {
    return (
      <div className="hf-flex-center" style={{minHeight: '100vh'}}>
        <div className="hf-card hf-text-center">
          <div className="hf-loading" style={{width: '40px', height: '40px', margin: '0 auto 1rem'}}></div>
          <p className="text-xl">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hf-page hf-flex-center" style={{minHeight: '100vh'}}>
        <div className="hf-card hf-alert-error" style={{maxWidth: '500px'}}>
          <h2 className="text-2xl font-bold mb-4">Error de Configuración/Conexión</h2>
          <p className="font-semibold mb-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!DEV_BYPASS_AUTH && !isSuperAdmin && isAuthReady) {
    return (
      <div className="hf-page hf-flex-center" style={{minHeight: '100vh'}}>
        <div className="hf-card hf-alert-error" style={{maxWidth: '500px'}}>
          <h2 className="text-2xl font-bold mb-4">Acceso Denegado</h2>
        </div>
      </div>
    );
  }

  if (!DEV_BYPASS_AUTH && showLogin && isAuthReady && !userId) {
    return <LoginForm onLogin={handleLogin} error={loginError} />;
  }

  if (!tab) {
    return <WelcomeScreen userName={userName} onSelectTab={setTab} />;
  }

  // Renderizar contenido según la pestaña seleccionada
  const renderTabContent = () => {
    switch (tab) {
      case 'inversiones':
        return (
          <TransactionForm
            newTransaction={transactions.newTransaction}
            fieldErrors={transactions.fieldErrors}
            activosList={transactions.activosList}
            USER_NAMES={USER_NAMES}
            onInputChange={transactions.handleInputChange}
            onSubmit={transactions.handleAddTransaction}
            successMessage={transactions.successMessage}
          />
        );
      
      case 'gastos':
        return (
          <div className="hf-card" style={{maxWidth: '900px', margin: '0 auto'}}>
            <h2 className="text-xl font-bold mb-4 hf-text-gradient text-center">
              Registrar Gasto / Ingreso
            </h2>
            {/* TODO: Crear componente CashflowForm */}
            <p>Formulario de gastos/ingresos (por implementar)</p>
          </div>
        );
      
      case 'reportes':
        return (
          <div className="hf-card" style={{maxWidth: '900px', margin: '0 auto'}}>
            <h2 className="text-xl font-bold mb-4 hf-text-gradient text-center">
              Reportes
            </h2>
            {/* TODO: Crear componente ReportsForm */}
            <p>Sección de reportes (por implementar)</p>
          </div>
        );
      
      default:
        return <div>Sección no encontrada</div>;
    }
  };

  const getTabTitle = () => {
    switch (tab) {
      case 'inversiones': return 'Inversiones';
      case 'gastos': return 'Gastos / Ingresos';
      case 'reportes': return 'Reportes';
      default: return 'HomeFlow';
    }
  };

  return (
    <>
      <MainLayout
        title={getTabTitle()}
        onBack={() => setTab('')}
        userName={userName}
      >
        {renderTabContent()}
      </MainLayout>

      {/* Modales */}
      {transactions.showConfirmModal && (
        <ConfirmationModal 
          onConfirm={transactions.handleDeleteTransaction} 
          onCancel={transactions.handleCancelDelete} 
        />
      )}
    </>
  );
};

export default App;
