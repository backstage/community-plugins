import React from 'react';
import { AuthProvider } from './context/AuthContext';
import MainComponent from './components/MainComponent/MainComponent';

const App = () => {
  return (
    <AuthProvider>
      <MainComponent />
    </AuthProvider>
  );
};

export default App;
