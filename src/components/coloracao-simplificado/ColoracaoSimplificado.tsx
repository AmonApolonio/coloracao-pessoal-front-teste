import React, { useState } from 'react';
import { ColoracaoSimplificadoService } from '../../services/coloracaoSimplificadoService';
import { 
  ColoracaoSimplificadoResponse, 
  RegionAnalysis, 
  RegionResult, 
  RegionDetail,
  ColoracaoClassificacaoResponse,
  CombinedAnalysisResult
} from '../../types/coloracaoSimplificado';
import ImageUploadSection from '../shared/ImageUploadSection';
import AnalysisResultsTab from '../coloracao/AnalysisResultsTab';

const ColoracaoSimplificado: React.FC = () => {
  // Step management
  const [currentStep, setCurrentStep] = useState<'frontal' | 'eye' | 'results'>('frontal');
  
  // Frontal image states
  const [frontalImageUrl, setFrontalImageUrl] = useState<string>('');
  const [isFrontalImageValid, setIsFrontalImageValid] = useState<boolean>(false);
  
  // Eye image states
  const [eyeImageUrl, setEyeImageUrl] = useState<string>('');
  const [isEyeImageValid, setIsEyeImageValid] = useState<boolean>(false);
  
  // Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [combinedResult, setCombinedResult] = useState<CombinedAnalysisResult | null>(null);
  const [error, setError] = useState<string>('');
  const [analysisStatus, setAnalysisStatus] = useState<string>('');
  
  // New states for classification
  const [activeTab, setActiveTab] = useState<'extraction' | 'classification'>('extraction');
  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationStatus, setClassificationStatus] = useState<string>('');
  const [finalResults, setFinalResults] = useState<ColoracaoClassificacaoResponse | null>(null);
  const [barbaDetected, setBarbaDetected] = useState<boolean>(false);

  // Sample image URLs for frontal face
  const frontalSampleUrls = [
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/inverno-brilhante/gabriela/frontal_tbase.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/inverno-brilhante/isa/frontal_tbase.png',

    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/inverno-escuro/alessandra/frontal_tbase.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/inverno-escuro/camila/frontal_tbase.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/inverno-escuro/lorena_bt/frontal_tbase.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/inverno-escuro/mara/frontal_tbase.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/inverno-escuro/matheus/frontal_tbase.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/inverno-escuro/ted/frontal_tbase.png',

    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/inverno-frio/gabriel/frontal_tbase.png',

    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/outono-escuro/larissa/frontal_tbase.png',

    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/outono-quente/lara/frontal_tbase.png',

    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/sem-cartela/jonatan/frontal_tbase.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/sem-cartela/valeria/frontal_tbase.png',

    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/verao-claro/bia/frontal_tbase.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/verao-claro/bianca/frontal_tbase.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/verao-claro/henrique/frontal_tbase.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/verao-claro/mariana/frontal_tbase.png',

    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/verao-frio/inacio/frontal_tbase.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/verao-frio/larissa/frontal_tbase.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/verao-frio/livia/frontal_tbase.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/verao-frio/lorena/frontal_tbase.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/verao-frio/pollyana/frontal_tbase.png',

    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/verao-suave/alexandre/frontal_tbase.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/verao-suave/camila-oliveira/frontal_tbase.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/verao-suave/carol/frontal_tbase.png',
  ];

  // Sample image URLs for eye close-up
  const eyeSampleUrls = [
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/inverno-brilhante/gabriela/olho.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/inverno-brilhante/isa/olho.png',

    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/inverno-escuro/alessandra/olho.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/inverno-escuro/camila/olho.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/inverno-escuro/lorena_bt/olho.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/inverno-escuro/mara/olho.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/inverno-escuro/matheus/olho.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/inverno-escuro/ted/olho.png',

    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/inverno-frio/gabriel/olho.png',

    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/outono-escuro/larissa/olho.png',

    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/outono-quente/lara/olho.png',

    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/sem-cartela/jonatan/olho.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/sem-cartela/valeria/olho.png',

    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/verao-claro/bia/olho.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/verao-claro/bianca/olho.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/verao-claro/henrique/olho.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/verao-claro/mariana/olho.png',

    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/verao-frio/inacio/olho.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/verao-frio/larissa/olho.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/verao-frio/livia/olho.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/verao-frio/lorena/olho.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/verao-frio/pollyana/olho.png',

    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/verao-suave/alexandre/olho.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/verao-suave/camila-oliveira/olho.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/validacao/verao-suave/carol/olho.png',
  ];

  const handleFrontalImageUrlChange = (url: string) => {
    setFrontalImageUrl(url);
    setError('');
  };

  const handleFrontalImageValidityChange = (valid: boolean) => {
    setIsFrontalImageValid(valid);
  };

  const handleEyeImageUrlChange = (url: string) => {
    setEyeImageUrl(url);
    setError('');
  };

  const handleEyeImageValidityChange = (valid: boolean) => {
    setIsEyeImageValid(valid);
  };

  const handleFrontalGridButtonClick = (index: number) => {
    const selectedUrl = frontalSampleUrls[index];
    handleFrontalImageUrlChange(selectedUrl);
    handleFrontalImageValidityChange(true);
  };

  const handleEyeGridButtonClick = (index: number) => {
    const selectedUrl = eyeSampleUrls[index];
    handleEyeImageUrlChange(selectedUrl);
    handleEyeImageValidityChange(true);
  };

  const handleNextStep = () => {
    if (currentStep === 'frontal') {
      if (!frontalImageUrl.trim() || !isFrontalImageValid) {
        setError('Por favor, adicione uma URL de imagem frontal válida');
        return;
      }
      setCurrentStep('eye');
    } else if (currentStep === 'eye') {
      if (!eyeImageUrl.trim() || !isEyeImageValid) {
        setError('Por favor, adicione uma URL de imagem do olho válida');
        return;
      }
      handleAnalyze();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 'eye') {
      setCurrentStep('frontal');
    } else if (currentStep === 'results') {
      setCurrentStep('eye');
    }
  };

  const handleRestart = () => {
    setCurrentStep('frontal');
    setFrontalImageUrl('');
    setIsFrontalImageValid(false);
    setEyeImageUrl('');
    setIsEyeImageValid(false);
    setCombinedResult(null);
    setFinalResults(null);
    setError('');
    setBarbaDetected(false);
    setActiveTab('extraction');
  };

  const handleAnalyze = async () => {
    if (!frontalImageUrl.trim() || !isFrontalImageValid) {
      setError('Por favor, adicione uma URL de imagem frontal válida');
      return;
    }

    if (!eyeImageUrl.trim() || !isEyeImageValid) {
      setError('Por favor, adicione uma URL de imagem do olho válida');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setAnalysisStatus('Iniciando análises em paralelo...');
    setCurrentStep('results');

    try {
      // Try to catch which request fails (frontal or eye)
      let result;
      try {
        result = await ColoracaoSimplificadoService.analyzeBothImages(
          frontalImageUrl,
          eyeImageUrl,
          (status) => {
            setAnalysisStatus(status);
          }
        );
      } catch (err) {
        // Try to extract a user-friendly error message and which request failed
        let message = 'Erro durante a extração';
        let requestInfo = '';
        if (err && typeof err === 'object') {
          if (err instanceof Error) {
            message = err.message;
          } else if ('error' in err && typeof err.error === 'string') {
            message = err.error;
          }
          // Try to detect which request failed by error message or custom property
          if ('requestType' in err && typeof err.requestType === 'string') {
            requestInfo = err.requestType;
          } else if (message.toLowerCase().includes('frontal')) {
            requestInfo = 'frontal';
          } else if (message.toLowerCase().includes('olho') || message.toLowerCase().includes('eye')) {
            requestInfo = 'olho';
          }
        }
        setError(requestInfo ? `[${requestInfo.toUpperCase()}] ${message}` : message);
        setAnalysisStatus('');
        return;
      }

      setCombinedResult(result);
      setBarbaDetected(result.barbaDetected);
      setAnalysisStatus('');
      setActiveTab('extraction');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartClassification = async () => {
    if (!combinedResult) return;

    // Check if we have any successful regions for classification using new structure
    const hasSuccessfulRegions = Object.keys(combinedResult.frontalResult.output.details).length > 0;

    if (!hasSuccessfulRegions) {
      alert('Não é possível realizar a classificação. Nenhuma região foi extraída com sucesso.');
      return;
    }

    // Use the combined colors (which includes the eye iris data)
    const colors = combinedResult.combinedColors;
    
    // If barba is detected, exclude mouth_contour and chin from classification
    const colorsForClassification = combinedResult.barbaDetected 
      ? Object.fromEntries(Object.entries(colors).filter(([key]) => key !== 'mouth_contour' && key !== 'chin'))
      : colors;

    setIsClassifying(true);
    setClassificationStatus('Iniciando classificação...');

    try {
      console.log('Starting classification...');
      console.log('Sending colors:', colorsForClassification);

      let result;
      try {
        result = await ColoracaoSimplificadoService.classifyColors(
          colorsForClassification,
          (status) => {
            console.log('Classification status:', status);
            setClassificationStatus(status);
          }
        );
      } catch (error) {
        console.error('Error during final classification:', error);
        setClassificationStatus('Erro na classificação');
        // Try to extract a user-friendly error message
        let message = 'Erro durante a classificação';
        if (error && typeof error === 'object') {
          if (error instanceof Error) {
            message = error.message;
          } else if ('error' in error && typeof error.error === 'string') {
            message = error.error;
          }
        }
        setError(`[CLASSIFICAÇÃO] ${message}`);
        return;
      }

      if (result?.status === 'COMPLETED') {
        setClassificationStatus('Classificação concluída!');
        setFinalResults(result);
        setActiveTab('classification');
      } else {
        console.warn('Unexpected result structure:', result);
        setClassificationStatus('Classificação concluída com formato inesperado');
        alert('Classificação concluída, mas o formato do resultado é inesperado. Verifique o console para mais detalhes.');
      }
    } finally {
      setIsClassifying(false);
    }
  };

  const regionNames: Record<string, string> = {
    cheek: 'Bochecha',
    chin: 'Queixo',
    eyebrows: 'Sobrancelhas',
    forehead: 'Testa',
    hair_root: 'Raiz do Cabelo',
    iris: 'Íris',
    mouth: 'Boca',
    mouth_contour: 'Contorno da Boca',
    under_eye_skin: 'Pele Abaixo dos Olhos'
  };

  const renderColorPalette = (region: RegionAnalysis | RegionDetail) => (
    <div className="flex gap-2 mb-2">
      {Object.entries(region.color_palette)
        .filter(([key]) => key !== 'logs')
        .map(([key, color]) => (
          <div key={key} className="flex flex-col items-center">
            <div
              className="w-8 h-8 rounded border border-gray-300"
              style={{ backgroundColor: color as string }}
            />
            <span className="text-xs text-gray-600 mt-1 capitalize">{key}</span>
          </div>
        ))}
    </div>
  );

  const renderTabs = () => {
    if (!combinedResult) return null;

    return (
      <div className="flex justify-center mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('extraction')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'extraction'
                ? 'bg-[#947B62] text-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Extração
          </button>
          <button
            onClick={() => setActiveTab('classification')}
            disabled={!finalResults}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'classification' && finalResults
                ? 'bg-[#947B62] text-white'
                : finalResults
                ? 'text-gray-600 hover:text-gray-800'
                : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            Classificação
          </button>
        </div>
      </div>
    );
  };

  const renderExtractionResults = () => {
    if (!combinedResult) return null;

    // With new structure, all regions in details are successful
    const successfulRegions = Object.entries(combinedResult.frontalResult.output.details) as [string, RegionDetail][];
    
    // No failed regions in new structure - all regions are in details or not present at all
    const expectedRegions = Object.keys(regionNames);
    const presentRegions = Object.keys(combinedResult.frontalResult.output.details);
    const missingRegions = expectedRegions.filter(region => !presentRegions.includes(region));

    return (
      <div className="space-y-6">
        {/* Show missing regions if any */}
        {missingRegions.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Regiões não detectadas ({missingRegions.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {missingRegions.map((regionKey) => (
                <div key={regionKey} className="text-sm text-yellow-700">
                  <span className="font-medium">
                    {regionNames[regionKey as keyof typeof regionNames]}:
                  </span>
                  <span className="ml-1">Não detectada</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Images, color summary, and timing display */}
        {successfulRegions.length > 0 && (
          <>
            <div className="flex flex-col md:flex-row gap-8 mb-6">
              {/* Images */}
              <div className="text-center md:flex-1">
                <h4 className="text-lg font-semibold mb-4">Imagem Frontal</h4>
                <img
                  src={combinedResult.frontalResult.output.image_url}
                  alt="Imagem frontal analisada"
                  className="max-w-xs mx-auto rounded-lg shadow-md mb-4 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => window.open(combinedResult.frontalResult.output.image_url, '_blank')}
                />
              </div>

              {/* Color summary component (added back, new color values) */}
              <div className="md:flex-1 flex flex-col justify-center">
                <div className="space-y-3">
                  {(barbaDetected
                    ? successfulRegions.filter(([regionKey]) => regionKey !== 'mouth_contour' && regionKey !== 'chin')
                    : successfulRegions
                  ).map(([regionKey, regionData]) => {
                    const irisPalette = regionKey === 'iris' && combinedResult.eyeResult.output.details.iris
                      ? combinedResult.eyeResult.output.details.iris.color_palette
                      : null;
                    const colorResult = irisPalette ? irisPalette.result : regionData.color_palette.result;
                    return (
                      <div key={regionKey} className="text-center">
                        <span className="text-sm font-medium text-gray-700 mt-1 block">
                          {regionNames[regionKey as keyof typeof regionNames]}: {colorResult}
                        </span>
                        <div
                          className="w-full h-8 rounded border border-gray-300"
                          style={{ backgroundColor: colorResult }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-center md:flex-1">
                <h4 className="text-lg font-semibold mb-4">Imagem do Olho</h4>
                <img
                  src={combinedResult.eyeResult.output.image_url}
                  alt="Imagem do olho analisada"
                  className="max-w-xs mx-auto rounded-lg shadow-md mb-4 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => window.open(combinedResult.eyeResult.output.image_url, '_blank')}
                />
              </div>
            </div>

            <div className="text-center mb-6">
              <p className="text-sm text-gray-600">
                Regiões extraídas: {(combinedResult.barbaDetected ? successfulRegions.filter(([k]) => k !== 'mouth_contour' && k !== 'chin').length : successfulRegions.length)}/{expectedRegions.length}
              </p>
                <div className="text-xs text-gray-500 mt-2 space-y-1">
                  <p>⚡ Tempo frontal: {(combinedResult.frontalResult.total_time_seconds ?? 0).toFixed(1)}s</p>
                  <p>⚡ Tempo olho: {(combinedResult.eyeResult.total_time_seconds ?? 0).toFixed(1)}s</p>
                </div>
              {combinedResult.barbaDetected && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 mt-4">
                  Barba detectada — os itens "Contorno da Boca" e "Queixo" foram omitidos da classificação.
                </div>
              )}
            </div>

            {/* <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(combinedResult.barbaDetected
                ? successfulRegions.filter(([regionKey]) => regionKey !== 'mouth_contour' && regionKey !== 'chin')
                : successfulRegions
              ).map(([regionKey, regionData]) => (
                <div key={regionKey} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    {regionNames[regionKey as keyof typeof regionNames]}
                  </h4>

                  {regionKey === 'iris' && combinedResult.eyeResult.output.details.iris
                    ? renderColorPalette({ color_palette: combinedResult.eyeResult.output.details.iris.color_palette })
                    : renderColorPalette(regionData)}

                  <div className="mt-3 text-center">
                    {(() => {
                      const irisPalette = regionKey === 'iris' && combinedResult.eyeResult.output.details.iris
                        ? combinedResult.eyeResult.output.details.iris.color_palette
                        : null;
                      const colorResult = irisPalette ? irisPalette.result : regionData.color_palette.result;
                      return (
                        <>
                          <div
                            className="w-full h-8 rounded border border-gray-300"
                            style={{ backgroundColor: colorResult }}
                          />
                          <span className="text-sm font-medium text-gray-700 mt-2 block">
                            Cor final: {colorResult}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div> */}
          </>
        )}

        {/* Show message if no regions were successful */}
        {successfulRegions.length === 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Nenhuma região foi detectada
            </h3>
            <p className="text-red-600">
              A análise não conseguiu detectar nenhuma região facial nas imagens. 
              Tente com imagens diferentes com melhor qualidade e iluminação.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderClassificationResults = () => {
    if (!finalResults) return null;

    return (
      <AnalysisResultsTab finalResults={finalResults} />
    );
  };

  return (
    <div className="bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto min-w-[1000px]">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {/* Progress indicator */}
            {currentStep !== 'results' && (
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 ${currentStep === 'frontal' ? 'text-[#947B62]' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'frontal' ? 'bg-[#947B62] text-white' : 'bg-gray-200'}`}>
                    1
                  </div>
                  <span className="font-medium">Imagem Frontal</span>
                </div>
                <div className="w-8 h-px bg-gray-300"></div>
                <div className={`flex items-center space-x-2 ${currentStep === 'eye' ? 'text-[#947B62]' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'eye' ? 'bg-[#947B62] text-white' : 'bg-gray-200'}`}>
                    2
                  </div>
                  <span className="font-medium">Imagem do Olho</span>
                </div>
              </div>
            )}
            
            {/* Action Buttons - only show when we have analysis results */}
            {combinedResult && (
              <div className="flex gap-4 ml-auto">
                <button
                  onClick={handleStartClassification}
                  disabled={isClassifying}
                  className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                    isClassifying
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#947B62] text-white hover:bg-[#7a624e]'
                  }`}
                >
                  {isClassifying ? 'Classificando...' : 'Nova Classificação'}
                </button>
                
                <button
                  onClick={handleRestart}
                  className="px-6 py-2 rounded-lg bg-gray-600 text-white font-semibold hover:bg-gray-700 transition-colors"
                >
                  Nova Extração
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {(isAnalyzing || isClassifying) && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#947B62]"></div>
              <p className="mt-2 text-gray-600">
                {isAnalyzing 
                  ? (analysisStatus || 'Processando extração...') 
                  : (classificationStatus || 'Processando classificação...')
                }
              </p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {!isAnalyzing && !isClassifying && currentStep === 'results' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Resultados</h2>
            {/* Show error if present */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
                {error}
              </div>
            )}
            {/* Only show tabs/results if we have a result */}
            {combinedResult && (
              <>
                {renderTabs()}
                {/* Tab Content */}
                {activeTab === 'extraction' && renderExtractionResults()}
                {activeTab === 'classification' && renderClassificationResults()}
              </>
            )}
          </div>
        )}

        {/* Step 1: Frontal Image Selection */}
        {!isAnalyzing && !isClassifying && currentStep === 'frontal' && (
          <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
            <div className="space-y-6">
              <ImageUploadSection
                imageUrl={frontalImageUrl}
                onImageUrlChange={handleFrontalImageUrlChange}
                isImageValid={isFrontalImageValid}
                onImageValidityChange={handleFrontalImageValidityChange}
                disabled={isAnalyzing}
                title="Upload da Imagem Frontal"
                uploadType="extracao-frontal"
                sampleImages={{
                  urls: frontalSampleUrls,
                  onSampleClick: handleFrontalGridButtonClick
                }}
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex justify-center">
                <button
                  onClick={handleNextStep}
                  disabled={isAnalyzing || !frontalImageUrl.trim() || !isFrontalImageValid}
                  className={`px-8 py-3 rounded-lg font-semibold transition-colors ${isAnalyzing || !frontalImageUrl.trim() || !isFrontalImageValid
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#947B62] text-white hover:bg-[#7a6650]'
                  }`}
                >
                  {isAnalyzing ? 'Analisando...' : 'Próximo: Selecionar Imagem do Olho'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Eye Image Selection */}
        {!isAnalyzing && !isClassifying && currentStep === 'eye' && (
          <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
            <div className="space-y-6">
              <ImageUploadSection
                imageUrl={eyeImageUrl}
                onImageUrlChange={handleEyeImageUrlChange}
                isImageValid={isEyeImageValid}
                onImageValidityChange={handleEyeImageValidityChange}
                disabled={isAnalyzing}
                title="Upload da Imagem do Olho (Close-up)"
                uploadType="extracao-olho"
                sampleImages={{
                  urls: eyeSampleUrls,
                  onSampleClick: handleEyeGridButtonClick
                }}
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex justify-center space-x-4">
                <button
                  onClick={handlePreviousStep}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={isAnalyzing || !eyeImageUrl.trim() || !isEyeImageValid}
                  className={`px-8 py-3 rounded-lg font-semibold transition-colors ${isAnalyzing || !eyeImageUrl.trim() || !isEyeImageValid
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#947B62] text-white hover:bg-[#7a6650]'
                  }`}
                >
                  {isAnalyzing ? 'Analisando...' : 'Analisar Imagens'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColoracaoSimplificado;
