import ProgrammingLanguage from "./ProgrammingLanguage";

export default (code: string, language: ProgrammingLanguage): Promise<CompileResult> => {

  return new Promise<CompileResult>((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.onload = () => {
      if (req.status !== 200) {
        reject(JSON.parse(req.responseText));
        return;
      }
      resolve(JSON.parse(req.responseText) as CompileResult);
    };

    req.onerror = (err) => {
      reject(err);
    };

    req.open('POST', '/compile');

    req.setRequestHeader('Content-Type', 'application/json');

    req.send(JSON.stringify({
      code,
      language,
    }));
  });
  
};

export interface CompileResult {
  result?: string;
  stdout: string;
  stderr: string;
}