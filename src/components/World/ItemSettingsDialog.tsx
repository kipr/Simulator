import * as React from "react";
import { styled } from "styletron-react";
import { Dialog } from "../Dialog";
import DialogBar from "../DialogBar";
import Field from "../Field";
import Input from "../Input";
import { ThemeProps } from "../theme";

export interface ItemSettingsAcceptance {
  name: string;
  model: string;
}

export interface ItemSettingsDialogProps extends ThemeProps {
  onAccept: (acceptance: ItemSettingsAcceptance) => void;
  onClose: () => void;
}

type Props = ItemSettingsDialogProps;

const StyledField = styled(Field, {
  width: '100%'
});

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1',
  padding: `${props.theme.itemPadding * 2}px`
}));


class ItemSettingsDialog extends React.PureComponent<Props> {
  private onAccept_ = () => {

  };
  
  render() {
    const { props } = this;
    const { theme, onAccept, onClose } = props;

    return (
      <Dialog theme={theme} name='Item Settings' onClose={onClose}>
        <Container theme={theme}>
          <StyledField name='Name' theme={theme}>
            <Input theme={theme} type='text' value='asd' />
          </StyledField>
        </Container>
        <DialogBar theme={theme} onAccept={this.onAccept_} />
      </Dialog>
    );
  }
}

export default ItemSettingsDialog;