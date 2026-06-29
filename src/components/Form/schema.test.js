/**
 * Unit tests for createNoteFormSchema.
 * Pure Yup validation — no DOM rendering needed.
 */

import { describe, it, expect } from 'vitest';
import { createNoteFormSchema } from './schema';

describe('createNoteFormSchema', () => {
  it('returns a Yup schema with a validate method', () => {
    const schema = createNoteFormSchema();
    expect(typeof schema.validate).toBe('function');
  });
});

describe('createNoteFormSchema — title field', () => {
  it('passes when title is a non-empty string', async () => {
    const schema = createNoteFormSchema();
    await expect(
      schema.validate({ title: 'My Note', description: null })
    ).resolves.toBeDefined();
  });

  it('fails with "Title is required" when title is an empty string', async () => {
    const schema = createNoteFormSchema();
    await expect(
      schema.validate({ title: '', description: null })
    ).rejects.toThrow('Title is required');
  });

  it('fails with "Title is required" when title is missing', async () => {
    const schema = createNoteFormSchema();
    await expect(
      schema.validate({ description: null })
    ).rejects.toThrow('Title is required');
  });

  it('passes when title contains only whitespace (required() does not auto-trim)', async () => {
    // Yup string().required() checks non-empty — whitespace is non-empty.
    // Use .trim().required() in the schema to reject whitespace-only strings.
    const schema = createNoteFormSchema();
    await expect(
      schema.validate({ title: '   ', description: null })
    ).resolves.toBeDefined();
  });
});

describe('createNoteFormSchema — description field', () => {
  it('passes when description is null', async () => {
    const schema = createNoteFormSchema();
    await expect(
      schema.validate({ title: 'Test', description: null })
    ).resolves.toBeDefined();
  });

  it('passes when description is a Tiptap JSON object', async () => {
    const schema = createNoteFormSchema();
    await expect(
      schema.validate({ title: 'Test', description: { type: 'doc', content: [] } })
    ).resolves.toBeDefined();
  });

  it('passes when description is omitted (defaults to undefined — allowed by nullable)', async () => {
    const schema = createNoteFormSchema();
    // description is nullable so undefined/null are both valid
    await expect(schema.validate({ title: 'Test' })).resolves.toBeDefined();
  });
});
