import React from 'react';

interface ColorTemplate {
  input: {
    name: string;
    colors: Record<string, string>;
    'user-photo': string;
  };
}

interface ColorTemplateSelectorProps {
  templates: ColorTemplate[];
  onTemplateSelect: (colors: Record<string, string>, index: number, userPhoto: string) => void;
  selectedIndex?: number;
}

const ColorTemplateSelector: React.FC<ColorTemplateSelectorProps> = ({ 
  templates, 
  onTemplateSelect,
  selectedIndex
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
        Selecionar Modelo Pré-Definido
      </h3>
      <p className="text-sm text-gray-600 mb-6 text-center">
        Escolha um dos modelos de cores pré-selecionados para preencher automaticamente
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-w-6xl mx-auto">
        {templates.map((template, index) => (
          <div key={index} className="relative group flex items-stretch">
            <button
              onClick={() => onTemplateSelect(template.input.colors, index, template.input['user-photo'])}
              className={`w-full h-full px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                selectedIndex === index
                  ? 'bg-[#947B62] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-[#947B62] hover:text-white'
              }`}
              style={{ minWidth: 0 }}
            >
              {template.input.name}
            </button>
            {/* Tooltip with user photo */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-32 z-10 hidden group-hover:flex flex-col items-center">
              <div className="bg-white p-2 rounded-lg shadow-lg border border-gray-200 flex flex-col items-center">
                <img
                  src={template.input['user-photo']}
                  alt="User Photo"
                  className="w-24 h-24 object-cover rounded-full mb-2 border border-gray-300"
                  style={{ minWidth: '6rem', minHeight: '6rem' }}
                />
                <span className="text-xs text-gray-700">Pré-visualização</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorTemplateSelector;
