export default (code): any => {
  const mod = {};
  new Function("Module", `"use strict"; ${code}`)(mod);
  return mod;
};