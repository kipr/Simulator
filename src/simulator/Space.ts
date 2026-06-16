/**
 * Sim.ts is the main entry point for the simulation. It creates the Babylon scene and handles
 * communication between the simulation and the rest of the application.
 * 
 * The simulation is rendered in a loop using the Babylon engine. Each loop, the simulation
 * updates the store with the current state of the simulation. 
 */
import {
  Engine, Vector3, Quaternion, Matrix, HemisphericLight, Color3, AbstractMesh, Mesh,
  TransformNode, PointerInfo, ShadowLight, PointLight, EventState, PointerEventTypes,
  DracoCompression, HavokPlugin, Scene as babylonScene, Node as babylonNode, HighlightLayer
} from "@babylonjs/core";

import HavokPhysics from "@babylonjs/havok";
import '@babylonjs/loaders/glTF';
import '@babylonjs/core/Physics/physicsEngineComponent';

import Dict from '../util/objectOps/Dict';
import { RawQuaternion, RawVector2, RawVector3 } from '../util/math/math';
import { ReferenceFramewUnits, RotationwUnits, Vector3wUnits } from '../util/math/unitMath';
import { Angle } from '../util';
import LocalizedString from '../util/LocalizedString';

import store from '../state';
import { ScenesAction } from '../state/reducer';
import Scene from '../state/State/Scene';
import Node from '../state/State/Scene/Node';
import { Robots } from '../state/State';
import Geometry from '../state/State/Scene/Geometry';
import Camera from '../state/State/Scene/Camera';

import WorkerInstance from '../programming/WorkerInstance';
import AbstractRobot from '../programming/AbstractRobot';
import ScriptManager from './ScriptManager';
import SceneBinding, { SceneMeshMetadata } from './babylonBindings/SceneBinding';
import { getSimulatorViewProjectionMatrix } from '../util/jbcMatPlayArea';
import { safeVector3Project } from '../util/babylonMath';
import {
  sceneHasCustomChallengeRuntime,
  syncCustomChallengePhysicsPosesIntoScriptScene,
} from '../util/customChallengeSceneScripts';
import { flushSync } from 'react-dom';

export let ACTIVE_SPACE: Space;


/**
 * Represents the main simulation space. Manages the rendering and physics of the scene,
 * handles user interactions, and updates the state according to the simulation.
 * 
 * The Space is a singleton, and can be accessed using the static getInstance() method.
 */
export class Space {
  private static instance: Space;

  private initializationPromise: Promise<void>;
  private engine: Engine;
  private workingCanvas: HTMLCanvasElement;
  private bScene_: babylonScene;
  private hl?: HighlightLayer;
  private sceneBinding_: SceneBinding;
  private nextScene_: Scene | undefined;
  private gizmosEnabled_ = true;

  onSelectNodeId?: (nodeId: string) => void;
  onSetNodeBatch?: (setNodeBatch: Omit<ScenesAction.SetNodeBatch, 'type' | 'sceneId'>) => void;
  onNodeAdd?: (nodeId: string, node: Node) => void;
  onNodeRemove?: (nodeId: string) => void;
  onNodeChange?: (nodeId: string, node: Node) => void;
  onGeometryAdd?: (geometryId: string, geometry: Geometry) => void;
  onGeometryRemove?: (geometryId: string) => void;
  onCameraChange?: (camera: Camera) => void;
  onGravityChange?: (Vector3wUnits) => void;
  onChallengeSetEventValue?: (eventId: string, value: boolean) => void;
  /** Fires after the simulator finishes applying a scene (scripts/nodes ready). */
  onAfterSceneApplied?: (scene: Scene) => void;
  onObjectClick?: (object: { id: string, pos: Vector3 }) => void;


  private debounceUpdate_ = false;
  private sceneSetting_ = false;
  /** False until SimulatorArea registers the visible canvas (avoids render/sensor work on a headless context). */
  private displayCanvasReady_ = false;
  private pendingDisplayCanvas_: HTMLCanvasElement | undefined;
  private robotLinkOrigins_: Dict<Dict<ReferenceFramewUnits>> = {};
  private scene_ = Scene.EMPTY;

