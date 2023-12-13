import SerialU32 from '../../programming/buffers/SerialU32';
import { Command } from '../../programming/AbstractRobot/iRobotCreateCommands';
import { PhysicsConstraintAxis, AbstractMesh, PhysicsConstraintAxisLimitMode, 
  Physics6DoFConstraint } from '@babylonjs/core';

import Dict from '../../util/objectOps/Dict';
import Sensor from './sensors/Sensor';
import { SensorPacket } from '../../programming/AbstractRobot/SensorPacket';




class CreateBinding {
  private serial_: SerialU32;

  private pending_: number[];

  private root_: AbstractMesh;
  get root() { return this.root_; }

  private leftWheelJoint_: Physics6DoFConstraint;
  private rightWheelJoint_: Physics6DoFConstraint;

  private mode_: SensorPacket.OiMode.Mode = SensorPacket.OiMode.Mode.Passive;

  private leftVelocity_ = 0;
  private rightVelocity_ = 0;

  private leftEncoder_ = 0;
  private rightEncoder_ = 0;

  private distance_ = 0;
  private angle_ = 0;

  private motors_: Dict<Physics6DoFConstraint>;
  private analogSensors_: Dict<Sensor<number>>;
  private digitalSensors_: Dict<Sensor<boolean>>;


  constructor(serial: SerialU32, motors: Dict<Physics6DoFConstraint>, analogSensors: Dict<Sensor<number>>, digitalSensors: Dict<Sensor<boolean>>) {
    this.serial_ = serial;
    this.pending_ = [];
    this.motors_ = motors;
    this.leftWheelJoint_ = motors['left_wheel'];
    this.rightWheelJoint_ = motors['right_wheel'];
    this.analogSensors_ = analogSensors;
    this.digitalSensors_ = digitalSensors;
  }
  /**
   * Sets the motor to the desired velocity. Create motors operate at different scale than the demobot motors.
   * @param bMotor 
   * @param velocity 
   */
  private setMotorVelocity_ = (bMotor: Physics6DoFConstraint, velocity: number) => {
    const adjusted_velocity = velocity / 15;

    const zero = 0.0;
    const length = 0;
    if (adjusted_velocity.toFixed(length) === zero.toFixed(length)) {
      bMotor.setAxisFriction(PhysicsConstraintAxis.ANGULAR_Z, 10000000);
      bMotor.setAxisMotorMaxForce(PhysicsConstraintAxis.ANGULAR_Z, 10000000); 
      bMotor.setAxisMotorTarget(PhysicsConstraintAxis.ANGULAR_Z, 0);
    } else {
      bMotor.setAxisFriction(PhysicsConstraintAxis.ANGULAR_Z, 0);
      bMotor.setAxisMotorMaxForce(PhysicsConstraintAxis.ANGULAR_Z, 10000000); 
      bMotor.setAxisMode(PhysicsConstraintAxis.ANGULAR_Z, PhysicsConstraintAxisLimitMode.FREE);
      bMotor.setAxisMotorTarget(PhysicsConstraintAxis.ANGULAR_Z, adjusted_velocity);
    }
  };

  tick(delta: number) {
    this.pending_ = [...this.pending_, ...this.serial_.rx.popAll()];

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
        break;
      }
    }
    this.setMotorVelocity_(this.leftWheelJoint_, this.leftVelocity_);
    this.setMotorVelocity_(this.rightWheelJoint_, this.rightVelocity_);
    this.pending_ = res.nextBuffer;
  }
}

export default CreateBinding;