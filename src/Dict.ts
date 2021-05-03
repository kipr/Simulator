type Dict<T> = { [key: string]: T };

namespace Dict {
  export const filter = <T>(dict: Dict<T>, f: (value: T, key: string) => boolean): Dict<T> => {
    const keys = Object.keys(dict);
    const ret: Dict<T> = {};
    keys.forEach(key => {
      const value = dict[key];
      if (!f(value, key)) return;
      ret[key] = value;
    });
    return ret;
  };

  export const map = <T, D>(dict: Dict<T>, f: (value: T, key: string) => D): Dict<D> => {
    const keys = Object.keys(dict);
    const ret: Dict<D> = {};
    for (const key of keys) {
      const value = dict[key];
      ret[key] = f(value, key);
    }
    return ret;
  };

  export const forEach = <T>(dict: Dict<T>, f: (value: T, key: string) => void): void => {
    const keys = Object.keys(dict);
    for (const key of keys) {
      const value = dict[key];
      f(value, key);
    }
  };

  export const extract = <T>(dict: Dict<T>, fields: IterableIterator<string>): [ Dict<T>, Dict<T> ] => {
    const original = { ...dict };
    const extracted = {};
    for (let it = fields.next(); !it.done; it = fields.next()) {
      // Type assertions necessary because it.value is "any"; see https://github.com/microsoft/TypeScript/issues/33353
      extracted[it.value as string] = original[it.value as string];
      delete original[it.value as string];
    }
    return [original, extracted];
  };

  export const toList = <T>(dict: Dict<T>): [string, T][] => {
    const ret: [string, T][] = [];
    const keys = Object.keys(dict);
    for (const key of keys) {
      ret.push([key, dict[key]]);
    }
    return ret;
  };

  export const values = <T>(dict: Dict<T>): T[] => {
    const ret: T[] = [];
    const keys = Object.keys(dict);
    for (const key of keys) {
      ret.push(dict[key]);
    }
    return ret;
  };
}

export default Dict;