export function ioIntensiveFunc(cb: () => void) {
  // simulate some io intensive task with setTimeout
  setTimeout(() => {
    cb();
  }, 5000);
}

