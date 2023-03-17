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

export class AutoSaver {
  private readonly save_: () => Promise<void>;
  private readonly interval_: number;
  private timer_: number | undefined = undefined;

  constructor(interval: number, save: () => Promise<void>) {
    this.save_ = save;
    this.interval_ = interval;
    this.timer_ = window.setInterval(this.save_, this.interval_);
  }

  touch() {
    if (this.timer_ !== undefined) {
      window.clearInterval(this.timer_);
      this.timer_ = window.setInterval(this.save_, this.interval_);
    }
  }

  destroy() {
    if (this.timer_ !== undefined) {
      window.clearInterval(this.timer_);
      this.timer_ = undefined;
    }
  }
}