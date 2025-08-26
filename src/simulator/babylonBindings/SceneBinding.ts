
import {
  PhysicsShapeType, IPhysicsCollisionEvent, IPhysicsEnginePluginV2,
  TransformNode, AbstractMesh, Mesh, PhysicsViewer, ShadowGenerator, Vector3, StandardMaterial, GizmoManager,
  ArcRotateCamera, PointLight, SpotLight, DirectionalLight, PBRMaterial, EngineView,
  Scene as babylonScene, Node as babylonNode, Camera as babylCamera, Material as babylMaterial,
  Observer, BoundingBox, PhysicsShapeParameters, PhysicShapeOptions, PhysicsShape, PhysicsBody, PhysicsMotionType, Quaternion, HighlightLayer, Color3,
} from '@babylonjs/core';

// eslint-disable-next-line @typescript-eslint/no-duplicate-imports -- Required import for side effects
import '@babylonjs/core/Engines/Extensions/engine.views';
import '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent';

import Dict from "../../util/objectOps/Dict";
import { RawQuaternion, RawVector3 } from "../../util/math/math";
import Scene from "../../state/State/Scene";
import Camera from "../../state/State/Scene/Camera";
import Geometry from "../../state/State/Scene/Geometry";
import Node from "../../state/State/Scene/Node";
import Patch from "../../util/redux/Patch";

import { ReferenceFramewUnits, RotationwUnits, Vector3wUnits } from "../../util/math/unitMath";
import { Distance, Mass, SetOps } from "../../util";
import Material from '../../state/State/Scene/Material';
import { preBuiltTemplates } from "../definitions/nodes";
import RobotBinding from './RobotBinding';
import Robot from '../../state/State/Robot';
import AbstractRobot from '../../programming/AbstractRobot';
import WorkerInstance from "../../programming/WorkerInstance";
import LocalizedString from '../../util/LocalizedString';
import ScriptManager from '../ScriptManager';
import { RENDER_SCALE } from '../../components/constants/renderConstants';

import { createMaterial, updateMaterialBasic, updateMaterialPbr } from './createSceneObjects/createMaterials';
import { createDirectionalLight, createPointLight, createSpotLight } from './createSceneObjects/createLights';
import { createCamera } from './createSceneObjects/createCameras';
import { createObject, createEmpty } from './createSceneObjects/createObjects';
import apply from './Apply';

export type FrameLike = TransformNode | AbstractMesh;

export interface SceneMeshMetadata {
  id: string;
  selected?: boolean;
}

class SceneBinding {
  private bScene_: babylonScene;
  get bScene() { return this.bScene_; }

  private root_: TransformNode;
  get root() { return this.root_; }

  private scene_: Scene;
  get scene() { return this.scene_; }
  set scene(s: Scene) { this.scene_ = s; }

  private nodes_: Dict<babylonNode> = {};

  private shadowGenerators_: Dict<ShadowGenerator> = {};
  private physicsViewer_: PhysicsViewer;

  private camera_: babylCamera;

  private engineView_: EngineView;

  private robots_: Dict<Robot>;
  private robotBindings_: Dict<RobotBinding> = {};

  private scriptManager_ = new ScriptManager();
  get scriptManager() { return this.scriptManager_; }

  get camera() { return this.camera_; }

  private canvas_: HTMLCanvasElement;

  get canvas() { return this.canvas_; }

  set canvas(canvas: HTMLCanvasElement) {
    this.canvas_ = canvas;

    // Stop the context menu from opening in some web browsers
    canvas.oncontextmenu = (e) => {
      e.preventDefault();
    };
    const engine = this.bScene_.getEngine();
    if (this.engineView_) engine.unRegisterView(this.engineView_.target);
    this.engineView_ = engine.registerView(this.canvas_);

    this.bScene_.detachControl();
    engine.inputElement = this.canvas_ as unknown as HTMLElement;
    this.camera_.attachControl(this.engineView_.target, true);
    this.bScene_.attachControl();

  }

  /**
   * `declineTicks` is used for a race between initial robot origin setting and tick origin updates.
   * When this is true, the tick() method will exit immediately and return undefined.
   */
  private declineTicks_ = false;

  private materialIdIter_ = 0;

  constructor(bScene: babylonScene, physics: IPhysicsEnginePluginV2) {
    this.bScene_ = bScene;
    this.scene_ = Scene.EMPTY;

    // Gravity is currently set at 5x, which seems to be a sweet spot for realism and joint performance
    const gravityVector = new Vector3(0, -9.8 * 5, 0); // -9.81
    this.bScene_.enablePhysics(gravityVector, physics);

    // The sub time step is incredibly important for physics realism. 1 seems to work well.
    this.bScene_.getPhysicsEngine().setSubTimeStep(1);

    // Uncomment this to turn on the physics viewer for objects
    // this.physicsViewer_ = new PhysicsViewer(this.bScene_);

    this.root_ = new TransformNode('__scene_root__', this.bScene_);
    this.gizmoManager_ = new GizmoManager(this.bScene_);

    this.camera_ = createCamera(Camera.NONE, this.bScene_);

    // Gizmos are the little arrows that appear when you select an object
    this.gizmoManager_.positionGizmoEnabled = true;
    this.gizmoManager_.gizmos.positionGizmo.scaleRatio = 1.25;
    this.gizmoManager_.rotationGizmoEnabled = true;
    this.gizmoManager_.scaleGizmoEnabled = false;
    this.gizmoManager_.usePointerToAttachGizmos = false;
    // this.gizmoManager_.boundingBoxGizmoEnabled = true;
    // this.gizmoManager_.gizmos.boundingBoxGizmo.setColor(new Color3(1, 0, 0));


    this.scriptManager_.onCollisionFiltersChanged = this.onCollisionFiltersChanged_;
    this.scriptManager_.onIntersectionFiltersChanged = this.onIntersectionFiltersChanged_;



  }

