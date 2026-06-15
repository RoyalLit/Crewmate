import React, { useState } from 'react';
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
  useAnimatedReaction,
  SharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

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

function StaggeredText({ text, currentIndex, myIndex }: { text: string; currentIndex: SharedValue<number>; myIndex: number }) {
  const words = text.split(' ');
  
  return (
    <View style={styles.headlineWrapper}>
      {words.map((word, i) => {
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
          <Animated.Text key={i} style={[styles.headline, animatedStyle]}>
            {word}{' '}
          </Animated.Text>
        );
      })}
    </View>
  );
}

// React state is acceptable for numbers that require JS formatting (like ₹), 
// but we'll useAnimatedReaction to trigger the state loop instead of passing props.
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

  const resetAnimation = () => {
    setValue(0);
  };

  useAnimatedReaction(
    () => Math.round(currentIndex.value) === myIndex,
    (isActive, wasActive) => {
      // Only run the JS logic if state actually toggled to avoid re-renders during smooth scrolling
      if (isActive && !wasActive) {
        runOnJS(startAnimation)();
      } else if (!isActive && wasActive) {
        runOnJS(resetAnimation)();
      }
    }
  );

  return <Text style={styles.savingsNumber}>₹{value}</Text>;
}

// --- Screens ---
const Screen1 = ({ currentIndex, myIndex, topInset }: { currentIndex: SharedValue<number>; myIndex: number; topInset: number }) => {
  const subOpacity = useSharedValue(0);
  useAnimatedReaction(
    () => Math.abs(currentIndex.value - myIndex) < 0.85,
    (isActive) => {
      const delay = myIndex === 0 ? 0 : 100;
      if (isActive) subOpacity.value = withDelay(delay, withTiming(1, { duration: 250 }));
      else subOpacity.value = 0;
    }
  );

  return (
    <View style={styles.screenContent}>
      <View style={[styles.heroZone, { top: 0, height: height * 0.65 }]}>
        <Image source={SCENE_1} style={[styles.heroImage, { height: height * 0.65 }]} resizeMode="cover" />
        <LinearGradient
          colors={[tokens.bg, 'rgba(13,13,28,0.8)', 'transparent']}
          locations={[0, 0.4, 1]}
          style={[styles.gradientMaskTop, { height: topInset + 60 }]}
        />
        <LinearGradient
          colors={['transparent', 'rgba(13,13,28,0)', tokens.bg]}
          locations={[0, 0.4, 1]}
          style={styles.gradientMask}
        />
      </View>
      <View style={[styles.bottomZone, { top: height * 0.65 }]}>
        <StaggeredText text="Why is getting home this hard?" currentIndex={currentIndex} myIndex={myIndex} />
        <Animated.Text style={[styles.subtext, { opacity: subOpacity }]}>
          75 unread messages and still no ride sorted.
        </Animated.Text>
      </View>
    </View>
  );
};

const Screen2 = ({ currentIndex, myIndex, topInset }: { currentIndex: SharedValue<number>; myIndex: number; topInset: number }) => {
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
      <View style={[styles.heroZone, { top: 0, height: height * 0.58 }]}>
        <Image source={SCENE_2} style={[styles.heroImage, { height: height * 0.65, transform: [{ scale: 1.05 }] }]} resizeMode="cover" />
        <LinearGradient
          colors={[tokens.bg, 'rgba(13,13,28,0.8)', 'transparent']}
          locations={[0, 0.4, 1]}
          style={[styles.gradientMaskTop, { height: topInset + 60 }]}
        />
        <LinearGradient
          colors={['transparent', 'rgba(13,13,28,0)', tokens.bg]}
          locations={[0, 0.4, 1]}
          style={styles.gradientMask}
        />
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
};

const Screen3 = ({ currentIndex, myIndex, topInset }: { currentIndex: SharedValue<number>; myIndex: number; topInset: number }) => {
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
      <View style={[styles.heroZone, { top: 0, height: height * 0.50 }]}>
        <Image source={SCENE_3} style={[styles.heroImage, { height: height * 0.65 }]} resizeMode="cover" />
        <LinearGradient
          colors={[tokens.bg, 'rgba(13,13,28,0.8)', 'transparent']}
          locations={[0, 0.4, 1]}
          style={[styles.gradientMaskTop, { height: topInset + 60 }]}
        />
        <LinearGradient
          colors={['transparent', 'rgba(13,13,28,0)', tokens.bg]}
          locations={[0, 0.4, 1]}
          style={styles.gradientMask}
        />
      </View>
      <View style={[styles.bottomZone, { top: height * 0.50 }]}>
        <StaggeredText text="Stop paying full price to go home." currentIndex={currentIndex} myIndex={myIndex} />
        <Animated.Text style={[styles.subtext, { opacity: subOpacity }]}>
          Four of you. One cab. One-fourth the price. Simple math.
        </Animated.Text>
        <View style={styles.savingsCard}>
          <AnimatedNumber currentIndex={currentIndex} myIndex={myIndex} />
          <Text style={styles.savingsLabel}>average saved per trip</Text>
        </View>
      </View>
    </View>
  );
};

