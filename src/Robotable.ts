import { ReferenceFrame, Vector3 } from "./unit-math";

interface Robotable {
  setOrigin(origin: ReferenceFrame): void;
}

export default Robotable;