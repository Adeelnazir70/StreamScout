import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, fontSize, spacing } from '../theme';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  hasTVPreferredFocus?: boolean;
  style?: ViewStyle;
}

/**
 * A button that shows a clear focus ring on TV, where there is no touch
 * and the user moves between items with the remote's D-pad.
 */
export function FocusButton({
  label,
  onPress,
  variant = 'secondary',
  hasTVPreferredFocus,
  style,
}: Props) {
  const [focused, setFocused] = useState(false);
  const primary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      hasTVPreferredFocus={hasTVPreferredFocus}
      style={({ pressed }) => [
        styles.button,
        primary ? styles.primary : styles.secondary,
        focused && styles.focused,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.label, primary && styles.primaryLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'transparent',
    alignSelf: 'flex-start',
  },
  primary: { backgroundColor: colors.accent },
  secondary: { backgroundColor: colors.surface },
  focused: { borderColor: colors.text, transform: [{ scale: 1.06 }] },
  pressed: { opacity: 0.8 },
  label: { color: colors.text, fontSize: fontSize.md, fontWeight: '600' },
  primaryLabel: { color: colors.background },
});
