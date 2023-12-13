/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../../util/style';
import { StyledText } from '../../util';
import { Validators } from '../../util/Validator';
import { FontAwesome } from '../FontAwesome';
import Input from './Input';
import { Text } from './Text';
import { GREEN, RED, ThemeProps } from '../Constants/theme';

const Container = styled('div', (props: ThemeProps) => ({
  color: props.theme.color,
  width: '100%',
}));

const Label = styled('label', (theme: ThemeProps) => ({
  display: 'block',
  color: theme.theme.color,
  fontSize: '1.1em',
  fontWeight: 'normal',
  marginTop: `${theme.theme.itemPadding * 2}px`,
  marginBottom: `${theme.theme.itemPadding}px`,
  userSelect: 'none'
}));

const ErrorIcon = styled(FontAwesome, (theme: ThemeProps) => ({
  userSelect: 'none',
  paddingLeft: `${theme.theme.itemPadding}px`,
  paddingRight: `${theme.theme.itemPadding}px`,
  borderRight: `1px solid ${theme.theme.borderColor}`,
}));

const ButtonContainer = styled('div', (theme: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  marginTop: `${theme.theme.itemPadding * 4}px`,
  marginBottom: `${theme.theme.itemPadding * 2}px`,
}));

const Assist = styled('span', (theme: ThemeProps) => ({
  opacity: 0.35,
  fontSize: '0.8em',
  cursor: 'pointer',
  marginLeft: `${theme.theme.itemPadding / 2}px`,
}));

const Finalize = styled('div', (props: ThemeProps & { disabled?: boolean }) => ({
  flex: '1 1',
  borderRadius: `${props.theme.itemPadding * 2}px`,
  padding: `${props.theme.itemPadding * 2}px`,
  backgroundColor: props.disabled ? GREEN.disabled : GREEN.standard,
  ':hover': props.disabled ? {} : {
    backgroundColor: GREEN.hover,
  },
  fontWeight: 400,
  fontSize: '1.1em',
  textAlign: 'center',
  cursor: props.disabled ? 'auto' : 'pointer',
}));

class Form extends React.PureComponent<Form.Props, Form.State> {
  constructor(props: Form.Props) {
    super(props);

    this.state = {
      values: {},
    };
  }

  private onValueChange_ = (item: Form.Item) => (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      values: {
        ...this.state.values,
        [item.id]: {
          text: event.target.value,
        },
        
      }
    });
  };

  private onFinalizeClick_ = () => {
    const { props, state } = this;
    const { items } = props;
    const { values } = state;

    const ret = {};
    for (const item of items) {
      ret[item.id] = item.finalizer(values[item.id].text);
    }
    
    this.props.onFinalize(ret);
  };

  private isFinalizeAllowed_ = () => {
    const { props, state } = this;
    const { items, finalizeDisabled } = props;
    const { values } = state;

    return !finalizeDisabled && items.every(item => item.id in values && (!item.validator || item.validator(values[item.id].text)));
  };

  render() {
    const { props, state } = this;
    const { items, verifiers, theme, className, style, finalizeDisabled } = props;
    const { values } = state;
    
    const itemElements: React.ReactNode[] = items.map((item, index) => {
      return [
        <Label theme={theme} key={`label-${index}`}>{item.text} {item.assist ? <Assist theme={theme} onClick={item.assist}>{item.assistText || 'Assist'}</Assist> : undefined}</Label>,
        <Input
          key={`input-${index}`}
          theme={theme}
          type={item.valueHidden ? 'password' : 'text'}
          value={item.id in values ? values[item.id].text : (item.defaultValue || '')}
          autoFocus={index === 0}
          onChange={this.onValueChange_(item)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && this.isFinalizeAllowed_()) {
              this.onFinalizeClick_();
            }
          }}
        />
      ];
    }).reduce((acc, item) => [...acc, ...item], []);

    const verifyElements: React.ReactNode[] = verifiers !== undefined ? verifiers.map((verifier, index) => {
      const text = this.state.values[verifier.id] !== undefined ? this.state.values[verifier.id].text : ''; 
      const valid = Validators.validate(text, verifier.validType);
      return [
        <div key={`verifier-${index}`}>
          <Text text={
            StyledText.component ({
              component: FontAwesome,
              props: {
                icon: valid ? faCheck : faTimes,
                style: {
                  color: valid ? GREEN.standard : RED.standard,
                },
                theme,
              }
            })
          }/>
          <Text text={
            StyledText.text ({
              text: verifier.text,
              style: {
                color: valid ? GREEN.standard : RED.standard,
                fontWeight: 400,
                fontSize: '0.9em',
                textAlign: 'left',
                marginLeft: '8px',
                marginRight: '8px',
              }
            })
          }/>
        </div>
        
      ];
    }).reduce((acc, item) => [...acc, ...item], []) : undefined;

    const isFinalizeAllowed = this.isFinalizeAllowed_();
    return (
      <Container style={style} className={className} theme={theme}>
        {itemElements}
        {verifyElements}
        <ButtonContainer theme={theme}>
          <Finalize
            theme={theme}
            onClick={isFinalizeAllowed ? this.onFinalizeClick_ : undefined}
            disabled={!isFinalizeAllowed}
          >
            {props.finalizeIcon ? <FontAwesome icon={props.finalizeIcon} /> : undefined} {props.finalizeText || 'Accept'}
          </Finalize>
        </ButtonContainer>
      </Container>
    );
  }
}

namespace Form {
  export interface Props extends StyleProps, ThemeProps {
    onFinalize: (values: { [id: string]: any }) => void;

    finalizeText?: string;
    finalizeIcon?: IconProp;

    finalizeDisabled?: boolean;

    items: Item[];
    verifiers?: Item[];
  }

  export interface State {
    values: { [id: string]: State.Value };
  }

  export namespace State {
    export interface Value {
      text: string;
    }
  }

  export interface Item<F = any> {
    id: string;
    text: string;
    valueHidden?: boolean;
    tooltip?: string;
    defaultValue?: string;
    assistText?: string;
    assist?: () => void;
    validator?: (value: string) => boolean;
    validType?: Validators.Types;
    finalizer?: (value: string) => F;
  }

  export const IDENTITY_FINALIZER = (value: string) => value;
  export const EMAIL_VALIDATOR = (value: string) => Validators.validate(value, Validators.Types.Email); 
  export const PASSWORD_VALIDATOR = (value: string) => Validators.validatePassword(value);
  export const NON_EMPTY_VALIDATOR = (value: string) => Validators.validate(value, Validators.Types.Length, 1);


  export const email = (id: string, text: string, tooltip?: string, assist?: () => void, assistText?: string): Item<string> => ({
    id,
    text,
    tooltip,
    validator: EMAIL_VALIDATOR,
    finalizer: IDENTITY_FINALIZER,
    assist,
    assistText,
  });

  export const password = (id: string, text: string, tooltip?: string, assist?: () => void, assistText?: string, shouldValidate = true): Item<string> => ({
    id,
    text,
    tooltip,
    valueHidden: true,
    validator: shouldValidate ? PASSWORD_VALIDATOR : NON_EMPTY_VALIDATOR,
    finalizer: IDENTITY_FINALIZER,
    assist,
    assistText,
  });

  export const verifier = (id: string, text: string, validType: Validators.Types, tooltip?: string): Item<string> => ({
    id,
    text,
    validType,
    tooltip,
  });
}

export default Form;