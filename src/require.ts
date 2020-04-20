export default (code: string, context: any): any => {
  const mod = {
    context
  };
  new Function("Module", `"use strict"; ${code}`)(mod);
  return mod;
};