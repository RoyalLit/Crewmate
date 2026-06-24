import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import type {
  SharedValue} from 'react-native-reanimated';
import Animated, {
  useSharedValue,
  withTiming,
  withDelay,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { tokens, StaggeredText } from './shared';


const { height } = Dimensions.get('window');

const SCENE_3 = require('../../../assets/images/onboarding/scene3.png');

function AnimatedNumber({ currentIndex, myIndex }: { currentIndex: SharedValue<number>; myIndex: number }) {
  const [value, setValue] = useState(0);

  const startAnimation = () => {
    let startTimestamp: number | null = null;
    const duration = 1200;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(easeProgress * 450));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const resetAnimation = () => setValue(0);

  useAnimatedReaction(
    () => Math.round(currentIndex.value) === myIndex,
    (isActive, wasActive) => {
      if (isActive && !wasActive) runOnJS(startAnimation)();
      else if (!isActive && wasActive) runOnJS(resetAnimation)();
    }
  );

  return <Text style={styles.savingsNumber}>₹{value}</Text>;
}

export function Screen3({ currentIndex, myIndex, topInset }: { currentIndex: SharedValue<number>; myIndex: number; topInset: number }) {
  const subOpacity = useSharedValue(0);

  useAnimatedReaction(
    () => Math.abs(currentIndex.value - myIndex) < 0.85,
    (isActive) => {
      if (isActive) subOpacity.value = withDelay(100, withTiming(1, { duration: 250 }));
      else subOpacity.value = 0;
    }
  );

  return (
    <View style={styles.screenContent}>
      <View style={[styles.heroZone, { height: height }]}>
        <Image source={SCENE_3} style={[styles.heroImage, { height: height, transform: [{ scale: 1.2 }, { translateY: -height * 0.12 }] }]} resizeMode="cover" accessibilityElementsHidden />
        <LinearGradient colors={[tokens.bg, 'rgba(13,13,28,0.8)', 'transparent']} locations={[0, 0.4, 1]} style={[styles.gradientMaskTop, { height: topInset + 60 }]} />
        <LinearGradient colors={['transparent', tokens.bg, tokens.bg]} locations={[0, 0.55, 1]} style={[styles.gradientMask, { height: height * 0.65 }]} />
      </View>
      <View style={[styles.bottomZone, { bottom: 120 }]}>
        <StaggeredText text="Split the cost effortlessly." currentIndex={currentIndex} myIndex={myIndex} />
        <Animated.Text style={[styles.subtext, { opacity: subOpacity }]}>
          Auto-calculate splits based on drop-offs. Pay directly in the app.
        </Animated.Text>
        <View style={styles.savingsCard}>
          <AnimatedNumber currentIndex={currentIndex} myIndex={myIndex} />
          <Text style={styles.savingsLabel}>average saved per trip</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContent: { flex: 1 },
  heroZone: { position: 'absolute', left: 0, right: 0, overflow: 'hidden' },
  heroImage: { width: '100%' },
  gradientMaskTop: { position: 'absolute', left: 0, right: 0, top: 0, zIndex: 2 },
  gradientMask: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  bottomZone: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 24, paddingTop: 16 },
  subtext: { fontFamily: 'PlusJakartaSans-400Regular', fontSize: 15, color: tokens.textMuted, lineHeight: 24 },
  savingsCard: { backgroundColor: tokens.card, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 24, borderWidth: 0.5, borderColor: '#2E2E4A', alignSelf: 'flex-start', marginTop: 24, alignItems: 'center' },
  savingsNumber: { fontFamily: 'PlusJakartaSans-800ExtraBold', fontSize: 40, color: tokens.accent, textShadowColor: 'rgba(34,211,238,0.6)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 12, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  savingsLabel: { fontFamily: 'PlusJakartaSans-500Medium', fontSize: 12, color: tokens.textMuted, marginTop: -4 },
});
