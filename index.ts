import express, { Express, Request, Response } from 'express';
import { Worker } from 'worker_threads';
import dotenv from 'dotenv';
import { cpuIntensiveFunc } from './cpu_intensive_func';
import { ioIntensiveFunc } from './io_intensive_func';
import { queue } from './queue';
import { tasks } from './tasks';

dotenv.config();
const app: Express = express();
const port = process.env.PORT;

// experiment 1:
// first hit: http://localhost:8000/cpu-intensive-task 
// then hit: http://localhost:8000/quick-task
// observe that the server can't process the quick task until it finishes processing the cpu intensive task first
// it's because the cpu intensive task blocks the event loop (all the requests are handled in the main thread, same as the event loop itself)
app.get('/cpu-intensive-task', (req: Request, res: Response) => {
  console.log('received cpu intensive request');
  cpuIntensiveFunc();
  const msg = 'finished cpu intensive request';
  res.send(msg);
  console.log(msg);
});

// experiment 2:
// first hit: http://localhost:8000/cpu-intensive-task 
// then hit: http://localhost:8000/quick-task
// observe that the server can continue to process the quick task while the cpu intensive task is handled in the worker thread.
// it's because we off load the cpu intensive task to a worker thread, therefore it doesn't block the event loop anymore.
app.get('/cpu-intensive-task-off-loaded-to-worker', (req: Request, res: Response) => {
  console.log('received cpu intensive request and off load to worker thread');
  const worker = new Worker('./dist/worker.js');
  worker.on('message', () => {
    const msg = 'finished cpu intensive request in worker thread';
    res.send(msg);
    console.log(msg);
  });
});

// experiment 3:
// first hit: http://localhost:8000/io-intensive-task 
// then hit: http://localhost:8000/quick-task
// observe that the server can continue to process the quick task while waiting for the io intensive task to finish.
// it's because the io intensive task yields the call stack while waiting on the io to finish, so event loop can continue server the next received request. 
app.get('/io-intensive-task', (req: Request, res: Response) => {
  console.log('received io intensive request');
  ioIntensiveFunc(() => {
    const msg = 'finished io intensive request';
    res.send(msg);
    console.log(msg);
  });
});
app.get('/quick-task', (req: Request, res: Response) => {
  console.log('received quick request');
  const msg = 'finished quick request';
  res.send(msg);
  console.log(msg);
});

// experiment 4:
// set up: 
//    we have a queue whose concurrent value is set to 1, it means only 1 task can be handled at a time.
//
//    task 1: cpu intensive
//    task 2: quick task 
//    task 3: io intensive
// 
// first hit: http://localhost:8000/sequential-task/1
// then hit: sequential-task/2
// observe that the server can't process task 2 before task 1 is done. It actually can't even be enqueued. 

// experiment 5:
// first hit: http://localhost:8000/sequential-task/3
// then hit: sequential-task/2
// observe that the task 2 can be enqueued while server is processing task 3. But server can't switch to process task 2 
// even though task 3 is io bond. 
//
// If we don't have the queue, task 2 can actually be run immediately and finish before task 3. THe purpose of 
// the queue is basically to ensure the order of the tasks execution, which can be important in situations where
// data consistency etc is needed.
//
// Just to call out that, we can actually call the done method early to unblock the queue early on. 
// See comment in queue.ts
app.get('/sequential-task/:id', (req: Request, res: Response) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find(task => task.id === taskId);
  if (!task) {
    res.send('task not found');
    return;
  }
  console.log(`received task ${taskId}`);
  queue.push(task, () => {
    const msg = `finished processing task ${taskId}`;
    res.send(msg);
    console.log(msg);
  })
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});