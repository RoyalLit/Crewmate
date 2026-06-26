import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, DeviceEventEmitter } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  cancelAnimation,
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

const TOAST_EVENT = 'SHOW_GLOBAL_TOAST';

export class Toast {
  static show(options: ToastData) {
    DeviceEventEmitter.emit(TOAST_EVENT, options);
  }
}

export function ToastProvider() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<ToastData | null>(null);
  
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(TOAST_EVENT, (toastData: ToastData) => {
      setData(toastData);
      
      if (Platform.OS !== 'web') {
        if (toastData.type === 'success') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else if (toastData.type === 'error') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (data) {
      const duration = data.duration || 3000;
      
      cancelAnimation(translateY);
      cancelAnimation(opacity);

      // Animate in
      translateY.value = withSpring(0, { damping: 12, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 200 });
      
      // Animate out after delay
      const timeout = setTimeout(() => {
        translateY.value = withTiming(-100, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 }, (finished) => {
          if (finished) {
            runOnJS(setData)(null);
          }
        });
      }, duration);

      return () => clearTimeout(timeout);
    } else {
      // Instantly reset when data is null
      translateY.value = -100;
      opacity.value = 0;
    }
    return undefined;
  }, [data]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const isSuccess = data?.type === 'success';
  const isError = data?.type === 'error';
  const backgroundColor = isError ? colors.status.rejectedBackground : (isSuccess ? colors.status.acceptedBackground : colors.background.card);
  const iconName = isError ? 'alert-circle' : (isSuccess ? 'checkmark-circle' : 'information-circle');
  const textColor = '#FFFFFF';

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
        {
          top: Math.max(insets.top + 10, 50),
          backgroundColor,
        }
      ]}
      pointerEvents="none"
    >
      <Ionicons name={iconName} size={24} color={textColor} />
      <View style={styles.textContainer}>
        {!!data?.title && (
          <Text style={[styles.title, { color: textColor }]}>{data.title}</Text>
        )}
        <Text style={[styles.message, { color: textColor }]}>{data?.message}</Text>
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
    elevation: 999,
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
