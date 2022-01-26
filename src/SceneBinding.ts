
import * as Babylon from "babylonjs";
import deepNeq from "./deepNeq";
import Dict from "./Dict";
import { Quaternion, Vector3 as RawVector3 } from "./math";
import Robotable from "./Robotable";
import Scene from "./state/State/Scene";
import Camera from "./state/State/Scene/Camera";
import Geometry from "./state/State/Scene/Geometry";
import Node from "./state/State/Scene/Node";
import Patch from "./state/State/Scene/Patch";
import * as Ammo from './ammo';

import { ReferenceFrame, Rotation, Vector3 } from "./unit-math";
import { Angle, Distance, Mass, SetOps } from "./util";

export type FrameLike = Babylon.TransformNode | Babylon.AbstractMesh;

class SceneBinding {
  private bScene_: Babylon.Scene;
  get bScene() { return this.bScene_; }

  private root_: Babylon.TransformNode;
  get root() { return this.root_; }

  private scene_: Scene;
  get scene() { return this.scene_; }

  private nodes_: Dict<Babylon.Node> = {};

  private shadowGenerators_: Dict<Babylon.ShadowGenerator> = {};
  private physicsViewer_: Babylon.PhysicsViewer;

  private robot_: Robotable;

  private camera_: Babylon.Camera;

  private engineView_: Babylon.EngineView;
  private ammo_: Babylon.AmmoJSPlugin;

  get camera() { return this.camera_; }

  private canvas_: HTMLCanvasElement;

  get canvas() { return this.canvas_; }

  set canvas(canvas: HTMLCanvasElement) {
    this.canvas_ = canvas;
    const engine = this.bScene_.getEngine();
    if (this.engineView_) engine.unRegisterView(this.engineView_.target);
    this.engineView_ = engine.registerView(this.canvas_);
    engine.inputElement = this.canvas_;
  }

  constructor(bScene: Babylon.Scene, robot: Robotable) {
    this.bScene_ = bScene;
    this.robot_ = robot;
    this.scene_ = Scene.EMPTY;
    this.ammo_ = new Babylon.AmmoJSPlugin(true, Ammo);
    this.bScene_.enablePhysics(new Babylon.Vector3(0, -9.8 * 50, 0), this.ammo_);

    this.root_ = new Babylon.TransformNode('__scene_root__', this.bScene_);
    this.physicsViewer_ = new Babylon.PhysicsViewer(this.bScene_);
    this.gizmoManager_ = new Babylon.GizmoManager(this.bScene_);

    this.camera_ = this.createNoneCamera_(Camera.NONE);

    this.gizmoManager_.positionGizmoEnabled = true;
    this.gizmoManager_.gizmos.positionGizmo.scaleRatio = 1.25;
    this.gizmoManager_.rotationGizmoEnabled = true;
    this.gizmoManager_.scaleGizmoEnabled = false;
    this.gizmoManager_.usePointerToAttachGizmos = false;
  }

  private static apply_ = (g: FrameLike, f: (m: Babylon.AbstractMesh) => void) => {
    if (g instanceof Babylon.AbstractMesh) {
      f(g);
    } else {
      (g.getChildren(c => c instanceof Babylon.AbstractMesh) as Babylon.AbstractMesh[]).forEach(f);
    }
  };

