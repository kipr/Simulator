
import { ThemeProps } from '../constants/theme';
import { StyleProps } from '../../util/style';
import LocalizedString from '../../util/LocalizedString';
import * as React from 'react';
import { styled } from 'styletron-react';
import { TabBar } from '..//Layout/TabBar';
import tr from '@i18n';

export interface TeacherTabsPublicProps extends ThemeProps, StyleProps {

}

export interface TeacherTabsPrivateProps extends ThemeProps {
  locale: LocalizedString.Language;
}

type Props = TeacherTabsPublicProps & TeacherTabsPrivateProps;
const TeacherTabs = ({
  theme,
  locale,
}: Props) => {
  const [tabIndex, setTabIndex] = React.useState(0);

  const tabs: TabBar.TabDescription[] = [
    {
      name: LocalizedString.lookup(tr('Home'), locale),
      content: <div>Home</div>
    },
    {
      name: LocalizedString.lookup(tr('Assignments'), locale),
      content: <div>Assignments</div>
    },
    {
      name: LocalizedString.lookup(tr('People'), locale),
      content: <div>People</div>
    },
  ];

  return (
    <div>
      yay!
    </div>
  )
}

)