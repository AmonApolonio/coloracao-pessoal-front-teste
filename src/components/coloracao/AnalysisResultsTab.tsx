import React, { useState } from 'react';
import { ParameterMatch, TooltipData } from '../../types/coloracaoResults';
import { ColoracaoClassificacaoResponse } from '../../types/coloracaoSimplificado';

interface AnalysisResultsTabProps {
  finalResults: ColoracaoClassificacaoResponse;
  onTryAgain: () => void;
}

const AnalysisResultsTab: React.FC<AnalysisResultsTabProps> = ({ finalResults, onTryAgain }) => {
  const [tooltipData, setTooltipData] = useState<TooltipData>({
    visible: false,
    x: 0,
    y: 0,
    content: null,
    parameter: ''
  });

  const getMatchColor = (match: 'primary' | 'secondary' | 'none') => {
    switch (match) {
      case 'primary':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'secondary':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'none':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getMatchText = (match: 'primary' | 'secondary' | 'none') => {
    switch (match) {
      case 'primary':
        return 'Primário ✓';
      case 'secondary':
        return 'Secundário ~';
      case 'none':
        return 'Não ✗';
    }
  };

  const handleCellMouseEnter = (
    event: React.MouseEvent,
    paramData: ParameterMatch,
    parameter: string
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipData({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      content: paramData,
      parameter: parameter
    });
  };

  const handleCellMouseLeave = () => {
    setTooltipData(prev => ({ ...prev, visible: false }));
  };

  const renderTooltip = () => {
    if (!tooltipData.visible || !tooltipData.content) return null;

    const { content, parameter } = tooltipData;
    
    return (
      <div
        className="fixed z-50 pointer-events-none"
        style={{
          left: tooltipData.x,
          top: tooltipData.y,
          transform: 'translateX(-50%) translateY(-100%)'
        }}
      >
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-xs">
          {/* Arrow */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
            <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
          </div>
          
          {/* Header */}
          <div className="mb-3 pb-2 border-b border-gray-100">
            <h4 className="font-semibold text-gray-800 capitalize text-sm">
              {parameter}
            </h4>
          </div>
          
          {/* Content */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Esperado:</span>
              <span className="font-semibold text-gray-800 bg-gray-50 px-2 py-1 rounded">
                {content.expected}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Primário:</span>
              <span className="font-semibold text-green-700 bg-green-50 px-2 py-1 rounded">
                {content.primary}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Secundário:</span>
              <span className="font-semibold text-yellow-700 bg-yellow-50 px-2 py-1 rounded">
                {content.secondary}
              </span>
            </div>
            
            {/* Match Status */}
            <div className="mt-3 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Status:</span>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  content.match === 'primary' 
                    ? 'bg-green-100 text-green-700' 
                    : content.match === 'secondary'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {content.match === 'primary' && '✓ Match Primário'}
                  {content.match === 'secondary' && '~ Match Secundário'}
                  {content.match === 'none' && '✗ Não Corresponde'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDimensionalAnalysis = () => {
    const details = finalResults?.output?.details;
    if (!details?.dimensional_analysis) return null;

    const { contraste, temperatura, profundidade, intensidade } = details.dimensional_analysis;

    return (
      <div className="grid md:grid-cols-2 gap-6">
        {/* contraste Analysis */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <h3 className="text-xl font-bold text-[#947B62] mb-4">⚡ Contraste</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="text-lg font-semibold text-orange-700 bg-orange-200 px-3 py-1 rounded-lg">
                {contraste.primaryClassification}
              </div>
              <div className="text-sm font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded">
                {contraste.secondClassification}
              </div>
            </div>
            <div className="text-sm text-orange-600 space-y-1 text-start">
              <div><span className="font-medium">Pele L:</span> {contraste.skin_L.toFixed(1)}</div>
              <div><span className="font-medium">Cabelo L:</span> {contraste.hair_L.toFixed(1)}</div>
              <div><span className="font-medium">Olhos L:</span> {contraste.eye_L.toFixed(1)}</div>
              <div><span className="font-medium">Delta L:</span> {contraste.delta_l.toFixed(1)}</div>
            </div>
          </div>
        </div>

        {/* temperatura Analysis */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <h3 className="text-xl font-bold text-[#947B62] mb-4">🌡️ Temperatura</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="text-lg font-semibold text-purple-700 bg-purple-200 px-3 py-1 rounded-lg">
                {temperatura.primaryClassification}
              </div>
              <div className="text-sm font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded">
                {temperatura.secondClassification}
              </div>
            </div>
            <div className="text-sm text-purple-600 space-y-1 text-start">
              <div><span className="font-medium">Matiz Geral:</span> {temperatura.hue.toFixed(1)}°</div>
              <div><span className="font-medium">Pele:</span> {temperatura.skin_temperatura} ({temperatura.skin_hue.toFixed(1)}°)</div>
              <div><span className="font-medium">Cabelo:</span> {temperatura.hair_temperatura} ({temperatura.hair_hue.toFixed(1)}°)</div>
              <div><span className="font-medium">Olhos:</span> {temperatura.eye_temperatura} ({temperatura.eye_hue.toFixed(1)}°)</div>
            </div>
          </div>
        </div>

        {/* profundidade Analysis */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <h3 className="text-xl font-bold text-[#947B62] mb-4">🌊 Profundidade</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="text-lg font-semibold text-green-700 bg-green-200 px-3 py-1 rounded-lg">
                {profundidade.primaryClassification}
              </div>
              <div className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                {profundidade.secondClassification}
              </div>
            </div>
            <div className="text-sm text-green-600 space-y-1 text-start">
              <div><span className="font-medium">Pele (Ref):</span> {profundidade.skin_reference_l.toFixed(1)}</div>
              <div><span className="font-medium">Abaixo dos olhos:</span> {profundidade.under_eye_l.toFixed(1)} ({profundidade.under_eye_classification})</div>
              <div><span className="font-medium">Abaixo da boca:</span> {profundidade.mouth_contour_l.toFixed(1)} ({profundidade.mouth_contour_classification})</div>
              <div><span className="font-medium">Delta abaixo dos olhos:</span> {profundidade.delta_under_eye.toFixed(1)}</div>
              <div><span className="font-medium">Delta abaixo da boca:</span> {profundidade.delta_mouth_contour.toFixed(1)}</div>
            </div>
          </div>
        </div>

        {/* intensidade Analysis */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <h3 className="text-xl font-bold text-[#947B62] mb-4">🎨 Intensidade</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="text-lg font-semibold text-blue-700 bg-blue-200 px-3 py-1 rounded-lg">
                {intensidade.primaryClassification}
              </div>
              <div className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                {intensidade.secondClassification}
              </div>
            </div>
            <div className="text-sm text-blue-600 space-y-1 text-start">
              <div><span className="font-medium">Valor C Geral:</span> {intensidade.C_value.toFixed(1)}</div>
              <div><span className="font-medium">Pele:</span> {intensidade.skin_intensidade} ({intensidade.skin_c_value.toFixed(1)})</div>
              <div><span className="font-medium">Cabelo:</span> {intensidade.hair_intensidade} ({intensidade.hair_c_value.toFixed(1)})</div>
              <div><span className="font-medium">Olhos:</span> {intensidade.eye_intensidade} ({intensidade.eye_c_value.toFixed(1)})</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDecisionTable = () => {
    const details = finalResults?.output?.details;
    if (!details?.decision_table) return null;

    const { seasons } = details.decision_table;
    const parameters = ['contraste', 'temperatura', 'profundidade', 'intensidade'] as const;
    
    // Get top candidates season names for highlighting
    const topCandidateNames = details.top_candidates.map(candidate => candidate.season);
    
    // Sort seasons by score (highest first)
    const sortedSeasons = Object.entries(seasons).sort((a: any, b: any) => b[1].score - a[1].score);

    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg overflow-x-auto">
        <h3 className="text-xl font-bold text-[#947B62] mb-4 text-center">📊 Tabela de Decisão Sazonal</h3>
        
        <div className="min-w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-3 bg-[#947B62] text-white font-semibold text-left">
                  Estação
                </th>
                <th className="border border-gray-300 px-4 py-3 bg-[#947B62] text-white font-semibold text-center">
                  Score
                </th>
                {parameters.map((param) => (
                  <th key={param} className="border border-gray-300 px-4 py-3 bg-[#947B62] text-white font-semibold text-center capitalize">
                    {param}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedSeasons.map(([seasonName, seasonData]: [string, any], index) => {
                const isTopCandidate = topCandidateNames.includes(seasonName);
                return (
                  <tr key={seasonName} className={isTopCandidate ? 'bg-amber-50' : 'hover:bg-gray-50'}>
                    <td className="border border-gray-300 px-4 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        {isTopCandidate && <span className="text-amber-500">👑</span>}
                        {seasonName}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center font-semibold">
                      {seasonData.score}
                    </td>
                    {parameters.map((param) => {
                      const paramData = seasonData[param];
                      return (
                        <td key={param} className="border border-gray-300 px-2 py-3 text-center">
                          <div
                            className={`px-3 py-2 rounded-lg border text-sm font-medium cursor-help transition-all duration-200 hover:scale-105 hover:shadow-md ${getMatchColor(paramData.match)}`}
                            onMouseEnter={(e) => handleCellMouseEnter(e, paramData, param)}
                            onMouseLeave={handleCellMouseLeave}
                          >
                            {getMatchText(paramData.match)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
            <span>Primário (5 pontos)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
            <span>Secundário (1 ponto)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
            <span>Não corresponde (0 pontos)</span>
          </div>
        </div>
      </div>
    );
  };

  const renderTopCandidates = () => {
    const details = finalResults?.output?.details;
    if (!details?.top_candidates) return null;

    const topCandidates = details.top_candidates.slice(0, 3);

    return (
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
        <h3 className="text-xl font-bold text-[#947B62] mb-4">🏆 Top Candidatos</h3>
        <div className="space-y-3">
          {topCandidates.map((candidate, index) => (
            <div key={candidate.season} className="bg-white/70 rounded-lg p-4 border border-blue-200/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </span>
                  <span className="font-semibold text-lg">{candidate.season}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Confiança</div>
                  <div className="font-bold text-blue-700">{candidate.confidence.toFixed(1)}%</div>
                </div>
              </div>
              <div className="text-sm text-gray-700 space-y-1 text-start">
                <div><span className="font-medium">Score:</span> {candidate.match_score}</div>
                <div><span className="font-medium">Match exato:</span> {candidate.exact_match ? 'Sim' : 'Não'}</div>
                {candidate.used_primary.length > 0 && (
                  <div>
                    <span className="font-medium">Usou primário em:</span> {candidate.used_primary.join(', ')}
                  </div>
                )}
                {candidate.used_secondary.length > 0 && (
                  <div>
                    <span className="font-medium">Usou secundário em:</span> {candidate.used_secondary.join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSeasonalClassification = () => {
    const result = finalResults?.output?.result;
    if (!result) return null;

    const { season, confidence, explanation } = result;

    return (
      <div className="space-y-6">
        {/* Main Result */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-8 border border-amber-200 shadow-lg">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-[#947B62] mb-2">🌸 Classificação Sazonal</h2>
            <div className="text-4xl font-bold text-amber-700 mb-2">{season}</div>
            <div className="text-xl text-amber-600">Confiança: {confidence.toFixed(1)}%</div>
          </div>

          <div className="bg-white/60 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-[#947B62] mb-2">Explicação:</h3>
            <p className="text-gray-700">{explanation}</p>
          </div>
        </div>

        {/* Decision Table */}
        {renderDecisionTable()}

        {/* Top Candidates */}
        {renderTopCandidates()}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Seasonal Classification */}
      {renderSeasonalClassification()}

      {/* Dimensional Analysis */}
      <div>
        <h2 className="text-2xl font-bold text-[#947B62] mb-6 text-center">📊 Análise Dimensional</h2>
        {renderDimensionalAnalysis()}
      </div>

      {/* Custom Tooltip */}
      {renderTooltip()}
    </div>
  );
};

export default AnalysisResultsTab;