  private buildGeometry_ = async (name: string, geometry: Geometry): Promise<FrameLike> => {
    let ret: FrameLike;
    switch (geometry.type) {
      case 'box': {
        ret = Babylon.BoxBuilder.CreateBox(name, {
          width: Distance.toCentimetersValue(geometry.size.x),
          height: Distance.toCentimetersValue(geometry.size.y),
          depth: Distance.toCentimetersValue(geometry.size.z)
        }, this.bScene_);
        break;
      }
      case 'sphere': {
        ret = Babylon.SphereBuilder.CreateSphere(name, {
          // Why?? Why is a sphere defined by its diameter?
          diameter: Distance.toCentimetersValue(geometry.radius) * 2,
        }, this.bScene_);
        break;
      }
      case 'cylinder': {
        ret = Babylon.CylinderBuilder.CreateCylinder(name, {
          height: Distance.toCentimetersValue(geometry.height),
          diameterTop: Distance.toCentimetersValue(geometry.radius) * 2,
          diameterBottom: Distance.toCentimetersValue(geometry.radius) * 2,
        }, this.bScene_);
        break;
      }
      case 'cone': {
        ret = Babylon.CylinderBuilder.CreateCylinder(name, {
          diameterTop: 0,
          height: Distance.toCentimetersValue(geometry.height),
          diameterBottom: Distance.toCentimetersValue(geometry.radius) * 2,
        }, this.bScene_);
        break;
      }
      case 'plane': {
        ret = Babylon.PlaneBuilder.CreatePlane(name, {
          width: Distance.toCentimetersValue(geometry.size.x),
          height: Distance.toCentimetersValue(geometry.size.y),
        }, this.bScene_);
        break;
      }
      case 'file': {
        const index = geometry.uri.lastIndexOf('/');
        const fileName = geometry.uri.substring(index + 1);
        const baseName = geometry.uri.substring(0, index + 1);
  
        const res = await Babylon.SceneLoader.ImportMeshAsync(geometry.include ?? '', baseName, fileName, this.bScene_);
        if (res.meshes.length === 1) return res.meshes[0];
        ret = new Babylon.TransformNode(geometry.uri, this.bScene_);
        for (const mesh of res.meshes) {
          // GLTF importer adds a __root__ mesh (always the first one) that we can ignore 
          if (mesh === res.meshes[0]) continue;

          mesh.setParent(ret);
        }
        break; 
      }
      default: {
        throw new Error(`Unsupported geometry type: ${geometry.type}`);
      }
    }

    if (ret instanceof Babylon.AbstractMesh) {
      ret.visibility = 1;
    } else {
      const children = ret.getChildren(c => c instanceof Babylon.AbstractMesh) as Babylon.AbstractMesh[];
      for (const child of children) {
        child.visibility = 1;
      }
    }

    return ret;
  };

  private findBNode_ = (id?: string, defaultToRoot?: boolean): Babylon.Node => {
    if (id === undefined && defaultToRoot) return this.root_;
    if (id !== undefined && !(id in this.nodes_)) throw new Error(`${id} doesn't exist`);
    return this.nodes_[id];
  };

  private createObject_ = async (node: Node.Obj, nextScene: Scene): Promise<Babylon.Node> => {
    const parent = this.findBNode_(node.parentId, true);

    const ret = await this.buildGeometry_(node.name, nextScene.geometry[node.geometryId]);

    if (!node.visible) {
      SceneBinding.apply_(ret, m => m.isVisible = false);
    }

    if (node.physics) {
      const type = IMPOSTER_TYPE_MAPPINGS[node.physics.type];
      SceneBinding.apply_(ret, m => {
        m.physicsImpostor = new Babylon.PhysicsImpostor(m, type, {
          mass: node.physics.mass ? Mass.toGramsValue(node.physics.mass) : 0,
          restitution: node.physics.restitution ?? 0.5,
          friction: node.physics.friction ?? 5,
        });
      });
    }

    ret.setParent(parent);

    return ret;
  };

  private createEmpty_ = (node: Node.Empty): Babylon.TransformNode => {
    const parent = this.findBNode_(node.parentId, true);

    const ret = new Babylon.TransformNode(node.name, this.bScene_);
    ret.setParent(parent);
    return ret;
  };

  private createDirectionalLight_ = (id: string, node: Node.DirectionalLight): Babylon.DirectionalLight => {
    const ret = new Babylon.DirectionalLight(node.name, RawVector3.toBabylon(node.direction), this.bScene_);

    ret.intensity = node.intensity;
    if (node.radius !== undefined) ret.radius = node.radius;
    if (node.range !== undefined) ret.range = node.range;

    this.shadowGenerators_[id] = SceneBinding.createShadowGenerator_(ret);

    return ret;
  };

