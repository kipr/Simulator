import { ReferenceFramewUnits } from "./unit-math";

interface Robotable {
  setOrigin(origin: ReferenceFramewUnits): void;
}

export default Robotable;