  private robotLinkOrigins_: Dict<Dict<ReferenceFramewUnits>> = {};

  set robotLinkOrigins(robotLinkOrigins: Dict<Dict<ReferenceFramewUnits>>) {
    this.robotLinkOrigins_ = robotLinkOrigins;
  }

  get currentRobotLinkOrigins(): Dict<Dict<ReferenceFramewUnits>> {
    // iterate over all robots
    const ret: Dict<Dict<ReferenceFramewUnits>> = {};
    for (const robotId in this.robotBindings_) {
      const robotBinding = this.robotBindings_[robotId];
      ret[robotId] = robotBinding.linkOrigins;
    }
    return ret;
  }

  private findBNode_ = (id?: string, defaultToRoot?: boolean): babylonNode => {
    if (id === undefined && defaultToRoot) return this.root_;
    if (id !== undefined && !(id in this.nodes_)) throw new Error(`${id} doesn't exist`);
    return this.nodes_[id];
  };


  private updateMaterial_ = (bMaterial: babylMaterial, material: Patch<Material>) => {
    switch (material.type) {
      case Patch.Type.OuterChange: {
        const { next } = material;
        const id = bMaterial ? `${bMaterial.id}` : `Scene Material ${this.materialIdIter_++}`;
        if (bMaterial) bMaterial.dispose();
        if (next) {
          return createMaterial(id, next, this.bScene_);
        }
        return null;
      }
      case Patch.Type.InnerChange: {
        const { inner, next } = material;
        switch (next.type) {
          case 'basic': {
            return updateMaterialBasic(bMaterial as StandardMaterial, inner as Patch.InnerPatch<Material.Basic>, this.bScene_);
          }
          case 'pbr': {
            return updateMaterialPbr(bMaterial as PBRMaterial, inner as Patch.InnerPatch<Material.Pbr>, this.bScene_);
          }
        }
        break;
      }
    }

    return bMaterial;
  };

  // Create Robot Binding
  private createRobot_ = async (id: string, node: Node.Robot): Promise<RobotBinding> => {
    // This should probably be somewhere else, but it ensures this is called during
    // initial instantiation and when a new scene is loaded.
    WorkerInstance.sync(node.state);

    const robotBinding = new RobotBinding(this.bScene_, this.physicsViewer_);

    const robot = this.robots_[node.robotId];
    if (!robot) {
      throw new Error(`Robot by id "${node.robotId}" not found`);
    }
    await robotBinding.setRobot(node, robot, id);
    // robotBinding.linkOrigins = this.robotLinkOrigins_[id] || {};

    robotBinding.visible = true;
    const observerObj: { observer: Observer<babylonScene> } = { observer: null };

    robotBinding.origin = node.origin;

    this.declineTicks_ = true;
    observerObj.observer = this.bScene_.onAfterRenderObservable.add((data, state) => {
      const node = this.scene_.nodes[id];
      if (!node) {
        observerObj.observer.unregisterOnNextCall = true;
        this.declineTicks_ = false;
        return;
      }

      const { origin, visible } = node;

      const linkOrigins = this.robotLinkOrigins_[id];
      // if (linkOrigins) robotBinding.linkOrigins = linkOrigins;

      robotBinding.visible = visible ?? false;
      observerObj.observer.unregisterOnNextCall = true;
      this.declineTicks_ = false;
    });

    this.robotBindings_[id] = robotBinding;

    this.syncCollisionFilters_();

    return robotBinding;
  };

  private createNode_ = async (id: string, node: Node, nextScene: Scene): Promise<babylonNode> => {
    let nodeToCreate: Node = node;

    // Resolve template nodes into non-template nodes by looking up the template by ID
    if (node.type === 'from-jbc-template' ||
      node.type === 'from-rock-template' ||
      node.type === 'from-space-template' ||
      node.type === 'from-bb-template') {
      const nodeTemplate = preBuiltTemplates[node.templateId];
      if (!nodeTemplate) {
        console.warn('template node has invalid template ID:', node.templateId);
        return null;
      }

      nodeToCreate = {
        ...node,
        ...nodeTemplate,
      };
    }

    for (const scriptId of nodeToCreate.scriptIds || []) this.scriptManager_.bind(scriptId, id);

    let ret: babylonNode;
    switch (nodeToCreate.type) {
      case 'object': {
        const parent = this.findBNode_(nodeToCreate.parentId, true);

        ret = await createObject(nodeToCreate, nextScene, parent, this.bScene_);
        break;
      }
      case 'empty': {
        const parent = this.findBNode_(nodeToCreate.parentId, true);
        ret = createEmpty(nodeToCreate, parent, this.bScene_); break;
      }
      case 'directional-light': ret = createDirectionalLight(id, nodeToCreate, this.bScene_, this.shadowGenerators_); break;
      case 'spot-light': ret = createSpotLight(id, nodeToCreate, this.bScene_, this.shadowGenerators_); break;
      case 'point-light': ret = createPointLight(id, nodeToCreate, this.bScene_, this.shadowGenerators_); break;
      case 'robot': await this.createRobot_(id, nodeToCreate); break;
      default: {
        console.warn('invalid node type for create node:', nodeToCreate.type);
        return null;
      }
    }

    if (!ret) return null;

    this.updateNodePosition_(nodeToCreate, ret, id, nextScene);
    ret.id = id;

    ret.metadata = { id } as SceneMeshMetadata;

    if (ret instanceof AbstractMesh || ret instanceof TransformNode) {
      apply(ret, m => {
        m.metadata = { id } as SceneMeshMetadata;
        this.restorePhysicsToObject(m, nodeToCreate as Node.Obj, null, nextScene);
      });
    }

    return ret;
  };

