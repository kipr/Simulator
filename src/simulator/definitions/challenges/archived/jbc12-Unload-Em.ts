import Author from "../../../../db/Author";
import Challenge from "../../../../state/State/Challenge";
import Expr from "../../../../state/State/Challenge/Expr";
import LocalizedString from "../../../../util/LocalizedString";
import ProgrammingLanguage from "../../../../programming/compiler/ProgrammingLanguage";

export default {
  name: { [LocalizedString.EN_US]: "JBC Challenge 12" },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 12: Unload 'Em`,
  },
  author: {
    type: Author.Type.Organization,
    id: "kipr",
  },
  code: {
    'c': ProgrammingLanguage.DEFAULT_CODE.c,
    'cpp': ProgrammingLanguage.DEFAULT_CODE.cpp,
    'python': ProgrammingLanguage.DEFAULT_CODE.python,
  },
  defaultLanguage: "c",
  events: {
    can2Upright: {
      name: { [LocalizedString.EN_US]: "Can 2 Upright" },
      description: { [LocalizedString.EN_US]: "Can 2 upright" },
    },
    can9Upright: {
      name: { [LocalizedString.EN_US]: "Can 9 Upright" },
      description: { [LocalizedString.EN_US]: "Can 9 upright" },
    },
    can10Upright: {
      name: { [LocalizedString.EN_US]: "Can 10 Upright" },
      description: { [LocalizedString.EN_US]: "Can 10 upright" },
    },

    can2Intersects: {
      name: { [LocalizedString.EN_US]: "Can 2 Intersects" },
      description: { [LocalizedString.EN_US]: "Can from green garage intersects circle 2" },
    },
    can9Intersects: {
      name: { [LocalizedString.EN_US]: "Can 9 Intersects" },
      description: { [LocalizedString.EN_US]: "Can from blue garage intersects circle 9" },
    },
    can10Intersects: {
      name: { [LocalizedString.EN_US]: "Can 10 Intersects" },
      description: { [LocalizedString.EN_US]: "Can from yellow garage intersects circle 10" },
    },
  },
  success: {
    exprs: {
      // Upright Events
      can2Upright: {
        type: Expr.Type.Event,
        eventId: "can2Upright",
      },
      can9Upright: {
        type: Expr.Type.Event,
        eventId: "can9Upright",
      },
      can10Upright: {
        type: Expr.Type.Event,
        eventId: "can10Upright",
      },
      cansUpright: {
        type: Expr.Type.And,
        argIds: ["can2Upright", "can9Upright", "can10Upright"],
      },


      // Intersects Events
      can2Intersects: {
        type: Expr.Type.Event,
        eventId: "can2Intersects",
      },
      can9Intersects: {
        type: Expr.Type.Event,
        eventId: "can9Intersects",
      },
      can10Intersects: {
        type: Expr.Type.Event,
        eventId: "can10Intersects",
      },
      cansIntersects: {
        type: Expr.Type.And,
        argIds: ["can2Intersects", "can9Intersects", "can10Intersects"],
      },


      // Success logic
      completion: {
        type: Expr.Type.And,
        argIds: ["cansUpright", "cansIntersects"],
      },
    },
    rootId: "completion",
  },
  sceneId: "jbc12",
} as Challenge;
