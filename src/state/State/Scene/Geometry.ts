import { Vector2, Vector3 } from '../../../unit-math';
import { Vector3 as RawVector3, Vector2 as RawVector2 } from '../../../math';
import { Distance } from '../../../util/Value';
import deepNeq from '../../../deepNeq';
import Patch from '../../../util/Patch';

namespace Geometry {
  export interface Box {
    type: 'box';
    size: Vector3;
  }

  export namespace Box {
    export const DEFAULT: Box = {
      type: 'box',
      size: {
        x: Distance.centimeters(10),
        y: Distance.centimeters(10),
        z: Distance.centimeters(10),
      }
    };

    export const diff = (prev: Box, next: Box): Patch<Box> => {
      if (!deepNeq(prev, next)) return Patch.none(prev);

      return Patch.innerChange(prev, next, {
        type: Patch.none(prev.type),
        size: Patch.diff(prev.size, next.size)
      });
    };
  }

  export interface Sphere {
    type: 'sphere';
    radius: Distance;
  }

  export namespace Sphere {
    export const DEFAULT: Sphere = {
      type: 'sphere',
      radius: Distance.centimeters(5),
    };
    
    export const diff = (prev: Sphere, next: Sphere): Patch<Sphere> => {
      if (!deepNeq(prev, next)) return Patch.none(prev);

      return Patch.innerChange(prev, next, {
        type: Patch.none(prev.type),
        radius: Patch.diff(prev.radius, next.radius)
      });
    };
  }

  export interface Cylinder {
    type: 'cylinder';
    radius: Distance;
    height: Distance;
  }

  export namespace Cylinder {
    export const DEFAULT: Cylinder = {
      type: 'cylinder',
      radius: Distance.centimeters(5),
      height: Distance.centimeters(10)
    };

    export const diff = (prev: Cylinder, next: Cylinder): Patch<Cylinder> => {
      if (!deepNeq(prev, next)) return Patch.none(prev);

      return Patch.innerChange(prev, next, {
        type: Patch.none(prev.type),
        radius: Patch.diff(prev.radius, next.radius),
        height: Patch.diff(prev.height, next.height)
      });
    };
  }

  export interface Cone {
    type: 'cone';
    radius: Distance;
    height: Distance;
  }

  export namespace Cone {
    export const DEFAULT: Cone = {
      type: 'cone',
      radius: Distance.centimeters(5),
      height: Distance.centimeters(10)
    };
    
    export const diff = (prev: Cone, next: Cone): Patch<Cone> => {
      if (!deepNeq(prev, next)) return Patch.none(prev);

      return Patch.innerChange(prev, next, {
        type: Patch.none(prev.type),
        radius: Patch.diff(prev.radius, next.radius),
        height: Patch.diff(prev.height, next.height)
      });
    };
  }

  export interface Plane {
    type: 'plane';
    size: Vector2;
  }

  export namespace Plane {
    export const DEFAULT: Plane = {
      type: 'plane',
      size: {
        x: Distance.centimeters(10),
        y: Distance.centimeters(10)
      }
    };
    
    export const diff = (prev: Plane, next: Plane): Patch<Plane> => {
      if (!deepNeq(prev, next)) return Patch.none(prev);

      return Patch.innerChange(prev, next, {
        type: Patch.none(prev.type),
        size: Patch.diff(prev.size, next.size)
      });
    };
  }

  export interface Mesh {
    type: 'mesh';

    distanceType?: Distance.Type;
    vertices: RawVector3[];
    uvs?: RawVector2[];
    indices?: number[];
  }

  export namespace Mesh {
    export const DEFAULT: Mesh = {
      type: 'mesh',
      vertices: []
    };

    export const diff = (prev: Mesh, next: Mesh): Patch<Mesh> => {
      if (!deepNeq(prev, next)) return Patch.none(prev);

      return Patch.innerChange(prev, next, {
        type: Patch.none(prev.type),
        distanceType: Patch.diff(prev.distanceType, next.distanceType),
        vertices: Patch.diff(prev.vertices, next.vertices),
        uvs: Patch.diff(prev.uvs, next.uvs),
        indices: Patch.diff(prev.indices, next.indices)
      });
    };
  }

  export interface File {
    type: 'file';
    uri: string;
    
    // If the file contains multiple objects, we can use these to include/exclude them.
    include?: string[];
    exclude?: string[];
  }

  export namespace File {
    export const DEFAULT: File = {
      type: 'file',
      uri: '',
    };

    export const diff = (prev: File, next: File): Patch<File> => {
      if (!deepNeq(prev, next)) return Patch.none(prev);

      return Patch.innerChange(prev, next, {
        type: Patch.none(prev.type),
        uri: Patch.diff(prev.uri, next.uri),
        include: Patch.diff(prev.include, next.include),
        exclude: Patch.diff(prev.exclude, next.exclude)
      });
    };
  }

  export const isBox = (geometry: Geometry): geometry is Box => geometry.type === 'box';
  export const isSphere = (geometry: Geometry): geometry is Sphere => geometry.type === 'sphere';
  export const isCylinder = (geometry: Geometry): geometry is Cylinder => geometry.type === 'cylinder';
  export const isCone = (geometry: Geometry): geometry is Cone => geometry.type === 'cone';
  export const isPlane = (geometry: Geometry): geometry is Plane => geometry.type === 'plane';
  export const isMesh = (geometry: Geometry): geometry is Mesh => geometry.type === 'mesh';
  export const isFile = (geometry: Geometry): geometry is File => geometry.type === 'file';

  export const diff = (prev: Geometry, next: Geometry): Patch<Geometry> => {
    if (prev.type !== next.type) {
      return Patch.outerChange(prev, next);
    }

    switch (prev.type) {
      case 'box': return Box.diff(prev, next as Box);
      case 'sphere': return Sphere.diff(prev, next as Sphere);
      case 'cylinder': return Cylinder.diff(prev, next as Cylinder);
      case 'cone': return Cone.diff(prev, next as Cone);
      case 'plane': return Plane.diff(prev, next as Plane);
      case 'mesh': return Mesh.diff(prev, next as Mesh);
      case 'file': return File.diff(prev, next as File);
    }
  };

  export type Type = 'box' | 'sphere' | 'cylinder' | 'cone' | 'plane' | 'mesh' | 'file';

  export const defaultFor = (type: Type): Geometry => {
    switch (type) {
      case 'box': return Box.DEFAULT;
      case 'sphere': return Sphere.DEFAULT;
      case 'cylinder': return Cylinder.DEFAULT;
      case 'cone': return Cone.DEFAULT;
      case 'plane': return Plane.DEFAULT;
      case 'mesh': return Mesh.DEFAULT;
      case 'file': return File.DEFAULT;
    }
  };
}

type Geometry = Geometry.Box | Geometry.Sphere | Geometry.Cylinder | Geometry.Cone | Geometry.Plane | Geometry.Mesh | Geometry.File;

export default Geometry;