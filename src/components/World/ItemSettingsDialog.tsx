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

export type ItemSettingsAcceptance = Item;

export interface ItemSettingsDialogProps extends ThemeProps {
  item: Item;

  onChange: (item: Item) => void;
  onClose: () => void;
}

interface ItemSettingsDialogState {
}

type Props = ItemSettingsDialogProps;
type State = ItemSettingsDialogState;

const StyledScrollArea = styled(ScrollArea, (props: ThemeProps) => ({
  minHeight: '300px',
  flex: '1 1',
}));

class ItemSettingsDialog extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const { props, state } = this;
    const { theme, onClose, onChange, item } = props;

    return (
      <Dialog theme={theme} name={`${item.name || ''} Settings`} onClose={onClose}>
        <StyledScrollArea theme={theme}>
          <ItemSettings theme={theme} item={item} onItemChange={onChange} />
        </StyledScrollArea>
      </Dialog>
    );
  }
}

export default ItemSettingsDialog;