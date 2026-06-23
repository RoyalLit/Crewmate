import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import type {
  SharedValue} from 'react-native-reanimated';
import Animated, {
  useSharedValue,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
  useAnimatedReaction
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { tokens, StaggeredText } from './shared';

const { height } = Dimensions.get('window');

const SCENE_4 = require('../../../assets/images/onboarding/scene4.png');

function AvatarBubble({ initials, i, color, currentIndex, myIndex }: { initials: string; i: number; color: string; currentIndex: SharedValue<number>; myIndex: number }) {
  const scale = useSharedValue(0);

  useAnimatedReaction(
    () => Math.abs(currentIndex.value - myIndex) < 0.85,
    (isActive) => {
      if (isActive) {
        scale.value = withDelay(150 + i * 40, withSequence(
          withTiming(1.08, { duration: 100 }),
          withSpring(1, { damping: 12, stiffness: 150 })
        ));
      } else {
        scale.value = 0;
      }
    }
  );

  return (
    <Animated.View style={[styles.avatarCircle, { backgroundColor: color, left: i * 32, zIndex: 4 - i, transform: [{ scale }] }]}>
      <Text style={styles.avatarText}>{initials}</Text>
    </Animated.View>
  );
}

export function Screen4({ currentIndex, myIndex, topInset }: { currentIndex: SharedValue<number>; myIndex: number; topInset: number }) {
  const subOpacity = useSharedValue(0);
  const avatars = ['AK', 'PS', 'RV', 'KD'];
  const avatarColors = [tokens.primary, tokens.accent, tokens.warning, '#FF6584'];

  useAnimatedReaction(
    () => Math.abs(currentIndex.value - myIndex) < 0.85,
    (isActive) => {
      if (isActive) subOpacity.value = withDelay(100, withTiming(1, { duration: 250 }));
      else subOpacity.value = 0;
    }
  );

  return (
    <View style={styles.screenContent}>
      <View style={[styles.heroZone, { height: height * 0.52 }]}>
        <Image source={SCENE_4} style={[styles.heroImage, { height: height * 0.65, transform: [{ scale: 1.6 }] }]} resizeMode="cover" accessibilityElementsHidden />
        <LinearGradient colors={[tokens.bg, 'rgba(13,13,28,0.8)', 'transparent']} locations={[0, 0.4, 1]} style={[styles.gradientMaskTop, { height: topInset + 60 }]} />
        <LinearGradient colors={['transparent', 'rgba(13,13,28,0)', tokens.bg]} locations={[0, 0.4, 1]} style={styles.gradientMask} />
      </View>
      <View style={[styles.bottomZone, { top: height * 0.52 }]}>
        <StaggeredText text="Someone's always heading your way." currentIndex={currentIndex} myIndex={myIndex} />
        <Animated.Text style={[styles.subtext, { opacity: subOpacity }]}>
          Every weekend, students from your campus go home. Now you go together.
        </Animated.Text>
        <View style={styles.avatarRow}>
          <View style={styles.avatarStack}>
            {avatars.map((initials, i) => (
              <AvatarBubble key={i} initials={initials} i={i} color={avatarColors[i]} currentIndex={currentIndex} myIndex={myIndex} />
            ))}
          </View>
          <Animated.Text style={[styles.avatarLabel, { opacity: subOpacity }]}>
            12 students going home this weekend
          </Animated.Text>
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
  avatarRow: { flexDirection: 'row', alignItems: 'center', marginTop: 24 },
  avatarStack: { width: 130, height: 44 },
  avatarCircle: { position: 'absolute', width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: tokens.bg, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontFamily: 'PlusJakartaSans-700Bold', fontSize: 14, color: '#FFFFFF' },
  avatarLabel: { fontFamily: 'PlusJakartaSans-500Medium', fontSize: 12, color: tokens.textMuted, marginLeft: 12 },
});
