import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  useAnimatedReaction,
  SharedValue,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { tokens } from './shared';

export function AuthScreen({ currentIndex, myIndex }: { currentIndex: SharedValue<number>; myIndex: number }) {
  const router = useRouter();
  const logoScale = useSharedValue(0.6);
  const wordmarkOpacity = useSharedValue(0);
  const wordmarkY = useSharedValue(12);
  const taglineOpacity = useSharedValue(0);
  const btnOpacity = useSharedValue(0);
  const btnY = useSharedValue(24);
  const glowOpacity = useSharedValue(0.15);

  useAnimatedReaction(
    () => Math.round(currentIndex.value) === myIndex,
    (isActive) => {
      if (isActive) {
        logoScale.value = withSpring(1, { damping: 12, stiffness: 100 });
        wordmarkOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));
        wordmarkY.value = withDelay(300, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }));
        taglineOpacity.value = withDelay(500, withTiming(1, { duration: 400 }));
        btnOpacity.value = withDelay(900, withTiming(1, { duration: 400 }));
        btnY.value = withDelay(900, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }));

        glowOpacity.value = withRepeat(
          withSequence(
            withTiming(0.3, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.15, { duration: 1200, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
      } else {
        logoScale.value = 0.6;
        wordmarkOpacity.value = 0;
        wordmarkY.value = 12;
        taglineOpacity.value = 0;
        btnOpacity.value = 0;
        btnY.value = 24;
        glowOpacity.value = 0.15;
      }
    }
  );

  const wmStyle = useAnimatedStyle(() => ({ opacity: wordmarkOpacity.value, transform: [{ translateY: wordmarkY.value }] }));
  const tagStyle = useAnimatedStyle(() => ({ opacity: taglineOpacity.value }));
  const btnStyle = useAnimatedStyle(() => ({ opacity: btnOpacity.value, transform: [{ translateY: btnY.value }] }));

  return (
    <View style={styles.authScreen}>
      <View style={styles.authTop}>
        <Animated.View style={[styles.radialGlow, { opacity: glowOpacity }]} />
        <Animated.View style={[styles.logoBox, { transform: [{ scale: logoScale }] }]}>
          <View style={styles.logoDots} />
          <View style={styles.logoLine} />
          <View style={[styles.logoDots, { marginTop: 16, marginLeft: 16 }]} />
        </Animated.View>
        <Animated.Text style={[styles.wordmark, wmStyle]}>Crewmute</Animated.Text>
        <Animated.Text style={[styles.tagline, tagStyle]}>Your campus. Your ride.</Animated.Text>
      </View>

      <Animated.View style={[styles.authBottom, btnStyle]}>
        <Pressable style={styles.createBtn} onPress={() => router.push('/(auth)/register')}>
          <View style={styles.violetGlow} />
          <Text style={styles.createBtnText}>Create Account</Text>
        </Pressable>
        <Pressable style={styles.signInBtn} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.signInBtnText}>Sign In</Text>
        </Pressable>
        <Text style={styles.authFooter}>Only for verified college students.</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  authScreen: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  authTop: { height: '45%', width: '100%', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 40 },
  radialGlow: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: tokens.primary, top: '20%' },
  logoBox: { width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(108,99,255,0.15)', borderWidth: 1, borderColor: 'rgba(108,99,255,0.3)', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
  logoDots: { width: 6, height: 6, borderRadius: 3, backgroundColor: tokens.primary },
  logoLine: { width: 20, height: 2, backgroundColor: tokens.primary, marginHorizontal: 4 },
  wordmark: { fontFamily: 'PlusJakartaSans-800ExtraBold', fontSize: 28, color: tokens.textPrimary, letterSpacing: -0.84, marginTop: 16 },
  tagline: { fontFamily: 'PlusJakartaSans-400Regular', fontSize: 15, color: tokens.textMuted, marginTop: 6 },
  authBottom: { height: '45%', width: '100%', justifyContent: 'flex-start', paddingHorizontal: 24 },
  createBtn: { height: 56, backgroundColor: tokens.primary, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  createBtnText: { fontFamily: 'PlusJakartaSans-700Bold', fontSize: 16, color: '#FFFFFF' },
  signInBtn: { height: 56, borderWidth: 0.5, borderColor: 'rgba(108,99,255,0.4)', borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  signInBtnText: { fontFamily: 'PlusJakartaSans-700Bold', fontSize: 16, color: '#7C74FF' },
  authFooter: { fontFamily: 'PlusJakartaSans-500Medium', fontSize: 12, color: '#4B5563', textAlign: 'center' },
  violetGlow: { position: 'absolute', top: 4, left: 0, right: 0, bottom: -4, backgroundColor: tokens.primary, opacity: 0.4, borderRadius: 16, zIndex: -1, transform: [{ scale: 0.95 }] },
});
