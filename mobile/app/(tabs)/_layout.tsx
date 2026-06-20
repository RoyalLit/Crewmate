/**
 * Tab bar layout — Floating Animated Pill Navbar
 *
 * Implements an island-style floating tab bar with a cool expanding animation
 * for the active tab (showing both icon and text in a pill).
 */

import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
let BlurView: any;
try {
  BlurView = require('expo-blur').BlurView;
} catch {
  // expo-blur may not be available on all targets
}

import { useTheme } from '../../src/design/theme';
import { useReducedMotion } from '../../src/design/useReducedMotion';
import { brandColors } from '../../src/design/tokens';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

// ─── Tab configuration ────────────────────────────────────────

interface TabConfig {
  name: string;
  title: string;
  icon: { active: string; inactive: string };
  iconSize?: number;
  accessibilityLabel: string;
}

const TAB_CONFIGS: TabConfig[] = [
  {
    name: 'index',
    title: 'Home',
    icon: { active: 'home', inactive: 'home-outline' },
    accessibilityLabel: 'Explore tab — browse available rides',
  },
  {
    name: 'rides',
    title: 'Rides',
    icon: { active: 'car', inactive: 'car-outline' },
    accessibilityLabel: 'My rides tab — rides you posted or joined',
  },
  {
    name: 'post',
    title: 'Post',
    icon: { active: 'add-circle', inactive: 'add-circle-outline' },
    accessibilityLabel: 'Post a ride tab',
  },
  {
    name: 'chats',
    title: 'Chats',
    icon: { active: 'chatbubble', inactive: 'chatbubble-outline' },
    accessibilityLabel: 'Chats tab — your active conversations',
  },
  {
    name: 'profile',
    title: 'Profile',
    icon: { active: 'person', inactive: 'person-outline' },
    accessibilityLabel: 'Profile tab — your account and settings',
  },
];

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// ─── Animated Tab Item ─────────────────────────────────────────

import { Easing } from 'react-native-reanimated';

