namespace Audio {
  interface Base {
    name: string;
  }

  export interface Pcm extends Base {
    type: 'pcm';
    channels: number;
    sampleRate: number;
    bitDepth: number;
    data: string;
  }

  export interface File extends Base {
    type: 'file';
    uri: string;
  }
}

type Audio = Audio.Pcm | Audio.File;

export default Audio;