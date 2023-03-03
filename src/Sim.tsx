import { Engine as BabylonEngine } from '@babylonjs/core/Engines/engine';
import { Scene as BabylonScene } from '@babylonjs/core/scene';
import { Vector3 as BabylonVector3, Quaternion as BabylonQuaternion, Matrix as BabylonMatrix } from '@babylonjs/core/Maths/math.vector';
import { Color3 as BabylonColor3 } from '@babylonjs/core/Maths/math.color';
import { AbstractMesh as BabylonAbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { Node as BabylonNode } from '@babylonjs/core/node';
import { TransformNode as BabylonTransformNode } from '@babylonjs/core/Meshes/transformNode';
import { ShadowLight as BabylonShadowLight } from '@babylonjs/core/Lights/shadowLight';
import { PointLight as BabylonPointLight } from '@babylonjs/core/Lights/pointLight';
import { HemisphericLight as BabylonHemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { EventState as BabylonEventState } from '@babylonjs/core/Misc/observable';
import { PointerEventTypes as BabylonPointerEventTypes, PointerInfo as BabylonPointerInfo } from '@babylonjs/core/Events/pointerEvents';
import { DracoCompression as BabylonDracoCompression } from '@babylonjs/core/Meshes/Compression/dracoCompression';

import '@babylonjs/loaders/glTF';
import '@babylonjs/core/Physics/physicsEngineComponent';

import Dict from './Dict';

import { Quaternion, Vector2, Vector3 } from './math';
import { ReferenceFrame as UnitReferenceFrame, Rotation, Vector3 as UnitVector3 } from './unit-math';
import { Angle } from './util';

import store from './state';
import { Unsubscribe } from 'redux';
import { ScenesAction } from './state/reducer';
import SceneBinding, { SceneMeshMetadata } from './SceneBinding';
import Scene from './state/State/Scene';
import Node from './state/State/Scene/Node';
import { Robots } from './state/State';



let Ammo: unknown;
if (SIMULATOR_HAS_AMMO) {
  // This is on a non-standard path specified in the webpack config.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Ammo = require('ammo.js');
}

import WorkerInstance from './WorkerInstance';
import AbstractRobot from './AbstractRobot';
import LocalizedString from './util/LocalizedString';
import ScriptManager from './ScriptManager';
import Geometry from './state/State/Scene/Geometry';
import Camera from './state/State/Scene/Camera';

export let ACTIVE_SPACE: Space;

export class Space {
  private static instance: Space;

  private initializationPromise: Promise<void>;

  private engine: BabylonEngine;
  private workingCanvas: HTMLCanvasElement;
  private bScene_: BabylonScene;

  private storeSubscription_: Unsubscribe;

  private sceneBinding_: SceneBinding;

  onSelectNodeId?: (nodeId: string) => void;
  onSetNodeBatch?: (setNodeBatch: Omit<ScenesAction.SetNodeBatch, 'type' | 'sceneId'>) => void;
  onNodeAdd?: (nodeId: string, node: Node) => void;
  onNodeRemove?: (nodeId: string) => void;
  onNodeChange?: (nodeId: string, node: Node) => void;
  onGeometryAdd?: (geometryId: string, geometry: Geometry) => void;
  onGeometryRemove?: (geometryId: string) => void;
  onCameraChange?: (camera: Camera) => void;
  onGravityChange?: (gravity: UnitVector3) => void;

  onChallengeSetEventValue?: (eventId: string, value: boolean) => void;


  private debounceUpdate_ = false;
  private sceneSetting_ = false;
  
  private nextScene_: Scene | undefined;
  private scene_ = Scene.EMPTY;

  get sceneBinding() { return this.sceneBinding_; }

  private robotLinkOrigins_: Dict<Dict<UnitReferenceFrame>> = {};
  get robotLinkOrigins() { return this.robotLinkOrigins_; }
  set robotLinkOrigins(robotLinkOrigins: Dict<Dict<UnitReferenceFrame>>) {
    this.robotLinkOrigins_ = robotLinkOrigins;
  }
  
  get scene() { return this.scene_; }
  set scene(scene: Scene) {
    this.scene_ = scene;
    if (this.sceneBinding_) this.sceneBinding_.scriptManager.scene = this.scene_;
    
    if (this.sceneSetting_ || this.debounceUpdate_ || !this.sceneBinding_) {
      if (this.sceneBinding_ && !this.sceneSetting_) this.sceneBinding_.scene = scene;
      if (this.sceneSetting_ && !this.debounceUpdate_) this.nextScene_ = scene;
      return;
    }

    this.sceneSetting_ = true;
    (async () => {
      // Disable physics during scene changes to avoid objects moving before the scene is fully loaded
      this.bScene_.physicsEnabled = false;
     
      await this.sceneBinding_.setScene(scene, Robots.loaded(store.getState().robots));
      while (this.nextScene_) {
        const nextScene = this.nextScene_;
        this.nextScene_ = undefined;
        await this.sceneBinding_.setScene(nextScene, Robots.loaded(store.getState().robots));
      
      }
      this.bScene_.physicsEnabled = true;
    })().finally(() => {
      this.sceneSetting_ = false;
    });
  }

  objectScreenPosition(id: string): Vector2 {
    const mesh = this.bScene_.getMeshByID(id) || this.bScene_.getMeshByName(id);
    if (!mesh) return undefined;

    if (this.engine.views.length <= 0) return undefined;

    const position = mesh.getBoundingInfo().boundingBox.centerWorld;

    const coordinates = BabylonVector3.Project(
      position,
      BabylonMatrix.Identity(),
      this.bScene_.getTransformMatrix(),
      this.sceneBinding_.camera.viewport.toGlobal(
        this.engine.getRenderWidth(),
        this.engine.getRenderHeight(),
      ));
    
    // Assuming the first view is the view of interest
    // If we ever use multiple views, this may break
    const { top, left } = this.engine.views[0].target.getBoundingClientRect();

    return {
      x: coordinates.x + left,
      y: coordinates.y + top
    };
  }

  public static getInstance(): Space {
    if (!Space.instance) {
      Space.instance = new Space();
    }

    return Space.instance;
  }

  // TODO: Find a better way to communicate robot state instead of these callbacks
  private constructor() {
    this.workingCanvas = document.createElement('canvas');

    this.engine = new BabylonEngine(this.workingCanvas, true, { preserveDrawingBuffer: true, stencil: true });
    this.bScene_ = new BabylonScene(this.engine);
    this.bScene_.useRightHandedSystem = true;
    
    ACTIVE_SPACE = this;

    // tell Babylon to load a local Draco decoder
    BabylonDracoCompression.Configuration = {
      decoder: {
        wasmUrl: '/static/draco_wasm_wrapper_gltf.js',
        wasmBinaryUrl: '/static/draco_decoder_gltf.wasm',
        fallbackUrl: '/static/draco_decoder_gltf.js',
      }
    };
  }

  // Returns a promise that will resolve after the scene is fully initialized and the render loop is running
  public ensureInitialized(): Promise<void> {
    if (this.initializationPromise === undefined) {
      this.initializationPromise = new Promise((resolve, reject) => {
        this.createScene()
          .then(() => {
            this.startRenderLoop();
            resolve();
          })
          .catch((e) => {
            console.error('The simulator meshes failed to load', e);
            reject(e);
          });
      });
    }

    return this.initializationPromise;
  }

  public switchContext(canvas: HTMLCanvasElement): void {
    this.sceneBinding_.canvas = canvas;
  }

  private onPointerTap_ = (eventData: BabylonPointerInfo, eventState: BabylonEventState) => {
    if (!eventData.pickInfo.hit) {
      this.onSelectNodeId?.(undefined);
      return;
    }


    const mesh = eventData.pickInfo.pickedMesh;
    const id = (mesh.metadata as SceneMeshMetadata).id;

    this.sceneBinding_.scriptManager.trigger(ScriptManager.Event.click({
      nodeId: id,
    }));

    const prevId = this.scene_.selectedNodeId;
    if (id !== prevId && this.scene_.nodes[id]?.editable) {
      this.onSelectNodeId?.(id);
    } else {
      this.onSelectNodeId?.(undefined);
    }
  };

  private async createScene(): Promise<void> {
    this.bScene_.onPointerObservable.add(this.onPointerTap_, BabylonPointerEventTypes.POINTERTAP);

    const light = new BabylonHemisphericLight('hemispheric_light', new BabylonVector3(0, 1, 0), this.bScene_);
    light.intensity = 0.5;
    light.diffuse = new BabylonColor3(1.0, 1.0, 1.0);

    // At 100x scale, gravity should be -9.8 * 100, but this causes weird jitter behavior
    // Full gravity will be -9.8 * 10
    const gravityVector = new BabylonVector3(0, -9.8 * 50, 0);
    
    const state = store.getState();
    
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
    const ammo: unknown = await (Ammo as any)();
    
    this.sceneBinding_ = new SceneBinding(this.bScene_, ammo);
    this.sceneBinding_.robotLinkOrigins = this.robotLinkOrigins_;

    const scriptManager = this.sceneBinding_.scriptManager;
    scriptManager.onNodeAdd = (id, node) => this.onNodeAdd?.(id, node);
    scriptManager.onNodeRemove = id => this.onNodeRemove?.(id);
    scriptManager.onNodeChange = (id, node) => this.onNodeChange?.(id, node);
    scriptManager.onGeometryAdd = (id, geometry) => this.onGeometryAdd?.(id, geometry);
    scriptManager.onGeometryRemove = id => this.onGeometryRemove?.(id);
    scriptManager.onCameraChange = camera => this.onCameraChange?.(camera);
    scriptManager.onGravityChange = gravity => this.onGravityChange?.(gravity);
    scriptManager.onSelectedNodeIdChange = id => this.onSelectNodeId?.(id);
    scriptManager.onChallengeSetEventValue = (id, value) => this.onChallengeSetEventValue?.(id, value);
    
    this.sceneBinding_.scriptManager.scene = this.scene_;
    await this.sceneBinding_.setScene(this.scene_, Robots.loaded(state.robots));
    
    this.bScene_.getPhysicsEngine().setSubTimeStep(5);

    // (x, z) coordinates of cans around the board
  }

  // Compare Babylon positions with state positions. If they differ significantly, update state
  private updateStore_ = () => {
    const { nodes } = this.scene_;

    const robots = Scene.robots(this.scene_);

    const robotWorkerInstances = Dict.map(robots, () => WorkerInstance);
    const tickOuts = this.sceneBinding_.tick(robotWorkerInstances);

    if (!tickOuts) return;

    const setNodeBatch: Omit<ScenesAction.SetNodeBatch, 'type' | 'sceneId'> = {
      nodeIds: [],
    };

    const tickedIds = Dict.keySet(tickOuts);

    for (const robotId in tickOuts) {
      const tickOut = tickOuts[robotId];
      const robot = nodes[robotId] as Node.Robot;

      robotWorkerInstances[robotId].apply(tickOut.writeCommands);

      setNodeBatch.nodeIds.push({
        id: robotId,
        node: {
          ...robot,
          origin: tickOut.origin,
          state: AbstractRobot.toStateless(robotWorkerInstances[robotId]),
        }
      });
    }

    // Check if nodes have moved significant amounts
    for (const nodeId of Dict.keySet(nodes)) {
      const node = nodes[nodeId];
      const bNode = this.bScene_.getNodeByID(nodeId) || this.bScene_.getNodeByName(node.name[LocalizedString.EN_US]);

      if (tickedIds.has(nodeId)) continue;

      // The node may still be loading
      if (!bNode) continue;

      const origin = node.origin ?? {};
      const nodeOriginChange = this.getSignificantOriginChange(origin, bNode);
      if (nodeOriginChange.position || nodeOriginChange.orientation || nodeOriginChange.scale) {
        const nextOrigin: UnitReferenceFrame = {
          ...node.origin,
          ...nodeOriginChange
        };

        if (this.scene_.selectedNodeId === nodeId) {
          setNodeBatch.nodeIds.push({
            id: nodeId,
            node: {
              ...node,
              startingOrigin: nextOrigin,
              origin: nextOrigin
            },
          });
        } else {
          setNodeBatch.nodeIds.push({
            id: nodeId,
            node: {
              ...node,
              origin: nextOrigin
            },
          });
        }
      }
    }

    // Update state with significant changes, if needed
    this.debounceUpdate_ = true;
    if (setNodeBatch.nodeIds.length > 0) this.onSetNodeBatch?.(setNodeBatch);
    this.debounceUpdate_ = false;
  };

  private getSignificantOriginChange(currentOrigin: UnitReferenceFrame, bNode: BabylonNode): UnitReferenceFrame {
    const change: UnitReferenceFrame = {};

    const position = currentOrigin?.position ?? UnitVector3.zero('meters');
    const rotation = currentOrigin?.orientation ?? Rotation.fromRawQuaternion(Quaternion.IDENTITY, 'euler');

    let bPosition: BabylonVector3;
    let bRotation: BabylonQuaternion;
    if (bNode instanceof BabylonTransformNode || bNode instanceof BabylonAbstractMesh) {
      bPosition = bNode.position;
      bRotation = bNode.rotationQuaternion;
    } else if (bNode instanceof BabylonShadowLight) {
      bPosition = bNode.position;
      bRotation = BabylonQuaternion.Identity();
    } else if (bNode.getClassName() === 'PointLight') {
      const pointLight = bNode as BabylonPointLight;
      bPosition = pointLight.position;
      bRotation = BabylonQuaternion.Identity();
    }

    if (bPosition) {
      const bPositionConv = UnitVector3.fromRaw(Vector3.fromBabylon(bPosition), 'centimeters');
      
      // Distance between the two positions in meters
      const distance = UnitVector3.distance(position, bPositionConv);

      // If varies by more than 0.5cm, consider it a change
      if (distance.value > 0.005) {
        change.position = UnitVector3.toTypeGranular(bPositionConv, position.x.type, position.y.type, position.z.type);
      }
    }

    if (bRotation) {
      const bOrientationConv = Rotation.fromRawQuaternion(Quaternion.fromBabylon(bRotation), 'euler');

      // Angle between the two rotations in radians
      const angle = Rotation.angle(rotation, bOrientationConv);
      const radians = Angle.toRadians(angle);
      
      // If varies by more than 0.5deg, consider it a change
      if (radians.value > 0.00872665) {
        change.orientation = Rotation.toType(bOrientationConv, rotation.type);
      }
    }

    return change;
  }
  
  private startRenderLoop(): void {
    this.engine.runRenderLoop(() => {
      // Post updates to the store
      this.updateStore_();
      this.sceneBinding_.scriptManager.trigger(ScriptManager.Event.RENDER);
      this.bScene_.render();
    });
  }

  public handleResize(): void {
    this.engine.resize();
  }

  set realisticSensors(realisticSensors: boolean) {
    this.sceneBinding_.realisticSensors = realisticSensors;
  }

  set noisySensors(noisySensors: boolean) {
    this.sceneBinding_.noisySensors = noisySensors;
  }
}
