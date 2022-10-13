import Dict from './Dict';
import Scene from './state/State/Scene';
import Camera from './state/State/Scene/Camera';
import Geometry from './state/State/Scene/Geometry';
import Node from './state/State/Scene/Node';
import Script from './state/State/Scene/Script';
import { Vector3 } from './unit-math';

import { v4 as uuid } from 'uuid';

class ScriptManager {
  private scene_: Scene;

  get scene() { return this.scene_; }

  onSceneChange: (scene: Scene) => void;

  private scriptExecutions_: Dict<ScriptManager.ScriptExecution>;

  set(id: string, script: Script) {
    if (id in this.scriptExecutions_) {
      this.scriptExecutions_[id].dispose();
    }

    this.scriptExecutions_[id] = new ScriptManager.ScriptExecution(script, this);
    return id;
  }

  remove(id: string): void {
    if (!(id in this.scriptExecutions_)) return;
    this.scriptExecutions_[id].dispose();
    delete this.scriptExecutions_[id];
  }

  trigger(event: ScriptManager.Event) {

  }
}

namespace ScriptManager {
  namespace Event {
    enum Type {

    }
  }

  export type Event = void;

  export interface SceneBinding {
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

    addOnRenderListener(cb: () => void): number;

    removeListener(handle: number): void;
  }

  export class ScriptExecution implements SceneBinding {
    private script_: Script;
    private manager_: ScriptManager;

    constructor(script: Script, manager: ScriptManager) {
      this.script_ = script;
      this.manager_ = manager;
    
      new Function("sceneBinding", `"use strict"; ${this.script_.code}`)(mod);
    }
    
    dispose() {

    }

    get nodes(): Dict<Node> {
      return this.manager_.scene.nodes;
    }

    addNode(node: Node, id?: string): string {
      const { onSceneChange } = this.manager_;
      if (!onSceneChange) return;

      if (!id) id = uuid();

      if (id in this.manager_.scene.nodes) {
        throw new Error(`Node with id ${id} already exists`);
      }
      
      onSceneChange({
        ...this.manager_.scene,
        nodes: {
          ...this.manager_.scene.nodes,
          [id]: node
        }
      });
    }

    removeNode(id: string): void {
      const { onSceneChange } = this.manager_;
      if (!onSceneChange) return;

      if (!(id in this.manager_.scene.nodes)) {
        throw new Error(`Node with id ${id} does not exist`);
      }

      const { [id]: _, ...nodes } = this.manager_.scene.nodes;
      onSceneChange({
        ...this.manager_.scene,
        nodes
      });
    }
    
    setNode(id: string, node: Node);

    readonly geometry: Dict<Geometry>;
    addGeometry(geometry: Geometry, id?: string): string;
    removeGeometry(id: string): void;
    
    gravity: Vector3;

    camera: Camera;

    selectedNodeId?: string;

    addOnRenderListener(cb: () => void): number;

    removeListener(handle: number): void;
  }
}

export default ScriptManager;