function AnimatedTabItem({
  isFocused,
  route,
  navigation,
  config,
  colors,
  isDark,
  onPostPress,
}: {
  isFocused: boolean;
  route: any;
  navigation: any;
  config: TabConfig;
  colors: any;
  isDark: boolean;
  onPostPress?: () => void;
}) {
  const progress = useSharedValue(isFocused ? 1 : 0);
  const reducedMotion = useReducedMotion();

  React.useEffect(() => {
    if (reducedMotion) {
      progress.value = isFocused ? 1 : 0;
      return;
    }
    progress.value = withTiming(isFocused ? 1 : 0, {
      duration: 250,
      easing: Easing.out(Easing.cubic),
    });
  }, [isFocused, reducedMotion]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    // 44px fixed width for icons only
    const scale = 1 + progress.value * 0.15; // 1 to 1.15 scale when active
    
    // We remove the active background color inside the pill since ActiveTabGlow provides it, 
    // but on Android without glow we might want a subtle tint. Let's keep a subtle tint.
    const activeBgColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
    const bgColor = interpolateColor(
      progress.value,
      [0, 1],
      ['rgba(0,0,0,0)', activeBgColor]
    );

    return {
      width: 44,
      backgroundColor: bgColor,
      borderRadius: 22,
      transform: [{ scale }],
    };
  });

  const iconName = isFocused ? config.icon.active : config.icon.inactive;
  const iconSize = config.iconSize ?? 24;
  const inactiveColor = colors.text.placeholder;
  
  const activeColor = colors.text.primary;
  const iconColor = isFocused ? activeColor : inactiveColor;

  return (
    <Pressable
      onPress={() => {
        if (route.name === 'post') {
          onPostPress?.();
          return;
        }
        if (!isFocused && navigation) {
          navigation.navigate(route.name);
        }
      }}
      style={tabStyles.tabPressable}
      accessibilityLabel={config.accessibilityLabel}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
    >
      <Animated.View style={[tabStyles.tabItemCore, animatedContainerStyle, { justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name={iconName as IoniconsName} size={iconSize} color={iconColor} />
      </Animated.View>
    </Pressable>
  );
}

// ─── Active Tab Glow ────────────────────────────────────────────

function ActiveTabGlow({ activeIndex }: { activeIndex: number }) {
  const reducedMotion = useReducedMotion();
  const translateX = useSharedValue(34 + activeIndex * 52);

  React.useEffect(() => {
    if (reducedMotion) {
      translateX.value = 34 + activeIndex * 52;
      return;
    }
    translateX.value = withTiming(34 + activeIndex * 52, { 
      duration: 250, 
      easing: Easing.out(Easing.cubic) 
    });
  }, [activeIndex, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      // Center the 80px orb on the calculated center X
      transform: [{ translateX: translateX.value - 40 }],
    };
  });

  return (
    <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', borderRadius: 100 }]} pointerEvents="none">
      <Animated.View 
        style={[
          animatedStyle, 
          { 
            position: 'absolute', 
            top: -15, // Lifted slightly so the glow focuses on the top of the pill
            width: 80, 
            height: 80, 
            borderRadius: 40, 
            backgroundColor: brandColors.electricViolet, 
            opacity: 0.8 
          }
        ]} 
      />
    </View>
  );
}

// ─── Custom Floating Navbar ───────────────────────────────────

function CustomTabBar(props: BottomTabBarProps & { onPostPress?: () => void }) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const routes = props.state?.routes ?? [];
  const activeIndex = props.state?.index ?? 0;

  const innerContent = (
    <View
      style={[
        tabStyles.floatingPill,
        Platform.OS !== 'ios' && {
          backgroundColor: colors.background.card,
          elevation: 10,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        },
      ]}
    >
      {routes.map((route: any, index: number) => {
        const isFocused = (props.state?.index ?? 0) === index;
        const config = TAB_CONFIGS[index];
        if (!config) return null;

        return (
          <AnimatedTabItem
            key={route.key}
            isFocused={isFocused}
            route={route}
            navigation={props.navigation}
            config={config}
            colors={colors}
            isDark={isDark}
            onPostPress={props.onPostPress}
          />
        );
      })}
    </View>
  );

  return (
    <View
      style={[
        tabStyles.containerWrapper,
        { 
          paddingBottom: Platform.OS === 'ios' 
            ? Math.max(insets.bottom, 16) 
            : insets.bottom + 16 // Ensures it floats above Android software navigation bars
        },
      ]}
      pointerEvents="box-none"
    >
      {Platform.OS === 'ios' ? (
        <View style={tabStyles.blurContainerWrapper}>
          <ActiveTabGlow activeIndex={activeIndex} />
          <BlurView
            intensity={80}
            tint={isDark ? 'dark' : 'light'}
            style={tabStyles.blurContainer}
          >
            {innerContent}
          </BlurView>
        </View>
      ) : (
        innerContent
      )}
    </View>
  );
}

import { PostBottomSheet, PostBottomSheetRef } from '../../src/components/PostBottomSheet';
import { useRef } from 'react';

// ─── Layout ────────────────────────────────────────────────────

export default function TabsLayout(): React.JSX.Element {
  const bottomSheetRef = useRef<PostBottomSheetRef>(null);

  return (
    <ErrorBoundary>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} onPostPress={() => bottomSheetRef.current?.expand()} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="rides" />
        <Tabs.Screen name="post" />
        <Tabs.Screen name="chats" />
        <Tabs.Screen name="profile" />
      </Tabs>
      <PostBottomSheet ref={bottomSheetRef} />
    </ErrorBoundary>
  );
}

// ─── Styles ────────────────────────────────────────────────────

const tabStyles = StyleSheet.create({
  containerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  floatingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderRadius: 100,
    alignSelf: 'center', // Hugs the constant 310px total width exactly!
  },
  blurContainerWrapper: {
    borderRadius: 100,
    // Soft shadow for the floating effect
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  blurContainer: {
    borderRadius: 100,
    overflow: 'hidden',
  },
  tabPressable: {
    height: 44,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabItemCore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabLabelText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
