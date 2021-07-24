import { ReferenceFrame } from "../math";

export namespace Item {
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
    origin?: ReferenceFrame;
    visible?: boolean;
    name?: string;
  }

  export interface Can extends Common {
    type: Type.Can;
  }

  // IDs are randomized hex if not specified
  export namespace Can {
    export const fill = (can: Can): Can => ({
      origin: ReferenceFrame.IDENTITY,
      visible: true,
      name: `Can ${Math.floor(Math.random() * 16777215).toString(16)}`,
      ...can
    });
  }

  export interface PaperReam extends Common {
    type: Type.PaperReam;
  }

  export namespace PaperReam {
    export const fill = (ream: PaperReam): PaperReam => ({
      origin: ReferenceFrame.IDENTITY,
      visible: true,
      name: `Ream ${Math.floor(Math.random() * 16777215).toString(16)}`,
      ...ream
    });
  }
}

export type Item = Item.Can | Item.PaperReam;

export interface Scene {
  itemOrdering: string[];
  items: {
    [name: string]: Item;
  };
}

export interface State {
  scene: Scene;
}