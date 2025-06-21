import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  label?: string;
  id?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string; // For the editor itself
  containerClassName?: string; // For the surrounding div
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder,
  label,
  id,
  error,
  helperText,
  disabled = false,
  className = '',
  containerClassName = '',
}) => {
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', /* 'image' - consider adding image support carefully */],
      ['clean']
    ],
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', /* 'image' */
  ];

  const baseContainerStyle = `mb-4 ${containerClassName}`;
  // Note: Quill's own CSS handles most of the editor's appearance.
  // Custom styling for the Quill editor is applied via index.html <style> tag.

  return (
    <div className={baseContainerStyle}>
      {label && <label htmlFor={id} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">{label}</label>}
      <div className={`${className} ${error ? 'ql-error-outline' : ''} rounded-md overflow-hidden border ${error ? 'border-red-500 dark:border-red-400' : 'border-transparent'}`}>
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          readOnly={disabled}
          className={disabled ? 'opacity-70 bg-neutral-100 dark:bg-neutral-800' : ''}
          id={id}
        />
      </div>
      {helperText && <p id={`${id}-helper`} className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{helperText}</p>}
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default RichTextEditor;