  private updateNodePosition_ = (node: Node, bNode: babylonNode, nodeId: string, scene: Scene) => {
    // if (node.origin && bNode instanceof TransformNode || bNode instanceof AbstractMesh) {
    if (node.origin && bNode instanceof AbstractMesh) {
      this.removePhysicsFromObject(bNode);

      const origin = node.origin || {};
      const position: Vector3wUnits = origin.position ?? Vector3wUnits.zero();
      const orientation: RotationwUnits = origin.orientation ?? RotationwUnits.EulerwUnits.identity();
      const scale = origin.scale ?? RawVector3.ONE;

      // bNode.position.set(
      //   Distance.toCentimetersValue(position.x || Distance.centimeters(0)),
      //   Distance.toCentimetersValue(position.y || Distance.centimeters(0)),
      //   Distance.toCentimetersValue(position.z || Distance.centimeters(0))
      // );
      bNode.position.x = Distance.toCentimetersValue(position.x || Distance.centimeters(0));
      bNode.position.y = Distance.toCentimetersValue(position.y || Distance.centimeters(0));
      bNode.position.z = Distance.toCentimetersValue(position.z || Distance.centimeters(0));

      bNode.rotationQuaternion = RawQuaternion.toBabylon(RotationwUnits.toRawQuaternion(orientation));

      bNode.scaling.set(scale.x, scale.y, scale.z);

      this.restorePhysicsToObject(bNode, node as Node.Obj, nodeId, scene);
    }
  };



  private updateEmpty_ = (id: string, node: Patch.InnerChange<Node.Empty>): TransformNode => {
    const bNode = this.findBNode_(id) as TransformNode;

    if (node.inner.name.type === Patch.Type.OuterChange) {
      bNode.name = node.inner.name.next[LocalizedString.EN_US];
    }

    if (node.inner.parentId.type === Patch.Type.OuterChange) {
      const parent = this.findBNode_(node.inner.parentId.next, true);
      bNode.setParent(parent);
    }

    if (node.inner.origin.type === Patch.Type.OuterChange) {
      this.updateNodePosition_(node.next, bNode, id, this.scene);
    }

    return bNode;
  };

  private findMaterial_ = (frameLike: FrameLike) => {
    if (frameLike instanceof AbstractMesh) {
      return frameLike.material;
    }

    const children = frameLike.getChildren(o => o instanceof AbstractMesh);
    if (children && children.length > 0) {
      return (children[0] as AbstractMesh).material;
    }

    return null;
  };

  // Patch changes to an object
  private updateObject_ = async (id: string, node: Patch.InnerChange<Node.Obj>, nextScene: Scene): Promise<FrameLike> => {
    const bNode = this.findBNode_(id) as FrameLike;

    // If the object's geometry ID changes, recreate the object entirely
    if (node.inner.geometryId.type === Patch.Type.OuterChange) {
      this.destroyNode_(id);
      return (await this.createNode_(id, node.next, nextScene)) as FrameLike;
    }

    if (node.inner.name.type === Patch.Type.OuterChange) {
      bNode.name = node.inner.name.next[LocalizedString.EN_US];
    }

    if (node.inner.parentId.type === Patch.Type.OuterChange) {
      const parent = this.findBNode_(node.inner.parentId.next, true);
      bNode.setParent(parent);
    }

    let bMaterial = this.findMaterial_(bNode);
    bMaterial = this.updateMaterial_(bMaterial, node.inner.material);
    apply(bNode, m => {
      m.material = bMaterial;
    });



    // TODO: Handle changes to faceUvs when we fully support it
    if (node.inner.origin.type === Patch.Type.OuterChange) {
      this.updateNodePosition_(node.next, bNode, id, nextScene);
    }

    if (node.inner.physics.type === Patch.Type.OuterChange) {
      apply(bNode, m => {
        this.removePhysicsFromObject(m);
        this.restorePhysicsToObject(m, node.next, id, nextScene);
      });
    }

    if (node.inner.visible.type === Patch.Type.OuterChange) {
      const nextVisible = node.inner.visible.next;
      apply(bNode, m => {
        m.isVisible = nextVisible;

        // Create/remove physics for object becoming visible/invisible
        if (!nextVisible) {
          this.removePhysicsFromObject(m);
        } else {
          this.restorePhysicsToObject(m, node.next, id, nextScene);
        }
      });
    }
    return Promise.resolve(bNode);
  };

  private updateDirectionalLight_ = (id: string, node: Patch.InnerChange<Node.DirectionalLight>): DirectionalLight => {
    const bNode = this.findBNode_(id) as DirectionalLight;

    // NYI

    return bNode;
  };

  private updateSpotLight_ = (id: string, node: Patch.InnerChange<Node.SpotLight>): SpotLight => {
    const bNode = this.findBNode_(id) as SpotLight;

    // NYI

    return bNode;
  };

  private updatePointLight_ = (id: string, node: Patch.InnerChange<Node.PointLight>): PointLight => {
    const bNode = this.findBNode_(id) as PointLight;

    if (node.inner.visible.type === Patch.Type.OuterChange) {
      bNode.setEnabled(node.inner.visible.next);
    }

    return bNode;
  };

  private updateRobot_ = async (id: string, node: Patch.InnerChange<Node.Robot>): Promise<RobotBinding> => {
    const robotBinding = this.robotBindings_[id];
    if (!robotBinding) throw new Error(`Robot binding not found for id "${id}"`);

    if (node.inner.robotId.type === Patch.Type.OuterChange) {
      this.destroyNode_(id);
      return this.createRobot_(id, node.next);
    }

    if (node.inner.origin.type === Patch.Type.OuterChange) {
      robotBinding.origin = node.inner.origin.next;
    }

    if (node.inner.visible.type === Patch.Type.OuterChange) {
      robotBinding.visible = node.inner.visible.next;
    }

    return robotBinding;
  };

