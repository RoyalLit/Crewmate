import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  withDelay,
  withSpring,
  useAnimatedReaction,
  SharedValue,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { tokens, StaggeredText } from './shared';

const { height } = Dimensions.get('window');

const SCENE_2 = require('../../../assets/images/onboarding/scene2.png');

export function Screen2({ currentIndex, myIndex, topInset }: { currentIndex: SharedValue<number>; myIndex: number; topInset: number }) {
  const subOpacity = useSharedValue(0);
  const pillScale = useSharedValue(0.8);
  const pillOpacity = useSharedValue(0);

  useAnimatedReaction(
    () => Math.abs(currentIndex.value - myIndex) < 0.85,
    (isActive) => {
      if (isActive) {
        subOpacity.value = withDelay(100, withTiming(1, { duration: 250 }));
        pillScale.value = withDelay(150, withSpring(1, { damping: 15, stiffness: 200 }));
        pillOpacity.value = withDelay(150, withTiming(1, { duration: 250, easing: Easing.out(Easing.cubic) }));
      } else {
        subOpacity.value = 0;
        pillScale.value = 0.8;
        pillOpacity.value = 0;
      }
    }
  );

  return (
    <View style={styles.screenContent}>
      <View style={[styles.heroZone, { height: height * 0.58 }]}>
        <Image source={SCENE_2} style={[styles.heroImage, { height: height * 0.65, transform: [{ scale: 1.05 }] }]} resizeMode="cover" accessibilityElementsHidden />
        <LinearGradient colors={[tokens.bg, 'rgba(13,13,28,0.8)', 'transparent']} locations={[0, 0.4, 1]} style={[styles.gradientMaskTop, { height: topInset + 60 }]} />
        <LinearGradient colors={['transparent', 'rgba(13,13,28,0)', tokens.bg]} locations={[0, 0.4, 1]} style={styles.gradientMask} />
      </View>
      <View style={[styles.bottomZone, { top: height * 0.58 }]}>
        <StaggeredText text="Your campus. Your people." currentIndex={currentIndex} myIndex={myIndex} />
        <Animated.Text style={[styles.subtext, { opacity: subOpacity }]}>
          Everyone here goes to your college. That's the vibe check.
        </Animated.Text>
        <Animated.View style={[styles.trustPill, { transform: [{ scale: pillScale }], opacity: pillOpacity }]}>
          <View style={styles.trustShield}>
            <Ionicons name="checkmark-sharp" size={12} color="#FFFFFF" />
          </View>
          <Text style={styles.trustPillText}>College email verified</Text>
        </Animated.View>
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
  trustPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(108,99,255,0.12)', borderWidth: 0.5, borderColor: 'rgba(108,99,255,0.3)', borderRadius: 100, paddingVertical: 8, paddingHorizontal: 16, alignSelf: 'flex-start', marginTop: 24 },
  trustShield: { width: 16, height: 16, backgroundColor: tokens.primary, borderRadius: 8, marginRight: 8, alignItems: 'center', justifyContent: 'center' },
  trustPillText: { fontFamily: 'PlusJakartaSans-600SemiBold', fontSize: 12, color: '#7C74FF' },
});
