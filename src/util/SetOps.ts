export namespace SetOps {
  export const difference = <T>(a: Set<T>, b: Set<T>) => {
    const ret = new Set(a);
    for (const elem of b) ret.delete(elem);
    return ret;
  };

  export const union = <T>(a: Set<T>, b: Set<T>) => {
    const ret = new Set(a);
    for (const elem of b) ret.add(elem);
    return ret;
  };

  export const filter = <T>(a: Set<T>, f: (x: T) => boolean) => {
    const ret = new Set(a);
    for (const elem of a) if (!f(elem)) ret.delete(elem);
    return ret;
  };

  export const intersection = <T>(a: Set<T>, b: Set<T>) => filter(a, x => b.has(x));
}