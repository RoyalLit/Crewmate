import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Dimensions, ActivityIndicator, Alert } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../src/design/theme';
import { TAB_BAR_HEIGHT, spacing } from '../../src/design/tokens';
import { TicketRideCard } from '../../src/components/TicketRideCard';
import { useMyRidesQuery, useCancelRideMutation } from '../../src/api/ridesHooks';

const { width } = Dimensions.get('window');

export default function RidesScreen(): React.JSX.Element {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  const { data, isLoading, isError } = useMyRidesQuery();
  const cancelMutation = useCancelRideMutation();

  // Shared value for the sliding pill
  const translateX = useSharedValue(0);

  const handleTabPress = (tab: 'active' | 'history') => {
    setActiveTab(tab);
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

  const allRides = data?.data?.rides || [];
  
  // Active rides are those not cancelled and date is in future/today
  const activeRides = allRides.filter((r: any) => r.status === 'active');
  const pastRides = allRides.filter((r: any) => r.status === 'cancelled' || r.status === 'expired');

  const displayRides = activeTab === 'active' ? activeRides : pastRides;

  const handleCancelRide = (rideId: string) => {
    Alert.alert(
      "Cancel Ride",
      "Are you sure you want to cancel this ride? This action cannot be undone.",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          style: "destructive",
          onPress: async () => {
            try {
              await cancelMutation.mutateAsync(rideId);
            } catch (e: any) {
              Alert.alert('Error', e.response?.data?.error?.message || 'Failed to cancel ride');
            }
          }
        }
      ]
    );
  };

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
        {isLoading && <ActivityIndicator size="large" color={colors.interactive.primary} style={{ marginTop: 40 }} />}
        
        {!isLoading && isError && (
          <Text style={{ textAlign: 'center', marginTop: 40, color: colors.text.secondary }}>Failed to load rides.</Text>
        )}

        {!isLoading && !isError && displayRides.map((ride: any) => (
          <Pressable 
            key={ride.id || ride._id}
            onLongPress={() => ride.status === 'active' ? handleCancelRide(ride.id || ride._id) : null}
            delayLongPress={500}
          >
            <TicketRideCard ride={ride} />
            {ride.status === 'active' && (
              <Text style={{ textAlign: 'center', fontSize: 12, color: colors.text.secondary, marginTop: -4, marginBottom: 8 }}>
                Long press to cancel
              </Text>
            )}
          </Pressable>
        ))}

        {!isLoading && !isError && displayRides.length === 0 && (
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
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    fontSize: 28,
    marginBottom: spacing.lg,
  },
  segmentedControlContainer: {
    flexDirection: 'row',
    height: 44,
    borderRadius: 22,
    padding: 4,
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    top: 4,
    left: 4,
    height: 36,
    width: (width - spacing.lg * 2 - 8) / 2,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  segmentButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  segmentText: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 15,
  },
  emptyState: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 16,
  },
});