  private updateFromTemplate_ = (
    id: string,
    node: Patch.InnerChange<Node.FromRockTemplate> | Patch.InnerChange<Node.FromSpaceTemplate> | Patch.InnerChange<Node.FromJBCTemplate> | Patch.InnerChange<Node.FromBBTemplate>,
    nextScene: Scene
  ): Promise<babylonNode> => {
    // If the template ID changes, recreate the node entirely
    if (node.inner.templateId.type === Patch.Type.OuterChange) {
      this.destroyNode_(id);
      return this.createNode_(id, node.next, nextScene);
    }
    const bNode = this.findBNode_(id);

    const nodeTemplate = preBuiltTemplates[node.next.templateId];
    if (!nodeTemplate) {
      console.warn('template node has invalid template ID:', node.next.templateId);
      return Promise.resolve(bNode);
    }

    const prevBaseProps = Node.Base.upcast(node.prev);
    const nextBaseProps = Node.Base.upcast(node.next);

    // Create a Patch for the underlying node type and call its update function
    switch (nodeTemplate.type) {
      case 'empty': {
        const emptyChange: Patch.InnerChange<Node.Empty> = {
          type: Patch.Type.InnerChange,
          prev: { ...nodeTemplate, ...prevBaseProps },
          next: { ...nodeTemplate, ...nextBaseProps },
          inner: {
            ...node.inner,
            type: Patch.none<'empty'>('empty'),
          },
        };
        return Promise.resolve(this.updateEmpty_(id, emptyChange));
      }
      case 'object': {
        const objectChange: Patch.InnerChange<Node.Obj> = {
          type: Patch.Type.InnerChange,
          prev: { ...nodeTemplate, ...prevBaseProps },
          next: { ...nodeTemplate, ...nextBaseProps },
          inner: {
            ...node.inner,
            type: Patch.none<'object'>('object'),
            geometryId: Patch.none(nodeTemplate.geometryId),
            physics: Patch.none(nodeTemplate.physics),
            material: Patch.none(nodeTemplate.material),
            faceUvs: Patch.none(nodeTemplate.faceUvs),
          },
        };

        return this.updateObject_(id, objectChange, nextScene);
      }
      case 'directional-light': {
        const directionalLightChange: Patch.InnerChange<Node.DirectionalLight> = {
          type: Patch.Type.InnerChange,
          prev: { ...nodeTemplate, ...prevBaseProps },
          next: { ...nodeTemplate, ...nextBaseProps },
          inner: {
            ...node.inner,
            type: Patch.none<'directional-light'>('directional-light'),
            radius: Patch.none(nodeTemplate.radius),
            range: Patch.none(nodeTemplate.range),
            direction: Patch.none(nodeTemplate.direction),
            intensity: Patch.none(nodeTemplate.intensity),
          },
        };
        return Promise.resolve(this.updateDirectionalLight_(id, directionalLightChange));
      }
      case 'spot-light': {
        const spotLightChange: Patch.InnerChange<Node.SpotLight> = {
          type: Patch.Type.InnerChange,
          prev: { ...nodeTemplate, ...prevBaseProps },
          next: { ...nodeTemplate, ...nextBaseProps },
          inner: {
            ...node.inner,
            type: Patch.none<'spot-light'>('spot-light'),
            direction: Patch.none(nodeTemplate.direction),
            angle: Patch.none(nodeTemplate.angle),
            exponent: Patch.none(nodeTemplate.exponent),
            intensity: Patch.none(nodeTemplate.intensity),
          },
        };
        return Promise.resolve(this.updateSpotLight_(id, spotLightChange));
      }
      case 'point-light': {
        const pointLightChange: Patch.InnerChange<Node.PointLight> = {
          type: Patch.Type.InnerChange,
          prev: { ...nodeTemplate, ...prevBaseProps },
          next: { ...nodeTemplate, ...nextBaseProps },
          inner: {
            ...node.inner,
            type: Patch.none<'point-light'>('point-light'),
            intensity: Patch.none(nodeTemplate.intensity),
            radius: Patch.none(nodeTemplate.radius),
            range: Patch.none(nodeTemplate.range),
          },
        };
        return Promise.resolve(this.updatePointLight_(id, pointLightChange));
      }
      default: return Promise.resolve(bNode);
    }
  };

