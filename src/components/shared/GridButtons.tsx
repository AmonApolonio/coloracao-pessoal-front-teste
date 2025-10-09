import React from 'react';

interface GridButtonsProps {
  length: number;
  onButtonClick: (index: number) => void;
  urls?: string[];
  selectedIndex?: number;
}

// Helper function to extract name from URL
const extractNameFromUrl = (url: string): string => {
  try {
    // Split by '/' and get the second to last segment (folder name before image name)
    const parts = url.split('/');
    const name = parts[parts.length - 2];
    // Capitalize first letter and handle special cases
    return name
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  } catch {
    return 'Sample';
  }
};

const GridButtons: React.FC<GridButtonsProps> = ({ length, onButtonClick, urls, selectedIndex }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {Array.from({ length }, (_, index) => {
        const displayText = urls ? extractNameFromUrl(urls[index]) : `${index + 1}`;
        
        return (
          <button
            key={index}
            onClick={() => onButtonClick(index)}
            className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
              selectedIndex === index
                ? 'bg-[#947B62] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-[#947B62] hover:text-white'
            }`}
          >
            {displayText}
          </button>
        );
      })}
    </div>
  );
};

export default GridButtons;
