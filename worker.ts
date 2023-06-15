import { parentPort } from 'worker_threads';
import { cpuIntensiveFunc } from './cpu_intensive_func';

// this module is used in index.ts to create a worker thread to run some cpu intensive task
// const worker = new Worker('./dist/worker.js');

cpuIntensiveFunc();

parentPort?.postMessage('worker thread done');