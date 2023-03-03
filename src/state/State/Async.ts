import produce, {  } from 'immer';
import { WritableDraft } from 'immer/dist/internal';

namespace Async {
  export interface Error {
    message?: string;
    code: number;
  }

  export enum Type {
    Unloaded,
    Creating,
    CreateFailed,
    Loading,
    LoadFailed,
    Loaded,
    Saveable,
    Saving,
    SaveFailed,
    Deleting,
    DeleteFailed,
  }

  export const isFailed = <B, T>(async: Async<B, T>): async is (CreateFailed<T> | LoadFailed<B> | SaveFailed<B, T> | DeleteFailed<B, T>) => {
    return async.type === Type.CreateFailed || async.type === Type.LoadFailed || async.type === Type.SaveFailed || async.type === Type.DeleteFailed;
  };

  export interface Unloaded<B> {
    type: Type.Unloaded;
    brief?: B;
  }

  export type UnloadedParams<B> = Omit<Unloaded<B>, 'type'>;

  export const unloaded = <B>(params: UnloadedParams<B>): Unloaded<B> => ({
    ...params,
    type: Type.Unloaded,
  });

  export interface Creating<T> {
    type: Type.Creating;
    value: T;
  }

  export type CreatingParams<T> = Omit<Creating<T>, 'type'>;

  export const creating = <T>(params: CreatingParams<T>): Creating<T> => ({
    ...params,
    type: Type.Creating,
  });

  export interface CreateFailed<T> {
    type: Type.CreateFailed;
    value: T;
    error: Error;
  }

  export type CreateFailedParams<T> = Omit<CreateFailed<T>, 'type'>;

  export const createFailed = <T>(params: CreateFailedParams<T>): CreateFailed<T> => ({
    ...params,
    type: Type.CreateFailed,
  });

  export interface Loading<B> {
    type: Type.Loading;
    brief?: B;
  }

  export type LoadingParams<B> = Omit<Loading<B>, 'type'>;

  export const loading = <B>(params: LoadingParams<B>): Loading<B> => ({
    ...params,
    type: Type.Loading,
  });

  export interface LoadFailed<B> {
    type: Type.LoadFailed;
    brief?: B;
    error: Error;
  }

  export type LoadFailedParams<B> = Omit<LoadFailed<B>, 'type'>;

  export const loadFailed = <B>(params: LoadFailedParams<B>): LoadFailed<B> => ({
    ...params,
    type: Type.LoadFailed,
  });

  export interface Loaded<B, T> {
    type: Type.Loaded;
    brief?: B;
    value: T;
  }

  export type LoadedParams<B, T> = Omit<Loaded<B, T>, 'type'>;

  export const loaded = <B, T>(params: LoadedParams<B, T>): Loaded<B, T> => ({
    ...params,
    type: Type.Loaded,
  });

  export interface Saveable<B, T> {
    type: Type.Saveable;
    brief?: B;
    original: T;
    value: T;
  }

  export type SaveableParams<B, T> = Omit<Saveable<B, T>, 'type'>;

  export const saveable = <B, T>(params: SaveableParams<B, T>): Saveable<B, T> => ({
    ...params,
    type: Type.Saveable,
  });

  export interface Saving<B, T> {
    type: Type.Saving;
    brief?: B;
    original: T;
    value: T;
  }

  export type SavingParams<B, T> = Omit<Saving<B, T>, 'type'>;

  export const saving = <B, T>(params: SavingParams<B, T>): Saving<B, T> => ({
    ...params,
    type: Type.Saving,
  });

  export interface SaveFailed<B, T> {
    type: Type.SaveFailed;
    brief?: B;
    original: T;
    value: T;
    error: Error;
  }

  export type SavingFailedParams<B, T> = Omit<SaveFailed<B, T>, 'type'>;

  export const saveFailed = <B, T>(params: SavingFailedParams<B, T>): SaveFailed<B, T> => ({
    ...params,
    type: Type.SaveFailed,
  });

  export interface Deleting<B, T> {
    type: Type.Deleting;
    brief?: B;
    value: T;
  }

  export type DeletingParams<B, T> = Omit<Deleting<B, T>, 'type'>;

  export const deleting = <B, T>(params: DeletingParams<B, T>): Deleting<B, T> => ({
    ...params,
    type: Type.Deleting,
  });

  export interface DeleteFailed<B, T> {
    type: Type.DeleteFailed;
    brief?: B;
    value: T;
    error: Error;
  }

  export type DeleteFailedParams<B, T> = Omit<DeleteFailed<B, T>, 'type'>;

  export const deleteFailed = <B, T>(params: DeleteFailedParams<B, T>): DeleteFailed<B, T> => ({
    ...params,
    type: Type.DeleteFailed,
  });

  export const set = <B, T>(current: Async<B, T>, value: T): Async<B, T> => {
    switch (current.type) {
      case Type.Unloaded: return loaded({ brief: current.brief, value });
      case Type.Creating: return loaded({ value });
      case Type.CreateFailed: return loaded({ value });
      case Type.Loading: return loaded({ brief: current.brief, value });
      case Type.LoadFailed: return loaded({ brief: current.brief, value });
      case Type.Loaded: return loaded({ brief: current.brief, value });
      case Type.Saveable: return saveable({ ...current, value });
      case Type.Saving: return saveable({ ...current, value });
      case Type.SaveFailed: return saveable({ ...current, value });
      case Type.Deleting: return loaded({ brief: current.brief, value });
      case Type.DeleteFailed: return loaded({ brief: current.brief, value });
    }
  };

