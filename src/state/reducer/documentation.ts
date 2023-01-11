import Robot from "../State/Robot";
import Async from "../State/Async";
import * as ROBOTS from '../../robots';
import { DocumentationState, Robots } from '../State';
import DocumentationLocation from '../State/Documentation/DocumentationLocation';
import construct from '../../util/construct';
<<<<<<< HEAD
import { Size } from '../../components/Widget';
=======
>>>>>>> 177f259 (Further work on documentation UI:)

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

  export interface SetSize {
    type: 'documentation/set-size';
    size: Size;
  }

  export const setSize = construct<SetSize>('documentation/set-size');

  export interface Toggle {
    type: 'documentation/toggle';
  }

  export const TOGGLE: Toggle = { type: 'documentation/toggle' };

  export interface PopSome {
    type: 'documentation/pop-some';
    count: number;
  }

  export const popSome = construct<PopSome>('documentation/pop-some');

  export interface SetLanguage {
    type: 'documentation/set-language';
    language: 'c' | 'python';
  }

  export const setLanguage = construct<SetLanguage>('documentation/set-language');
}

export type DocumentationAction = (
  DocumentationAction.Push |
  DocumentationAction.Pop |
  DocumentationAction.PopAll |
  DocumentationAction.Hide |
  DocumentationAction.Show |
  DocumentationAction.SetSize |
  DocumentationAction.Toggle |
  DocumentationAction.PopSome |
  DocumentationAction.SetLanguage
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
      size: Size.MINIMIZED,
    };
    case 'documentation/show': return {
      ...state,
      size: Size.PARTIAL,
    };
    case 'documentation/set-size': return {
      ...state,
      size: action.size,
    };
    case 'documentation/toggle': return {
      ...state,
      size: state.size.type === Size.Type.Minimized ? Size.PARTIAL : Size.MINIMIZED,
    };
    case 'documentation/pop-some': return {
      ...state,
      locationStack: state.locationStack.slice(0, -action.count),
    };
    case 'documentation/set-language': return {
      ...state,
      language: action.language,
    };
    default: return state;
  }
};