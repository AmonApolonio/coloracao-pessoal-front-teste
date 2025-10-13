
import { ColoracaoClassificacaoResponse } from '../../types/coloracaoSimplificado';
import SaturationBrightnessChart from './SaturationBrightnessChart';
import IndividualMetricsChart from './IndividualMetricsChart';

type AnalysisResultsTabProps = {
  finalResults: ColoracaoClassificacaoResponse | null;
  label?: string;
};

const AnalysisResultsTab: React.FC<AnalysisResultsTabProps> = ({ finalResults, label }) => {

  if (!finalResults) {
    return null;
  }

  const { result } = finalResults.output;

  // Helper to render the final result/season
  const renderSeasonResult = () => (
    <div className="flex flex-col items-center justify-center mb-8">
      {label && (
        <h3 className="text-lg font-semibold text-gray-700 mb-3">{label}</h3>
      )}
      <div className="bg-gradient-to-r from-[#947B62] to-[#bfa07a] shadow-lg rounded-2xl px-10 py-8 mb-4 border-4 border-[#947B62]/40 flex flex-col items-center w-full max-w-xl">
        <span className="uppercase tracking-widest text-xs font-semibold text-white/80 mb-2">Resultado Final</span>
        <span className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-2" style={{letterSpacing: '0.03em'}}>{result.season}</span>
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