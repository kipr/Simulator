import Robot from "../State/Robot";
import Async from "../State/Async";
import * as ROBOTS from '../../robots';
import { DocumentationState, Robots } from '../State';
import DocumentationLocation from '../State/Documentation/DocumentationLocation';
import construct from '../../util/construct';

export namespace DocumentationAction {
  export interface Push {
    type: 'documentation/push';
    location: DocumentationLocation;
  }

  export const pushLocation = construct<Push>('documentation/push');

  export interface Pop {
    type: 'documentation/pop';
  }

  export const POP: Pop = { type: 'documentation/pop' };

  export interface PopAll {
    type: 'documentation/pop-all';
  }

  export const POP_ALL: PopAll = { type: 'documentation/pop-all' };

  export interface Hide {
    type: 'documentation/hide';
  }

  export const HIDE: Hide = { type: 'documentation/hide' };

  export interface Show {
    type: 'documentation/show';
  }

  export const SHOW: Show = { type: 'documentation/show' };
}

export type DocumentationAction = (
  DocumentationAction.Push |
  DocumentationAction.Pop |
  DocumentationAction.PopAll |
  DocumentationAction.Hide |
  DocumentationAction.Show
);

export const reduceDocumentation = (state: DocumentationState = DocumentationState.DEFAULT, action: DocumentationAction): DocumentationState => {
  switch (action.type) {
    case 'documentation/push': return {
      ...state,
      locationStack: [...state.locationStack, action.location],
    };
    case 'documentation/pop': return {
      ...state,
      locationStack: state.locationStack.slice(0, -1),
    };
    case 'documentation/pop-all': return {
      ...state,
      locationStack: [],
    };
    case 'documentation/hide': return {
      ...state,
      visible: false,
    };
    case 'documentation/show': return {
      ...state,
      visible: true,
    };
    default: return state;
  }
};