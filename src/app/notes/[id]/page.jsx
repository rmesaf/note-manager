'use client';

import { useParams, useRouter } from 'next/navigation';
import { Form } from '@/components/Form';

/**
 * Note creation and editing page.
 * @description Purely presentational page component that:
 * - Determines the edit/create mode based on route params
 * - Delegates form logic to the Form component
 * - Renders the form UI with minimal state management
 * - Focuses entirely on layout and presentation
 * @returns {JSX.Element}
 */
export default function NoteFormPage() {
  const params = useParams();
  const router = useRouter();
  const isEditMode = params.id !== 'new';

  return (
    <div className="w-full md:w-4/5 lg:max-w-3/4 mx-auto px-4 py-8">
      <Form
        className="flex flex-col gap-6 w-full"
        isEditMode={isEditMode}
        noteId={params.id}
        onSaveSuccess={() => router.push('/')}
      />
    </div>
  );
}
