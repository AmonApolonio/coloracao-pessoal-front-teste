import React from 'react';
import './index.css'; // Import base styles and font
import './App.css'; // Import our custom CSS
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Header from './components/shared/Header';
import ColoracaoSimplificado from './components/coloracao-simplificado/ColoracaoSimplificado.tsx';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 font-fraunces">
        <ProtectedRoute>
          <Header />
          <ColoracaoSimplificado />
        </ProtectedRoute>
      </div>
    </AuthProvider>
  );
}

export default App;
