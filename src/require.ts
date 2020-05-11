export default (code: string, context: any, print: (s:string)=> void, err: (stdout: string, stderror: string) => void):any => {
  const mod = {
    context,
    print,
    err 
  };
  new Function("Module", `"use strict"; ${code}`)(mod);
  return mod;
};