  // TODO: Find a better way to communicate robot state instead of these callbacks
  private constructor() {
    this.workingCanvas = document.createElement('canvas');

    this.engine = new Engine(this.workingCanvas, true, { preserveDrawingBuffer: true, stencil: true });
    this.bScene_ = new babylonScene(this.engine);
    this.bScene_.useRightHandedSystem = true;
    // this.hl = new HighlightLayer('highlight', this.bScene_);

    ACTIVE_SPACE = this;

    DracoCompression.Configuration = {
      decoder: {
        wasmUrl: '/static/draco_wasm_wrapper_gltf.js',
        wasmBinaryUrl: '/static/draco_decoder_gltf.wasm',
        fallbackUrl: '/static/draco_decoder_gltf.js',
      }
    };
  }

  public static getInstance(): Space {
    if (!Space.instance) Space.instance = new Space();
    return Space.instance;
  }

  public highlight(id: string, idx = 0) {
    if (!this.hl) {
      this.hl = new HighlightLayer('highlighter', this.bScene_);
    }

    const meshes = this.bScene_.getMeshesById(id) as Mesh[];
    const mesh = meshes[idx];
    if (!mesh) return;
    this.hl.addMesh(mesh, new Color3(0.45, 0.8, 0.7));
  }

  public unhighlight(id: string, idx = 0) {
    if (!this.hl) {
      return;
    }

    const meshes = this.bScene_.getMeshesById(id) as Mesh[];
    const mesh = meshes[idx];
    if (!mesh) return;
    this.hl.removeMesh(mesh);
  }

  public clearHighlights() {
    if (!this.hl) return;
    this.hl.dispose();
    this.hl = undefined;
  }

  private sceneWithCustomChallengeRobotStartingOrigins_(scene: Scene): Scene {
    if (!sceneHasCustomChallengeRuntime(scene)) return scene;

    let nodes = scene.nodes;
    let changed = false;
    for (const robotId of Dict.keySet(Scene.robots(scene))) {
      const robot = nodes[robotId];
      if (!robot?.startingOrigin || robot.origin === robot.startingOrigin) continue;
      changed = true;
      nodes = {
        ...nodes,
        [robotId]: {
          ...robot,
          origin: {
            position: robot.startingOrigin.position,
            orientation: robot.startingOrigin.orientation,
            scale: robot.startingOrigin.scale,
          },
        },
      };
    }

    return changed ? { ...scene, nodes } : scene;
  }

  /**
   * Getters and Setters
   */
  get sceneBinding() { return this.sceneBinding_; }

  get robotLinkOrigins() { return this.robotLinkOrigins_; }
  set robotLinkOrigins(robotLinkOrigins: Dict<Dict<ReferenceFramewUnits>>) {
    this.robotLinkOrigins_ = robotLinkOrigins;
  }
  set realisticSensors(realisticSensors: boolean) {
    this.sceneBinding_.realisticSensors = realisticSensors;
  }

  set noisySensors(noisySensors: boolean) {
    this.sceneBinding_.noisySensors = noisySensors;
  }

  set gizmosEnabled(gizmosEnabled: boolean) {
    this.gizmosEnabled_ = gizmosEnabled;
    if (!this.sceneBinding_) return;
    this.sceneBinding_.gizmosEnabled = gizmosEnabled;
  }

  get scene() { return this.scene_; }

