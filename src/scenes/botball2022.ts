import Scene from "../state/State/Scene";
import Camera from "../state/State/Scene/Camera";
import { Distance, Mass } from "../util";

export const BOTBALL_2022: Scene = {
  name: '2022 Botball Game Table',
  description: 'The 2022 Botball Game Table.',
  authorId: 'KIPR',
  geometry: {
    'table': {
      type: 'file',
      uri: 'static/arena.glb'
    },
    'botball_game_table_static_meshes': {
      type: 'file',
      uri: 'static/2022 Game Table Static Meshes.glb'
    },
    'botball_game_table_static_colliders': {
      type: 'file',
      uri: 'static/2022 Game Table Static Colliders.glb'
    },
    'botball_game_table_spinner_a_meshes': {
      type: 'file',
      uri: 'static/2022 Game Table Spinner A Meshes.glb'
    },
    'botball_game_table_spinner_a_colliders': {
      type: 'file',
      uri: 'static/2022 Game Table Spinner A Colliders.glb'
    },
    'botball_game_table_spinner_b_meshes': {
      type: 'file',
      uri: 'static/2022 Game Table Spinner B Meshes.glb'
    },
    'botball_game_table_spinner_b_colliders': {
      type: 'file',
      uri: 'static/2022 Game Table Spinner B Colliders.glb'
    },
    'botball_game_table_door_a_meshes': {
      type: 'file',
      uri: 'static/2022 Game Table Door A Meshes.glb'
    },
    'botball_game_table_door_a_colliders': {
      type: 'file',
      uri: 'static/2022 Game Table Door A Colliders.glb'
    },
    'botball_game_table_door_b_meshes': {
      type: 'file',
      uri: 'static/2022 Game Table Door B Meshes.glb'
    },
    'botball_game_table_door_b_colliders': {
      type: 'file',
      uri: 'static/2022 Game Table Door B Colliders.glb'
    },
  },
  nodes: {
    'table': {
      type: 'object',
      geometryId: 'table',
      name: 'A Table',
      origin: {
        scale: {
          x: 30,
          y: 30,
          z: 30,
        }
      },
      physics: {
        type: 'mesh',
        restitution: 0,
        friction: 1
      },
      visible: true,
    },
    'botball_game_table_static_meshes': {
      type: 'object',
      geometryId: 'botball_game_table_static_meshes',
      name: '2022 Botball Game Table',
      origin: {
        position: {
          x: Distance.meters(0),
          y: Distance.meters(1.03),
          z: Distance.meters(0),
        },
        scale: {
          x: 100,
          y: 100,
          z: 100,
        }
      },
      visible: true,
    },
    'botball_game_table_static_colliders': {
      type: 'object',
      geometryId: 'botball_game_table_static_colliders',
      name: '2022 Botball Game Table Colliders',
      origin: {
        position: {
          x: Distance.meters(0),
          y: Distance.meters(1.03),
          z: Distance.meters(0),
        },
        scale: {
          x: 100,
          y: 100,
          z: 100,
        }
      },
      visible: false,
      physics: {
        type: 'mesh',
        restitution: 0,
        friction: 1
      },
    },
    'botball_game_table_spinner_a_colliders': {
      type: 'object',
      geometryId: 'botball_game_table_spinner_a_colliders',
      name: 'Spinner A Colliders',
      origin: {
        position: {
          x: Distance.meters(0),
          y: Distance.meters(1.03),
          z: Distance.meters(0),
        },
        scale: {
          x: 100,
          y: 100,
          z: 100,
        }
      },
      visible: false,
      physics: {
        type: 'mesh',
        restitution: 0,
        friction: 1
      },
    },
    'botball_game_table_spinner_a_meshes': {
      type: 'object',
      geometryId: 'botball_game_table_spinner_a_meshes',
      // parentId: 'A Spinner.001',
      name: 'Spinner A',
      origin: {
        position: {
          x: Distance.meters(0),
          y: Distance.meters(1.03),
          z: Distance.meters(0),
        },
        scale: {
          x: 100,
          y: 100,
          z: 100,
        }
      },
      visible: true,
    },
    'botball_game_table_spinner_b_meshes': {
      type: 'object',
      geometryId: 'botball_game_table_spinner_b_meshes',
      name: 'Spinner B',
      origin: {
        position: {
          x: Distance.meters(0),
          y: Distance.meters(1.03),
          z: Distance.meters(0),
        },
        scale: {
          x: 100,
          y: 100,
          z: 100,
        }
      },
      visible: true,
      physics: {
        type: 'mesh',
        restitution: 0,
        friction: 1
      },
    },
    'botball_game_table_door_a_meshes': {
      type: 'object',
      geometryId: 'botball_game_table_door_a_meshes',
      name: 'Door A',
      origin: {
        position: {
          x: Distance.meters(0),
          y: Distance.meters(1.03),
          z: Distance.meters(0),
        },
        scale: {
          x: 100,
          y: 100,
          z: 100,
        }
      },
      visible: true,
      physics: {
        type: 'mesh',
        restitution: 0,
        friction: 1
      },
    },
    'botball_game_table_door_b_meshes': {
      type: 'object',
      geometryId: 'botball_game_table_door_b_meshes',
      name: 'Door B',
      origin: {
        position: {
          x: Distance.meters(0),
          y: Distance.meters(1.03),
          z: Distance.meters(0),
        },
        scale: {
          x: 100,
          y: 100,
          z: 100,
        }
      },
      visible: true,
      physics: {
        type: 'mesh',
        restitution: 0,
        friction: 1
      },
    },
    'light0': {
      type: 'point-light',
      intensity: 10000,
      name: 'Light',
      origin: {
        position: {
          x: Distance.meters(0),
          y: Distance.meters(2.00),
          z: Distance.meters(0),
        },
      },
      visible: true
    },
  },
  robot: {
    origin: {
      position: {
        x: Distance.inches(28),
        y: Distance.centimeters(113),
        z: Distance.inches(28),
      },
    }
  },
  camera: Camera.arcRotate({
    radius: Distance.meters(5),
    target: {
      x: Distance.meters(0),
      y: Distance.meters(1.1),
      z: Distance.meters(0),
    },
    position: {
      x: Distance.meters(2),
      y: Distance.meters(2),
      z: Distance.meters(2),
    }
  }),
  gravity: {
    x: Distance.meters(0),
    y: Distance.meters(-9.8 / 2),
    z: Distance.meters(0),
  }
};