import React, { useCallback, useEffect, useState } from 'react';
import { $getRoot, $getSelection, EditorState } from 'lexical';
import type { LexicalEditor, TextFormatType } from 'lexical';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes } from '@lexical/html';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { TRANSFORMERS } from '@lexical/markdown';
import { $isRangeSelection } from 'lexical';
import {
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
} from 'lexical';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
} from 'lucide-react';
import { clsx } from 'clsx';

// Editor theme
const theme = {
  ltr: 'ltr',
  rtl: 'rtl',
  placeholder: 'text-gray-400 absolute top-4 left-4 pointer-events-none',
  paragraph: 'mb-2',
  quote: 'border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4',
  heading: {
    h1: 'text-3xl font-bold mb-4',
    h2: 'text-2xl font-bold mb-3',
    h3: 'text-xl font-bold mb-2',
    h4: 'text-lg font-bold mb-2',
    h5: 'text-base font-bold mb-1',
    h6: 'text-sm font-bold mb-1',
  },
  list: {
    nested: {
      listitem: 'list-none',
    },
    ol: 'list-decimal list-inside my-2',
    ul: 'list-disc list-inside my-2',
    listitem: 'mb-1',
  },
  link: 'text-blue-600 hover:text-blue-800 underline',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
    code: 'bg-gray-100 px-1 py-0.5 rounded text-sm font-mono',
  },
  code: 'bg-gray-100 p-4 rounded-lg font-mono text-sm my-4 overflow-x-auto',
};

// Toolbar component
interface ToolbarProps {
  editor: LexicalEditor;
}

function Toolbar({ editor }: ToolbarProps): JSX.Element {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format states
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsCode(selection.hasFormat('code'));
    }
  }, []);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  useEffect(() => {
    return editor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload) => {
        setCanUndo(payload);
        return false;
      },
      1
    );
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      CAN_REDO_COMMAND,
      (payload) => {
        setCanRedo(payload);
        return false;
      },
      1
    );
  }, [editor]);

  const formatText = (format: TextFormatType) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <button
        disabled={!canUndo}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        className={clsx(
          'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50',
          { 'opacity-50 cursor-not-allowed': !canUndo }
        )}
        title="Undo"
      >
        <Undo className="w-4 h-4" />
      </button>
      
      <button
        disabled={!canRedo}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        className={clsx(
          'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50',
          { 'opacity-50 cursor-not-allowed': !canRedo }
        )}
        title="Redo"
      >
        <Redo className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      <button
        onClick={() => formatText('bold')}
        className={clsx(
          'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700',
          { 'bg-blue-100 dark:bg-blue-900': isBold }
        )}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>

      <button
        onClick={() => formatText('italic')}
        className={clsx(
          'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700',
          { 'bg-blue-100 dark:bg-blue-900': isItalic }
        )}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>

      <button
        onClick={() => formatText('underline')}
        className={clsx(
          'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700',
          { 'bg-blue-100 dark:bg-blue-900': isUnderline }
        )}
        title="Underline"
      >
        <Underline className="w-4 h-4" />
      </button>

      <button
        onClick={() => formatText('strikethrough')}
        className={clsx(
          'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700',
          { 'bg-blue-100 dark:bg-blue-900': isStrikethrough }
        )}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </button>

      <button
        onClick={() => formatText('code')}
        className={clsx(
          'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700',
          { 'bg-blue-100 dark:bg-blue-900': isCode }
        )}
        title="Code"
      >
        <Code className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      <button
        onClick={() => {
          // List commands would need proper implementation
          console.log('Bullet list clicked');
        }}
        className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>

      <button
        onClick={() => {
          // List commands would need proper implementation
          console.log('Numbered list clicked');
        }}
        className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      <button
        onClick={() => {
          editor.update(() => {
            const selection = $getSelection();
            if (selection !== null) {
              // Create quote block logic would go here
              console.log('Quote clicked');
            }
          });
        }}
        className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        title="Quote"
      >
        <Quote className="w-4 h-4" />
      </button>
    </div>
  );
}

// Plugin to connect toolbar
function ToolbarPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  return <Toolbar editor={editor} />;
}

// Main editor component
interface LexicalEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  minHeight?: string;
  maxHeight?: string;
  showToolbar?: boolean;
}

export default function LexicalRichTextEditor({
  value = '',
  onChange,
  placeholder = 'Enter some text...',
  className = '',
  readOnly = false,
  minHeight = '200px',
  maxHeight = '400px',
  showToolbar = true,
}: LexicalEditorProps): JSX.Element {
  const initialConfig = {
    namespace: 'LexicalEditor',
    theme,
    onError: (error: Error) => {
      console.error('Lexical error:', error);
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      AutoLinkNode,
      LinkNode,
    ],
    editable: !readOnly,
  };

  const handleChange = useCallback(
    (editorState: EditorState, editor: LexicalEditor) => {
      if (onChange) {
        editor.update(() => {
          const htmlString = $generateHtmlFromNodes(editor, null);
          onChange(htmlString);
        });
      }
    },
    [onChange],
  );

  return (
    <div className={clsx('lexical-editor border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden', className)}>
      <LexicalComposer initialConfig={initialConfig}>
        {showToolbar && <ToolbarPlugin />}
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className={clsx(
                  'outline-none p-4 resize-none overflow-auto',
                  'prose prose-sm max-w-none',
                  'dark:prose-invert',
                  'focus:ring-2 focus:ring-blue-500 focus:ring-inset'
                )}
                style={{
                  minHeight,
                  maxHeight,
                }}
                aria-placeholder={placeholder}
                placeholder={
                  <div className={theme.placeholder}>{placeholder}</div>
                }
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <OnChangePlugin onChange={handleChange} />
          <HistoryPlugin />
          <LinkPlugin />
          <ListPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        </div>
      </LexicalComposer>
    </div>
  );
}
