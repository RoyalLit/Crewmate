import React from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import type {
  SharedValue} from 'react-native-reanimated';
import Animated, {
  useSharedValue,
  withTiming,
  withDelay,
  useAnimatedReaction
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { tokens, StaggeredText } from './shared';


const { height } = Dimensions.get('window');

const SCENE_1 = require('../../../assets/images/onboarding/scene1.png');

export function Screen1({ currentIndex, myIndex, topInset }: { currentIndex: SharedValue<number>; myIndex: number; topInset: number }) {
  const subOpacity = useSharedValue(0);
  useAnimatedReaction(
    () => Math.abs(currentIndex.value - myIndex) < 0.85,
    (isActive) => {
      if (isActive) subOpacity.value = withDelay(0, withTiming(1, { duration: 250 }));
      else subOpacity.value = 0;
    }
  );

  return (
    <View style={styles.screenContent}>
      <View style={[styles.heroZone, { height: height }]}>
        <Image source={SCENE_1} style={[styles.heroImage, { height: height, transform: [{ scale: 1.3 }, { translateY: -height * 0.12 }] }]} resizeMode="cover" accessibilityElementsHidden />
        <LinearGradient colors={[tokens.bg, 'rgba(13,13,28,0.8)', 'transparent']} locations={[0, 0.4, 1]} style={[styles.gradientMaskTop, { height: topInset + 60 }]} />
        <LinearGradient colors={['transparent', tokens.bg, tokens.bg]} locations={[0, 0.55, 1]} style={[styles.gradientMask, { height: height * 0.65 }]} />
      </View>
      <View style={[styles.bottomZone, { bottom: 120 }]}>
        <StaggeredText text="Why is getting home this hard?" currentIndex={currentIndex} myIndex={myIndex} />
        <Animated.Text style={[styles.subtext, { opacity: subOpacity }]}>
          75 unread messages and still no ride sorted.
        </Animated.Text>
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
});
