export namespace SetOps {
  /**
   * Gets all the objects that are in A but not in B
   * @param a 
   * @param b 
   * @returns A new set containing all the objects that are in A but not in B
   */
  export const difference = <T>(a: Set<T>, b: Set<T>) => {
    const ret = new Set(a);
    for (const elem of b) ret.delete(elem);
    return ret;
  };

  /**
   * Gets all the objects that are in A or B
   * @param a 
   * @param b 
   * @returns 
   */
  export const union = <T>(a: Set<T>, b: Set<T>) => {
    const ret = new Set(a);
    for (const elem of b) ret.add(elem);
    return ret;
  };

  /**
   * Purpose: Filters a set (a) based on a predicate function (f), returning a 
   *  new set that contains only the elements for which the predicate function returns true.
   * Implementation: It creates a new set ret as a copy of a and then removes 
   *  elements from ret for which the predicate f returns false.
   * @param a Set of objects
   * @param f function that returns true or false based on the object argument
   * @returns 
   */
  export const filter = <T>(a: Set<T>, f: (x: T) => boolean) => {
    const ret = new Set(a);
    for (const elem of a) if (!f(elem)) ret.delete(elem);
    return ret;
  };

  /**
   * Purpose: Computes the intersection of two sets (a and b), returning a new set 
   *  that contains only elements that are present in both a and b.
   * Implementation: It uses the filter function, passing set a and a predicate function 
   *  that checks if an element is present in set b.
   * @param a 
   * @param b 
   * @returns 
   */
  export const intersection = <T>(a: Set<T>, b: Set<T>) => filter(a, x => b.has(x));
}