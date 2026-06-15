import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../src/design/theme';
import { brandColors, spacing } from '../../src/design/tokens';
import { useAuthStore } from '../../src/store/authStore';
import { Avatar } from '../../src/components/Avatar';
import { SeatsBadge } from '../../src/components/SeatsBadge';
import { StatusChip } from '../../src/components/StatusChip';

import { useRideDetailsQuery, useCancelRideMutation } from '../../src/api/ridesHooks';
import { useCreateRequestMutation, useWithdrawRequestMutation, useMyRequestsQuery } from '../../src/api/requestsHooks';

export default function RideDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const currentUser = useAuthStore((state) => state.user);

  const { data: rideData, isLoading, isError } = useRideDetailsQuery(id as string);
  const { data: myRequestsData } = useMyRequestsQuery();
  
  const createRequestMutation = useCreateRequestMutation();
  const withdrawRequestMutation = useWithdrawRequestMutation();
  const cancelRideMutation = useCancelRideMutation();

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.interactive.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !rideData?.data) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </Pressable>
        </View>
        <View style={styles.center}>
          <Text style={{ color: colors.text.secondary }}>Ride not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const ride = rideData.data;
  const isPoster = ride.poster?._id === currentUser?.id || ride.poster === currentUser?.id;
  
  // Find if current user has a pending or accepted request for this ride
  const myRequests = Array.isArray(myRequestsData?.data) ? myRequestsData.data : [];
  const existingRequest = myRequests.find((req: any) => 
    (req.rideId === ride.id || req.ride === ride.id) && 
    (req.status === 'pending' || req.status === 'accepted')
  );

  const handleRequestSeat = async () => {
    try {
      await createRequestMutation.mutateAsync({ rideId: ride.id });
      Alert.alert('Success', 'Your request has been sent to the poster.');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error?.message || 'Failed to request seat');
    }
  };

  const handleWithdrawRequest = () => {
    if (!existingRequest) return;
    Alert.alert('Withdraw Request', 'Are you sure you want to withdraw your request?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Withdraw', 
        style: 'destructive',
        onPress: async () => {
          try {
            await withdrawRequestMutation.mutateAsync(existingRequest._id || existingRequest.id);
          } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error?.message || 'Failed to withdraw');
          }
        }
      }
    ]);
  };

  const handleCancelRide = () => {
    Alert.alert('Cancel Ride', 'Are you sure you want to cancel this ride? This action cannot be undone.', [
      { text: 'No, keep it', style: 'cancel' },
      {
        text: 'Yes, cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelRideMutation.mutateAsync(ride.id);
            Alert.alert('Ride Canceled', 'Your ride has been canceled.');
            router.back();
          } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error?.message || 'Failed to cancel ride');
          }
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Ride Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Route Card */}
        <View style={[styles.card, { backgroundColor: colors.background.card, borderColor: isThemeDark(colors) ? '#2E2E4A' : 'transparent' }]}>
          <View style={styles.topHeaderRow}>
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={16} color={colors.text.secondary} />
              <Text style={[styles.dateText, { color: colors.text.secondary }]}>{ride.departureDate}</Text>
            </View>
            <StatusChip status={ride.status} />
          </View>

          <View style={styles.routeContainer}>
            <View style={styles.timeline}>
              <View style={[styles.timelineCircle, { borderColor: brandColors.electricViolet }]} />
              <View style={[styles.timelineLine, { backgroundColor: colors.border.default }]} />
              <View style={[styles.timelineDot, { backgroundColor: brandColors.coralPink }]} />
            </View>

            <View style={styles.routeLocations}>
              <View style={styles.locationRow}>
                <Text style={[styles.timeText, { color: colors.text.primary }]}>{ride.departureTime}</Text>
                <Text style={[styles.cityText, { color: colors.text.primary }]} numberOfLines={2}>{ride.fromCity}</Text>
              </View>
              
              <View style={[styles.locationRow, { marginTop: spacing.md }]}>
                <Text style={[styles.timeText, { color: colors.text.primary }]}>--:--</Text>
                <Text style={[styles.cityText, { color: colors.text.primary }]} numberOfLines={2}>{ride.toCity}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border.default }]} />

          <View style={styles.infoGrid}>
            <View style={styles.infoBlock}>
              <Text style={[styles.infoLabel, { color: colors.text.secondary }]}>Cab Type</Text>
              <Text style={[styles.infoValue, { color: colors.text.primary }]}>{ride.cabType || 'Any'}</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={[styles.infoLabel, { color: colors.text.secondary }]}>Seats Left</Text>
              <SeatsBadge seatsLeft={ride.availableSeats} />
            </View>
            <View style={[styles.infoBlock, { alignItems: 'flex-end' }]}>
              <Text style={[styles.infoLabel, { color: colors.text.secondary }]}>Total Fare / Seat</Text>
              <Text style={[styles.fareValue, { color: colors.text.primary }]}>₹{ride.farePerSeat}</Text>
            </View>
          </View>
        </View>

        {/* Poster Card */}
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Posted by</Text>
        <View style={[styles.posterCard, { backgroundColor: colors.background.subtle }]}>
          <Avatar 
            name={ride.poster.name} 
            imageUrl={ride.poster.profilePhotoUrl} 
            isVerified={ride.poster.isVerified || ride.poster.isEmailVerified}
            size="lg"
          />
          <View style={styles.posterDetails}>
            <Text style={[styles.posterName, { color: colors.text.primary }]}>
              {ride.poster.name} {isPoster && '(You)'}
            </Text>
            <Text style={[styles.posterCollege, { color: colors.text.secondary }]}>
              {ride.poster.college}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom CTA */}
      {ride.status === 'active' && (
        <View style={[styles.bottomCta, { backgroundColor: colors.background.primary, borderTopColor: colors.border.default }]}>
          {isPoster ? (
            <Pressable 
              style={[styles.btn, styles.btnDestructive]}
              onPress={handleCancelRide}
              disabled={cancelRideMutation.isPending}
            >
              {cancelRideMutation.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.btnTextWhite}>Cancel Ride</Text>
              )}
            </Pressable>
          ) : existingRequest ? (
            existingRequest.status === 'accepted' ? (
              <View style={[styles.btn, { backgroundColor: brandColors.mintGreen }]}>
                <Ionicons name="checkmark-circle" size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.btnTextWhite}>Seat Confirmed</Text>
              </View>
            ) : (
              <Pressable 
                style={[styles.btn, { backgroundColor: colors.background.subtle, borderWidth: 1, borderColor: colors.border.default }]}
                onPress={handleWithdrawRequest}
                disabled={withdrawRequestMutation.isPending}
              >
                {withdrawRequestMutation.isPending ? (
                  <ActivityIndicator color={colors.text.primary} />
                ) : (
                  <Text style={[styles.btnText, { color: colors.text.primary }]}>Withdraw Request</Text>
                )}
              </Pressable>
            )
          ) : ride.availableSeats > 0 ? (
            <Pressable 
              style={[styles.btn, { backgroundColor: colors.interactive.primary }]}
              onPress={handleRequestSeat}
              disabled={createRequestMutation.isPending}
            >
              {createRequestMutation.isPending ? (
                <ActivityIndicator color={colors.interactive.primaryText} />
              ) : (
                <Text style={[styles.btnText, { color: colors.interactive.primaryText }]}>Request Seat</Text>
              )}
            </Pressable>
          ) : (
            <View style={[styles.btn, { backgroundColor: colors.background.subtle, opacity: 0.7 }]}>
              <Text style={[styles.btnText, { color: colors.text.secondary }]}>Ride Full</Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

function isThemeDark(colors: any) {
  return colors.background.primary === '#0D0D1C';
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginLeft: -8,
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 18,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 100, // Space for bottom CTA
  },
  card: {
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    // Add shadow for light mode
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
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
    marginLeft: 6,
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
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timeText: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 15,
    width: 55,
  },
  cityText: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 18,
    flex: 1,
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: spacing.md,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  infoBlock: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 14,
  },
  fareValue: {
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    fontSize: 22,
    letterSpacing: -0.5,
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 18,
    marginBottom: spacing.sm,
  },
  posterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 16,
  },
  posterDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  posterName: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 16,
    marginBottom: 2,
  },
  posterCollege: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 14,
  },
  bottomCta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: 34, // Safe area approx
    borderTopWidth: 1,
  },
  btn: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDestructive: {
    backgroundColor: brandColors.coralPink,
  },
  btnText: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 16,
  },
  btnTextWhite: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 16,
    color: '#FFF',
  },
});
