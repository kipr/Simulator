import Dict from '../Dict';
import Camera from '../state/State/Scene/Camera';
import Geometry from '../state/State/Scene/Geometry';
import Node from '../state/State/Scene/Node';
import { Vector3 } from '../unit-math';

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

  addOnRenderListener(cb: () => void): string;

  removeListener(handle: string): void;

  onBind?: (nodeId: string) => void;
  onUnbind?: (nodeId: string) => void;
  onDispose?: () => void;
}