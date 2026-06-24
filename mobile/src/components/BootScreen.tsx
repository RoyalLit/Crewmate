import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// We use a massive view with a thick border to create a "hole".
// By animating ONLY the transform scale, we get 120fps hardware acceleration
// without triggering JS layout thrashing.
const HOLE_START = 10; 
const BORDER_SIZE = Math.max(width, height) * 1.5; 
const TOTAL_SIZE = HOLE_START + BORDER_SIZE * 2;
const MAX_SCALE = (Math.max(width, height) * 1.5) / HOLE_START;

const LETTERS = ['C', 'R', 'E', 'W', 'M', 'U', 'T', 'E'];

function AnimatedLetter({ letter, index, letterProgress }: { letter: string; index: number; letterProgress: SharedValue<number> }) {
  const animatedStyle = useAnimatedStyle(() => {
    const progress = Math.max(0, Math.min(1, letterProgress.value * (1 + index * 0.1) - index * 0.1));
    return {
      opacity: interpolate(progress, [0, 1], [0, 1]),
      transform: [
        { translateY: interpolate(progress, [0, 1], [-50, 0]) },
        { scale: interpolate(progress, [0, 1], [0.5, 1]) }
      ],
    };
  });

  return (
    <Animated.Text style={[styles.letter, animatedStyle]}>
      {letter}
    </Animated.Text>
  );
}

export function BootScreen({ onAnimationDone, isReady }: { onAnimationDone: () => void, isReady?: boolean }) {
  const [isTextDone, setIsTextDone] = useState(false);
  const letterProgress = useSharedValue(0);
  const letterOpacity = useSharedValue(1);
  const solidOpacity = useSharedValue(1);

  // Scale of the expanding hole
  const holeScale = useSharedValue(1);

  useEffect(() => {
    // 1. Drop letters in
    letterProgress.value = 0; // reset for hot reloads
    letterProgress.value = withSpring(1, {
      damping: 12,
      stiffness: 100,
      mass: 1,
    });

    // The withSpring callback sometimes doesn't fire on hot-reloads or fast device loads.
    // A guaranteed 1200ms timeout ensures the spring has visually settled before we allow the hole to open.
    const textTimer = setTimeout(() => {
      setIsTextDone(true);
    }, 1200);

    return () => clearTimeout(textTimer);
  }, []);

  useEffect(() => {
    if (isReady === false || !isTextDone) return; // Wait until BOTH app is ready AND text animation is completely settled

    // 2. Explode the circle outwards using GPU scale
    // Add a tiny 200ms delay to allow React Native to decode the image texture to GPU
    const timer = setTimeout(() => {
      // Instantly hide the solid background to reveal the 10px hole
      solidOpacity.value = 0;
      // Fade out letters
      letterOpacity.value = withTiming(0, { duration: 150 });

      // Hardware-accelerated scale up!
      holeScale.value = withTiming(MAX_SCALE, {
        duration: 800,
        easing: Easing.inOut(Easing.cubic),
      }, (finished) => {
        if (finished) {
          runOnJS(onAnimationDone)();
        }
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [isReady, isTextDone]);

  const holeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: holeScale.value }],
  }));

  const solidStyle = useAnimatedStyle(() => ({
    opacity: solidOpacity.value,
  }));

  const textContainerStyle = useAnimatedStyle(() => ({
    opacity: letterOpacity.value,
  }));

  return (
    <View style={styles.container} pointerEvents="none" accessibilityElementsHidden>
      {/* The GPU Accelerated Expanding Hole */}
      <Animated.View style={[styles.expandingHole, holeStyle]} />

      {/* Solid background covering the initial 10px hole */}
      <Animated.View style={[styles.solidBg, solidStyle]} />

      {/* Staggered Text */}
      <Animated.View style={[styles.textContainer, textContainerStyle]} pointerEvents="none">
        {LETTERS.map((letter, index) => (
          <AnimatedLetter key={index} letter={letter} index={index} letterProgress={letterProgress} />
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999, // Very top
  },
  solidBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F0F1A',
  },
  expandingHole: {
    position: 'absolute',
    top: height / 2 - TOTAL_SIZE / 2,
    left: width / 2 - TOTAL_SIZE / 2,
    width: TOTAL_SIZE,
    height: TOTAL_SIZE,
    borderRadius: TOTAL_SIZE / 2,
    borderWidth: BORDER_SIZE,
    borderColor: '#0F0F1A',
    backgroundColor: 'transparent',
  },
  textContainer: {
    flexDirection: 'row',
    zIndex: 5,
  },
  letter: {
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    fontSize: 40,
    color: '#FFFFFF',
    letterSpacing: 2,
    marginHorizontal: 1,
  },
});
