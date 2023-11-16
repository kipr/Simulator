import { Texture, DynamicTexture, StandardMaterial, Color3, PBRMaterial, 
  Scene as babylScene, Material as babylMaterial, GlowLayer } from '@babylonjs/core';

import Material from '../state/State/Scene/Material';
import { Color } from '../state/State/Scene/Color';
import Patch from "../util/redux/Patch";



export const createMaterial = (id: string, material: Material, bScene_: babylScene) => {
  let bMaterial: babylMaterial;
  switch (material.type) {
    case 'basic': {
      const basic = new StandardMaterial(id, bScene_);
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
              basic.diffuseColor = new Color3(0.5, 0, 0.5);
            } else {
              if (id.includes('Sky')) {
                basic.reflectionTexture = new Texture(color.uri, bScene_);
                basic.reflectionTexture.coordinatesMode = Texture.FIXED_EQUIRECTANGULAR_MODE;
                basic.backFaceCulling = false;
                basic.disableLighting = true;
              } else if (id === 'Container') {
                const myDynamicTexture = new DynamicTexture("dynamic texture", 1000, bScene_, true);
                // myDynamicTexture.drawText(material.text, 130, 600, "18px Arial", "white", "gray", true);
                myDynamicTexture.drawText(color.uri, 130, 600, "18px Arial", "white", "gray", true);
                basic.diffuseTexture = myDynamicTexture;
              } else {
                basic.bumpTexture = new Texture(color.uri, bScene_, false, false);
                basic.emissiveTexture = new Texture(color.uri, bScene_, false, false);
                basic.diffuseTexture = new Texture(color.uri, bScene_, false, false);
                basic.diffuseTexture.coordinatesMode = Texture.FIXED_EQUIRECTANGULAR_MODE;
                basic.backFaceCulling = false;
              }
            }
            break;
          }
        }
      }
      bMaterial = basic;
      break;
    }
    case 'pbr': {
      const pbr = new PBRMaterial(id, bScene_);
      const { albedo, ambient, emissive, metalness, reflection } = material;
      if (albedo) {
        switch (albedo.type) {
          case 'color3': {
            pbr.albedoColor = Color.toBabylon(albedo.color);
            break;
          }
          case 'texture': {
            pbr.albedoTexture = new Texture(albedo.uri, bScene_);
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
            pbr.ambientTexture = new Texture(ambient.uri, bScene_);
            break;
          }
        }
      }
      if (emissive) {
        const glow = new GlowLayer('glow', bScene_);
        switch (emissive.type) {
          case 'color3': {
            pbr.emissiveColor = Color.toBabylon(emissive.color);
            break;
          }
          case 'texture': {
            pbr.emissiveTexture = new Texture(emissive.uri, bScene_);
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
            pbr.metallicTexture = new Texture(metalness.uri, bScene_);
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
            pbr.reflectivityTexture = new Texture(reflection.uri, bScene_);
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

export const updateMaterialBasic = (bMaterial: StandardMaterial, material: Patch.InnerPatch<Material.Basic>, bScene_: babylScene) => {
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
          bMaterial.diffuseColor = new Color3(0.5, 0, 0.5);
          bMaterial.diffuseTexture = null;
        } else if (color.next.uri[0] !== '/') {
          const myDynamicTexture = new DynamicTexture("dynamic texture", 1000, bScene_, true);
          // myDynamicTexture.drawText(material.text, 130, 600, "18px Arial", "white", "gray", true);
          myDynamicTexture.drawText(color.next.uri, 130, 600, "18px Arial", "white", "gray", true);
          bMaterial.diffuseTexture = myDynamicTexture;
        } else {
          bMaterial.diffuseColor = Color.toBabylon(Color.WHITE);
          bMaterial.diffuseTexture = new Texture(color.next.uri, bScene_);
        }
        break;
      }
    }
  }
  return bMaterial;
};

export const updateMaterialPbr = (bMaterial: PBRMaterial, material: Patch.InnerPatch<Material.Pbr>, bScene_: babylScene) => {
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
          bMaterial.albedoColor = new Color3(0.5, 0, 0.5);
        } else {
          bMaterial.albedoColor = Color.toBabylon(Color.WHITE);
          bMaterial.albedoTexture = new Texture(albedo.next.uri, bScene_);
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
          bMaterial.ambientColor = new Color3(0.5, 0, 0.5);
          bMaterial.ambientTexture = null;
        } else {
          bMaterial.ambientColor = Color.toBabylon(Color.WHITE);
          bMaterial.ambientTexture = new Texture(ambient.next.uri, bScene_);
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
          bMaterial.emissiveColor = new Color3(0.5, 0, 0.5);
          bMaterial.emissiveTexture = null;
        } else {
          bMaterial.emissiveColor = Color.toBabylon(Color.BLACK);
          bMaterial.emissiveTexture = new Texture(emissive.next.uri, bScene_);
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
          bMaterial.metallicTexture = new Texture(metalness.next.uri, bScene_);
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
          bMaterial.reflectivityColor = new Color3(0.5, 0, 0.5);
          bMaterial.reflectivityTexture = null;
        } else {
          bMaterial.reflectivityColor = Color.toBabylon(Color.WHITE);
          bMaterial.reflectivityTexture = new Texture(reflection.next.uri, bScene_);
        }
        break;
      }
    }
  }
  
  return bMaterial;
};

