import SerialU32 from '../SerialU32';
import { Command } from './Command';

import { AbstractMesh as BabylonAbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { SensorPacket } from './SensorPacket';
import { Type } from 'components/documentation/common';

class CreateBinding {
  private serial_: SerialU32;

  private pending_: number[];

  private root_: BabylonAbstractMesh;
  get root() { return this.root_; }

  private mode_: SensorPacket.OiMode.Mode;

  constructor(serial: SerialU32) {
    this.serial_ = serial;
    this.pending_ = [];

    this.root_ = new BabylonAbstractMesh('create', null);
  }

  tick() {
    this.pending_ = [ ...this.pending_, ...this.serial_.rx.popAll() ];
    
    const res = Command.deserialize(this.pending_);
    console.log('tick res', res);
    
    if (!res) return;
    
    switch (res.command.type) {
      case Command.Type.Safe: {
        console.log('Safe mode');
        this.mode_ = SensorPacket.OiMode.Mode.Safe;
        break;
      }
      case Command.Type.Sensors: {
        switch (res.command.packetId) {
          case SensorPacket.Type.OiMode: {
            this.serial_.tx.pushAll(SensorPacket.OiMode.serialize({
              type: SensorPacket.Type.OiMode,
              value: this.mode_
            }));
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