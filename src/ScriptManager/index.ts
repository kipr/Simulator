import Dict from '../Dict';
import Scene from '../state/State/Scene';
import Camera from '../state/State/Scene/Camera';
import Geometry from '../state/State/Scene/Geometry';
import Node from '../state/State/Scene/Node';
import Script from '../state/State/Scene/Script';
import { Vector3 } from '../unit-math';

import { v4 as uuid } from 'uuid';
import construct from '../util/construct';
import { Ids, ScriptSceneBinding } from './ScriptSceneBinding';

class ScriptManager {
  private scene_: Scene;

  get scene() { return this.scene_; }
  set scene(scene: Scene) { this.scene_ = scene; }

  onSceneChange: (scene: Scene) => void;

  private scriptExecutions_: Dict<ScriptManager.ScriptExecution> = {};

  set(id: string, script: Script) {
    if (id in this.scriptExecutions_) {
      this.scriptExecutions_[id].dispose();
    }

    this.scriptExecutions_[id] = new ScriptManager.ScriptExecution(script, this);
    return id;
  }

  bind(scriptId: string, nodeId: string) {
    if (!(scriptId in this.scriptExecutions_)) return;
    this.scriptExecutions_[scriptId].bind(nodeId);
  }

  unbind(scriptId: string, nodeId: string) {
    if (!(scriptId in this.scriptExecutions_)) return;
    this.scriptExecutions_[scriptId].unbind(nodeId);
  }

  remove(id: string): void {
    if (!(id in this.scriptExecutions_)) return;
    this.scriptExecutions_[id].dispose();
    delete this.scriptExecutions_[id];
  }

  trigger(event: ScriptManager.Event) {
    for (const id in this.scriptExecutions_) this.scriptExecutions_[id].trigger(event);
  }
}

namespace ScriptManager {
  export namespace Event {
    export enum Type {
      Render,
      Collision,
      IntersectionStart,
      IntersectionEnd,
    }

    export interface Render {
      type: Type.Render;
    }

    export const RENDER: Render = { type: Type.Render };

    export interface Collision {
      type: Type.Collision;
      aId: string;
      bId: string;
    }

    export const collision = construct<Collision>(Type.Collision);
  
    export interface IntersectionStart {
      type: Type.IntersectionStart;
      aId: string;
      bId: string;
    }

    export const intersectionStart = construct<IntersectionStart>(Type.IntersectionStart);

    export interface IntersectionEnd {
      type: Type.IntersectionEnd;
      aId: string;
      bId: string;
    }

    export const intersectionEnd = construct<IntersectionEnd>(Type.IntersectionEnd);
  }

  export type Event = (
    Event.Render |
    Event.Collision |
    Event.IntersectionStart |
    Event.IntersectionEnd
  );

  export namespace Listener {
    export enum Type {
      Render,
      Collision,
      Intersection,
    }

    export interface Render {
      type: Type.Render;
      cb: () => void;
    }

    export const render = construct<Render>(Type.Render);
  
    export interface Collision {
      type: Type.Collision;
      filterIds?: Set<string>;
      cb: (aId: string, bId: string) => void;
    }

    export const collision = construct<Collision>(Type.Collision);
  
    export interface Intersection {
      type: Type.Intersection;
      filterIds?: Set<string>;
      cb: (type: 'start' | 'end', aId: string, bId: string) => void;
    }

    export const intersection = construct<Intersection>(Type.Intersection);
  }

  export type Listener = (
    Listener.Render |
    Listener.Collision |
    Listener.Intersection
  );

  

  export class ScriptExecution implements ScriptSceneBinding {
    private script_: Script;
    private manager_: ScriptManager;

    private listeners_: Dict<Listener> = {};
    private boundNodeIds_ = new Set<string>();

    constructor(script: Script, manager: ScriptManager) {
      this.script_ = script;
      this.manager_ = manager;
    
      new Function("scene", `"use strict"; ${this.script_.code}`)(this);
    }

    trigger(event: Event) {
      switch (event.type) {
        case Event.Type.Render: {
          this.triggerRender_(event);
          break;
        }
        case Event.Type.Collision: {
          this.triggerCollision_(event);
          break;
        }
        case Event.Type.IntersectionStart:
        case Event.Type.IntersectionEnd: {
          this.triggerIntersection_(event);
          break;
        }
      }
    }

