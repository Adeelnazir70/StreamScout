import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ShowDetails } from '../api/types';
import { CastList } from '../components/CastList';
import { FocusButton } from '../components/FocusButton';
import { ErrorView, LoadingView } from '../components/StateViews';
import { useShowDetails } from '../hooks/useShows';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useFavoritesStore, useIsFavorite } from '../store/favorites';
import { colors, fontSize, isTV, spacing } from '../theme';
import { formatYears, stripHtml } from '../utils/text';

type Props = NativeStackScreenProps<RootStackParamList, 'Details'>;

const POSTER_WIDTH = isTV ? 260 : 130;

export function DetailsScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { data: show, isPending, isError, error, refetch } = useShowDetails(id);

  if (isPending) {
    return <LoadingView />;
  }
  if (isError) {
    return <ErrorView message={error.message} onRetry={refetch} />;
  }
  return (
    <ShowDetailsView
      show={show}
      onPlay={() =>
        navigation.navigate('Player', { showId: show.id, showName: show.name })
      }
    />
  );
}

function ShowDetailsView({
  show,
  onPlay,
}: {
  show: ShowDetails;
  onPlay: () => void;
}) {
  const insets = useSafeAreaInsets();
  const isFavorite = useIsFavorite(show.id);
  const toggleFavorite = useFavoritesStore(state => state.toggleFavorite);

  const channel = show.network?.name ?? show.webChannel?.name;
  const meta = [
    formatYears(show),
    channel,
    show.runtime ? `${show.runtime} min` : null,
  ].filter(Boolean);
  const summary = stripHtml(show.summary);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xl },
        isTV && { paddingTop: spacing.xl },
      ]}
    >
      <View style={styles.top}>
        {show.image ? (
          <Image source={{ uri: show.image.original }} style={styles.poster} />
        ) : (
          <View style={styles.poster} />
        )}
        <View style={styles.info}>
          <Text style={styles.title}>{show.name}</Text>
          <Text style={styles.meta}>{meta.join('  ·  ')}</Text>
          {show.rating.average ? (
            <Text style={styles.rating}>
              ★ {show.rating.average.toFixed(1)}
            </Text>
          ) : null}
          <View style={styles.genres}>
            {show.genres.map(genre => (
              <Text key={genre} style={styles.genre}>
                {genre}
              </Text>
            ))}
          </View>
          <View style={styles.actions}>
            <FocusButton
              label="▶  Play sample"
              variant="primary"
              onPress={onPlay}
              hasTVPreferredFocus={isTV}
            />
            <FocusButton
              label={isFavorite ? '♥ In favourites' : '♡ Add to favourites'}
              onPress={() => toggleFavorite(show)}
            />
          </View>
        </View>
      </View>

      {summary ? <Text style={styles.summary}>{summary}</Text> : null}

      <CastList cast={show._embedded?.cast ?? []} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  top: { flexDirection: 'row', gap: spacing.lg },
  poster: {
    width: POSTER_WIDTH,
    height: POSTER_WIDTH * 1.47,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  info: { flex: 1 },
  title: { color: colors.text, fontSize: fontSize.xl, fontWeight: '800' },
  meta: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    marginTop: spacing.xs,
  },
  rating: {
    color: colors.accent,
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  genres: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  genre: {
    color: colors.text,
    fontSize: fontSize.sm,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  summary: {
    color: colors.text,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.5,
    marginVertical: spacing.xl,
    maxWidth: 900,
  },
});
