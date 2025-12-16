import React, { useState, memo } from 'react';
import PropTypes from 'prop-types';
import { AppProvider, useAppContext } from './contexts/AppContext';
import LoginForm from './components/forms/LoginForm';
import WelcomeScreen from './components/layouts/WelcomeScreen';
import MainLayout from './components/layouts/MainLayout';
import TransactionForm from './components/forms/TransactionForm';
import CashflowForm from './components/forms/CashflowForm';
import ReportsForm from './components/reports/ReportsForm';
import ConfirmationModal from './components/ConfirmationModal';

// Componentes de carga y error optimizados
const LoadingScreen = memo(() => (
  <div className="hf-flex-center" style={{minHeight: '100vh'}}>
    <div className="hf-card hf-text-center">
      <div className="hf-loading" style={{width: '40px', height: '40px', margin: '0 auto 1rem'}}></div>
      <p className="text-xl">Cargando aplicación...</p>
    </div>
  </div>
));

const ErrorScreen = memo(({ error }) => (
  <div className="hf-page hf-flex-center" style={{minHeight: '100vh'}}>
    <div className="hf-card hf-alert-error" style={{maxWidth: '500px'}}>
      <h2 className="text-2xl font-bold mb-4">Error de Configuración/Conexión</h2>
      <p className="font-semibold mb-2">{error}</p>
    </div>
  </div>
));

const AccessDeniedScreen = memo(() => (
  <div className="hf-page hf-flex-center" style={{minHeight: '100vh'}}>
    <div className="hf-card hf-alert-error" style={{maxWidth: '500px'}}>
      <h2 className="text-2xl font-bold mb-4">Acceso Denegado</h2>
    </div>
  </div>
));

// Componente principal de la aplicación (sin Context)
const AppContent = memo(() => {
  const [tab, setTab] = useState(''); // '', 'inversiones', 'gastos', 'reportes'
  const { firebase, transactions, cashflow, reports } = useAppContext();

  const {
    isLoading,
    error,
    isSuperAdmin,
    userName,
    showLogin,
    loginError,
    handleLogin,
    USER_NAMES,
    DEV_BYPASS_AUTH,
    userId,
    isAuthReady,
  } = firebase;

  // Renderizado condicional optimizado
  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  if (!DEV_BYPASS_AUTH && !isSuperAdmin && isAuthReady) {
    return <AccessDeniedScreen />;
  }

  if (!DEV_BYPASS_AUTH && showLogin && isAuthReady && !userId) {
    return <LoginForm onLogin={handleLogin} error={loginError} />;
  }

  if (!tab) {
    return <WelcomeScreen userName={userName} onSelectTab={setTab} />;
  }

  // Render optimizado del contenido según la pestaña
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
          <CashflowForm
            newCashflow={cashflow.newCashflow}
            cashflowFieldErrors={cashflow.cashflowFieldErrors}
            cashflows={cashflow.cashflows}
            USER_NAMES={USER_NAMES}
            onInputChange={cashflow.handleInputChange}
            onSubmit={cashflow.handleAddCashflow}
            onShowAnnulConfirm={cashflow.handleShowAnnulConfirm}
            successMessage={cashflow.successMessage}
          />
        );
      
      case 'reportes':
        return (
          <ReportsForm
            reportFilters={reports.reportFilters}
            reportResults={reports.reportResults}
            reportMetrics={reports.reportMetrics}
            reportLoading={reports.reportLoading}
            reportErrors={reports.reportErrors}
            availableActivos={reports.availableActivos}
            USER_NAMES={USER_NAMES}
            onFilterChange={reports.handleReportFilterChange}
            onClearFilters={reports.handleClearReportFilters}
            onSearchReports={reports.handleSearchReports}
          />
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

      {/* Modales optimizados */}
      <AppModals 
        transactions={transactions}
        cashflow={cashflow}
      />
    </>
  );
});

// Componente separado para modales (evita re-renders innecesarios)
const AppModals = memo(({ transactions, cashflow }) => (
  <>
    {transactions.showConfirmModal && (
      <ConfirmationModal 
        onConfirm={transactions.handleDeleteTransaction} 
        onCancel={transactions.handleCancelDelete} 
      />
    )}
    
    {cashflow.showAnnulModal && (
      <ConfirmationModal 
        onConfirm={cashflow.handleAnnulCashflow} 
        onCancel={cashflow.handleCancelAnnul} 
      />
    )}
  </>
));

// Componente App principal (con Context Provider)
const App = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

// PropTypes para componentes
ErrorScreen.propTypes = {
  error: PropTypes.string.isRequired,
};

AppModals.propTypes = {
  transactions: PropTypes.object.isRequired,
  cashflow: PropTypes.object.isRequired,
};

// Display names para debugging
LoadingScreen.displayName = 'LoadingScreen';
ErrorScreen.displayName = 'ErrorScreen';
AccessDeniedScreen.displayName = 'AccessDeniedScreen';
AppContent.displayName = 'AppContent';
AppModals.displayName = 'AppModals';
App.displayName = 'App';

export default App;
