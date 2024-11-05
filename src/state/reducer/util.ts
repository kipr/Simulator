import { WritableDraft } from 'immer/dist/internal';
import Dict from '../../util/objectOps/Dict';
import Async from '../State/Async';
import DbError from '../../db/Error';


/**
 * Mutates a specific entry within a dictionary of asynchronous values.
 * 
 * This function takes a dictionary (`values`) where each key is associated with an asynchronous state (`Async<B, T>`),
 * an identifier (`id`) for the specific entry to be updated, and a `recipe` function that defines the mutation to be applied.
 * It returns a new dictionary with the specified entry updated according to the `recipe` function, 
 * while leaving the rest of the entries in the dictionary unchanged.
 *
 * @template B The type parameter representing the base state in the asynchronous value.
 * @template T The type parameter representing the target state in the asynchronous value.
 * @param {Dict<Async<B, T>>} values - The dictionary of asynchronous values to be mutated.
 * @param {string} id - The key of the entry in the dictionary to be mutated.
 * @param {(draft: WritableDraft<T>) => void} recipe - A function that takes a draft state and mutates it. 
 *             The draft is a proxy that allows for direct mutation while preserving immutability.
 * @returns {Dict<Async<B, T>>} A new dictionary with the specified entry updated as per the `recipe` function.
 */
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
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.timer_ = window.setInterval(this.save_, this.interval_);
  }

  touch() {
    if (this.timer_ !== undefined) {
      window.clearInterval(this.timer_);
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
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