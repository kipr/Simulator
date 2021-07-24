import * as React from "react";
import { styled } from "styletron-react";
import { ReferenceFrame } from "../../math";
import { Item } from "../../state";
import ComboBox from "../ComboBox";
import { Dialog } from "../Dialog";
import DialogBar from "../DialogBar";
import Field from "../Field";
import Input from "../Input";
import { ThemeProps } from "../theme";

export type AddItemAcceptance = Item;

export interface AddItemDialogProps extends ThemeProps {
  onAccept: (acceptance: AddItemAcceptance) => void;
  onClose: () => void;
}

interface AddItemDialogState {
  item: Item;
}

type Props = AddItemDialogProps;
type State = AddItemDialogState;

const StyledField = styled(Field, (props: ThemeProps) => ({
  width: '100%',
  marginBottom: `${props.theme.itemPadding * 2}px`,
  ':last-child': {
    marginBottom: 0,
  },
}));

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1',
  padding: `${props.theme.itemPadding * 2}px`
}));

const TYPE_OPTIONS: ComboBox.Option[] = [
  ComboBox.option('Can', Item.Type.Can),
  ComboBox.option('Paper Ream', Item.Type.PaperReam),
];

class AddItemDialog extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      item: {
        type: Item.Type.Can,
        name: 'Untitled Can',
        origin: ReferenceFrame.IDENTITY,
        visible: true
      }
    };
  }

  private onAccept_ = () => {
    this.props.onAccept(this.state.item);
  };

  private onNameChange_ = (event: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({
      item: {
        ...this.state.item,
        name: event.currentTarget.value
      }
    });
  };

  private onTypeSelect_ = (index: number) => {
    this.setState({
      item: {
        ...this.state.item,
        type: index
      }
    });
  };

  render() {
    const { props, state } = this;
    const { theme, onAccept, onClose } = props;
    const { item } = state;

    return (
      <Dialog theme={theme} name='Add Item' onClose={onClose}>
        <Container theme={theme}>
          <StyledField name='Type' theme={theme}>
            <ComboBox options={TYPE_OPTIONS} theme={theme} index={item.type} onSelect={this.onTypeSelect_} />
          </StyledField>
          <StyledField name='Name' theme={theme}>
            <Input theme={theme} type='text' value={item.name} onChange={this.onNameChange_} />
          </StyledField>
        </Container>
        <DialogBar theme={theme} onAccept={this.onAccept_} />
        
      </Dialog>
    );
  }
}

export default AddItemDialog;