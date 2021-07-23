import * as React from "react";
import { styled } from "styletron-react";
import { Dialog } from "../Dialog";
import DialogBar from "../DialogBar";
import Field from "../Field";
import Input from "../Input";
import { ThemeProps } from "../theme";

export interface AddItemAcceptance {
  name: string;
  model: string;
}

export interface AddItemDialogProps extends ThemeProps {
  onAccept: (acceptance: AddItemAcceptance) => void;
  onClose: () => void;
}

type Props = AddItemDialogProps;

const StyledField = styled(Field, {
  width: '100%'
});

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1',
  padding: `${props.theme.itemPadding * 2}px`
}));

class AddItemDialog extends React.PureComponent<Props> {
  private onAccept_ = () => {
  };

  render() {
    const { props } = this;
    const { theme, onAccept, onClose } = props;

    return (
      <Dialog theme={theme} name='Add Item' onClose={onClose}>
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

export default AddItemDialog;