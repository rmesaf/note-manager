/**
 * E2E Integration Tests — Notes Manager CRUD Suite
 *
 * @description Covers the five critical MVP flows end-to-end:
 *   1. Empty state (Read — no data)
 *   2. Create note
 *   3. Read notes (multiple notes visible)
 *   4. Update note
 *   5. Delete note (cancel guard + confirm)
 *   6. Persistence across page reload (IndexedDB)
 *
 * Isolation strategy:
 *   Playwright creates a fresh browser context (and therefore a fresh
 *   IndexedDB instance) for every `test()` call by default. This is the
 *   native "Browser Context" isolation described in specs/HomeView.md.
 *   No manual window.indexedDB mock or clear operation is needed.
 *
 * Tiptap interaction:
 *   Content is typed directly into .ProseMirror using page.keyboard.type().
 *   Complex formatting shortcuts are deliberately avoided.
 *
 * Modal interaction:
 *   The ConfirmModal is reached through the global modal system; tests
 *   interact with it by role ("dialog") and button labels ("Aceptar" / "Cancelar").
 */

const { test, expect } = require('@playwright/test');

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

const SELECTORS = {
  titleInput: '[placeholder="Add note title..."]',
  proseMirror: '.ProseMirror',
  saveButton: 'button:has-text("Save")',
  cancelButton: 'button:has-text("Cancel")',
  newNoteButton: 'button:has-text("New Note")',
  deleteNoteButton: '[aria-label="Delete note"]',
  editLink: 'a:has-text("Edit →")',
  dialog: '[role="dialog"]',
  confirmAccept: 'button:has-text("Aceptar")',
  confirmCancel: 'button:has-text("Cancelar")',
};

// ---------------------------------------------------------------------------
// Shared helper — creates a note through the UI and returns to home.
// ---------------------------------------------------------------------------

/**
 * Navigates to /notes/new, fills the form, and saves.
 * After calling this, the page URL will be '/'.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} title - Note title (required for the form to be valid).
 * @param {string} [content] - Optional body text typed into the Tiptap editor.
 */
async function createNote(page, title, content = '') {
  await page.goto('/notes/new');

  // Fill the title input (triggers react-hook-form onChange → isDirty + isValid).
  await page.fill(SELECTORS.titleInput, title);

  // Type into the Tiptap ProseMirror area if content is provided.
  if (content) {
    await page.locator(SELECTORS.proseMirror).click();
    await page.keyboard.type(content);
  }

  // Wait for the Save button to become enabled before clicking.
  await expect(page.locator(SELECTORS.saveButton)).toBeEnabled();
  await page.click(SELECTORS.saveButton);

  // Wait for the post-save redirect to the home page.
  await expect(page).toHaveURL('/');
}

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------

