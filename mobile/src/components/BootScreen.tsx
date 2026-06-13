import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
  withSpring
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export function BootScreen({ onAnimationDone }: { onAnimationDone: () => void }) {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Zoom out the text slightly with spring, then fade out the whole screen
    scale.value = withSpring(0.8, { damping: 12, stiffness: 100 }, () => {
      opacity.value = withDelay(200, withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.ease)
      }, (finished) => {
        if (finished) {
          runOnJS(onAnimationDone)();
        }
      }));
    });
  }, []);

  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      // Need pointerEvents='none' implicitly when it hides, but we unmount it anyway.
    };
  });

  const textStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.Text style={[styles.logoText, textStyle]}>
        CREWMUTE
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width,
    height,
    backgroundColor: '#0F0F1A', // Matches app.json native splash
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999, // Very top
  },
  logoText: {
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    fontSize: 32,
    color: '#FFFFFF',
    letterSpacing: 8,
  },
});
