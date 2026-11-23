import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { CastMember } from '../api/types';
import { colors, fontSize, isTV, spacing } from '../theme';

const MAX_CAST = 12;
const AVATAR = isTV ? 96 : 64;

/**
 * Cast is shown as a wrapping grid rather than a horizontal list. On TV a
 * horizontal list would need every item to be focusable just so the remote
 * can scroll it, which adds a lot of pointless stops for the user.
 */
export function CastList({ cast }: { cast: CastMember[] }) {
  if (cast.length === 0) {
    return null;
  }

  return (
    <View>
      <Text style={styles.heading}>Cast</Text>
      <View style={styles.grid}>
        {cast.slice(0, MAX_CAST).map(member => (
          <View
            key={`${member.person.id}-${member.character.id}`}
            style={styles.member}
          >
            {member.person.image ? (
              <Image
                source={{ uri: member.person.image.medium }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.initials}>
                  {getInitials(member.person.name)}
                </Text>
              </View>
            )}
            <Text style={styles.name} numberOfLines={2}>
              {member.person.name}
            </Text>
            <Text style={styles.character} numberOfLines={2}>
              {member.character.name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(part => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const styles = StyleSheet.create({
  heading: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  member: { width: AVATAR + spacing.xl, alignItems: 'center' },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: colors.surface,
  },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: colors.textMuted, fontSize: fontSize.lg },
  name: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  character: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
});
