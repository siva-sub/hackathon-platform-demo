
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  actions?: React.ReactNode;
  onClick?: () => void; // Add onClick prop
}

const Card: React.FC<CardProps> = ({ children, title, className = '', actions, onClick }) => {
  return (
    <div 
      className={`min-w-0 bg-white dark:bg-neutral-800 shadow-lg rounded-xl overflow-hidden ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick} // Apply onClick
      role={onClick ? "button" : undefined} // Accessibility for clickable div
      tabIndex={onClick ? 0 : undefined} // Accessibility
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); }} : undefined} // Accessibility for keyboard interaction
    >
      {(title || actions) && (
        <div className="px-4 py-5 sm:px-6 bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
          {title && <h3 className="text-lg leading-6 font-medium text-neutral-900 dark:text-neutral-50">{title}</h3>}
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className="px-4 py-5 sm:p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;