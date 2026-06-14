import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  interpolate, 
  Extrapolate,
  withDelay,
  Easing,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

// --- Design Tokens ---
const tokens = {
  bg: '#0D0D1C',
  card: '#1C1C2E',
  border: 'rgba(255,255,255,0.06)',
  primary: '#6C63FF',
  accent: '#22D3EE',
  warning: '#FFB84C',
  textPrimary: '#F0F0FF',
  textMuted: '#6B7280',
};

// --- Spring Config ---
const SPRING_CONFIG = {
  stiffness: 180,
  damping: 24,
  mass: 1,
};

// --- Assets ---
const SCENE_1 = require('../../assets/images/onboarding/scene1.png');
const SCENE_2 = require('../../assets/images/onboarding/scene2.png');
const SCENE_3 = require('../../assets/images/onboarding/scene3.png');
const SCENE_4 = require('../../assets/images/onboarding/scene4.png');

// --- Subcomponents ---

function StaggeredText({ text, isActive }: { text: string; isActive: boolean }) {
  const words = text.split(' ');
  
  return (
    <View style={styles.headlineWrapper}>
      {words.map((word, i) => {
        const translateY = useSharedValue(12);
        const opacity = useSharedValue(0);

        useEffect(() => {
          if (isActive) {
            translateY.value = withDelay(200 + i * 60, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }));
            opacity.value = withDelay(200 + i * 60, withTiming(1, { duration: 400 }));
          } else {
            translateY.value = 12;
            opacity.value = 0;
          }
        }, [isActive]);

        const animatedStyle = useAnimatedStyle(() => ({
          transform: [{ translateY: translateY.value }],
          opacity: opacity.value,
        }));

        return (
          <Animated.Text key={i} style={[styles.headline, animatedStyle]}>
            {word}{' '}
          </Animated.Text>
        );
      })}
    </View>
  );
}

function AnimatedNumber({ isActive }: { isActive: boolean }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (isActive) {
      let startTimestamp: number | null = null;
      const duration = 1200;
      
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // easeOutCubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        setValue(Math.floor(easeProgress * 450));
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);
    } else {
      setValue(0);
    }
  }, [isActive]);

  return <Text style={styles.savingsNumber}>₹{value}</Text>;
}

