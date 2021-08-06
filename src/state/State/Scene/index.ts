import Dict from '../../../Dict';
import Geometry from './Geometry';
import Node from './Node';
import Script from './Script';

interface Scene {
  name: string;
  authorId: string;
  description: string;

  geometry: Dict<Geometry>;
  nodes: Dict<Node>;
  scripts?: Dict<Script>;
}

export default Scene;
