
import { PhysicsShapeType, IPhysicsCollisionEvent, IPhysicsEnginePluginV2, PhysicsAggregate, 
  TransformNode, AbstractMesh, PhysicsViewer, ShadowGenerator, CreateBox, CreateSphere, CreateCylinder, 
  CreatePlane, Vector4, Vector3, Texture, DynamicTexture, StandardMaterial, GizmoManager, ArcRotateCamera, 
  IShadowLight, PointLight, SpotLight, DirectionalLight, Color3, PBRMaterial, Mesh, SceneLoader, EngineView,
  Scene as babylScene, Node as babylNode, Camera as babylCamera, Material as babylMaterial,
  GlowLayer, Observer, BoundingBox } from '@babylonjs/core';


export const apply = (g: babylNode, f: (m: AbstractMesh) => void) => {
  if (g instanceof AbstractMesh) {
    f(g);
  } else {
    (g.getChildren(c => c instanceof AbstractMesh) as AbstractMesh[]).forEach(f);
  }
};