export default function OnboardingFlow() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const currentIndex = useSharedValue(0);
  const translationX = useSharedValue(0);
  
  const [activeIndex, setActiveIndex] = useState(0);

  // Sync state for components that need JS re-renders (like staggered text)
  useEffect(() => {
    const id = setInterval(() => {
      if (Math.round(currentIndex.value) !== activeIndex) {
        setActiveIndex(Math.round(currentIndex.value));
      }
    }, 50);
    return () => clearInterval(id);
  }, [activeIndex]);

  const goToNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex.value < 4) {
      currentIndex.value = withSpring(currentIndex.value + 1, SPRING_CONFIG);
    }
  };

  const skipToAuth = () => {
    currentIndex.value = withTiming(4, { duration: 300 });
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (currentIndex.value === 4) return; // No swipe on auth screen
      
      let newTranslation = e.translationX;
      // 30% rubber band resistance for swiping back on first screen
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

  const renderScreen = (index: number) => {
    const style = useAnimatedStyle(() => {
      const position = index - (currentIndex.value - translationX.value);
      
      // Incoming slides from right at 1.0
      // Outgoing slides left + fades to 0.6
      let translateX = position * width;
      let opacity = 1;

      if (position < 0) {
        // Outgoing to left
        translateX = position * (width * 0.5); // Slower parallax
        opacity = interpolate(position, [-1, 0], [0.6, 1], Extrapolate.CLAMP);
      } else if (position > 0) {
        // Incoming from right
        opacity = 1;
      }

      // If jumping to screen 5 via skip (crossfade directly without slide)
      if (currentIndex.value > 3.9 && index === 4) {
        opacity = interpolate(currentIndex.value, [3, 4], [0, 1], Extrapolate.CLAMP);
        translateX = 0;
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

    return (
      <Animated.View key={index} style={[style, styles.screen]}>
        {index === 0 && <Screen1 isActive={activeIndex === 0} />}
        {index === 1 && <Screen2 isActive={activeIndex === 1} />}
        {index === 2 && <Screen3 isActive={activeIndex === 2} />}
        {index === 3 && <Screen4 isActive={activeIndex === 3} />}
        {index === 4 && <AuthScreen />}
      </Animated.View>
    );
  };

  // --- Screens ---
  const Screen1 = ({ isActive }: { isActive: boolean }) => {
    const subOpacity = useSharedValue(0);
    useEffect(() => {
      if (isActive) subOpacity.value = withDelay(800, withTiming(1, { duration: 400 }));
      else subOpacity.value = 0;
    }, [isActive]);

    return (
      <View style={styles.screenContent}>
        <View style={styles.heroZone}>
          <Image source={SCENE_1} style={styles.heroImage} resizeMode="contain" />
        </View>
        <View style={styles.bottomZone}>
          <StaggeredText text="Getting home shouldn't feel like this." isActive={isActive} />
          <Animated.Text style={[styles.subtext, { opacity: subOpacity }]}>
            Chaotic WhatsApp threads. No-shows. Strangers you can't trust.
          </Animated.Text>
        </View>
      </View>
    );
  };

  const Screen2 = ({ isActive }: { isActive: boolean }) => {
    const subOpacity = useSharedValue(0);
    const pillScale = useSharedValue(0.8);
    const pillOpacity = useSharedValue(0);

    useEffect(() => {
      if (isActive) {
        subOpacity.value = withDelay(800, withTiming(1, { duration: 400 }));
        pillScale.value = withDelay(600, withSpring(1, { damping: 15, stiffness: 200 }));
        pillOpacity.value = withDelay(600, withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }));
      } else {
        subOpacity.value = 0;
        pillScale.value = 0.8;
        pillOpacity.value = 0;
      }
    }, [isActive]);

    return (
      <View style={styles.screenContent}>
        <View style={styles.heroZone}>
          <Image source={SCENE_2} style={styles.heroImage} resizeMode="contain" />
        </View>
        <View style={styles.bottomZone}>
          <StaggeredText text="Only your campus. Only verified." isActive={isActive} />
          <Animated.Text style={[styles.subtext, { opacity: subOpacity }]}>
            Every person on Crewmute is verified with a college email. Same campus, same trust.
          </Animated.Text>
          <Animated.View style={[styles.trustPill, { transform: [{ scale: pillScale }], opacity: pillOpacity }]}>
            <View style={styles.trustShield} />
            <Text style={styles.trustPillText}>College email verified</Text>
          </Animated.View>
        </View>
      </View>
    );
  };

  const Screen3 = ({ isActive }: { isActive: boolean }) => {
    const subOpacity = useSharedValue(0);
    useEffect(() => {
      if (isActive) subOpacity.value = withDelay(800, withTiming(1, { duration: 400 }));
      else subOpacity.value = 0;
    }, [isActive]);

    return (
      <View style={styles.screenContent}>
        <View style={styles.heroZone}>
          <Image source={SCENE_3} style={styles.heroImage} resizeMode="contain" />
        </View>
        <View style={styles.bottomZone}>
          <StaggeredText text="Split the fare. Keep the rest." isActive={isActive} />
          <Animated.Text style={[styles.subtext, { opacity: subOpacity }]}>
            A cab home doesn't have to cost a fortune. Share it, and everyone wins.
          </Animated.Text>
          <View style={styles.savingsCard}>
            <AnimatedNumber isActive={isActive} />
            <Text style={styles.savingsLabel}>average saved per trip</Text>
          </View>
        </View>
      </View>
    );
  };

  const Screen4 = ({ isActive }: { isActive: boolean }) => {
    const subOpacity = useSharedValue(0);
    const avatars = ['AK', 'PS', 'RV', 'KD'];
    const colors = [tokens.primary, tokens.accent, tokens.warning, '#FF6584'];

    useEffect(() => {
      if (isActive) subOpacity.value = withDelay(800, withTiming(1, { duration: 400 }));
      else subOpacity.value = 0;
    }, [isActive]);

    return (
      <View style={styles.screenContent}>
        <View style={styles.heroZone}>
          <Image source={SCENE_4} style={styles.heroImage} resizeMode="contain" />
        </View>
        <View style={styles.bottomZone}>
          <StaggeredText text="Your crew is already waiting." isActive={isActive} />
          <Animated.Text style={[styles.subtext, { opacity: subOpacity }]}>
            Students from your campus heading the same way. Every weekend.
          </Animated.Text>
          <View style={styles.avatarRow}>
            <View style={styles.avatarStack}>
              {avatars.map((initials, i) => {
                const scale = useSharedValue(0);
                useEffect(() => {
                  if (isActive) {
                    scale.value = withDelay(800 + i * 80, withSequence(
                      withTiming(1.08, { duration: 150 }),
                      withSpring(1, { damping: 12, stiffness: 150 })
                    ));
                  } else {
                    scale.value = 0;
                  }
                }, [isActive]);

                return (
                  <Animated.View 
                    key={i} 
                    style={[
                      styles.avatarCircle, 
                      { backgroundColor: colors[i], left: i * 32, zIndex: 4 - i, transform: [{ scale }] }
                    ]}
                  >
                    <Text style={styles.avatarText}>{initials}</Text>
                  </Animated.View>
                );
              })}
            </View>
            <Animated.Text style={[styles.avatarLabel, { opacity: subOpacity }]}>
              12 students going home this weekend
            </Animated.Text>
          </View>
        </View>
      </View>
    );
  };

  const AuthScreen = () => {
    const logoScale = useSharedValue(0.6);
    const wordmarkOpacity = useSharedValue(0);
    const wordmarkY = useSharedValue(12);
    const taglineOpacity = useSharedValue(0);
    const btnOpacity = useSharedValue(0);
    const btnY = useSharedValue(24);
    const glowOpacity = useSharedValue(0.15);

    useEffect(() => {
      if (activeIndex === 4) {
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
      }
    }, [activeIndex]);

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
  };

  // --- Layout Elements ---
  const renderDots = () => {
    return (
      <View style={[styles.dotsContainer, { top: height * 0.55 + 24 }]}>
        {[0, 1, 2, 3].map((i) => {
          const style = useAnimatedStyle(() => {
            const isActive = Math.round(currentIndex.value) === i;
            return {
              width: withTiming(isActive ? 24 : 8, { duration: 200, easing: Easing.out(Easing.ease) }),
              backgroundColor: isActive ? tokens.primary : '#2E2E4A',
              height: isActive ? 8 : 4,
              borderRadius: 4,
            };
          });
          return <Animated.View key={i} style={[styles.dot, style]} />;
        })}
      </View>
    );
  };

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>
        {[0, 1, 2, 3, 4].map(renderScreen)}

        {activeIndex < 4 && (
          <>
            <Pressable 
              style={[styles.skipBtn, { top: Math.max(insets.top, 24) }]} 
              onPress={skipToAuth}
            >
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>

            {renderDots()}

            <View style={[styles.actionContainer, { bottom: Math.max(insets.bottom, 24) }]} pointerEvents="box-none">
              <Pressable style={styles.continueBtn} onPress={goToNext}>
                {activeIndex === 3 && <View style={styles.violetGlow} />}
                <Text style={styles.continueText}>
                  {activeIndex === 3 ? "Find My Crew →" : "Continue"}
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.bg,
  },
  screen: {
    ...StyleSheet.absoluteFillObject,
  },
  screenContent: {
    flex: 1,
  },
  heroZone: {
    height: '55%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  bottomZone: {
    height: '45%',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
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
  subtext: {
    fontFamily: 'PlusJakartaSans-400Regular',
    fontSize: 15,
    color: tokens.textMuted,
    lineHeight: 24,
  },
  skipBtn: {
    position: 'absolute',
    right: 24,
    zIndex: 100,
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
    zIndex: 100,
  },
  dot: {
    marginRight: 6,
  },
  actionContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 100,
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
  
  // Screen 2 Extra
  trustPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108,99,255,0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(108,99,255,0.3)',
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginTop: 24,
  },
  trustShield: {
    width: 16,
    height: 16,
    backgroundColor: tokens.primary,
    borderRadius: 8,
    marginRight: 8,
  },
  trustPillText: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 12,
    color: '#7C74FF',
  },

  // Screen 3 Extra
  savingsCard: {
    backgroundColor: tokens.card,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 0.5,
    borderColor: '#2E2E4A',
    alignSelf: 'flex-start',
    marginTop: 24,
    alignItems: 'center',
  },
  savingsNumber: {
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    fontSize: 48,
    color: tokens.primary,
    textShadowColor: 'rgba(34,211,238,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  savingsLabel: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 12,
    color: tokens.textMuted,
    marginTop: -4,
  },

  // Screen 4 Extra
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  avatarStack: {
    width: 130, // 4 avatars * 32px
    height: 44,
  },
  avatarCircle: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: tokens.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  avatarLabel: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 12,
    color: tokens.textMuted,
    marginLeft: 12,
  },

  // Screen 5
  authScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authTop: {
    height: '45%',
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  radialGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: tokens.primary,
    top: '20%',
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(108,99,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(108,99,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  logoDots: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: tokens.primary,
  },
  logoLine: {
    width: 20,
    height: 2,
    backgroundColor: tokens.primary,
    marginHorizontal: 4,
  },
  wordmark: {
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    fontSize: 28,
    color: tokens.textPrimary,
    letterSpacing: -0.84,
    marginTop: 16,
  },
  tagline: {
    fontFamily: 'PlusJakartaSans-400Regular',
    fontSize: 15,
    color: tokens.textMuted,
    marginTop: 6,
  },
  authBottom: {
    height: '45%',
    width: '100%',
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
  },
  createBtn: {
    height: 56,
    backgroundColor: tokens.primary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  createBtnText: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  signInBtn: {
    height: 56,
    borderWidth: 0.5,
    borderColor: 'rgba(108,99,255,0.4)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  signInBtnText: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 16,
    color: '#7C74FF',
  },
  authFooter: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 12,
    color: '#4B5563',
    textAlign: 'center',
  },
});
