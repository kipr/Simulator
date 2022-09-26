import * as Babylon from "babylonjs";
import deepNeq from "./deepNeq";
import Dict from "./Dict";
import { Quaternion, Vector2 as RawVector2, Vector3 as RawVector3 } from "./math";
import Robotable from "./Robotable";
import Scene from "./state/State/Scene";
import Camera from "./state/State/Scene/Camera";
import Geometry from "./state/State/Scene/Geometry";
import Node from "./state/State/Scene/Node";
import Patch from "./util/Patch";

import { ReferenceFrame, Rotation, Vector3 } from "./unit-math";
import { Angle, Distance, Mass, SetOps } from "./util";
import { Color } from './state/State/Scene/Color';
import Material from './state/State/Scene/Material';
import { preBuiltGeometries, preBuiltTemplates } from "./node-templates";
import RobotBinding from './RobotBinding';
import Robot from './state/State/Robot';
import AbstractRobot from './AbstractRobot';
import WorkerInstance from "./WorkerInstance";

export type FrameLike = Babylon.TransformNode | Babylon.AbstractMesh;

export interface SceneMeshMetadata {
  selected?: boolean;
}

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

  private camera_: Babylon.Camera;

  private engineView_: Babylon.EngineView;
  private ammo_: Babylon.AmmoJSPlugin;

  private robots_: Dict<Robot>;
  private robotBindings_: Dict<RobotBinding> = {};

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

  constructor(bScene: Babylon.Scene, ammo: unknown) {
    this.bScene_ = bScene;
    this.scene_ = Scene.EMPTY;
    this.ammo_ = new Babylon.AmmoJSPlugin(true, ammo);
    this.bScene_.enablePhysics(new Babylon.Vector3(0, -9.8 * 100, 0), this.ammo_);
    this.bScene_.getPhysicsEngine().setSubTimeStep(2);
    // this.physicsViewer_ = new Babylon.PhysicsViewer(this.bScene_);

    this.root_ = new Babylon.TransformNode('__scene_root__', this.bScene_);
    this.gizmoManager_ = new Babylon.GizmoManager(this.bScene_);

    this.camera_ = this.createNoneCamera_(Camera.NONE);

    this.gizmoManager_.positionGizmoEnabled = true;
    this.gizmoManager_.gizmos.positionGizmo.scaleRatio = 1.25;
    this.gizmoManager_.rotationGizmoEnabled = true;
    this.gizmoManager_.scaleGizmoEnabled = false;
    this.gizmoManager_.usePointerToAttachGizmos = false;
  }

  private static apply_ = (g: Babylon.Node, f: (m: Babylon.AbstractMesh) => void) => {
    if (g instanceof Babylon.AbstractMesh) {
      f(g);
    } else {
      (g.getChildren(c => c instanceof Babylon.AbstractMesh) as Babylon.AbstractMesh[]).forEach(f);
    }
  };

  private buildGeometry_ = async (name: string, geometry: Geometry, faceUvs?: RawVector2[]): Promise<FrameLike> => {
    let ret: FrameLike;
    switch (geometry.type) {
      case 'box': {
        ret = Babylon.BoxBuilder.CreateBox(name, {
          width: Distance.toCentimetersValue(geometry.size.x),
          height: Distance.toCentimetersValue(geometry.size.y),
          depth: Distance.toCentimetersValue(geometry.size.z),
          faceUV: this.buildGeometryFaceUvs_(faceUvs, 12),
        }, this.bScene_);
        break;
      }
      case 'sphere': {
        const bFaceUvs = this.buildGeometryFaceUvs_(faceUvs, 2)?.[0];
        ret = Babylon.SphereBuilder.CreateSphere(name, {
          // Why?? Why is a sphere defined by its diameter?
          diameter: Distance.toCentimetersValue(geometry.radius) * 2,
          frontUVs: bFaceUvs,
          sideOrientation: bFaceUvs ? Babylon.Mesh.DOUBLESIDE : undefined,
        }, this.bScene_);
        break;
      }
      case 'cylinder': {
        ret = Babylon.CylinderBuilder.CreateCylinder(name, {
          height: Distance.toCentimetersValue(geometry.height),
          diameterTop: Distance.toCentimetersValue(geometry.radius) * 2,
          diameterBottom: Distance.toCentimetersValue(geometry.radius) * 2,
          faceUV: this.buildGeometryFaceUvs_(faceUvs, 6),
        }, this.bScene_);
        break;
      }
      case 'cone': {
        ret = Babylon.CylinderBuilder.CreateCylinder(name, {
          diameterTop: 0,
          height: Distance.toCentimetersValue(geometry.height),
          diameterBottom: Distance.toCentimetersValue(geometry.radius) * 2,
          faceUV: this.buildGeometryFaceUvs_(faceUvs, 6),
        }, this.bScene_);
        break;
      }
      case 'plane': {
        ret = Babylon.PlaneBuilder.CreatePlane(name, {
          width: Distance.toCentimetersValue(geometry.size.x),
          height: Distance.toCentimetersValue(geometry.size.y),
          frontUVs: this.buildGeometryFaceUvs_(faceUvs, 2)?.[0],
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

  private buildGeometryFaceUvs_ = (faceUvs: RawVector2[] | undefined, expectedUvs: number): Babylon.Vector4[] => {
    if (faceUvs?.length !== expectedUvs) {
      return undefined;
    }

    const ret: Babylon.Vector4[] = [];
    for (let i = 0; i + 1 < faceUvs.length; i += 2) {
      ret.push(new Babylon.Vector4(faceUvs[i].x, faceUvs[i].y, faceUvs[i + 1].x, faceUvs[i + 1].y));
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

    const geometry = nextScene.geometry[node.geometryId] ?? preBuiltGeometries[node.geometryId];
    if (!geometry) {
      console.error(`node ${node.name} has invalid geometry ID: ${node.geometryId}`);
      return null;
    }

    const ret = await this.buildGeometry_(node.name, geometry, node.faceUvs);

    if (!node.visible) {
      SceneBinding.apply_(ret, m => m.isVisible = false);
    }

    if (node.material) {
      const material = this.createMaterial_(node.name, node.material);
      SceneBinding.apply_(ret, m => m.material = material);
    }

    // Create physics impostor
    SceneBinding.apply_(ret, m => this.restorePhysicsImpostor(m, node, null, nextScene));

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

  private createRobot_ = async (id: string, node: Node.Robot): Promise<RobotBinding> => {
    // This should probably be somewhere else, but it ensures this is called during
    // initial instantiation and when a new scene is loaded.
    WorkerInstance.sync(node.state);
    console.log('position', WorkerInstance.getMotor(0).position);
    const robotBinding = new RobotBinding(this.bScene_, this.physicsViewer_);
    const robot = this.robots_[node.robotId];
    if (!robot) throw new Error(`Robot by id "${node.robotId}" not found`);
    await robotBinding.setRobot(node, robot);
    // FIXME: For some reason this origin isn't respected immediately. We need to look into it.
    robotBinding.visible = false;
    setTimeout(() => {
      robotBinding.origin = node.origin || ReferenceFrame.IDENTITY;
      robotBinding.visible = node.visible ?? false;
    }, 200);
    
    this.robotBindings_[id] = robotBinding;
    return robotBinding;
  };

  private static createShadowGenerator_ = (light: Babylon.IShadowLight) => {
    const ret = new Babylon.ShadowGenerator(1024, light);
    ret.useKernelBlur = false;
    ret.blurScale = 2;
    ret.filter = Babylon.ShadowGenerator.FILTER_POISSONSAMPLING;
    return ret;
  };

  private createNode_ = async (id: string, node: Node, nextScene: Scene): Promise<Babylon.Node> => {
    let nodeToCreate: Node = node;

    // Resolve template nodes into non-template nodes by looking up the template by ID
    if (node.type === 'from-template') {
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

    let ret: Babylon.Node;
    switch (nodeToCreate.type) {
      case 'object': ret = await this.createObject_(nodeToCreate, nextScene); break;
      case 'empty': ret = this.createEmpty_(nodeToCreate); break;
      case 'directional-light': ret = this.createDirectionalLight_(id, nodeToCreate); break;
      case 'spot-light': ret = this.createSpotLight_(id, nodeToCreate); break;
      case 'point-light': ret = this.createPointLight_(id, nodeToCreate); break;
      case 'robot': await this.createRobot_(id, nodeToCreate); break;
      default: {
        console.warn('invalid node type for create node:', nodeToCreate.type);
        return null;
      }
    }

    if (!ret) return null;
    
    this.updateNodePosition_(nodeToCreate, ret);
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

    // TODO: Handle changes to faceUvs when we fully support it

    if (node.inner.origin.type === Patch.Type.OuterChange) {
      this.updateNodePosition_(node.next, bNode);
    }

    if (node.inner.physics.type === Patch.Type.OuterChange) {
      SceneBinding.apply_(bNode, m => {
        this.removePhysicsImpostor(m);
        this.restorePhysicsImpostor(m, node.next, id, nextScene);
      });
    }

    if (node.inner.visible.type === Patch.Type.OuterChange) {
      const nextVisible = node.inner.visible.next;
      SceneBinding.apply_(bNode, m => {
        m.isVisible = nextVisible;

        // Create/remove physics impostor for object becoming visible/invisible
        if (!nextVisible) {
          this.removePhysicsImpostor(m);
        } else {
          this.restorePhysicsImpostor(m, node.next, id, nextScene);
        }
      });
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

  private updateFromTemplate_ = (id: string, node: Patch.InnerChange<Node.FromTemplate>, nextScene: Scene): Promise<Babylon.Node> => {
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
          case 'robot': {
            await this.updateRobot_(id, node as Patch.InnerChange<Node.Robot>);
            return null;
          }
          case 'from-template': return this.updateFromTemplate_(id, node as Patch.InnerChange<Node.FromTemplate>, nextScene);
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

  private gizmoManager_: Babylon.GizmoManager;

  private createArcRotateCamera_ = (camera: Camera.ArcRotate): Babylon.ArcRotateCamera => {
    const ret = new Babylon.ArcRotateCamera('botcam', 10, 10, 10, Vector3.toBabylon(camera.target, 'centimeters'), this.bScene_);
    ret.attachControl(this.bScene_.getEngine().getRenderingCanvas(), true);
    ret.position = Vector3.toBabylon(camera.position, 'centimeters');
    ret.panningSensibility = 100;

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

  private restorePhysicsImpostor = (mesh: Babylon.AbstractMesh, objectNode: Node.Obj, nodeId: string, scene: Scene): void => {
    // Physics impostors should only be added to physics-enabled, visible, non-selected objects
    if (
      !objectNode.physics ||
      !objectNode.visible ||
      (nodeId && scene.selectedNodeId === nodeId) ||
      (mesh.physicsImpostor && !mesh.physicsImpostor.isDisposed)
    ) return;

    const initialParent = mesh.parent;
    mesh.setParent(null);

    const type = IMPOSTER_TYPE_MAPPINGS[objectNode.physics.type];
    mesh.physicsImpostor = new Babylon.PhysicsImpostor(mesh, type, {
      mass: objectNode.physics.mass ? Mass.toGramsValue(objectNode.physics.mass) : 0,
      restitution: objectNode.physics.restitution ?? 0.5,
      friction: objectNode.physics.friction ?? 5,
    });

    if (this.physicsViewer_) this.physicsViewer_.showImpostor(mesh.physicsImpostor);

    mesh.setParent(initialParent);
  };

  private removePhysicsImpostor = (mesh: Babylon.AbstractMesh) => {
    if (!mesh.physicsImpostor) return;

    const parent = mesh.parent;
    mesh.setParent(null);

    if (!mesh.physicsImpostor.isDisposed) mesh.physicsImpostor.dispose();
    mesh.physicsImpostor = undefined;

    mesh.setParent(parent);
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
        else if (prevNode.type === 'from-template') {
          const nodeTemplate = preBuiltTemplates[prevNode.templateId];
          if (nodeTemplate?.type === 'object') prevNodeObj = { ...nodeTemplate, ...Node.Base.upcast(prevNode) };
        }
        const prevBNode = this.bScene_.getNodeByID(prev);
        if (prevNodeObj && (prevBNode instanceof Babylon.AbstractMesh || prevBNode instanceof Babylon.TransformNode)) {
          prevBNode.metadata = { ...(prevBNode.metadata as SceneMeshMetadata || {}), selected: false };
          SceneBinding.apply_(prevBNode, m => this.restorePhysicsImpostor(m, prevNodeObj, prev, scene));
        }

        this.gizmoManager_.attachToNode(null);
      }

      // Disable physics on the now selected node
      if (next !== undefined) {
        const node = this.bScene_.getNodeByID(next);
        if (node instanceof Babylon.AbstractMesh || node instanceof Babylon.TransformNode) {
          SceneBinding.apply_(node, m => this.removePhysicsImpostor(m));
          node.metadata = { ...(node.metadata as SceneMeshMetadata || {}), selected: true };
          this.gizmoManager_.attachToNode(node);
        }
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
      
      // Creating the camera already added it to the Babylon scene, so no need to call bScene_.addCamera()
      this.bScene_.activeCamera = this.camera_;
      if (this.engineView_) this.camera_.attachControl(this.engineView_.target, true);
      this.bScene_.attachControl();
      oldCamera.dispose();
    }

    if (patch.gravity.type === Patch.Type.OuterChange) {
      this.bScene_.getPhysicsEngine().setGravity(Vector3.toBabylon(patch.gravity.next, 'centimeters'));
    }

    this.scene_ = scene;
  };

  tick(abstractRobots: Dict<AbstractRobot.Readable>): Dict<RobotBinding.TickOut> {
    const ret: Dict<RobotBinding.TickOut> = {};
    for (const nodeId in this.scene_.nodes) {
      const abstractRobot = abstractRobots[nodeId];
      if (!abstractRobot) continue;

      const robotBinding = this.robotBindings_[nodeId];
      if (!robotBinding) throw new Error(`No robot binding for node ${nodeId}`);

      ret[nodeId] = robotBinding.tick(abstractRobots[nodeId]);
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

const IMPOSTER_TYPE_MAPPINGS: { [key in Node.Physics.Type]: number } = {
  'box': Babylon.PhysicsImpostor.BoxImpostor,
  'sphere': Babylon.PhysicsImpostor.SphereImpostor,
  'cylinder': Babylon.PhysicsImpostor.CylinderImpostor,
  'mesh': Babylon.PhysicsImpostor.MeshImpostor,
  'none': Babylon.PhysicsImpostor.NoImpostor,
};

export default SceneBinding;