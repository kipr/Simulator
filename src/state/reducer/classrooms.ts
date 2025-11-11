import store from "..";
import { AsyncClassroom } from "../State/Classroom";
import Async from "../State/Async";
import Dict from "../../util/objectOps/Dict";
import Selector from "../../db/Selector";
import db from "../../db";
import { errorToAsyncError } from "./util";
import construct from "../../util/redux/construct";
import { Classroom, Classrooms } from "../State/Classroom";
import LocalizedString from "util/LocalizedString";


export namespace ClassroomsAction {
  export interface LoadClassroom {
    type: "classrooms/load-classroom";
    classroomId: string;
  }

  export const loadClassroom = construct<LoadClassroom>("classrooms/load-classroom");

  export interface SetClassroom {
    type: "classrooms/set-classroom";
    classroomId: string;
    classroom: AsyncClassroom;
  }

  export const setClassroom = construct<SetClassroom>("classrooms/set-classroom");

  export interface SetClassrooms {
    type: "classrooms/set-classrooms";
    classrooms: Dict<AsyncClassroom>;
  }

  export const setClassrooms = construct<SetClassrooms>("classrooms/set-classrooms");

  export interface CreateClassroom {
    type: "classrooms/create-classroom";
    classroomId: string;
    classroom: Classroom;
  }

  export const createClassroom = construct<CreateClassroom>("classrooms/create-classroom");

  export interface ListOwnedClassrooms {
    type: "classrooms/list-owned-classrooms";
    teacherId: string;
  }

  export const listOwnedClassrooms = construct<ListOwnedClassrooms>("classrooms/list-owned-classrooms");


}

export type ClassroomsAction =
  | ClassroomsAction.LoadClassroom
  | ClassroomsAction.CreateClassroom
  | ClassroomsAction.SetClassroom
  | ClassroomsAction.SetClassrooms
  | ClassroomsAction.ListOwnedClassrooms;

// --- Async Operations --- //

const load = async (
  classroomId: string,
  current: AsyncClassroom | undefined
) => {
  const brief = Async.brief(current);
  try {
    const value = await db.get<Classroom>(Selector.classroom(classroomId));
    store.dispatch(
      ClassroomsAction.setClassroom({
        classroom: Async.loaded({ brief, value }),
        classroomId,
      })
    );
  } catch (error) {
    store.dispatch(
      ClassroomsAction.setClassroom({
        classroomId,
        classroom: Async.loadFailed({ brief, error: errorToAsyncError(error) }),
      })
    );
  }
};

const create = async (classroomId: string, next: Async.Creating<Classroom>) => {
  try {
    await db.set(Selector.classroom(classroomId), next.value);

    // ✅ Add to Redux immediately
    store.dispatch(
      ClassroomsAction.setClassrooms({
        classrooms: {
          [classroomId]: Async.loaded({ brief: {}, value: next.value }),
        },
      })
    );
  } catch (error) {
    console.error("Error creating classroom:", error);
  }
};


const listOwned = async (teacherId: string) => {
  try {
    console.log("Listing classrooms for teacherId:", teacherId);
    const result = await db.list<Classroom>("classrooms");
    const classrooms: Dict<AsyncClassroom> = {};
    Object.entries(result).forEach(([id, classroom]) => {
      classrooms[id] = Async.loaded({ brief: {}, value: classroom });
    });
    console.log("Dispatching setClassrooms action:", { classrooms, });
    store.dispatch(ClassroomsAction.setClassrooms({
      classrooms,
    }));
  } catch (error) {
    console.error("Failed to list classrooms", error);
  }
};//



export const reduceClassrooms = (
  state: Dict<AsyncClassroom> = {},
  action: ClassroomsAction
): Dict<AsyncClassroom> => {
  switch (action.type) {
    case "classrooms/load-classroom": {
      void load(action.classroomId, state[action.classroomId]);
      return {
        ...state,
        [action.classroomId]: Async.loading({
          brief: Async.brief(state[action.classroomId]),
        }),
      };
    }

    case "classrooms/create-classroom": {
      const creating = Async.creating({ value: action.classroom });
      void create(action.classroomId, creating);
      return {
        ...state,
        [action.classroomId]: creating,
      };
    }

    case "classrooms/set-classroom": {
      return {
        ...state,
        [action.classroomId]: action.classroom,
      };
    }

    case "classrooms/set-classrooms": {
      console.log("Before merge:", Object.keys(state));
      console.log("Incoming classrooms:", Object.keys(action.classrooms));

      const merged = {
        ...state,
        ...action.classrooms, // ✅ merge by key, don't replace
      };
      console.log("After merge:", Object.keys(merged));
      return merged;
    }

    case "classrooms/list-owned-classrooms": {
      void listOwned(action.teacherId);
      return state;
    }

    default:
      return state;
  }
};