  set scene(scene: Scene) {
    const sceneToApply = this.sceneWithCustomChallengeRobotStartingOrigins_(scene);
    this.scene_ = sceneToApply;
    if (this.sceneBinding_) {
      this.sceneBinding_.scriptManager.scene = this.scene_;
    }

    // sceneSetting_ is true if we are currently setting the scene
    // debounceUpdate_ is true if we are currently updating the store
    if (this.sceneSetting_ || this.debounceUpdate_ || !this.sceneBinding_) {
      if (this.sceneBinding_ && !this.sceneSetting_) {
        this.sceneBinding_.scene = sceneToApply;
      }
      if (this.sceneSetting_ && !this.debounceUpdate_) {
        this.nextScene_ = sceneToApply;
      }
      return;
    }

    this.sceneSetting_ = true;
    (async () => {
      // Disable physics during scene changes to avoid objects moving before the scene is fully loaded
      this.bScene_.physicsEnabled = false;
      try {
        await this.sceneBinding_.setScene(sceneToApply, Robots.loaded(store.getState().robots));
        while (this.nextScene_) {
          const nextScene = this.nextScene_;
          this.nextScene_ = undefined;
          await this.sceneBinding_.setScene(nextScene, Robots.loaded(store.getState().robots));
        }
      } finally {
        this.bScene_.physicsEnabled = true;
      }
    })().finally(() => {
      this.sceneSetting_ = false;
      this.onAfterSceneApplied?.(this.scene_);
    });
  }

  /** Align in-memory simulator scene state with Redux without reloading Babylon. */
  replaceSceneState(scene: Scene): void {
    this.scene_ = scene;
    if (!this.sceneBinding_) return;
    this.sceneBinding_.scene = scene;
    this.sceneBinding_.scriptManager.scene = scene;
  }

  syncSelectedNodeFromScene(scene: Scene): void {
    if (!this.sceneBinding_) {
      this.scene_ = scene;
      return;
    }
    this.sceneBinding_.syncSelectedNodeFromScene(scene);
    this.scene_ = scene;
  }

  /**
   * Handles window resize events, updating the Babylon engine's size accordingly.
   */
  public handleResize(): void {
    this.engine.resize();
  }

  public tourClickObject(id: string): void {
    const mesh = this.bScene_.getMeshById(id) || this.bScene_.getMeshByName(id);
    if (!mesh) return;
  }


  /**
   * Retrieves the screen position of an object in the scene.
   * @param id - The ID or name of the object.
   * @returns The screen position of the object as a RawVector2 object, or undefined if the object is not found or if there are no views.
   */
  objectScreenPosition(id: string): RawVector2 {
    const mesh = this.bScene_.getMeshById(id) || this.bScene_.getMeshByName(id);
    if (!mesh) return undefined;

    if (this.engine.views.length <= 0) return undefined;

    const position = mesh.getBoundingInfo().boundingBox.centerWorld;

    const camera = this.sceneBinding_.camera ?? this.bScene_.activeCamera;
    if (!camera) return undefined;
    const transformMatrix = getSimulatorViewProjectionMatrix(camera, this.bScene_);
    if (!transformMatrix) return undefined;

    const coordinates = safeVector3Project(
      position,
      transformMatrix,
      camera.viewport.toGlobal(
        this.engine.getRenderWidth(),
        this.engine.getRenderHeight(),
      )
    );
    if (!coordinates) return undefined;

    // Assuming the first view is the view of interest. If we ever use multiple views, this may break
    const { top, left } = this.engine.views[0].target.getBoundingClientRect();

    return {
      x: coordinates.x + left,
      y: coordinates.y + top
    };
  }


  /**
   * Ensures that the Space instance is fully initialized and the render loop is running.
   * @returns A promise that resolves once the initialization is complete.
   */
  public ensureInitialized(): Promise<void> {
    if (this.initializationPromise === undefined) {
      this.initializationPromise = new Promise((resolve, reject) => {
        this.createScene()
          .then(() => {
            this.startRenderLoop();
            resolve();
          })
          .catch((e) => {
            reject(e);
          });
      });
    }

    return this.initializationPromise;
  }


  /**
   * Switches the rendering context to a different canvas.
   * @param canvas - The new HTML canvas element to switch to.
   */
  public switchContext(canvas: HTMLCanvasElement): void {
    this.pendingDisplayCanvas_ = canvas;
    if (!this.sceneBinding_) return;
    this.sceneBinding_.canvas = canvas;
    this.displayCanvasReady_ = true;
  }

