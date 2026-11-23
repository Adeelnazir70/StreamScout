import React, { memo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ShowSummary } from '../api/types';
import { colors, fontSize, spacing } from '../theme';
import { formatYears } from '../utils/text';

interface Props {
  show: ShowSummary;
  width: number;
  onPress: (show: ShowSummary) => void;
  hasTVPreferredFocus?: boolean;
}

const POSTER_RATIO = 1.47; // TVMaze posters are 210x295

function ShowCardComponent({
  show,
  width,
  onPress,
  hasTVPreferredFocus,
}: Props) {
  const [focused, setFocused] = useState(false);
  const years = formatYears(show);
  const rating = show.rating.average;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={show.name}
      onPress={() => onPress(show)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      hasTVPreferredFocus={hasTVPreferredFocus}
      style={[styles.card, { width }, focused && styles.focused]}
    >
      {show.image ? (
        <Image
          source={{ uri: show.image.medium }}
          style={[styles.poster, { height: width * POSTER_RATIO }]}
        />
      ) : (
        <View
          style={[
            styles.poster,
            styles.posterFallback,
            { height: width * POSTER_RATIO },
          ]}
        >
          <Text style={styles.fallbackText}>{show.name}</Text>
        </View>
      )}
      <Text style={styles.title} numberOfLines={1}>
        {show.name}
      </Text>
      <Text style={styles.meta} numberOfLines={1}>
        {[years, rating ? `★ ${rating.toFixed(1)}` : null]
          .filter(Boolean)
          .join('  ·  ')}
      </Text>
    </Pressable>
  );
}

export const ShowCard = memo(ShowCardComponent);

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    borderWidth: 3,
    borderColor: 'transparent',
    padding: 2,
  },
  focused: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceFocused,
    transform: [{ scale: 1.05 }],
  },
  poster: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  posterFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  fallbackText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  title: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  meta: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: 2,
    marginBottom: spacing.xs,
  },
});
