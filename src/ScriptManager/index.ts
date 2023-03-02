import Dict from '../Dict';
import Scene from '../state/State/Scene';
import Camera from '../state/State/Scene/Camera';
import Geometry from '../state/State/Scene/Geometry';
import Node from '../state/State/Scene/Node';
import Script from '../state/State/Scene/Script';
import { Rotation, Vector3 } from '../unit-math';

import { v4 as uuid } from 'uuid';
import construct from '../util/construct';
import { Ids, ScriptSceneBinding } from './ScriptSceneBinding';
import { AxisAngle, Quaternion, ReferenceFrame, Vector3 as RawVector3 } from '../math';
import { Angle, Mass, Distance } from '../util/Value';

class ScriptManager {
  private scene_: Scene;

  get scene() { return this.scene_; }
  set scene(scene: Scene) { this.scene_ = scene; }

  onNodeAdd?: (id: string, node: Node) => void;
  onNodeRemove?: (id: string) => void;
  onNodeChange?: (id: string, node: Node) => void;

  onGeometryAdd?: (id: string, geometry: Geometry) => void;
  onGeometryRemove?: (id: string) => void;

  onGravityChange?: (gravity: Vector3) => void;
  onCameraChange?: (camera: Camera) => void;
  onSelectedNodeIdChange?: (id: string) => void;

  onChallengeSetEventValue?: (eventId: string, value: boolean) => void;

  private programStatus_: 'running' | 'stopped' = 'stopped';
  get programStatus() { return this.programStatus_; }
  set programStatus(status: 'running' | 'stopped') {
    this.programStatus_ = status;
  }


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

  dispose() {
    for (const id in this.scriptExecutions_) this.scriptExecutions_[id].dispose();
    this.scriptExecutions_ = {};
  }

  // Map of nodeId to filtered node id reference counts.
  private collisionRefCounts_ = new Map<string, Map<string, number>>();
  private intersectionRefCounts_ = new Map<string, Map<string, number>>();

  onCollisionFiltersChanged: (nodeId: string, filterIds: Set<string>) => void;
  onIntersectionFiltersChanged: (nodeId: string, filterIds: Set<string>) => void;


