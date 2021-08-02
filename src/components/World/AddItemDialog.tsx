import * as React from "react";
import { styled } from "styletron-react";
import { ReferenceFrame, Rotation } from "../../unit-math";
import { Item } from "../../state";
import { Angle, Distance, Mass, Value } from "../../util";
import ComboBox from "../ComboBox";
import { Dialog } from "../Dialog";
import DialogBar from "../DialogBar";
import Field from "../Field";
import Input from "../Input";
import ScrollArea from "../ScrollArea";
import Section from "../Section";
import { ThemeProps } from "../theme";
import ValueEdit from "../ValueEdit";
import { AngleAxis, Euler } from "../../math";
import ItemSettings from "./ItemSettings";

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

const StyledScrollArea = styled(ScrollArea, (props: ThemeProps) => ({
  minHeight: '300px',
  flex: '1 1',
}));

class AddItemDialog extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      item: {
        type: Item.Type.Can,
        name: 'Untitled Can',
        startingOrigin: ReferenceFrame.IDENTITY,
        visible: true
      },
    };
  }

  private onAccept_ = () => {
    this.props.onAccept(this.state.item);
  };


  private onItemChange_ = (item: Item) => this.setState({ item });

  render() {
    const { props, state } = this;
    const { theme, onClose } = props;
    const { item } = state;

    return (
      <Dialog theme={theme} name='Add Item' onClose={onClose}>
        <StyledScrollArea theme={theme}>
          <ItemSettings theme={theme} item={item} onItemChange={this.onItemChange_} />
        </StyledScrollArea>
        <DialogBar theme={theme} onAccept={this.onAccept_} />
        
      </Dialog>
    );
  }
}

export default AddItemDialog;