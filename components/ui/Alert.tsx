
import React from 'react';
import { Icons } from '../../constants';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  message: React.ReactNode; // Changed from string to React.ReactNode
  title?: string;
  onClose?: () => void;
  className?: string; 
}

const Alert: React.FC<AlertProps> = ({ type = 'info', message, title, onClose, className = '' }) => {
  const baseClasses = 'p-4 rounded-md border';
  // Light mode classes
  const typeClassesLight = {
    success: 'bg-green-50 border-green-300 text-green-700',
    error: 'bg-red-50 border-red-300 text-red-700',
    warning: 'bg-yellow-50 border-yellow-300 text-yellow-700',
    info: 'bg-blue-50 border-blue-300 text-blue-700',
  };
  // Dark mode classes
  const typeClassesDark = {
    success: 'dark:bg-green-900 dark:border-green-700 dark:text-green-200',
    error: 'dark:bg-red-900 dark:border-red-700 dark:text-red-200',
    warning: 'dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200',
    info: 'dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200',
  };

  const IconComponents = {
    success: Icons.CheckCircle,
    error: Icons.XCircle,
    warning: Icons.LightBulb, 
    info: Icons.LightBulb,
  };

  const Icon = IconComponents[type];

  // Close button specific styling for light mode
  const closeButtonLightClasses = {
    success: 'bg-green-50 text-green-500 hover:bg-green-100 focus:ring-offset-green-50 focus:ring-green-600',
    error: 'bg-red-50 text-red-500 hover:bg-red-100 focus:ring-offset-red-50 focus:ring-red-600',
    warning: 'bg-yellow-50 text-yellow-500 hover:bg-yellow-100 focus:ring-offset-yellow-50 focus:ring-yellow-600',
    info: 'bg-blue-50 text-blue-500 hover:bg-blue-100 focus:ring-offset-blue-50 focus:ring-blue-600',
  };
  // Close button specific styling for dark mode
  const closeButtonDarkClasses = {
    success: 'dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800 dark:focus:ring-offset-green-900 dark:focus:ring-green-500',
    error: 'dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 dark:focus:ring-offset-red-900 dark:focus:ring-red-500',
    warning: 'dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-800 dark:focus:ring-offset-yellow-900 dark:focus:ring-yellow-500',
    info: 'dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 dark:focus:ring-offset-blue-900 dark:focus:ring-blue-500',
  };


  return (
    <div className={`${baseClasses} ${typeClassesLight[type]} ${typeClassesDark[type]} flex items-start ${className}`} role="alert">
      <div className="flex-shrink-0">
        <Icon />
      </div>
      <div className="ml-3">
        {title && <h3 className="text-sm font-medium">{title}</h3>}
        <div className={`text-sm ${title ? 'mt-2' : ''}`}>
          {message}
        </div>
      </div>
      {onClose && (
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 ${closeButtonLightClasses[type]} ${closeButtonDarkClasses[type]}`}
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alert;
