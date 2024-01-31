import { cpuIntensiveFunc } from './cpu_intensive_func';
import { ioIntensiveFunc } from './io_intensive_func';
import type { Task } from './queue';

// Tasks
export const tasks: Array<Task> = [
    {
        id: 1,
        execute: (done: () => void) => {
            cpuIntensiveFunc();
            console.log('cpu intensive task in done');
            done();
        },
    },
    {
        id: 2,
        execute: (done: () => void) => {
            console.log('quick task done');
            done();
        },
    },
    {
        id: 3,
        execute: (done: () => void) => {
            ioIntensiveFunc(() => {
                console.log('io intensive task done');
                done();
            });
        },
    },
];
