import ProgrammingLanguage from "./ProgrammingLanguage";

export default (code: string, language: ProgrammingLanguage): Promise<CompileResult> => {

  return new Promise<CompileResult>((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.onload = () => {
      if (req.status !== 200) {
        try {
          reject(JSON.parse(req.responseText));
        } catch (parseError) {
          reject({
            error: `Server error (${req.status}): ${req.responseText || 'Unable to compile. The compiler may not be available.'}`
          });
        }
        return;
      }

      try {
        resolve(JSON.parse(req.responseText) as CompileResult);
      } catch (parseError) {
        reject({
          error: 'Invalid response from server: expected JSON but received: ' + req.responseText.substring(0, 100)
        });
      }
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