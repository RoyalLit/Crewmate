import React from 'react';
import { View, StyleSheet } from 'react-native';
import type {
  SharedValue} from 'react-native-reanimated';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  useAnimatedReaction,
  Easing,
} from 'react-native-reanimated';
import { brandColors, darkColors } from '../../design/tokens';

export const tokens = {
  bg: darkColors.background.primary,
  card: darkColors.background.card,
  border: darkColors.border.default,
  primary: brandColors.electricViolet,
  accent: '#22D3EE',
  warning: brandColors.amber,
  textPrimary: darkColors.text.primary,
  textMuted: darkColors.text.placeholder,
};

function StaggeredWord({ word, i, currentIndex, myIndex }: { word: string; i: number; currentIndex: SharedValue<number>; myIndex: number }) {
  const translateY = useSharedValue(12);
  const opacity = useSharedValue(0);

  useAnimatedReaction(
    () => Math.abs(currentIndex.value - myIndex) < 0.85,
    (isActive) => {
      if (isActive) {
        const delay = myIndex === 0 ? 0 : i * 20;
        translateY.value = withDelay(delay, withTiming(0, { duration: 250, easing: Easing.out(Easing.cubic) }));
        opacity.value = withDelay(delay, withTiming(1, { duration: 250 }));
      } else {
        translateY.value = 12;
        opacity.value = 0;
      }
    }
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[styles.headline, animatedStyle]}>
      {word}{' '}
    </Animated.Text>
  );
}

export function StaggeredText({ text, currentIndex, myIndex }: { text: string; currentIndex: SharedValue<number>; myIndex: number }) {
  const words = text.split(' ');

  return (
    <View style={styles.headlineWrapper}>
      {words.map((word, i) => (
        <StaggeredWord key={i} word={word} i={i} currentIndex={currentIndex} myIndex={myIndex} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  headlineWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  headline: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 32,
    color: tokens.textPrimary,
    lineHeight: 35.2,
    letterSpacing: -0.96,
  },
});
