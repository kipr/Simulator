
import * as Babylon from "babylonjs";
import deepNeq from "./deepNeq";
import Dict from "./Dict";
import { Quaternion, Vector3 as RawVector3 } from "./math";
import Scene from "./state/State/Scene";
import Geometry from "./state/State/Scene/Geometry";
import Node from "./state/State/Scene/Node";
import { ReferenceFrame, Rotation, Vector3 } from "./unit-math";
import { Angle, Distance, Mass, SetOps } from "./util";

export type FrameLike = Babylon.TransformNode | Babylon.AbstractMesh;

interface SceneBinding {
  root: Babylon.TransformNode;
  // TODO: Eventually use this and have instancing
  // geometry: Dict<[ Geometry, FrameLike ]>;
  nodes: Dict<[ Node, Babylon.Node ]>;

  shadowGenerators: Dict<Babylon.ShadowGenerator>;

  physicsViewer: Babylon.PhysicsViewer;
}

const IMPOSTER_TYPE_MAPPINGS: { [key: string]: number } = {
  'box': Babylon.PhysicsImpostor.BoxImpostor,
  'sphere': Babylon.PhysicsImpostor.SphereImpostor,
  'mesh': Babylon.PhysicsImpostor.MeshImpostor,
};
  

namespace SceneBinding {
  const buildGeometry = async (name: string, geometry: Geometry, bScene: Babylon.Scene): Promise<FrameLike> => {
    let ret: FrameLike;
    switch (geometry.type) {
      case 'box': {
        ret = Babylon.BoxBuilder.CreateBox(name, {
          width: Distance.toCentimetersValue(geometry.size.x),
          height: Distance.toCentimetersValue(geometry.size.y),
          depth: Distance.toCentimetersValue(geometry.size.z)
        }, bScene);
        break;
      }
      case 'sphere': {
        ret = Babylon.SphereBuilder.CreateSphere(name, {
          // Why?? Why is a sphere defined by its diameter?
          diameter: Distance.toCentimetersValue(geometry.radius) * 2,
        }, bScene);
        break;
      }
      case 'cylinder': {
        ret = Babylon.CylinderBuilder.CreateCylinder(name, {
          height: Distance.toCentimetersValue(geometry.height),
          diameterTop: Distance.toCentimetersValue(geometry.radius) * 2,
          diameterBottom: Distance.toCentimetersValue(geometry.radius) * 2,
        }, bScene);
        break;
      }
      case 'plane': {
        ret = Babylon.PlaneBuilder.CreatePlane(name, {
          width: Distance.toCentimetersValue(geometry.size.x),
          height: Distance.toCentimetersValue(geometry.size.y),
        }, bScene);
        break;
      }
      case 'file': {
        const index = geometry.uri.lastIndexOf('/');
        const fileName = geometry.uri.substring(index + 1);
        const baseName = geometry.uri.substring(0, index + 1);
  
        const res = await Babylon.SceneLoader.ImportMeshAsync(geometry.include ?? '', baseName, fileName, bScene);
        if (res.meshes.length === 1) return res.meshes[0];
        ret = new Babylon.TransformNode(geometry.uri, bScene);
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

  const apply = (g: FrameLike, f: (m: Babylon.AbstractMesh) => void) => {
    if (g instanceof Babylon.AbstractMesh) {
      f(g);
    } else {
      (g.getChildren(c => c instanceof Babylon.AbstractMesh) as Babylon.AbstractMesh[]).forEach(f);
    }
  };

  const createNode = async (id: string, node: Node, binding: SceneBinding, scene: Scene, bScene: Babylon.Scene) => {
    let bNode: Babylon.Node;
    const parent = node.parentId ? binding.nodes[node.parentId][1] : binding.root;
    switch (node.type) {
      case 'object': {
        const g = await buildGeometry(node.name, scene.geometry[node.geometryId], bScene);
        g.setParent(parent);

        if (node.physics) {
          const type = IMPOSTER_TYPE_MAPPINGS[node.physics.type];
          apply(g, m => {
            // m.setParent(null);
            m.physicsImpostor = new Babylon.PhysicsImpostor(m, type, {
              mass: node.physics.mass ? Mass.toGramsValue(node.physics.mass) : 0,
              restitution: node.physics.restitution ?? 1,
              friction: node.physics.friction ?? 5,
            });
          });
        }

        bNode = g;
        break;
      }
      case 'empty': {
        const t = new Babylon.TransformNode(node.name, bScene);
        t.setParent(parent);
        bNode = t;
        break;
      }
      case 'directional-light': {
        const light = new Babylon.DirectionalLight(node.name, RawVector3.toBabylon(node.direction), bScene);
        
        binding.shadowGenerators[id] = new Babylon.ShadowGenerator(1024, light);

        light.intensity = node.intensity;
        if (node.radius !== undefined) light.radius = node.radius;
        if (node.range !== undefined) light.range = node.range;
        
        break;
      }
      case 'spot-light': {
        const origin: ReferenceFrame = node.origin ?? {};
        const position: Vector3 = origin.position ?? Vector3.zero();
        
        const light = new Babylon.SpotLight(
          node.name,
          RawVector3.toBabylon(Vector3.toRaw(position, 'centimeters')),
          RawVector3.toBabylon(node.direction),
          Angle.toRadiansValue(node.angle),
          node.exponent,
          bScene
        );

        binding.shadowGenerators[id] = new Babylon.ShadowGenerator(1024, light);
        
        bNode = light;

        break;
      }
      case 'point-light': {
        const origin: ReferenceFrame = node.origin ?? {};
        const position: Vector3 = origin.position ?? Vector3.zero();

        const light = new Babylon.PointLight(
          node.name,
          RawVector3.toBabylon(Vector3.toRaw(position, 'centimeters')),
          bScene
        );

        binding.shadowGenerators[id] = new Babylon.ShadowGenerator(1024, light);
        
        light.intensity = node.intensity;

        bNode = light;
        break;
      }
    }

    if (id in binding.shadowGenerators) {
      const shadowGenerator = binding.shadowGenerators[id];
      shadowGenerator.useKernelBlur = false;
      shadowGenerator.blurScale = 2;
      shadowGenerator.filter = Babylon.ShadowGenerator.FILTER_POISSONSAMPLING;
    }
    
    return bNode;
  };

  const mapBNode = (bNode: Babylon.Node, node: Node): void => {
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
  };

  export const create = async (scene: Scene, bScene: Babylon.Scene) => {
    const ret: SceneBinding = {
      root: new Babylon.TransformNode('__scene_root__', bScene),
      // geometry: {},
      nodes: {},
      shadowGenerators: {},
      physicsViewer: new Babylon.PhysicsViewer(bScene),
    };

    /*for (const geometryId of Object.keys(scene.geometry)) {
      const geometry = scene.geometry[geometryId];
      const bGeometry = await buildGeometry(geometryId, geometry, bScene);
      

      ret.geometry[geometryId] = [ geometry, bGeometry ];
    }*/

    // Create a queue of nodes sorted by parent
    const nodeIds = Scene.nodeOrdering(scene);

    for (const nodeId of nodeIds) {
      const node = scene.nodes[nodeId];
      const bNode = await createNode(nodeId, node, ret, scene, bScene);
      mapBNode(bNode, node);
      ret.nodes[nodeId] = [ node, bNode ];
    }

    for (const nodeId of nodeIds) {
      const node = ret.nodes[nodeId][1];

      if (!(node instanceof Babylon.TransformNode || node instanceof Babylon.AbstractMesh)) {
        continue;
      }
      
      for (const [ id, shadowGenerator ] of Dict.toList(ret.shadowGenerators)) {
        apply(node, m => {
          shadowGenerator.addShadowCaster(m);
        });
      }
    }

    console.log(nodeIds, ret);

    return ret;
  };

  export const update = async (scene: Scene, bScene: Babylon.Scene, binding: SceneBinding) => {
    /*const addedGeometry = SetOps.difference(Dict.keySet(scene.geometry), Dict.keySet(binding.geometry));
    const removedGeometry = SetOps.difference(Dict.keySet(binding.geometry), Dict.keySet(scene.geometry));
    const changedGeometry = SetOps.filter(
      SetOps.difference(SetOps.difference(Dict.keySet(binding.geometry), addedGeometry), removedGeometry),
      (geometryId: string) => deepNeq(scene.geometry[geometryId], binding.geometry[geometryId][0])
    );

    for (const geometryId of addedGeometry) {
      const geometry = scene.geometry[geometryId];
      binding.geometry[geometryId] = [ geometry, await buildGeometry(geometryId, geometry, bScene) ];
    }

    for (const geometryId of removedGeometry) {
      const [ geometry, bNode ] = binding.geometry[geometryId];
      bNode.dispose();
      delete binding.geometry[geometryId];
    }

    for (const geometryId of changedGeometry) {
      const [ oldGeometry, bNode ] = binding.geometry[geometryId];
      const newGeometry = scene.geometry[geometryId];
      bNode.dispose();
      binding.geometry[geometryId] = [ newGeometry, await buildGeometry(geometryId, newGeometry, bScene) ];
    }*/

    const addedNodes = SetOps.difference(Dict.keySet(scene.nodes), Dict.keySet(binding.nodes));
    const removedNodes = SetOps.difference(Dict.keySet(binding.nodes), Dict.keySet(scene.nodes));
    const changedNodes = SetOps.filter(
      SetOps.difference(SetOps.difference(Dict.keySet(binding.nodes), addedNodes), removedNodes),
      (nodeId: string) => deepNeq(scene.nodes[nodeId], binding.nodes[nodeId][0])
    );

      console.log({
        addedNodes,
        removedNodes,
        changedNodes
      });

    for (const nodeId of addedNodes) {
      const node = scene.nodes[nodeId];
      const bNode = await createNode(nodeId, node, binding, scene, bScene);
      mapBNode(bNode, node);
      binding.nodes[nodeId] = [ node, bNode ];
    }

    for (const nodeId of removedNodes) {
      const [ node, bNode ] = binding.nodes[nodeId];
      bNode.dispose();
      delete binding.nodes[nodeId];
    }

    for (const nodeId of changedNodes) {
      let [ oldNode, bNode ] = binding.nodes[nodeId];
      const newNode = scene.nodes[nodeId];
      bNode.dispose();

      if (oldNode.type !== newNode.type) {
        bNode = await createNode(nodeId, newNode, binding, scene, bScene);
      }

      binding.nodes[nodeId] = [ newNode, bNode ];
      mapBNode(bNode, newNode);
    }
  };
}

export default SceneBinding;