  get isDisplayCanvasReady(): boolean {
    return this.displayCanvasReady_ && !!this.sceneBinding_?.canvas;
  }


  /**
   * Handles the pointer tap event and selects the corresponding node in the scene.
   * @param eventData - The pointer event data.
   * @param eventState - The state of the event.
   */
  private onPointerTap_ = (eventData: PointerInfo, eventState: EventState) => {
    if (!eventData.pickInfo.hit) {
      this.onSelectNodeId?.(undefined);
      return;
    }


    const mesh = eventData.pickInfo.pickedMesh;
    const id = (mesh?.metadata as SceneMeshMetadata | undefined)?.id;
    if (!id) {
      this.onSelectNodeId?.(undefined);
      return;
    }

    this.sceneBinding_.scriptManager.trigger(ScriptManager.Event.click({
      nodeId: id,
    }));

    const prevId = this.scene_.selectedNodeId;
    if (id !== prevId && this.scene_.nodes[id]?.editable) {
      this.onSelectNodeId?.(id);
    } else {
      this.onSelectNodeId?.(undefined);
    }
    if (this.onObjectClick) {
      this.onObjectClick({ id, pos: mesh.position });
    }
  };
  public setOnObjectClick = (
    cb: ((object: { id: string; pos: Vector3 }) => void) | undefined
  ): void => {
    this.onObjectClick = cb;
  };

  /**
 * Calculates significant changes in origin (position and orientation) of a node.
 * @param currentOrigin - The current reference frame origin.
 * @param bNode - The Babylon node representing the object in the scene.
 * @returns An object representing the significant changes in origin.
 */
  private getSignificantOriginChange(currentOrigin: ReferenceFramewUnits, bNode: babylonNode): ReferenceFramewUnits {
    const change: ReferenceFramewUnits = {};

    const position = currentOrigin?.position ?? Vector3wUnits.zero('meters');
    const rotation = currentOrigin?.orientation ?? RotationwUnits.fromRawQuaternion(RawQuaternion.IDENTITY, 'euler');

    let bPosition: Vector3;
    let bRotation: Quaternion;
    if (bNode instanceof TransformNode || bNode instanceof AbstractMesh) {
      bPosition = bNode.position;
      bRotation = bNode.rotationQuaternion;
    } else if (bNode instanceof ShadowLight) {
      bPosition = bNode.position;
      bRotation = Quaternion.Identity();
    } else if (bNode.getClassName() === 'PointLight') {
      const pointLight = bNode as PointLight;
      bPosition = pointLight.position;
      bRotation = Quaternion.Identity();
    }

    if (bPosition) {
      const bPositionConv = Vector3wUnits.fromRaw(RawVector3.fromBabylon(bPosition), 'centimeters');

      // Distance between the two positions in meters
      const distance = Vector3wUnits.distance(position, bPositionConv);

      // If varies by more than 0.5cm, consider it a change
      if (distance.value > 0.0025) {
        change.position = Vector3wUnits.toTypeGranular(bPositionConv, position.x.type, position.y.type, position.z.type);
      }
    }

    // Custom challenges only: physics-tipped cans need world rotation for nodeUpright().
    // Preset JBC keeps local rotationQuaternion (unchanged above).
    if (
      bNode instanceof TransformNode ||
      bNode instanceof AbstractMesh
    ) {
      const sm = this.sceneBinding_?.scriptManager;
      const customRuntime =
        !!sm &&
        sceneHasCustomChallengeRuntime(sm.scene) &&
        sm.programStatus === 'running';
      if (customRuntime) {
        try {
          bNode.computeWorldMatrix(true);
          const worldMatrix = bNode.getWorldMatrix();
          const scale = new Vector3();
          const worldRot = new Quaternion();
          const pos = new Vector3();
          worldMatrix.decompose(scale, worldRot, pos);
          bRotation = worldRot;
        } catch {
          // keep preset-local bRotation
        }
      }
    }

    if (bRotation) {
      const bOrientationConv = RotationwUnits.fromRawQuaternion(RawQuaternion.fromBabylon(bRotation), 'euler');

      // Angle between the two rotations in radians
      const angle = RotationwUnits.angle(rotation, bOrientationConv);
      const radians = Angle.toRadians(angle);

      // If varies by more than 0.5deg, consider it a change
      if (radians.value > 0.00872665) {
        change.orientation = RotationwUnits.toType(bOrientationConv, rotation.type);
      }
    }

    return change;
  }

