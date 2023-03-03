import Dict from '../Dict';
import Camera from '../state/State/Scene/Camera';
import Geometry from '../state/State/Scene/Geometry';
import Node from '../state/State/Scene/Node';
import { Vector3 } from '../unit-math';

export type Ids = string | string[] | Set<string>;

export namespace Ids {
  export const toSet = (ids: Ids): Set<string> => {
    if (typeof ids === 'string') return new Set([ids]);
    if (Array.isArray(ids)) return new Set(ids);
    return ids;
  };
}

export interface ScriptSceneBinding {
  readonly nodes: Dict<Node>;
  addNode(node: Node, id?: string): string;
  removeNode(id: string): void;
  setNode(id: string, node: Node);

  readonly geometry: Dict<Geometry>;
  addGeometry(geometry: Geometry, id?: string): string;
  removeGeometry(id: string): void;
  
  gravity: Vector3;

  camera: Camera;

  selectedNodeId?: string;

  readonly programStatus: 'running' | 'stopped';

  addOnRenderListener(cb: () => void): string;
  addOnCollisionListener(nodeId: string, cb: (otherNodeId: string, point: Vector3) => void, filterIds: Ids): string;
  addOnIntersectionListener(nodeId: string, cb: (type: 'start' | 'end', otherNodeId: string) => void, filterIds: Ids): string;
  addOnClickListener(filterIds: Ids, cb: (nodeId: string) => void): string;

  removeListener(handle: string): void;

  onBind?: (nodeId: string) => void;
  onUnbind?: (nodeId: string) => void;
  onDispose?: () => void;

  // Used only for unit tests
  postTestResult: (data: unknown) => void;

  setChallengeEventValue: (eventId: string, value: boolean) => void;
}