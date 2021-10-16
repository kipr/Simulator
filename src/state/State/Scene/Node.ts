import { Vector3 } from '../../../math';
import { ReferenceFrame } from '../../../unit-math';
import { Angle, Mass } from '../../../util';

namespace Node {
  
  export interface Physics {
    colliderId?: string;
    fixed?: boolean;
    type: Physics.Type;
    mass?: Mass;
    friction?: number;
    restitution?: number;
  }

  export namespace Physics {
    export type Type = 'box' | 'sphere' | 'mesh' | 'none';
  }

  interface Base {
    name: string;
    parentId?: string;
    origin?: ReferenceFrame;
    physics?: Physics;
    scriptIds?: string[];
    documentIds?: string[];
    editable?: boolean;
  }

  export interface Empty extends Base {
    type: 'empty';
  }

  export interface Object extends Base {
    type: 'object';
    geometryId: string;
  }

  export interface PointLight extends Base {
    type: 'point-light';
    intensity: number;
    radius?: number;
    range?: number;
  }

  export interface SpotLight extends Base {
    type: 'spot-light';
    direction: Vector3;
    angle: Angle;
    exponent: number;
    intensity: number;
  }

  export interface DirectionalLight extends Base {
    type: 'directional-light';
    radius?: number;
    range?: number;
    direction: Vector3;
    intensity: number;
  }
}

type Node = Node.Empty | Node.Object | Node.PointLight | Node.SpotLight | Node.DirectionalLight;

export default Node;