  private createSpotLight_ = (id: string, node: Node.SpotLight): Babylon.SpotLight => {
    const origin: ReferenceFrame = node.origin ?? {};
    const position: Vector3 = origin.position ?? Vector3.zero();
    
    const ret = new Babylon.SpotLight(
      node.name,
      RawVector3.toBabylon(Vector3.toRaw(position, 'centimeters')),
      RawVector3.toBabylon(node.direction),
      Angle.toRadiansValue(node.angle),
      node.exponent,
      this.bScene_
    );

    this.shadowGenerators_[id] = SceneBinding.createShadowGenerator_(ret);

    return ret;
  };

  private createPointLight_ = (id: string, node: Node.PointLight): Babylon.PointLight => {
    const origin: ReferenceFrame = node.origin ?? {};
    const position: Vector3 = origin.position ?? Vector3.zero();

    const ret = new Babylon.PointLight(
      node.name,
      RawVector3.toBabylon(Vector3.toRaw(position, 'centimeters')),
      this.bScene_
    );

    ret.intensity = node.intensity;

    this.shadowGenerators_[id] = SceneBinding.createShadowGenerator_(ret);

    ret.setEnabled(node.visible);

    return ret;
  };

  private static createShadowGenerator_ = (light: Babylon.IShadowLight) => {
    const ret = new Babylon.ShadowGenerator(1024, light);
    ret.useKernelBlur = false;
    ret.blurScale = 2;
    ret.filter = Babylon.ShadowGenerator.FILTER_POISSONSAMPLING;
    return ret;
  };

  private createNode_ = async (id: string, node: Node, nextScene: Scene): Promise<Babylon.Node> => {
    let ret: Babylon.Node;
    switch (node.type) {
      case 'object': ret = await this.createObject_(node, nextScene); break;
      case 'empty': ret = this.createEmpty_(node); break;
      case 'directional-light': ret = this.createDirectionalLight_(id, node); break;
      case 'spot-light': ret = this.createSpotLight_(id, node); break;
      case 'point-light': ret = this.createPointLight_(id, node); break;
    }

    this.updateNodePosition_(node, ret);
    ret.id = id;
    
    ret.metadata = id;

    if (ret instanceof Babylon.AbstractMesh || ret instanceof Babylon.TransformNode) {
      SceneBinding.apply_(ret, m => {
        m.metadata = id;
      });
    }

    return ret;
  };

  private updateNodePosition_ = (node: Node, bNode: Babylon.Node) => {
    if (node.origin && bNode instanceof Babylon.TransformNode || bNode instanceof Babylon.AbstractMesh) {
      const origin = node.origin || {};
      const position: Vector3 = origin.position ?? Vector3.zero();
      const orientation: Rotation = origin.orientation ?? Rotation.Euler.identity();
      const scale = origin.scale ?? RawVector3.ONE;

      bNode.position.set(
        Distance.toCentimetersValue(position.x || Distance.centimeters(0)),
        Distance.toCentimetersValue(position.y || Distance.centimeters(0)),
        Distance.toCentimetersValue(position.z || Distance.centimeters(0))
      );

      bNode.rotationQuaternion = Quaternion.toBabylon(Rotation.toRawQuaternion(orientation));
      bNode.scaling.set(scale.x, scale.y, scale.z);
    }
  }

  private updateEmpty_ = (id: string, node: Patch.InnerChange<Node.Empty>): Babylon.TransformNode => {
    const bNode = this.findBNode_(id) as Babylon.TransformNode;

    if (node.inner.name.type === Patch.Type.OuterChange) {
      bNode.name = node.inner.name.next;
    }

    if (node.inner.parentId.type === Patch.Type.OuterChange) {
      const parent = this.findBNode_(node.inner.parentId.next, true);
      bNode.setParent(parent);
    }

    if (node.inner.origin.type === Patch.Type.OuterChange) {
      this.updateNodePosition_(node.next, bNode);
    }

    return bNode;
  };

