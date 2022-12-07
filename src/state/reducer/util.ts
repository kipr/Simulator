import Async from '../State/Async';
import DbError from '../../db/Error';

export const errorToAsyncError = (error: unknown): Async.Error => {
  if (DbError.is(error)) return error;
  if (error instanceof Error) return {
    code: 0,
    message: error.message,
  };
  throw error;
};