import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../design/theme';
import { brandColors, spacing } from '../design/tokens';
import { Avatar } from './Avatar';

import { useAcceptRequestMutation, useRejectRequestMutation } from '../api/requestsHooks';

interface IncomingRequestItemProps {
  request: any;
}

export function IncomingRequestItem({ request }: IncomingRequestItemProps) {
  const { colors, isDark } = useTheme();
  
  const acceptMutation = useAcceptRequestMutation();
  const rejectMutation = useRejectRequestMutation();

  const handleAccept = () => {
    acceptMutation.mutate(request.id, {
      onError: (error: any) => {
        Alert.alert('Error', error.response?.data?.error?.message || 'Failed to accept request');
      }
    });
  };

  const handleReject = () => {
    rejectMutation.mutate(request.id, {
      onError: (error: any) => {
        Alert.alert('Error', error.response?.data?.error?.message || 'Failed to reject request');
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
          >
            {acceptMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={[styles.btnText, { color: '#FFF' }]}>Accept</Text>
            )}
          </Pressable>
        </View>
      )}

      {request.status === 'accepted' && (
        <View style={[styles.actions, { justifyContent: 'center', backgroundColor: brandColors.mintGreen, paddingVertical: 8, borderRadius: 8 }]}>
          <Text style={[styles.btnText, { color: '#FFF' }]}>Seat Confirmed ✓</Text>
        </View>
      )}
    </View>
  );
}

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
