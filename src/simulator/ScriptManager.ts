import Dict from '../util/objectOps/Dict';
import Scene from '../state/State/Scene';
import Camera from '../state/State/Scene/Camera';
import Geometry from '../state/State/Scene/Geometry';
import Node from '../state/State/Scene/Node';
import Script from '../state/State/Scene/Script';
import { RotationwUnits, Vector3wUnits } from '../util/math/unitMath';

import { v4 as uuid } from 'uuid';
import construct from '../util/redux/construct';
import { RawAxisAngle, RawQuaternion, RawReferenceFrame, RawVector3 } from '../util/math/math';
import { Angle, Mass, Distance } from '../util/math/Value';
import { SharedRegistersRobot } from '../programming/SharedRegistersRobot';
import { sceneHasCustomChallengeRuntime } from '../util/customChallengeSceneScripts';
import { isCustomCanPoseChallengeEventId } from '../util/customChallengeGoals';
import { parsePlayAreaEventId } from '../util/playAreaSuccessGoals';


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

  gravity: Vector3wUnits;

  camera: Camera;

  selectedNodeId?: string;

  readonly programStatus: 'running' | 'stopped';

  addOnRenderListener(cb: () => void): string;
  addOnCollisionListener(nodeId: string, cb: (otherNodeId: string, point: Vector3wUnits) => void, filterIds: Ids): string;
  addOnIntersectionListener(nodeId: string, cb: (type: 'start' | 'end', otherNodeId: string) => void, filterIds: Ids): string;
  addOnClickListener(filterIds: Ids, cb: (nodeId: string) => void): string;

  removeListener(handle: string): void;

  onBind?: (nodeId: string) => void;
  onUnbind?: (nodeId: string) => void;
  onDispose?: () => void;

  // Used only for unit tests
  postTestResult: (data: unknown) => void;

  setChallengeEventValue: (eventId: string, value: boolean) => void;

  /** Mat-local cm (x = width, y = length) from live simulator pose. */
  getNodeMatLocal(nodeId: string): { x: number; y: number } | null;

  /** Live world position in centimeters (simulator ground frame). */
  getNodeWorldCm(nodeId: string): { x: number; y: number; z: number } | null;

  /** Live axis-aligned world bounds in centimeters (mat items). */
  getNodeWorldBoundsCm(
    nodeId: string
  ): { min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } } | null;

  /** Horizontal world distance (cm) from robot front to ream center (live meshes). */
  getReamStopNearDistCm(reamNodeId: string): number | null;

  /** True when any robot link volume overlaps the play-area polygon on the mat plane. */
  robotIntersectsPlayZone(polygon: { x: number; y: number }[]): boolean;

  /** Live Y tilt in degrees (0 = horizontal, 90 = upright). Custom runtime mat-item goals. */
  getNodeYAngle(nodeId: string): number;

  /** Live upright check from simulator meshes (preset `nodeUpright` equivalent). */
  getNodeUpright(nodeId: string): boolean;

}

class ScriptManager {
  private scene_: Scene;

  get scene() { return this.scene_; }
  set scene(scene: Scene) { this.scene_ = scene; }

  onNodeAdd?: (id: string, node: Node) => void;
  onNodeRemove?: (id: string) => void;
  onNodeChange?: (id: string, node: Node) => void;

  onGeometryAdd?: (id: string, geometry: Geometry) => void;
  onGeometryRemove?: (id: string) => void;

  onGravityChange?: (gravity: Vector3wUnits) => void;
  onCameraChange?: (camera: Camera) => void;
  onSelectedNodeIdChange?: (id: string) => void;

  onChallengeSetEventValue?: (eventId: string, value: boolean) => void;
  /** Last values passed to setChallengeEventValue this run (avoids redundant challenge updates). */
  private challengeEventValues_: Dict<boolean> = {};
  resolveNodeMatLocal?: (nodeId: string) => { x: number; y: number } | null;
  resolveNodeWorldCm?: (nodeId: string) => { x: number; y: number; z: number } | null;
  resolveNodeWorldBoundsCm?: (
    nodeId: string
  ) => {
    min: { x: number; y: number; z: number };
    max: { x: number; y: number; z: number };
  } | null;
  resolveReamStopNearDistCm?: (reamNodeId: string) => number | null;
  resolveRobotIntersectsPlayZone?: (
    polygon: { x: number; y: number }[]
  ) => boolean;
  resolveNodeYAngle?: (nodeId: string) => number | null;
  resolveNodeUpright?: (nodeId: string) => boolean;
  private programStatus_: 'running' | 'stopped' = 'stopped';
  get programStatus() { return this.programStatus_; }
  set programStatus(status: 'running' | 'stopped') {
    this.programStatus_ = status;
    if (status === 'running') {
      this.challengeEventValues_ = {};
    }
  }

  clearChallengeEventValues(): void {
    this.challengeEventValues_ = {};
  }

  /** Set a challenge event from simulator code (same dedupe as scene scripts). */
  getChallengeEventValue(eventId: string): boolean {
    return this.challengeEventValues_[eventId] ?? false;
  }

