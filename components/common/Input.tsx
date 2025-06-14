
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

const Input: React.FC<InputProps> = ({ label, id, error, className = '', containerClassName = '', ...props }) => {
  const baseInputClasses = "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500";
  const errorInputClasses = "border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500";

  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">{label}</label>}
      <input
        id={id}
        className={`${baseInputClasses} ${error ? errorInputClasses : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default Input;
