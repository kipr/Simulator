import construct from '../../util/redux/construct';
import Scene from '../../state/State/Scene';
import Record from '../../db/Record';


export namespace Modal {
  export enum Type {
    Settings,
    About,
    Exception,
    OpenScene,
    Feedback,
    FeedbackSuccess,
    None,
    NewScene,
    CopyScene,
    SettingsScene,
    DeleteRecord,
    ResetCode
  }
  
  export interface Settings {
    type: Type.Settings;
  }
  
  export const SETTINGS: Settings = { type: Type.Settings };
  
  export interface About {
    type: Type.About;
  }
  
  export const ABOUT: About = { type: Type.About };
  
  export interface Feedback {
    type: Type.Feedback;
  }
  
  export const FEEDBACK: Feedback = { type: Type.Feedback };
  
  export interface FeedbackSuccess {
    type: Type.FeedbackSuccess;
  }
  
  export const FEEDBACKSUCCESS: FeedbackSuccess = { type: Type.FeedbackSuccess };
  
  export interface Exception {
    type: Type.Exception;
    error: Error;
    info?: React.ErrorInfo;
  }
  
  export const exception = (error: Error, info?: React.ErrorInfo): Exception => ({ type: Type.Exception, error, info });
  
  export interface SelectScene {
    type: Type.OpenScene;
  }
  
  export const SELECT_SCENE: SelectScene = { type: Type.OpenScene };
  
  export interface None {
    type: Type.None;
  }
  
  export const NONE: None = { type: Type.None };
  
  export interface NewScene {
    type: Type.NewScene;
  }
  
  export const NEW_SCENE: NewScene = { type: Type.NewScene };
  
  export interface CopyScene {
    type: Type.CopyScene;
    scene: Scene;
  }
  
  export const copyScene = construct<CopyScene>(Type.CopyScene);
  
  export interface DeleteRecord {
    type: Type.DeleteRecord;
    record: Record;
  }
  
  export const deleteRecord = construct<DeleteRecord>(Type.DeleteRecord);
  
  export interface SettingsScene {
    type: Type.SettingsScene;
  }
  
  export const SETTINGS_SCENE: SettingsScene = { type: Type.SettingsScene };
  
  export interface ResetCode {
    type: Type.ResetCode;
  }
  
  export const RESET_CODE: ResetCode = { type: Type.ResetCode };
}
  
export type Modal = (
  Modal.Settings |
  Modal.About |
  Modal.Exception |
  Modal.SelectScene |
  Modal.Feedback |
  Modal.FeedbackSuccess |
  Modal.None |
  Modal.NewScene |
  Modal.CopyScene |
  Modal.DeleteRecord |
  Modal.SettingsScene |
  Modal.ResetCode
);