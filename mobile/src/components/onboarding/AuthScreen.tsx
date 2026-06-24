import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Dimensions } from 'react-native';
import type {
  SharedValue} from 'react-native-reanimated';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  useAnimatedReaction,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { tokens } from './shared';

const { width, height } = Dimensions.get('window');
const LOGO = require('../../../assets/icon.png');
const BG_IMAGE = require('../../../assets/images/auth-bg.png');

// ─── Particle configuration ──────────────────────────────────────────────────
const PARTICLES = [
  { id: 0, x: 0.08, y: 0.12, size: 4,  color: '#6C63FF', opacity: 0.7, duration: 4200 },
  { id: 1, x: 0.88, y: 0.08, size: 3,  color: '#22D3EE', opacity: 0.5, duration: 5100 },
  { id: 2, x: 0.15, y: 0.35, size: 5,  color: '#8B7FFF', opacity: 0.45, duration: 6300 },
  { id: 3, x: 0.80, y: 0.28, size: 3,  color: '#22D3EE', opacity: 0.6, duration: 4800 },
  { id: 4, x: 0.05, y: 0.62, size: 4,  color: '#6C63FF', opacity: 0.4, duration: 5700 },
  { id: 5, x: 0.92, y: 0.55, size: 5,  color: '#00E5FF', opacity: 0.35, duration: 7000 },
  { id: 6, x: 0.50, y: 0.05, size: 3,  color: '#6C63FF', opacity: 0.55, duration: 4500 },
  { id: 7, x: 0.70, y: 0.80, size: 4,  color: '#22D3EE', opacity: 0.4, duration: 6000 },
  { id: 8, x: 0.25, y: 0.88, size: 3,  color: '#8B7FFF', opacity: 0.5, duration: 5400 },
  { id: 9, x: 0.60, y: 0.72, size: 5,  color: '#00E5FF', opacity: 0.3, duration: 7200 },
];

