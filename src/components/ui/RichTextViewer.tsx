import React from 'react';

interface RichTextViewerProps {
  htmlContent: string;
  className?: string;
}

const RichTextViewer: React.FC<RichTextViewerProps> = ({ htmlContent, className = '' }) => {
  // Basic sanitization: remove script tags. For more robust sanitization, a library like DOMPurify would be needed.
  // However, given the context of user input through a controlled Quill editor, this might be acceptable for now.
  // If external HTML sources were possible, full sanitization would be critical.
  const sanitizedHtml = htmlContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  return (
    <div
      className={`prose dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default RichTextViewer;