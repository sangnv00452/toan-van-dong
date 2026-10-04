/** Family name of the bundled emoji font (see scripts/build-emoji-font.mjs). */
export const EMOJI_FAMILY = 'MathFrogEmoji';

/**
 * Registers the bundled colour-emoji font so every PC draws the same emoji, even
 * old Windows versions that lack newer ones (🪷 🫧 🥷 🪜) and would show empty boxes.
 * Canvas text does not wait for fonts, so we load it explicitly; until it arrives
 * (a few ms, it is a local file) the system emoji font is used.
 */
export function loadEmojiFont(): void {
  if (typeof FontFace === 'undefined') return;
  const face = new FontFace(EMOJI_FAMILY, `url(${import.meta.env.BASE_URL}fonts/math-frog-emoji.woff)`);
  document.fonts.add(face);
  face.load().catch((err) => console.warn('[emoji-font] using system emoji instead', err));
}
