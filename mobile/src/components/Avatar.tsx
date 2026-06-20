import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../design/theme';
import { brandColors } from '../design/tokens';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  size: AvatarSize;
  name: string;
  imageUrl?: string;
  isVerified?: boolean;
}

const SIZE_MAP: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

const FONT_MAP: Record<AvatarSize, number> = {
  xs: 10,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 36,
};

const BADGE_MAP: Record<AvatarSize, number> = {
  xs: 0, // not shown
  sm: 0, // not shown
  md: 14,
  lg: 18,
  xl: 24,
};

const AVATAR_GRADIENTS = [
  ['#667EEA', '#764BA2'], // Purple-blue
  ['#FF0844', '#FFB199'], // Red-orange
  ['#43E97B', '#38F9D7'], // Green
  ['#FA709A', '#FEE140'], // Pink-yellow
  ['#F77062', '#FE5196'], // Pinkish
  ['#4FACFE', '#00F2FE'], // Blue
  ['#30CFD0', '#330867'], // Dark purple-teal
  ['#F6D365', '#FDA085'], // Orange-yellow
];

export function Avatar({ size, name, imageUrl, isVerified = false }: AvatarProps) {
  const { isDark } = useTheme();
  const dimension = SIZE_MAP[size];
  const fontSize = FONT_MAP[size];
  const badgeSize = BADGE_MAP[size];

  const safeName = name || '?';
  const initials = safeName
    .split(' ')
    .map((n) => n?.[0] || '')
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const borderColor = isDark ? '#2E2E4A' : '#E4E4F0';

  const getGradientForName = (n: string) => {
    let hash = 0;
    for (let i = 0; i < n.length; i++) {
      hash = n.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
    return AVATAR_GRADIENTS[index];
  };

  const gradientColors = getGradientForName(safeName);

  return (
    <View style={[styles.container, { width: dimension, height: dimension }]}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.image,
            { width: dimension, height: dimension, borderColor, borderWidth: 1 },
          ]}
        />
      ) : (
        <LinearGradient
          colors={gradientColors as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.fallback,
            { width: dimension, height: dimension, borderColor, borderWidth: 1 },
          ]}
        >
          <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
        </LinearGradient>
      )}

      {/* Verified Badge on md+ sizes */}
      {isVerified && badgeSize > 0 && (
        <View
          style={[
            styles.badgeContainer,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: isDark ? '#0F0F1A' : '#FFFFFF', // To punch out the border
            },
          ]}
        >
          <Ionicons name="checkmark-circle" size={badgeSize} color={brandColors.mintGreen} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    borderRadius: 100,
    backgroundColor: '#E4E4F0',
  },
  fallback: {
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans-700Bold',
  },
  badgeContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