    private triggerRender_(event: Event.Render) {
      for (const listener of Dict.values(this.listeners_)) {
        if (listener.type !== Listener.Type.Render) return;
        listener.cb();
      }
    }

    private triggerCollision_(event: Event.Collision) {
      for (const listener of Dict.values(this.listeners_)) {
        if (listener.type !== Listener.Type.Collision) return;
        if (listener.filterIds && !listener.filterIds.has(event.aId)) return;
        listener.cb(event.aId, event.bId);
      }
    }

    private triggerIntersection_(event: Event.IntersectionStart | Event.IntersectionEnd) {
      for (const listener of Dict.values(this.listeners_)) {
        if (listener.type !== Listener.Type.Intersection) return;
        if (listener.filterIds && !listener.filterIds.has(event.aId)) return;
        listener.cb(event.type === Event.Type.IntersectionStart ? 'start' : 'end', event.aId, event.bId);
      }
    }

    bind(nodeId: string) {
      if (this.boundNodeIds_.has(nodeId)) return;
      if (this.onBind) this.onBind(nodeId);
      this.boundNodeIds_.add(nodeId);
    }

    unbind(nodeId: string) {
      if (!this.boundNodeIds_.has(nodeId)) return;
      if (this.onUnbind) this.onUnbind(nodeId);
      this.boundNodeIds_.delete(nodeId);
    }
    
    dispose() {
      this.boundNodeIds_.clear();
      if (this.onDispose) this.onDispose();
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
    
    setNode(id: string, node: Node): void {
      const { onSceneChange } = this.manager_;
      if (!onSceneChange) return;

      if (!(id in this.manager_.scene.nodes)) {
        throw new Error(`Node with id ${id} does not exist`);
      }

      onSceneChange({
        ...this.manager_.scene,
        nodes: {
          ...this.manager_.scene.nodes,
          [id]: node
        }
      });
    }

    get geometry(): Dict<Geometry> {
      return this.manager_.scene.geometry;
    }

    addGeometry(geometry: Geometry, id?: string): string {
      const { onSceneChange } = this.manager_;
      if (!onSceneChange) return;

      if (!id) id = uuid();

      if (id in this.manager_.scene.geometry) {
        throw new Error(`Geometry with id ${id} already exists`);
      }
      
      onSceneChange({
        ...this.manager_.scene,
        geometry: {
          ...this.manager_.scene.geometry,
          [id]: geometry
        }
      });
    }

    removeGeometry(id: string): void {
      const { onSceneChange } = this.manager_;
      if (!onSceneChange) return;

      if (!(id in this.manager_.scene.geometry)) {
        throw new Error(`Geometry with id ${id} does not exist`);
      }

      const { [id]: _, ...geometry } = this.manager_.scene.geometry;
      onSceneChange({
        ...this.manager_.scene,
        geometry
      });
    }
    
    get gravity(): Vector3 {
      return this.manager_.scene.gravity;
    }

    get camera(): Camera {
      return this.manager_.scene.camera;
    }

    get selectedNodeId(): string | null {
      return this.manager_.scene.selectedNodeId;
    }

    addOnRenderListener(cb: () => void): string {
      const handle = uuid();
      this.listeners_[handle] = Listener.render({ cb });
      return handle;
    }

    addOnCollisionListener(cb: (aId: string, bId: string) => void, filterIds?: Ids): string {
      const handle = uuid();
      this.listeners_[handle] = Listener.collision({ cb, filterIds: Ids.toSet(filterIds) });
      return handle;
    }

    addOnIntersectionListener(cb: (type: 'start' | 'end', aId: string, bId: string) => void, filterIds?: Ids): string {
      const handle = uuid();
      this.listeners_[handle] = Listener.intersection({ cb, filterIds: Ids.toSet(filterIds) });
      return handle;
    }

    removeListener(handle: string): void {
      delete this.listeners_[handle];
    }

    onBind?: (nodeId: string) => void;
    onUnbind?: (nodeId: string) => void;
    onDispose?: () => void;
  }
}

export default ScriptManager;