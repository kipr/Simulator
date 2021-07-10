import * as React from 'react';
import { EMPTY_OBJECT } from './empties';

export namespace StyledText {
  export enum Type {
    Text,
    Component,
    Composition,
    NewLine
  }

  export interface Text {
    type: Type.Text;
    text: string;
    style?: React.CSSProperties;
    props?: React.HTMLProps<HTMLSpanElement>
  }

  export type TextParams = Omit<Text, 'type'>;
  export const text = (params: TextParams): StyledText => {
    
    const parts = params.text.split('\n');
    if (parts.length === 1) {
      return {
        type: Type.Text,
        ...params
      };
    }

    const items: StyledText[] = [];
    for (const part of parts) {
      if (part.length === 0) continue;
      items.push({
        type: Type.Text,
        text: part,
        style: params.style,
        props: params.props
      });
      items.push(newLine());
    }
    return compose({ items });
  };

  export interface NewLine {
    type: Type.NewLine;
  }

  export type NewLineParams = Omit<NewLine, 'type'>;
  export const newLine = (params: NewLineParams = EMPTY_OBJECT): NewLine => ({
    type: Type.NewLine,
    ...params
  });
  

  export interface Component {
    type: Type.Component;

    component: React.ComponentType<unknown>,
    props?: unknown;
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

  export const extend = (existing: StyledText, extension: StyledText) => {
    if (existing.type === Type.Composition) return compose({ items: [...existing.items, extension] });
    return compose({ items: [existing, extension] });
  };
}

export type StyledText = StyledText.Text | StyledText.Component | StyledText.Composition | StyledText.NewLine;

export type AnyText = StyledText | string;