  private updateNode_ = async (id: string, node: Patch<Node>, geometryPatches: Dict<Patch<Geometry>>, nextScene: Scene): Promise<babylonNode> => {

    switch (node.type) {
      // The node hasn't changed type, but some fields have been changed
      case Patch.Type.InnerChange: {
        // If scriptIds changed, rebind the scripts
        if (node.inner.scriptIds.type === Patch.Type.OuterChange) {
          for (const scriptId of node.inner.scriptIds.prev || []) this.scriptManager_.unbind(scriptId, id);
          for (const scriptId of node.inner.scriptIds.next || []) this.scriptManager_.bind(scriptId, id);
        }

        switch (node.next.type) {
          case 'empty': return this.updateEmpty_(id, node as Patch.InnerChange<Node.Empty>);
          case 'object': {
            // If the object's underlying geometry changed, recreate the object entirely
            const geometryPatch = geometryPatches[node.next.geometryId];
            if (geometryPatch.type === Patch.Type.InnerChange || geometryPatch.type === Patch.Type.OuterChange) {
              this.destroyNode_(id);
              return this.createNode_(id, node.prev, nextScene);
            }
            return this.updateObject_(id, node as Patch.InnerChange<Node.Obj>, nextScene);
          }
          case 'directional-light': return this.updateDirectionalLight_(id, node as Patch.InnerChange<Node.DirectionalLight>);
          case 'spot-light': return this.updateSpotLight_(id, node as Patch.InnerChange<Node.SpotLight>);
          case 'point-light': return this.updatePointLight_(id, node as Patch.InnerChange<Node.PointLight>);
          case 'robot': {
            await this.updateRobot_(id, node as Patch.InnerChange<Node.Robot>);
            return null;
          }
          case 'from-jbc-template': return this.updateFromTemplate_(id, node as Patch.InnerChange<Node.FromJBCTemplate>, nextScene);
          case 'from-rock-template': return this.updateFromTemplate_(id, node as Patch.InnerChange<Node.FromRockTemplate>, nextScene);
          case 'from-space-template': {
            return this.updateFromTemplate_(id, node as Patch.InnerChange<Node.FromSpaceTemplate>, nextScene);
          }
          case 'from-bb-template': {
            return this.updateFromTemplate_(id, node as Patch.InnerChange<Node.FromBBTemplate>, nextScene);
          }
          default: {
            console.error('invalid node type for inner change:', (node.next as Node).type);
            return this.findBNode_(id);
          }
        }
      }
      // The node has been wholesale replaced by another type of node
      case Patch.Type.OuterChange: {
        this.destroyNode_(id);
        return this.createNode_(id, node.next, nextScene);
      }
      // The node was newly added to the scene
      case Patch.Type.Add: {
        return this.createNode_(id, node.next, nextScene);
      }
      // The node was removed from the scene
      case Patch.Type.Remove: {
        // unbind scripts
        for (const scriptId of node.prev.scriptIds || []) this.scriptManager_.unbind(scriptId, id);
        this.destroyNode_(id);

        return undefined;
      }
      case Patch.Type.None: {
        if (node.prev.type === 'object') {
          // Even though the node is unchanged, if the underlying geometry changed, recreate the object entirely
          const geometryPatch = geometryPatches[node.prev.geometryId];
          if (geometryPatch.type === Patch.Type.InnerChange || geometryPatch.type === Patch.Type.OuterChange) {
            this.destroyNode_(id);
            return this.createNode_(id, node.prev, nextScene);
          }
        }

        if (node.prev.type === 'robot') return null;
        return this.findBNode_(id);
      }
    }
  };

  private destroyNode_ = (id: string) => {
    if (id in this.robotBindings_) {
      this.robotBindings_[id].dispose();
      delete this.robotBindings_[id];
    } else {
      const bNode = this.findBNode_(id);
      bNode.dispose();

      const shadowGenerator = this.shadowGenerators_[id];
      if (shadowGenerator) shadowGenerator.dispose();
    }
  };

  private gizmoManager_: GizmoManager;


  private updateArcRotateCamera_ = (node: Patch.InnerChange<Camera.ArcRotate>): ArcRotateCamera => {
    if (!(this.camera_ instanceof ArcRotateCamera)) throw new Error('Expected ArcRotateCamera');

    const bCamera = this.camera_;

    if (node.inner.target.type === Patch.Type.OuterChange) {
      bCamera.setTarget(Vector3wUnits.toBabylon(node.inner.target.next, 'centimeters'));
    }

    if (node.inner.position.type === Patch.Type.OuterChange) {
      bCamera.setPosition(Vector3wUnits.toBabylon(node.inner.position.next, 'centimeters'));
    }

    return bCamera;
  };

  private updateCamera_ = (node: Patch.InnerChange<Camera>): babylCamera => {
    let ret: babylCamera;
    switch (node.next.type) {
      case 'arc-rotate': ret = this.updateArcRotateCamera_(node as Patch.InnerChange<Camera.ArcRotate>); break;
      case 'none': ret = this.camera_; break;
    }

    return ret;
  };

  private cachedCollideCallbacks_: Dict<{
    callback: (collisionEvent: IPhysicsCollisionEvent) => void;
  }[]> = {};

  /**
  * Determine the `PhysicsShapeParameters` for a `Node`.
  * This function is adapted from `_addSizeOptions()` in the BabylonJS`PhysicsAggregate` class.
  * @param mesh The `AbstractMesh` whose shape we evaluate to determine the options.
  * @param objectNode The `Node`, which determines the `PhysicsShapeType` to use.
  * @param parameters The object in which the calculated parameters are stored.
  */
  private addShapeOptions(mesh: AbstractMesh, objectNode: Node.Obj | Node.FromSpaceTemplate | Node.FromBBTemplate, parameters: PhysicsShapeParameters) {
    // const parameters = params;
    mesh.computeWorldMatrix(true);
    const bb = mesh.getRawBoundingInfo().boundingBox;
    const extents = new Vector3();
    extents.copyFrom(bb.extendSize);
    extents.scaleInPlace(2);
    extents.multiplyInPlace(mesh.absoluteScaling);
    // In case we had any negative scaling, we need to take the absolute value of the extents.
    extents.x = Math.abs(extents.x);
    extents.y = Math.abs(extents.y);
    extents.z = Math.abs(extents.z);

    const min = new Vector3();
    min.copyFrom(bb.minimum);
    min.multiplyInPlace(mesh.absoluteScaling);

    const center = new Vector3();
    center.copyFrom(bb.center);
    center.multiplyInPlace(mesh.absoluteScaling);
    parameters.center = center;

    switch (objectNode.physics?.type) {
      case 'box': {
        parameters.extents = extents;
        parameters.rotation = Quaternion.Identity();
        break;
      }
      case 'sphere': {
        if (Math.abs(extents.x - extents.y) <= 0.0001 && Math.abs(extents.x - extents.z) <= 0.0001) {
          parameters.radius = extents.x / 2;
        } else {
          parameters.radius = Math.max(extents.x, extents.y, extents.z);
        }
        break;
      }
      case 'cylinder': {
        parameters.radius = extents.x / 2;
        parameters.pointA = new Vector3(0, min.y, 0);
        parameters.pointB = new Vector3(0, min.y + extents.y, 0);
        break;
      }
      case 'mesh': {
        // Nothing to do, we set the mesh in `restorePhysicsToObject`
        break;
      }
      case 'none': {
        // Nothing to do
        break;
      }
    }

    return parameters;
  }

