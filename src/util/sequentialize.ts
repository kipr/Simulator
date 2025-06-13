/**
 * A higher-order function that sequentializes an async function by queuing subsequent calls.
 * This ensures that only one instance of the function runs at a time, with subsequent calls
 * waiting for the previous one to complete before executing.
 */

interface QueuedCall<TArgs extends readonly unknown[], TReturn> {
  args: TArgs;
  resolve: (value: TReturn) => void;
  reject: (reason?: unknown) => void;
}

/**
 * Creates a sequentialized version of an async function that queues subsequent calls.
 * 
 * @param asyncFn The async function to sequentialize
 * @returns A new function that queues calls and executes them sequentially
 * 
 * @example
 * ```typescript
 * const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
 * 
 * const slowAsyncFunction = async (id: string) => {
 *   await delay(1000);
 *   console.log(`Completed: ${id}`);
 *   return `Result: ${id}`;
 * };
 * 
 * const sequentializedFn = sequentialize(slowAsyncFunction);
 * 
 * // These calls will execute one after another, not concurrently
 * sequentializedFn('A'); // Starts immediately
 * sequentializedFn('B'); // Waits for A to complete
 * sequentializedFn('C'); // Waits for B to complete
 * ```
 */
export default function sequentialize<TArgs extends readonly unknown[], TReturn>(
  asyncFn: (...args: TArgs) => Promise<TReturn>
): (...args: TArgs) => Promise<TReturn> {
  const queue: QueuedCall<TArgs, TReturn>[] = [];
  let isProcessing = false;

  const processQueue = async (): Promise<void> => {
    if (isProcessing || queue.length === 0) {
      return;
    }

    isProcessing = true;

    while (queue.length > 0) {
      const queuedCall = queue.shift();
      if (!queuedCall) break;

      const { args, resolve, reject } = queuedCall;

      try {
        const result = await asyncFn(...args);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }

    isProcessing = false;
  };

  return (...args: TArgs): Promise<TReturn> => {
    return new Promise<TReturn>((resolve, reject) => {
      queue.push({ args, resolve, reject });
      void processQueue();
    });
  };
}