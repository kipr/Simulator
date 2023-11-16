import { ShadowGenerator,  IShadowLight, PointLight, SpotLight, DirectionalLight,
  Scene as babylScene } from '@babylonjs/core';

import Node from "../state/State/Scene/Node";
import Dict from "../util/objectOps/Dict";
import { ReferenceFramewUnits, RotationwUnits, Vector3wUnits } from "../util/math/UnitMath";
import { RawQuaternion, RawVector2, RawVector3 } from "../util/math/math";
import LocalizedString from '../util/LocalizedString';
import { Angle, Distance, Mass, SetOps } from "../util";


export const createDirectionalLight = (id: string, node: Node.DirectionalLight, bScene_: babylScene, shadowGenerators_: Dict<ShadowGenerator>): DirectionalLight => {
  const ret = new DirectionalLight(node.name[LocalizedString.EN_US], RawVector3.toBabylon(node.direction), bScene_);
  ret.intensity = node.intensity;
  if (node.radius !== undefined) ret.radius = node.radius;
  if (node.range !== undefined) ret.range = node.range;
  shadowGenerators_[id] = createShadowGenerator_(ret);
  return ret;
};

export const createSpotLight = (id: string, node: Node.SpotLight, bScene_: babylScene, shadowGenerators_: Dict<ShadowGenerator>): SpotLight => {
  const origin: ReferenceFramewUnits = node.origin ?? {};
  const position: Vector3wUnits = origin.position ?? Vector3wUnits.zero();
  
  const ret = new SpotLight(
    node.name[LocalizedString.EN_US],
    RawVector3.toBabylon(Vector3wUnits.toRaw(position, 'centimeters')),
    RawVector3.toBabylon(node.direction),
    Angle.toRadiansValue(node.angle),
    node.exponent,
    bScene_
  );
  shadowGenerators_[id] = createShadowGenerator_(ret);
  return ret;
};

export const createPointLight = (id: string, node: Node.PointLight, bScene_: babylScene, shadowGenerators_: Dict<ShadowGenerator>): PointLight => {
  const origin: ReferenceFramewUnits = node.origin ?? {};
  const position: Vector3wUnits = origin.position ?? Vector3wUnits.zero();
  const ret = new PointLight(
    node.name[LocalizedString.EN_US],
    RawVector3.toBabylon(Vector3wUnits.toRaw(position, 'centimeters')),
    bScene_
  );
  ret.intensity = node.intensity;
  
  shadowGenerators_[id] = createShadowGenerator_(ret);
  ret.setEnabled(node.visible);
  return ret;
};

const createShadowGenerator_ = (light: IShadowLight) => {
  const ret = new ShadowGenerator(1024, light);
  ret.useKernelBlur = false;
  ret.blurScale = 2;
  ret.filter = ShadowGenerator.FILTER_POISSONSAMPLING;
  return ret;
};
