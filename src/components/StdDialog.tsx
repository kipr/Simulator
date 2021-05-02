import * as React from 'react';

import { Dialog } from './Dialog';

import { Fa } from './Fa';

import { StyleProps } from '../style';

import { styled } from 'styletron-react';
import { Spacer } from './common';
import { ThemeProps } from './theme';

const StyledFa = styled(Fa, {
  marginRight: '5px'
})

interface StdDialogTitleProps extends StyleProps {
  icon?: string;
  title: string;

  component?: React.ComponentType<any>;
  componentProps?: any;

  closeable: boolean;
  onClose: () => void;
}


const TitleContainer = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center'
});

class StdDialogTitle_ extends React.PureComponent<StdDialogTitleProps> {
  render() {
    const { props } = this;
    const { className, style, title, icon, closeable, onClose, component, componentProps } = props;
    const Component = component;
    return (
      <TitleContainer className={className} style={style} >
        {icon ? <StyledFa icon={icon} /> : undefined} {title}
        {Component ? <Component {...componentProps} /> : <Spacer />}
        {closeable ? <Fa icon='times' onClick={onClose} /> : undefined}
      </TitleContainer>
    );
  }
}

const StdDialogTitle = styled(StdDialogTitle_, (props: ThemeProps) => ({
  backgroundColor: props.theme.backgroundColor,
  padding: '5px',
  borderBottom: `1px solid ${props.theme.borderColor}`,
  overflow: 'hidden'
}));

interface StdDialogContentProps extends StyleProps {
  children: any;
}

class StdDialogContent_ extends React.PureComponent<StdDialogContentProps> {
  render() {
    const { props } = this;
    const { className, style, children} = props;
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
}

const StdDialogContent = styled(StdDialogContent_, (props: ThemeProps) => ({
  padding: '5px',
  // overflow: 'hidden',
  flex: '1 1'
}));

export interface StdDialogProps extends StyleProps, ThemeProps {
  icon?: string;
  children?: any;

  title: string;

  noPadding?: boolean;

  titleComponent?: React.ComponentType<any>;
  titleComponentProps?: any;

  closeable?: boolean;
  onClose?: () => void;
}

type Props = StdDialogProps;

const DialogContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
});

class StdDialog_ extends React.PureComponent<Props> {
  render() {
    const { props } = this;
    const {
      className,
      style,
      children,
      icon,
      title,
      closeable,
      onClose,
      noPadding,
      titleComponent,
      titleComponentProps,
      theme
    } = props;

    return (
      <Dialog>
        <DialogContainer className={className} style={style}>
          <StdDialogTitle
            theme={theme}
            icon={icon}
            title={title}
            closeable={closeable}
            onClose={onClose}
            component={titleComponent}
            componentProps={titleComponentProps}
          />
          <StdDialogContent theme={theme} style={{ padding: noPadding ? '0px' : undefined }}>
            {children}
          </StdDialogContent>
        </DialogContainer>
      </Dialog>
    );
  }
}

export const StdDialog = styled(StdDialog_, (props: ThemeProps) => ({
  borderRadius: '3px',
  color: props.theme.color,
  border: `1px solid ${props.theme.borderColor}`,
  backgroundColor: props.theme.backgroundColor,
  minWidth: '420px',
  // overflow: 'hidden'
}));