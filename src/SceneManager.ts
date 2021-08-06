import Scene from "./state/State/Scene";
import Node from "./state/State/Scene/Node";
import Geometry from "./state/State/Scene/Geometry";
import * as Babylon from "babylonjs";
import { Rotation, Vector3 } from "./unit-math";
import { Vector3 as RawVector3 } from "./math";
import { Distance, Mass } from "./util";
import { URL } from "url";

export const buildGeometry = async (name: string, geometry: Geometry, bScene: Babylon.Scene): Promise<Babylon.AbstractMesh[]> => {
  switch (geometry.type) {
    case 'box': {
      return [ Babylon.BoxBuilder.CreateBox(name, {
        width: Distance.toCentimetersValue(geometry.size.x),
        height: Distance.toCentimetersValue(geometry.size.y),
        depth: Distance.toCentimetersValue(geometry.size.z)
      }, bScene) ];
    }
    case 'sphere': {
      return [ Babylon.SphereBuilder.CreateSphere(name, {
        // Why?? Why is a sphere defined by its diameter?
        diameter: Distance.toCentimetersValue(geometry.radius) * 2,
      }, bScene) ];
    }
    case 'cylinder': {
      return [ Babylon.CylinderBuilder.CreateCylinder(name, {
        height: Distance.toCentimetersValue(geometry.height),
        diameterTop: Distance.toCentimetersValue(geometry.radius) * 2,
        diameterBottom: Distance.toCentimetersValue(geometry.radius) * 2,
      }, bScene) ];
    }
    case 'plane': {
      return [ Babylon.PlaneBuilder.CreatePlane(name, {
        width: Distance.toCentimetersValue(geometry.size.x),
        height: Distance.toCentimetersValue(geometry.size.y),
      }, bScene) ];
    }
    case 'file': {
      const index = geometry.uri.lastIndexOf('/');
      const fileName = geometry.uri.substring(index + 1);
      const baseName = geometry.uri.substring(0, index + 1);

      const res = await Babylon.SceneLoader.ImportMeshAsync(geometry.include ?? '', baseName, fileName, bScene);
      return res.meshes;
    }
  }
};

const IMPOSTER_TYPE_MAPPINGS: { [key in Node.Physics.Type]: number } = {
  'box': Babylon.PhysicsImpostor.BoxImpostor,
  'sphere': Babylon.PhysicsImpostor.SphereImpostor,
  'mesh': Babylon.PhysicsImpostor.MeshImpostor,
  'none': Babylon.PhysicsImpostor.NoImpostor,
};


export class BabylonNodeWrapper<T extends Babylon.Node = Babylon.Node> {
  private node_: T;

  constructor(node: T) {
    this.node_ = node;
  }

  get node() {
    return this.node_;
  }

  get hasPosition() {
    return this.node_ instanceof Babylon.Mesh || this.node_ instanceof Babylon.TransformNode;
  }

  get position() {
    if (this.node_ instanceof Babylon.Mesh || this.node_ instanceof Babylon.TransformNode) {
      return this.node_.position;
    }

    throw new Error("Position is not available for this node");
  }

  set position(value: Babylon.Vector3) {
    if (this.node_ instanceof Babylon.Mesh || this.node_ instanceof Babylon.TransformNode) {
      this.node_.position = value;
    }

    throw new Error("Position is not available for this node");
  }

  get hasRotationQuaternion() {
    return this.node_ instanceof Babylon.Mesh || this.node_ instanceof Babylon.TransformNode;
  }

  get rotationQuaternion() {
    if (this.node_ instanceof Babylon.Mesh || this.node_ instanceof Babylon.TransformNode) {
      return this.node_.rotationQuaternion;
    }

    throw new Error(`RotationQuaternion is not available for this node`);
  }

  set rotationQuaternion(value: Babylon.Quaternion) {
    if (this.node_ instanceof Babylon.Mesh || this.node_ instanceof Babylon.TransformNode) {
      this.node_.rotationQuaternion = value;
      return;
    }


    throw new Error("RotationQuaternion is not available for this node");
  }

  get hasScale() {
    return this.node_ instanceof Babylon.Mesh || this.node_ instanceof Babylon.TransformNode;
  }

  get scale() {
    if (this.node_ instanceof Babylon.Mesh || this.node_ instanceof Babylon.TransformNode) {
      return this.node_.scaling;
    }

    throw new Error("Scale is not available for this node");
  }

  set scale(value: Babylon.Vector3) {
    if (this.node_ instanceof Babylon.Mesh || this.node_ instanceof Babylon.TransformNode) {
      this.node_.scaling = value;
    }

    throw new Error("Scale is not available for this node");
  }

  get meshes() {
    if (this.node_ instanceof Babylon.TransformNode) return this.node_.getChildren(mesh => mesh instanceof Babylon.AbstractMesh, false) as Babylon.Mesh[];
    if (!(this.node_ instanceof Babylon.AbstractMesh)) throw new Error("Mesh is not available for this node");
    return [ this.node_ as Babylon.AbstractMesh ];
  }
}

class SceneManager {
  private bScene_: Babylon.Scene;

  private scene_: Scene;
  
  get scene(): Scene {
    return this.scene_;
  }
  
  private root_: Babylon.TransformNode;
  get root(): Babylon.TransformNode {
    return this.root_;
  }

  private shadowGenerators_: Babylon.ShadowGenerator[] = [];

  constructor(bScene: Babylon.Scene) {
    this.bScene_ = bScene;

    this.root_ = new Babylon.TransformNode('__scene_manager_root__', bScene)
  }

