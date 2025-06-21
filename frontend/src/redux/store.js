import { configureStore } from '@reduxjs/toolkit';

import lang from '@/locale/translation/en_us';

import rootReducer from './rootReducer';
import storePersist from './storePersist';

// localStorageHealthCheck();

const AUTH_INITIAL_STATE = {
  current: {},
  isLoggedIn: false,
  isLoading: false,
  isSuccess: false,
};

// Check if user is logged in from localStorage
const getInitialAuthState = () => {
  const stored_auth = storePersist.get('auth');
  
  if (stored_auth && stored_auth.current && stored_auth.current.token) {
    // User has a valid token, consider them logged in
    return {
      ...stored_auth,
      isLoggedIn: true,
      isLoading: false
    };
  }
  
  return AUTH_INITIAL_STATE;
};

// Get initial settings from localStorage or use defaults
const getInitialSettingsState = () => {
  const stored_settings = storePersist.get('settings');
  
  if (stored_settings) {
    return {
      result: stored_settings,
      isLoading: false,
      isSuccess: true
    };
  }
  
  // Default settings if none are found
  return {
    result: {
      crm_settings: {},
      finance_settings: {},
      company_settings: {},
      app_settings: {},
      money_format_settings: {
        default_currency_code: 'USD',
        currency_symbol: '$',
        currency_position: 'before',
        decimal_sep: '.',
        thousand_sep: ',',
        cent_precision: 2,
        zero_format: false
      }
    },
    isLoading: false,
    isSuccess: true
  };
};

const auth_state = getInitialAuthState();
const settings_state = getInitialSettingsState();

const initialState = { 
  auth: auth_state,
  settings: settings_state
};

const store = configureStore({
  reducer: rootReducer,
  preloadedState: initialState,
  devTools: import.meta.env.PROD === false, // Enable Redux DevTools in development mode
});

console.log(
  '🚀 Welcome to IDURAR ERP CRM! Did you know that we also offer commercial customization services? Contact us at hello@idurarapp.com for more information.'
);

export default store;