  emitChallengeEventValue(eventId: string, value: boolean): void {
    if (!this.onChallengeSetEventValue) return;
    // Custom runtime only: avoid firing saved goals on load (preset scripts self-guard).
    if (
      sceneHasCustomChallengeRuntime(this.scene_) &&
      this.programStatus_ !== 'running' &&
      !isCustomCanPoseChallengeEventId(eventId)
    ) {
      return;
    }
    if (this.challengeEventValues_[eventId] === value) return;
    this.challengeEventValues_[eventId] = value;
    if (sceneHasCustomChallengeRuntime(this.scene_)) {
      if (
        value === true &&
        parsePlayAreaEventId(eventId)?.kind === 'robotNotIntersecting'
      ) {
        console.log('[custom-jbc play-area] emitChallengeEventValue', eventId);
      }
      if (
        value === true &&
        /^can[a-z0-9]+KnockedOver$/i.test(eventId) &&
        !/NotKnockedOver/i.test(eventId)
      ) {
        console.log('[custom-jbc knock-over] emitChallengeEventValue', eventId);
      }
    }
    this.onChallengeSetEventValue(eventId, value);
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

  /** Initialize any scene scripts that are not yet loaded (e.g. customChallengeRuntime). */
  ensureSceneScripts(scene: Scene) {
    const runtimeId = 'customChallengeRuntime' as const;
    const runtimeScript = scene.scripts?.[runtimeId];
    if (runtimeScript) {
      this.set(runtimeId, runtimeScript);
      if (scene.nodes?.robot?.scriptIds?.includes(runtimeId)) {
        this.bind(runtimeId, 'robot');
      }
    }
    for (const scriptId in scene.scripts ?? {}) {
      if (scriptId === runtimeId) continue;
      if (scriptId in this.scriptExecutions_) continue;
      this.set(scriptId, scene.scripts[scriptId]);
    }
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
      point: Vector3wUnits;
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
      cb: (otherNodeId: string, point: Vector3wUnits) => void;
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
        RotationwUnits,
        RawAxisAngle,
        Vector3wUnits: RawVector3,
        UnitVector3: Vector3wUnits,
        RawQuaternion,
        RawReferenceFrame,
        Distance,
        Mass,
        Angle,
        Date,
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

    get gravity(): Vector3wUnits {
      return this.manager_.scene.gravity;
    }

    set gravity(gravity: Vector3wUnits) {
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

    addOnCollisionListener(nodeId: string, cb: (otherNodeId: string, point: Vector3wUnits) => void, filterIds?: Ids): string {
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
      this.manager_.emitChallengeEventValue(eventId, value);
    }

    getNodeMatLocal(nodeId: string): { x: number; y: number } | null {
      if (this.manager_.resolveNodeMatLocal) {
        return this.manager_.resolveNodeMatLocal(nodeId);
      }
      const n = this.nodes[nodeId];
      if (!n?.origin?.position) return null;
      const mat = this.nodes['matA'] || this.nodes['matB'];
      const ox = mat?.origin?.position?.x?.value ?? 0;
      const oz = mat?.origin?.position?.z?.value ?? 0;
      return {
        x: n.origin.position.x.value - ox,
        y: n.origin.position.z.value - oz,
      };
    }

    getNodeWorldCm(nodeId: string): { x: number; y: number; z: number } | null {
      if (this.manager_.resolveNodeWorldCm) {
        return this.manager_.resolveNodeWorldCm(nodeId);
      }
      return null;
    }

    getNodeWorldBoundsCm(
      nodeId: string
    ): {
        min: { x: number; y: number; z: number };
        max: { x: number; y: number; z: number };
      } | null {
      if (this.manager_.resolveNodeWorldBoundsCm) {
        return this.manager_.resolveNodeWorldBoundsCm(nodeId);
      }
      return null;
    }

    getReamStopNearDistCm(reamNodeId: string): number | null {
      if (this.manager_.resolveReamStopNearDistCm) {
        return this.manager_.resolveReamStopNearDistCm(reamNodeId);
      }
      return null;
    }

    robotIntersectsPlayZone(polygon: { x: number; y: number }[]): boolean {
      if (this.manager_.resolveRobotIntersectsPlayZone) {
        return this.manager_.resolveRobotIntersectsPlayZone(polygon);
      }
      return false;
    }

    getNodeYAngle(nodeId: string): number {
      if (this.manager_.resolveNodeYAngle) {
        const y = this.manager_.resolveNodeYAngle(nodeId);
        if (y !== null) return y;
      }
      const n = this.nodes[nodeId];
      const orient = n?.origin?.orientation;
      if (!orient) return 90;
      const q = RotationwUnits.toRawQuaternion(orient);
      const uy = 1 - 2 * (q.x * q.x + q.z * q.z);
      return (180 / Math.PI) * Math.asin(Math.max(-1, Math.min(1, uy)));
    }

    getNodeUpright(nodeId: string): boolean {
      if (this.manager_.resolveNodeUpright) {
        return this.manager_.resolveNodeUpright(nodeId);
      }
      return this.getNodeYAngle(nodeId) > 5;
    }

    getChallengeEventValue(eventId: string): boolean {
      return this.manager_.getChallengeEventValue(eventId);
    }
  }




}

export default ScriptManager;