import {  ArcRotateCamera, Scene as babylScene, Camera as babylCamera } from '@babylonjs/core';

import Camera from "../state/State/Scene/Camera";
import { Vector3wUnits } from "../util/unit-math";



export const createArcRotateCamera = (camera: Camera.ArcRotate, bScene_: babylScene): ArcRotateCamera => {
  const ret = new ArcRotateCamera('botcam', 0, 0, 0, Vector3wUnits.toBabylon(camera.target, 'centimeters'), bScene_);
  ret.attachControl(bScene_.getEngine().getRenderingCanvas(), true);
  ret.position = Vector3wUnits.toBabylon(camera.position, 'centimeters');
  ret.panningSensibility = 100;
  // ret.checkCollisions = true;
  return ret;
};

export const createNoneCamera = (camera: Camera.None, bScene_: babylScene): ArcRotateCamera => {
  const ret = new ArcRotateCamera('botcam', 10, 10, 10, Vector3wUnits.toBabylon(Vector3wUnits.zero(), 'centimeters'), bScene_);
  ret.attachControl(bScene_.getEngine().getRenderingCanvas(), true);
  return ret;
};

export const createCamera = (camera: Camera, bScene_: babylScene): babylCamera => {
  switch (camera.type) {
    case 'arc-rotate': return createArcRotateCamera(camera, bScene_);
    case 'none': return createNoneCamera(camera, bScene_);
  }
};