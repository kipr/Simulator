import SerialU32 from '../../programming/buffers/SerialU32';
import { Command } from '../../programming/AbstractRobot/iRobotCreateCommands';
import { PhysicsConstraintAxis, AbstractMesh, PhysicsConstraintAxisLimitMode, 
  Physics6DoFConstraint } from '@babylonjs/core';

import Dict from '../../util/objectOps/Dict';
import Sensor from './sensors/Sensor';
import { SensorPacket } from '../../programming/AbstractRobot/SensorPacket';
import RobotBinding from './RobotBinding';



class CreateBinding {
  private serial_: SerialU32;

  private pending_: number[];

  private root_: AbstractMesh;
  get root() { return this.root_; }

  private leftWheelJoint_: Physics6DoFConstraint;
  private rightWheelJoint_: Physics6DoFConstraint;

  private mode_: SensorPacket.OiMode.Mode = SensorPacket.OiMode.Mode.Passive;

  public leftVelocity_ = 0;
  public rightVelocity_ = 0;

  private leftEncoder_ = 0;
  private rightEncoder_ = 0;

  private distance_ = 0;
  private angle_ = 0;

  private motors_: Dict<Physics6DoFConstraint>;
  private analogSensors_: Dict<Sensor<number>>;
  private digitalSensors_: Dict<Sensor<boolean>>;
  private analogPorts_: string[];
  private digitalPorts_: string[];

  private outstandingDigitalGetValues_: Dict<RobotBinding.OutstandingPromise<boolean>> = {};
  private outstandingAnalogGetValues_: Dict<RobotBinding.OutstandingPromise<number>> = {};

  private latestDigitalValues_: [boolean, boolean, boolean, boolean, boolean, boolean] = [false, false, false, false, false, false];
  private latestAnalogValues_: [number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0];
  private priorRes_: Command.DeserializeResult | null = null;


  constructor(serial: SerialU32, motors: Dict<Physics6DoFConstraint>, analogSensors: Dict<Sensor<number>>, digitalSensors: Dict<Sensor<boolean>>) {
    this.serial_ = serial;
    this.pending_ = [];
    this.motors_ = motors;
    this.leftWheelJoint_ = motors['left_wheel'];
    this.rightWheelJoint_ = motors['right_wheel'];
    this.analogSensors_ = analogSensors;
    this.digitalSensors_ = digitalSensors;
    this.analogPorts_ = ['left_side_reflectance_sensor', 'left_front_reflectance_sensor', 'right_front_reflectance_sensor', 'right_side_reflectance_sensor'];
    this.digitalPorts_ = ['left_side_bump', 'left_front_bump', 'right_front_bump', 'right_side_bump'];
  }
  /**
   * Sets the motor to the desired velocity. Create motors operate at different scale than the demobot motors.
   * @param bMotor 
   * @param velocity 
   */
  private setMotorVelocity_ = (bMotor: Physics6DoFConstraint, velocity: number) => {
    const adjusted_velocity = velocity / 15;

    bMotor.setAxisFriction(PhysicsConstraintAxis.ANGULAR_Z, 0);
    bMotor.setAxisMotorMaxForce(PhysicsConstraintAxis.ANGULAR_Z, 100000000); 
    bMotor.setAxisMode(PhysicsConstraintAxis.ANGULAR_Z, PhysicsConstraintAxisLimitMode.FREE);
    bMotor.setAxisMotorTarget(PhysicsConstraintAxis.ANGULAR_Z, adjusted_velocity);
  };

