import { App } from './app';

const canvas = document.getElementById('game');
if (!(canvas instanceof HTMLCanvasElement)) throw new Error('Missing <canvas id="game">');
new App(canvas).start();
