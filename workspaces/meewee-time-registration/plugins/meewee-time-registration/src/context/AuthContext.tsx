import React, { createContext, useReducer, useEffect } from 'react';
import { AuthAction, AuthContextProps, AuthState } from '../types/authContext';

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.userName,
        token: action.payload.token,
      };
    case 'LOGOUT':
      return { ...state, isAuthenticated: false, user: null, token: null };
    default:
      return state;
  }
};

const AuthProvider = ({ children }: any) => {
  const [state, dispatch] = useReducer(authReducer, initialState, initial => {
    const persisted = localStorage.getItem('authState');
    return persisted ? JSON.parse(persisted) : initial;
  });

  useEffect(() => {
    localStorage.setItem('authState', JSON.stringify(state));
  }, [state]);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
