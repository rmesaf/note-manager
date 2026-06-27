'use client';

import { cn } from '@/utils/cn';
import { createNoteFormSchema } from './schema';
import { Editor } from '@/components/Editor';
import { toast } from 'sonner';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useModal } from '@/context/ModalContext';
import { useNotes } from '@/hooks/useNotes';
import { useRouter } from 'next/navigation';
import { yupResolver } from '@hookform/resolvers/yup';
import Button from '@/components/Button';
import Card from '@/components/Card';
import ConfirmModal from '@/components/ConfirmModal';
import Input from '@/components/Input';

/**
 * Form component for note creation and editing.
 * @description Encapsulates all form logic (validation, submission, data loading)
 * and exposes it via render props to the parent. This keeps business logic
 * isolated from presentation, making NoteFormPage purely presentational.
 * The component handles:
 * - react-hook-form setup with Yup validation
 * - Loading existing note data in Edit Mode
 * - Persisting notes to IndexedDB on submit
 * - Unsaved-changes protection on cancel
 * - Toast notifications for user feedback
 * @param {Object} props
 * @param {boolean} props.isEditMode - Whether we're editing or creating.
 * @param {string} props.noteId - The note ID (in Edit Mode).
 * @param {Function} props.onSaveSuccess - Callback invoked after successful save.
 * @param {Function} props.children - Render function receiving form state and handlers.
 * @returns {JSX.Element}
 */
const Form = ({ className, isEditMode, noteId, onSaveSuccess }) => {
  const router = useRouter();
  const { openModal } = useModal();
  const { createNote, updateNote, getNoteById } = useNotes();
  const [isSaving, setIsSaving] = useState(false);
  const hasLoadedNote = useRef(false);
  const editorRef = useRef(null);

  const schema = createNoteFormSchema();
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isValid, isDirty },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { title: '', description: null, notebookId: '', tags: [] },
    mode: 'onChange',
  });

  /**
   * Populates the form with existing note data in Edit Mode.
   * @description Runs once when we haven't loaded yet, using a ref guard to
   * prevent re-population. Redirects to home if the note ID is invalid.
   */
  useEffect(() => {
    if (!isEditMode || hasLoadedNote.current) return;
    hasLoadedNote.current = true;

    getNoteById(noteId).then((note) => {
      if (!note) {
        toast.error('Note not found.');
        router.push('/');
        return;
      }
      reset({
        title: note.title,
        description: note.description,
        notebookId: note.notebookId || '',
        tags: note.tags || [],
      });
      if (note.description && editorRef.current) {
        editorRef.current.commands.setContent(note.description);
      }
    });
  }, [isEditMode, noteId]);

  /**
   * Persists the note to IndexedDB and invokes success callback.
   * @param {Object} data - Validated form values from react-hook-form.
   * @returns {Promise<void>}
   */
  const onSubmit = async (data) => {
    console.log('Form submitted with data:', data);
    try {
      setIsSaving(true);
      if (isEditMode) {
        await updateNote(noteId, {
          title: data.title,
          description: data.description,
        });
      } else {
        await createNote({
          title: data.title,
          description: data.description,
          notebookId: data.notebookId || null,
          tags: data.tags || [],
        });
      }
      toast.success('Note saved successfully');
      onSaveSuccess();
    } catch {
      toast.error('Failed to save the note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handles the Cancel action with unsaved-changes protection.
   * @description Skips the modal entirely when the form is pristine (isDirty false)
   * to avoid friction for users who navigate away without making changes.
   * Only prompts when actual data would be lost.
   * @returns {void}
   */
  const handleCancel = () => {
    if (!isDirty) {
      router.push('/');
      return;
    }
    openModal(ConfirmModal, {
      message:
        'Are you sure you want to cancel? If you cancel, you will lose any unsaved data.',
      onAccept: () => router.push('/'),
      onCancel: () => {},
    });
  };

  return (
    <form className={cn('flex flex-1 flex-col', className)} onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card className="p-0">
        {/* Title input */}
        <div className="px-6 pt-6">
          <Input
            variant="none"
            inputSize="large"
            placeholder="Add note title..."
            {...register('title')}
          />
        </div>

        {/* Formatting toolbar & Editor */}
        <Editor
          ref={editorRef}
          control={control}
          onUpdate={(content) => {
            setValue('description', content, { shouldDirty: true });
          }}
        />

        {/* Action footer */}
        <div className="px-6 border-t border-sand pt-4 mt-4 mb-6 flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="full"
            disabled={!isValid || !isDirty}
            isLoading={isSaving}
          >
            Save
          </Button>
        </div>
      </Card>
    </form>
  );
};

export default Form;
