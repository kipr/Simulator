import * as React from 'react';
import { StyleProps } from '../style';
import { AnyText, EMPTY_OBJECT, StyledText } from '../util';

export interface TextProps extends StyleProps {
  text: AnyText;
}

type Props = TextProps;

/**
 * Text is a component that can render either a string of text or a `StyledText` object. It allows all text fields
 * in the simulator to have sophisticated layouts and styling applied easily.
 */
export class Text extends React.PureComponent<Props> {
  private renderStyledText_ = (styledText: StyledText, key = '') => {
    const elements: JSX.Element[] = [];
    switch (styledText.type) {
      case StyledText.Type.Text: {
        elements.push(<span {...(styledText.props || EMPTY_OBJECT)} style={styledText.style || EMPTY_OBJECT} key={key}>{styledText.text}</span>);
        break;
      }

      case StyledText.Type.NewLine: {
        elements.push(<br key={key} />);
        break;
      }
      case StyledText.Type.Component: {
        const Component = styledText.component;
        elements.push(<Component key={key} {...(styledText.props || EMPTY_OBJECT)} />);
        break;
      }

      
      case StyledText.Type.Composition: {
        elements.push(...styledText.items
          .map((item, i) => this.renderStyledText_(item, `child-${key || ''}-${i}`))
          .reduce((a, b) => [...a, ...b], [])
        );
        break;
      }
    }
    return elements;
  };

  render() {
    const { props } = this;
    const { text, style, className } = props;
    
    if (typeof text === 'string') return <span style={style} className={className}>{text}</span>;


    return (
      <span style={style} className={className}>
        {this.renderStyledText_(text)}
      </span>
    );
  }
}