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
import { Color } from './state/State/Scene/Color';
import Material from './state/State/Scene/Material';

export type FrameLike = Babylon.TransformNode | Babylon.AbstractMesh;

class SceneBinding {
  private bScene_: Babylon.Scene;
  get bScene() { return this.bScene_; }

  private root_: Babylon.TransformNode;
  get root() { return this.root_; }

  private scene_: Scene;
  get scene() { return this.scene_; }
  set scene(s: Scene) { this.scene_ = s; }

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

    this.bScene_.detachControl();
    engine.inputElement = this.canvas_;
    this.camera_.attachControl(this.engineView_.target, true);
    this.bScene_.attachControl();
  }
  
  private materialIdIter_ = 0;

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

  private createMaterial_ = (id: string, material: Material) => {

    let bMaterial: Babylon.Material;
    switch (material.type) {
      case 'basic': {
        const basic = new Babylon.StandardMaterial(id, this.bScene_);
        const { color } = material;

        if (color) {
          switch (color.type) {
            case 'color3': {
              basic.diffuseColor = Color.toBabylon(color.color);
              basic.diffuseTexture = null;
              break;
            }
            case 'texture': {
              if (!color.uri) {
                basic.diffuseColor = new Babylon.Color3(0.5, 0, 0.5);
              } else {
                basic.diffuseTexture = new Babylon.Texture(color.uri, this.bScene_);
              }
              
              break;
            }
          }
        }

        bMaterial = basic;

        break;
      }
      case 'pbr': {
        const pbr = new Babylon.PBRMaterial(id, this.bScene_);
        const { albedo, ambient, emissive, metalness, reflection } = material;
    
        if (albedo) {
          switch (albedo.type) {
            case 'color3': {
              pbr.albedoColor = Color.toBabylon(albedo.color);
              break;
            }
            case 'texture': {
              pbr.albedoTexture = new Babylon.Texture(albedo.uri, this.bScene_);
              break;
            }
          }
        }

        if (ambient) {
          switch (ambient.type) {
            case 'color3': {
              pbr.ambientColor = Color.toBabylon(ambient.color);
              break;
            }
            case 'texture': {
              pbr.ambientTexture = new Babylon.Texture(ambient.uri, this.bScene_);
              break;
            }
          }
        }

        if (emissive) {
          switch (emissive.type) {
            case 'color3': {
              pbr.emissiveColor = Color.toBabylon(emissive.color);
              break;
            }
            case 'texture': {
              pbr.emissiveTexture = new Babylon.Texture(emissive.uri, this.bScene_);
              break;
            }
          }
        }
        
        if (metalness) {
          switch (metalness.type) {
            case 'color1': {
              pbr.metallic = metalness.color;
              break;
            }
            case 'texture': {
              pbr.metallicTexture = new Babylon.Texture(metalness.uri, this.bScene_);
              break;
            }
          }
        }
        
        if (reflection) {
          switch (reflection.type) {
            case 'color3': {
              pbr.reflectivityColor = Color.toBabylon(reflection.color);
              break;
            }
            case 'texture': {
              pbr.reflectivityTexture = new Babylon.Texture(reflection.uri, this.bScene_);
              break;
            }
          }
        }

        bMaterial = pbr;

        break;
      }
    }

    

    return bMaterial;
  };

  private updateMaterialBasic_ = (bMaterial: Babylon.StandardMaterial, material: Patch.InnerPatch<Material.Basic>) => {
    const { color } = material;

    if (color.type === Patch.Type.InnerChange || color.type === Patch.Type.OuterChange) {
      switch (color.next.type) {
        case 'color3': {

          bMaterial.diffuseColor = Color.toBabylon(color.next.color);
          bMaterial.diffuseTexture = null;
          break;
        }
        case 'texture': {
          if (!color.next.uri) {
            bMaterial.diffuseColor = new Babylon.Color3(0.5, 0, 0.5);
            bMaterial.diffuseTexture = null;
          } else {
            bMaterial.diffuseColor = Color.toBabylon(Color.WHITE);
            bMaterial.diffuseTexture = new Babylon.Texture(color.next.uri, this.bScene_);
          }
          break;
        }
      }
    }

    return bMaterial;
  };

  private updateMaterialPbr_ = (bMaterial: Babylon.PBRMaterial, material: Patch.InnerPatch<Material.Pbr>) => {
    const { albedo, ambient, emissive, metalness, reflection } = material;

    if (albedo.type === Patch.Type.OuterChange) {
      switch (albedo.next.type) {
        case 'color3': {
          bMaterial.albedoColor = Color.toBabylon(albedo.next.color);
          bMaterial.albedoTexture = null;
          break;
        }
        case 'texture': {
          if (!albedo.next.uri) {
            bMaterial.albedoColor = new Babylon.Color3(0.5, 0, 0.5);
          } else {
            bMaterial.albedoColor = Color.toBabylon(Color.WHITE);
            bMaterial.albedoTexture = new Babylon.Texture(albedo.next.uri, this.bScene_);
          }
          break;
        }
      }
    }

    if (ambient.type === Patch.Type.OuterChange) {
      switch (ambient.next.type) {
        case 'color3': {
          bMaterial.ambientColor = Color.toBabylon(ambient.next.color);
          bMaterial.ambientTexture = null;
          break;
        }
        case 'texture': {
          if (!ambient.next.uri) {
            bMaterial.ambientColor = new Babylon.Color3(0.5, 0, 0.5);
            bMaterial.ambientTexture = null;
          } else {
            bMaterial.ambientColor = Color.toBabylon(Color.WHITE);
            bMaterial.ambientTexture = new Babylon.Texture(ambient.next.uri, this.bScene_);
          }
          break;
        }
      }
    }

    if (emissive.type === Patch.Type.OuterChange) {
      switch (emissive.next.type) {
        case 'color3': {
          bMaterial.emissiveColor = Color.toBabylon(emissive.next.color);
          bMaterial.emissiveTexture = null;
          break;
        }
        case 'texture': {
          if (!emissive.next.uri) {
            bMaterial.emissiveColor = new Babylon.Color3(0.5, 0, 0.5);
            bMaterial.emissiveTexture = null;
          } else {
            bMaterial.emissiveColor = Color.toBabylon(Color.BLACK);
            bMaterial.emissiveTexture = new Babylon.Texture(emissive.next.uri, this.bScene_);
          }
          break;
        }
      }
    }

    if (metalness.type === Patch.Type.OuterChange) {
      switch (metalness.next.type) {
        case 'color1': {
          bMaterial.metallic = metalness.next.color;
          bMaterial.metallicTexture = null;
          break;
        }
        case 'texture': {
          if (!metalness.next.uri) {
            bMaterial.metallic = 0;
          } else {
            bMaterial.metallicTexture = new Babylon.Texture(metalness.next.uri, this.bScene_);
          }
          break;
        }
      }
    }

    if (reflection.type === Patch.Type.OuterChange) {
      switch (reflection.next.type) {
        case 'color3': {
          bMaterial.reflectivityColor = Color.toBabylon(reflection.next.color);
          bMaterial.reflectivityTexture = null;
          break;
        }
        case 'texture': {
          if (!reflection.next.uri) {
            bMaterial.reflectivityColor = new Babylon.Color3(0.5, 0, 0.5);
            bMaterial.reflectivityTexture = null;
          } else {
            bMaterial.reflectivityColor = Color.toBabylon(Color.WHITE);
            bMaterial.reflectivityTexture = new Babylon.Texture(reflection.next.uri, this.bScene_);
          }
          break;
        }
      }
    }
    
    return bMaterial;
  };

  private updateMaterial_ = (bMaterial: Babylon.Material, material: Patch<Material>) => {
    switch (material.type) {
      case Patch.Type.OuterChange: {
        const { next } = material;
        const id = bMaterial ? `${bMaterial.id}` : `Scene Material ${this.materialIdIter_++}`;
        if (bMaterial) bMaterial.dispose();
        if (next) {
          return this.createMaterial_(id, next);
        }

        return null;
      }
      case Patch.Type.InnerChange: {
        const { inner, next } = material;
        switch (next.type) {
          case 'basic': {
            return this.updateMaterialBasic_(bMaterial as Babylon.StandardMaterial, inner as Patch.InnerPatch<Material.Basic>);
          }
          case 'pbr': {
            return this.updateMaterialPbr_(bMaterial as Babylon.PBRMaterial, inner as Patch.InnerPatch<Material.Pbr>);
          }
        }
        break;
      }
    }

    return bMaterial;
  };

  private createObject_ = async (node: Node.Obj, nextScene: Scene): Promise<Babylon.Node> => {
    const parent = this.findBNode_(node.parentId, true);

    const ret = await this.buildGeometry_(node.name, nextScene.geometry[node.geometryId]);

    if (!node.visible) {
      SceneBinding.apply_(ret, m => m.isVisible = false);
    }

    if (node.material) {
      const material = this.createMaterial_(node.name, node.material);
      SceneBinding.apply_(ret, m => m.material = material);
    }

    if (node.physics) {
      const type = IMPOSTER_TYPE_MAPPINGS[node.physics.type];
      SceneBinding.apply_(ret, m => {
        const currParent = m.parent;
        m.setParent(null);
        m.physicsImpostor = new Babylon.PhysicsImpostor(m, type, {
          mass: node.physics.mass ? Mass.toGramsValue(node.physics.mass) : 0,
          restitution: node.physics.restitution ?? 0.5,
          friction: node.physics.friction ?? 5,
        });
        m.setParent(currParent);
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

      // Physics impostor needs to be updated after scale changes
      // TODO: Only do this if the scale actually changed in this update
      // TODO: Need to consider the impact of this, since it may destroy joints
      SceneBinding.apply_(bNode, m => {
        if (m.physicsImpostor) {
          const mParent = m.parent;
          m.setParent(null);
          m.physicsImpostor.setScalingUpdated();
          m.setParent(mParent);
        }
      });
    }
  };

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

  private findMaterial_ = (frameLike: FrameLike) => {
    if (frameLike instanceof Babylon.AbstractMesh) {
      return frameLike.material;
    }

    const children = frameLike.getChildren(o => o instanceof Babylon.AbstractMesh);
    if (children && children.length > 0) {
      return (children[0] as Babylon.AbstractMesh).material;
    }
    
    return null;
  };

  private updateObject_ = async (id: string, node: Patch.InnerChange<Node.Obj>, nextScene: Scene): Promise<FrameLike> => {
    const bNode = this.findBNode_(id) as FrameLike;

    // If the object's geometry ID changes, recreate the object entirely
    if (node.inner.geometryId.type === Patch.Type.OuterChange) {
      this.destroyNode_(id);
      return (await this.createNode_(id, node.next, nextScene)) as FrameLike;
    }

    if (node.inner.name.type === Patch.Type.OuterChange) {
      bNode.name = node.inner.name.next;
    }

    if (node.inner.parentId.type === Patch.Type.OuterChange) {
      const parent = this.findBNode_(node.inner.parentId.next, true);
      bNode.setParent(parent);
    }

    let bMaterial = this.findMaterial_(bNode);
    bMaterial = this.updateMaterial_(bMaterial, node.inner.material);
    SceneBinding.apply_(bNode, m => {
      m.material = bMaterial;
    });

    if (node.inner.origin.type === Patch.Type.OuterChange) {
      this.updateNodePosition_(node.next, bNode);
    }

    if (node.inner.physics.type === Patch.Type.OuterChange) {
      const nextPhysics = node.inner.physics.next;
      const type = IMPOSTER_TYPE_MAPPINGS[node.inner.physics.next.type];
      SceneBinding.apply_(bNode, m => {
        const mParent = m.parent;
        m.setParent(null);
        if (m.physicsImpostor) m.physicsImpostor.dispose();
        m.physicsImpostor = new Babylon.PhysicsImpostor(m, type, {
          mass: nextPhysics.mass ? Mass.toGramsValue(nextPhysics.mass) : 0,
          restitution: nextPhysics.restitution ?? 0.5,
          friction: nextPhysics.friction ?? 5,
        });
        m.setParent(mParent);
      });
    }

    if (node.inner.visible.type === Patch.Type.OuterChange) {
      const nextVisible = node.inner.visible.next;
      SceneBinding.apply_(bNode, m => m.isVisible = nextVisible);
    }

    return Promise.resolve(bNode);
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

  private updateNode_ = async (id: string, node: Patch<Node>, geometryPatches: Dict<Patch<Geometry>>, nextScene: Scene): Promise<Babylon.Node> => {
    switch (node.type) {
      // The node hasn't changed type, but some fields have been changed
      case Patch.Type.InnerChange: {
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

        return this.findBNode_(id);
      }
    }
  };

  private destroyNode_ = (id: string) => {
    const bNode = this.findBNode_(id);
    bNode.dispose();

    const shadowGenerator = this.shadowGenerators_[id];
    if (shadowGenerator) shadowGenerator.dispose();
  };

  private gizmoImpostors_: Dict<Babylon.PhysicsImpostor> = {};
  private gizmoManager_: Babylon.GizmoManager;

  private createArcRotateCamera_ = (camera: Camera.ArcRotate): Babylon.ArcRotateCamera => {
    const ret = new Babylon.ArcRotateCamera('botcam', 10, 10, 10, Vector3.toBabylon(camera.target, 'centimeters'), this.bScene_);
    ret.attachControl(this.bScene_.getEngine().getRenderingCanvas(), true);
    ret.position = Vector3.toBabylon(camera.position, 'centimeters');
    ret.panningSensibility = 100;
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

    const bCamera = this.camera_;

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

      removedKeys.add(nodeId);
    }

    // Now get a breadth-first sort of the remaining nodes (we need to make sure we add parents first)
    const sortedNodeIds = Scene.nodeOrdering(scene);
  
    for (const nodeId of sortedNodeIds) {
      if (removedKeys.has(nodeId)) continue;
      const node = patch.nodes[nodeId];

      this.nodes_[nodeId] = await this.updateNode_(nodeId, node, patch.geometry, scene);
    }

    if (patch.selectedNodeId.type === Patch.Type.OuterChange) {
      const { prev, next } = patch.selectedNodeId;

      // Disable physics
      if (prev !== undefined) {
        const prevNode = this.bScene_.getNodeByID(prev) || this.bScene_.getNodeByName(scene.nodes[prev].name);
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
      }
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
      }
      case Patch.Type.InnerChange: {
        if (this.camera_) this.camera_ = this.updateCamera_(patch.camera);
        else this.camera_ = this.createCamera_(patch.camera.next);
        break;
      }
    }

    if (oldCamera !== this.camera_) {
      oldCamera.detachControl(this.bScene_.getEngine().getRenderingCanvas());
      this.bScene_.detachControl();
      this.bScene_.removeCamera(oldCamera);
      this.bScene_.addCamera(this.camera_);
      this.bScene_.activeCamera = this.camera_;
      if (this.engineView_) this.camera_.attachControl(this.engineView_.target, true);
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

const IMPOSTER_TYPE_MAPPINGS: { [key in Node.Physics.Type]: number } = {
  'box': Babylon.PhysicsImpostor.BoxImpostor,
  'sphere': Babylon.PhysicsImpostor.SphereImpostor,
  'cylinder': Babylon.PhysicsImpostor.CylinderImpostor,
  'mesh': Babylon.PhysicsImpostor.MeshImpostor,
  'none': Babylon.PhysicsImpostor.NoImpostor,
};
  

export default SceneBinding;