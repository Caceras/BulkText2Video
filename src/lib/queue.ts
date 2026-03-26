type Task = () => Promise<void>;

const queue: Task[] = [];
let running = 0;
const MAX_CONCURRENT = 3;

export function enqueue(task: Task): void {
  queue.push(task);
  processNext();
}

function processNext(): void {
  while (running < MAX_CONCURRENT && queue.length > 0) {
    const task = queue.shift()!;
    running++;
    task().finally(() => {
      running--;
      processNext();
    });
  }
}
