import React, { useState } from 'react';
import { ColoracaoSimplificadoService } from '../../services/coloracaoSimplificadoService';
import { 
  ColoracaoSimplificadoResponse, 
  RegionAnalysis, 
  RegionResult, 
  RegionDetail,
  ColoracaoClassificacaoResponse 
} from '../../types/coloracaoSimplificado';
import ImageUploadSection from '../shared/ImageUploadSection';
import GridButtons from '../shared/GridButtons';
import AnalysisResultsTab from '../coloracao/AnalysisResultsTab';

const ColoracaoSimplificado: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isImageValid, setIsImageValid] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ColoracaoSimplificadoResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [analysisStatus, setAnalysisStatus] = useState<string>('');
  
  // New states for classification
  const [activeTab, setActiveTab] = useState<'extraction' | 'classification'>('extraction');
  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationStatus, setClassificationStatus] = useState<string>('');
  const [finalResults, setFinalResults] = useState<ColoracaoClassificacaoResponse | null>(null);

  // Sample image URLs for grid buttons
  const sampleImageUrls = [
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/frontal/1.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/frontal/2.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/frontal/3.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/frontal/4.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/frontal/5.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/frontal/6.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/frontal/7.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/frontal/8.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/frontal/11.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/frontal/14.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/frontal/15.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/frontal/18.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/frontal/19.png',
    'https://tantto-assinaturas.s3.us-east-1.amazonaws.com/gennie-mock/frontal/20.png',
  ];

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    setError('');
  };

  const handleImageValidityChange = (valid: boolean) => {
    setIsImageValid(valid);
  };

  const handleGridButtonClick = (index: number) => {
    const selectedUrl = sampleImageUrls[index];
    handleImageUrlChange(selectedUrl);
    handleImageValidityChange(true);
  };

  const handleAnalyze = async () => {
    if (!imageUrl.trim() || !isImageValid) {
      setError('Por favor, adicione uma URL de imagem válida');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setAnalysisStatus('Iniciando extração...');

    try {
      const result = await ColoracaoSimplificadoService.analyzeImage(
        {
          input: {
            type: 'extracao',
            image_url: imageUrl
          }
        },
        (status) => {
          setAnalysisStatus(status);
        }
      );

      setAnalysisResult(result);
      setAnalysisStatus('');
      setActiveTab('extraction'); // Set to extraction tab when results arrive
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro durante a extração');
      setAnalysisStatus('');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Type guard to check if a region has an error - Now not applicable with new structure
  const isRegionError = (region: RegionResult): region is { error: string } => {
    return 'error' in region;
  };

  // Type guard to check if a region is successful - Now not applicable with new structure  
  const isRegionAnalysis = (region: RegionResult): region is RegionAnalysis => {
    return 'color_palette' in region;
  };

  // New type guard for RegionDetail
  const isRegionDetail = (region: RegionDetail): region is RegionDetail => {
    return 'color_palette' in region;
  };

  const handleStartClassification = async () => {
    if (!analysisResult) return;

    // Check if we have any successful regions for classification using new structure
    const hasSuccessfulRegions = Object.keys(analysisResult.output.details).length > 0;

    if (!hasSuccessfulRegions) {
      alert('Não é possível realizar a classificação. Nenhuma região foi extraída com sucesso.');
      return;
    }

    // Extract colors from the result field directly
    const colors = analysisResult.output.result;

    setIsClassifying(true);
    setClassificationStatus('Iniciando classificação...');

    try {
      console.log('Starting classification...');
      console.log('Sending colors:', colors);
      
      const result = await ColoracaoSimplificadoService.classifyColors(
        colors,
        (status) => {
          console.log('Classification status:', status);
          setClassificationStatus(status);
        }
      );
      
      console.log('Classification result:', result);
      
      if (result?.status === 'COMPLETED') {
        setClassificationStatus('Classificação concluída!');
        setFinalResults(result);
        setActiveTab('classification');
      } else {
        console.warn('Unexpected result structure:', result);
        setClassificationStatus('Classificação concluída com formato inesperado');
        alert('Classificação concluída, mas o formato do resultado é inesperado. Verifique o console para mais detalhes.');
      }
    } catch (error) {
      console.error('Error during final classification:', error);
      setClassificationStatus('Erro na classificação');
      alert(`Erro durante a classificação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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
      {Object.entries(region.color_palette).map(([key, color]) => (
        <div key={key} className="flex flex-col items-center">
          <div
            className="w-8 h-8 rounded border border-gray-300"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs text-gray-600 mt-1 capitalize">{key}</span>
        </div>
      ))}
    </div>
  );

  const renderTabs = () => {
    if (!analysisResult) return null;

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
    if (!analysisResult) return null;

    // With new structure, all regions in details are successful
    const successfulRegions = Object.entries(analysisResult.output.details) as [string, RegionDetail][];
    
    // No failed regions in new structure - all regions are in details or not present at all
    const expectedRegions = Object.keys(regionNames);
    const presentRegions = Object.keys(analysisResult.output.details);
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

        {/* Original extraction results - only for successful regions */}
        {successfulRegions.length > 0 && (
          <>
            <div className="flex flex-col md:flex-row gap-8 mb-6">
              <div className="text-center md:flex-1">
                <img
                  src={analysisResult.output.image_url}
                  alt="Imagem analisada"
                  className="max-w-xs mx-auto rounded-lg shadow-md my-4 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => window.open(analysisResult.output.image_url, '_blank')}
                />
                <p className="text-sm text-gray-600">
                  Regiões extraídas: {successfulRegions.length}/{expectedRegions.length}
                </p>
              </div>
              
              <div className="md:flex-1">
                <div className="space-y-3">
                  {successfulRegions.map(([regionKey, regionData]) => (
                    <div key={regionKey} className="text-center">
                      <span className="text-sm font-medium text-gray-700 mt-1 block">
                        {regionNames[regionKey as keyof typeof regionNames]}: {regionData.color_palette.result}
                      </span>
                      <div
                        className="w-full h-8 rounded border border-gray-300"
                        style={{ backgroundColor: regionData.color_palette.result }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {successfulRegions.map(([regionKey, regionData]) => (
                <div key={regionKey} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    {regionNames[regionKey as keyof typeof regionNames]}
                  </h4>

                  {renderColorPalette(regionData)}

                  {/* <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="text-center">
                      <img
                        src={regionData.uploaded_images.cropped_url}
                        alt="Recortada"
                        className="w-full h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => window.open(regionData.uploaded_images.cropped_url, '_blank')}
                      />
                      <span className="text-xs text-gray-600">Recortada</span>
                    </div>
                    <div className="text-center">
                      <img
                        src={regionData.uploaded_images.filtered_url}
                        alt="Filtrada"
                        className="w-full h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => window.open(regionData.uploaded_images.filtered_url, '_blank')}
                      />
                      <span className="text-xs text-gray-600">Filtrada</span>
                    </div>
                  </div> */}

                  <div className="mt-3 text-center">
                    <div
                      className="w-full h-8 rounded border border-gray-300"
                      style={{ backgroundColor: regionData.color_palette.result }}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Cor principal: {regionData.color_palette.result}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Show message if no regions were successful */}
        {successfulRegions.length === 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Nenhuma região foi detectada
            </h3>
            <p className="text-red-600">
              A análise não conseguiu detectar nenhuma região facial na imagem. 
              Tente com uma imagem diferente com melhor qualidade e iluminação.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderClassificationResults = () => {
    if (!finalResults) return null;

    return (
      <AnalysisResultsTab 
        finalResults={finalResults}
        onTryAgain={() => {
          setAnalysisResult(null);
          setFinalResults(null);
          setImageUrl('');
          setIsImageValid(false);
          setError('');
          setActiveTab('extraction');
        }}
      />
    );
  };

  return (
    <div className="bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto min-w-[1000px]">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {/* Action Buttons - only show when we have analysis results */}
            {analysisResult && (
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
                  onClick={() => {
                    setAnalysisResult(null);
                    setFinalResults(null);
                    setImageUrl('');
                    setIsImageValid(false);
                    setError('');
                    setActiveTab('extraction');
                  }}
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
        {!isAnalyzing && !isClassifying && analysisResult && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Resultados da Extração</h2>
            
            {/* Tabs */}
            {renderTabs()}
            
            {/* Tab Content */}
            {activeTab === 'extraction' && renderExtractionResults()}
            {activeTab === 'classification' && renderClassificationResults()}
          </div>
        )}

        {/* Extraction Section */}
        {!isAnalyzing && !isClassifying && !analysisResult && (
          <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
            <div className="space-y-6">
              <ImageUploadSection
                imageUrl={imageUrl}
                onImageUrlChange={handleImageUrlChange}
                isImageValid={isImageValid}
                onImageValidityChange={handleImageValidityChange}
                disabled={isAnalyzing}
                title="Upload da Imagem"
                sampleImages={{
                  urls: sampleImageUrls,
                  onSampleClick: handleGridButtonClick
                }}
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="flex justify-center">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !imageUrl.trim() || !isImageValid}
                  className={`px-8 py-3 rounded-lg font-semibold transition-colors ${isAnalyzing || !imageUrl.trim() || !isImageValid
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#947B62] text-white hover:bg-[#7a624e]'
                    }`}
                >
                  {isAnalyzing ? 'Analisando...' : 'Analisar Imagem'}
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
