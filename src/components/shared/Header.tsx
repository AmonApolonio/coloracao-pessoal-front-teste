import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      logout();
    }
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <img
              src="/assets/icons/gennie_icon.svg"
              alt="Gennie"
              className="h-8 w-auto"
            />
            <h1 className="ml-3 text-xl font-bold text-gray-800">
              Gennie - Coloração Pessoal
            </h1>
          </div>
          
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="bg-gray-100 hover:bg-[#947B62] hover:text-white text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