const Screen4 = ({ currentIndex, myIndex, topInset }: { currentIndex: SharedValue<number>; myIndex: number; topInset: number }) => {
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
      <View style={[styles.heroZone, { top: 0, height: height * 0.52 }]}>
        {/* Aggressive scale to completely crop out the gold ring */}
        <Image source={SCENE_4} style={[styles.heroImage, { height: height * 0.65, transform: [{ scale: 1.6 }] }]} resizeMode="cover" />
        <LinearGradient
          colors={[tokens.bg, 'rgba(13,13,28,0.8)', 'transparent']}
          locations={[0, 0.4, 1]}
          style={[styles.gradientMaskTop, { height: topInset + 60 }]}
        />
        <LinearGradient
          colors={['transparent', 'rgba(13,13,28,0)', tokens.bg]}
          locations={[0, 0.4, 1]}
          style={styles.gradientMask}
        />
      </View>
      <View style={[styles.bottomZone, { top: height * 0.52 }]}>
        <StaggeredText text="Someone's always heading your way." currentIndex={currentIndex} myIndex={myIndex} />
        <Animated.Text style={[styles.subtext, { opacity: subOpacity }]}>
          Every weekend, students from your campus go home. Now you go together.
        </Animated.Text>
        <View style={styles.avatarRow}>
          <View style={styles.avatarStack}>
            {avatars.map((initials, i) => {
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
                <Animated.View 
                  key={i} 
                  style={[
                    styles.avatarCircle, 
                    { backgroundColor: avatarColors[i], left: i * 32, zIndex: 4 - i, transform: [{ scale }] }
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

const AuthScreen = ({ currentIndex, myIndex }: { currentIndex: SharedValue<number>; myIndex: number }) => {
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
};

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
        width: withTiming(isActive ? 24 : 6, { duration: 200, easing: Easing.out(Easing.ease) }),
        backgroundColor: isActive ? tokens.primary : '#2E2E4A',
        height: 6,
        borderRadius: 3,
      };
    });
    return <Animated.View style={[styles.dot, style]} />;
  };

  const AnimatedScreen = ({ index }: { index: number }) => {
    const style = useAnimatedStyle(() => {
      const position = index - (currentIndex.value - translationX.value);
      
      let translateX = position * width;
      let opacity = 1;

      if (position < 0) {
        translateX = position * (width * 0.5); 
        opacity = interpolate(position, [-1, 0], [0.6, 1], Extrapolate.CLAMP);
      } else if (position > 0) {
        opacity = 1;
      }

      if (index === 4) {
        opacity = interpolate(currentIndex.value, [3, 4], [0, 1], Extrapolate.CLAMP);
        translateX = 0;
      } else if (currentIndex.value > 3) {
        // Fade out all previous screens completely when transitioning to the final AuthScreen
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

  // UI styling for conditional elements based strictly on currentIndex
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
      <View style={styles.container}>
        <StatusBar style="light" />
        {[0, 1, 2, 3, 4].map(i => <AnimatedScreen key={i} index={i} />)}

        <Animated.View style={[styles.skipBtn, { top: Math.max(insets.top, 24) }, skipBtnStyle]}>
          <Pressable onPress={skipToAuth}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </Animated.View>

        <Animated.View style={[styles.dotsContainer, { bottom: Math.max(insets.bottom, 24) + 80 }, skipBtnStyle]} pointerEvents="none">
          {[0, 1, 2, 3].map((i) => <Dot key={i} index={i} />)}
        </Animated.View>

        <Animated.View style={[styles.actionContainer, { bottom: Math.max(insets.bottom, 24) }, continueBtnStyle]} pointerEvents="box-none">
          <Pressable style={styles.continueBtn} onPress={goToNext}>
            {/* Find my crew dynamic text logic handled safely. Since we removed React state for performance,
                we can just use an animated component or rely on simple conditional based on current UI.
                We'll use a simple component that updates its text based on animated reaction for peak perf. */}
            <DynamicContinueText currentIndex={currentIndex} />
          </Pressable>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

function DynamicContinueText({ currentIndex }: { currentIndex: SharedValue<number> }) {
  const [isLast, setIsLast] = useState(false);
  
  const updateState = (active: boolean) => setIsLast(active);

  useAnimatedReaction(
    () => Math.round(currentIndex.value) === 3,
    (active, prev) => {
      if (active !== prev) {
        runOnJS(updateState)(active);
      }
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
  screenContent: {
    flex: 1,
  },
  heroZone: {
    position: 'absolute',
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  gradientMaskTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 2,
  },
  gradientMask: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%', // Gradient covers entire hero zone, going from transparent to solid black
  },
  bottomZone: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 16, // Text flows directly from the gradient point
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustPillText: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 12,
    color: '#7C74FF',
  },

  savingsCard: {
    backgroundColor: tokens.card,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 0.5,
    borderColor: '#2E2E4A',
    alignSelf: 'flex-start',
    marginTop: 12,
    alignItems: 'center',
  },
  savingsNumber: {
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    fontSize: 40,
    color: tokens.accent,
    textShadowColor: 'rgba(34,211,238,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  savingsLabel: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 12,
    color: tokens.textMuted,
    marginTop: -4,
  },

  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  avatarStack: {
    width: 130,
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
