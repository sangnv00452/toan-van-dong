import { App } from './app';
import { loadEmojiFont } from './core/emoji-font';

const canvas = document.getElementById('game');
if (!(canvas instanceof HTMLCanvasElement)) throw new Error('Missing <canvas id="game">');
loadEmojiFont();
new App(canvas).start();
