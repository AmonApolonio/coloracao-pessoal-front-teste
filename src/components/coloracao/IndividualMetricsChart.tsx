import React, { useState } from 'react';
import { ColoracaoClassificacaoResponse } from '../../types/coloracaoSimplificado';

interface IndividualMetricsChartProps {
  finalResults: ColoracaoClassificacaoResponse;
}

type MetricType = 'saturation' | 'brightness';

const IndividualMetricsChart: React.FC<IndividualMetricsChartProps> = ({
  finalResults,
}) => {
  const [activeTab, setActiveTab] = useState<MetricType>('saturation');

  // Region display names matching the pattern from screenshots
  const regionNames: Record<string, string> = {
    hair_root: 'CABELO',
    iris: 'OLHO',
    forehead: 'TESTA',
    cheek: 'BOCHECHA',
    under_eye_skin: 'CAVIDADE OCULAR',
    mouth_contour: 'BOCA (CONTORNO)',
    mouth: 'BOCA (PREDOMINANTE)',
    chin: 'QUEIXO',
  };

  // Order of regions to display
  const regionOrder = [
    'hair_root',
    'under_eye_skin',
    'iris',
    'chin',
    'forehead',
    'mouth_contour',
    'cheek',
    'mouth',
  ];

  // Get metric value for a region
  const getMetricValue = (region: string, metricType: MetricType): number => {
    let key = `${region}_${metricType}`;
    
    // Special case for hair_root
    if (region === 'hair_root') {
      key = `hair_${metricType}`;
    }

    const details = finalResults.output.details[`${metricType}-details`];
    return details[key as keyof typeof details] as number;
  };

  // Render a single slider for a region
  const renderSlider = (region: string, metricType: MetricType) => {
    const value = getMetricValue(region, metricType);
    const displayName = regionNames[region] || region;
    
    // Calculate position percentage (0-100 scale)
    const position = value;

    // Labels based on metric type
    const leftLabel = metricType === 'saturation' ? 'FRIO' : 'ESCURO';
    const centerLabel = 'N';
    const rightLabel = metricType === 'saturation' ? 'QUENTE' : 'CLARO';

    return (
      <div key={region} className="mb-6">
        {/* Region name with yellow background */}
        <div className="mb-2">
          <span className="bg-yellow-300 px-3 py-1 text-sm font-bold text-gray-800 inline-block">
            {displayName}
          </span>
        </div>
        
        {/* Slider container */}
        <div className="relative">
          {/* Slider track */}
          <div className="relative h-2 bg-gradient-to-r from-gray-400 via-gray-300 to-gray-600 rounded-full">
            {/* Marker circle */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-orange-500 border-4 border-white rounded-full shadow-lg transition-all duration-300"
              style={{ left: `calc(${position}% - 12px)` }}
            />
          </div>

          {/* Labels container */}
          <div className="flex justify-between mt-2 px-1">
            <span className="text-xs font-semibold text-gray-700 bg-gray-200 px-2 py-1 rounded">
              {leftLabel}
            </span>
            <span className="text-xs font-semibold text-gray-700 bg-gray-200 px-2 py-1 rounded">
              {centerLabel}
            </span>
            <span className="text-xs font-semibold text-gray-700 bg-gray-200 px-2 py-1 rounded">
              {rightLabel}
            </span>
          </div>

          {/* Tick marks */}
          <div className="absolute top-0 left-0 right-0 flex justify-between px-1" style={{ top: '-8px' }}>
            {[0, 25, 50, 75, 100].map((tick) => (
              <div
                key={tick}
                className="w-0.5 h-4 bg-gray-400"
                style={{ marginLeft: tick === 0 ? '0' : '-1px' }}
              />
            ))}
          </div>
        </div>

        {/* Value display */}
        <div className="text-center mt-1">
          <span className="text-xs text-gray-600 font-medium">
            {value.toFixed(2)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full mt-8">
      <h4 className="text-lg font-semibold text-gray-800 text-center mb-4">
        Métricas Individuais por Região
      </h4>

      {/* Tabs */}
      <div className="flex justify-center mb-6 border-b border-gray-300">
        <button
          onClick={() => setActiveTab('saturation')}
          className={`px-6 py-3 font-semibold text-sm transition-all ${
            activeTab === 'saturation'
              ? 'border-b-4 border-orange-500 text-orange-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Temperatura
        </button>
        <button
          onClick={() => setActiveTab('brightness')}
          className={`px-6 py-3 font-semibold text-sm transition-all ${
            activeTab === 'brightness'
              ? 'border-b-4 border-orange-500 text-orange-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Profundidade
        </button>
      </div>

      {/* Content - Two columns */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          {regionOrder.map((region) => renderSlider(region, activeTab))}
        </div>
      </div>
    </div>
  );
};

export default IndividualMetricsChart;
