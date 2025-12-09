import Async from "state/State/Async";
import construct from "../../util/redux/construct";
import { AsyncProject, Project, ProjectsState } from "../State/Project";
import db from '../../db';
import Selector from '../../db/Selector';
import Dict from "../../util/objectOps/Dict";
import store from "..";


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
}

export type ProjectsAction =
  | ProjectsAction.LoadProjects
  | ProjectsAction.AddProject
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
    store.dispatch(ProjectsAction.setProjects({
      projects: asyncProjects
    }));
  }
  catch (error) {
    console.log("Error loading projects:", error);
  }
}

const create = async (projectName: string, next: Async.Creating<Project>) => {
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



export const reduceProjects = (
  state: ProjectsState = { entities: {}, selectedProject: null },
  action: ProjectsAction
): ProjectsState => {
  switch (action.type) {
    case "projects/load-projects": {
      console.log("Loading projects");
      void load();
      return state;
    }
    case "projects/add-project": {
      console.log("Adding project", action.project.projectName, action.project);
      const creating = Async.creating({ value: action.project });
      void create(action.project.projectName, creating);
      return state;
    }
    case "projects/set-projects": {
      const merged = { ...state.entities, ...action.projects };
      return { ...state, entities: merged };
    }
    default:
      return state;
  }
};
