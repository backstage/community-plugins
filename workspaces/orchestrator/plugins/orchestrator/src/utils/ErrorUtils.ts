import { isError } from '@backstage/errors';

export const getErrorObject = (err: unknown): Error => {
  if (isError(err)) {
    return err;
  }
  if (typeof err === 'string') {
    return new Error(err);
  }
  return new Error('Unexpected error');
};
