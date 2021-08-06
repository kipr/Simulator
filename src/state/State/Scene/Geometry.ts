import { Vector2, Vector3 } from '../../../unit-math';
import { Vector3 as RawVector3, Vector2 as RawVector2 } from '../../../math';
import { Distance } from '../../../util';

namespace Geometry {
  export interface Box {
    type: 'box';
    size: Vector3;
  }

  export interface Sphere {
    type: 'sphere';
    radius: Distance;
  }

  export interface Cylinder {
    type: 'cylinder';
    radius: Distance;
    height: Distance;
  }

  export interface Cone {
    type: 'cone';
    radius: Distance;
    height: Distance;
  }

  export interface Plane {
    type: 'plane';
    size: Vector2;
  }

  export interface Mesh {
    type: 'mesh';

    distanceType?: Distance.Type;
    vertices: RawVector3[];
    uvs?: RawVector2[];
    indices?: number[];
  }

  export interface File {
    type: 'file';
    uri: string;
    
    // If the file contains multiple objects, we can use these to include/exclude them.
    include?: string[];
    exclude?: string[];
  }
}

type Geometry = Geometry.Box | Geometry.Sphere | Geometry.Cylinder | Geometry.Cone | Geometry.Plane | Geometry.File;

export default Geometry;