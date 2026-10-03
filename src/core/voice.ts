/**
 * Green speaks Vietnamese with the computer's own text-to-speech voice.
 * A voice installed on the computer works offline. When there is no
 * Vietnamese voice, or an online voice fails without Internet, `fallback` runs
 * instead (e.g. a croak), so Green never stays silent.
 */
let voice: SpeechSynthesisVoice | null = null;

function pickVoice(): void {
  const vi = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('vi'));
  // Prefer a voice installed on this computer: it works without Internet.
  voice = vi.find((v) => v.localService) ?? vi[0] ?? null;
}

if (typeof speechSynthesis !== 'undefined') {
  pickVoice();
  speechSynthesis.addEventListener('voiceschanged', pickVoice);
}

export function say(text: string, fallback: () => void): void {
  if (!voice) return fallback();
  const u = new SpeechSynthesisUtterance(text);
  u.onerror = (e) => {
    // "interrupted"/"canceled" only mean a newer line replaced this one.
    if (e.error !== 'interrupted' && e.error !== 'canceled') fallback();
  };
  u.voice = voice;
  u.lang = voice.lang;
  // Higher and a bit faster, so it sounds like a small frog.
  u.pitch = 1.7;
  u.rate = 1.1;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

const PRAISE = ['Ngon quá!', 'Giỏi lắm!', 'Tuyệt vời!', 'Đúng rồi!', 'Hay quá!'];
/** Fast games score often; Green praises at most once in this many ms. */
const PRAISE_GAP = 1500;
let lastPraise = -Infinity;

/** Green cheers a correct answer with a short random praise (or `fallback`, e.g. a happy croak). */
export function praise(fallback: () => void): void {
  const now = performance.now();
  if (now - lastPraise < PRAISE_GAP) return;
  lastPraise = now;
  say(PRAISE[Math.floor(Math.random() * PRAISE.length)], fallback);
}
