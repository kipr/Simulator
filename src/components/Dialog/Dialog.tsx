import * as React from "react";

import { Modal } from "../interface/Modal";

import { StyleProps } from "../../util/style";

import { styled } from "styletron-react";
import Widget, { Mode, Size } from "../interface/Widget";
import { ThemeProps } from "../constants/theme";
import TourTarget from "../Tours/TourTarget";
import { TourRegistry } from "../../tours/TourRegistry";

export interface DialogProps extends ThemeProps, StyleProps {
  name: string;
  children: React.ReactNode;

  onClose: () => void;
  tourRegistry?: TourRegistry;
}

type Props = DialogProps;

const Container = styled('div', (props: ThemeProps) => ({
  width: '90%',
  maxWidth: '800px',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  color: props.theme.color,
}));

class Dialog_ extends React.PureComponent<Props> {
  private onSizeChange_ = (index: number) => {
    this.props.onClose();
  };

  render() {
    const { props } = this;
    const { className, style, children, theme, name } = props;

    const tourContent_ = (
      <TourTarget registry={props.tourRegistry} targetKey={`${name}-dialog`}>
        <Container theme={theme}>
          <Widget
            theme={theme}
            size={0}
            sizes={[Size.MAXIMIZED, Size.MINIMIZED]}
            onSizeChange={this.onSizeChange_}
            mode={Mode.Floating}
            name={name}
            tourRegistry={props.tourRegistry}
          >
            {children}
          </Widget>

        </Container>
      </TourTarget>
    );
    const normalContent_ = (
      <Container theme={theme}>
        <Widget
          theme={theme}
          size={0}
          sizes={[Size.MAXIMIZED, Size.MINIMIZED]}
          onSizeChange={this.onSizeChange_}
          mode={Mode.Floating}
          name={name}
        >
          {children}
        </Widget>
      </Container>
    );
    return (
      <Modal>{this.props.tourRegistry ? tourContent_ : normalContent_}</Modal>
    );
  }
}

export const Dialog = styled(Dialog_, {
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.6)",
});
