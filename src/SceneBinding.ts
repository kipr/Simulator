
import * as Babylon from "babylonjs";
import deepNeq from "./deepNeq";
import Dict from "./Dict";
import { Quaternion, Vector3 as RawVector3 } from "./math";
import Scene from "./state/State/Scene";
import Geometry from "./state/State/Scene/Geometry";
import Node from "./state/State/Scene/Node";
import Patch from "./state/State/Scene/Patch";
import { ReferenceFrame, Rotation, Vector3 } from "./unit-math";
import { Angle, Distance, Mass, SetOps } from "./util";

export type FrameLike = Babylon.TransformNode | Babylon.AbstractMesh;

interface NodeBinding {
  logical: Node;
  physical: Babylon.Node;
}

interface SceneBinding {
  scene: Scene;
  root: Babylon.TransformNode;
  // TODO: Eventually use this and have instancing
  // geometry: Dict<[ Geometry, FrameLike ]>;
  nodes: Dict<NodeBinding>;
  shadowGenerators: Dict<Babylon.ShadowGenerator>;
  physicsViewer: Babylon.PhysicsViewer;
}

class SceneBinding2 {
  private bScene_: Babylon.Scene;
  get bScene() { return this.bScene_; }

  private root_: Babylon.TransformNode;
  get root() { return this.root_; }

  private scene_: Scene;
  get scene() { return this.scene_; }

  private nodes_: Dict<Babylon.Node> = {};

  private shadowGenerators_: Dict<Babylon.ShadowGenerator> = {};
  private physicsViewer_: Babylon.PhysicsViewer;

  constructor(bScene: Babylon.Scene) {
    this.bScene_ = bScene;
    this.scene_ = Scene.EMPTY;

    this.root_ = new Babylon.TransformNode('__scene_root__', this.bScene_);
    this.physicsViewer_ = new Babylon.PhysicsViewer(this.bScene_);
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
          mesh.setParent(ret);
        }
        break; 
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

  private createObject_ = async (node: Node.Obj): Promise<Babylon.Node> => {
    const parent = this.findBNode_(node.parentId, true);

    const ret = await this.buildGeometry_(node.name, this.scene_.geometry[node.geometryId]);
    ret.setParent(parent);

    if (node.physics) {
      const type = IMPOSTER_TYPE_MAPPINGS[node.physics.type];
      SceneBinding2.apply_(ret, m => {
        // m.setParent(null);
        m.physicsImpostor = new Babylon.PhysicsImpostor(m, type, {
          mass: node.physics.mass ? Mass.toGramsValue(node.physics.mass) : 0,
          restitution: node.physics.restitution ?? 1,
          friction: node.physics.friction ?? 5,
        });
      });
    }

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

    this.shadowGenerators_[id] = SceneBinding2.createShadowGenerator_(ret);

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

    this.shadowGenerators_[id] = SceneBinding2.createShadowGenerator_(ret);

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

    this.shadowGenerators_[id] = SceneBinding2.createShadowGenerator_(ret);

    return ret;
  };

  private static createShadowGenerator_ = (light: Babylon.IShadowLight) => {
    const ret = new Babylon.ShadowGenerator(1024, light);
    ret.useKernelBlur = false;
    ret.blurScale = 2;
    ret.filter = Babylon.ShadowGenerator.FILTER_POISSONSAMPLING;
    return ret;
  };

  private createNode_ = async (id: string, node: Node): Promise<Babylon.Node> => {
    let ret: Babylon.Node;
    switch (node.type) {
      case 'object': ret = await this.createObject_(node); break;
      case 'empty': ret = this.createEmpty_(node); break;
      case 'directional-light': ret = this.createDirectionalLight_(id, node); break;
      case 'spot-light': ret = this.createSpotLight_(id, node); break;
      case 'point-light': ret = this.createPointLight_(id, node); break;
    }

    this.updateNodePosition_(node, ret);

    return ret;
  };

  private updateNodePosition_ = (node: Node, bNode: Babylon.Node) => {
    if (node.origin && bNode instanceof Babylon.TransformNode || bNode instanceof Babylon.AbstractMesh) {
      const origin = node.origin;
      const position: Vector3 = origin.position ?? Vector3.zero();
      const orientation: Rotation = origin.orientation ?? Rotation.Euler.identity();
      const scale = origin.scale ?? RawVector3.ONE;

      bNode.position.set(
        Distance.toCentimetersValue(position.x),
        Distance.toCentimetersValue(position.y),
        Distance.toCentimetersValue(position.z)
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
    const bNode = this.findBNode_(id) as FrameLike;

    // NYI

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

    // NYI

    return bNode;
  };

  private updateNode_ = async (id: string, node: Patch<Node>): Promise<Babylon.Node> => {
    switch (node.type) {
      // The node hasn't changed type, but some fields have been changed
      case Patch.Type.InnerChange: {
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

        return this.createNode_(id, node.next);
      }
      // The node was newly added to the scene
      case Patch.Type.Add: {
        return this.createNode_(id, node.next);
      }
      // The node was removed from the scene
      case Patch.Type.Remove: {
        const prev = this.findBNode_(id);
        prev.dispose();

        const shadowGenerator = this.shadowGenerators_[id];
        if (shadowGenerator) shadowGenerator.dispose();

        return undefined;
      }
    }
  };

  readonly setScene = async (scene: Scene) => {
    const patch = Scene.diff(this.scene_, scene);

    const nodeIds = Dict.keySet(patch.nodes);

    // We need to handle removals first
    for (const nodeId of nodeIds) {
      const node = patch.nodes[nodeId];
      if (node.type !== Patch.Type.Remove) continue;
      await this.updateNode_(nodeId, node);
      
      delete this.nodes_[nodeId];
      delete this.shadowGenerators_[nodeId];
    }

    // Now get a breadth-first sort of the remaining nodes (we need to make sure we add parents first)
    const sortedNodeIds = Scene.nodeOrdering(scene);
  
    for (const nodeId of sortedNodeIds) {
      const node = patch.nodes[nodeId];
      this.nodes_[nodeId] = await this.updateNode_(nodeId, node);
    }
  };
}

const IMPOSTER_TYPE_MAPPINGS: { [key: string]: number } = {
  'box': Babylon.PhysicsImpostor.BoxImpostor,
  'sphere': Babylon.PhysicsImpostor.SphereImpostor,
  'mesh': Babylon.PhysicsImpostor.MeshImpostor,
};
  

export default SceneBinding2;