import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../src/design/theme';
import { TAB_BAR_HEIGHT, spacing } from '../../src/design/tokens';
import { TicketRideCard } from '../../src/components/TicketRideCard';

const { width } = Dimensions.get('window');

// Dummy data
const ACTIVE_RIDES = [
  { id: '1', status: 'active' as const, date: 'Today', time: '5:30 PM', from: 'Campus', to: 'Downtown', price: '$4.50', driver: 'Alex R.' },
];

const PAST_RIDES = [
  { id: '2', status: 'completed' as const, date: 'Yesterday', time: '9:00 AM', from: 'Downtown', to: 'Campus', price: '$4.50', driver: 'Sarah J.' },
  { id: '3', status: 'cancelled' as const, date: 'Mon, Oct 12', time: '1:15 PM', from: 'Campus', to: 'Airport', price: '$12.00', driver: 'Mike T.' },
];

export default function RidesScreen(): React.JSX.Element {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  // Shared value for the sliding pill
  const translateX = useSharedValue(0);

  const handleTabPress = (tab: 'active' | 'history') => {
    setActiveTab(tab);
    // The segmented control has padding 4px on each side.
    // Total width is window.width - 2*spacing.lg.
    // Each button is roughly half of (Total width - 8px).
    const segmentWidth = (width - spacing.lg * 2 - 8) / 2;
    translateX.value = withSpring(tab === 'active' ? 0 : segmentWidth, {
      mass: 0.8,
      damping: 15,
      stiffness: 150,
    });
  };

  const animatedPillStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const displayRides = activeTab === 'active' ? ACTIVE_RIDES : PAST_RIDES;

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Header and Segmented Control */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, spacing.xl) }]}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>My Rides</Text>
        
        <View style={[styles.segmentedControlContainer, { backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.05)' }]}>
          <Animated.View 
            style={[
              styles.activePill, 
              animatedPillStyle, 
              { 
                backgroundColor: isDark ? colors.background.subtle : colors.background.card, 
                shadowOpacity: isDark ? 0 : 0.08,
                borderWidth: isDark ? 1 : 0,
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'transparent'
              }
            ]} 
          />
          
          <Pressable style={styles.segmentButton} onPress={() => handleTabPress('active')}>
            <Text style={[styles.segmentText, { color: activeTab === 'active' ? colors.text.primary : colors.text.placeholder }]}>Active</Text>
          </Pressable>
          
          <Pressable style={styles.segmentButton} onPress={() => handleTabPress('history')}>
            <Text style={[styles.segmentText, { color: activeTab === 'history' ? colors.text.primary : colors.text.placeholder }]}>History</Text>
          </Pressable>
        </View>
      </View>

      {/* Ride Cards List */}
      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.lg,
          paddingBottom: TAB_BAR_HEIGHT + spacing['2xl'],
          paddingHorizontal: spacing.lg,
          gap: spacing.md,
        }}
        showsVerticalScrollIndicator={false}
      >
        {displayRides.map((ride) => (
          <TicketRideCard key={ride.id} {...ride} />
        ))}

        {displayRides.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>No rides found.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    fontSize: 28,
    marginBottom: spacing.lg,
  },
  segmentedControlContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    width: (width - spacing.lg * 2 - 8) / 2,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1, // Ensure text is above the pill
  },
  segmentText: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 15,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 16,
  },
});
