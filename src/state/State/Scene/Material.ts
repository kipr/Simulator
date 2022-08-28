import deepNeq from '../../../deepNeq';
import Patch from '../../../util/Patch';
import { Color as ColorT } from './Color';

namespace Material {

  export namespace Source1 {
    export interface Color {
      type: 'color1';
      color: number;
    }

    export namespace Color {
      export const diff = (prev: Color, next: Color): Patch<Color> => {
        if (!prev && !next) return Patch.none(prev);
        if (!prev && next) return Patch.outerChange(prev, next);
        if (prev && !next) return Patch.outerChange(prev, next);
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
      if (!prev && !next) return Patch.none(prev);
      if (!prev && next) return Patch.outerChange(prev, next);
      if (prev && !next) return Patch.outerChange(prev, next);

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
        if (!prev && !next) return Patch.none(prev);
        if (!prev && next) return Patch.outerChange(prev, next);
        if (prev && !next) return Patch.outerChange(prev, next);

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
      if (!prev && !next) return Patch.none(prev);
      if (!prev && next) return Patch.outerChange(prev, next);
      if (prev && !next) return Patch.outerChange(prev, next);
      if (prev.type !== next.type) return Patch.outerChange(prev, next);
      switch (prev.type) {
        case 'color3': return Color.diff(prev, next as Source3.Color);
        case 'texture': return Texture.diff(prev, next as Source3.Texture);
      }
    };
  }

  export type Source1 = Source1.Color | Source1.Texture;
  export type Source3 = Source3.Color | Source3.Texture;

  export interface Pbr {
    type: 'pbr';
    albedo?: Material.Source3;
    emissive?: Material.Source3;
    reflection?: Material.Source3;
    ambient?: Material.Source3;
    metalness?: Material.Source1;
  }

  export namespace Pbr {
    export const NIL: Pbr = { type: 'pbr' };

    export const diff = (prev: Pbr, next: Pbr): Patch<Pbr> => {
      if (!deepNeq(prev, next)) return Patch.none(prev);
  
      return Patch.innerChange(prev, next, {
        type: Patch.none(prev.type),
        albedo: Source3.diff(prev.albedo, next.albedo),
        emissive: Source3.diff(prev.emissive, next.emissive),
        reflection: Source3.diff(prev.reflection, next.reflection),
        ambient: Source3.diff(prev.ambient, next.ambient),
        metalness: Source1.diff(prev.metalness, next.metalness)
      });
    };
  }

  export interface Basic {
    type: 'basic';
    color?: Material.Source3;
  }

  export namespace Basic {
    export const NIL: Basic = { type: 'basic' };

    export const diff = (prev: Basic, next: Basic): Patch<Basic> => {
      if (!deepNeq(prev, next)) return Patch.none(prev);
  
      return Patch.innerChange(prev, next, {
        type: Patch.none(prev.type),
        color: Source3.diff(prev.color, next.color)
      });
    };
  }


  export const diff = (prev: Material, next: Material): Patch<Material> => {
    if (!deepNeq(prev, next)) return Patch.none(prev);
    
    if (prev && !next) return Patch.outerChange(prev, next);
    if (!prev && next) return Patch.outerChange(prev, next);
    if (prev.type !== next.type) return Patch.outerChange(prev, next);

    switch (prev.type) {
      case 'pbr': return Pbr.diff(prev, next as Pbr);
      case 'basic': return Basic.diff(prev, next as Basic);
    }
  };
}

type Material = Material.Pbr | Material.Basic;

export default Material;