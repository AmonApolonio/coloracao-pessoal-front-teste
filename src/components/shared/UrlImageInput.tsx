import React from 'react';

interface UrlImageInputProps {
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
  isImageValid: boolean;
  onImageValidityChange: (isValid: boolean) => void;
  placeholder?: string;
  showPreview?: boolean;
  disabled?: boolean;
}

const UrlImageInput: React.FC<UrlImageInputProps> = ({
  imageUrl,
  onImageUrlChange,
  isImageValid,
  onImageValidityChange,
  placeholder = "Cole a URL da imagem aqui...",
  showPreview = true,
  disabled = false
}) => {
  const handleClear = () => {
    onImageUrlChange('');
    onImageValidityChange(true);
  };

  const handleImageError = () => {
    onImageValidityChange(false);
  };

  const handleImageLoad = () => {
    onImageValidityChange(true);
  };

  return (
    <div className="w-full">
      <div className="relative w-full">
        <input
          type="url"
          required
          placeholder={placeholder}
          value={imageUrl}
          onChange={e => {
            onImageUrlChange(e.target.value);
            onImageValidityChange(true);
          }}
          disabled={disabled}
          className="px-5 py-3 pr-12 rounded-xl bg-white border-2 border-[#947B62] focus:outline-none focus:ring-4 focus:ring-[#947B62]/30 transition-all w-full text-gray-800 shadow-sm placeholder:text-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
        />
        {imageUrl && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-[#f3ede7] hover:bg-[#e5dbce] text-[#947B62] transition-colors shadow focus:outline-none"
            title="Limpar campo"
            tabIndex={0}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M6 6l8 8M6 14L14 6" stroke="#947B62" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>
      
      {showPreview && imageUrl && isImageValid && (
        <img
          src={imageUrl}
          alt="Pré-visualização"
          className="mx-auto rounded-xl shadow-lg max-h-52 object-contain border-2 border-[#947B62]/30 bg-gray-50 transition-all duration-300 animate-fadein mt-2"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      )}
      
      {showPreview && imageUrl && !isImageValid && (
        <div className="text-red-500 text-sm font-medium animate-fadein mt-2">
          Não foi possível carregar a imagem. Verifique se a URL é válida e acessível.
        </div>
      )}
    </div>
  );
};

export default UrlImageInput;
