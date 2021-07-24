import * as React from "react";
import { styled } from "styletron-react";
import { Item } from "../../state";
import { Dialog } from "../Dialog";
import DialogBar from "../DialogBar";
import Field from "../Field";
import Input from "../Input";
import { ThemeProps } from "../theme";

export type ItemSettingsAcceptance = Item;

export interface ItemSettingsDialogProps extends ThemeProps {
  item: Item;
  onAccept: (acceptance: ItemSettingsAcceptance) => void;
  onClose: () => void;
}

interface ItemSettingsDialogState {
  item: Item;
}

type Props = ItemSettingsDialogProps;
type State = ItemSettingsDialogState;

const StyledField = styled(Field, {
  width: '100%'
});

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1',
  padding: `${props.theme.itemPadding * 2}px`
}));


class ItemSettingsDialog extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      item: props.item
    };
  }
  private onAccept_ = () => {
    this.props.onAccept(this.state.item);
  };

  private onNameChange_ = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      item: {
        ...this.state.item,
        name: e.currentTarget.value
      }
    });
  };
  
  render() {
    const { props, state } = this;
    const { theme, onAccept, onClose } = props;
    const { item } = state;

    return (
      <Dialog theme={theme} name='Item Settings' onClose={onClose}>
        <Container theme={theme}>
          <StyledField name='Name' theme={theme}>
            <Input theme={theme} type='text' value={item.name} onChange={this.onNameChange_} />
          </StyledField>
        </Container>
        <DialogBar theme={theme} onAccept={this.onAccept_} />
      </Dialog>
    );
  }
}

export default ItemSettingsDialog;