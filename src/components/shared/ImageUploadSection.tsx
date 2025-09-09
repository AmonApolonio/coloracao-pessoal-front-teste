import React, { useState } from 'react';
import UrlImageInput from './UrlImageInput';
import FileUploadWithDragDrop from './FileUploadWithDragDrop';
import GridButtons from './GridButtons';

interface ImageUploadSectionProps {
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
  isImageValid: boolean;
  onImageValidityChange: (isValid: boolean) => void;
  disabled?: boolean;
  title?: string;
  uploadType?: 'extracao-frontal' | 'extracao-olho';
  sampleImages?: {
    urls: string[];
    onSampleClick: (index: number) => void;
  };
}

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  imageUrl,
  onImageUrlChange,
  isImageValid,
  onImageValidityChange,
  disabled = false,
  title = "Upload da Imagem",
  uploadType = 'extracao-frontal',
  sampleImages
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'upload'>('upload');

  const handleFileUploaded = (url: string) => {
    onImageUrlChange(url);
    onImageValidityChange(true);
    // Switch to URL tab to show the uploaded image
    setActiveTab('url');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      
      {/* Tab Navigation - Centered */}
      <div className="flex justify-center">
        <div className="flex bg-gray-100 rounded-lg p-1 max-w-md">
          <button
            onClick={() => setActiveTab('upload')}
            disabled={disabled}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'upload'
                ? 'bg-[#947B62] text-white'
                : 'text-gray-600 hover:text-gray-800'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            📁 Upload Arquivo
          </button>
          <button
            onClick={() => setActiveTab('url')}
            disabled={disabled}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'url'
                ? 'bg-[#947B62] text-white'
                : 'text-gray-600 hover:text-gray-800'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            🔗 URL
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[200px]">
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Envie uma imagem do seu computador. Ela será automaticamente carregada para a nuvem.
            </p>
            <FileUploadWithDragDrop
              onFileUploaded={handleFileUploaded}
              disabled={disabled}
              uploadType={uploadType}
            />
          </div>
        )}

        {activeTab === 'url' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Cole a URL de uma imagem já hospedada na internet.
            </p>
            <UrlImageInput
              imageUrl={imageUrl}
              onImageUrlChange={onImageUrlChange}
              isImageValid={isImageValid}
              onImageValidityChange={onImageValidityChange}
              placeholder="Cole a URL da imagem aqui..."
              disabled={disabled}
              showPreview={true}
            />
            
            {/* Sample Images Section - Only in URL tab */}
            {sampleImages && (
              <div>
                <h4 className="text-lg font-semibold mb-4">Ou escolha uma imagem de exemplo</h4>
                <GridButtons
                  length={sampleImages.urls.length}
                  onButtonClick={sampleImages.onSampleClick}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Helper Text */}
      {/* <div className="text-xs text-gray-500 space-y-1">
        <p>💡 <strong>Dica:</strong> Para melhores resultados, use imagens:</p>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li>Com boa iluminação natural</li>
          <li>Com o rosto bem visível e centrado</li>
          <li>Sem filtros ou maquiagem muito intensa</li>
          <li>Em formato JPEG, PNG ou WebP</li>
        </ul>
      </div> */}
    </div>
  );
};

export default ImageUploadSection;