  // Babylon needs to know about the details of collision and intersection listeners.
  // The following methods are called by ScriptExecutions to register listeners with us,
  // which we then forward to Babylon.
  private addRefCounts_ = <T extends { nodeId: string; filterIds: Set<string>; }>(
    nodeRefCounts: Map<string, Map<string, number>>,
    onChangedKey: string,
  ) => (listener: T) => {
    if (!nodeRefCounts.has(listener.nodeId)) {
      nodeRefCounts.set(listener.nodeId, new Map<string, number>());
    }

    const refCounts = nodeRefCounts.get(listener.nodeId);

    for (const filterId of listener.filterIds) {
      if (refCounts.has(filterId)) {
        refCounts.set(filterId, refCounts.get(filterId) + 1);
      } else {
        refCounts.set(filterId, 1);
      }
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    if (this[onChangedKey]) this[onChangedKey](listener.nodeId, new Set(refCounts.keys()));
  };

  private removeRefCounts_ = <T extends { nodeId: string; filterIds: Set<string>; }>(
    nodeRefCounts: Map<string, Map<string, number>>,
    onChangedKey: string,
  ) => (listener: T) => {
    if (!nodeRefCounts.has(listener.nodeId)) return;

    const refCounts = nodeRefCounts.get(listener.nodeId);

    for (const filterId of listener.filterIds) {
      if (refCounts.has(filterId)) {
        const count = refCounts.get(filterId);
        if (count === 1) {
          refCounts.delete(filterId);
        } else {
          refCounts.set(filterId, count - 1);
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    if (this[onChangedKey]) this[onChangedKey](listener.nodeId, new Set(refCounts.keys()));
  };

  readonly addCollisionRefCounts_ = this.addRefCounts_<ScriptManager.Listener.Collision>(this.collisionRefCounts_, 'onCollisionFiltersChanged');
  readonly removeCollisionRefCounts_ = this.removeRefCounts_<ScriptManager.Listener.Collision>(this.collisionRefCounts_, 'onCollisionFiltersChanged');

  readonly addIntersectionRefCounts_ = this.addRefCounts_<ScriptManager.Listener.Intersection>(this.intersectionRefCounts_, 'onIntersectionFiltersChanged');
  readonly removeIntersectionRefCounts_ = this.removeRefCounts_<ScriptManager.Listener.Intersection>(this.intersectionRefCounts_, 'onIntersectionFiltersChanged');

  onPostTestResult: (data: unknown) => void;
}

namespace ScriptManager {
  export namespace Event {
    export enum Type {
      Render,
      Collision,
      IntersectionStart,
      IntersectionEnd,
      Click
    }

    export interface Render {
      type: Type.Render;
    }

    export const RENDER: Render = { type: Type.Render };

    export interface Collision {
      type: Type.Collision;
      nodeId: string;
      otherNodeId: string;
      point: Vector3;
    }

    export const collision = construct<Collision>(Type.Collision);
  
    export interface IntersectionStart {
      type: Type.IntersectionStart;
      nodeId: string;
      otherNodeId: string;
    }

    export const intersectionStart = construct<IntersectionStart>(Type.IntersectionStart);

    export interface IntersectionEnd {
      type: Type.IntersectionEnd;
      nodeId: string;
      otherNodeId: string;
    }

    export const intersectionEnd = construct<IntersectionEnd>(Type.IntersectionEnd);

    export interface Click {
      type: Type.Click;
      nodeId: string;
    }

    export const click = construct<Click>(Type.Click);
  }

  export type Event = (
    Event.Render |
    Event.Collision |
    Event.IntersectionStart |
    Event.IntersectionEnd |
    Event.Click
  );

  export namespace Listener {
    export enum Type {
      Render,
      Collision,
      Intersection,
      Click
    }

    export interface Render {
      type: Type.Render;
      cb: () => void;
    }

    export const render = construct<Render>(Type.Render);
  
    export interface Collision {
      type: Type.Collision;
      nodeId: string;
      filterIds: Set<string>;
      cb: (otherNodeId: string, point: Vector3) => void;
    }

    export const collision = construct<Collision>(Type.Collision);
  
    export interface Intersection {
      type: Type.Intersection;
      nodeId: string;
      filterIds: Set<string>;
      cb: (type: 'start' | 'end', otherNodeId: string) => void;
    }

    export const intersection = construct<Intersection>(Type.Intersection);

    export interface Click {
      type: Type.Click;
      filterIds: Set<string>;
      cb: (nodeId: string) => void;
    }

    export const click = construct<Click>(Type.Click);
  }

  export type Listener = (
    Listener.Render |
    Listener.Collision |
    Listener.Intersection |
    Listener.Click
  );

  export type CachedListener = Omit<Listener.Collision | Listener.Intersection, 'cb' | 'nodeId'>;

  export interface TaggedCachedListener extends CachedListener {
    handle: string;
  }

  export interface ListenerRefCount {
    /**
     * Map of filtered node ids to reference counts.
     */
    filterIds: Dict<number>;
  }

  export namespace TaggedCachedListener {
    export const fromListener = (handle: string, listener: Listener.Collision | Listener.Intersection): TaggedCachedListener => {
      return {
        type: listener.type,
        filterIds: listener.filterIds,
        handle,
      };
    };
  }

  export class ScriptExecution implements ScriptSceneBinding {
    private script_: Script;
    private manager_: ScriptManager;

    private listeners_: Dict<Listener> = {};
    private boundNodeIds_ = new Set<string>();

    private spawnFunc_ = (params: Dict<unknown>, code: string) => {
      const paramNames = Object.keys(params);
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      new Function(paramNames.join(','), `"use strict"; ${code}`)(...paramNames.map(name => params[name]));
    };

    constructor(script: Script, manager: ScriptManager) {
      this.script_ = script;
      this.manager_ = manager;
      
      this.spawnFunc_({
        scene: this,
        Rotation,
        AxisAngle,
        Vector3: RawVector3,
        UnitVector3: Vector3,
        Quaternion,
        ReferenceFrame,
        Distance,
        Mass,
        Angle,
      }, this.script_.code);
    }

    get programStatus() {
      return this.manager_.programStatus;
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
        case Event.Type.Click: {
          this.triggerClick_(event);
          break;
        }
      }
    }

    private triggerRender_(event: Event.Render) {
      for (const listener of Dict.values(this.listeners_)) {
        if (listener.type !== Listener.Type.Render) continue;
        listener.cb();
      }
    }

    private triggerCollision_(event: Event.Collision) {
      for (const listener of Dict.values(this.listeners_)) {
        if (listener.type !== Listener.Type.Collision) continue;
        if (listener.nodeId !== event.nodeId) continue;
        if (listener.filterIds && !listener.filterIds.has(event.otherNodeId)) continue;
        listener.cb(event.otherNodeId, event.point);
      }
    }

    private triggerIntersection_(event: Event.IntersectionStart | Event.IntersectionEnd) {
      for (const listener of Dict.values(this.listeners_)) {
        if (listener.type !== Listener.Type.Intersection) continue;
        if (listener.nodeId !== event.nodeId) continue;
        if (listener.filterIds && !listener.filterIds.has(event.otherNodeId)) continue;
        listener.cb(event.type === Event.Type.IntersectionStart ? 'start' : 'end', event.otherNodeId);
      }
    }

    private triggerClick_(event: Event.Click) {
      for (const listener of Dict.values(this.listeners_)) {
        if (listener.type !== Listener.Type.Click) continue;
        if (listener.filterIds && !listener.filterIds.has(event.nodeId)) continue;
        listener.cb(event.nodeId);
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
      // TODO: This code could be more efficient. We need to unregister the collision and intersection listeners
      // from the parent, but doing it as a single operation would be better.
      for (const handle of Dict.keySet(this.listeners_)) {
        this.removeListener(handle);
      }
      this.boundNodeIds_.clear();
      if (this.onDispose) this.onDispose();
    }

    get nodes(): Dict<Node> {
      return this.manager_.scene.nodes;
    }

    addNode(node: Node, id?: string): string {
      const { onNodeAdd } = this.manager_;
      if (!onNodeAdd) return undefined;

      const resolvedId = id ? id : uuid();

      if (resolvedId in this.manager_.scene.nodes) {
        throw new Error(`Node with id ${resolvedId} already exists`);
      }
      
      onNodeAdd(resolvedId, node);

      return resolvedId;
    }

    removeNode(id: string): void {
      const { onNodeRemove } = this.manager_;
      if (!onNodeRemove) return;

      if (!(id in this.manager_.scene.nodes)) {
        throw new Error(`Node with id ${id} does not exist`);
      }

      onNodeRemove(id);
    }
    
    setNode(id: string, node: Node): void {
      const { onNodeChange } = this.manager_;
      if (!onNodeChange) return;

      if (!(id in this.manager_.scene.nodes)) {
        throw new Error(`Node with id ${id} does not exist`);
      }

      onNodeChange(id, node);
    }

    get geometry(): Dict<Geometry> {
      return this.manager_.scene.geometry;
    }

    addGeometry(geometry: Geometry, id?: string): string {
      const { onGeometryAdd } = this.manager_;
      if (!onGeometryAdd) return undefined;

      const resolvedId = id ? id : uuid();

      if (resolvedId in this.manager_.scene.geometry) {
        throw new Error(`Geometry with id ${resolvedId} already exists`);
      }

      onGeometryAdd(resolvedId, geometry);

      return resolvedId;
    }

    removeGeometry(id: string): void {
      const { onGeometryRemove } = this.manager_;
      if (!onGeometryRemove) return;

      if (!(id in this.manager_.scene.geometry)) {
        throw new Error(`Geometry with id ${id} does not exist`);
      }

      onGeometryRemove(id);
    }
    
    get gravity(): Vector3 {
      return this.manager_.scene.gravity;
    }

    set gravity(gravity: Vector3) {
      const { onGravityChange } = this.manager_;
      if (!onGravityChange) return;
      onGravityChange(gravity);
    }

    get camera(): Camera {
      return this.manager_.scene.camera;
    }

    set camera(camera: Camera) {
      const { onCameraChange } = this.manager_;
      if (!onCameraChange) return;
      onCameraChange(camera);
    }

    get selectedNodeId(): string | null {
      return this.manager_.scene.selectedNodeId;
    }

    set selectedNodeId(nodeId: string | null) {
      const { onSelectedNodeIdChange } = this.manager_;
      if (!onSelectedNodeIdChange) return;
      onSelectedNodeIdChange(nodeId);
    }

    addOnRenderListener(cb: () => void): string {
      const handle = uuid();
      this.listeners_[handle] = Listener.render({ cb });
      return handle;
    }

    addOnCollisionListener(nodeId: string, cb: (otherNodeId: string, point: Vector3) => void, filterIds?: Ids): string {
      const handle = uuid();
      const listener = Listener.collision({ nodeId, cb, filterIds: Ids.toSet(filterIds) });
      this.listeners_[handle] = listener;
      this.manager_.addCollisionRefCounts_(listener);
      return handle;
    }

    addOnIntersectionListener(nodeId: string, cb: (type: 'start' | 'end', otherNodeId: string) => void, filterIds?: Ids): string {
      const handle = uuid();
      const listener = Listener.intersection({ nodeId, cb, filterIds: Ids.toSet(filterIds) });
      this.listeners_[handle] = listener;
      this.manager_.addIntersectionRefCounts_(listener);
      return handle;
    }

    addOnClickListener(filterIds: Ids, cb: (nodeId: string) => void): string {
      const handle = uuid();
      this.listeners_[handle] = Listener.click({ filterIds: Ids.toSet(filterIds), cb });
      return handle;
    }

    removeListener(handle: string): void {
      if (!(handle in this.listeners_)) return;

      const listener = this.listeners_[handle];

      switch (listener.type) {
        case Listener.Type.Collision:
          this.manager_.removeCollisionRefCounts_(listener);
          break;
        case Listener.Type.Intersection:
          this.manager_.removeIntersectionRefCounts_(listener);
          break;
      }
      
      delete this.listeners_[handle];
    }

    onBind?: (nodeId: string) => void;
    onUnbind?: (nodeId: string) => void;
    onDispose?: () => void;

    postTestResult(data: unknown) {
      if (!this.manager_.onPostTestResult) return;
      this.manager_.onPostTestResult(data);
    }

    setChallengeEventValue(eventId: string, value: boolean) {
      if (!this.manager_.onChallengeSetEventValue) return;
      this.manager_.onChallengeSetEventValue(eventId, value);
    }
  }
}

export default ScriptManager;