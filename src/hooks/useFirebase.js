import { useState, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, setLogLevel } from 'firebase/firestore';

// Configuración global
const rawAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const appId = rawAppId.replace(/[.:]/g, '-').replace(/\//g, '-');

const DEV_BYPASS_AUTH = true;
const DEV_USER_ID = 'dev-albert';

const firebaseConfig =
  typeof __firebase_config !== 'undefined' && __firebase_config
    ? JSON.parse(__firebase_config)
    : {
        apiKey: 'AIzaSyDqQN-Lf4xZInlqysBaFIwNG2uCGQ1Vde4',
        authDomain: 'investment-manager-e47b6.firebaseapp.com',
        projectId: 'investment-manager-e47b6',
        storageBucket: 'investment-manager-e47b6.firebasestorage.app',
        messagingSenderId: '471997247184',
        appId: '1:471997247184:web:1a571d1cf28a8cfdd6b8d5',
      };

const SUPER_ADMINS = [
  '9dZMQNvgovSWE4lP7tOUNDzy6Md2',
  'T0Kh0eHZ05he8iqD6vEG2G2c7Rl2',
];

const USER_NAMES = {
  '9dZMQNvgovSWE4lP7tOUNDzy6Md2': 'Albert Carrasquel',
  'T0Kh0eHZ05he8iqD6vEG2G2c7Rl2': 'Haydee Macias',
};

export const useFirebase = () => {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(!!DEV_BYPASS_AUTH);
  const [userName, setUserName] = useState(DEV_BYPASS_AUTH ? 'Dev Mode' : '');
  const [showLogin, setShowLogin] = useState(true);
  const [loginError, setLoginError] = useState(null);

  // Inicialización de Firebase
  useEffect(() => {
    if (!firebaseConfig || Object.keys(firebaseConfig).length === 0) {
      setTimeout(() => {
        setError('Error: Firebase configuration is missing.');
        setIsLoading(false);
      }, 0);
      return;
    }

    const app = initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const firebaseAuth = getAuth(app);

    setLogLevel('debug');
    
    setTimeout(() => {
      setDb(firestore);
      setAuth(firebaseAuth);
      setIsAuthReady(true);
      setIsLoading(false);
    }, 0);

    if (DEV_BYPASS_AUTH) {
      setTimeout(() => {
        setUserId(DEV_USER_ID);
        setUserName('Dev Mode');
        setIsSuperAdmin(true);
        setShowLogin(false);
        setLoginError(null);
      }, 0);
    }
  }, []);

  // Actualizar nombre de usuario
  useEffect(() => {
    if (userId && USER_NAMES[userId]) {
      setTimeout(() => setUserName(USER_NAMES[userId]), 0);
      return;
    }

    if (auth && userId) {
      const user = auth.currentUser;
      setTimeout(() => setUserName(user?.displayName || user?.email || 'Usuario'), 0);
    }
  }, [auth, userId]);

  const handleLogin = useCallback(async ({ email, password, google }) => {
    setLoginError(null);
    try {
      if (google) {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        setUserId(userCredential.user.uid);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setUserId(userCredential.user.uid);
      }
      setShowLogin(false);
    } catch (e) {
      setLoginError(e.message);
    }
  }, [auth]);

  const contextValue = useMemo(() => ({
    db,
    auth,
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
    SUPER_ADMINS,
    DEV_BYPASS_AUTH,
  }), [
    db,
    auth,
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
  ]);

  return contextValue;
};
