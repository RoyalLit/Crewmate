import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Dimensions, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useTheme } from '../../src/design/theme';
import { TAB_BAR_HEIGHT, spacing } from '../../src/design/tokens';
import { TicketRideCard } from '../../src/components/TicketRideCard';
import { IncomingRequestItem } from '../../src/components/IncomingRequestItem';
import { useMyRidesQuery, useCancelRideMutation } from '../../src/api/ridesHooks';
import { useMyRequestsQuery, useIncomingRequestsQuery } from '../../src/api/requestsHooks';

const { width } = Dimensions.get('window');

export default function RidesScreen(): React.JSX.Element {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'riding' | 'driving' | 'history'>('riding');
  const [isPulling, setIsPulling] = useState(false);

  const { data, isLoading, isError, error: myRidesError, refetch: refetchMyRides, isRefetching: isRefetchingRides } = useMyRidesQuery();
  const { data: myReqData, isLoading: reqLoading, error: myReqError, refetch: refetchMyReqs, isRefetching: isRefetchingReqs } = useMyRequestsQuery();
  const { data: incomingData, error: incomingError, refetch: refetchIncoming, isRefetching: isRefetchingIncoming } = useIncomingRequestsQuery();

  const cancelMutation = useCancelRideMutation();

  const translateX = useSharedValue(0);

  const handleTabPress = (tab: 'riding' | 'driving' | 'history') => {
    setActiveTab(tab);
    const segmentWidth = (width - spacing.lg * 2 - 8) / 3;
    const index = tab === 'riding' ? 0 : tab === 'driving' ? 1 : 2;
    translateX.value = withSpring(index * segmentWidth, {
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

  const allRides = Array.isArray(data?.data) ? data.data : [];
  const myRequests = Array.isArray(myReqData?.data) ? myReqData.data : [];
  const incomingRequests = Array.isArray(incomingData?.data) ? incomingData.data : [];
  
  // Format requested rides to look like normal rides but with a requestStatus
  const requestedRides = myRequests.map((req: any) => {
    // req.ride might be fully populated or just an object
    return {
      ...(req.ride || {}),
      _requestStatus: req.status,
      _requestId: req.id,
      // Fallbacks in case populate fails slightly or shape differs
      status: req.ride?.status || 'active'
    };
  });

  const drivingRides = allRides.filter((r: any) => r.status === 'active');
  
  const ridingRides = requestedRides.filter((r: any) => 
    r.status === 'active' && 
    r._requestStatus !== 'rejected' && 
    r._requestStatus !== 'withdrawn'
  );
  
  const combinedRides = [...allRides, ...requestedRides];
  const uniqueRides = Array.from(new Map(combinedRides.map(r => [r._id || r.id, r])).values());
  
  const pastRides = uniqueRides.filter((r: any) => 
    r.status === 'cancelled' || 
    r.status === 'completed' || 
    r.status === 'expired' || 
    r._requestStatus === 'rejected' ||
    r._requestStatus === 'withdrawn'
  );

  const displayRides = activeTab === 'riding' ? ridingRides : activeTab === 'driving' ? drivingRides : pastRides;
  const isScreenLoading = isLoading || reqLoading;
  const isRefetching = isRefetchingRides || isRefetchingReqs || isRefetchingIncoming;

  const handleRefresh = async () => {
    setIsPulling(true);
    await Promise.all([
      refetchMyRides(),
      refetchMyReqs(),
      refetchIncoming()
    ]);
    setIsPulling(false);
  };

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

  const handlePressRide = (rideId: string) => {
    if (rideId) {
      // @ts-ignore
      router.push(`/ride/${rideId}`);
    }
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
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'transparent',
                width: (width - spacing.lg * 2 - 8) / 3
              }
            ]} 
          />
          
          <Pressable style={styles.segmentButton} onPress={() => handleTabPress('riding')}>
            <Text style={[styles.segmentText, { color: activeTab === 'riding' ? colors.text.primary : colors.text.placeholder }]}>Riding</Text>
          </Pressable>

          <Pressable style={styles.segmentButton} onPress={() => handleTabPress('driving')}>
            <Text style={[styles.segmentText, { color: activeTab === 'driving' ? colors.text.primary : colors.text.placeholder }]}>Driving</Text>
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
        refreshControl={
          <RefreshControl 
             refreshing={isPulling} 
             onRefresh={handleRefresh} 
             tintColor={colors.interactive.primary} 
          />
        }
      >
        {isScreenLoading && <ActivityIndicator size="large" color={colors.interactive.primary} style={{ marginTop: 40 }} />}
        
        {!isScreenLoading && (isError || myReqError || incomingError) && (
          <Text style={{ textAlign: 'center', marginTop: 40, color: colors.text.secondary, paddingHorizontal: 20 }}>
            Failed to load rides.
            {myRidesError ? `\nMy Rides Error: ${(myRidesError as any).message}` : ''}
            {myReqError ? `\nRequests Error: ${(myReqError as any).message}` : ''}
            {incomingError ? `\nIncoming Error: ${(incomingError as any).message}` : ''}
          </Text>
        )}

        {!isScreenLoading && !isError && !myReqError && !incomingError && displayRides.map((ride: any) => {
          const rideId = ride.id || ride._id;
          // Find pending incoming requests for this ride if I am the poster
          const pendingRequests = incomingRequests.filter((req: any) => 
            (req.rideId === rideId || req.ride === rideId) && req.status === 'pending'
          );

          return (
            <View key={rideId} style={{ marginBottom: pendingRequests.length > 0 ? spacing.md : 0 }}>
              <Pressable 
                onPress={() => handlePressRide(rideId)}
                onLongPress={() => ride.status === 'active' && !ride._requestStatus ? handleCancelRide(rideId) : null}
                delayLongPress={500}
              >
                <TicketRideCard ride={ride} requestStatus={ride._requestStatus} />
                {ride.status === 'active' && !ride._requestStatus && (
                  <Text style={{ textAlign: 'center', fontSize: 12, color: colors.text.secondary, marginTop: -4, marginBottom: 8 }}>
                    Long press to cancel
                  </Text>
                )}
              </Pressable>

              {/* Render Incoming Requests inline under the ride card */}
              {pendingRequests.map((req: any) => (
                <IncomingRequestItem key={req.id} request={req} />
              ))}
            </View>
          );
        })}

        {!isScreenLoading && !isError && displayRides.length === 0 && (
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
    width: (width - spacing.lg * 2 - 8) / 3,
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
