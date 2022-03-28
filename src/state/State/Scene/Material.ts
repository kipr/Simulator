import deepNeq from '../../../deepNeq';
import { Color as ColorT } from './Color';
import Patch from './Patch';

interface Material {
  albedo?: Material.Source3;
  emissive?: Material.Source3;
  reflection?: Material.Source3;
  ambient?: Material.Source3;
  metalness?: Material.Source1;
}

namespace Material {
  export const NIL: Material = {};

  export namespace Source1 {
    export interface Color {
      type: 'color1';
      color: number;
    }

    export namespace Color {
      export const diff = (prev: Color, next: Color): Patch<Color> => {
        if (prev.color === next.color) return Patch.none(prev);
  
        return Patch.innerChange(prev, next, {
          type: Patch.none(prev.type),
          color: Patch.outerChange(prev.color, next.color)
        });
      };
    }

    export interface Texture {
      type: 'texture';
      uri: string;
    }

    export namespace Texture {
      export const diff = (prev: Texture, next: Texture): Patch<Texture> => {
        if (prev.uri === next.uri) return Patch.none(prev);
  
        return Patch.innerChange(prev, next, {
          type: Patch.none(prev.type),
          uri: Patch.outerChange(prev.uri, next.uri)
        });
      };
    }

    export const diff = (prev: Source1, next: Source1): Patch<Source1> => {
      if (prev.type !== next.type) return Patch.outerChange(prev, next);
      switch (prev.type) {
        case 'color1': return Color.diff(prev, next as Source1.Color);
        case 'texture': return Texture.diff(prev, next as Source1.Texture);
      }
    };
  }

  export namespace Source3 {
    export interface Color {
      type: 'color3';
      color: ColorT;
    }

    export namespace Color {
      export const diff = (prev: Color, next: Color): Patch<Color> => {
        if (!deepNeq(prev.color, next.color)) return Patch.none(prev);
  
        return Patch.innerChange(prev, next, {
          type: Patch.none(prev.type),
          color: Patch.outerChange(prev.color, next.color)
        });
      };
    }

    export interface Texture {
      type: 'texture';
      uri: string;
    }

    export namespace Texture {
      export const diff = (prev: Texture, next: Texture): Patch<Texture> => {
        if (prev.uri === next.uri) return Patch.none(prev);
  
        return Patch.innerChange(prev, next, {
          type: Patch.none(prev.type),
          uri: Patch.outerChange(prev.uri, next.uri)
        });
      };
    }

    export const diff = (prev: Source3, next: Source3): Patch<Source3> => {
      if (prev.type !== next.type) return Patch.outerChange(prev, next);
      switch (prev.type) {
        case 'color3': return Color.diff(prev, next as Source3.Color);
        case 'texture': return Texture.diff(prev, next as Source3.Texture);
      }
    };
  }

  export type Source1 = Source1.Color | Source1.Texture;
  export type Source3 = Source3.Color | Source3.Texture;

  export const diff = (prev: Material, next: Material): Patch<Material> => {
    if (!deepNeq(prev, next)) return Patch.none(prev);

    return Patch.innerChange(prev, next, {
      albedo: Source3.diff(prev.albedo, next.albedo),
      emissive: Source3.diff(prev.emissive, next.emissive),
      reflection: Source3.diff(prev.reflection, next.reflection),
      ambient: Source3.diff(prev.ambient, next.ambient),
      metalness: Source1.diff(prev.metalness, next.metalness)
    });
  };
}

export default Material;