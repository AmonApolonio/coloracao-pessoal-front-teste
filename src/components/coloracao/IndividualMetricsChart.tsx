import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { ColoracaoClassificacaoResponse } from '../../types/coloracaoSimplificado';

interface IndividualMetricsChartProps {
  finalResults: ColoracaoClassificacaoResponse;
}

type MetricType = 'saturation' | 'brightness';
type TabType = MetricType | 'resultados';

const IndividualMetricsChart: React.FC<IndividualMetricsChartProps> = ({
  finalResults,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('resultados');
  const [reverse, setReverse] = useState<{ [key: string]: boolean }>({});
  const getOverallMetricValue = (metricType: MetricType): number => {
    if (metricType === 'saturation') {
      return finalResults.output.result.saturation ?? 50;
    } else {
      return finalResults.output.result.brightness ?? 50;
    }
  };

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

  const getMetricValue = (region: string, metricType: MetricType): number => {
    let key = `${region}_${metricType}`;

    if (region === 'hair_root') {
      key = `hair_${metricType}`;
    }

    const details = finalResults.output.details[`${metricType}-details`];
    return details[key as keyof typeof details] as number;
  };

  function calcularIntensidade(T: number, P: number): number {
    const distancia = Math.sqrt((T - 50) ** 2 + (P - 50) ** 2);
    const maxDist = Math.sqrt(50 ** 2 + 50 ** 2);
    const proximidade = 1 - Math.min(distancia / maxDist, 1);

    let intensidade: number;

    if ((T < 50 && P < 50) || (T >= 50 && P >= 50)) {
      intensidade = 50 + proximidade * 50;
    } else {
      intensidade = 50 - proximidade * 50;
    }

    const Ti = Math.round(T);
    const Pi = Math.round(P);
    if (Ti <= 25 || Ti >= 75 || Pi <= 25 || Pi >= 75) {
      intensidade = Math.max(25, Math.min(intensidade, 75));
    }

    return 100 - Math.round(intensidade);
  }

  const renderSlider = (region: string, metricType: MetricType, isResultadoTab = false) => {
    let value: number;
    let displayName: string;
    if (region === 'overall_temperatura') {
      value = getOverallMetricValue('saturation');
      displayName = '';
    } else if (region === 'overall_profundidade') {
      value = getOverallMetricValue('brightness');
      displayName = '';
    } else if (region === 'overall_intensidade') {
      const temperatura = getOverallMetricValue('saturation');
      const profundidade = getOverallMetricValue('brightness');
      value = calcularIntensidade(temperatura, profundidade);
      displayName = '';
    } else {
      value = getMetricValue(region, metricType);
      displayName = regionNames[region] || region;
    }

    let reversed = false;
    if (isResultadoTab && reverse[region]) {
      value = 100 - value;
      reversed = true;
    }

    const position = value;

    let leftLabel = metricType === 'saturation' ? 'FRIO' : 'ESCURO';
    let rightLabel = metricType === 'saturation' ? 'QUENTE' : 'CLARO';
    if (region === 'overall_intensidade') {
      leftLabel = 'BRILHANTE';
      rightLabel = 'SUAVE';
    }
    if (isResultadoTab && reversed) {
      [leftLabel, rightLabel] = [rightLabel, leftLabel];
    }
    const centerLabel = 'N';

    return (
      <div key={region} className="mb-6">
        {displayName && (
          <div className="mb-2 flex items-center justify-between">
            <span className="bg-yellow-300 px-3 py-1 text-sm font-bold text-gray-800 inline-block">
              {displayName}
            </span>
            {isResultadoTab && (
              <button
                type="button"
                className="p-1.5 rounded-full hover:bg-orange-50 transition-colors flex items-center justify-center group"
                title="Inverter lados"
                onClick={() => setReverse((prev) => ({ ...prev, [region]: !prev[region] }))}
              >
                <FontAwesomeIcon
                  icon={faArrowsRotate}
                  className={`w-5 h-5 transition-all ${reverse[region] ? 'text-orange-600' : 'text-orange-500'} group-hover:text-orange-600 group-hover:scale-110`}
                />
              </button>
            )}
          </div>
        )}
        {!displayName && isResultadoTab && (
          <div className="mb-2 flex justify-end">
            <button
              type="button"
              className="p-1.5 rounded-full hover:bg-orange-50 transition-colors flex items-center justify-center group"
              title="Inverter lados"
              onClick={() => setReverse((prev) => ({ ...prev, [region]: !prev[region] }))}
            >
              <FontAwesomeIcon
                icon={faArrowsRotate}
                className={`w-5 h-5 transition-all ${reverse[region] ? 'text-orange-600' : 'text-orange-500'} group-hover:text-orange-600 group-hover:scale-110`}
              />
            </button>
          </div>
        )}
        <div className="relative">
          <div className="relative h-2 bg-gradient-to-r from-gray-400 via-gray-300 to-gray-600 rounded-full">
            <div
              className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-orange-500 border-4 border-white rounded-full shadow-lg transition-all duration-300"
              style={{ left: `calc(${position}% - 12px)` }}
            />
          </div>

          <div className="relative mt-2 px-1">
            <div className="flex justify-between">
              <span className="text-xs font-semibold text-gray-700 bg-gray-200 px-2 py-1 rounded">
                {leftLabel}
              </span>
              <span className="text-xs font-semibold text-gray-700 bg-gray-200 px-2 py-1 rounded">
                {rightLabel}
              </span>
            </div>
            <div className="absolute left-1/2 top-0 -translate-x-1/2">
              <span className="text-xs font-semibold text-gray-700 bg-gray-200 px-2 py-1 rounded">
                {centerLabel}
              </span>
            </div>
          </div>

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

      <div className="flex justify-center mb-6 border-b border-gray-300">
        <button
          onClick={() => setActiveTab('resultados')}
          className={`px-6 py-3 font-semibold text-sm transition-all ${activeTab === 'resultados'
            ? 'border-b-4 border-orange-500 text-orange-600'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          Resultados
        </button>
        <button
          onClick={() => setActiveTab('saturation')}
          className={`px-6 py-3 font-semibold text-sm transition-all ${activeTab === 'saturation'
            ? 'border-b-4 border-orange-500 text-orange-600'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          Temperatura
        </button>
        <button
          onClick={() => setActiveTab('brightness')}
          className={`px-6 py-3 font-semibold text-sm transition-all ${activeTab === 'brightness'
            ? 'border-b-4 border-orange-500 text-orange-600'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          Profundidade
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {activeTab === 'resultados' ? (
          <div className="flex flex-col gap-8 items-center">
            <div className="w-full max-w-md">
              <span className="bg-yellow-300 px-3 py-1 text-sm font-bold text-gray-800 inline-block">
                TEMPERATURA
              </span>
              {renderSlider('overall_temperatura', 'saturation', true)}
            </div>
            <div className="w-full max-w-md">
              <span className="bg-yellow-300 px-3 py-1 text-sm font-bold text-gray-800 inline-block">
                PROFUNDIDADE
              </span>
              {renderSlider('overall_profundidade', 'brightness', true)}
            </div>
            <div className="w-full max-w-md">
              <span className="bg-yellow-300 px-3 py-1 text-sm font-bold text-gray-800 inline-block">
                INTENSIDADE
              </span>
              {renderSlider('overall_intensidade', 'saturation', true)}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            {regionOrder.map((region) => renderSlider(region, activeTab as MetricType))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IndividualMetricsChart;
