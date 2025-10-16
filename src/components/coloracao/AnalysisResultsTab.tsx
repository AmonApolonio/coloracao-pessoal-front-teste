
import { useState } from 'react';
import { ColoracaoClassificacaoResponse } from '../../types/coloracaoSimplificado';
import SaturationBrightnessChart from './SaturationBrightnessChart';
import IndividualMetricsChart from './IndividualMetricsChart';

type AnalysisResultsTabProps = {
  finalResults: ColoracaoClassificacaoResponse | null;
  label?: string;
  userPhotoUrl?: string;
};

const AnalysisResultsTab: React.FC<AnalysisResultsTabProps> = ({ finalResults, label, userPhotoUrl }) => {
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);

  if (!finalResults) {
    return null;
  }

  const { result } = finalResults.output;

  // Skip selection screen if season_alternative is empty/null
  const hasAlternative = result.season_alternative && result.season_alternative.trim() !== '';

  // Helper to get image path from season name
  const getImagePath = (season: string) => {
    return `/assets/photos/${season}.png`;
  };

  // Show season selection if alternative exists and not yet selected
  if (hasAlternative && !selectedSeason) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-6 max-w-5xl">
          <p className="text-lg font-semibold text-gray-700 mb-3">
            Selecione qual das duas estações melhor descreve seu tipo de coloração:
          </p>
          
          <div className="flex flex-col lg:flex-row gap-4 w-full">
            {/* Primary Season Option */}
            <button
              onClick={() => setSelectedSeason(result.season)}
              className="flex-1 p-2 pb-8 rounded-xl border-2 border-[#947B62] bg-gradient-to-br from-[#947B62]/10 to-[#bfa07a]/10 hover:from-[#947B62]/20 hover:to-[#bfa07a]/20 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#947B62] focus:ring-offset-2 relative"
            >
              <div className="relative w-full h-screen max-h-96 mb-6 rounded-lg overflow-hidden">
                {/* Confidence Badge - On top */}
                <div className="absolute top-2 right-2 bg-[#947B62] text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg z-20 flex items-center gap-1">
                  <span>Confiança:</span>
                  <span>{result.confidence_level_season.toFixed(1)}%</span>
                </div>
                {/* Season Photo - Background */}
                <img 
                  src={getImagePath(result.season)} 
                  alt={result.season}
                  className="w-full h-full object-cover rounded-lg"
                />
                {/* User Face Photo - Stacked on top */}
                {userPhotoUrl && (
                  <img 
                    src={userPhotoUrl} 
                    alt="User Photo"
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 object-cover rounded-full border-4 border-white shadow-lg"
                  />
                )}
              </div>
              <span className="text-base text-gray-600 mb-2 block">Opção Principal</span>
              <span className="text-3xl md:text-4xl font-bold text-[#947B62]">{result.season}</span>
            </button>

            {/* Alternative Season Option */}
            <button
              onClick={() => setSelectedSeason(result.season_alternative)}
              className="flex-1 p-2 pb-8 rounded-xl border-2 border-[#bfa07a] bg-gradient-to-br from-[#bfa07a]/10 to-[#947B62]/10 hover:from-[#bfa07a]/20 hover:to-[#947B62]/20 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#bfa07a] focus:ring-offset-2 relative"
            >
              <div className="relative w-full h-screen max-h-96 mb-6 rounded-lg overflow-hidden">
                {/* Confidence Badge - On top */}
                <div className="absolute top-2 right-2 bg-[#bfa07a] text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg z-20 flex items-center gap-1">
                  <span>Confiança:</span>
                  <span>{result.confidence_level_season_alternative.toFixed(1)}%</span>
                </div>
                {/* Season Photo - Background */}
                <img 
                  src={getImagePath(result.season_alternative)} 
                  alt={result.season_alternative}
                  className="w-full h-full object-cover rounded-lg"
                />
                {/* User Face Photo - Stacked on top */}
                {userPhotoUrl && (
                  <img 
                    src={userPhotoUrl} 
                    alt="User Photo"
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 object-cover rounded-full border-4 border-white shadow-lg"
                  />
                )}
              </div>
              <span className="text-base text-gray-600 mb-2 block">Opção Alternativa</span>
              <span className="text-3xl md:text-4xl font-bold text-[#bfa07a]">{result.season_alternative}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Helper to render the final result/season
  const renderSeasonResult = () => (
    <div className="flex flex-col items-center justify-center mb-8">
      {label && (
        <h3 className="text-lg font-semibold text-gray-700 mb-3">{label}</h3>
      )}
      <div className="bg-gradient-to-r from-[#947B62] to-[#bfa07a] shadow-lg rounded-2xl px-10 py-8 mb-4 border-4 border-[#947B62]/40 flex flex-col items-center w-full max-w-xl">
        <span className="uppercase tracking-widest text-xs font-semibold text-white/80 mb-2">Resultado Final</span>
        <span className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-2" style={{letterSpacing: '0.03em'}}>{selectedSeason || result.season}</span>
      </div>
      <div className="flex gap-8 mt-2">
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-500">Brilho</span>
          <span className="text-lg font-semibold text-[#947B62]">{result.brightness.toFixed(2)}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-500">Saturação</span>
          <span className="text-lg font-semibold text-[#947B62]">{result.saturation.toFixed(2)}</span>
        </div>
      </div>
      {hasAlternative && (
        <button
          onClick={() => setSelectedSeason(null)}
          className="mt-6 px-4 py-2 text-sm text-[#947B62] border border-[#947B62] rounded-lg hover:bg-[#947B62] hover:text-white transition-colors"
        >
          Alterar Seleção
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {renderSeasonResult()}
      <div>
        <IndividualMetricsChart finalResults={finalResults} />
      </div>
      <div>
        <SaturationBrightnessChart finalResults={finalResults} />
      </div>
    </div>
  );
};

export default AnalysisResultsTab;