  private restorePhysicsToObject = (mesh: AbstractMesh,
    objectNode: Node.Obj | Node.FromSpaceTemplate | Node.FromBBTemplate,
    nodeId: string,
    scene: Scene): void => {
    // Physics should only be added to physics-enabled, visible, non-selected objects
    if (
      !objectNode.physics ||
      !objectNode.visible ||
      (nodeId && scene.selectedNodeId === nodeId) ||
      (mesh.physicsBody)
    ) {
      return;
    }

    // console.log(this.bScene_.meshes);

    const initialParent = mesh.parent;
    mesh.setParent(null);
    let physics_mesh = mesh;

    /*
     * There are three things you need to setup physics for an object in babylon.js
     * - First, you need the mesh: the one that the user will see.
     * - Then, you need to create a physics body for that mesh.
     * - Finally, you need to set the physics shape which the engine uses to simulate collisions.
     */

    /*
     * This is the PhysicsBody where you set the mass of your object,
     * as well as determine whether of not it should move.
     * WARNING: Set inertia manually at your own risk! The physics engine will
     * calculate it automatically. You will probably get it wrong and things
     * will behave very strangely.
     */
    const body = new PhysicsBody(
      mesh,
      objectNode.physics?.motionType ?? PhysicsMotionType.DYNAMIC,
      false,
      this.bScene);
    body.setMassProperties({
      mass: objectNode.physics.mass ? Mass.toGramsValue(objectNode.physics.mass) : 0,
      // inertia: Vector3.FromArray(objectNode.physics?.inertia ?? [0, 0, 0]),
    });


    /*
     * Check if the object has a seperate collision body.
     * This should only apply to custom modeled objects.
     */
    if (objectNode.physics?.colliderId) {
      physics_mesh = this.bScene_.getMeshById(objectNode.physics.colliderId);
    }

    /*
     * Set the PhysicsShapeOptions, which tells the engine what kind of
     * shape we want. It can automatically create a variety of shapes around an
     * object, including the mesh itself.
     * See: https://doc.babylonjs.com/features/featuresDeepDive/physics/shapes
     */
    const parameters: PhysicsShapeParameters = { mesh: physics_mesh as Mesh };
    // Notice that we are passing mesh, not physicsMesh here
    this.addShapeOptions(mesh, objectNode, parameters);
    const options: PhysicShapeOptions = { type: PHYSICS_SHAPE_TYPE_MAPPINGS[objectNode.physics.type], parameters };
    const shape = new PhysicsShape(options, this.bScene);
    shape.material = {
      friction: objectNode.physics.friction ?? 5,
      restitution: objectNode.physics.restitution ?? 0.5,
    };

    // Tell the PhysicsBody we created earlier to use this shape
    body.shape = shape;

    if (this.physicsViewer_) {
      this.physicsViewer_.showBody(mesh.physicsBody);
    }
    mesh.setParent(initialParent);
    this.syncCollisionFilters_();

    return;
  };


  private removePhysicsFromObject = (mesh: AbstractMesh) => {
    if (!mesh.physicsBody) return;

    const parent = mesh.parent;
    mesh.setParent(null);

    if (this.physicsViewer_) {
      this.physicsViewer_.hideBody(mesh.physicsBody);
    }

    mesh.physicsBody.shape?.dispose();
    mesh.physicsBody.dispose();
    mesh.physicsBody = null;

    mesh.setParent(parent);

    this.syncCollisionFilters_();
  };

  private collisionFilters_: Dict<Set<string>> = {};
  private intersectionFilters_: Dict<Set<string>> = {};

  private syncCollisionFilters_ = () => {
    for (const nodeId in this.collisionFilters_) {
      const meshes = this.nodeMeshes_(nodeId);
      if (meshes.length === 0) continue;

      const meshcopy = meshes
        .map(mesh => mesh.physicsBody)
        .filter(body => body);

      if (meshcopy.length === 0) continue;

      const filterIds = this.collisionFilters_[nodeId];

      const otherBodies = Array.from(filterIds)
        .map(id => this.nodeMeshes_(id))
        .reduce((acc, val) => [...acc, ...val], [])
        .filter(mesh => mesh && mesh.physicsBody)
        .map(mesh => mesh.physicsBody);

      for (const body of meshcopy) {
        body.setCollisionCallbackEnabled(true);
        const observable = body.getCollisionObservable();
        observable.add(this.onCollideEvent_);
      }
    }
  };

  private onCollisionFiltersChanged_ = (nodeId: string, filterIds: Set<string>) => {
    this.collisionFilters_[nodeId] = filterIds;
    this.syncCollisionFilters_();
  };

  private onIntersectionFiltersChanged_ = (nodeId: string, filterIds: Set<string>) => {
    if (SetOps.intersection(filterIds, Dict.keySet(this.robotBindings_)).size > 0) {
      throw new Error(`Cannot add a robot to a collision's filter. Please make the robot the primary nodeId.`);
    }

    this.intersectionFilters_[nodeId] = filterIds;
    this.syncCollisionFilters_();
  };

