import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  runOnJS
} from 'react-native-reanimated';
import { useTheme } from '../design/theme';
import { spacing } from '../design/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

export interface ToastData {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

type ToastListener = (data: ToastData) => void;
let showListener: ToastListener | null = null;

export class Toast {
  static show(options: ToastData) {
    if (showListener) {
      showListener(options);
    }
  }
}

export function ToastProvider() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<ToastData | null>(null);
  
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    showListener = (toastData: ToastData) => {
      setData(toastData);
      
      const duration = toastData.duration || 3000;
      
      // Animate in
      translateY.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });
      
      // Animate out after delay
      translateY.value = withSequence(
        withDelay(
          duration,
          withTiming(-100, { duration: 300 }, (finished) => {
            if (finished) {
              runOnJS(setData)(null);
            }
          })
        )
      );
      opacity.value = withSequence(
        withDelay(duration, withTiming(0, { duration: 300 }))
      );
    };
    return () => {
      showListener = null;
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!data) return null;

  const isSuccess = data.type === 'success';
  const isError = data.type === 'error';
  const backgroundColor = isError ? colors.status.rejectedBackground : (isSuccess ? colors.status.acceptedBackground : colors.background.card);
  const iconName = isError ? 'alert-circle' : (isSuccess ? 'checkmark-circle' : 'information-circle');
  const textColor = '#FFFFFF';

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
        {
          top: Platform.OS === 'ios' ? Math.max(insets.top, 40) : 40,
          backgroundColor,
        }
      ]}
      pointerEvents="none"
    >
      <Ionicons name={iconName} size={24} color={textColor} />
      <View style={styles.textContainer}>
        {!!data.title && (
          <Text style={[styles.title, { color: textColor }]}>{data.title}</Text>
        )}
        <Text style={[styles.message, { color: textColor }]}>{data.message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  textContainer: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  title: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 14,
    marginBottom: 2,
  },
  message: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 13,
  },
});
