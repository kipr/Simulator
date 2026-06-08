import * as React from 'react';
import { styled } from 'styletron-react';
import tr from '@i18n';
import { ThemeProps } from '../constants/theme';
import LocalizedString from '../../util/LocalizedString';
import { ItemSuccessChoiceSummary } from '../../util/jbcChallengeSuggestions';

const SectionTitle = styled('h4', (props: ThemeProps) => ({
  margin: `${props.theme.itemPadding * 2}px ${props.theme.itemPadding * 2}px ${props.theme.itemPadding}px`,
  fontSize: '0.95em',
}));

const List = styled('ul', (props: ThemeProps) => ({
  margin: `0 ${props.theme.itemPadding * 2}px ${props.theme.itemPadding * 2}px`,
  paddingLeft: '1.25em',
  lineHeight: 1.5,
  fontSize: '0.9em',
}));

const ItemRow = styled('li', {
  marginBottom: '0.35em',
});

const NodeId = styled('code', {
  opacity: 0.8,
  fontSize: '0.9em',
  marginLeft: '0.35em',
});

export interface MatItemRulesSummaryProps extends ThemeProps {
  locale: LocalizedString.Language;
  items: ItemSuccessChoiceSummary[];
}

const MatItemRulesSummary: React.FC<MatItemRulesSummaryProps> = ({ theme, locale, items }) => {
  if (items.length === 0) {
    return (
      <>
        <SectionTitle theme={theme}>
          {LocalizedString.lookup(tr('Mat items'), locale)}
        </SectionTitle>
        <List theme={theme} style={{ listStyle: 'none', paddingLeft: 0, opacity: 0.85 }}>
          <ItemRow>
            {LocalizedString.lookup(tr('No items on the mat yet.'), locale)}
          </ItemRow>
        </List>
      </>
    );
  }

  return (
    <>
      <SectionTitle theme={theme}>
        {LocalizedString.lookup(tr('Items & goals'), locale)}
      </SectionTitle>
      <List theme={theme}>
        {items.map(item => (
          <ItemRow key={item.nodeId}>
            <strong>{item.displayName}</strong>
            <NodeId>{item.nodeId}</NodeId>
            {' — '}
            {item.outcomeTitle}
          </ItemRow>
        ))}
      </List>
    </>
  );
};

export default MatItemRulesSummary;
