'use client';

import { forwardRef } from 'react';
import { Controller } from 'react-hook-form';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import EditorToolbar from './EditorToolbar';

/**
 * Rich text editor component with integrated formatting toolbar.
 * @description Encapsulates all Tiptap editor logic, extensions configuration,
 * and toolbar action definitions. Integrates with react-hook-form via Controller
 * to keep the form's isDirty state accurate when content changes.
 * Purely presentational — maintains the `control` prop as the single source of
 * form state truth, delegating content updates back to react-hook-form.
 * Exposes the editor instance via ref for programmatic access (e.g., setContent).
 * @param {Object} props
 * @param {Object} props.control - React Hook Form's control object.
 * @param {Function} [props.onUpdate] - Callback invoked when editor content changes.
 * @param {string} [props.fieldName='description'] - The form field name to bind to.
 * @param {React.Ref} ref - Forward ref to access the Tiptap editor instance.
 * @returns {JSX.Element}
 */
const Editor = forwardRef(({ control, onUpdate, fieldName = 'description' }, ref) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false,
        underline: false,
      }),
      Underline,
      Placeholder.configure({
        placeholder: 'Start writing your masterpiece here...',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-cocoa underline transition-colors duration-200 hover:text-cocoa/80',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    editorProps: {
      attributes: {
        class:
          'min-h-[300px] outline-none text-ink font-workSans leading-relaxed',
      },
    },
    onUpdate: ({ editor: editorInstance }) => {
      // Call onUpdate callback when content changes, if provided
      if (onUpdate) {
        onUpdate(editorInstance.getJSON());
      }
    },
    immediatelyRender: false,
  });

  // Expose editor instance via ref for parent component access
  if (ref) {
    if (typeof ref === 'function') {
      ref(editor);
    } else {
      ref.current = editor;
    }
  }

  /**
   * Toolbar actions definition array.
   * @description Each action object specifies the Tiptap command, active state check,
   * and UI properties (title, children). Separators are marked with separator: true.
   * This allows the toolbar to be data-driven and easily extensible without
   * modifying the Editor component's JSX.
   */
  const toolbarActions = [
    // Undo/Redo
    {
      onClick: () => editor?.chain().focus().undo().run(),
      isActive: false,
      title: 'Undo',
      children: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <path d="M3 7v6h6" />
          <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
        </svg>
      ),
    },
    {
      onClick: () => editor?.chain().focus().redo().run(),
      isActive: false,
      title: 'Redo',
      children: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <path d="M21 7v6h-6" />
          <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7" />
        </svg>
      ),
    },
    { separator: true },

    // Text formatting
    {
      onClick: () => editor?.chain().focus().toggleBold().run(),
      isActive: editor?.isActive('bold'),
      title: 'Bold',
      children: <strong>B</strong>,
    },
    {
      onClick: () => editor?.chain().focus().toggleItalic().run(),
      isActive: editor?.isActive('italic'),
      title: 'Italic',
      children: <em>I</em>,
    },
    {
      onClick: () => editor?.chain().focus().toggleUnderline().run(),
      isActive: editor?.isActive('underline'),
      title: 'Underline',
      children: <span className="underline">U</span>,
    },
    {
      onClick: () => editor?.chain().focus().toggleStrike().run(),
      isActive: editor?.isActive('strike'),
      title: 'Strike',
      children: <s>S</s>,
    },
    {
      onClick: () => editor?.chain().focus().toggleCode().run(),
      isActive: editor?.isActive('code'),
      title: 'Code',
      children: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
    },
    { separator: true },

    // Headings and text - grouped in select
    {
      type: 'select',
      title: 'Heading',
      displayValue: 'Hd',
      options: [
        {
          label: 'Normal',
          icon: <span className="text-xs">¶</span>,
          onClick: () => editor?.chain().focus().setParagraph().run(),
          isActive: editor?.isActive('paragraph'),
        },
        {
          label: 'Heading 1',
          onClick: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
          isActive: editor?.isActive('heading', { level: 1 }),
        },
        {
          label: 'Heading 2',
          onClick: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
          isActive: editor?.isActive('heading', { level: 2 }),
        },
        {
          label: 'Heading 3',
          onClick: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
          isActive: editor?.isActive('heading', { level: 3 }),
        },
        {
          label: 'Heading 4',
          onClick: () => editor?.chain().focus().toggleHeading({ level: 4 }).run(),
          isActive: editor?.isActive('heading', { level: 4 }),
        },
      ],
    },
    { separator: true },

    // Lists - grouped in select
    {
      type: 'select',
      title: 'Lists',
      displayValue: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <line x1="9" y1="6" x2="20" y2="6" />
          <line x1="9" y1="12" x2="20" y2="12" />
          <line x1="9" y1="18" x2="20" y2="18" />
          <circle cx="4" cy="6" r="1" fill="currentColor" />
          <circle cx="4" cy="12" r="1" fill="currentColor" />
          <circle cx="4" cy="18" r="1" fill="currentColor" />
        </svg>
      ),
      options: [
        {
          label: 'Bullet List',
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
              aria-hidden="true"
            >
              <line x1="9" y1="6" x2="20" y2="6" />
              <line x1="9" y1="12" x2="20" y2="12" />
              <line x1="9" y1="18" x2="20" y2="18" />
              <circle cx="4" cy="6" r="1" fill="currentColor" />
              <circle cx="4" cy="12" r="1" fill="currentColor" />
              <circle cx="4" cy="18" r="1" fill="currentColor" />
            </svg>
          ),
          onClick: () => editor?.chain().focus().toggleBulletList().run(),
          isActive: editor?.isActive('bulletList'),
        },
        {
          label: 'Ordered List',
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
              aria-hidden="true"
            >
              <line x1="10" y1="6" x2="21" y2="6" />
              <line x1="10" y1="12" x2="21" y2="12" />
              <line x1="10" y1="18" x2="21" y2="18" />
              <path d="M4 6h1v4" />
              <path d="M4 10h2" />
              <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
            </svg>
          ),
          onClick: () => editor?.chain().focus().toggleOrderedList().run(),
          isActive: editor?.isActive('orderedList'),
        },
      ],
    },
    { separator: true },

    // Code and link
    {
      onClick: () => editor?.chain().focus().toggleCodeBlock().run(),
      isActive: editor?.isActive('codeBlock'),
      title: 'Code Block',
      children: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 9h6M9 15h6" />
          <path d="M15 9v6" />
        </svg>
      ),
    },
    {
      onClick: () => {
        const url = prompt('Enter the URL');
        if (url) {
          editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }
      },
      isActive: editor?.isActive('link'),
      title: 'Link',
      children: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      ),
    },
    { separator: true },

    // Text alignment - grouped in select
    {
      type: 'select',
      title: 'Alignment',
      displayValue: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <line x1="17" y1="10" x2="3" y2="10" />
          <line x1="21" y1="6" x2="3" y2="6" />
          <line x1="21" y1="14" x2="3" y2="14" />
          <line x1="17" y1="18" x2="3" y2="18" />
        </svg>
      ),
      options: [
        {
          label: 'Align Left',
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
              aria-hidden="true"
            >
              <line x1="17" y1="10" x2="3" y2="10" />
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="21" y1="14" x2="3" y2="14" />
              <line x1="17" y1="18" x2="3" y2="18" />
            </svg>
          ),
          onClick: () => editor?.chain().focus().setTextAlign('left').run(),
          isActive: editor?.isActive({ textAlign: 'left' }),
        },
        {
          label: 'Align Center',
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
              aria-hidden="true"
            >
              <line x1="18" y1="10" x2="6" y2="10" />
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="21" y1="14" x2="3" y2="14" />
              <line x1="18" y1="18" x2="6" y2="18" />
            </svg>
          ),
          onClick: () => editor?.chain().focus().setTextAlign('center').run(),
          isActive: editor?.isActive({ textAlign: 'center' }),
        },
        {
          label: 'Align Right',
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
              aria-hidden="true"
            >
              <line x1="7" y1="10" x2="21" y2="10" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="14" x2="21" y2="14" />
              <line x1="7" y1="18" x2="21" y2="18" />
            </svg>
          ),
          onClick: () => editor?.chain().focus().setTextAlign('right').run(),
          isActive: editor?.isActive({ textAlign: 'right' }),
        },
        {
          label: 'Justify',
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
              aria-hidden="true"
            >
              <line x1="21" y1="10" x2="3" y2="10" />
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="21" y1="14" x2="3" y2="14" />
              <line x1="21" y1="18" x2="3" y2="18" />
            </svg>
          ),
          onClick: () => editor?.chain().focus().setTextAlign('justify').run(),
          isActive: editor?.isActive({ textAlign: 'justify' }),
        },
      ],
    },
  ];

  return (
    <>
      <EditorToolbar actions={toolbarActions} />
      <Controller
        name={fieldName}
        control={control}
        render={({ field }) => (
          <div className="px-6 min-h-75">
            <EditorContent
              editor={editor}
            />
          </div>
        )}
      />
    </>
  );
});

Editor.displayName = 'Editor';

export default Editor;