  private updateObject_ = async (id: string, node: Patch.InnerChange<Node.Obj>): Promise<FrameLike> => {
    console.log('UPDATE OBJECT', id, node);
    
    const bNode = this.findBNode_(id) as FrameLike;
    if (bNode === undefined) debugger;

    console.log(bNode, id);

    if (node.inner.name.type === Patch.Type.OuterChange) {
      bNode.name = node.inner.name.next;
    }

    if (node.inner.parentId.type === Patch.Type.OuterChange) {
      const parent = this.findBNode_(node.inner.parentId.next, true);
      bNode.setParent(parent);
    }

    if (node.inner.origin.type === Patch.Type.OuterChange) {
      this.updateNodePosition_(node.next, bNode);
    }

    if (node.inner.physics.type === Patch.Type.OuterChange) {
      const nextPhysics = node.inner.physics.next;
      const type = IMPOSTER_TYPE_MAPPINGS[node.inner.physics.next.type];
      SceneBinding.apply_(bNode, m => {
        const mParent = m.parent;
        m.parent = null;
        m.physicsImpostor = new Babylon.PhysicsImpostor(m, type, {
          mass: nextPhysics.mass ? Mass.toGramsValue(nextPhysics.mass) : 0,
          restitution: nextPhysics.restitution ?? 0.5,
          friction: nextPhysics.friction ?? 5,
        });
        m.parent = mParent;
      });
    }

    if (node.inner.visible.type === Patch.Type.OuterChange) {
      const nextVisible = node.inner.visible.next;
      SceneBinding.apply_(bNode, m => m.isVisible = nextVisible);
    }

    return bNode;
  };

  private updateDirectionalLight_ = (id: string, node: Patch.InnerChange<Node.DirectionalLight>): Babylon.DirectionalLight => {
    const bNode = this.findBNode_(id) as Babylon.DirectionalLight;

    // NYI

    return bNode;
  };

  private updateSpotLight_ = (id: string, node: Patch.InnerChange<Node.SpotLight>): Babylon.SpotLight => {
    const bNode = this.findBNode_(id) as Babylon.SpotLight;

    // NYI

    return bNode;
  };

  private updatePointLight_ = (id: string, node: Patch.InnerChange<Node.PointLight>): Babylon.PointLight => {
    const bNode = this.findBNode_(id) as Babylon.PointLight;

    if (node.inner.visible.type === Patch.Type.OuterChange) {
      bNode.setEnabled(node.inner.visible.next);
    }

    return bNode;
  };

  private updateNode_ = async (id: string, node: Patch<Node>, nextScene: Scene): Promise<Babylon.Node> => {
    switch (node.type) {
      // The node hasn't changed type, but some fields have been changed
      case Patch.Type.InnerChange: {
        console.log('inner change', node.next.type);
        switch (node.next.type) {
          case 'empty': return this.updateEmpty_(id, node as Patch.InnerChange<Node.Empty>);
          case 'object': return await this.updateObject_(id, node as Patch.InnerChange<Node.Obj>);
          case 'directional-light': return this.updateDirectionalLight_(id, node as Patch.InnerChange<Node.DirectionalLight>);
          case 'spot-light': return this.updateSpotLight_(id, node as Patch.InnerChange<Node.SpotLight>);
          case 'point-light': return this.updatePointLight_(id, node as Patch.InnerChange<Node.PointLight>);
        }
      }
      // The node has been wholesale replaced by another type of node
      case Patch.Type.OuterChange: {
        const prev = this.findBNode_(id);
        prev.dispose();

        const shadowGenerator = this.shadowGenerators_[id];
        if (shadowGenerator) shadowGenerator.dispose();

        return this.createNode_(id, node.next, nextScene);
      }
      // The node was newly added to the scene
      case Patch.Type.Add: {
        return this.createNode_(id, node.next, nextScene);
      }
      // The node was removed from the scene
      case Patch.Type.Remove: {
        const prev = this.findBNode_(id);
        prev.dispose();

        const shadowGenerator = this.shadowGenerators_[id];
        if (shadowGenerator) shadowGenerator.dispose();

        return undefined;
      }
      case Patch.Type.None: {
        try {
          return this.findBNode_(id);
        } catch (e) {
          throw e;
        }
      }
    }
  };

