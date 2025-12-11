import Async from "state/State/Async";
import construct from "../../util/redux/construct";
import { AsyncProject, Project, ProjectsState } from "../State/Project";
import db from '../../db';
import Selector from '../../db/Selector';
import Dict from "../../util/objectOps/Dict";
import store from "..";
import ProgrammingLanguage from "../../programming/compiler/ProgrammingLanguage";
import { InterfaceMode } from "../../types/interfaceModes";

export namespace ProjectsAction {
  export const addProject = construct<AddProject>("projects/add-project");

  export interface AddProject {
    type: "projects/add-project";
    project: Project;
  }

  export const setProjects = construct<SetProjects>("projects/set-projects");

  export interface SetProjects {
    type: "projects/set-projects";
    projects: Dict<AsyncProject>;
  }

  export const loadProjects = construct<LoadProjects>("projects/load-projects");

  export interface LoadProjects {
    type: "projects/load-projects";
  }

  export const setCode = construct<SetCode>("projects/set-code");

  export interface SetCode {
    type: "projects/set-code";
    project: Project;
    fileName: string;
    fileType: 'src' | 'include' | 'userData';
    fileContent: string;
  }

  export const addFile = construct<AddFile>("projects/add-file");

  export interface AddFile {
    type: "projects/add-file";
    project: Project;
    fileName: string;
    fileType: 'src' | 'include' | 'userData';
  }

  export const selectProject = construct<SelectProject>("projects/select-project");

  export interface SelectProject {
    type: "projects/select-project";
    project: Project;
  }

  export const deleteProject = construct<DeleteProject>("projects/delete-project");

  export interface DeleteProject {
    type: "projects/delete-project";
    project: Project;
  }

  export const changeInterfaceMode = construct<ChangeInterfaceMode>("projects/change-interface-mode");

  export interface ChangeInterfaceMode {
    type: "projects/change-interface-mode";
    interfaceMode: InterfaceMode.SIMPLE | InterfaceMode.ADVANCED;
  }
}

export type ProjectsAction =
  | ProjectsAction.LoadProjects
  | ProjectsAction.AddProject
  | ProjectsAction.AddFile
  | ProjectsAction.SetCode
  | ProjectsAction.SelectProject
  | ProjectsAction.DeleteProject
  | ProjectsAction.ChangeInterfaceMode
  | ProjectsAction.SetProjects;


const load = async () => {
  try {
    const projectEntries = await db.get<{}>(Selector.project(''));
    console.log("Loaded projects from db:", projectEntries);
    console.log("Projects: ", Object.values(projectEntries));
    const asyncProjects: Dict<AsyncProject> = {};
    Object.values(projectEntries).forEach((projectData: any) => {
      asyncProjects[projectData.projectName] = Async.loaded({
        brief: {},
        value: projectData as Project
      });
    });
    console.log("Dispatching loaded projects:", asyncProjects);
    store.dispatch(ProjectsAction.setProjects({
      projects: asyncProjects
    }));
  }
  catch (error) {
    console.log("Error loading projects:", error);
  }
}

const createProject = async (projectName: string, next: Async.Creating<Project>) => {
  try {
    await db.set(Selector.project(projectName), next.value);

    store.dispatch(ProjectsAction.setProjects({
      projects: {
        [projectName]: Async.loaded(
          {
            brief: {},
            value: next.value
          }
        )
      }
    }));

  }
  catch (error) {
    console.log("Error creating project:", error);
  }
}


const createFile = async (project: Project, fileName: string, fileType: 'src' | 'include' | 'userData') => {

  try {
    const updatedProject: Project = {
      ...project,
      [`${fileType}Files`]: {
        ...project[`${fileType}Files`],
        [fileName]: {
          fileName,
          fileContent: `${ProgrammingLanguage.BLANK_CODE[project.projectLanguage]}`
        }
      }
    };
    await db.set(Selector.project(project.projectName), updatedProject);
    const asyncProject: AsyncProject = Async.loaded({
      brief: {},
      value: updatedProject
    });
    console.log("Dispatching new file project update:", asyncProject);
    store.dispatch(ProjectsAction.setProjects({
      projects: {
        [project.projectName]: asyncProject
      }
    }));
  }
  catch (error) {
    console.log("Error creating new file:", error);
  }
}

