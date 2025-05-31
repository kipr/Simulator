import sequentialize from '../../src/util/sequentialize';

// Helper function to create delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('sequentialize', () => {
  it('should execute async functions sequentially', async () => {
    const executionOrder: string[] = [];

    const slowAsyncFunction = async (id: string) => {
      executionOrder.push(`start-${id}`);
      await delay(100);
      executionOrder.push(`end-${id}`);
      return `result-${id}`;
    };

    const sequentializedFn = sequentialize(slowAsyncFunction);

    // Start multiple calls simultaneously
    const promises = [
      sequentializedFn('A'),
      sequentializedFn('B'),
      sequentializedFn('C')
    ];

    const results = await Promise.all(promises);

    // Verify results
    expect(results).toEqual(['result-A', 'result-B', 'result-C']);

    // Verify sequential execution order
    expect(executionOrder).toEqual([
      'start-A', 'end-A',
      'start-B', 'end-B',
      'start-C', 'end-C'
    ]);
  });

  it('should handle errors properly', async () => {
    const errorFunction = async (shouldError: boolean) => {
      await delay(50);
      if (shouldError) {
        throw new Error('Test error');
      }
      return 'success';
    };

    const sequentializedFn = sequentialize(errorFunction);

    const promises = [
      sequentializedFn(false),
      sequentializedFn(true),
      sequentializedFn(false)
    ];

    const results = await Promise.allSettled(promises);

    expect(results[0]).toEqual({ status: 'fulfilled', value: 'success' });
    expect(results[1]).toEqual({
      status: 'rejected',
      reason: expect.objectContaining({ message: 'Test error' })
    });
    expect(results[2]).toEqual({ status: 'fulfilled', value: 'success' });
  });

  it('should preserve function arguments correctly', async () => {
    const multiArgFunction = async (a: number, b: string, c: boolean) => {
      await delay(10);
      return { a, b, c };
    };

    const sequentializedFn = sequentialize(multiArgFunction);

    const result1 = sequentializedFn(1, 'hello', true);
    const result2 = sequentializedFn(2, 'world', false);

    const [res1, res2] = await Promise.all([result1, result2]);

    expect(res1).toEqual({ a: 1, b: 'hello', c: true });
    expect(res2).toEqual({ a: 2, b: 'world', c: false });
  });
});