  private onCollideEvent_ = (
    collisionEvent: IPhysicsCollisionEvent,
  ) => {

    const collider = collisionEvent.collider;
    const collidedAgainst = collisionEvent.collidedAgainst;
    const point = collisionEvent.point;
    const distance = collisionEvent.distance;
    const impulse = collisionEvent.impulse;
    const normal = collisionEvent.normal;

    if (!('metadata' in collider.transformNode)) return;
    if (!('metadata' in collidedAgainst.transformNode)) return;

    const colliderMetadata = collider.transformNode.metadata as SceneMeshMetadata;
    const collidedWithMetadata = collidedAgainst.transformNode.metadata as SceneMeshMetadata;

    if (!colliderMetadata) return;
    if (!collidedWithMetadata) return;

    this.scriptManager_.trigger(ScriptManager.Event.collision({
      nodeId: colliderMetadata.id,
      otherNodeId: collidedWithMetadata.id,
      point: Vector3wUnits.fromRaw(RawVector3.fromBabylon(point), RENDER_SCALE),
    }));

    return { collider, collidedAgainst, point, distance, impulse, normal };
  };


  readonly setScene = async (scene: Scene, robots: Dict<Robot>) => {
    this.robots_ = robots;
    const patch = Scene.diff(this.scene_, scene);
    const nodeIds = Dict.keySet(patch.nodes);
    const removedKeys: Set<string> = new Set();

    // We need to handle removals first
    for (const nodeId of nodeIds) {
      const node = patch.nodes[nodeId];
      if (node.type !== Patch.Type.Remove) continue;
      await this.updateNode_(nodeId, node, patch.geometry, scene);

      delete this.nodes_[nodeId];
      delete this.shadowGenerators_[nodeId];
      delete this.intersectionFilters_[nodeId];

      removedKeys.add(nodeId);
    }

    // Now get a breadth-first sort of the remaining nodes (we need to make sure we add parents first)
    const sortedNodeIds = Scene.nodeOrdering(scene);
    for (const nodeId of sortedNodeIds) {
      if (removedKeys.has(nodeId)) continue;
      const node = patch.nodes[nodeId];

      const updatedNode = await this.updateNode_(nodeId, node, patch.geometry, scene);
      if (updatedNode) {
        this.nodes_[nodeId] = updatedNode;
      }
    }

    if (patch.selectedNodeId.type === Patch.Type.OuterChange) {
      const { prev, next } = patch.selectedNodeId;

      // Re-enable physics on the now unselected node
      if (prev !== undefined) {
        // Get the scene object, resolving templates if needed
        let prevNodeObj: Node.Obj;
        const prevNode = scene.nodes[prev];
        if (prevNode.type === 'object') prevNodeObj = prevNode;
        else if (prevNode.type === 'from-jbc-template') {
          const nodeTemplate = preBuiltTemplates[prevNode.templateId];
          if (nodeTemplate?.type === 'object') prevNodeObj = { ...nodeTemplate, ...Node.Base.upcast(prevNode) };
        } else if (prevNode.type === 'from-rock-template') {
          const nodeTemplate = preBuiltTemplates[prevNode.templateId];
          if (nodeTemplate?.type === 'object') prevNodeObj = { ...nodeTemplate, ...Node.Base.upcast(prevNode) };
        } else if (prevNode.type === 'from-space-template') {
          const nodeTemplate = preBuiltTemplates[prevNode.templateId];
          if (nodeTemplate?.type === 'object') prevNodeObj = { ...nodeTemplate, ...Node.Base.upcast(prevNode) };
        } else if (prevNode.type === 'from-bb-template') {
          const nodeTemplate = preBuiltTemplates[prevNode.templateId];
          if (nodeTemplate?.type === 'object') prevNodeObj = { ...nodeTemplate, ...Node.Base.upcast(prevNode) };
        }

        const prevBNode = this.bScene_.getNodeById(prev);
        if (prevNodeObj && (prevBNode instanceof AbstractMesh || prevBNode instanceof TransformNode)) {
          prevBNode.metadata = { ...(prevBNode.metadata as SceneMeshMetadata), selected: false };
          apply(prevBNode, m => this.restorePhysicsToObject(m, prevNodeObj, prev, scene));
        }

        this.gizmoManager_.attachToNode(null);
      }

      // Disable physics on the now selected node
      if (next !== undefined) {
        const node = this.bScene_.getNodeById(next);
        if (node instanceof AbstractMesh || node instanceof TransformNode) {
          apply(node, m => this.removePhysicsFromObject(m));
          node.metadata = { ...(node.metadata as SceneMeshMetadata), selected: true };
          this.gizmoManager_.attachToNode(node);
        }
      }
    }

    const oldCamera = this.camera_;
    switch (patch.camera.type) {
      case Patch.Type.OuterChange: {
        this.camera_ = createCamera(patch.camera.next, this.bScene_);
        break;
      }
      case Patch.Type.InnerChange: {
        if (this.camera_) this.camera_ = this.updateCamera_(patch.camera);
        else this.camera_ = createCamera(patch.camera.next, this.bScene_);
        break;
      }
    }

    if (oldCamera !== this.camera_) {
      oldCamera.detachControl(this.bScene_.getEngine().getRenderingCanvas());
      this.bScene_.detachControl();
      this.bScene_.removeCamera(oldCamera);

      // Creating the camera already added it to the  scene, so no need to call bScene_.addCamera()
      this.bScene_.activeCamera = this.camera_;
      if (this.engineView_) this.camera_.attachControl(this.engineView_.target, true);
      this.bScene_.attachControl();
      oldCamera.dispose();
    }

    if (patch.gravity.type === Patch.Type.OuterChange) {
      const gravity_scalar = new Vector3(1, 10, 1); // This seems to be somewhat realistic
      this.bScene_.getPhysicsEngine().setGravity(Vector3wUnits.toBabylon(patch.gravity.next, 'meters').multiply(gravity_scalar));
    }

    // Scripts **must** be initialized after the scene is fully loaded
    const reinitializedScripts = new Set<string>();
    for (const scriptId in patch.scripts) {
      const script = patch.scripts[scriptId];
      switch (script.type) {
        case Patch.Type.Add:
        case Patch.Type.OuterChange: {
          this.scriptManager_.set(scriptId, script.next);
          reinitializedScripts.add(scriptId);
          break;
        }
        case Patch.Type.Remove: {
          this.scriptManager_.remove(scriptId);
          break;
        }
      }
    }

    // Iterate through all nodes to find reinitialized binds
    for (const nodeId in scene.nodes) {
      const node = scene.nodes[nodeId];
      for (const scriptId of node.scriptIds || []) {
        if (reinitializedScripts.has(scriptId)) this.scriptManager_.bind(scriptId, nodeId);
      }
    }
    this.scene_ = scene;
  };

