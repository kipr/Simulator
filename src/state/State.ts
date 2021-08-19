import { ReferenceFrame } from "../unit-math";
import { Mass, UnitlessValue } from "../util";

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
    startingOrigin?: ReferenceFrame;
    visible?: boolean;
    name?: string;
    mass?: Mass;
    friction?: UnitlessValue;
    removable?: boolean;
  }

  export interface Can extends Common {
    type: Type.Can;
  }

  // IDs are randomized hex if not specified
  export namespace Can {
    export const fill = (can: Can): Can => ({
      origin: can.startingOrigin ?? ReferenceFrame.IDENTITY,
      startingOrigin: ReferenceFrame.IDENTITY,
      visible: true,
      name: `Can ${Math.floor(Math.random() * 16777215).toString(16)}`,
      mass: Mass.grams(5),
      friction: UnitlessValue.create(5),
      removable: true,
      ...can
    });
  }

  export interface PaperReam extends Common {
    type: Type.PaperReam;
  }

  export namespace PaperReam {
    export const fill = (ream: PaperReam): PaperReam => ({
      origin: ream.startingOrigin ?? ReferenceFrame.IDENTITY,
      startingOrigin: ReferenceFrame.IDENTITY,
      visible: true,
      name: `Ream ${Math.floor(Math.random() * 16777215).toString(16)}`,
      mass: Mass.grams(50),
      friction: UnitlessValue.create(5),
      removable: true,
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
  selectedItem: string;
}

export interface State {
  scene: Scene;
}