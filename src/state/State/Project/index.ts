import { InterfaceMode } from "../../../types/interfaceModes";
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";
import Dict from '../../../util/objectOps/Dict';
import Async from '../Async';

export interface Project {
  projectName: string; //project name
  docId?: string;
  projectLanguage: ProgrammingLanguage; //c, cpp, python, graphical
  interfaceMode: InterfaceMode.SIMPLE | InterfaceMode.ADVANCED; //simple or advanced
  srcFiles: Dict<{ fileName: string, fileContent: string }>; //source files
  includeFiles?: Dict<{ fileName: string, fileContent: string }>; //include files
  userDataFiles?: Dict<{ fileName: string, fileContent: string }>; //user data files
  type: 'project';
}

export namespace Project {
  export const EMPTY: AsyncProject = {
    type: Async.Type.Loaded,
    value: {
      projectName: '',
      docId: '',
      projectLanguage: 'c',
      interfaceMode: InterfaceMode.SIMPLE,
      srcFiles: {},
      includeFiles: {},
      userDataFiles: {},
      type: 'project',
    }
  }
}

export interface ProjectBrief { }

export type AsyncProject = Async<ProjectBrief, Project>;

export namespace AsyncProject {
  export const unloaded = (brief: ProjectBrief): AsyncProject => ({
    type: Async.Type.Unloaded,
    brief,
  });

  export const loaded = (project: Project): AsyncProject => ({
    type: Async.Type.Loaded,
    brief: {
    },
    value: project,
  });
}

export interface ProjectsState {
  entities: Dict<AsyncProject>;
  selectedProject: string | null;
}