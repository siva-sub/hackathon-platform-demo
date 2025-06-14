
import React from 'react';

interface ToggleSwitchProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  id,
  checked,
  onChange,
  label,
  size = 'md',
}) => {
  // Removed standalone 'const' from here
 
  const sizeClasses = {
    sm: {
      width: 'w-9',
      height: 'h-5',
      sliderTranslate: checked ? 'translate-x-4' : 'translate-x-0.5',
      sliderSize: 'w-4 h-4',
    },
    md: {
      width: 'w-11',
      height: 'h-6',
      sliderTranslate: checked ? 'translate-x-5' : 'translate-x-0.5',
      sliderSize: 'w-5 h-5',
    },
    lg: {
      width: 'w-14',
      height: 'h-7',
      sliderTranslate: checked ? 'translate-x-7' : 'translate-x-0.5',
      sliderSize: 'w-6 h-6',
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <label htmlFor={id} className="flex items-center cursor-pointer">
      {label && <span className="mr-3 text-sm font-medium text-gray-900 dark:text-gray-300">{label}</span>}
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`block ${currentSize.width} ${currentSize.height} rounded-full transition-colors duration-200 ease-in-out ${
            checked ? 'bg-primary-600 dark:bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        ></div>
        <div
          className={`dot absolute left-0.5 top-0.5 ${currentSize.sliderSize} bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out ${currentSize.sliderTranslate}`}
        ></div>
      </div>
    </label>
  );
};

export default ToggleSwitch;