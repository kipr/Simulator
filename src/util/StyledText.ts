import * as React from 'react';

export namespace StyledText {
  export enum Type {
    Text,
    Component,
    Composition
  }

  export interface Text {
    type: Type.Text;
    text: string;
    style?: React.CSSProperties;
  }

  export type TextParams = Omit<Text, 'type'>;
  export const text = (params: TextParams): Text => ({
    type: Type.Text,
    ...params
  });
  

  export interface Component {
    type: Type.Component;

    component: React.ComponentType<any>,
    props?: any;
  }

  export type ComponentParams = Omit<Component, 'type'>;
  export const component = (params: ComponentParams): Component => ({
    type: Type.Component,
    ...params
  });

  export interface Composition {
    type: Type.Composition;

    items: StyledText[];
  }

  export type CompositionParams = Omit<Composition, 'type'>;
  export const compose = (params: CompositionParams): Composition => ({
    type: Type.Composition,
    ...params
  });
}

export type StyledText = StyledText.Text | StyledText.Component | StyledText.Composition;

export type AnyText = StyledText | string;