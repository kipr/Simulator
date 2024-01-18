// Disable eslint rule - this file deals heavily with "object" type
/* eslint-disable @typescript-eslint/ban-types */

/** A utility for deeply comparing two values (be they primitives, arrays, 
 * or objects) to check if they are not equal, handling nested structures.
 * Array Handling: If value0 is an array, it checks if value1 is also an array. 
 *  If value1 is not an array, or if they are arrays but not deeply 
 *  equal (checked by deepArrayNeq), it returns true (meaning they are not equal). 
 *  If they are both arrays and deeply equal, it returns false.
 * Type Comparison: Compares the types of value0 and value1. If they are of different 
 *   types, it returns true.
 * Object Handling: If both values are objects (and not null), it uses deepObjectNeq 
 *   to check for deep inequality. If they are deeply unequal, it returns true.
 * Primitive Type Comparison: If the values are of the same type and are not objects 
 *   or arrays, it directly compares them using strict inequality (!==). If they are 
 *     not equal, it returns true.
 * @param value0 One of two objects to compare
 * @param value1 The second object to compare
 * @returns  A boolean indicating whether the two objects are not deeply equal
 */
const deepNeq = (value0: unknown, value1: unknown) => {
  if (Array.isArray(value0)) {
    if (!Array.isArray(value1)) return true;
    if (deepArrayNeq(value0, value1)) return true;
    return false;
  }

  const value0Type = typeof value0;
  const value1Type = typeof value1;

  if (value0Type !== value1Type) {
    return true;
  }

  // Props are of the same type
  const valueType = value0Type;
  if (valueType === 'object') {
    if (value0 === null) {
      if (value1 === null) return false;
      return true;
    }
    if (value1 === null) {
      if (value0 === null) return false;
      return true;
    }
    if (deepObjectNeq(value0 as object, value1 as object)) return true;
    return false;
  }
  
  if (value0 !== value1) return true;

  return false;
};


/**
 * Purpose: Compares two arrays to determine if they are not deeply equal.
 *   Length Check: First, it checks if the arrays have different lengths. If so, it returns true.
 *   Element Comparison: Iterates over the array elements and uses deepNeq to compare each pair 
 *   of elements. If any pair is not equal, it returns true.
 * @param _0 
 * @param _1 
 * @returns 
 */
const deepArrayNeq = (_0: unknown[], _1: unknown[]) => {
  if (_0.length !== _1.length) return true;
  const length = _0.length;

  for (let i = 0; i < length; ++i) {
    if (deepNeq(_0[i], _1[i])) return true;
  }

  return false;
};

/**
*     Purpose: Compares two objects to determine if they are not deeply equal.
*  Key Length Check: Compares the number of keys in each object. If they have 
*    a different number of keys, it returns true.
*  Key Existence Check: Checks if both objects have the same keys. If a key exists 
*    in one object but not in the other, it returns true.
*  Key Value Comparison: Iterates over the keys and uses deepNeq to compare the value 
*    for each key in both objects. If any pair of values is not equal, it returns true.
* @param _0 Object for comparison
* @param _1 Object for comparison
* @returns 
*/
const deepObjectNeq = (_0: object, _1: object) => {
  const keys0 = Object.keys(_0);
  const keys1 = Object.keys(_1);
  if (keys0.length !== keys1.length) return true;

  const hit = new Set<string>();
  for (const key of keys0) {
    hit.add(key);
  }
  for (const key of keys1) {
    if (!hit.has(key)) return true;
  }

  // We've now determined that all keys are the same

  const keys = keys0;
  for (const key of keys) {
    if (deepNeq(_0[key], _1[key])) return true;
  }

  return false;
};

/**
 * Purpose: Compares two objects to determine if they are not deeply equal.
 * Recursively compares nested objects and arrays.
 */
export default (_0: unknown, _1: unknown): boolean => deepNeq(_0, _1);