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
    luminosity: number;
  }

  export interface SpotLight extends Base {
    type: 'spot-light';
    coneAngle: Angle;
    penumbraAngle: Angle;
    luminosity: number;
  }

  export interface DirectionalLight extends Base {
    type: 'directional-light';
    luminosity: number;
  }
}

type Node = Node.Empty | Node.Object | Node.PointLight | Node.SpotLight | Node.DirectionalLight;

export default Node;