/**
 * Recursively extracts raw text content from a Tiptap/ProseMirror JSON document.
 * @description Tiptap stores rich text as a structured JSON tree rather than HTML.
 * This utility traverses the tree to collect only leaf text nodes, joining them
 * with a space so the result reads as a coherent preview string without any
 * markup artifacts. Safe to call with null/undefined — returns an empty string.
 * @param {Object|null|undefined} docJson - The Tiptap JSON document object.
 * @returns {string} A plain text string extracted from the document.
 */
export function extractPlainText(docJson) {
  if (!docJson || typeof docJson !== 'object') return '';

  if (docJson.type === 'text' && typeof docJson.text === 'string') {
    return docJson.text;
  }

  if (!Array.isArray(docJson.content)) return '';

  return docJson.content
    .map((node) => extractPlainText(node))
    .filter(Boolean)
    .join(' ');
}
