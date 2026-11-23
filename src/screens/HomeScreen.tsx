import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ShowSummary } from '../api/types';
import { FocusButton } from '../components/FocusButton';
import { ShowGrid } from '../components/ShowGrid';
import { EmptyView, ErrorView, LoadingView } from '../components/StateViews';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import {
  MIN_SEARCH_LENGTH,
  useSearchShows,
  useTopRatedShows,
} from '../hooks/useShows';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useFavoritesStore } from '../store/favorites';
import { colors, fontSize, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const debouncedQuery = useDebouncedValue(query);
  const favoriteCount = useFavoritesStore(state => state.favorites.length);

  const isSearching = debouncedQuery.trim().length >= MIN_SEARCH_LENGTH;
  const topRated = useTopRatedShows();
  const search = useSearchShows(debouncedQuery);
  const active = isSearching ? search : topRated;

  const openShow = useCallback(
    (show: ShowSummary) =>
      navigation.navigate('Details', { id: show.id, name: show.name }),
    [navigation],
  );

  const renderContent = () => {
    if (active.isPending) {
      return <LoadingView />;
    }
    if (active.isError) {
      return (
        <ErrorView message={active.error.message} onRetry={active.refetch} />
      );
    }
    return (
      <ShowGrid
        shows={active.data}
        onPressShow={openShow}
        focusFirst={!isSearching}
        refreshing={active.isRefetching}
        onRefresh={active.refetch}
        ListEmptyComponent={
          <EmptyView
            title={`No shows found for "${debouncedQuery.trim()}"`}
            body="Check the spelling or try a different title."
          />
        }
      />
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.appName}>StreamScout</Text>
          <FocusButton
            label={`♥ Favourites${favoriteCount ? ` (${favoriteCount})` : ''}`}
            onPress={() => navigation.navigate('Favorites')}
          />
        </View>
        <TextInput
          value={query}
          onChangeText={setQuery}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder="Search TV shows"
          placeholderTextColor={colors.textMuted}
          style={[styles.search, searchFocused && styles.searchFocused]}
          returnKeyType="search"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
        <Text style={styles.sectionTitle}>
          {isSearching ? `Results for "${debouncedQuery.trim()}"` : 'Top rated'}
        </Text>
      </View>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appName: { color: colors.accent, fontSize: fontSize.xxl, fontWeight: '800' },
  search: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: fontSize.md,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  searchFocused: { borderColor: colors.accent },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginTop: spacing.lg,
  },
});
