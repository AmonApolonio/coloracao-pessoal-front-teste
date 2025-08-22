import React, { useEffect, useState } from 'react';
import { validateApiConfiguration } from '../../services';

interface ApiConfigValidatorProps {
  children: React.ReactNode;
  showWarnings?: boolean;
}

/**
 * Component that validates API configuration on mount
 * Can be used to wrap the app and ensure all required endpoints are configured
 */
export const ApiConfigValidator: React.FC<ApiConfigValidatorProps> = ({ 
  children, 
  showWarnings = true 
}) => {
  const [isValid, setIsValid] = useState(true);
  const [missingEndpoints, setMissingEndpoints] = useState<string[]>([]);

  useEffect(() => {
    const validation = validateApiConfiguration();
    setIsValid(validation.valid);
    setMissingEndpoints(validation.missingEndpoints);

    if (!validation.valid && showWarnings) {
      console.warn('Missing API configuration:', validation.missingEndpoints);
    }
  }, [showWarnings]);

  if (!isValid && showWarnings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-white p-8 rounded-lg shadow-lg border border-red-200 max-w-2xl">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            ⚠️ Configuração de API Incompleta
          </h2>
          <p className="text-gray-700 mb-4">
            As seguintes variáveis de ambiente precisam ser configuradas:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-6">
            {missingEndpoints.map((endpoint, index) => (
              <li key={index} className="text-sm text-gray-600">
                <code className="bg-gray-100 px-2 py-1 rounded text-red-600">
                  {endpoint}
                </code>
              </li>
            ))}
          </ul>
          <p className="text-sm text-gray-500">
            Adicione essas variáveis ao seu arquivo <code>.env</code> e reinicie a aplicação.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ApiConfigValidator;
