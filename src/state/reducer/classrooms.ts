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
import { auth } from "../../firebase/firebase";



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

  export interface AddStudentToClassroom {
    type: "classrooms/add-student-to-classroom";
    classroomId: string;
    studentId: LocalizedString;
  }

  export const addStudentToClassroom = construct<AddStudentToClassroom>("classrooms/add-student-to-classroom");

  export interface StudentInClassroom {
    type: "classrooms/student-in-classroom";
    studentId: LocalizedString;
  }

  export const studentInClassroom = construct<StudentInClassroom>("classrooms/student-in-classroom");

  export interface FindClassroomByInviteCode {
    type: "classrooms/find-classroom-by-invite-code";
    inviteCode: LocalizedString;
  }

  export const findClassroomByInviteCode = construct<FindClassroomByInviteCode>("classrooms/find-classroom-by-invite-code");


}

export type ClassroomsAction =
  | ClassroomsAction.LoadClassroom
  | ClassroomsAction.CreateClassroom
  | ClassroomsAction.SetClassroom
  | ClassroomsAction.SetClassrooms
  | ClassroomsAction.AddStudentToClassroom
  | ClassroomsAction.StudentInClassroom
  | ClassroomsAction.FindClassroomByInviteCode
  | ClassroomsAction.ListOwnedClassrooms;

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

const generateUniqueClassroomId = async (): Promise<string> => {
  let uniqueId: string;
  let shortenedId: string;
  let exists = true;

  while (exists) {
    const uuid = crypto.randomUUID();
    shortenedId = uuid.replace(/-/g, "").slice(-7);

    try {
      const classroom = await db.get<Classroom>(Selector.classroom(shortenedId));
      exists = !!classroom; // if we got data, it exists
    } catch (err: any) {
      if (err.code === 404 || err.message?.includes("Not found")) {
        exists = false; // 404 means safe to use this ID
      } else {
        console.error("Unexpected DB error while checking ID:", err);
        throw err; // rethrow other errors
      }
    }
  }

  return shortenedId;
}
const create = async (classroomId: string, next: Async.Creating<Classroom>) => {
  try {
    // Write directly to your database (Firestore or local DB)
    console.log("Creating classroom in DB:", next.value);
    console.log("Classroom ID:", classroomId);


    const generatedId = await generateUniqueClassroomId();
    console.log("Generated unique classroom ID:", generatedId);
    const created = await db.set(Selector.classroom(generatedId), next.value);
    console.log("create() created classroom:", created);
    // Update Redux or local store
    store.dispatch(
      ClassroomsAction.setClassrooms({
        classrooms: {
          [generatedId]: Async.loaded({
            brief: {},
            value: next.value,
          }),
        },
      })
    );
  } catch (error) {
    console.error("Error creating classroom:", error);
    // Optionally dispatch a failed state
    store.dispatch(
      ClassroomsAction.setClassrooms({
        classrooms: {
          [classroomId]: Async.createFailed({
            value: next.value,
            error,
          }),
        },
      })
    );
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
};

export const findClassroomDocByReadableId = async (
  classroomId: string
): Promise<{ docId: string; classroom: Classroom } | null> => {
  const classrooms = await db.list<Classroom>('classrooms');
  const entry = Object.entries(classrooms).find(
    ([, classroom]) => classroom.classroomId === classroomId
  );
  if (!entry) return null;

  const [docId, classroom] = entry;
  return { docId, classroom };
};


export const addStudentToClassroom = async (
  classroomId: string,
  studentId: LocalizedString
) => {
  const result = await findClassroomDocByReadableId(classroomId);
  if (!result) {
    console.warn('Classroom not found:', classroomId);
    return;
  }

  const { docId, classroom } = result;
  console.log("addStudentToClassroom docId:", docId);
  console.log("addStudentToClassroom classroom:", classroom);
  const normalized = typeof studentId === "string" ? studentId : studentId["en-US"];

  // Convert all stored IDs to strings for comparison
  const existingIds = classroom.studentIds.map(id =>
    typeof id === "string" ? id : id["en-US"]
  );

  if (!existingIds.includes(normalized)) {
    classroom.studentIds.push({ "en-US": normalized }); // keep same structure
    await db.set({ collection: "classrooms", id: docId }, classroom);

    store.dispatch(
      ClassroomsAction.setClassroom({
        classroomId: docId,
        classroom: Async.loaded({ brief: {}, value: classroom }),
      })
    );
  }
};


export const studentInClassroom = async (studentId: LocalizedString): Promise<boolean> => {
  try {
    const result = await db.list<Classroom>("classrooms");
    console.log("StudentInClassroom studentId:", studentId);
    console.log("StudentInClassroom classrooms:", result);
    const normalized = typeof studentId === "string" ? studentId : studentId["en-US"];


    for (const classroom of Object.values(result)) {
      const existingIds = classroom.studentIds.map(id =>
        typeof id === "string" ? id : id["en-US"]
      );

      if (existingIds.includes(normalized)) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("Error checking if student has classroom:", error);
    return false;
  }
};

export const findClassroomByInviteCode = async (inviteCode: LocalizedString): Promise<Classroom | null> => {
  try {
    const result = await db.list<Classroom>("classrooms");
    console.log("findClassroomByInviteCode inviteCode:", inviteCode);
    console.log("findClassroomByInviteCode classrooms:", result);
    for (const classroom of Object.values(result)) {
      const classroomCode =
        typeof classroom.code === 'string'
          ? classroom.code
          : classroom.code?.en ?? Object.values(classroom.code ?? {})[0] ?? '';

      const inviteCodeStr =
        typeof inviteCode === 'string'
          ? inviteCode
          : inviteCode?.en ?? Object.values(inviteCode ?? {})[0] ?? '';

      if (
        classroomCode.localeCompare(inviteCodeStr, undefined, { sensitivity: "base" }) === 0
      ) {
        return classroom;
      }
    }
    return null;
  } catch (error) {
    console.error("Error finding classroom by invite code:", error);
    return null;
  }
};



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
      return state;
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
        ...action.classrooms,
      };
      console.log("After merge:", Object.keys(merged));
      return merged;
    }

    case "classrooms/list-owned-classrooms": {
      void listOwned(action.teacherId);
      return state;
    }

    case "classrooms/add-student-to-classroom": {
      console.log("Reducer received addStudentToClassroom action:", action);
      void addStudentToClassroom(action.classroomId, action.studentId);
      return state;
    }

    case "classrooms/student-in-classroom": {

      void studentInClassroom(action.studentId);
      return state;
    }

    case "classrooms/find-classroom-by-invite-code": {
      void findClassroomByInviteCode(action.inviteCode);
      return state;
    }

    default:
      return state;
  }
};
