
import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  helperText?: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, id, error, className = '', containerClassName = '', helperText, ...props }) => {
  const baseStyle = 'mt-1 block w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 sm:text-sm dark:text-neutral-100 dark:placeholder-neutral-300';
  const errorStyle = 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400';

  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && <label htmlFor={id} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</label>}
      <textarea
        id={id}
        rows={4}
        className={`${baseStyle} ${error ? errorStyle : ''} ${className}`}
        aria-describedby={helperText ? `${id}-helper` : undefined}
        {...props}
      />
      {helperText && <p id={`${id}-helper`} className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{helperText}</p>}
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default Textarea;