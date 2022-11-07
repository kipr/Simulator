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
    
    const { text } = params;

    const items: StyledText[] = [];

    let buffer = '';
    for (let i = 0; i < text.length; ++i) {
      const c = text.charAt(i);
      if (c !== '\n') {
        buffer += c;
        continue;
      }
      
      if (buffer.length > 0) {
        items.push({
          type: Type.Text,
          text: buffer,
          style: params.style,
          props: params.props
        });
        buffer = '';
      }
      items.push(newLine());
    }

    if (buffer.length > 0) {
      items.push({
        type: Type.Text,
        text: buffer,
        style: params.style,
        props: params.props
      });
    }

    if (items.length === 1) return items[0];

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

    // eslint-disable-next-line @typescript-eslint/ban-types
    component: React.ComponentType<object>,
    // eslint-disable-next-line @typescript-eslint/ban-types
    props?: object;
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

  export const extend = (existing: StyledText, extension: StyledText, maxItems = Number.MAX_SAFE_INTEGER): StyledText => {
    const items: StyledText[] = [
      ...(existing.type === Type.Composition ? existing.items : [existing]),
      ...(extension.type === Type.Composition ? extension.items : [extension])
    ];

    return compose({ items: items.slice(-maxItems) });
  };

  // Extracts the text components of a styled text
  export const toString = (text: StyledText): string => {
    switch (text.type) {
      case Type.Text:
        return text.text;
      case Type.Component:
        return '';
      case Type.Composition:
        return text.items.map(toString).join('');
      case Type.NewLine:
        return '\n';
    }
  };
}

export type StyledText = StyledText.Text | StyledText.Component | StyledText.Composition | StyledText.NewLine;

export type AnyText = StyledText | string;