  private gizmoImpostors_: Dict<Babylon.PhysicsImpostor> = {};
  private gizmoManager_: Babylon.GizmoManager;

  private createArcRotateCamera_ = (camera: Camera.ArcRotate): Babylon.ArcRotateCamera => {
    const ret = new Babylon.ArcRotateCamera('botcam', 10, 10, 10, Vector3.toBabylon(camera.target, 'centimeters'), this.bScene_);
    ret.attachControl(this.bScene_.getEngine().getRenderingCanvas(), true);
    ret.position = Vector3.toBabylon(camera.position, 'centimeters');
    new Babylon.FxaaPostProcess("fxaa", 1.0, ret);
    // new Babylon.TonemapPostProcess("tonemap", Babylon.TonemappingOperator.HejiDawson, 0.8, ret);

    return ret;
  };

  private createNoneCamera_ = (camera: Camera.None): Babylon.ArcRotateCamera => {
    const ret = new Babylon.ArcRotateCamera('botcam', 10, 10, 10, Vector3.toBabylon(Vector3.zero(), 'centimeters'), this.bScene_);
    ret.attachControl(this.bScene_.getEngine().getRenderingCanvas(), true);

    return ret;
  };

  private createCamera_ = (camera: Camera): Babylon.Camera => {
    switch (camera.type) {
      case 'arc-rotate': return this.createArcRotateCamera_(camera);
      case 'none': return this.createNoneCamera_(camera);
    }
  };

  private updateArcRotateCamera_ = (node: Patch.InnerChange<Camera.ArcRotate>): Babylon.ArcRotateCamera => {
    if (!(this.camera_ instanceof Babylon.ArcRotateCamera)) throw new Error('Expected ArcRotateCamera');

    const bCamera = this.camera_ as Babylon.ArcRotateCamera;

    if (node.inner.target.type === Patch.Type.OuterChange) {
      bCamera.setTarget(Vector3.toBabylon(node.inner.target.next, 'centimeters'));
    }

    if (node.inner.position.type === Patch.Type.OuterChange) {
      bCamera.setPosition(Vector3.toBabylon(node.inner.position.next, 'centimeters'));
    }

    return bCamera;
  };

  private updateCamera_ = (node: Patch.InnerChange<Camera>): Babylon.Camera => {
    let ret: Babylon.Camera;
    switch (node.next.type) {
      case 'arc-rotate': ret = this.updateArcRotateCamera_(node as Patch.InnerChange<Camera.ArcRotate>); break;
      case 'none': ret = this.camera_; break;
    }

    return ret;
  };

