namespace Asset {
  export enum Type {
    Image = 'image',
    Video = 'video',
    Audio = 'audio',
    Document = 'document',
    Link = 'link',
  }

  interface Base {
    id: string;
  }

  export interface Image extends Base {
    type: Type.Image;
    format: Image.Format;
  }

  export namespace Image {
    export enum Format {
      Png = 'png',
      Jpeg = 'jpeg',
      Gif = 'gif',
    }
  }

  export interface Video extends Base {
    type: Type.Video;
    format: Video.Format;
  }

  export namespace Video {
    export enum Format {
      Mp4 = 'mp4',
      Webm = 'webm',
    }
  }

  export interface Audio extends Base {
    type: Type.Audio;
    format: Audio.Format;
  }

  export namespace Audio {
    export enum Format {
      Mp3 = 'mp3',
      Ogg = 'ogg',
    }
  }

  export interface Document extends Base {
    type: Type.Document;
    format: Document.Format;
  }

  export namespace Document {
    export enum Format {
      Pdf = 'pdf',
      Doc = 'doc',
      Docx = 'docx',
      Odt = 'odt',
      Rtf = 'rtf',
      Txt = 'txt',
      Markdown = 'markdown',
    }
  }

  export interface Link extends Base {
    type: Type.Link;
    url: string;
  }
}

type Asset = (
  Asset.Image |
  Asset.Video |
  Asset.Audio |
  Asset.Document |
  Asset.Link
);

export default Asset;