  tick(delta: number) {
    // Digital Sensors
    const digitalValues = [false, false, false, false];
    for (let i = 0; i < 6; ++i) {
      const digitalId = this.digitalPorts_[i];
      if (!digitalId) continue;

      const digital = this.digitalSensors_[digitalId];
      if (!digital) throw new Error(`Missing digital sensor: ${digitalId}`);

      const outstanding = this.outstandingDigitalGetValues_[digitalId];
      if (!outstanding) {
        this.outstandingDigitalGetValues_[digitalId] = RobotBinding.OutstandingPromise.create(digital.getValue());
      } else {
        if (RobotBinding.OutstandingPromise.isDone(outstanding)) {
          this.latestDigitalValues_[i] = RobotBinding.OutstandingPromise.value(outstanding);
          this.outstandingDigitalGetValues_[digitalId] = RobotBinding.OutstandingPromise.create(digital.getValue());
        }
      }

      digitalValues[i] = this.latestDigitalValues_[i];
    }

    // Analog Sensors
    const analogValues = [0, 0, 0, 0];
    for (let i = 0; i < 4; ++i) {
      const analogId = this.analogPorts_[i];
      if (!analogId) continue;

      const analog = this.analogSensors_[analogId];
      if (!analog) throw new Error(`Missing analog sensor: ${analogId}`);

      const outstanding = this.outstandingAnalogGetValues_[analogId];
      if (!outstanding) {
        this.outstandingAnalogGetValues_[analogId] = RobotBinding.OutstandingPromise.create(analog.getValue());
      } else {
        if (RobotBinding.OutstandingPromise.isDone(outstanding)) {
          this.latestAnalogValues_[i] = RobotBinding.OutstandingPromise.value(outstanding);
          this.outstandingAnalogGetValues_[analogId] = RobotBinding.OutstandingPromise.create(analog.getValue());
        }
      }

      analogValues[i] = this.latestAnalogValues_[i];
    }

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


    this.setMotorVelocity_(this.leftWheelJoint_, this.leftVelocity_);
    this.setMotorVelocity_(this.rightWheelJoint_, this.rightVelocity_);

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
        if (this.priorRes_ === res) {
          return;
        }
        this.leftVelocity_ = res.command.leftVelocity;
        this.rightVelocity_ = res.command.rightVelocity;
        break;
      }
      case Command.Type.Drive: {
        if (this.priorRes_ === res) {
          return;
        }
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
        /**
         * Sensors are read by Packet Group Membership, except OiMode which is read by Packet ID.
         * Not all sensors are implemented or supported. Unsupported sensors are commented out.
         */
        switch (res.command.packetId) {
          case SensorPacket.Type.OiMode: {
            SensorPacket.OiMode.write(this.serial_, { value: this.mode_ });
            break;
          }
          case SensorPacket.GroupType.One: {
            // Todo: Add code for bumps and cliffs
            SensorPacket.BumpsAndWheelDrops.write(this.serial_, { 
              wheelDropLeft: false,
              wheelDropRight: false,
              bumpLeft: digitalValues[0] || digitalValues[1],
              bumpRight: digitalValues[2] || digitalValues[3] });
            SensorPacket.Wall.write(this.serial_, { value: 0 });
            SensorPacket.CliffLeft.write(this.serial_, { value: 0 });
            SensorPacket.CliffFrontLeft.write(this.serial_, { value: 0 });
            SensorPacket.CliffFrontRight.write(this.serial_, { value: 0 });
            SensorPacket.CliffRight.write(this.serial_, { value: 0 });
            SensorPacket.VirtualWall.write(this.serial_, { value: 0 });
            // SensorPacket.WheelOvercurrents.write(this.serial_, { 
            //   leftWheel: false,
            //   rightWheel: false,
            //   mainBrush: false,
            //   sideBrush: false });
            // SensorPacket.DirtDetect.write(this.serial_, { value: 1 });
            break;
          }
          case SensorPacket.GroupType.Two: {
            SensorPacket.InfraredCharacterOmni.write(this.serial_, { value: 0 });
            SensorPacket.Buttons.write(this.serial_, { 
              clock: false,
              schedule: false,
              day: false,
              hour: false,
              minute: false,
              dock: false,
              spot: false,
              clean: false,
            });
            SensorPacket.Distance.write(this.serial_, { value: this.distance_ });
            SensorPacket.Angle.write(this.serial_, { value: this.angle_ });
            break;
          }
          case SensorPacket.GroupType.Three: {
            // SensorPacket.ChargingState.write(this.serial_, { value: 0 });
            // SensorPacket.Voltage.write(this.serial_, { value: 0 });
            // SensorPacket.Current.write(this.serial_, { value: 0 });
            // SensorPacket.Temperature.write(this.serial_, { value: 0 });
            // SensorPacket.BatteryCharge.write(this.serial_, { value: 0 });
            // SensorPacket.BatteryCapacity.write(this.serial_, { value: 0 });
            break;
          }
          case SensorPacket.GroupType.Four: {
            SensorPacket.WallSignal.write(this.serial_, { value: 0 });
            SensorPacket.CliffLeftSignal.write(this.serial_, { value: analogValues[0] });
            SensorPacket.CliffFrontLeftSignal.write(this.serial_, { value: analogValues[1] });
            SensorPacket.CliffFrontRightSignal.write(this.serial_, { value: analogValues[2] });
            SensorPacket.CliffRightSignal.write(this.serial_, { value: analogValues[3] });
            // SensorPacket.ChargingSourcesAvailable.write(this.serial_, { value: 0 });
            break;
          }
          case SensorPacket.GroupType.Five: {
            SensorPacket.OiMode.write(this.serial_, { value: this.mode_ });
            // SensorPacket.SongNumber.write(this.serial_, { value: 0 });
            // SensorPacket.SongPlaying.write(this.serial_, { value: 0 });
            // SensorPacket.NumberOfStreamPackets.write(this.serial_, { value: 0 });
            // SensorPacket.RequestedVelocity.write(this.serial_, { value: 0 });
            // SensorPacket.RequestedRadius.write(this.serial_, { value: 0 });
            // SensorPacket.RequestedRightVelocity.write(this.serial_, { value: 0 });
            // SensorPacket.RequestedLeftVelocity.write(this.serial_, { value: 0 });
            break;
          }
          case SensorPacket.GroupType.OneHundredOne: {
            // SensorPacket.LeftEncoderCounts.write(this.serial_, { value: 0 });
            // SensorPacket.RightEncoderCounts.write(this.serial_, { value: 0 });
            // SensorPacket.LightBumper.write(this.serial_, { value: 0 });
            // SensorPacket.LightBumpLeftSignal.write(this.serial_, { value: 0 });
            // SensorPacket.LightBumpFrontLeftSignal.write(this.serial_, { value: 0 });
            // SensorPacket.LightBumpCenterLeftSignal.write(this.serial_, { value: 0 });
            // SensorPacket.LightBumpCenterRightSignal.write(this.serial_, { value: 0 });
            // SensorPacket.LightBumpFrontRightSignal.write(this.serial_, { value: 0 });
            // SensorPacket.LightBumpRightSignal.write(this.serial_, { value: 0 });
            // SensorPacket.InfraredCharacterLeft.write(this.serial_, { value: 0 });
            // SensorPacket.InfraredCharacterRight.write(this.serial_, { value: 0 });
            // SensorPacket.LeftMotorCurrent.write(this.serial_, { value: 0 });
            // SensorPacket.RightMotorCurrent.write(this.serial_, { value: 0 });
            // SensorPacket.MainBrushMotorCurrent.write(this.serial_, { value: 0 });
            // SensorPacket.SideBrushMotorCurrent.write(this.serial_, { value: 0 });
            // SensorPacket.Stasis.write(this.serial_, { value: 0 });
            break;
          }
          default: {
            console.log('Unknown sensor packet group');
            console.log('Sensor Command ->', res.command.packetId, SensorPacket.Type[res.command.packetId]);
            break;
          }
        }
        break;
      }
      case Command.Type.Baud: {
        break;
      }
    }
    this.priorRes_ = res;
    this.setMotorVelocity_(this.leftWheelJoint_, this.leftVelocity_);
    this.setMotorVelocity_(this.rightWheelJoint_, this.rightVelocity_);
    this.pending_ = res.nextBuffer;
  }
}

export default CreateBinding;