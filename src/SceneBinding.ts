import { Scene as BabylonScene } from '@babylonjs/core/scene';
import { TransformNode as BabylonTransformNode } from '@babylonjs/core/Meshes/transformNode';
import { AbstractMesh as BabylonAbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { Node as BabylonNode } from '@babylonjs/core/node';
import { PhysicsViewer as BabylonPhysicsViewer } from '@babylonjs/core/Debug/physicsViewer';
import { ShadowGenerator as BabylonShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator';
import { Camera as BabylonCamera } from '@babylonjs/core/Cameras/camera';
import { AmmoJSPlugin as BabylonAmmoJSPlugin } from '@babylonjs/core/Physics/Plugins/ammoJSPlugin';
import { BoxBuilder as BabylonBoxBuilder } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { SphereBuilder as BabylonSphereBuilder } from '@babylonjs/core/Meshes/Builders/sphereBuilder';
import { CylinderBuilder as BabylonCylinderBuilder } from '@babylonjs/core/Meshes/Builders/cylinderBuilder';
import { PlaneBuilder as BabylonPlaneBuilder } from '@babylonjs/core/Meshes/Builders/planeBuilder';
import { Vector3 as BabylonVector3, Vector4 as BabylonVector4 } from '@babylonjs/core/Maths/math.vector';
import { Texture as BabylonTexture } from '@babylonjs/core/Materials/Textures/texture';
import { Material as BabylonMaterial } from '@babylonjs/core/Materials/material';
import { StandardMaterial as BabylonStandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { GizmoManager as BabylonGizmoManager } from '@babylonjs/core/Gizmos/gizmoManager';
import { ArcRotateCamera as BabylonArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { PhysicsImpostor as BabylonPhysicsImpostor } from '@babylonjs/core/Physics/physicsImpostor';
import { IShadowLight as BabylonIShadowLight } from '@babylonjs/core/Lights/shadowLight';
import { PointLight as BabylonPointLight } from '@babylonjs/core/Lights/pointLight';
import { SpotLight as BabylonSpotLight } from '@babylonjs/core/Lights/spotLight';
import { DirectionalLight as BabylonDirectionalLight } from '@babylonjs/core/Lights/directionalLight';
import { Color3 as BabylonColor3 } from '@babylonjs/core/Maths/math.color';
import { PBRMaterial as BabylonPBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { Mesh as BabylonMesh } from '@babylonjs/core/Meshes/mesh';
import { SceneLoader as BabylonSceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import { EngineView as BabylonEngineView } from '@babylonjs/core/Engines/Extensions/engine.views';
import  { GlowLayer as BabylonGlowLayer } from '@babylonjs/core/Layers/glowLayer';
import { Observer as BabylonObserver } from '@babylonjs/core/Misc/observable';
import { BoundingBox as BabylonBoundingBox } from '@babylonjs/core/Culling/boundingBox';

// eslint-disable-next-line @typescript-eslint/no-duplicate-imports -- Required import for side effects
import '@babylonjs/core/Engines/Extensions/engine.views';
import '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent';

import Dict from "./Dict";
import { Quaternion, Vector2 as RawVector2, Vector3 as RawVector3 } from "./math";
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
import LocalizedString from './util/LocalizedString';
import ScriptManager from './ScriptManager';
import { RENDER_SCALE } from './renderConstants';

export type FrameLike = BabylonTransformNode | BabylonAbstractMesh;

export interface SceneMeshMetadata {
  id: string;
  selected?: boolean;
}

class SceneBinding {
  private bScene_: BabylonScene;
  get bScene() { return this.bScene_; }

  private root_: BabylonTransformNode;
  get root() { return this.root_; }

  private scene_: Scene;
  get scene() { return this.scene_; }
  set scene(s: Scene) { this.scene_ = s; }

  private nodes_: Dict<BabylonNode> = {};

  private shadowGenerators_: Dict<BabylonShadowGenerator> = {};
  private physicsViewer_: BabylonPhysicsViewer;

  private camera_: BabylonCamera;

  private engineView_: BabylonEngineView;
  private ammo_: BabylonAmmoJSPlugin;

  private robots_: Dict<Robot>;
  private robotBindings_: Dict<RobotBinding> = {};

  private scriptManager_ = new ScriptManager();
  get scriptManager() { return this.scriptManager_; }

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

  /**
   * `declineTicks` is used for a race between initial robot origin setting and tick origin updates.
   * When this is true, the tick() method will exit immediately and return undefined.
   */
  private declineTicks_ = false;
  
  private materialIdIter_ = 0;

  constructor(bScene: BabylonScene, ammo: unknown) {
    this.bScene_ = bScene;
    this.scene_ = Scene.EMPTY;
    this.ammo_ = new BabylonAmmoJSPlugin(true, ammo);
    this.bScene_.enablePhysics(new BabylonVector3(0, -9.8 * 100, 0), this.ammo_);
    this.bScene_.getPhysicsEngine().setSubTimeStep(2);
    
    // this.physicsViewer_ = new BabylonPhysicsViewer(this.bScene_);

    this.root_ = new BabylonTransformNode('__scene_root__', this.bScene_);
    this.gizmoManager_ = new BabylonGizmoManager(this.bScene_);

    this.camera_ = this.createNoneCamera_(Camera.NONE);

    this.gizmoManager_.positionGizmoEnabled = true;
    this.gizmoManager_.gizmos.positionGizmo.scaleRatio = 1.25;
    this.gizmoManager_.rotationGizmoEnabled = true;
    this.gizmoManager_.scaleGizmoEnabled = false;
    this.gizmoManager_.usePointerToAttachGizmos = false;

    this.scriptManager_.onCollisionFiltersChanged = this.onCollisionFiltersChanged_;
    this.scriptManager_.onIntersectionFiltersChanged = this.onIntersectionFiltersChanged_;
  }

  private robotLinkOrigins_: Dict<Dict<ReferenceFrame>> = {};
  set robotLinkOrigins(robotLinkOrigins: Dict<Dict<ReferenceFrame>>) {
    this.robotLinkOrigins_ = robotLinkOrigins;
  }

  get currentRobotLinkOrigins(): Dict<Dict<ReferenceFrame>> {
    // iterate over all robots
    const ret: Dict<Dict<ReferenceFrame>> = {};
    for (const robotId in this.robotBindings_) {
      const robotBinding = this.robotBindings_[robotId];
      ret[robotId] = robotBinding.linkOrigins;
    }
    return ret;
  }

  private static apply_ = (g: BabylonNode, f: (m: BabylonAbstractMesh) => void) => {
    if (g instanceof BabylonAbstractMesh) {
      f(g);
    } else {
      (g.getChildren(c => c instanceof BabylonAbstractMesh) as BabylonAbstractMesh[]).forEach(f);
    }
  };

  private buildGeometry_ = async (name: string, geometry: Geometry, faceUvs?: RawVector2[]): Promise<FrameLike> => {
    let ret: FrameLike;
    switch (geometry.type) {
      case 'box': {
        ret = BabylonBoxBuilder.CreateBox(name, {
          width: Distance.toCentimetersValue(geometry.size.x),
          height: Distance.toCentimetersValue(geometry.size.y),
          depth: Distance.toCentimetersValue(geometry.size.z),
          faceUV: this.buildGeometryFaceUvs_(faceUvs, 12),
        }, this.bScene_);
        break;
      }
      case 'sphere': {
        const bFaceUvs = this.buildGeometryFaceUvs_(faceUvs, 2)?.[0];
        ret = BabylonSphereBuilder.CreateSphere(name, {
          // Why?? Why is a sphere defined by its diameter?
          diameter: Distance.toCentimetersValue(geometry.radius) * 2,
          frontUVs: bFaceUvs,
          sideOrientation: bFaceUvs ? BabylonMesh.DOUBLESIDE : undefined,
        }, this.bScene_);
        break;
      }
      case 'cylinder': {
        ret = BabylonCylinderBuilder.CreateCylinder(name, {
          height: Distance.toCentimetersValue(geometry.height),
          diameterTop: Distance.toCentimetersValue(geometry.radius) * 2,
          diameterBottom: Distance.toCentimetersValue(geometry.radius) * 2,
          faceUV: this.buildGeometryFaceUvs_(faceUvs, 6),
        }, this.bScene_);
        break;
      }
      case 'cone': {
        ret = BabylonCylinderBuilder.CreateCylinder(name, {
          diameterTop: 0,
          height: Distance.toCentimetersValue(geometry.height),
          diameterBottom: Distance.toCentimetersValue(geometry.radius) * 2,
          faceUV: this.buildGeometryFaceUvs_(faceUvs, 6),
        }, this.bScene_);
        break;
      }
      case 'plane': {
        ret = BabylonPlaneBuilder.CreatePlane(name, {
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
  
        const res = await BabylonSceneLoader.ImportMeshAsync(geometry.include ?? '', baseName, fileName, this.bScene_);
        if (res.meshes.length === 1) return res.meshes[0];
        ret = new BabylonTransformNode(geometry.uri, this.bScene_);
        for (const mesh of res.meshes) {
          // GLTF importer adds a __root__ mesh (always the first one) that we can ignore 
          if (mesh.name === '__root__') continue;

          mesh.setParent(ret);
        }
        break; 
      }
      default: {
        throw new Error(`Unsupported geometry type: ${geometry.type}`);
      }
    }

    if (ret instanceof BabylonAbstractMesh) {
      ret.visibility = 1;
    } else {
      const children = ret.getChildren(c => c instanceof BabylonAbstractMesh) as BabylonAbstractMesh[];
      for (const child of children) {
        child.visibility = 1;
      }
    }

    return ret;
  };

  private buildGeometryFaceUvs_ = (faceUvs: RawVector2[] | undefined, expectedUvs: number): BabylonVector4[] => {
    if (faceUvs?.length !== expectedUvs) {
      return undefined;
    }

    const ret: BabylonVector4[] = [];
    for (let i = 0; i + 1 < faceUvs.length; i += 2) {
      ret.push(new BabylonVector4(faceUvs[i].x, faceUvs[i].y, faceUvs[i + 1].x, faceUvs[i + 1].y));
    }

    return ret;
  };

  private findBNode_ = (id?: string, defaultToRoot?: boolean): BabylonNode => {
    if (id === undefined && defaultToRoot) return this.root_;
    if (id !== undefined && !(id in this.nodes_)) throw new Error(`${id} doesn't exist`);
    return this.nodes_[id];
  };

  private createMaterial_ = (id: string, material: Material) => {

    let bMaterial: BabylonMaterial;
    switch (material.type) {
      case 'basic': {
        const basic = new BabylonStandardMaterial(id, this.bScene_);
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
                basic.diffuseColor = new BabylonColor3(0.5, 0, 0.5);
              } else {
                basic.diffuseTexture = new BabylonTexture(color.uri, this.bScene_);
              }
              
              break;
            }
          }
        }

        bMaterial = basic;

        break;
      }
      case 'pbr': {
        const pbr = new BabylonPBRMaterial(id, this.bScene_);
        const { albedo, ambient, emissive, metalness, reflection } = material;
    
        if (albedo) {
          switch (albedo.type) {
            case 'color3': {
              pbr.albedoColor = Color.toBabylon(albedo.color);
              break;
            }
            case 'texture': {
              pbr.albedoTexture = new BabylonTexture(albedo.uri, this.bScene_);
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
              pbr.ambientTexture = new BabylonTexture(ambient.uri, this.bScene_);
              break;
            }
          }
        }

        if (emissive) {
          const glow = new BabylonGlowLayer('glow', this.bScene_);
          switch (emissive.type) {
            case 'color3': {
              pbr.emissiveColor = Color.toBabylon(emissive.color);
              break;
            }
            case 'texture': {
              pbr.emissiveTexture = new BabylonTexture(emissive.uri, this.bScene_);
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
              pbr.metallicTexture = new BabylonTexture(metalness.uri, this.bScene_);
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
              pbr.reflectivityTexture = new BabylonTexture(reflection.uri, this.bScene_);
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

  private updateMaterialBasic_ = (bMaterial: BabylonStandardMaterial, material: Patch.InnerPatch<Material.Basic>) => {
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
            bMaterial.diffuseColor = new BabylonColor3(0.5, 0, 0.5);
            bMaterial.diffuseTexture = null;
          } else {
            bMaterial.diffuseColor = Color.toBabylon(Color.WHITE);
            bMaterial.diffuseTexture = new BabylonTexture(color.next.uri, this.bScene_);
          }
          break;
        }
      }
    }

    return bMaterial;
  };

  private updateMaterialPbr_ = (bMaterial: BabylonPBRMaterial, material: Patch.InnerPatch<Material.Pbr>) => {
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
            bMaterial.albedoColor = new BabylonColor3(0.5, 0, 0.5);
          } else {
            bMaterial.albedoColor = Color.toBabylon(Color.WHITE);
            bMaterial.albedoTexture = new BabylonTexture(albedo.next.uri, this.bScene_);
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
            bMaterial.ambientColor = new BabylonColor3(0.5, 0, 0.5);
            bMaterial.ambientTexture = null;
          } else {
            bMaterial.ambientColor = Color.toBabylon(Color.WHITE);
            bMaterial.ambientTexture = new BabylonTexture(ambient.next.uri, this.bScene_);
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
            bMaterial.emissiveColor = new BabylonColor3(0.5, 0, 0.5);
            bMaterial.emissiveTexture = null;
          } else {
            bMaterial.emissiveColor = Color.toBabylon(Color.BLACK);
            bMaterial.emissiveTexture = new BabylonTexture(emissive.next.uri, this.bScene_);
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
            bMaterial.metallicTexture = new BabylonTexture(metalness.next.uri, this.bScene_);
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
            bMaterial.reflectivityColor = new BabylonColor3(0.5, 0, 0.5);
            bMaterial.reflectivityTexture = null;
          } else {
            bMaterial.reflectivityColor = Color.toBabylon(Color.WHITE);
            bMaterial.reflectivityTexture = new BabylonTexture(reflection.next.uri, this.bScene_);
          }
          break;
        }
      }
    }
    
    return bMaterial;
  };

  private updateMaterial_ = (bMaterial: BabylonMaterial, material: Patch<Material>) => {
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
            return this.updateMaterialBasic_(bMaterial as BabylonStandardMaterial, inner as Patch.InnerPatch<Material.Basic>);
          }
          case 'pbr': {
            return this.updateMaterialPbr_(bMaterial as BabylonPBRMaterial, inner as Patch.InnerPatch<Material.Pbr>);
          }
        }
        break;
      }
    }

    return bMaterial;
  };

  private createObject_ = async (node: Node.Obj, nextScene: Scene): Promise<BabylonNode> => {
    const parent = this.findBNode_(node.parentId, true);

    const geometry = nextScene.geometry[node.geometryId] ?? preBuiltGeometries[node.geometryId];
    if (!geometry) {
      console.error(`node ${LocalizedString.lookup(node.name, LocalizedString.EN_US)} has invalid geometry ID: ${node.geometryId}`);
      return null;
    }

    const ret = await this.buildGeometry_(node.name[LocalizedString.EN_US], geometry, node.faceUvs);

    if (!node.visible) {
      SceneBinding.apply_(ret, m => m.isVisible = false);
    }

    if (node.material) {
      const material = this.createMaterial_(node.name[LocalizedString.EN_US], node.material);
      SceneBinding.apply_(ret, m => m.material = material);
    }

    // Create physics impostor
    SceneBinding.apply_(ret, m => this.restorePhysicsImpostor(m, node, null, nextScene));

    ret.setParent(parent);

    return ret;
  };

  private createEmpty_ = (node: Node.Empty): BabylonTransformNode => {
    const parent = this.findBNode_(node.parentId, true);

    const ret = new BabylonTransformNode(node.name[LocalizedString.EN_US], this.bScene_);
    ret.setParent(parent);
    return ret;
  };

  private createDirectionalLight_ = (id: string, node: Node.DirectionalLight): BabylonDirectionalLight => {
    const ret = new BabylonDirectionalLight(node.name[LocalizedString.EN_US], RawVector3.toBabylon(node.direction), this.bScene_);

    ret.intensity = node.intensity;
    if (node.radius !== undefined) ret.radius = node.radius;
    if (node.range !== undefined) ret.range = node.range;

    this.shadowGenerators_[id] = SceneBinding.createShadowGenerator_(ret);

    return ret;
  };

  private createSpotLight_ = (id: string, node: Node.SpotLight): BabylonSpotLight => {
    const origin: ReferenceFrame = node.origin ?? {};
    const position: Vector3 = origin.position ?? Vector3.zero();
    
    const ret = new BabylonSpotLight(
      node.name[LocalizedString.EN_US],
      RawVector3.toBabylon(Vector3.toRaw(position, 'centimeters')),
      RawVector3.toBabylon(node.direction),
      Angle.toRadiansValue(node.angle),
      node.exponent,
      this.bScene_
    );

    this.shadowGenerators_[id] = SceneBinding.createShadowGenerator_(ret);

    return ret;
  };

  private createPointLight_ = (id: string, node: Node.PointLight): BabylonPointLight => {
    const origin: ReferenceFrame = node.origin ?? {};
    const position: Vector3 = origin.position ?? Vector3.zero();

    const ret = new BabylonPointLight(
      node.name[LocalizedString.EN_US],
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
    const robotBinding = new RobotBinding(this.bScene_, this.physicsViewer_);
    const robot = this.robots_[node.robotId];
    if (!robot) throw new Error(`Robot by id "${node.robotId}" not found`);
    await robotBinding.setRobot(node, robot, id);
    robotBinding.linkOrigins = this.robotLinkOrigins_[id] || {};

    // FIXME: For some reason this origin isn't respected immediately. We need to look into it.
    robotBinding.visible = false;
    const observerObj: { observer: BabylonObserver<BabylonScene> } = { observer: null };
    
    let count = 0;
    
    this.declineTicks_ = true;
    observerObj.observer = this.bScene_.onAfterRenderObservable.add((data, state) => {
      const node = this.scene_.nodes[id];
      if (!node) {
        observerObj.observer.unregisterOnNextCall = true;
        this.declineTicks_ = false;
        return;
      }

      const { origin, visible } = node;

      robotBinding.origin = origin || ReferenceFrame.IDENTITY;

      const linkOrigins = this.robotLinkOrigins_[id];
      if (linkOrigins) robotBinding.linkOrigins = linkOrigins;
      
      if (count++ < 10) return;

      robotBinding.visible = visible ?? false;
      observerObj.observer.unregisterOnNextCall = true;
      this.declineTicks_ = false;
    });

    this.robotBindings_[id] = robotBinding;

    this.syncCollisionFilters_();

    return robotBinding;
  };

  private static createShadowGenerator_ = (light: BabylonIShadowLight) => {
    const ret = new BabylonShadowGenerator(1024, light);
    ret.useKernelBlur = false;
    ret.blurScale = 2;
    ret.filter = BabylonShadowGenerator.FILTER_POISSONSAMPLING;
    return ret;
  };

  private createNode_ = async (id: string, node: Node, nextScene: Scene): Promise<BabylonNode> => {
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

    for (const scriptId of nodeToCreate.scriptIds || []) this.scriptManager_.bind(scriptId, id);

    let ret: BabylonNode;
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
    
    ret.metadata = { id } as SceneMeshMetadata;

    if (ret instanceof BabylonAbstractMesh || ret instanceof BabylonTransformNode) {
      SceneBinding.apply_(ret, m => {
        m.metadata = { id } as SceneMeshMetadata;
      });
    }

    return ret;
  };

  private updateNodePosition_ = (node: Node, bNode: BabylonNode) => {
    if (node.origin && bNode instanceof BabylonTransformNode || bNode instanceof BabylonAbstractMesh) {
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

  private updateEmpty_ = (id: string, node: Patch.InnerChange<Node.Empty>): BabylonTransformNode => {
    const bNode = this.findBNode_(id) as BabylonTransformNode;

    if (node.inner.name.type === Patch.Type.OuterChange) {
      bNode.name = node.inner.name.next[LocalizedString.EN_US];
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
    if (frameLike instanceof BabylonAbstractMesh) {
      return frameLike.material;
    }

    const children = frameLike.getChildren(o => o instanceof BabylonAbstractMesh);
    if (children && children.length > 0) {
      return (children[0] as BabylonAbstractMesh).material;
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
      bNode.name = node.inner.name.next[LocalizedString.EN_US];
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

  private updateDirectionalLight_ = (id: string, node: Patch.InnerChange<Node.DirectionalLight>): BabylonDirectionalLight => {
    const bNode = this.findBNode_(id) as BabylonDirectionalLight;

    // NYI

    return bNode;
  };

  private updateSpotLight_ = (id: string, node: Patch.InnerChange<Node.SpotLight>): BabylonSpotLight => {
    const bNode = this.findBNode_(id) as BabylonSpotLight;

    // NYI

    return bNode;
  };

  private updatePointLight_ = (id: string, node: Patch.InnerChange<Node.PointLight>): BabylonPointLight => {
    const bNode = this.findBNode_(id) as BabylonPointLight;

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

  private updateFromTemplate_ = (id: string, node: Patch.InnerChange<Node.FromTemplate>, nextScene: Scene): Promise<BabylonNode> => {
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

  private updateNode_ = async (id: string, node: Patch<Node>, geometryPatches: Dict<Patch<Geometry>>, nextScene: Scene): Promise<BabylonNode> => {
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

  private gizmoManager_: BabylonGizmoManager;

  private createArcRotateCamera_ = (camera: Camera.ArcRotate): BabylonArcRotateCamera => {
    const ret = new BabylonArcRotateCamera('botcam', 10, 10, 10, Vector3.toBabylon(camera.target, 'centimeters'), this.bScene_);
    ret.attachControl(this.bScene_.getEngine().getRenderingCanvas(), true);
    ret.position = Vector3.toBabylon(camera.position, 'centimeters');
    ret.panningSensibility = 100;

    return ret;
  };

  private createNoneCamera_ = (camera: Camera.None): BabylonArcRotateCamera => {
    const ret = new BabylonArcRotateCamera('botcam', 10, 10, 10, Vector3.toBabylon(Vector3.zero(), 'centimeters'), this.bScene_);
    ret.attachControl(this.bScene_.getEngine().getRenderingCanvas(), true);

    return ret;
  };

  private createCamera_ = (camera: Camera): BabylonCamera => {
    switch (camera.type) {
      case 'arc-rotate': return this.createArcRotateCamera_(camera);
      case 'none': return this.createNoneCamera_(camera);
    }
  };

  private updateArcRotateCamera_ = (node: Patch.InnerChange<Camera.ArcRotate>): BabylonArcRotateCamera => {
    if (!(this.camera_ instanceof BabylonArcRotateCamera)) throw new Error('Expected ArcRotateCamera');

    const bCamera = this.camera_;

    if (node.inner.target.type === Patch.Type.OuterChange) {
      bCamera.setTarget(Vector3.toBabylon(node.inner.target.next, 'centimeters'));
    }

    if (node.inner.position.type === Patch.Type.OuterChange) {
      bCamera.setPosition(Vector3.toBabylon(node.inner.position.next, 'centimeters'));
    }

    return bCamera;
  };

  private updateCamera_ = (node: Patch.InnerChange<Camera>): BabylonCamera => {
    let ret: BabylonCamera;
    switch (node.next.type) {
      case 'arc-rotate': ret = this.updateArcRotateCamera_(node as Patch.InnerChange<Camera.ArcRotate>); break;
      case 'none': ret = this.camera_; break;
    }

    return ret;
  };

  private cachedCollideCallbacks_: Dict<{
    callback: (collider: BabylonPhysicsImpostor, collidedWith: BabylonPhysicsImpostor, point: BabylonVector3) => void;
    otherImpostors: BabylonPhysicsImpostor[];
  }[]> = {};

  private restorePhysicsImpostor = (mesh: BabylonAbstractMesh, objectNode: Node.Obj, nodeId: string, scene: Scene): void => {
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
    mesh.physicsImpostor = new BabylonPhysicsImpostor(mesh, type, {
      mass: objectNode.physics.mass ? Mass.toGramsValue(objectNode.physics.mass) : 0,
      restitution: objectNode.physics.restitution ?? 0.5,
      friction: objectNode.physics.friction ?? 5,
    });

    if (this.physicsViewer_) this.physicsViewer_.showImpostor(mesh.physicsImpostor);

    mesh.setParent(initialParent);

    this.syncCollisionFilters_();
  };

  
  private removePhysicsImpostor = (mesh: BabylonAbstractMesh) => {
    if (!mesh.physicsImpostor) return;

    const parent = mesh.parent;
    mesh.setParent(null);

    if (!mesh.physicsImpostor.isDisposed) mesh.physicsImpostor.dispose();
    mesh.physicsImpostor = undefined;

    mesh.setParent(parent);

    this.syncCollisionFilters_();
  };

  private collisionFilters_: Dict<Set<string>> = {};
  private intersectionFilters_: Dict<Set<string>> = {};

  private syncCollisionFilters_ = () => {
    for (const nodeId in this.collisionFilters_) {
      const meshes = this.nodeMeshes_(nodeId);
      if (meshes.length === 0) continue;

      const impostors = meshes
        .map(mesh => mesh.physicsImpostor)
        .filter(impostor => impostor && !impostor.isDisposed);

      if (impostors.length === 0) continue;

      const filterIds = this.collisionFilters_[nodeId];

      const otherImpostors = Array.from(filterIds)
        .map(id => this.nodeMeshes_(id))
        .reduce((acc, val) => [...acc, ...val], [])
        .filter(mesh => mesh && mesh.physicsImpostor)
        .map(mesh => mesh.physicsImpostor);

      for (const impostor of impostors) {
        impostor._onPhysicsCollideCallbacks = [{
          callback: this.onCollideEvent_,
          otherImpostors,
        }];
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
    collider: BabylonPhysicsImpostor,
    collidedWith: BabylonPhysicsImpostor,
    point: BabylonVector3
  ) => {
    if (!('metadata' in collider.object)) return;
    if (!('metadata' in collidedWith.object)) return;

    const colliderMetadata = collider.object['metadata'] as SceneMeshMetadata;
    const collidedWithMetadata = collidedWith.object['metadata'] as SceneMeshMetadata;

    if (!colliderMetadata) return;
    if (!collidedWithMetadata) return;

    this.scriptManager_.trigger(ScriptManager.Event.collision({
      nodeId: colliderMetadata.id,
      otherNodeId: collidedWithMetadata.id,
      point: Vector3.fromRaw(RawVector3.fromBabylon(point), RENDER_SCALE),
    }));
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
        if (prevNodeObj && (prevBNode instanceof BabylonAbstractMesh || prevBNode instanceof BabylonTransformNode)) {
          prevBNode.metadata = { ...(prevBNode.metadata as SceneMeshMetadata), selected: false };
          SceneBinding.apply_(prevBNode, m => this.restorePhysicsImpostor(m, prevNodeObj, prev, scene));
        }

        this.gizmoManager_.attachToNode(null);
      }

      // Disable physics on the now selected node
      if (next !== undefined) {
        const node = this.bScene_.getNodeByID(next);
        if (node instanceof BabylonAbstractMesh || node instanceof BabylonTransformNode) {
          SceneBinding.apply_(node, m => this.removePhysicsImpostor(m));
          node.metadata = { ...(node.metadata as SceneMeshMetadata), selected: true };
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

  private nodeMeshes_ = (id: string): BabylonAbstractMesh[] => {
    if (id in this.robotBindings_) return Dict.values(this.robotBindings_[id].links);
    
    const bNode = this.findBNode_(id);
    if (bNode && bNode instanceof BabylonAbstractMesh) return [bNode];

    return [];
  };

  private nodeMinMaxes_ = (id: string): { min: BabylonVector3; max: BabylonVector3; }[] => {
    const meshes = this.nodeMeshes_(id);
    if (meshes.length === 0) return [];

    const ret: { min: BabylonVector3; max: BabylonVector3; }[] = [];
    for (const mesh of meshes) ret.push(mesh.getHierarchyBoundingVectors());

    return ret;
  };

  private nodeBoundingBoxes_ = (id: string): BabylonBoundingBox[] => this.nodeMinMaxes_(id)
    .map(({ min, max }) => new BabylonBoundingBox(min, max));

  tick(abstractRobots: Dict<AbstractRobot.Readable>): Dict<RobotBinding.TickOut> {
    if (this.declineTicks_) return undefined;

    const ret: Dict<RobotBinding.TickOut> = {};
    for (const nodeId in this.scene_.nodes) {
      const abstractRobot = abstractRobots[nodeId];
      if (!abstractRobot) continue;

      const robotBinding = this.robotBindings_[nodeId];
      if (!robotBinding) throw new Error(`No robot binding for node ${nodeId}`);

      ret[nodeId] = robotBinding.tick(abstractRobots[nodeId]);
    }

    // Update intersections
    for (const nodeId in this.intersectionFilters_) {
      const nodeBoundingBoxes = this.nodeBoundingBoxes_(nodeId);
      const filterIds = this.intersectionFilters_[nodeId];
      for (const filterId of filterIds) {
        const filterMinMaxes = this.nodeMinMaxes_(filterId);

        let intersection = false;
        for (const nodeBoundingBox of nodeBoundingBoxes) {
          for (const filterMinMax of filterMinMaxes) {
            intersection = nodeBoundingBox.intersectsMinMax(filterMinMax.min, filterMinMax.max);
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
  'box': BabylonPhysicsImpostor.BoxImpostor,
  'sphere': BabylonPhysicsImpostor.SphereImpostor,
  'cylinder': BabylonPhysicsImpostor.CylinderImpostor,
  'mesh': BabylonPhysicsImpostor.MeshImpostor,
  'none': BabylonPhysicsImpostor.NoImpostor,
};

export default SceneBinding;