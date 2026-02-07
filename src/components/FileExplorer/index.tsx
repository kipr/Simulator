import * as React from 'react';

import { styled } from 'styletron-react';
import { StyleProps } from '../../util/style';
import { StyledText } from '../../util';
import ScrollArea from '../interface/ScrollArea';
import { Text } from '../interface/Text';
import { Theme, ThemeProps } from '../constants/theme';

import { FontAwesome } from '../FontAwesome';
import { Button } from '../interface/Button';
import { BarComponent } from '../interface/Widget';

import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import LocalizedString from '../../util/LocalizedString';
import tr from '@i18n';

export const createFileExplorerBarComponents = (
  theme: Theme,
  onBackClick: () => void,
  locale: LocalizedString.Language
) => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  const fileExplorerBar: BarComponent<object>[] = [];
  fileExplorerBar.push(BarComponent.create(Button, {
    theme,
    onClick: onBackClick,
    children:
      <>
        <FontAwesome icon={faChevronLeft} />
        {' '} {LocalizedString.lookup(tr('Back to File Explorer'), locale)}
      </>,
  }));

  return fileExplorerBar;

}