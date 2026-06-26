import { Toast } from '../../src/components/Toast';
import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Alert } from '../../src/components/GlobalAlert';

import { useTheme } from '../../src/design/theme';
import { TAB_BAR_HEIGHT, spacing } from '../../src/design/tokens';
import { TicketRideCard } from '../../src/components/TicketRideCard';
import { IncomingRequestItem } from '../../src/components/IncomingRequestItem';
import { EmptyState } from '../../src/components/EmptyState';
import { useMyRidesQuery, useCancelRideMutation } from '../../src/api/ridesHooks';
import { useMyRequestsQuery, useIncomingRequestsQuery } from '../../src/api/requestsHooks';
import { getDerivedRideStatus } from '../../src/utils/rideUtils';

const { width } = Dimensions.get('window');

export default function RidesScreen(): React.JSX.Element {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'riding' | 'driving' | 'history'>('riding');
  const [isPulling, setIsPulling] = useState(false);

  const { data, isLoading, isError, error: myRidesError, refetch: refetchMyRides } = useMyRidesQuery();
  const { data: myReqData, isLoading: reqLoading, error: myReqError, refetch: refetchMyReqs } = useMyRequestsQuery();
  const { data: incomingData, error: incomingError, refetch: refetchIncoming } = useIncomingRequestsQuery();

  const cancelMutation = useCancelRideMutation();

  const translateX = useSharedValue(0);

  const handleTabPress = useCallback((tab: 'riding' | 'driving' | 'history') => {
    setActiveTab(tab);
    const segmentWidth = (width - spacing.lg * 2 - 8) / 3;
    const index = tab === 'riding' ? 0 : tab === 'driving' ? 1 : 2;
    translateX.value = withSpring(index * segmentWidth, {
      mass: 0.8,
      damping: 15,
      stiffness: 150,
    });
  }, [translateX]);

  const animatedPillStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const allRides = Array.isArray(data?.data?.data) ? data.data.data : (Array.isArray(data?.data) ? data.data : []);
  const myRequests = Array.isArray(myReqData?.data?.data) ? myReqData.data.data : (Array.isArray(myReqData?.data) ? myReqData.data : []);
  const incomingRequests = Array.isArray(incomingData?.data) ? incomingData.data : [];

  const requestedRides = myRequests.map((req: any) => {
    return {
      ...(req.ride || {}),
      _requestStatus: req.status,
      _requestId: req.id,
      status: req.ride?.status || 'active'
    };
  });

  const isRidePast = (r: any) => {
    const derivedStatus = getDerivedRideStatus(r);
    if (derivedStatus !== 'active') return true;
    if (r._requestStatus === 'rejected' || r._requestStatus === 'withdrawn') return true;
    return false;
  };

  const drivingRides = allRides.filter((r: any) => getDerivedRideStatus(r) === 'active');

  const ridingRides = requestedRides.filter((r: any) => 
    getDerivedRideStatus(r) === 'active' && 
    r._requestStatus !== 'rejected' && 
    r._requestStatus !== 'withdrawn'
  );

  const combinedRides = [...allRides, ...requestedRides];
  const uniqueRides = Array.from(new Map(combinedRides.map(r => [r._id || r.id, r])).values());

  const pastRides = uniqueRides.filter((r: any) => isRidePast(r));

  const displayRides = activeTab === 'riding' ? ridingRides : activeTab === 'driving' ? drivingRides : pastRides;
  const isScreenLoading = isLoading || reqLoading;

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
              Toast.show({ title: 'Error', message: e.response?.data?.error?.message || 'Failed to cancel ride', type: 'error' });
            }
          }
        }
      ]
    );
  };

  const handlePressRide = (rideId: string) => {
    if (rideId) {
      router.push(`/ride/${rideId}`);
    }
  };

  const renderRideItem = useCallback(({ item: ride }: { item: any }) => {
    const rideId = ride.id || ride._id;
    const pendingRequests = incomingRequests.filter((req: any) => 
      (req.rideId === rideId || req.ride === rideId) && req.status === 'pending'
    );

    return (
      <View style={styles.rideItemWrapper}>
        <Pressable 
          onPress={() => handlePressRide(rideId)}
          onLongPress={() => getDerivedRideStatus(ride) === 'active' && !ride._requestStatus ? handleCancelRide(rideId) : null}
          delayLongPress={500}
        >
          <TicketRideCard ride={ride} requestStatus={ride._requestStatus} />
          {getDerivedRideStatus(ride) === 'active' && !ride._requestStatus && (
            <Text style={[styles.cancelText, { color: colors.text.secondary }]}>
              Long press to cancel
            </Text>
          )}
        </Pressable>

        {pendingRequests.map((req: any) => (
          <View key={req.id} style={styles.incomingRequestWrapper}>
            <IncomingRequestItem request={req} />
          </View>
        ))}
      </View>
    );
  }, [incomingRequests, colors.text.secondary]);

  if (isScreenLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, spacing.xl) }]}>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>My Rides</Text>
          <SegmentedControl {...{ activeTab, handleTabPress, animatedPillStyle, colors, isDark }} />
        </View>
        <ActivityIndicator size="large" color={colors.interactive.primary} style={{ marginTop: 40 }} />
      </View>
    );
  }

  if (!isScreenLoading && (isError || myReqError || incomingError)) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, spacing.xl) }]}>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>My Rides</Text>
          <SegmentedControl {...{ activeTab, handleTabPress, animatedPillStyle, colors, isDark }} />
        </View>
        <Text style={{ textAlign: 'center', marginTop: 40, color: colors.text.secondary, paddingHorizontal: 20 }}>
          Failed to load rides.
          {myRidesError ? `\nMy Rides Error: ${(myRidesError as any).message}` : ''}
          {myReqError ? `\nRequests Error: ${(myReqError as any).message}` : ''}
          {incomingError ? `\nIncoming Error: ${(incomingError as any).message}` : ''}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <FlatList
        data={displayRides}
        keyExtractor={(item: any) => item._id || item.id}
        renderItem={renderRideItem}
        ListEmptyComponent={<EmptyState icon="calendar-outline" title="No rides found" subtitle="Your rides and requests will appear here" />}
        ListHeaderComponent={
          <View style={[styles.headerContainer, { paddingTop: spacing.xl, paddingHorizontal: 0 }]}>
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>My Rides</Text>
            <SegmentedControl {...{ activeTab, handleTabPress, animatedPillStyle, colors, isDark }} />
          </View>
        }
        contentContainerStyle={{
          paddingBottom: TAB_BAR_HEIGHT + spacing['2xl'],
          paddingHorizontal: spacing.lg,
          flexGrow: 1,
        }}
        contentInset={{ top: insets.top }}
        contentOffset={{ x: 0, y: -insets.top }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
             refreshing={isPulling} 
             onRefresh={handleRefresh} 
             tintColor={colors.interactive.primary} 
             colors={[colors.interactive.primary]}
             progressViewOffset={insets.top}
          />
        }
      />
    </View>
  );
}

