import { Toast } from './Toast';
import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../design/theme';
import { brandColors, spacing } from '../design/tokens';
import { Avatar } from './Avatar';


import { useAcceptRequestMutation, useRejectRequestMutation } from '../api/requestsHooks';

interface IncomingRequestItemProps {
  request: any;
  isRidePast?: boolean;
}

export const IncomingRequestItem = React.memo(function IncomingRequestItem({ request, isRidePast }: IncomingRequestItemProps) {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  
  const acceptMutation = useAcceptRequestMutation();
  const rejectMutation = useRejectRequestMutation();

  const handleAccept = () => {
    acceptMutation.mutate(request.id, {
      onError: (error: any) => {
        Toast.show({ title: 'Error', message: error.response?.data?.error?.message || 'Failed to accept request', type: 'error' });
      }
    });
  };

  const handleReject = () => {
    rejectMutation.mutate(request.id, {
      onError: (error: any) => {
        Toast.show({ title: 'Error', message: error.response?.data?.error?.message || 'Failed to reject request', type: 'error' });
      }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.background.subtle, borderColor: colors.border.default }]}>
      <View style={styles.header}>
        <Avatar 
          name={request.requester.name} 
          imageUrl={request.requester.profilePhotoUrl}
          isVerified={request.requester.isVerified || request.requester.isEmailVerified}
          size="md"
        />
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text.primary }]}>
            {request.requester.name}
          </Text>
          <Text style={[styles.college, { color: colors.text.secondary }]}>
            {request.requester.college}
          </Text>
        </View>
      </View>
      
      {request.status === 'pending' && (
        <View style={styles.actions}>
          <Pressable 
            style={[styles.btn, styles.btnReject, { borderColor: colors.border.default }]} 
            onPress={handleReject}
            disabled={rejectMutation.isPending || acceptMutation.isPending}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`Decline request from ${request.requester.name}`}
          >
            {rejectMutation.isPending ? (
              <ActivityIndicator size="small" color={colors.text.primary} />
            ) : (
              <Text style={[styles.btnText, { color: colors.text.primary }]}>Decline</Text>
            )}
          </Pressable>
          
          <Pressable 
            style={[styles.btn, styles.btnAccept]} 
            onPress={handleAccept}
            disabled={rejectMutation.isPending || acceptMutation.isPending}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`Accept request from ${request.requester.name}`}
          >
            {acceptMutation.isPending ? (
              <ActivityIndicator size="small" color={colors.background.card} />
            ) : (
              <Text style={[styles.btnText, { color: colors.background.card }]}>Accept</Text>
            )}
          </Pressable>
        </View>
      )}

      {request.status === 'accepted' && (
        <View style={styles.actions}>
          {!isRidePast && (
            <Pressable 
              style={[styles.btn, { backgroundColor: brandColors.mintGreen, flexDirection: 'row' }]}
              onPress={() => {
                const rId = request.rideId?._id || request.rideId?.id || request.rideId || request.ride?._id || request.ride?.id;
                const rInfo = request.rideId?.fromCity ? `${request.rideId.fromCity} to ${request.rideId.toCity}` : '';
                router.push(`/chat/${rId}/${request.requester.id || request.requester._id}?name=${encodeURIComponent(request.requester.name)}&rideInfo=${encodeURIComponent(rInfo)}`);
              }}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Send message to ${request.requester.name}`}
            >
              <Ionicons name="chatbubbles" size={16} color={colors.background.card} style={{ marginRight: 6 }} />
              <Text style={[styles.btnText, { color: colors.background.card }]}>Message</Text>
            </Pressable>
          )}

          {isRidePast && (
            <Pressable 
              style={[styles.btn, { backgroundColor: colors.interactive.primary, flexDirection: 'row' }]}
              onPress={() => {
                const rId = request.rideId?._id || request.rideId?.id || request.rideId || request.ride?._id || request.ride?.id;
                router.push(`/review/${request.requester.id || request.requester._id}?rideId=${rId}`);
              }}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Review ${request.requester.name}`}
            >
              <Ionicons name="star" size={16} color={colors.interactive.primaryText} style={{ marginRight: 6 }} />
              <Text style={[styles.btnText, { color: colors.interactive.primaryText }]}>Leave a Review</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    marginHorizontal: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  info: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  name: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 15,
  },
  college: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 44,
  },
  btnReject: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  btnAccept: {
    backgroundColor: brandColors.electricViolet,
  },
  btnText: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 14,
  },
});
