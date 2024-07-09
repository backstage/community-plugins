import { retryAsyncFunction } from './Helper';

describe('retryAsyncFunction', () => {
  const successfulResponse = 'Success';
  it('should be successful in the first attempt', async () => {
    const asyncFnSuccess = jest.fn().mockResolvedValueOnce(successfulResponse);

    const result = await retryAsyncFunction({
      asyncFn: asyncFnSuccess,
      maxAttempts: 3,
      delayMs: 100,
    });

    expect(result).toBe(successfulResponse);
    expect(asyncFnSuccess).toHaveBeenCalledTimes(1);
  });

  it('should throw an error after maximum attempts', async () => {
    const asyncFnFailure = jest.fn().mockResolvedValue(undefined);

    await expect(
      retryAsyncFunction({
        asyncFn: asyncFnFailure,
        maxAttempts: 5,
        delayMs: 100,
      }),
    ).rejects.toThrow();

    expect(asyncFnFailure).toHaveBeenCalledTimes(5);
  });

  it('should retry until successful after getting some undefined responses', async () => {
    const asyncFns = jest
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(successfulResponse);

    const result = await retryAsyncFunction({
      asyncFn: asyncFns,
      maxAttempts: 5,
      delayMs: 100,
    });

    expect(result).toBe(successfulResponse);
    expect(asyncFns).toHaveBeenCalledTimes(4);
  });
});