function SegmentedControl({ activeTab, handleTabPress, animatedPillStyle, colors, isDark }: {
  activeTab: string;
  handleTabPress: (tab: 'riding' | 'driving' | 'history') => void;
  animatedPillStyle: any;
  colors: any;
  isDark: boolean;
}) {
  return (
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

      <Pressable style={styles.segmentButton} onPress={() => handleTabPress('riding')} accessible accessibilityRole="button" accessibilityLabel="Riding tab">
        <Text style={[styles.segmentText, { color: activeTab === 'riding' ? colors.text.primary : colors.text.placeholder }]}>Riding</Text>
      </Pressable>

      <Pressable style={styles.segmentButton} onPress={() => handleTabPress('driving')} accessible accessibilityRole="button" accessibilityLabel="Driving tab">
        <Text style={[styles.segmentText, { color: activeTab === 'driving' ? colors.text.primary : colors.text.placeholder }]}>Driving</Text>
      </Pressable>

      <Pressable style={styles.segmentButton} onPress={() => handleTabPress('history')} accessible accessibilityRole="button" accessibilityLabel="History tab">
        <Text style={[styles.segmentText, { color: activeTab === 'history' ? colors.text.primary : colors.text.placeholder }]}>History</Text>
      </Pressable>
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
  rideItemWrapper: {
    marginBottom: spacing.md,
  },
  cancelText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: -4,
    marginBottom: 8,
  },
  incomingRequestWrapper: {
    marginBottom: spacing.md,
  },

});
