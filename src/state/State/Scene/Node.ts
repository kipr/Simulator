import { ReferenceFrame } from '../../../unit-math';
import { Angle, Mass } from '../../../util';

namespace Node {
  export interface Physics {
    colliderId?: string;
    mass: Mass;
    friction: number;
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

type Node = Node.Object | Node.PointLight | Node.SpotLight | Node.DirectionalLight;

export default Node;