test.describe('Notes Manager — CRUD E2E', () => {

  // ─── 1. Empty State ───────────────────────────────────────────────────────

  test('shows the empty state when no notes exist', async ({ page }) => {
    await page.goto('/');

    // The EmptyState heading is the clearest signal of a pristine database.
    const emptyStateHeading = page.getByRole('heading', {
      name: 'No notes yet.',
      level: 2,
    });
    await expect(emptyStateHeading).toBeVisible();

    // The subtitle text confirms the EmptyState component is fully rendered.
    await expect(page.getByText('Start writing your masterpiece!')).toBeVisible();

    // There are two "New Note" buttons (header + EmptyState CTA) when the
    // list is empty — assert that both are present rather than picking one.
    await expect(page.getByRole('button', { name: 'New Note' })).toHaveCount(2);
  });

  // ─── 2. Create Note ───────────────────────────────────────────────────────

  test('creates a note and shows it on the home page', async ({ page }) => {
    await page.goto('/notes/new');

    // Fill the title.
    await page.fill(SELECTORS.titleInput, 'My First E2E Note');

    // Type content in the Tiptap editor.
    await page.locator(SELECTORS.proseMirror).click();
    await page.keyboard.type('This is the note content written in the editor.');

    // The Save button should now be enabled (isDirty = true, isValid = true).
    const saveButton = page.locator(SELECTORS.saveButton);
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Form should redirect to home after a successful save.
    await expect(page).toHaveURL('/');

    // The "Your Notes" heading replaces the empty state.
    await expect(
      page.getByRole('heading', { name: 'Your Notes', level: 1 })
    ).toBeVisible();

    // The new note card should appear in the grid.
    await expect(
      page.getByRole('heading', { name: 'My First E2E Note', level: 2 })
    ).toBeVisible();
  });

  // ─── 3. Read Notes (multiple) ─────────────────────────────────────────────

  test('displays all created notes on the home page', async ({ page }) => {
    // Create three notes sequentially.
    await createNote(page, 'Note Alpha', 'Content Alpha');
    await createNote(page, 'Note Beta', 'Content Beta');
    await createNote(page, 'Note Gamma', 'Content Gamma');

    // All three cards must be visible simultaneously.
    await expect(
      page.getByRole('heading', { name: 'Note Alpha', level: 2 })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Note Beta', level: 2 })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Note Gamma', level: 2 })
    ).toBeVisible();
  });

  // ─── 4. Update Note ───────────────────────────────────────────────────────

  test('updates a note and reflects the new title on the home page', async ({ page }) => {
    // Pre-condition: create a note.
    await createNote(page, 'Note to Update', 'Original content.');

    // Navigate to its edit page via the "Edit →" link on the card.
    await page.locator(SELECTORS.editLink).click();
    await expect(page).toHaveURL(/\/notes\/.+/);

    // Wait for the form to populate with the note data (async useEffect + reset).
    const titleInput = page.locator(SELECTORS.titleInput);
    await expect(titleInput).toHaveValue('Note to Update');

    // Modify the title.
    await titleInput.clear();
    await titleInput.fill('Updated Note Title');

    // isDirty is now true (new value ≠ default); isValid is true (non-empty).
    await expect(page.locator(SELECTORS.saveButton)).toBeEnabled();
    await page.click(SELECTORS.saveButton);

    // Should redirect home with the updated title.
    await expect(page).toHaveURL('/');
    await expect(
      page.getByRole('heading', { name: 'Updated Note Title', level: 2 })
    ).toBeVisible();

    // The old title must no longer appear.
    await expect(
      page.getByRole('heading', { name: 'Note to Update', level: 2 })
    ).not.toBeVisible();
  });

  // ─── 5. Delete Note ───────────────────────────────────────────────────────

  test('delete — cancel preserves the note; confirm removes it', async ({ page }) => {
    // Pre-condition: create a note.
    await createNote(page, 'Note to Delete');

    // Confirm the note is visible before any delete action.
    await expect(
      page.getByRole('heading', { name: 'Note to Delete', level: 2 })
    ).toBeVisible();

    // ── First attempt: CANCEL ──────────────────────────────────────────────

    // Click the trash icon button on the note card.
    await page.locator(SELECTORS.deleteNoteButton).click();

    // The ConfirmModal (role="dialog") must appear.
    const dialog = page.locator(SELECTORS.dialog);
    await expect(dialog).toBeVisible();

    // Verify the warning message is present.
    await expect(dialog).toContainText('Are you sure you want to delete this note?');

    // Click "Cancelar" → modal closes, note is still present.
    await page.locator(SELECTORS.confirmCancel).click();
    await expect(dialog).not.toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Note to Delete', level: 2 })
    ).toBeVisible();

    // ── Second attempt: CONFIRM ────────────────────────────────────────────

    // Click delete again.
    await page.locator(SELECTORS.deleteNoteButton).click();
    await expect(dialog).toBeVisible();

    // Click "Aceptar" → note is removed from the DOM.
    await page.locator(SELECTORS.confirmAccept).click();

    await expect(
      page.getByRole('heading', { name: 'Note to Delete', level: 2 })
    ).not.toBeVisible();

    // With the only note deleted the empty state should re-appear.
    await expect(
      page.getByRole('heading', { name: 'No notes yet.', level: 2 })
    ).toBeVisible();
  });

  // ─── 6. Persistence (IndexedDB) ───────────────────────────────────────────

  test('note persists across a full page reload (IndexedDB)', async ({ page }) => {
    // Create a note.
    await createNote(page, 'Persisted Note', 'This content must survive a reload.');

    // Verify it exists before the reload.
    await expect(
      page.getByRole('heading', { name: 'Persisted Note', level: 2 })
    ).toBeVisible();

    // Hard reload — clears the in-memory React state but leaves IndexedDB intact.
    await page.reload();

    // The note must still be visible after reload (proving IDB persistence).
    await expect(
      page.getByRole('heading', { name: 'Persisted Note', level: 2 })
    ).toBeVisible();
  });

  // ─── 7. Cancel guard on the note form ────────────────────────────────────

  test('cancel with a clean form navigates home without a modal', async ({ page }) => {
    await page.goto('/notes/new');

    // Do NOT modify anything — isDirty remains false.
    await page.click(SELECTORS.cancelButton);

    // Should navigate directly to home with no modal in between.
    await expect(page).toHaveURL('/');
    await expect(page.locator(SELECTORS.dialog)).not.toBeVisible();
  });

  test('cancel with unsaved changes shows the confirmation modal', async ({ page }) => {
    await page.goto('/notes/new');

    // Make the form dirty by typing a title.
    await page.fill(SELECTORS.titleInput, 'Unsaved Draft');

    // Click Cancel — the form is dirty so a modal must appear.
    await page.click(SELECTORS.cancelButton);

    const dialog = page.locator(SELECTORS.dialog);
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('unsaved data');

    // Accepting the prompt should navigate home.
    await page.locator(SELECTORS.confirmAccept).click();
    await expect(page).toHaveURL('/');
  });

});