// ─── Single floating particle ─────────────────────────────────────────────────
function Particle({ x, y, size, color, opacity, duration, isActive }: {
  x: number; y: number; size: number; color: string; opacity: number; duration: number; isActive: boolean;
}) {
  const translateY = useSharedValue(0);
  const particleOpacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      particleOpacity.value = withTiming(opacity, { duration: 800 });
      translateY.value = withRepeat(
        withSequence(
          withTiming(-10, { duration, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      particleOpacity.value = withTiming(0, { duration: 400 });
      translateY.value = 0;
    }
  }, [isActive]);

  const style = useAnimatedStyle(() => ({
    opacity: particleOpacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: x * width,
          top: y * height,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: size * 2,
          elevation: 0,
        },
        style,
      ]}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function AuthScreen({ currentIndex, myIndex }: { currentIndex: SharedValue<number>; myIndex: number }) {
  const router = useRouter();

  // Logo entrance
  const logoScale = useSharedValue(0.6);

  // Glow pulse (always active when screen is visible)
  const glowScale = useSharedValue(1.0);
  const glowOpacity = useSharedValue(0.15);

  // Text / button entrance
  const wordmarkOpacity = useSharedValue(0);
  const wordmarkY = useSharedValue(14);
  const taglineOpacity = useSharedValue(0);
  const btnOpacity = useSharedValue(0);
  const btnY = useSharedValue(24);

  // Background Parallax
  const bgTranslateX = useSharedValue(0);
  const bgTranslateY = useSharedValue(0);

  useEffect(() => {
    // Smooth infinite diagonal panning for the background image
    bgTranslateX.value = withRepeat(
      withSequence(
        withTiming(-width * 0.15, { duration: 25000, easing: Easing.inOut(Easing.sin) }),
        withTiming(width * 0.15, { duration: 25000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
    bgTranslateY.value = withRepeat(
      withSequence(
        withTiming(-height * 0.08, { duration: 32000, easing: Easing.inOut(Easing.sin) }),
        withTiming(height * 0.08, { duration: 32000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, []);

  useAnimatedReaction(
    () => Math.round(currentIndex.value) === myIndex,
    (isActive) => {
      if (isActive) {
        // Entrance animations
        logoScale.value = withSpring(1, { damping: 12, stiffness: 100 });
        wordmarkOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));
        wordmarkY.value = withDelay(300, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }));
        taglineOpacity.value = withDelay(500, withTiming(1, { duration: 400 }));
        btnOpacity.value = withDelay(900, withTiming(1, { duration: 400 }));
        btnY.value = withDelay(900, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }));

        // Glow pulse — continuous
        glowScale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
            withTiming(1.0,  { duration: 2400, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        glowOpacity.value = withRepeat(
          withSequence(
            withTiming(0.30, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.15, { duration: 2400, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
      } else {
        logoScale.value = 0.6;
        wordmarkOpacity.value = 0;
        wordmarkY.value = 14;
        taglineOpacity.value = 0;
        btnOpacity.value = 0;
        btnY.value = 24;
        glowScale.value = 1.0;
        glowOpacity.value = 0.15;
      }
    }
  );

  // Drive particle visibility from JS
  React.useEffect(() => {
    // We can't easily bridge animated reaction to JS state, so poll once
    // via a simple approach: use the index directly
  }, []);

  const logoBoxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));
  const wmStyle = useAnimatedStyle(() => ({
    opacity: wordmarkOpacity.value,
    transform: [{ translateY: wordmarkY.value }],
  }));
  const tagStyle = useAnimatedStyle(() => ({ opacity: taglineOpacity.value }));
  const btnStyle = useAnimatedStyle(() => ({
    opacity: btnOpacity.value,
    transform: [{ translateY: btnY.value }],
  }));
  const bgStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: bgTranslateX.value },
      { translateY: bgTranslateY.value },
      { scale: 1.35 } // Scale up so we don't see edges during panning
    ],
  }));

  return (
    <View style={styles.authScreen}>
      {/* Cinematic Panning Background */}
      <Animated.Image 
        source={BG_IMAGE} 
        style={[StyleSheet.absoluteFillObject, { width: '100%', height: '100%', opacity: 0.8 }, bgStyle]} 
        resizeMode="cover"
      />
      
      {/* Dark overlay to ensure white text remains readable and keeps the dark mode aesthetic */}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(13, 13, 28, 0.65)' }]} />
      
      {/* Subtle bottom gradient to blend the buttons beautifully */}
      <LinearGradient
        colors={['transparent', 'rgba(13, 13, 28, 0.8)', '#0D0D1C']}
        locations={[0, 0.7, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Ambient particles */}
      {PARTICLES.map(p => (
        <Particle key={p.id} {...p} isActive={Math.round(currentIndex.value) === myIndex} />
      ))}

      {/* ── Top half: logo + wordmark ── */}
      <View style={styles.authTop}>
      {/* Radial glow behind logo — fades from violet core to transparent */}
        <Animated.View style={[styles.radialGlow, glowStyle]} pointerEvents="none">
          <LinearGradient
            colors={['rgba(108, 99, 255, 0.55)', 'rgba(59, 130, 246, 0.2)', 'rgba(34, 211, 238, 0)']}
            start={{ x: 0.5, y: 0.5 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>

        {/* Logo image */}
        <Animated.View style={[styles.logoBox, logoBoxStyle]}>
          <Image source={LOGO} style={styles.logoImage} resizeMode="contain" />
        </Animated.View>

        {/* Wordmark + tagline — tightly grouped */}
        <Animated.Text style={[styles.wordmark, wmStyle]}>Crewmute</Animated.Text>
        <Animated.Text style={[styles.tagline, tagStyle]}>Your campus. Your ride.</Animated.Text>
      </View>

      {/* ── Bottom half: CTAs ── */}
      <Animated.View style={[styles.authBottom, btnStyle]}>
        <Pressable style={styles.createBtn} onPress={() => router.push('/(auth)/register')}>
          {/* Violet glow shadow layer */}
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
  authScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0D1C',
  },
  particle: {
    position: 'absolute',
  },

  // ── Top section ──────────────────────────────────────────────────────────
  authTop: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  radialGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    overflow: 'hidden',
  },
  logoBox: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  wordmark: {
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    fontSize: 32,
    color: '#F4F4FF',
    letterSpacing: -1,
    marginTop: 16,       // icon → wordmark: 16px
  },
  tagline: {
    fontFamily: 'PlusJakartaSans-400Regular',
    fontSize: 15,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 6,        // wordmark → tagline: 6px
  },

  // ── Bottom section ────────────────────────────────────────────────────────
  authBottom: {
    width: '100%',
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 40,
  },
  createBtn: {
    height: 56,
    backgroundColor: tokens.primary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'visible',
    // Native shadow for iOS
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
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
  createBtnText: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  signInBtn: {
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.35)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  signInBtnText: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 16,
    color: '#7C74FF',
  },
  authFooter: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 12,
    color: 'rgba(255,255,255,0.2)',
    textAlign: 'center',
  },
});
