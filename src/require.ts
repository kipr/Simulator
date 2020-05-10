export default (code: string, context: any, print: (s:string)=> void): any => {
  const mod = {
    context,
    print,
    err: print
  };
  new Function("Module", `"use strict"; ${code}`)(mod);
  return mod;
};