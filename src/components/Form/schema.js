import * as yup from 'yup';

/**
 * Creates a Yup validation schema for the note form.
 * @description Centralizes schema definition to keep validation logic isolated
 * and testable. Title is required to enforce data integrity at the UI level
 * before hitting the database. Description is nullable because a note can be
 * saved with only a title (e.g., a quick draft placeholder).
 * @returns {yup.ObjectSchema} Validated schema for useForm resolver.
 */
export const createNoteFormSchema = () =>
  yup.object({
    title: yup.string().required('Title is required'),
    description: yup.object().nullable(),
  });
