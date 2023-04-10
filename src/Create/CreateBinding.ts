import SerialU32 from '../SerialU32';
import { Command } from './Command';

import { AbstractMesh as BabylonAbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { Mesh as BabylonMesh } from '@babylonjs/core/Meshes/mesh';
import { Scene as BabylonScene } from '@babylonjs/core/scene';
import { PhysicsViewer as BabylonPhysicsViewer } from '@babylonjs/core/Debug/physicsViewer';
import {
  IPhysicsEnabledObject as BabylonIPhysicsEnabledObject,
  PhysicsImpostor as BabylonPhysicsImpostor,
  PhysicsImpostorParameters as BabylonPhysicsImpostorParameters
} from '@babylonjs/core/Physics/physicsImpostor';
import { SensorPacket } from './SensorPacket';
import { Type } from 'components/documentation/common';
import Dict from '../Dict';
import Geometry from '../state/State/Robot/Geometry';
import BuiltGeometry from '../BuiltGeometry';
import { Mass } from '../util';
import { RENDER_SCALE_METERS_MULTIPLIER } from '../renderConstants';
import { fluidRenderingParticleThicknessPixelShader } from '@babylonjs/core/Shaders/fluidRenderingParticleThickness.fragment';
import { MotorEnabledJoint as BabylonMotorEnabledJoint, PhysicsJoint as BabylonPhysicsJoint, HingeJoint as BabylonHingeJoint } from '@babylonjs/core/Physics/physicsJoint';
import { CylinderBuilder as BabylonCylinderBuilder } from '@babylonjs/core/Meshes/Builders/cylinderBuilder';
import { Quaternion, Vector3 as RawVector3, clamp, Euler } from '../math';

interface RobotBindingLike {
  scene: BabylonScene;
  links: Dict<BabylonMesh>;
  colliders: Set<BabylonMesh>;
  physicsViewer: BabylonPhysicsViewer;

  buildGeometry_: (name: string, geometry: Geometry) => Promise<BuiltGeometry>;
}

class CreateBinding {
  private serial_: SerialU32;

  private pending_: number[];

  private root_: BabylonAbstractMesh;
  get root() { return this.root_; }

  private leftWheelJoint_: BabylonHingeJoint;
  private rightWheelJoint_: BabylonHingeJoint;

  private mode_: SensorPacket.OiMode.Mode = SensorPacket.OiMode.Mode.Passive;

  private leftVelocity_ = 0;
  private rightVelocity_ = 0;

  private leftEncoder_ = 0;
  private rightEncoder_ = 0;

  private distance_ = 0;
  private angle_ = 0;

  private robotBindingLike_: RobotBindingLike;

  constructor(serial: SerialU32, robotBindingLike: RobotBindingLike) {
    this.serial_ = serial;
    this.pending_ = [];

    this.robotBindingLike_ = robotBindingLike;
  }

  async build() {
    const builtGeometry = await this.robotBindingLike_.buildGeometry_('create2', {
      type: Geometry.Type.RemoteMesh,
      uri: '/static/create2.glb',
    });

    const ret = builtGeometry.mesh;

    ret.scaling.scaleInPlace(RENDER_SCALE_METERS_MULTIPLIER);
    
    const physicsImposterParams: BabylonPhysicsImpostorParameters = {
      mass: Mass.toGramsValue(Mass.grams(1000)),
      restitution: 0,
      friction: 0.5,
    };

    for (const collider of builtGeometry.colliders ?? []) {
      const bCollider = collider.mesh;
      bCollider.parent = ret;

      bCollider.physicsImpostor = new BabylonPhysicsImpostor(
        bCollider,
        collider.type,
        {
          ...physicsImposterParams,
          mass: 0,
        },
        this.robotBindingLike_.scene
      );

      bCollider.visibility = 0;
      this.robotBindingLike_.colliders.add(bCollider);
      
    }

    ret.physicsImpostor = new BabylonPhysicsImpostor(
      ret,
      BabylonPhysicsImpostor.NoImpostor,
      physicsImposterParams,
      this.robotBindingLike_.scene
    );
    
    this.robotBindingLike_.colliders.add(ret);
    if (this.robotBindingLike_.physicsViewer) this.robotBindingLike_.physicsViewer.showImpostor(ret.physicsImpostor, ret);

    this.root_ = ret;
    this.root_.visibility = 1;

    const leftWheel = BabylonCylinderBuilder.CreateCylinder('create2-left-wheel', {
      height: 2,
      diameterTop: 4,
      diameterBottom: 4,
    }, this.robotBindingLike_.scene);

    const rightWheel = BabylonCylinderBuilder.CreateCylinder('create2-right-wheel', {
      height: 2,
      diameterTop: 4,
      diameterBottom: 4,
    }, this.robotBindingLike_.scene);

    leftWheel.physicsImpostor = new BabylonPhysicsImpostor(
      ret,
      BabylonPhysicsImpostor.CylinderImpostor,
      {
        ...physicsImposterParams,
        ignoreParent: true
      },
      this.robotBindingLike_.scene
    );

    rightWheel.physicsImpostor = new BabylonPhysicsImpostor(
      ret,
      BabylonPhysicsImpostor.CylinderImpostor,
      {
        ...physicsImposterParams,
        ignoreParent: true
      },
      this.robotBindingLike_.scene
    );
    
    this.leftWheelJoint_ = new BabylonHingeJoint({
      mainAxis: RawVector3.toBabylon({ x: 1, y: 0, z: 0 }),
      connectedAxis: RawVector3.toBabylon({ x: 1, y: 0, z: 0 }),
    });

    this.rightWheelJoint_ = new BabylonHingeJoint({
      mainAxis: RawVector3.toBabylon({ x: 1, y: 0, z: 0 }),
      connectedAxis: RawVector3.toBabylon({ x: 1, y: 0, z: 0 }),
    });

    ret.physicsImpostor.addJoint(leftWheel.physicsImpostor, this.leftWheelJoint_);
    ret.physicsImpostor.addJoint(leftWheel.physicsImpostor, this.rightWheelJoint_);
    
    if (this.robotBindingLike_.physicsViewer) this.robotBindingLike_.physicsViewer.showImpostor(leftWheel.physicsImpostor, leftWheel);
    if (this.robotBindingLike_.physicsViewer) this.robotBindingLike_.physicsViewer.showImpostor(rightWheel.physicsImpostor, rightWheel);

    return ret;
  }

  tick(delta: number) {
    this.pending_ = [ ...this.pending_, ...this.serial_.rx.popAll() ];

    // Integrate left and right encoder
    this.leftEncoder_ = this.leftEncoder_ + this.leftVelocity_ * delta;
    this.rightEncoder_ = this.rightEncoder_ + this.rightVelocity_ * delta;

    // Update distance and angle
    const leftDistance = this.leftEncoder_ - this.distance_;
    const rightDistance = this.rightEncoder_ - this.distance_;

    this.distance_ = (leftDistance + rightDistance) / 2;
    this.angle_ = (rightDistance - leftDistance) / 2;
    
    const res = Command.deserialize(this.pending_);
    
    if (!res) return;

    console.log('tick res', res);
    
    switch (res.command.type) {
      case Command.Type.Safe: {
        this.mode_ = SensorPacket.OiMode.Mode.Safe;
        break;
      }
      case Command.Type.Full: {
        this.mode_ = SensorPacket.OiMode.Mode.Full;
        break;
      }
      case Command.Type.DriveDirect: {
        this.leftVelocity_ = res.command.leftVelocity;
        this.rightVelocity_ = res.command.rightVelocity;
        break;
      }
      case Command.Type.Drive: {
        const { radius, velocity } = res.command;
        if (radius === 32768 || radius === 32767) {
          // Straight
          this.leftVelocity_ = velocity;
          this.rightVelocity_ = velocity;
        } else if (radius === -1) {
          // turn in-place clockwise
          this.leftVelocity_ = velocity;
          this.rightVelocity_ = -velocity;
        } else if (radius === 1) {
          // turn in-place counter-clockwise
          this.leftVelocity_ = -velocity;
          this.rightVelocity_ = velocity;
        } else {
          // turn with radius
          const radiusVelocity = velocity / radius;
          this.leftVelocity_ = velocity + radiusVelocity;
          this.rightVelocity_ = velocity - radiusVelocity;
        }
        break;
      }
      case Command.Type.Sensors: {
        switch (res.command.packetId) {
          case SensorPacket.Type.OiMode: {
            SensorPacket.OiMode.write(this.serial_, { value: this.mode_ });
            break;
          }
          case SensorPacket.Type.Angle: {
            SensorPacket.Angle.write(this.serial_, { value: this.angle_ });
            break;
          }
          case SensorPacket.Type.Distance: {
            SensorPacket.Distance.write(this.serial_, { value: this.distance_ });
            break;
          }
        }
        break;
      }
      case Command.Type.Baud: {
        console.log('Baud code', res.command.code);
        break;
      }
    }

    this.pending_ = res.nextBuffer;
  }
}

export default CreateBinding;