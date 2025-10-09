import React, { useState } from 'react';
import { ColoracaoSimplificadoService } from '../../services/coloracaoSimplificadoService';
import { 
  ColoracaoSimplificadoResponse, 
  RegionAnalysis, 
  RegionResult, 
  RegionDetail,
  ColoracaoClassificacaoResponse,
  CombinedAnalysisResult,
  ManualColorInput as ManualColorInputType
} from '../../types/coloracaoSimplificado';
import ImageUploadSection from '../shared/ImageUploadSection';
import AnalysisResultsTab from '../coloracao/AnalysisResultsTab';
import ManualColorInput from '../coloracao/ManualColorInput';
import ColorTemplateSelector from '../shared/ColorTemplateSelector';
import Header from '../shared/Header';
import manualColorsData from '../../../manual-colors.json';

const ColoracaoSimplificado: React.FC = () => {
  // Mode selection: 'mode-selection' -> then either extraction or classification path
  const [mode, setMode] = useState<'extraction' | 'classification' | null>(null);
  
  // Step management based on mode
  // Extraction mode: 'frontal' -> 'eye' -> 'extraction-results' -> 'manual-input' -> 'classification'
  // Classification mode: 'manual-input' -> 'classification'
  const [currentStep, setCurrentStep] = useState<'mode-selection' | 'frontal' | 'eye' | 'extraction-results' | 'manual-input' | 'classification'>('mode-selection');
  
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
  
  // Manual color input states - start empty
  const [manualColors, setManualColors] = useState<Record<string, string>>({
    cheek: '',
    chin: '',
    forehead: '',
    hair_root: '',
    eyebrows: '',
    iris: '',
    mouth: '',
    mouth_contour: '',
    under_eye_skin: '',
  });
  
  // Template selector state
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number | undefined>(undefined);
  
  // Classification states
  const [activeClassificationTab, setActiveClassificationTab] = useState<'ai' | 'manual'>('manual');
  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationStatus, setClassificationStatus] = useState<string>('');
  const [aiClassificationResult, setAiClassificationResult] = useState<ColoracaoClassificacaoResponse | null>(null);
  const [manualClassificationResult, setManualClassificationResult] = useState<ColoracaoClassificacaoResponse | null>(null);
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

  const handleModeSelection = (selectedMode: 'extraction' | 'classification') => {
    setMode(selectedMode);
    if (selectedMode === 'extraction') {
      setCurrentStep('frontal');
    } else {
      setCurrentStep('manual-input');
    }
  };

  const handleRestart = () => {
    setCurrentStep('mode-selection');
    setMode(null);
    setFrontalImageUrl('');
    setIsFrontalImageValid(false);
    setEyeImageUrl('');
    setIsEyeImageValid(false);
    setCombinedResult(null);
    setManualColors({
      cheek: '',
      chin: '',
      forehead: '',
      hair_root: '',
      eyebrows: '',
      iris: '',
      mouth: '',
      mouth_contour: '',
      under_eye_skin: '',
    });
    setAiClassificationResult(null);
    setManualClassificationResult(null);
    setError('');
    setBarbaDetected(false);
    setActiveClassificationTab('manual');
    setSelectedTemplateIndex(undefined);
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
    setCurrentStep('extraction-results');

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
      // Don't pre-fill manual colors - let user fill them manually
      setAnalysisStatus('');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleProceedToManualInput = () => {
    setCurrentStep('manual-input');
  };

  const handleManualColorChange = (region: string, color: string) => {
    setManualColors(prev => ({
      ...prev,
      [region]: color
    }));
    // Clear template selection when user manually edits
    setSelectedTemplateIndex(undefined);
  };

  const handleTemplateSelect = (colors: Record<string, string>, index: number) => {
    setManualColors(colors);
    setSelectedTemplateIndex(index);
  };

  // Check if all required manual colors are filled
  const areManualColorsFilled = () => {
    const requiredRegions = mode === 'extraction' && barbaDetected
      ? Object.keys(manualColors).filter(key => key !== 'mouth_contour' && key !== 'chin' && key !== 'eyebrows')
      : Object.keys(manualColors).filter(key => key !== 'eyebrows');
    
    return requiredRegions.every(region => {
      const color = manualColors[region];
      // Check if color is filled and is a valid hex color format
      return color && color.trim() !== '' && /^#[0-9A-Fa-f]{6}$/.test(color);
    });
  };

  // Prepare colors for classification, auto-filling eyebrows with hair_root if not provided
  const prepareColorsForClassification = (colors: Record<string, string>) => {
    const prepared = { ...colors };
    // If eyebrows is not filled or invalid, use hair_root color
    if (!prepared.eyebrows || prepared.eyebrows.trim() === '' || !/^#[0-9A-Fa-f]{6}$/.test(prepared.eyebrows)) {
      prepared.eyebrows = prepared.hair_root;
    }
    return prepared;
  };

  const handleStartClassification = async () => {
    // Validate manual colors are filled
    if (!areManualColorsFilled()) {
      setError('Por favor, preencha todas as cores antes de realizar a classificação');
      return;
    }

    setIsClassifying(true);
    setCurrentStep('classification');
    setError('');

    try {
      if (mode === 'extraction') {
        // Dual classification mode: Use both AI and manual colors
        if (!combinedResult) {
          setError('Erro: Dados de extração não encontrados');
          return;
        }

        const hasSuccessfulRegions = Object.keys(combinedResult.frontalResult.output.details).length > 0;
        if (!hasSuccessfulRegions) {
          alert('Não é possível realizar a classificação. Nenhuma região foi extraída com sucesso.');
          return;
        }

        // Use the combined colors (which includes the eye iris data)
        const aiColors = combinedResult.combinedColors;
        
        // If barba is detected, exclude mouth_contour and chin from classification
        const aiColorsForClassification = combinedResult.barbaDetected 
          ? Object.fromEntries(Object.entries(aiColors).filter(([key]) => key !== 'mouth_contour' && key !== 'chin'))
          : aiColors;

        // Prepare manual colors with eyebrows auto-filled if needed
        const preparedManualColors = prepareColorsForClassification(manualColors);
        const manualColorsForClassification = combinedResult.barbaDetected 
          ? Object.fromEntries(Object.entries(preparedManualColors).filter(([key]) => key !== 'mouth_contour' && key !== 'chin'))
          : preparedManualColors;

        setClassificationStatus('Iniciando classificação dupla...');

        console.log('Starting dual classification...');
        console.log('AI colors:', aiColorsForClassification);
        console.log('Manual colors:', manualColorsForClassification);

        // Run both classifications in parallel
        setClassificationStatus('Classificando com cores da IA e cores manuais...');
        
        const [aiResult, manualResult] = await Promise.all([
          ColoracaoSimplificadoService.classifyColors(
            aiColorsForClassification,
            (status) => {
              console.log('AI Classification status:', status);
            }
          ),
          ColoracaoSimplificadoService.classifyColors(
            manualColorsForClassification,
            (status) => {
              console.log('Manual Classification status:', status);
            }
          )
        ]);

        if (aiResult?.status === 'COMPLETED' && manualResult?.status === 'COMPLETED') {
          setClassificationStatus('Classificações concluídas!');
          setAiClassificationResult(aiResult);
          setManualClassificationResult(manualResult);
          setActiveClassificationTab('manual');
        } else {
          console.warn('Unexpected result structure:', { aiResult, manualResult });
          setClassificationStatus('Classificação concluída com formato inesperado');
          alert('Classificação concluída, mas o formato do resultado é inesperado. Verifique o console para mais detalhes.');
        }
      } else {
        // Classification-only mode: Use only manual colors
        setClassificationStatus('Iniciando classificação com cores manuais...');

        console.log('Starting manual-only classification...');
        
        // Prepare manual colors with eyebrows auto-filled if needed
        const preparedManualColors = prepareColorsForClassification(manualColors);
        console.log('Manual colors:', preparedManualColors);

        const manualResult = await ColoracaoSimplificadoService.classifyColors(
          preparedManualColors,
          (status) => {
            console.log('Manual Classification status:', status);
            setClassificationStatus(status);
          }
        );

        if (manualResult?.status === 'COMPLETED') {
          setClassificationStatus('Classificação concluída!');
          setManualClassificationResult(manualResult);
          // In classification-only mode, only show manual tab
          setActiveClassificationTab('manual');
        } else {
          console.warn('Unexpected result structure:', manualResult);
          setClassificationStatus('Classificação concluída com formato inesperado');
          alert('Classificação concluída, mas o formato do resultado é inesperado. Verifique o console para mais detalhes.');
        }
      }
    } catch (error) {
      console.error('Error during classification:', error);
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
    } finally {
      setIsClassifying(false);
    }
  };

  const regionNames: Record<string, string> = {
    hair_root: 'Cabelo (Raiz)',
    eyebrows: 'Sobrancelhas',
    iris: 'Olho',
    forehead: 'Testa',
    cheek: 'Bochecha',
    under_eye_skin: 'Cavidade ocular',
    chin: 'Queixo',
    mouth_contour: 'Contorno da Boca',
    mouth: 'Boca',
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

  const renderClassificationTabs = () => {
    if (!aiClassificationResult && !manualClassificationResult) return null;

    // In classification-only mode, don't show tabs if only manual result exists
    if (mode === 'classification' && !aiClassificationResult) {
      return null;
    }

    return (
      <div className="flex justify-center mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {manualClassificationResult && (
            <button
            onClick={() => setActiveClassificationTab('manual')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeClassificationTab === 'manual'
              ? 'bg-[#947B62] text-white'
              : 'text-gray-600 hover:text-gray-800'
            }`}
            >
              Cores Manuais
            </button>
          )}
          {aiClassificationResult && (
            <button
              onClick={() => setActiveClassificationTab('ai')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeClassificationTab === 'ai'
                  ? 'bg-[#947B62] text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Cores da IA
            </button>
          )}
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
        {/* Minimalist color summary */}
        <div className="max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Cores Extraídas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(barbaDetected
              ? successfulRegions.filter(([regionKey]) => regionKey !== 'mouth_contour' && regionKey !== 'chin')
              : successfulRegions
            ).map(([regionKey, regionData]) => {
              const irisPalette = regionKey === 'iris' && combinedResult.eyeResult.output.details.iris
                ? combinedResult.eyeResult.output.details.iris.color_palette
                : null;
              const colorResult = irisPalette ? irisPalette.result : regionData.color_palette.result;
              return (
                <div key={regionKey} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div
                    className="w-12 h-12 rounded-md border-2 border-gray-300 shadow-sm flex-shrink-0"
                    style={{ backgroundColor: colorResult }}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700">
                      {regionNames[regionKey as keyof typeof regionNames]}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">{colorResult}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Show missing regions if any */}
        {missingRegions.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto">
            <h3 className="text-sm font-semibold text-yellow-800 mb-2">
              Regiões não detectadas ({missingRegions.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {missingRegions.map((regionKey) => (
                <span key={regionKey} className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                  {regionNames[regionKey as keyof typeof regionNames]}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        {successfulRegions.length > 0 && (
          <div className="text-center text-sm text-gray-600 max-w-2xl mx-auto">
            <p className="mb-2">
              ✓ {(combinedResult.barbaDetected ? successfulRegions.filter(([k]) => k !== 'mouth_contour' && k !== 'chin').length : successfulRegions.length)} de {expectedRegions.length} regiões extraídas
            </p>
            <div className="flex justify-center gap-4 text-xs text-gray-500">
              <span>⚡ Frontal: {(combinedResult.frontalResult.total_time_seconds ?? 0).toFixed(1)}s</span>
              <span>⚡ Olho: {(combinedResult.eyeResult.total_time_seconds ?? 0).toFixed(1)}s</span>
            </div>
            {combinedResult.barbaDetected && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 mt-4">
                ⚠️ Barba detectada — "Contorno da Boca" e "Queixo" omitidos
              </div>
            )}
          </div>
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
    return (
      <div className="space-y-6">
        {renderClassificationTabs()}
        {activeClassificationTab === 'ai' && aiClassificationResult && (
          <AnalysisResultsTab 
            finalResults={aiClassificationResult} 
            label="Classificação com Cores Extraídas pela IA"
          />
        )}
        {activeClassificationTab === 'manual' && manualClassificationResult && (
          <AnalysisResultsTab 
            finalResults={manualClassificationResult} 
            label="Classificação com Cores Ajustadas Manualmente"
          />
        )}
      </div>
    );
  };

  return (
    <>
      <Header 
        onRestart={handleRestart}
        showRestart={currentStep !== 'mode-selection'}
      />
      <div className="bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto min-w-[1000px]">
          {/* Progress indicator */}
          {(currentStep === 'frontal' || currentStep === 'eye') && (
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-4">
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
            </div>
          )}

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

        {/* Mode Selection Section */}
        {currentStep === 'mode-selection' && (
          <div className="bg-white rounded-lg shadow-sm p-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Escolha o Modo de Teste</h2>
            <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
              Selecione como você deseja testar o sistema de coloração pessoal
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Extraction Mode */}
              <button
                onClick={() => handleModeSelection('extraction')}
                className="group bg-gradient-to-br from-[#947B62] to-[#bfa07a] hover:from-[#7a6650] hover:to-[#a68f6a] p-8 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <div className="text-white">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold mb-3">Testar Extração</h3>
                  <p className="text-sm opacity-90 mb-4">
                    Esse fluxo serve para testar a extração automática de cores a partir de imagens do rosto e olho. 
                    É possivel também usar os resultados da extração para comparar com os cores extraídas manualmente<br />
                  </p>
                  <div className="bg-white/20 rounded-lg p-3 text-xs space-y-1">
                    <div>✓ Upload de imagens</div>
                    <div>✓ Usar fotos dos testes padrão</div>
                    <div>✓ Extração de cores pela IA</div>
                    <div>✓ Comparação com cores extraídas manualmente</div>
                  </div>
                </div>
              </button>

              {/* Classification Mode */}
              <button
                onClick={() => handleModeSelection('classification')}
                className="group bg-gradient-to-br from-[#6b7280] to-[#9ca3af] hover:from-[#4b5563] hover:to-[#6b7280] p-8 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <div className="text-white">
                  <div className="text-5xl mb-4">🎨</div>
                  <h3 className="text-2xl font-bold mb-3">Testar Classificação</h3>
                  <p className="text-sm opacity-90 mb-4">
                    Esse fluxo serve para testar a classificação de coloração pessoal usando apenas a entrada manual de cores em formato hexadecimal. É possivel usar os valores de cores dos testes padrão<br />
                  </p>
                  <div className="bg-white/20 rounded-lg p-3 text-xs space-y-1">
                    <div>✓ Entrada manual de cores</div>
                    <div>✓ Usar cores dos testes padrão</div>
                    <div>✓ Teste rápido de classificação</div>
                    <div>✓ Ver resultados de temperatura e profundidade</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Extraction Results Section */}
        {!isAnalyzing && !isClassifying && currentStep === 'extraction-results' && combinedResult && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Resultados da Extração</h2>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
                  {error}
                </div>
              )}
              {renderExtractionResults()}
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleProceedToManualInput}
                  className="px-8 py-3 rounded-lg bg-[#947B62] text-white font-semibold hover:bg-[#7a6650] transition-colors"
                >
                  Testar a classificação com estas cores
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manual Input Section */}
        {!isAnalyzing && !isClassifying && currentStep === 'manual-input' && (
          <div className="space-y-6">
            <ColorTemplateSelector
              templates={manualColorsData}
              onTemplateSelect={(colors) => {
                const index = manualColorsData.findIndex(t => t.input.colors === colors);
                handleTemplateSelect(colors, index);
              }}
              selectedIndex={selectedTemplateIndex}
            />
            <ManualColorInput
              colors={manualColors}
              onColorChange={handleManualColorChange}
              regionNames={regionNames}
              barbaDetected={mode === 'extraction' ? barbaDetected : false}
            />
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center max-w-2xl mx-auto">
                {error}
              </div>
            )}
            {!areManualColorsFilled() && !error && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-center max-w-2xl mx-auto text-sm">
                ℹ️ Preencha todas as cores no formato hexadecimal (ex: #d4a574) para ativar o botão de classificação.<br />
                <span className="text-xs mt-1 inline-block">Nota: O campo "Sobrancelhas" é opcional. Se não preenchido, será usado o tom do "Cabelo (Raiz)".</span>
              </div>
            )}
            <div className="flex justify-center">
              <button
                onClick={handleStartClassification}
                disabled={isClassifying || !areManualColorsFilled()}
                className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                  isClassifying || !areManualColorsFilled()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#947B62] text-white hover:bg-[#7a6650]'
                }`}
              >
                {isClassifying ? 'Classificando...' : 'Realizar Classificação'}
              </button>
            </div>
          </div>
        )}

        {/* Classification Results Section */}
        {!isAnalyzing && !isClassifying && currentStep === 'classification' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Resultados da Classificação</h2>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
                {error}
              </div>
            )}
            {renderClassificationResults()}
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

              <div className="flex justify-center">
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
    </>
  );
};

export default ColoracaoSimplificado;
