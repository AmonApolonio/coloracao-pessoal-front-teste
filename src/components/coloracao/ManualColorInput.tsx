import React from 'react';

interface ManualColorInputProps {
  colors: Record<string, string>;
  onColorChange: (region: string, color: string) => void;
  regionNames: Record<string, string>;
  barbaDetected?: boolean;
}

const ManualColorInput: React.FC<ManualColorInputProps> = ({
  colors,
  onColorChange,
  regionNames,
  barbaDetected = false,
}) => {
  const regions = Object.keys(regionNames).filter(region => {
    // Filter out chin and mouth_contour if barba detected
    if (barbaDetected && (region === 'chin' || region === 'mouth_contour')) {
      return false;
    }
    return true;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
        Entrada Manual das Cores
      </h3>
      <p className="text-sm text-gray-600 mb-6 text-center">
        Preencha manualmente as cores de cada região para realizar a classificação
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {regions.map((region) => (
          <div key={region} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 block mb-1">
                {regionNames[region]}
              </label>
              <input
                type="text"
                value={colors[region] || ''}
                onChange={(e) => onColorChange(region, e.target.value)}
                placeholder="#000000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#947B62] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-12 h-12 rounded-md border-2 border-gray-300 shadow-sm"
                style={{ backgroundColor: colors[region] || '#ffffff' }}
              />
              <input
                type="color"
                value={colors[region] || '#000000'}
                onChange={(e) => onColorChange(region, e.target.value)}
                  className="w-12 h-8 cursor-pointer rounded border border-gray-300 bg-white"
              />
            </div>
          </div>
        ))}
      </div>

      {barbaDetected && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 text-center">
          ⚠️ Barba detectada — "Contorno da Boca" e "Queixo" foram omitidos
        </div>
      )}
    </div>
  );
};

export default ManualColorInput;
