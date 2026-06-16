import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { styled } from 'styletron-react';
import { ThemeProps, GREEN } from '../constants/theme';
import LocalizedString from '../../util/LocalizedString';
import tr from '@i18n';
import { FontAwesome } from '../FontAwesome';
import {
  faChevronLeft,
  faChevronRight,
  faPlus,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import Input from '../interface/Input';
import ScrollArea from '../interface/ScrollArea';
import JbcCatalogItemPicker, { ItemPickerEntry } from './JbcCatalogItemPicker';
import JbcCatalogGeometryPicker from './JbcCatalogGeometryPicker';
import JbcCatalogSuccessGoalPicker from './JbcCatalogSuccessGoalPicker';
import TourTarget from '../Tours/TourTarget';
import { TourRegistry } from '../../tours/TourRegistry';
import {
  JBC_CATALOG_GEOMETRIES,
  JbcCatalogGeometry,
  JbcCatalogSuccessGoal,
  WorldSceneItem,
} from '../../util/jbcChallengeCatalog';
import {
  insertMatPlayAreaPointAfter,
  MatPlayZone,
  MAX_PLAY_AREA_POINTS,
  MIN_PLAY_AREA_POINTS,
  removeMatPlayAreaPoint,
  setMatPlayAreaEdgeMode,
  ZONE_DISPLAY_COLORS,
} from '../../util/jbcMatPlayArea';
import {
  disabledPlayAreaSuccessKeys,
  enforceExclusivePlayAreaSuccessKeys,
  isPlayAreaSuccessGoalKind,
  PLAY_AREA_SUCCESS_EXCLUSIVE_GROUPS,
  playAreaSuccessGoalPickerCatalog,
  sanitizeZoneSuccessGoalKeys,
} from '../../util/playAreaSuccessGoals';

export interface MatPlayZonesSidePanelProps extends ThemeProps {
  locale: LocalizedString.Language;
  stepLabel: string;
  zones: MatPlayZone[];
  activeZoneId: string;
  worldItems: WorldSceneItem[];
  selectedWorldItemKeys: string[];
  selectedGeometryKeys: string[];
  onActiveZoneChange: (zoneId: string) => void;
  onZonesChange: (zones: MatPlayZone[]) => void;
  onWorldItemToggle: (entry: ItemPickerEntry, selected: boolean) => void;
  onAddPaperReam: () => void;
  onGeometryToggle: (entry: JbcCatalogGeometry, selected: boolean) => void;
  onAddZone: () => void;
  onDeleteZone: (zoneId: string) => void;
  onBack: () => void;
  onContinue: () => void;
  onCancel: () => void;
  tourRegistry?: TourRegistry;
  tourTargetKey?: string;
}

const PANEL_ROOT_ID = 'mat-play-zones-panel-root';
/** Shared with MatZoneEditOverlay so the mat editor avoids the panel. */
export const MAT_PLAY_ZONES_PANEL_WIDTH = 'min(420px, 38vw)';

export function matPlayZonesPanelInsetPx(): number {
  const panel = document.getElementById(PANEL_ROOT_ID)?.firstElementChild as
    | HTMLElement
    | undefined;
  if (panel) {
    const w = panel.getBoundingClientRect().width;
    if (w > 0) return w;
  }
  return Math.min(420, window.innerWidth * 0.38);
}

const Panel = styled('div', (props: ThemeProps) => ({
  position: 'fixed',
  top: 0,
  right: 0,
  width: MAT_PLAY_ZONES_PANEL_WIDTH,
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'rgba(18, 18, 18, 0.96)',
  borderLeft: `1px solid ${props.theme.borderColor}`,
  color: props.theme.color,
  zIndex: 25,
  boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
}));

const Header = styled('div', (props: ThemeProps) => ({
  padding: `${props.theme.itemPadding * 2}px`,
  borderBottom: `1px solid ${props.theme.borderColor}`,
}));

const Title = styled('div', {
  fontWeight: 700,
  fontSize: '1.05em',
  marginBottom: '8px',
});

const Help = styled('p', {
  margin: 0,
  opacity: 0.88,
  lineHeight: 1.45,
  fontSize: '0.9em',
});

const ZoneList = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: `${props.theme.itemPadding}px`,
  padding: `${props.theme.itemPadding * 2}px`,
  borderBottom: `1px solid ${props.theme.borderColor}`,
}));

