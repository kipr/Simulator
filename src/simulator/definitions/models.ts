/**
 * URIs of the 3D models in static/object_binaries. Code refers to models
 * through MODELS instead of writing paths, so moving a file means editing one
 * line here. Layout and naming rules are in static/object_binaries/README.md.
 *
 * If a model moves or is renamed, add its old path to legacyModelPaths.json so
 * saved scenes, which store these URIs, keep loading.
 */

export const MODELS_ROOT = '/static/object_binaries';

const glb = (path: string) => `${MODELS_ROOT}/${path}.glb`;

export const MODELS = {
  robots: {
    demobot: {
      chassis: glb('robots/demobot/chassis'),
      chassisNoReflectance: glb('robots/demobot/chassis_no_reflectance'),
      wheel: glb('robots/demobot/wheel'),
      arm: glb('robots/demobot/arm'),
      claw: glb('robots/demobot/claw'),
    },
  },

  common: {
    botguy: glb('common/botguy'),
    building: {
      twoByFour: glb('common/building/2x4'),
      particleBoard: glb('common/building/particle_board'),
      frp4x8: glb('common/building/frp_4x8'),
      corrugatedPlastic: glb('common/building/corrugated_plastic'),
      tapeBlack8ft: glb('common/building/tape_black_8ft'),
      pvcPipe: glb('common/building/pvc_pipe'),
      pvcElbow: glb('common/building/pvc_elbow'),
      pvcTConnector: glb('common/building/pvc_t_connector'),
    },
  },

  games: {
    2025: {
      springTable: glb('games/2025/spring_table'),
      botguyGamepiece: glb('games/2025/botguy_gamepiece'),
      bottle: glb('games/2025/bottle'),
      tray: glb('games/2025/tray'),
      cup: {
        blue: glb('games/2025/cup_blue'),
        green: glb('games/2025/cup_green'),
        pink: glb('games/2025/cup_pink'),
      },
      drink: {
        blue: glb('games/2025/drink_blue'),
        green: glb('games/2025/drink_green'),
        pink: glb('games/2025/drink_pink'),
      },
      pom: {
        blue: glb('games/2025/pom_blue'),
        orange: glb('games/2025/pom_orange'),
        red: glb('games/2025/pom_red'),
        yellow: glb('games/2025/pom_yellow'),
      },
      food: {
        frenchFry: glb('games/2025/french_fry'),
        hamburger: glb('games/2025/hamburger'),
        hotDog: glb('games/2025/hot_dog'),
        taco: glb('games/2025/taco'),
        tomato: glb('games/2025/tomato'),
        pickle: glb('games/2025/pickle'),
        potato: glb('games/2025/potato'),
      },
    },

    2026: {
      springTable: glb('games/2026/spring_table'),
      fallTable: glb('games/2026/fall_table'),
      explorerTable: glb('games/2026/explorer_table'),
      explorerMat: glb('games/2026/explorer_mat'),
      loadingDock: glb('games/2026/loading_dock'),
      basket: glb('games/2026/basket'),
      pallet: glb('games/2026/pallet'),
      pomBlue: glb('games/2026/pom_blue'),
      trafficCone: glb('games/2026/traffic_cone'),
      slidingDoor: glb('games/2026/sliding_door'),
      dropper: glb('games/2026/dropper'),
      gate: glb('games/2026/gate'),
      cube: {
        brown4in: glb('games/2026/cube_brown_4in'),
        green2in: glb('games/2026/cube_green_2in'),
        green4in: glb('games/2026/cube_green_4in'),
        red2in: glb('games/2026/cube_red_2in'),
        red4in: glb('games/2026/cube_red_4in'),
        yellow2in: glb('games/2026/cube_yellow_2in'),
      },
      pvc: {
        white: glb('games/2026/pvc'),
        blue: glb('games/2026/pvc_blue'),
        pink: glb('games/2026/pvc_pink'),
      },
    },

    2027: {
      bottle: glb('games/2027/bottle'),
      cupBlack: glb('games/2027/cup_black'),
      pickleball: glb('games/2027/pickleball'),
      ring: glb('games/2027/ring'),
      duckBig: glb('games/2027/duck_big'),
      duck: {
        blue: glb('games/2027/duck_blue'),
        green: glb('games/2027/duck_green'),
        lavender: glb('games/2027/duck_lavender'),
        red: glb('games/2027/duck_red'),
        yellow: glb('games/2027/duck_yellow'),
      },
      pom: {
        gold: glb('games/2027/pom_gold'),
        green: glb('games/2027/pom_green'),
        lavender: glb('games/2027/pom_lavender'),
        red: glb('games/2027/pom_red'),
        turquoise: glb('games/2027/pom_turquoise'),
      },
    },
  },

  challenges: {
    jbc: {
      cup: {
        blue: glb('challenges/jbc/cup_blue'),
        green: glb('challenges/jbc/cup_green'),
        pink: glb('challenges/jbc/cup_pink'),
      },
    },
    moon: {
      containerWithLid: glb('challenges/moon/container_with_lid'),
      solarPanel: glb('challenges/moon/solar_panel'),
      walkway: glb('challenges/moon/walkway'),
      commDish: glb('challenges/moon/comm_dish'),
      habitat: glb('challenges/moon/habitat'),
      researchHabitat: glb('challenges/moon/research_habitat'),
      controlHabitat: glb('challenges/moon/control_habitat'),
    },
  },
} as const;
