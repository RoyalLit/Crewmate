import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../design/theme';
import { brandColors, spacing } from '../design/tokens';
import { Avatar } from './Avatar';
import { StatusChip } from './StatusChip';
import { SeatsBadge } from './SeatsBadge';

interface RideCardProps {
  ride: any; // Using any for now to handle both dummy and real API data shapes flexibly
  onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function RideCard({ ride, onPress }: RideCardProps) {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.96, { duration: 100, easing: Easing.out(Easing.ease) });
    opacity.value = withTiming(0.85, { duration: 150, easing: Easing.out(Easing.ease) });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100, easing: Easing.out(Easing.ease) });
    opacity.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.ease) });
  };

  // Determine shadow style based on mode (from DESIGN.md 9.3)
  const shadowStyle = isDark
    ? { borderWidth: 1, borderColor: '#2E2E4A' }
    : {
        borderWidth: 1,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3, // Android shadow
      };

  return (
    <AnimatedPressable
      style={[
        styles.card,
        { backgroundColor: colors.background.card },
        shadowStyle,
        animatedStyle,
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ride from ${ride.fromCity} to ${ride.toCity} on ${ride.date}`}
    >
      {/* Top Header: Date & Status */}
      <View style={styles.topHeaderRow}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={16} color={colors.text.secondary} />
          <Text style={[styles.dateText, { color: colors.text.secondary }]}>
            {ride.departureDate || ride.date}
          </Text>
        </View>
        <StatusChip status={ride.status as any} />
      </View>

      {/* Route Timeline */}
      <View style={styles.routeContainer}>
        <View style={styles.timeline}>
          <View style={[styles.timelineCircle, { borderColor: brandColors.electricViolet }]} />
          <View style={[styles.timelineLine, { backgroundColor: colors.border.default }]} />
          <View style={[styles.timelineDot, { backgroundColor: brandColors.coralPink }]} />
        </View>

        <View style={styles.routeLocations}>
          <View style={styles.locationRow}>
            <Text style={[styles.timeText, { color: colors.text.primary }]}>
              {ride.departureTime || ride.time}
            </Text>
            <Text style={[styles.cityText, { color: colors.text.primary }]} numberOfLines={1}>
              {ride.fromCity}
            </Text>
          </View>
          
          <View style={[styles.locationRow, { marginTop: 12 }]}>
            <Text style={[styles.timeText, { color: colors.text.primary }]}>
              {/* No arrival time yet, just placeholder dash */}
              --:--
            </Text>
            <Text style={[styles.cityText, { color: colors.text.primary }]} numberOfLines={1}>
              {ride.toCity}
            </Text>
            {/* Hardcoded arrival estimation placeholder like the Stitch design */}
            <Text style={[styles.timeText, { color: colors.text.secondary }]}>
              {/* This will eventually be calculated, e.g., ~5:45 PM */}
              ~ {(ride.departureTime || ride.time || '12:00').replace(/([0-9]+):([0-9]+) (AM|PM)/, (_: any, h: string) => `${parseInt(h) + 1}:45 ${parseInt(h) >= 11 && parseInt(h) !== 12 ? 'PM' : 'AM'}`)}
            </Text>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.border.default }]} />

      {/* Bottom Row: Poster Info & Fare/Seats */}
      <View style={styles.bottomRow}>
        {/* Left: Avatar & Info */}
        <View style={styles.posterInfo}>
          <Avatar
            size="sm"
            name={ride.poster ? `${ride.poster.firstName} ${ride.poster.lastName}` : ride.posterName}
            imageUrl={ride.poster?.profilePicture || ride.posterAvatar}
            isVerified={ride.poster?.isVerified ?? ride.posterIsVerified}
          />
          <View style={styles.posterTextContainer}>
            <Text style={[styles.posterName, { color: colors.text.primary }]} numberOfLines={1}>
              {ride.poster ? `${ride.poster.firstName} ${ride.poster.lastName}` : ride.posterName}
            </Text>
            <Text style={[styles.posterCollege, { color: colors.text.secondary }]} numberOfLines={1}>
              {ride.poster?.college || ride.posterCollege}
            </Text>
          </View>
        </View>

        {/* Right: Fare & Seats */}
        <View style={styles.fareContainer}>
          <Text style={[styles.fareText, { color: colors.text.primary }]}>
            ₹{ride.farePerSeat || ride.fare}
          </Text>
          <SeatsBadge seatsLeft={ride.availableSeats ?? ride.seatsLeft} />
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: spacing.md, // 16px
    marginBottom: 12, // 12px gap between cards
  },
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 14,
    marginLeft: spacing.xs,
  },
  routeContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  timeline: {
    alignItems: 'center',
    width: 24,
    marginRight: spacing.sm,
  },
  timelineCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    backgroundColor: 'transparent',
    marginTop: 4,
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: -2,
    zIndex: 1,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
    zIndex: 2,
  },
  routeLocations: {
    flex: 1,
    justifyContent: 'space-between',
    height: 60, // Keep height consistent for timeline alignment
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cityText: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 16,
    flex: 1,
    paddingRight: 8,
  },
  timeText: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 14,
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: spacing.md,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  posterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  posterTextContainer: {
    marginLeft: spacing.sm,
    flexShrink: 1,
  },
  posterName: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 14,
  },
  posterCollege: {
    fontFamily: 'PlusJakartaSans-400Regular',
    fontSize: 13,
  },
  fareContainer: {
    alignItems: 'flex-end',
  },
  fareText: {
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    fontSize: 18,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
});
