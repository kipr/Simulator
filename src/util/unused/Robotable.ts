import { ReferenceFramewUnits } from "../math/unitMath";

interface Robotable {
  setOrigin(origin: ReferenceFramewUnits): void;
}

export default Robotable;