  export const fail = <B, T>(current: Async<B, T>, error: Error): Async<B, T> => {
    switch (current.type) {
      case Type.Unloaded: return loadFailed({ brief: current.brief, error });
      case Type.Creating: return createFailed({ ...current, error });
      case Type.CreateFailed: return createFailed({ ...current, error });
      case Type.Loading: return loadFailed({ brief: current.brief, error });
      case Type.LoadFailed: return loadFailed({ brief: current.brief, error });
      case Type.Loaded: return loadFailed({ brief: current.brief, error });
      case Type.Saveable: return saveFailed({ ...current, error });
      case Type.Saving: return saveFailed({ ...current, error });
      case Type.SaveFailed: return saveFailed({ ...current, error });
      case Type.Deleting: return deleteFailed({ ...current, error });
      case Type.DeleteFailed: return deleteFailed({ ...current, error });
    }
  };

  export const unfail = <B, T>(current: Async<B, T>): Async<B, T> => {
    switch (current.type) {
      case Type.Unloaded: return current;
      case Type.Creating: return current;
      case Type.CreateFailed: return unloaded({});
      case Type.Loading: return current;
      case Type.LoadFailed: return unloaded({});
      case Type.Loaded: return current;
      case Type.Saveable: return current;
      case Type.Saving: return current;
      case Type.SaveFailed: return saveable(current);
      case Type.Deleting: return current;
      case Type.DeleteFailed: return loaded(current);
    }
  };

  export const brief = <B, T>(current: Async<B, T>): B => {
    if (!current) return undefined;

    switch (current.type) {
      case Type.Unloaded: return current.brief;
      case Type.Creating: return undefined;
      case Type.CreateFailed: return undefined;
      case Type.Loading: return current.brief;
      case Type.LoadFailed: return current.brief;
      case Type.Loaded: return current.brief;
      case Type.Saveable: return current.brief;
      case Type.Saving: return current.brief;
      case Type.SaveFailed: return current.brief;
      case Type.Deleting: return current.brief;
      case Type.DeleteFailed: return current.brief;
    }
  };


  export const previousValue = <B, T>(async: Async<B, T>): T => {
    if (!async) return undefined;
    
    switch (async.type) {
      case Type.Unloaded: return undefined;
      case Type.Creating: return async.value;
      case Type.CreateFailed: return async.value;
      case Type.Loading: return undefined;
      case Type.LoadFailed: return undefined;
      case Type.Loaded: return async.value;
      case Type.Saveable: return async.original;
      case Type.Saving: return async.original;
      case Type.SaveFailed: return async.original;
      case Type.Deleting: return async.value;
      case Type.DeleteFailed: return async.value;
    }
  };

  export const latestValue = <B, T>(async: Async<B, T>): T => {
    if (!async) return undefined;

    switch (async.type) {
      case Type.Unloaded: return undefined;
      case Type.Creating: return async.value;
      case Type.CreateFailed: return async.value;
      case Type.Loading: return undefined;
      case Type.LoadFailed: return undefined;
      case Type.Loaded: return async.value;
      case Type.Saveable: return async.value;
      case Type.Saving: return async.value;
      case Type.SaveFailed: return async.value;
      case Type.Deleting: return async.value;
      case Type.DeleteFailed: return async.value;
    }
  };

  export const isResident = <B, T>(async: Async<B, T>): boolean => {
    if (!async) return false;

    switch (async.type) {
      case Type.Unloaded: return false;
      case Type.Creating: return false;
      case Type.CreateFailed: return false;
      case Type.Loading: return false;
      case Type.LoadFailed: return false;
      case Type.Loaded: return true;
      case Type.Saveable: return true;
      case Type.Saving: return true;
      case Type.SaveFailed: return true;
      case Type.Deleting: return false;
      case Type.DeleteFailed: return false;
    }
  };

  export const reset = <B, T>(async: Async<B, T>): Async<B, T> => {
    switch (async.type) {
      case Type.Loaded: return async;
      case Type.Saveable: return loaded({ brief: async.brief, value: async.original });
      case Type.Saving: return loaded({ brief: async.brief, value: async.original });
      case Type.SaveFailed: return loaded({ brief: async.brief, value: async.original });
      default: throw new Error(`Cannot reset ${async.type}`);
    }
  };

  export const mutate = <B, T>(async: Async<B, T>, recipe: (draft: WritableDraft<T>) => void): Async<B, T> => {
    switch (async.type) {
      case Type.Loaded: return saveable({
        original: async.value,
        value: produce(async.value, recipe)
      });
      case Type.Saveable: return saveable({
        original: async.original,
        value: produce(async.value, recipe)
      });
      case Type.Saving: return saveable({
        original: async.original,
        value: produce(async.value, recipe)
      });
      case Type.SaveFailed: return saveFailed({
        original: async.original,
        value: produce(async.value, recipe),
        error: async.error,
      });
      default: return async;
    }
  };
}

type Async<B, T> = (
  Async.Unloaded<B> |
  Async.Creating<T> |
  Async.CreateFailed<T> |
  Async.Loading<B> |
  Async.LoadFailed<B> |
  Async.Loaded<B, T> |
  Async.Saveable<B, T> |
  Async.Saving<B, T> |
  Async.SaveFailed<B, T> |
  Async.Deleting<B, T> |
  Async.DeleteFailed<B, T>
);

export default Async;