  /**
   * Creates and initializes the Babylon scene, lighting, physics, and other components.
   * @returns A promise that resolves when the scene is fully created.
   */
  private async createScene(): Promise<void> {
    this.bScene_.onPointerObservable.add(this.onPointerTap_, PointerEventTypes.POINTERTAP);

    const light = new HemisphericLight('hemispheric_light', new Vector3(0, 1, 0), this.bScene_);
    light.intensity = 0.5;
    light.diffuse = new Color3(1.0, 1.0, 1.0);

    const state = store.getState();
    const havokInstance = await HavokPhysics();
    const havokPlugin = new HavokPlugin(true, havokInstance);

    this.sceneBinding_ = new SceneBinding(this.bScene_, havokPlugin);
    this.sceneBinding_.robotLinkOrigins = this.robotLinkOrigins_;
    this.sceneBinding_.gizmosEnabled = this.gizmosEnabled_;
    if (this.pendingDisplayCanvas_) {
      this.sceneBinding_.canvas = this.pendingDisplayCanvas_;
      this.displayCanvasReady_ = true;
    }

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

    this.bScene_.getPhysicsEngine().setSubTimeStep(1);

  }

  /**
   * Updates the application state based on the current state of the simulation.
   */
  private updateStore_ = () => {
    if (!this.displayCanvasReady_ || !this.sceneBinding_?.canvas) {
      return;
    }

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

    const sm = this.sceneBinding_.scriptManager;
    const customRuntime =
      sceneHasCustomChallengeRuntime(sm.scene) && sm.programStatus === 'running';

    // Check if nodes have moved significant amounts
    for (const nodeId of Dict.keySet(nodes)) {
      const node = nodes[nodeId];
      const bNode = customRuntime
        ? this.sceneBinding_?.meshForSceneNodeId(nodeId) ??
          this.bScene_.getNodeById(nodeId) ??
          this.bScene_.getNodeByName(node.name[LocalizedString.EN_US])
        : this.bScene_.getNodeById(nodeId) ??
          this.bScene_.getNodeByName(node.name[LocalizedString.EN_US]);

      if (tickedIds.has(nodeId)) continue;

      // The node may still be loading
      if (!bNode) continue;

      const origin = node.origin ?? {};
      const nodeOriginChange = this.getSignificantOriginChange(origin, bNode);
      if (nodeOriginChange.position || nodeOriginChange.orientation || nodeOriginChange.scale) {
        const nextOrigin: ReferenceFramewUnits = {
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

    this.debounceUpdate_ = true;
    if (setNodeBatch.nodeIds.length > 0 && this.onSetNodeBatch) {
      flushSync(() => this.onSetNodeBatch?.(setNodeBatch));
    }
    this.debounceUpdate_ = false;
  };


  /**
   * Starts the Babylon engine's render loop, updating the store and rendering the scene.
   */
  private startRenderLoop(): void {
    this.engine.runRenderLoop(() => {
      if (!this.displayCanvasReady_ || !this.sceneBinding_?.canvas) {
        return;
      }
      try {
        this.updateStore_();
        const scriptScene = this.sceneBinding_.scriptManager.scene;
        if (
          sceneHasCustomChallengeRuntime(scriptScene) &&
          this.sceneBinding_.scriptManager.programStatus === 'running'
        ) {
          syncCustomChallengePhysicsPosesIntoScriptScene(
            this.sceneBinding_,
            scriptScene
          );
        }
        this.sceneBinding_.scriptManager.trigger(ScriptManager.Event.RENDER);
        this.bScene_.render();
      } catch (e) {
        console.error('[Space] render loop error', e);
      }
    });
  }
}