export const deleteProject = async (project: Project) => {
  try {
    await db.delete(Selector.project(project.projectName));

    store.dispatch(ProjectsAction.deleteProject({
      project
    }));
  }
  catch (error) {
    console.log("Error deleting project:", error);
  }
}
const save = async (project: Project, fileName: string, fileType: 'src' | 'include' | 'userData', fileContent: string) => {
  try {
    const updatedProject: Project = {
      ...project,
      [`${fileType}Files`]: {
        ...project[`${fileType}Files`],
        [fileName]: {
          fileName,
          fileContent: fileContent
        }
      }
    };
    await db.set(Selector.project(project.projectName), updatedProject);
    const asyncProject: AsyncProject = Async.loaded({
      brief: {},
      value: updatedProject
    });

    store.dispatch(ProjectsAction.setProjects({
      projects: {
        [project.projectName]: asyncProject
      }
    }));
  }
  catch (error) {
    console.log("Error saving project code:", error);
  }
}

const changeInterfaceMode = async (state: ProjectsState, interfaceMode: InterfaceMode.SIMPLE | InterfaceMode.ADVANCED) => {
  try {
    const projects = state.entities;
    const updatedProjects: Dict<AsyncProject> = {};

    for (const projectName in projects) {
      const asyncProject = projects[projectName];
      if (asyncProject.type === Async.Type.Loaded) {
        const updatedProject: Project = {
          ...asyncProject.value,
          interfaceMode: interfaceMode === InterfaceMode.SIMPLE ? InterfaceMode.SIMPLE : InterfaceMode.ADVANCED
        };
        await db.set(Selector.project(projectName), updatedProject);
        updatedProjects[projectName] = Async.loaded({
          brief: {},
          value: updatedProject
        });
      }

      store.dispatch(ProjectsAction.setProjects({
        projects: updatedProjects
      }));
    }

    console.log("Dispatching interface mode change:", updatedProjects);
  }
  catch (error) {
    console.log("Error changing interface mode:", error);
  }

}

export const reduceProjects = (
  state: ProjectsState = { entities: {}, selectedProject: null, interfaceMode: InterfaceMode.SIMPLE },
  action: ProjectsAction
): ProjectsState => {
  switch (action.type) {
    case "projects/load-projects": {
      void load();
      return state;
    }
    case "projects/set-code": {
      void save(action.project, action.fileName, action.fileType, action.fileContent);
      return state;

    }
    case "projects/add-project": {
      const creating = Async.creating({ value: action.project });
      void createProject(action.project.projectName, creating);
      return state;
    }
    case "projects/add-file": {
      void createFile(action.project, action.fileName, action.fileType);
      return state;
    }
    case "projects/set-projects": {
      const merged = { ...state.entities, ...action.projects };
      return { ...state, entities: merged };
    }
    case "projects/select-project": {
      if (state.selectedProject && state.selectedProject.projectName === action.project.projectName) {
        return { ...state, selectedProject: null };
      }
      return { ...state, selectedProject: action.project };
    }
    case "projects/change-interface-mode": {
      void changeInterfaceMode(state, action.interfaceMode);
      return { ...state, interfaceMode: action.interfaceMode };
    }
    case "projects/delete-project": {
      const entities = { ...state.entities };
      delete entities[action.project.projectName];
      if (state.selectedProject && state.selectedProject.projectName === action.project.projectName) {
        return { ...state, entities, selectedProject: null };
      }
    }

    default:
      return state;
  }
};