const ZoneChip = styled('button', (props: ThemeProps & { $active?: boolean; $stroke: string }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 10px',
  borderRadius: '4px',
  border: `2px solid ${props.$active ? props.$stroke : props.theme.borderColor}`,
  backgroundColor: props.$active ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
  color: props.theme.color,
  cursor: 'pointer',
  fontSize: '0.9em',
}));

const ColorDot = styled('span', (props: { $color: string }) => ({
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  backgroundColor: props.$color,
  flexShrink: 0,
}));

const ToolbarRow = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: `${props.theme.itemPadding}px`,
  padding: `0 ${props.theme.itemPadding * 2}px ${props.theme.itemPadding}px`,
}));

const IconButton = styled('button', (props: ThemeProps) => ({
  padding: '8px 12px',
  border: `1px solid ${props.theme.borderColor}`,
  borderRadius: '4px',
  backgroundColor: 'rgba(255,255,255,0.06)',
  color: props.theme.color,
  cursor: 'pointer',
  ':disabled': {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
}));

const Body = styled('div', {
  flex: 1,
  minHeight: 0,
  overflow: 'hidden',
});

const SectionTitle = styled('h4', (props: ThemeProps) => ({
  margin: `${props.theme.itemPadding * 2}px ${props.theme.itemPadding * 2}px ${props.theme.itemPadding}px`,
  fontSize: '0.95em',
}));

const CollapsibleSection = styled('details', (props: ThemeProps) => ({
  margin: `0 ${props.theme.itemPadding * 2}px`,
  padding: `${props.theme.itemPadding}px 0`,
  borderTop: `1px solid ${props.theme.borderColor}`,
}));

const CollapsibleSummary = styled('summary', (props: ThemeProps) => ({
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '0.95em',
  marginBottom: `${props.theme.itemPadding}px`,
}));

const InfoTag = styled('div', (props: ThemeProps) => ({
  margin: `${props.theme.itemPadding}px ${props.theme.itemPadding * 2}px ${props.theme.itemPadding * 2}px`,
  padding: `${props.theme.itemPadding}px ${props.theme.itemPadding * 1.5}px`,
  borderRadius: '4px',
  border: `1px solid ${props.theme.borderColor}`,
  backgroundColor: 'rgba(255,255,255,0.05)',
  fontSize: '0.88em',
  lineHeight: 1.45,
  opacity: 0.9,
}));

const Footer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: `${props.theme.itemPadding}px`,
  padding: `${props.theme.itemPadding * 2}px`,
  borderTop: `1px solid ${props.theme.borderColor}`,
}));

const ShapeOptionRow = styled('label', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: `${props.theme.itemPadding}px`,
  margin: `0 ${props.theme.itemPadding * 2}px ${props.theme.itemPadding}px`,
  fontSize: '0.9em',
  cursor: 'pointer',
}));

const Button = styled('button', (props: ThemeProps & { $primary?: boolean }) => ({
  padding: '10px 16px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
  color: props.theme.color,
  backgroundColor: props.$primary ? GREEN.standard : 'rgba(255,255,255,0.1)',
  ':hover': {
    backgroundColor: props.$primary ? GREEN.hover : 'rgba(255,255,255,0.16)',
  },
}));

function updateZoneInList(
  zones: MatPlayZone[],
  zoneId: string,
  patch: Partial<MatPlayZone>
): MatPlayZone[] {
  return zones.map(z => (z.id === zoneId ? { ...z, ...patch } : z));
}

