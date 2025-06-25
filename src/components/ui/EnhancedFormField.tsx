import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ChromePicker } from 'react-color';
import PhoneInput from 'react-phone-number-input';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import Slider from 'react-slider';
import { Editor } from '@monaco-editor/react';
import LexicalRichTextEditor from './LexicalEditor';
import { Question, QuestionOption } from '@/types';
import { 
  Upload, 
  Image, 
  Video, 
  FileText, 
  MapPin, 
  Calendar,
  Clock,
  Star,
  Check,
  X
} from 'lucide-react';
import { clsx } from 'clsx';

interface EnhancedFormFieldProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
}

export default function EnhancedFormField({
  question,
  value,
  onChange,
  error,
  disabled = false,
}: EnhancedFormFieldProps): JSX.Element {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleFileUpload = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // In a real app, you'd upload to a server and get back a URL
      const fileData = {
        id: Date.now().toString(),
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };
      onChange(fileData);
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileUpload,
    accept: question.validation?.fileTypes ? 
      question.validation.fileTypes.reduce((acc: Record<string, string[]>, type: string) => {
        acc[type] = [];
        return acc;
      }, {} as Record<string, string[]>) : undefined,
    maxSize: question.validation?.maxFileSize,
    multiple: false,
  });

  const renderField = () => {
    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            disabled={disabled}
            className={clsx(
              'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              'disabled:bg-gray-100 disabled:cursor-not-allowed',
              error && 'border-red-500'
            )}
            pattern={question.validation?.pattern}
            minLength={question.validation?.min}
            maxLength={question.validation?.max}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            disabled={disabled}
            rows={4}
            className={clsx(
              'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              'disabled:bg-gray-100 disabled:cursor-not-allowed resize-vertical',
              error && 'border-red-500'
            )}
            minLength={question.validation?.min}
            maxLength={question.validation?.max}
          />
        );

      case 'rich_text':
        return (
          <LexicalRichTextEditor
            value={value || ''}
            onChange={onChange}
            placeholder={question.placeholder}
            readOnly={disabled}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'email':
        return (
          <input
            type="email"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            disabled={disabled}
            className={clsx(
              'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              'disabled:bg-gray-100 disabled:cursor-not-allowed',
              error && 'border-red-500'
            )}
          />
        );

      case 'phone':
        return (
          <PhoneInput
            value={value}
            onChange={onChange}
            placeholder={question.placeholder}
            disabled={disabled}
            className={clsx(
              'w-full',
              error && 'border-red-500'
            )}
          />
        );

      case 'url':
        return (
          <input
            type="url"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            disabled={disabled}
            className={clsx(
              'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              'disabled:bg-gray-100 disabled:cursor-not-allowed',
              error && 'border-red-500'
            )}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder={question.placeholder}
            disabled={disabled}
            min={question.validation?.min}
            max={question.validation?.max}
            className={clsx(
              'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              'disabled:bg-gray-100 disabled:cursor-not-allowed',
              error && 'border-red-500'
            )}
          />
        );

      case 'date':
        return (
          <DatePicker
            selected={value ? new Date(value) : null}
            onChange={(date) => onChange(date?.toISOString().split('T')[0])}
            placeholderText={question.placeholder}
            disabled={disabled}
            className={clsx(
              'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              'disabled:bg-gray-100 disabled:cursor-not-allowed',
              error && 'border-red-500'
            )}
          />
        );

      case 'datetime':
        return (
          <DatePicker
            selected={value ? new Date(value) : null}
            onChange={(date) => onChange(date?.toISOString())}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            placeholderText={question.placeholder}
            disabled={disabled}
            className={clsx(
              'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              'disabled:bg-gray-100 disabled:cursor-not-allowed',
              error && 'border-red-500'
            )}
          />
        );

      case 'select':
        return (
          <Select
            value={question.options?.find(opt => opt.value === value)}
            onChange={(option) => onChange(option?.value)}
            options={question.options}
            placeholder={question.placeholder}
            isDisabled={disabled}
            className={error ? 'border-red-500' : ''}
            getOptionLabel={(option: QuestionOption) => option.label}
            getOptionValue={(option: QuestionOption) => option.value}
          />
        );

      case 'multiselect':
        return (
          <Select
            value={question.options?.filter(opt => value?.includes(opt.value)) || []}
            onChange={(options) => onChange((options as QuestionOption[])?.map((opt: QuestionOption) => opt.value) || [])}
            options={question.options}
            placeholder={question.placeholder}
            isMulti
            isDisabled={disabled}
            className={error ? 'border-red-500' : ''}
            getOptionLabel={(option: QuestionOption) => option.label}
            getOptionValue={(option: QuestionOption) => option.value}
          />
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option.id} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  disabled={disabled}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={option.value}
                  checked={value?.includes(option.value) || false}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const currentValues = value || [];
                    if (e.target.checked) {
                      onChange([...currentValues, option.value]);
                    } else {
                      onChange(currentValues.filter((v: string) => v !== option.value));
                    }
                  }}
                  disabled={disabled}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'rating':
        const maxRating = question.validation?.max || 5;
        return (
          <div className="flex items-center space-x-1">
            {Array.from({ length: maxRating }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onChange(i + 1)}
                disabled={disabled}
                className={clsx(
                  'p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500',
                  disabled && 'cursor-not-allowed opacity-50'
                )}
              >
                <Star
                  className={clsx(
                    'w-6 h-6',
                    i < (value || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  )}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {value ? `${value}/${maxRating}` : 'Not rated'}
            </span>
          </div>
        );

      case 'slider':
        const min = question.validation?.min || 0;
        const max = question.validation?.max || 100;
        return (
          <div className="space-y-2">
            <Slider
              value={value || min}
              onChange={onChange}
              min={min}
              max={max}
              disabled={disabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              thumbClassName="w-4 h-4 bg-blue-600 rounded-full cursor-pointer"
              trackClassName="h-2 bg-blue-200 rounded-lg"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{min}</span>
              <span className="font-medium">{value || min}</span>
              <span>{max}</span>
            </div>
          </div>
        );

      case 'file':
      case 'image':
      case 'video':
        return (
          <div
            {...getRootProps()}
            className={clsx(
              'border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer',
              'hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500',
              isDragActive && 'border-blue-400 bg-blue-50',
              disabled && 'cursor-not-allowed opacity-50',
              error && 'border-red-500'
            )}
          >
            <input {...getInputProps()} disabled={disabled} />
            <div className="space-y-2">
              {question.type === 'image' && <Image className="w-8 h-8 mx-auto text-gray-400" />}
              {question.type === 'video' && <Video className="w-8 h-8 mx-auto text-gray-400" />}
              {question.type === 'file' && <FileText className="w-8 h-8 mx-auto text-gray-400" />}
              
              {value ? (
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{value.name}</p>
                  <p className="text-xs">{(value.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  <p>
                    {isDragActive
                      ? `Drop the ${question.type} here...`
                      : `Drag & drop a ${question.type} here, or click to select`}
                  </p>
                  {question.validation?.fileTypes && (
                    <p className="text-xs text-gray-500">
                      Accepted: {question.validation.fileTypes.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 'color':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                disabled={disabled}
                className={clsx(
                  'w-10 h-10 rounded border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500',
                  disabled && 'cursor-not-allowed opacity-50'
                )}
                style={{ backgroundColor: value || '#000000' }}
              />
              <input
                type="text"
                value={value || '#000000'}
                onChange={(e) => onChange(e.target.value)}
                placeholder="#000000"
                disabled={disabled}
                className={clsx(
                  'flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  'disabled:bg-gray-100 disabled:cursor-not-allowed',
                  error && 'border-red-500'
                )}
              />
            </div>
            {showColorPicker && (
              <div className="absolute z-10">
                <div
                  className="fixed inset-0"
                  onClick={() => setShowColorPicker(false)}
                />
                <ChromePicker
                  color={value || '#000000'}
                  onChange={(color) => onChange(color.hex)}
                />
              </div>
            )}
          </div>
        );

      case 'code':
        return (
          <div className="border border-gray-300 rounded-md overflow-hidden">
            <Editor
              height="200px"
              defaultLanguage="javascript"
              value={value || ''}
              onChange={(val) => onChange(val || '')}
              options={{
                readOnly: disabled,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
              }}
              theme="vs-light"
            />
          </div>
        );

      case 'location':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={value?.address || ''}
                onChange={(e) => onChange({ ...value, address: e.target.value })}
                placeholder="Enter address or location"
                disabled={disabled}
                className={clsx(
                  'flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  'disabled:bg-gray-100 disabled:cursor-not-allowed',
                  error && 'border-red-500'
                )}
              />
            </div>
            {value?.coordinates && (
              <div className="text-xs text-gray-500">
                Lat: {value.coordinates.lat}, Lng: {value.coordinates.lng}
              </div>
            )}
          </div>
        );

      case 'legal_acceptance':
        return (
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
              className="mt-1 text-blue-600 focus:ring-blue-500"
              required={question.required}
            />
            <div className="flex-1">
              <div 
                className="text-sm text-gray-700"
                dangerouslySetInnerHTML={{ __html: question.text }}
              />
              {question.helpText && (
                <p className="text-xs text-gray-500 mt-1">{question.helpText}</p>
              )}
            </div>
          </label>
        );

      default:
        return (
          <div className="text-red-500 text-sm">
            Unsupported question type: {question.type}
          </div>
        );
    }
  };

  return (
    <div className="space-y-2">
      {question.type !== 'legal_acceptance' && (
        <label className="block text-sm font-medium text-gray-700">
          {question.text}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {renderField()}
      
      {question.helpText && question.type !== 'legal_acceptance' && (
        <p className="text-xs text-gray-500">{question.helpText}</p>
      )}
      
      {error && (
        <p className="text-sm text-red-600 flex items-center space-x-1">
          <X className="w-4 h-4" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
