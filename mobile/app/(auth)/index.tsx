import React, { useState } from 'react';
import { StyleSheet, Dimensions, Pressable, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  useAnimatedReaction,
  SharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';

import { Screen1 } from '../../src/components/onboarding/Screen1';
import { Screen2 } from '../../src/components/onboarding/Screen2';
import { Screen3 } from '../../src/components/onboarding/Screen3';
import { Screen4 } from '../../src/components/onboarding/Screen4';
import { AuthScreen } from '../../src/components/onboarding/AuthScreen';
import { tokens } from '../../src/components/onboarding/shared';

const { width, height } = Dimensions.get('window');

const SPRING_CONFIG = { stiffness: 180, damping: 24, mass: 1 };

export default function OnboardingFlow() {
  const insets = useSafeAreaInsets();

  const currentIndex = useSharedValue(0);
  const translationX = useSharedValue(0);

  const goToNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex.value < 4) {
      currentIndex.value = withSpring(Math.round(currentIndex.value) + 1, SPRING_CONFIG);
    }
  };

  const skipToAuth = () => {
    currentIndex.value = withTiming(4, { duration: 300 });
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (currentIndex.value === 4) return;
      let newTranslation = e.translationX;
      if (currentIndex.value === 0 && e.translationX > 0) {
        newTranslation = e.translationX * 0.3;
      }
      translationX.value = newTranslation / width;
    })
    .onEnd((e) => {
      if (currentIndex.value === 4) return;
      let nextIndex = currentIndex.value;
      if (e.translationX < -50 && currentIndex.value < 4) {
        nextIndex = Math.floor(currentIndex.value) + 1;
      } else if (e.translationX > 50 && currentIndex.value > 0) {
        nextIndex = Math.ceil(currentIndex.value) - 1;
      }
      translationX.value = withSpring(0, SPRING_CONFIG);
      currentIndex.value = withSpring(nextIndex, SPRING_CONFIG);
    });

  const Dot = ({ index }: { index: number }) => {
    const style = useAnimatedStyle(() => {
      const isActive = Math.round(currentIndex.value) === index;
      return {
        width: withTiming(isActive ? 24 : 6, { duration: 200 }),
        backgroundColor: isActive ? tokens.primary : '#2E2E4A',
        height: 6,
        borderRadius: 3,
      };
    });
    return <Animated.View style={[styles.dot, style]} />;
  };

  const AnimatedScreen = ({ index }: { index: number }) => {
    const [shouldRender, setShouldRender] = useState(index < 2);

    const style = useAnimatedStyle(() => {
      const position = index - (currentIndex.value - translationX.value);
      let translateX = position * width;
      let opacity = 1;

      if (position < 0) {
        translateX = position * (width * 0.5);
        opacity = interpolate(position, [-1, 0], [0.6, 1], Extrapolate.CLAMP);
      }

      if (index === 4) {
        opacity = interpolate(currentIndex.value, [3, 4], [0, 1], Extrapolate.CLAMP);
        translateX = 0;
      } else if (currentIndex.value > 3) {
        const fadeFactor = interpolate(currentIndex.value, [3, 4], [1, 0], Extrapolate.CLAMP);
        opacity = opacity * fadeFactor;
      }

      return {
        position: 'absolute',
        width,
        height,
        transform: [{ translateX }],
        opacity,
        zIndex: index === Math.round(currentIndex.value) ? 10 : 0,
      };
    });

    useAnimatedReaction(
      () => Math.round(currentIndex.value),
      (current) => {
        runOnJS(setShouldRender)(index === current || index === current + 1 || (current >= 3 && index === 4));
      },
    );

    if (!shouldRender) return null;

    return (
      <Animated.View style={[style, styles.screen]}>
        {index === 0 && <Screen1 currentIndex={currentIndex} myIndex={0} topInset={insets.top} />}
        {index === 1 && <Screen2 currentIndex={currentIndex} myIndex={1} topInset={insets.top} />}
        {index === 2 && <Screen3 currentIndex={currentIndex} myIndex={2} topInset={insets.top} />}
        {index === 3 && <Screen4 currentIndex={currentIndex} myIndex={3} topInset={insets.top} />}
        {index === 4 && <AuthScreen currentIndex={currentIndex} myIndex={4} />}
      </Animated.View>
    );
  };

  const continueBtnStyle = useAnimatedStyle(() => {
    const isVisible = currentIndex.value < 3.9;
    return {
      opacity: withTiming(isVisible ? 1 : 0, { duration: 200 }),
      zIndex: isVisible ? 100 : -1,
    };
  });

  const skipBtnStyle = useAnimatedStyle(() => {
    const isVisible = currentIndex.value < 3.9;
    return {
      opacity: withTiming(isVisible ? 1 : 0, { duration: 200 }),
      zIndex: isVisible ? 100 : -1,
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={styles.container}>
        <StatusBar style="light" />
        {[0, 1, 2, 3, 4].map(i => <AnimatedScreen key={i} index={i} />)}

        <Animated.View style={[styles.skipBtn, { top: Math.max(insets.top, 24) }, skipBtnStyle]}>
          <Pressable onPress={skipToAuth} accessible accessibilityRole="button" accessibilityLabel="Skip onboarding">
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </Animated.View>

        <Animated.View style={[styles.dotsContainer, { bottom: Math.max(insets.bottom, 24) + 80 }, skipBtnStyle]} pointerEvents="none">
          {[0, 1, 2, 3].map((i) => <Dot key={i} index={i} />)}
        </Animated.View>

        <Animated.View style={[styles.actionContainer, { bottom: Math.max(insets.bottom, 24) }, continueBtnStyle]} pointerEvents="box-none">
          <Pressable style={styles.continueBtn} onPress={goToNext}>
            <DynamicContinueText currentIndex={currentIndex} />
          </Pressable>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

function DynamicContinueText({ currentIndex }: { currentIndex: SharedValue<number> }) {
  const [isLast, setIsLast] = useState(false);

  const updateState = (active: boolean) => setIsLast(active);

  useAnimatedReaction(
    () => Math.round(currentIndex.value) === 3,
    (active, prev) => {
      if (active !== prev) runOnJS(updateState)(active);
    }
  );

  return (
    <>
      {isLast && <View style={styles.violetGlow} />}
      <Text style={styles.continueText}>
        {isLast ? "Find My Crew →" : "Continue"}
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.bg,
    overflow: 'hidden',
  },
  screen: {
    ...StyleSheet.absoluteFillObject,
  },
  skipBtn: {
    position: 'absolute',
    right: 24,
  },
  skipText: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 14,
    color: tokens.textMuted,
  },
  dotsContainer: {
    position: 'absolute',
    left: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    marginRight: 6,
  },
  actionContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  continueBtn: {
    height: 56,
    backgroundColor: tokens.primary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueText: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  violetGlow: {
    position: 'absolute',
    top: 4,
    left: 0,
    right: 0,
    bottom: -4,
    backgroundColor: tokens.primary,
    opacity: 0.4,
    borderRadius: 16,
    zIndex: -1,
    transform: [{ scale: 0.95 }],
  },
});
