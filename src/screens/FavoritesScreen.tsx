import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ShowSummary } from '../api/types';
import { ShowGrid } from '../components/ShowGrid';
import { EmptyView } from '../components/StateViews';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useFavoritesStore } from '../store/favorites';
import { colors, fontSize, isTV, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Favorites'>;

export function FavoritesScreen({ navigation }: Props) {
  const favorites = useFavoritesStore(state => state.favorites);

  const openShow = useCallback(
    (show: ShowSummary) =>
      navigation.navigate('Details', { id: show.id, name: show.name }),
    [navigation],
  );

  return (
    <View style={styles.container}>
      {isTV ? <Text style={styles.tvTitle}>Favourites</Text> : null}
      <ShowGrid
        shows={favorites}
        onPressShow={openShow}
        focusFirst
        ListEmptyComponent={
          <EmptyView
            title="No favourites yet"
            body="Open any show and add it to your favourites. They're saved on this device."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tvTitle: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '800',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
});
