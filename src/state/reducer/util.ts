import { WritableDraft } from 'immer/dist/internal';
import Dict from '../../Dict';
import Async from '../State/Async';
import DbError from '../../db/Error';

export const mutate = <B, T>(values: Dict<Async<B, T>>, id: string, recipe: (draft: WritableDraft<T>) => void) => ({
  ...values,
  [id]: Async.mutate(values[id], recipe),
});

export const errorToAsyncError = (error: unknown): Async.Error => {
  if (DbError.is(error)) return error;
  if (error instanceof Error) return {
    code: 0,
    message: error.message,
  };
  throw error;
};