const MatPlayZonesSidePanel: React.FC<MatPlayZonesSidePanelProps> = ({
  theme,
  locale,
  stepLabel,
  zones,
  activeZoneId,
  worldItems,
  selectedWorldItemKeys,
  selectedGeometryKeys,
  onActiveZoneChange,
  onZonesChange,
  onWorldItemToggle,
  onAddPaperReam,
  onGeometryToggle,
  onAddZone,
  onDeleteZone,
  onBack,
  onContinue,
  onCancel,
  tourRegistry,
  tourTargetKey,
}) => {
  const [root, setRoot] = React.useState<HTMLElement | null>(null);
  const [playAreaExpanded, setPlayAreaExpanded] = React.useState(false);
  const [markersExpanded, setMarkersExpanded] = React.useState(
    selectedGeometryKeys.length > 0
  );

  React.useEffect(() => {
    let el = document.getElementById(PANEL_ROOT_ID);
    if (!el) {
      el = document.createElement('div');
      el.id = PANEL_ROOT_ID;
      document.body.appendChild(el);
    }
    setRoot(el);
    return () => {
      if (el?.parentElement && el.childElementCount === 0) {
        el.remove();
      }
    };
  }, []);

  React.useEffect(() => {
    if (selectedGeometryKeys.length > 0) {
      setMarkersExpanded(true);
    }
  }, [selectedGeometryKeys.length]);

  const activeZone = zones.find(z => z.id === activeZoneId) ?? zones[0];

  const playAreaSuccessCatalog = React.useMemo(
    () => playAreaSuccessGoalPickerCatalog(),
    []
  );

  const onSuccessToggle_ = (entry: JbcCatalogSuccessGoal, selected: boolean) => {
    if (!activeZone || !isPlayAreaSuccessGoalKind(entry.key)) return;
    const keys = new Set(sanitizeZoneSuccessGoalKeys(activeZone.successGoalKeys));
    if (selected) {
      for (const group of PLAY_AREA_SUCCESS_EXCLUSIVE_GROUPS) {
        if (!group.includes(entry.key)) continue;
        for (const kind of group) {
          if (kind !== entry.key) {
            keys.delete(kind);
          }
        }
      }
      keys.add(entry.key);
    } else {
      keys.delete(entry.key);
    }
    onZonesChange(
      updateZoneInList(zones, activeZone.id, {
        successGoalKeys: enforceExclusivePlayAreaSuccessKeys(Array.from(keys)),
      })
    );
  };

  const selectedSuccessKeys_ = (): Set<string> => {
    if (!activeZone) return new Set();
    return new Set(sanitizeZoneSuccessGoalKeys(activeZone.successGoalKeys));
  };

  const disabledSuccessKeys_ = (): Set<string> => {
    if (!activeZone) return new Set();
    return disabledPlayAreaSuccessKeys(selectedSuccessKeys_());
  };

  if (!root) return null;

  const wrapTarget_ = (
    targetKey: string,
    children: React.ReactNode
  ): React.ReactNode =>
    tourRegistry ? (
      <TourTarget registry={tourRegistry} targetKey={targetKey}>
        <div>{children}</div>
      </TourTarget>
    ) : children;

  const panelFooter = wrapTarget_(
    'custom-challenge-mat-setup-continue',
    <Footer theme={theme}>
      <Button theme={theme} type="button" onClick={onCancel}>
        {LocalizedString.lookup(tr('Cancel'), locale)}
      </Button>
      <div style={{ flex: 1 }} />
      <Button theme={theme} type="button" onClick={onBack}>
        <FontAwesome icon={faChevronLeft} /> {LocalizedString.lookup(tr('Back'), locale)}
      </Button>
      <Button theme={theme} type="button" $primary onClick={onContinue}>
        {LocalizedString.lookup(tr('Continue'), locale)}{' '}
        <FontAwesome icon={faChevronRight} />
      </Button>
    </Footer>
  );

  const objectsSection = wrapTarget_(
    'custom-challenge-mat-setup-objects',
    <>
      <SectionTitle theme={theme}>
        {LocalizedString.lookup(tr('Objects'), locale)}
      </SectionTitle>
      <div style={{ padding: `0 ${theme.itemPadding * 2}px` }}>
        <JbcCatalogItemPicker
          theme={theme}
          locale={locale}
          catalog={worldItems}
          selectedItemKeys={new Set(selectedWorldItemKeys)}
          onToggle={onWorldItemToggle}
          onAddPaperReam={onAddPaperReam}
          showUsedIn={false}
          helpText={tr('Place cans, reams, and other objects on the mat.')}
          listMaxHeight="22vh"
        />
      </div>
    </>
  );

  const markersSection = wrapTarget_(
    'custom-challenge-mat-setup-markers',
    <>
      <CollapsibleSection
        theme={theme}
        open={markersExpanded}
        onToggle={(e: React.SyntheticEvent<HTMLDetailsElement>) => {
          setMarkersExpanded(e.currentTarget.open);
        }}
      >
        <CollapsibleSummary theme={theme}>
          {LocalizedString.lookup(tr('Markers'), locale)}
          {selectedGeometryKeys.length > 0
            ? ` (${selectedGeometryKeys.length})`
            : ''}
        </CollapsibleSummary>
        <JbcCatalogGeometryPicker
          theme={theme}
          locale={locale}
          catalog={JBC_CATALOG_GEOMETRIES}
          selectedKeys={new Set(selectedGeometryKeys)}
          onToggle={onGeometryToggle}
          helpText={tr('Start boxes, lines, and other script zones.')}
          listMaxHeight="9rem"
        />
      </CollapsibleSection>
    </>
  );

  const playAreaSection = wrapTarget_(
    'custom-challenge-mat-setup-play-areas',
    <>
      {!playAreaExpanded && (
        <InfoTag theme={theme}>
          {LocalizedString.lookup(
            tr('Add an adjustable play area for challenge events.'),
            locale
          )}
        </InfoTag>
      )}
      <CollapsibleSection
        theme={theme}
        open={playAreaExpanded}
        onToggle={(e: React.SyntheticEvent<HTMLDetailsElement>) => {
          setPlayAreaExpanded(e.currentTarget.open);
        }}
      >
        <CollapsibleSummary theme={theme}>
          {LocalizedString.lookup(tr('Play areas (optional)'), locale)}
          {zones.length > 0 ? ` (${zones.length})` : ''}
        </CollapsibleSummary>

        {zones.length === 0 ? (
          <p
            style={{
              margin: `0 0 ${theme.itemPadding}px`,
              opacity: 0.88,
              lineHeight: 1.45,
              fontSize: '0.9em',
            }}
          >
            {LocalizedString.lookup(
              tr('No play areas yet. Add one to draw on the mat.'),
              locale
            )}
          </p>
        ) : (
          <ZoneList theme={theme}>
            {zones.map((zone, index) => {
              const colors = ZONE_DISPLAY_COLORS[index % ZONE_DISPLAY_COLORS.length];
              return (
                <ZoneChip
                  key={zone.id}
                  type="button"
                  theme={theme}
                  $active={zone.id === activeZoneId}
                  $stroke={colors.stroke}
                  onClick={() => onActiveZoneChange(zone.id)}
                >
                  <ColorDot $color={colors.stroke} />
                  {zone.name}
                </ZoneChip>
              );
            })}
          </ZoneList>
        )}

        <ToolbarRow theme={theme}>
          <IconButton theme={theme} type="button" onClick={onAddZone}>
            <FontAwesome icon={faPlus} /> {LocalizedString.lookup(tr('Add area'), locale)}
          </IconButton>
          {activeZone && (
            <IconButton
              theme={theme}
              type="button"
              onClick={() => onDeleteZone(activeZone.id)}
            >
              <FontAwesome icon={faTrash} /> {LocalizedString.lookup(tr('Remove area'), locale)}
            </IconButton>
          )}
        </ToolbarRow>

        {activeZone && (
          <>
            <SectionTitle theme={theme}>
              {LocalizedString.lookup(tr('Area shape'), locale)}
            </SectionTitle>
            <ShapeOptionRow theme={theme}>
              <input
                type="checkbox"
                checked={activeZone.shape.edgeMode === 'curved'}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onZonesChange(
                    updateZoneInList(zones, activeZone.id, {
                      shape: setMatPlayAreaEdgeMode(
                        activeZone.shape,
                        e.currentTarget.checked ? 'curved' : 'straight'
                      ),
                    })
                  )
                }
              />
              {LocalizedString.lookup(tr('Curved edges'), locale)}
            </ShapeOptionRow>
            <ToolbarRow theme={theme}>
              <IconButton
                theme={theme}
                type="button"
                disabled={activeZone.shape.points.length >= MAX_PLAY_AREA_POINTS}
                onClick={() =>
                  onZonesChange(
                    updateZoneInList(zones, activeZone.id, {
                      shape: insertMatPlayAreaPointAfter(
                        activeZone.shape,
                        activeZone.shape.points.length - 1
                      ),
                    })
                  )
                }
              >
                <FontAwesome icon={faPlus} />{' '}
                {LocalizedString.lookup(tr('Add point'), locale)}
              </IconButton>
              <IconButton
                theme={theme}
                type="button"
                disabled={activeZone.shape.points.length <= MIN_PLAY_AREA_POINTS}
                onClick={() =>
                  onZonesChange(
                    updateZoneInList(zones, activeZone.id, {
                      shape: removeMatPlayAreaPoint(
                        activeZone.shape,
                        activeZone.shape.points.length - 1
                      ),
                    })
                  )
                }
              >
                <FontAwesome icon={faTrash} />{' '}
                {LocalizedString.lookup(tr('Remove last point'), locale)}
              </IconButton>
            </ToolbarRow>
            <p
              style={{
                margin: `0 ${theme.itemPadding * 2}px ${theme.itemPadding}px`,
                opacity: 0.85,
                fontSize: '0.88em',
                lineHeight: 1.45,
              }}
            >
              {LocalizedString.lookup(
                tr('Drag points on the mat. Double-click an edge to add a point.'),
                locale
              )}
            </p>

            <SectionTitle theme={theme}>
              {LocalizedString.lookup(tr('Area name'), locale)}
            </SectionTitle>
            <div style={{ padding: `0 ${theme.itemPadding * 2}px` }}>
              <Input
                theme={theme}
                value={activeZone.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onZonesChange(
                    updateZoneInList(zones, activeZone.id, {
                      name: e.currentTarget.value,
                    })
                  )
                }
              />
            </div>

            <SectionTitle theme={theme}>
              {LocalizedString.lookup(tr('Goals for this region'), locale)}
            </SectionTitle>
            <div style={{ padding: `0 ${theme.itemPadding * 2}px ${theme.itemPadding * 3}px` }}>
              <JbcCatalogSuccessGoalPicker
                theme={theme}
                locale={locale}
                catalog={playAreaSuccessCatalog}
                selectedKeys={selectedSuccessKeys_()}
                disabledKeys={disabledSuccessKeys_()}
                onToggle={onSuccessToggle_}
                listMaxHeight="18vh"
                showHeader={false}
              />
            </div>
          </>
        )}
      </CollapsibleSection>
    </>
  );

  const panel_ = (
    <Panel theme={theme}>
      <Header theme={theme}>
        <Title>{stepLabel}</Title>
        <Help>
          {LocalizedString.lookup(tr('Add objects to the mat.'), locale)}
        </Help>
      </Header>

      <Body>
        <ScrollArea theme={theme} style={{ height: '100%' }}>
          {objectsSection}
          {markersSection}
          {playAreaSection}
        </ScrollArea>
      </Body>

      {panelFooter}
    </Panel>
  );

  return ReactDOM.createPortal(
    tourRegistry && tourTargetKey ? (
      <TourTarget registry={tourRegistry} targetKey={tourTargetKey}>
        {panel_}
      </TourTarget>
    ) : panel_,
    root
  );
};

export default MatPlayZonesSidePanel;
