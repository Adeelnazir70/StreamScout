import React, { ReactElement, useCallback } from 'react';
import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';
import type { ShowSummary } from '../api/types';
import { isTV, spacing } from '../theme';
import { ShowCard } from './ShowCard';

interface Props {
  shows: ShowSummary[];
  onPressShow: (show: ShowSummary) => void;
  ListEmptyComponent?: ReactElement;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Give the first card initial focus on TV. */
  focusFirst?: boolean;
}

const TARGET_CARD_WIDTH = isTV ? 190 : 150;
const GAP = spacing.md;
const PADDING = spacing.lg;

/** Works out how many columns fit, so the grid adapts to phone, tablet and TV. */
export function getGridLayout(screenWidth: number) {
  const available = screenWidth - PADDING * 2;
  const columns = Math.max(
    2,
    Math.floor((available + GAP) / (TARGET_CARD_WIDTH + GAP)),
  );
  const cardWidth = (available - GAP * (columns - 1)) / columns;
  return { columns, cardWidth };
}

export function ShowGrid({
  shows,
  onPressShow,
  ListEmptyComponent,
  refreshing,
  onRefresh,
  focusFirst,
}: Props) {
  const { width } = useWindowDimensions();
  const { columns, cardWidth } = getGridLayout(width);

  const renderItem = useCallback(
    ({ item, index }: { item: ShowSummary; index: number }) => (
      <ShowCard
        show={item}
        width={cardWidth}
        onPress={onPressShow}
        hasTVPreferredFocus={focusFirst && isTV && index === 0}
      />
    ),
    [cardWidth, onPressShow, focusFirst],
  );

  return (
    <FlatList
      // FlatList can't change numColumns on the fly, so remount when it changes
      key={`grid-${columns}`}
      data={shows}
      numColumns={columns}
      keyExtractor={item => String(item.id)}
      renderItem={renderItem}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.content}
      ItemSeparatorComponent={Separator}
      ListEmptyComponent={ListEmptyComponent}
      refreshing={refreshing}
      onRefresh={onRefresh}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      initialNumToRender={columns * 3}
      windowSize={7}
      removeClippedSubviews={!isTV}
    />
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  content: { padding: PADDING, flexGrow: 1 },
  row: { gap: GAP },
  separator: { height: GAP },
});