  private currentIntersections_: Dict<Set<string>> = {};

  private nodeMeshes_ = (id: string): AbstractMesh[] => {
    console.log('nodeMeshes');

    console.log(Object.keys(this.robotBindings_));
    // If the node is a robot, return all the robot's links (parts)
    if (id in this.robotBindings_) {
      console.log('robotBindings');
      return Dict.values(this.robotBindings_[id].links);
    }
    // Check if the node is an individual part of the robot
    for (const robotId of Dict.keySet(this.robotBindings_)) {
      console.log(`checking ${robotId}`);
      if (id in this.robotBindings_[robotId].links) {
        console.log(`found ${id}`);
        return this.robotBindings_[robotId].links[id] instanceof AbstractMesh ? [this.robotBindings_[robotId].links[id]] : [];
      }
    }
    const bNode = this.findBNode_(id);
    if (bNode && bNode instanceof AbstractMesh) return [bNode];

    return [];
  };

  private nodeMinMaxes_ = (id: string): { min: Vector3; max: Vector3; }[] => {
    const meshes = this.nodeMeshes_(id);
    if (meshes.length === 0) return [];
    const ret: { min: Vector3; max: Vector3; }[] = [];
    // for (const mesh of meshes) ret.push(mesh.getHierarchyBoundingVectors());
    for (const mesh of meshes) {
      // this.gizmoManager_.gizmos.boundingBoxGizmo.attachedMesh = mesh; // For viewing meshes on robot
      if (mesh.id.includes('Chassis')) {
        continue;
      } else {
        ret.push(mesh.getHierarchyBoundingVectors(true, (mesh: AbstractMesh) => !mesh.name.includes('et_sensor')));
      }
    }
    return ret;
  };

  private nodeBoundingBoxes_ = (id: string): BoundingBox[] => this.nodeMinMaxes_(id)
    .map(({ min, max }) => new BoundingBox(min, max));

  tick(abstractRobots: Dict<AbstractRobot.Readable>): Dict<RobotBinding.TickOut> {
    if (this.declineTicks_) return undefined;

    const ret: Dict<RobotBinding.TickOut> = {};
    for (const nodeId in this.scene_.nodes) {
      const abstractRobot = abstractRobots[nodeId];
      if (!abstractRobot) continue;

      const robotBinding = this.robotBindings_[nodeId];
      if (robotBinding) {
        ret[nodeId] = robotBinding.tick(abstractRobots[nodeId]);
      } else {
        // throw new Error(`No robot binding for node ${nodeId}`);
      }
    }

    // Update intersections
    for (const nodeId in this.intersectionFilters_) {
      const nodeMeshes = this.nodeMeshes_(nodeId);
      if (nodeMeshes.length === 0) continue;

      try {
        const nodeBoundingBoxes = this.nodeBoundingBoxes_(nodeId); //
        const filterIds = this.intersectionFilters_[nodeId];
        for (const filterId of filterIds) {
          const filterMinMaxes = this.nodeMinMaxes_(filterId);

          let intersection = false;
          for (const nodeBoundingBox of nodeBoundingBoxes) {
            for (const filterMinMax of filterMinMaxes) {
              intersection = this.nodeMeshes_(nodeId)[0].intersectsMesh(this.nodeMeshes_(filterId)[0], true) ? true : nodeBoundingBox.intersectsMinMax(filterMinMax.min, filterMinMax.max);
              if (intersection) break;
            }
            if (intersection) break;
          }

          if (intersection) {
            if (!this.currentIntersections_[nodeId]) this.currentIntersections_[nodeId] = new Set();
            else if (this.currentIntersections_[nodeId].has(filterId)) continue;

            this.currentIntersections_[nodeId].add(filterId);

            this.scriptManager_.trigger(ScriptManager.Event.intersectionStart({
              nodeId,
              otherNodeId: filterId,
            }));
          } else {
            if (!this.currentIntersections_[nodeId] || !this.currentIntersections_[nodeId].has(filterId)) continue;

            this.currentIntersections_[nodeId].delete(filterId);

            this.scriptManager_.trigger(ScriptManager.Event.intersectionEnd({
              nodeId,
              otherNodeId: filterId,
            }));
          }
        }
      } catch (e) {
        delete this.intersectionFilters_[nodeId];
      }
    }

    return ret;
  }

  set realisticSensors(realisticSensors: boolean) {
    for (const robotBinding of Object.values(this.robotBindings_)) {
      robotBinding.realisticSensors = realisticSensors;
    }
  }

  set noisySensors(noisySensors: boolean) {
    for (const robotBinding of Object.values(this.robotBindings_)) {
      robotBinding.noisySensors = noisySensors;
    }
  }
}

const PHYSICS_SHAPE_TYPE_MAPPINGS: { [key in Node.Physics.Type]: number } = {
  'box': PhysicsShapeType.BOX,
  'sphere': PhysicsShapeType.SPHERE,
  'cylinder': PhysicsShapeType.CYLINDER,
  'mesh': PhysicsShapeType.MESH,
  'none': PhysicsShapeType.CONVEX_HULL,
};

export default SceneBinding;
