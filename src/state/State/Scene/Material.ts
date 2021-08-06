import { Color as ColorT } from './Color';

interface Material {
  albedo?: Material.Source;
  emissive?: Material.Source;
  reflection?: Material.Source;
  specular?: Material.Source;
  ambient?: Material.Source;
  metalness?: Material.Source;
}

namespace Material {
  export namespace Source {
    export interface Color {
      type: 'color';
      color: ColorT;
    }

    export interface Texture {
      type: 'texture';
      uri: string;
    }
  }

  export type Source = Source.Color | Source.Texture;
}

export default Material;