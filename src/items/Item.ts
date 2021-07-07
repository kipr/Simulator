import * as Babylon from 'babylonjs';

namespace Item {
  export enum Type {
    Can,
    PaperReam
  }

  export namespace Type {
    export const toString = (type: Type): string => {
      switch (type) {
        case Type.Can: return 'Can';
        case Type.PaperReam: return 'PaperReam';
        default: return `Unknown (${JSON.stringify(type)})`;
      }
    };
  }

  // Info needed to add any mesh to the scene
  interface Common {
    startPosition: Babylon.Vector3;
    startRotation?: number;
    rotationAxis?: Babylon.Vector3;
    transparent?: boolean;
    id?: string;
  }

  export interface Can extends Common {
    type: Type.Can;
  }

  // IDs are randomized hex if not specified
  export namespace Can {
    export const fill = (can: Can): Can => ({
      startRotation: 0,
      rotationAxis: Babylon.Axis.Y,
      transparent: true,
      id: `Can ${Math.floor(Math.random() * 16777215).toString(16)}`,
      ...can
    });
  }

  export interface PaperReam extends Common {
    type: Type.PaperReam;
  }

  export namespace PaperReam {
    export const fill = (ream: PaperReam): PaperReam => ({
      startRotation: 0,
      rotationAxis: Babylon.Axis.Y,
      transparent: true,
      id: `Ream ${Math.floor(Math.random() * 16777215).toString(16)}`,
      ...ream
    });
  }
}

type Item = Item.Can | Item.PaperReam;

export default Item;