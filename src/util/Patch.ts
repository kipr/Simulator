import deepNeq from "../deepNeq";
import Dict from "../Dict";

namespace Patch {
  export enum Type {
    /**
     * Unchanged
     */
    None,
    /**
     * Added to a dictionary
     */
    Add,
    /**
     * Removed from a dictionary
     */
    Remove,
    /**
     * A change of a sum type's variant (e.g., cone -> mesh)
     */
    OuterChange,
    /**
     * A change inside of an object (e.g., cone height)
     */
    InnerChange
  }
  

  export interface None<T> {
    type: Type.None;
    prev: T;
  }

  export interface Add<T> {
    type: Type.Add;
    next: T;
  }

  export interface Remove<T> {
    type: Type.Remove;
    prev: T;
  }

  export interface OuterChange<T> {
    type: Type.OuterChange;
    prev: T;
    next: T;
  }

  export type InnerPatch<T> = { [P in keyof T]: Patch<T[P]>; };

  export interface InnerChange<T> {
    type: Type.InnerChange;
    prev: T;
    next: T;
    inner: InnerPatch<T>;
  }

  export const none = <T>(prev: T): None<T> => ({
    type: Type.None,
    prev
  });

  export const add = <T>(next: T): Add<T> => ({
    type: Type.Add,
    next
  });

  export const remove = <T>(prev: T): Remove<T> => ({
    type: Type.Remove,
    prev
  });

  export const outerChange = <T>(prev: T, next: T): OuterChange<T> => ({
    type: Type.OuterChange,
    prev,
    next
  });

  export const innerChange = <T>(prev: T, next: T, inner: InnerPatch<T>): InnerChange<T> => ({
    type: Type.InnerChange,
    prev,
    next,
    inner
  });

  export const diffPrimitive = <T>(prev: T, next: T): Patch<T> => {
    if (prev === next) return none(prev);
    return outerChange(prev, next);
  };

  export const diffArray = <T>(prev: T[], next: T[]) => {
    if (deepNeq(prev, next)) return outerChange(prev, next);
    return none(prev);
  };

  export const diff = <T>(prev: T, next: T): Patch<T> => {
    return deepNeq(prev, next) ? Patch.outerChange(prev, next) : Patch.none(prev);
  };

  export const diffDict = <T>(prev: Dict<T>, next: Dict<T>, differ: (prev: T, next: T) => Patch<T>): Dict<Patch<T>> => {
    const prevKeys = Dict.keySet(prev || {});
    const nextKeys = Dict.keySet(next || {});

    const ret: Dict<Patch<T>> = {};
    for (const prevKey of prevKeys) {
      if (nextKeys.has(prevKey)) {
        ret[prevKey] = differ(prev[prevKey], next[prevKey]);
      } else {
        ret[prevKey] = Patch.remove(prev[prevKey]);
      }
    }

    for (const nextKey of nextKeys) {
      if (!prevKeys.has(nextKey)) {
        ret[nextKey] = Patch.add(next[nextKey]);
      }
    }

    return ret;
  };

  export const applyInner = <T>(patch: InnerChange<T>, value: T): T => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ret: any = {};
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    for (const key in patch.inner) ret[key] = apply(patch.inner[key], value[key]);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return ret;
  };

  export const apply = <T>(patch: Patch<T>, value: T): T => {
    switch (patch.type) {
      case Type.None:
        return value;
      case Type.Add:
        return patch.next;
      case Type.Remove:
        return undefined;
      case Type.OuterChange:
        return patch.next;
      case Type.InnerChange:
        return applyInner(patch, value);
    }
  };

  export const applyDict = <T>(patch: Dict<Patch<T>>, value: Dict<T>): Dict<T> => {
    const ret: Dict<T> = {};
    for (const key in patch) ret[key] = apply(patch[key], value[key]);
    return ret;
  };
}

/**
 * The result of a structured diff operation over a supported type
 */
type Patch<T> = Patch.None<T> | Patch.Add<T> | Patch.Remove<T> | Patch.OuterChange<T> | Patch.InnerChange<T>;

export default Patch;