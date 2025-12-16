import React, { createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useFirebase } from '../hooks/useFirebase';
import { useTransactions } from '../hooks/useTransactions';
import { useCashflow } from '../hooks/useCashflow';
import { useReports } from '../hooks/useReports';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const firebase = useFirebase();
  
  const transactions = useTransactions({
    db: firebase.db,
    userId: firebase.userId,
    isAuthReady: firebase.isAuthReady,
    appId: firebase.appId,
    USER_NAMES: firebase.USER_NAMES,
  });

  const cashflow = useCashflow({
    db: firebase.db,
    userId: firebase.userId,
    isAuthReady: firebase.isAuthReady,
    appId: firebase.appId,
    USER_NAMES: firebase.USER_NAMES,
  });

  const reports = useReports({
    db: firebase.db,
    appId: firebase.appId,
  });

  const contextValue = useMemo(() => ({
    firebase,
    transactions,
    cashflow,
    reports,
  }), [firebase, transactions, cashflow, reports]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppContext;
