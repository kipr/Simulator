const valueNeq = (value0: any, value1: any) => {
  if(Array.isArray(value0)) {
    if(!Array.isArray(value1)) return true;
    if(deepArrayNeq(value0, value1)) return true;
    return false;
  }

  const value0Type = typeof value0;
  const value1Type = typeof value1;

  if(value0Type !== value1Type) {
    return true;
  }

  // Props are of the same type
  const valueType = value0Type;
  if(valueType === 'object') {
    if(value0 === null) {
      if(value1 === null) return false;
      return true;
    }
    if(value1 === null) {
      if(value0 === null) return false;
      return true;
    }
    if(deepObjectNeq(value0, value1)) return true;
    return false;
  }
  
  if(value0 !== value1) return true;

  return false;
};

const deepArrayNeq = (_0: any[], _1: any[]) => {
  if(_0.length !== _1.length) return true;
  const length = _0.length;

  for(let i = 0; i < length; ++i) {
    if(valueNeq(_0[i], _1[i])) return true;
  }

  return false;
};

const deepObjectNeq = (_0: any, _1: any) => {
  const keys0 = Object.keys(_0);
  const keys1 = Object.keys(_1);
  if(keys0.length !== keys1.length) return true;

  const hit = new Set<string>();
  for(let i = 0; i < keys0.length; ++i) {
    hit.add(keys0[i]);
  }
  for(let i = 0; i < keys1.length; ++i) {
    if(!hit.has(keys1[i])) return true;
  }

  // We've now determined that all keys are the same

  const keys = keys0;
  for(let i = 0; i < keys.length; ++i) {
    const key = keys[i];
    if(valueNeq(_0[key], _1[key])) return true;
  }

  return false;
};

export default (_0: any, _1: any) => valueNeq(_0, _1);