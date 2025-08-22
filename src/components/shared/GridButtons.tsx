import React from 'react';

interface GridButtonsProps {
  length: number;
  onButtonClick: (index: number) => void;
}

const GridButtons: React.FC<GridButtonsProps> = ({ length, onButtonClick }) => {
  return (
    <div className="grid grid-cols-8 gap-2">
      {Array.from({ length }, (_, index) => (
        <button
          key={index}
          onClick={() => onButtonClick(index)}
          className="w-10 h-10 bg-[#947B62] text-white font-semibold rounded-md hover:bg-[#7a624e] transition-all"
        >
          {index + 1}
        </button>
      ))}
    </div>
  );
};

export default GridButtons;
