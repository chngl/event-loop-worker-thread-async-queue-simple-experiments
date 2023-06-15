import async from 'async';

export type Task = {
    id: number,
    // done is used to signal the task is done, and it can continue to process the next task in queue
    execute: (done: () => void) => void,
};

// a queue that only allows 1 task to run at a time
export const queue = async.queue((task: Task, done: () => void) => {
    console.log(`start processing task ${task.id} in queue`);
    task.execute(done);
}, 1);