  public setScene = async (scene: Scene) => {
    // Clear the scene
    for (const child of this.root_.getChildren()) {
      child.dispose();
    }

    for (const shadowGenerator of this.shadowGenerators_) {
      shadowGenerator.dispose();
    }
    this.shadowGenerators_ = [];


    const lights = [
      new Babylon.PointLight('__scene_manager_light_0__', new Babylon.Vector3(0, 40, 0), this.bScene_),
      new Babylon.PointLight('__scene_manager_light_1__', new Babylon.Vector3(20, 40, 20), this.bScene_),
      new Babylon.PointLight('__scene_manager_light_2__', new Babylon.Vector3(-20, 40, 20), this.bScene_),
      new Babylon.PointLight('__scene_manager_light_3__', new Babylon.Vector3(20, 40, -20), this.bScene_),
      new Babylon.PointLight('__scene_manager_light_4__', new Babylon.Vector3(-20, 40, -20), this.bScene_),
    ];

    for (const light of lights) {
      light.diffuse = new Babylon.Color3(1, 1, 1);
      light.intensity = 1000;
      light.intensityMode = Babylon.Light.INTENSITYMODE_AUTOMATIC;
      const gen = new Babylon.ShadowGenerator(1024, light);
      this.shadowGenerators_.push(gen);
      gen.usePoissonSampling = true;
      
    }

    


    /*if (scene.hdriUri) {
      this.bScene_.environmentTexture = new Babylon.HDRCubeTexture(scene.hdriUri, this.bScene_, 128, false, true, false, true);
    } else {
      this.bScene_.createDefaultEnvironment();
    }*/

    this.scene_ = scene;

    // Walk the scene
    const pendingNodes: [string, Node][] = Object.keys(scene.nodes).map(key => [ key, scene.nodes[key] ]);
    const mappedNodes: { [key: string]: BabylonNodeWrapper<Babylon.Node> } = {};


    while (pendingNodes.length > 0) {
      const [id, node] = pendingNodes.shift();

      // If the node has no parent, add it to the root
      if (node.parentId === undefined) {
        mappedNodes[id] = await this.addNode_(node, this.root_);
        continue;
      }

      // Otherwise, find the parent and add the node to it
      const parent = mappedNodes[node.parentId];

      // If the parent is not yet mapped, push the node back on the queue
      if (parent === undefined) {
        if (!(node.parentId in this.scene.nodes)) throw new Error(`Parent "${node.parentId}" is not defined by the scene`);
        pendingNodes.push([id, node]);
        continue;
      }

      // If the parent is mapped, add the node to the parent
      mappedNodes[id] = await this.addNode_(node, parent.node);
    }

    console.log(this.bScene_);
  }

  private pushShadow_ = (mesh: Babylon.AbstractMesh) => {
    for (const shadowGenerator of this.shadowGenerators_) {
      shadowGenerator.getShadowMap().renderList.push(mesh);
    }
  };

  private addNode_ = async (node: Node, parent?: Babylon.Node) => {
    let ret: BabylonNodeWrapper;
    
    switch (node.type) {
      case 'empty': {
        ret = new BabylonNodeWrapper(new Babylon.TransformNode(node.name, this.bScene_));
        break;
      }
      case 'object': {
        const geometry = this.scene_.geometry[node.geometryId];
        if (geometry === undefined) throw new Error(`Geometry "${node.geometryId}" is not defined by the scene (required by "${node.name}")`);
        const meshes = await buildGeometry(node.name, geometry, this.bScene_);
        
        if (meshes.length === 0) throw new Error(`No meshes could be created for "${node.name}"`);
        
        if (meshes.length === 1) {
          meshes[0].receiveShadows = true;
          this.pushShadow_(meshes[0]);
          ret = new BabylonNodeWrapper(meshes[0]);
          break;
        }

        const fakeRoot = new Babylon.TransformNode(node.name, this.bScene_);
        for (const mesh of meshes) {
          mesh.receiveShadows = true;
          this.pushShadow_(mesh);
          mesh.setParent(fakeRoot);
        }
        ret = new BabylonNodeWrapper(fakeRoot);

        break;
      }
      default: {
        throw new Error(`Unsupported node type: ${node.type}`);
      }
    }

    const origin = node.origin ?? {};
    const position = origin.position ?? Vector3.zero();
    const orientation = origin.orientation ?? Rotation.Euler.identity();
    const scale = origin.scale ?? RawVector3.ONE;

    ret.position.set(
      Distance.toCentimetersValue(position.x),
      Distance.toCentimetersValue(position.y),
      Distance.toCentimetersValue(position.z)
    );

    const quaternion = Rotation.toRawQuaternion(orientation);

    ret.rotationQuaternion = new Babylon.Quaternion(
      quaternion.x,
      quaternion.y,
      quaternion.z,
      quaternion.w
    );

    ret.scale.set(scale.x, scale.y, scale.z);

    if (node.physics) {
      const type = IMPOSTER_TYPE_MAPPINGS[node.physics.type];
      if (type === undefined) throw new Error(`Unsupported physics type: ${node.physics.type}`);

      for (const mesh of ret.meshes) {
        mesh.setParent(null);

        mesh.physicsImpostor = new Babylon.PhysicsImpostor(mesh, type, {
          mass: node.physics.mass ? Mass.toGramsValue(node.physics.mass) : 0,
          friction: node.physics.friction ?? 0.5,
          restitution: node.physics.restitution ?? 1,
        });
      }
      
    }

    return ret;
  };
}

export default SceneManager;