  readonly setScene = async (scene: Scene) => {
    console.log('set scene', scene);
    const patch = Scene.diff(this.scene_, scene);

    console.log({ patch });

    const nodeIds = Dict.keySet(patch.nodes);

    const removedKeys: Set<string> = new Set();

    // We need to handle removals first
    for (const nodeId of nodeIds) {
      const node = patch.nodes[nodeId];
      if (node.type !== Patch.Type.Remove) continue;

      await this.updateNode_(nodeId, node, scene);
      
      delete this.nodes_[nodeId];
      delete this.shadowGenerators_[nodeId];

      removedKeys.add(nodeId);
    }

    // Now get a breadth-first sort of the remaining nodes (we need to make sure we add parents first)
    const sortedNodeIds = Scene.nodeOrdering(scene);
  
    for (const nodeId of sortedNodeIds) {
      if (removedKeys.has(nodeId)) continue;
      const node = patch.nodes[nodeId];

      this.nodes_[nodeId] = await this.updateNode_(nodeId, node, scene);
    }

    if (patch.selectedNodeId.type === Patch.Type.OuterChange) {
      const { prev, next } = patch.selectedNodeId;

      // Disable physics
      if (prev !== undefined) {
        const prevNode = this.bScene_.getNodeByID(prev) || this.bScene_.getNodeByName(scene.nodes[prev].name);
        console.log('prevNode', prevNode);
        if (prevNode instanceof Babylon.AbstractMesh || prevNode instanceof Babylon.TransformNode) {
          SceneBinding.apply_(prevNode, m => {
            const gizmoImposter = this.gizmoImpostors_[m.id];
            delete this.gizmoImpostors_[m.id];

            if (!gizmoImposter) return;

            const mParent = m.parent;
            m.parent = null;
            m.physicsImpostor = new Babylon.PhysicsImpostor(
              m, gizmoImposter.type,
              { 
                mass: gizmoImposter.mass, 
                restitution: gizmoImposter.restitution,
                friction: gizmoImposter.friction 
              }
            );
            m.parent = mParent;
          });
        }
        this.gizmoManager_.attachToNode(null);
      }

      if (next !== undefined) {
        const node = this.bScene_.getNodeByID(next) || this.bScene_.getNodeByName(scene.nodes[next].name);
        if (node instanceof Babylon.AbstractMesh || node instanceof Babylon.TransformNode) {
          SceneBinding.apply_(node, m => {
            this.gizmoImpostors_[m.id] = m.physicsImpostor;
            if (m.physicsImpostor) m.physicsImpostor.dispose();
          });
          this.gizmoManager_.attachToNode(node);
        }
      }
    }

    switch (patch.robot.type) {
      case Patch.Type.OuterChange: {
        this.robot_.setOrigin(patch.robot.next.origin);
        break;
      };
      case Patch.Type.InnerChange: {
        this.robot_.setOrigin(patch.robot.next.origin);
        break;
      }
    }

    const oldCamera = this.camera_;
    switch (patch.camera.type) {
      case Patch.Type.OuterChange: {
        this.camera_ = this.createCamera_(patch.camera.next);
        break;
      };
      case Patch.Type.InnerChange: {
        if (this.camera_) this.camera_ = this.updateCamera_(patch.camera as Patch.InnerChange<Camera>);
        else this.camera_ = this.createCamera_(patch.camera.next);
        break;
      }
    }

    if (oldCamera !== this.camera_) {
      console.log('camera change!', patch.camera);
      oldCamera.detachControl(this.bScene_.getEngine().getRenderingCanvas());
      this.bScene_.detachControl();
      this.bScene_.removeCamera(oldCamera);
      this.bScene_.addCamera(this.camera_);
      this.bScene_.activeCamera = this.camera_;
      this.camera_.attachControl(this.engineView_.target, true);
      this.bScene_.attachControl();
      oldCamera.dispose();
    }

    if (patch.gravity.type === Patch.Type.OuterChange) {
      this.bScene_.getPhysicsEngine().setGravity(Vector3.toBabylon(patch.gravity.next, 'centimeters'));
    }

    if (patch.robot.type === Patch.Type.InnerChange) {
      if (patch.robot.inner.origin.type === Patch.Type.OuterChange) {
        this.robot_.setOrigin(patch.robot.inner.origin.next);
      }
    }

    this.scene_ = scene;
  };
}

const IMPOSTER_TYPE_MAPPINGS: { [key: string]: number } = {
  'box': Babylon.PhysicsImpostor.BoxImpostor,
  'sphere': Babylon.PhysicsImpostor.SphereImpostor,
  'mesh': Babylon.PhysicsImpostor.MeshImpostor,
};
  

export default SceneBinding;