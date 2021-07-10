export default (code: string): Promise<string> => {

  return new Promise<string>((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.onload = () => {
      if (req.status !== 200) {
        reject(JSON.parse(req.responseText));
      }
      resolve(req.responseText);
    };

    req.onerror = (err) => {
      reject(err);
    };

    req.open('POST', '/compile');

    req.setRequestHeader('Content-Type', 'application/json');

    req.send(JSON.stringify({
      code
    }));
  });
  
};

export interface CompileError {
  stdout: string;
  stderr: string;
}