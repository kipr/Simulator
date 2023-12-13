import * as React from 'react';

/**
 * Represents a utility for creating styled text.
 */
export namespace StyledText {
  /**
   * The type of styled text.
   */
  export enum Type {
    Text,
    Component,
    Composition,
    NewLine
  }

  /**
   * Represents a text element in styled text.
   */
  export interface Text {
    type: Type.Text;
    text: string;
    style?: React.CSSProperties;
    props?: React.HTMLProps<HTMLSpanElement>;
  }

  /**
   * Represents the parameters for creating a text element.
   */
  export type TextParams = Omit<Text, 'type'>;

  /**
   * Creates a text element with the specified parameters.
   * @param params The parameters for creating the text element.
   * @returns The created text element.
   */
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

  /**
   * Represents the parameters for creating a new line element.
   */
  export type NewLineParams = Omit<NewLine, 'type'>;

  /**
   * Creates a new line element with the specified parameters.
   * @param params The parameters for creating the new line element.
   * @returns The created new line element.
   */
  export const newLine = (params: NewLineParams = {}): NewLine => ({
    type: Type.NewLine,
    ...params
  });

  /**
   * Represents a component element in styled text.
   */
  export interface Component {
    type: Type.Component;
    
    // eslint-disable-next-line @typescript-eslint/ban-types
    component: React.ComponentType<object>,
    // eslint-disable-next-line @typescript-eslint/ban-types
    props?: object;
  }

  /**
   * Represents the parameters for creating a component element.
   */
  export type ComponentParams = Omit<Component, 'type'>;

  /**
   * Creates a component element with the specified parameters.
   * @param params The parameters for creating the component element.
   * @returns The created component element.
   */
  export const component = (params: ComponentParams): Component => ({
    type: Type.Component,
    ...params
  });

  /**
   * Represents a composition element in styled text.
   */
  export interface Composition {
    type: Type.Composition;
    items: StyledText[];
  }

  /**
   * Represents the parameters for creating a composition element.
   */
  export type CompositionParams = Omit<Composition, 'type'>;

  /**
   * Creates a composition element with the specified parameters.
   * @param params The parameters for creating the composition element.
   * @returns The created composition element.
   */
  export const compose = (params: CompositionParams): Composition => ({
    type: Type.Composition,
    ...params
  });

  /**
   * Extends an existing styled text with another styled text.
   * @param existing The existing styled text to extend.
   * @param extension The styled text to extend with.
   * @param maxItems The maximum number of items in the extended styled text.
   * @returns The extended styled text.
   */
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
