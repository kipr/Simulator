namespace Document {
  interface Base {
    name: string;
  }

  export interface Internal extends Base {
    type: 'internal';
    content: string;
  }

  export interface External extends Base {
    type: 'external';
    uri: string;
  }
}

type Document = Document.Internal | Document.External;

export default Document;