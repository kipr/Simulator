import { ReferenceFramewUnits } from "../math/UnitMath";

interface Robotable {
  setOrigin(origin: ReferenceFramewUnits): void;
}

export default Robotable;