// Disable eslint rule - this file deals heavily with "object" type
/* eslint-disable @typescript-eslint/ban-types */

const valueNeq = (value0: unknown, value1: unknown) => {
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

const deepArrayNeq = (_0: unknown[], _1: unknown[]) => {
  if (_0.length !== _1.length) return true;
  const length = _0.length;

  for (let i = 0; i < length; ++i) {
    if (valueNeq(_0[i], _1[i])) return true;
  }

  return false;
};

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
    if (valueNeq(_0[key], _1[key])) return true;
  }

  return false;
};

export default (_0: unknown, _1: unknown): boolean => valueNeq(_0, _1);