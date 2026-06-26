import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Keyboard, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetTextInput, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../design/theme';
import { spacing, brandColors } from '../design/tokens';
import { useCreateReviewMutation } from '../api/usersHooks';
import { useRideDetailsQuery } from '../api/ridesHooks';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Avatar';
import { Toast } from './Toast';

export interface LeaveReviewSheetRef {
  present: (rideId: string) => void;
  dismiss: () => void;
}

interface LeaveReviewSheetProps {
  onSuccess?: () => void;
}

export const LeaveReviewSheet = React.forwardRef<LeaveReviewSheetRef, LeaveReviewSheetProps>(({ onSuccess }, ref) => {
  const { colors, isDark } = useTheme();
  const bottomSheetRef = React.useRef<BottomSheetModal>(null);
  const { session } = useAuth();
  
  const [rideId, setRideId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  
  const { data: rideData, isLoading: rideLoading } = useRideDetailsQuery(rideId || '');
  const { mutate: createReview, isPending } = useCreateReviewMutation();
  
  const snapPoints = useMemo(() => ['70%', '90%'], []);
  
  React.useImperativeHandle(ref, () => ({
    present: (id: string) => {
      setRideId(id);
      setSelectedUserId(null);
      setRating(0);
      setComment('');
      bottomSheetRef.current?.present();
    },
    dismiss: () => bottomSheetRef.current?.dismiss(),
  }));

  const handleBackdropPress = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={isDark ? 0.6 : 0.4} />
    ),
    [isDark]
  );

  const ride = rideData?.data;
  
  // Get list of eligible users to review
  const eligibleUsers = useMemo(() => {
    if (!ride || !session?.user?.id) return [];
    
    const users = [];
    
    // If the current user is NOT the poster, they can review the poster
    if (ride.posterId !== session.user.id && ride.poster) {
      users.push({ ...ride.poster, _id: ride.posterId, id: ride.posterId, role: 'Driver' });
    }
    
    // Add all accepted passengers (excluding the current user)
    if (ride.passengers && Array.isArray(ride.passengers)) {
      ride.passengers.forEach((p: any) => {
        const passengerId = p.userId?._id || p.userId;
        if (passengerId !== session.user.id) {
          users.push({ ...p.userId, _id: passengerId, id: passengerId, role: 'Co-passenger' });
        }
      });
    }
    
    return users;
  }, [ride, session?.user?.id]);

  const handleSubmit = () => {
    if (!rideId || !selectedUserId || rating === 0) {
      Toast.show({ title: 'Missing info', message: 'Please select a user and leave a rating.', type: 'error' });
      return;
    }
    
    createReview(
      { rideId, userId: selectedUserId, rating, comment },
      {
        onSuccess: () => {
          bottomSheetRef.current?.dismiss();
          onSuccess?.();
          Toast.show({ title: 'Success', message: 'Review submitted', type: 'success' });
        },
        onError: (e: any) => {
          Toast.show({ title: 'Error', message: e.response?.data?.message || 'Failed to submit review', type: 'error' });
        }
      }
    );
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={handleBackdropPress}
      backgroundStyle={{ backgroundColor: colors.background.card }}
      handleIndicatorStyle={{ backgroundColor: colors.border.default }}
      keyboardBehavior="extend"
    >
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text.primary }]}>Leave a Review</Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            How was your ride experience?
          </Text>
        </View>

        {rideLoading ? (
          <Text style={{ color: colors.text.secondary, textAlign: 'center', marginTop: 20 }}>Loading ride details...</Text>
        ) : eligibleUsers.length === 0 ? (
          <Text style={{ color: colors.text.secondary, textAlign: 'center', marginTop: 20 }}>No one to review on this ride.</Text>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            
            <Text style={[styles.sectionLabel, { color: colors.text.primary }]}>Select someone to review</Text>
            <View style={styles.usersList}>
              {eligibleUsers.map((user) => {
                const isSelected = selectedUserId === user.id;
                return (
                  <Pressable
                    key={user.id}
                    onPress={() => setSelectedUserId(user.id)}
                    style={[
                      styles.userCard, 
                      { borderColor: isSelected ? brandColors.electricViolet : colors.border.default, backgroundColor: isSelected ? (isDark ? `${brandColors.electricViolet}15` : `${brandColors.electricViolet}08`) : 'transparent' }
                    ]}
                  >
                    <Avatar imageUrl={user.profilePhotoUrl} name={user.name} size="md" />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.userName, { color: colors.text.primary }]}>{user.name}</Text>
                      <Text style={[styles.userRole, { color: colors.text.secondary }]}>{user.role}</Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={24} color={brandColors.electricViolet} />
                    )}
                  </Pressable>
                );
              })}
            </View>

            {selectedUserId && (
              <View style={styles.reviewSection}>
                <Text style={[styles.sectionLabel, { color: colors.text.primary, marginTop: 20 }]}>Rating</Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Pressable key={star} onPress={() => setRating(star)} style={styles.starBtn}>
                      <Ionicons 
                        name={rating >= star ? "star" : "star-outline"} 
                        size={40} 
                        color={rating >= star ? '#F59E0B' : colors.border.default} 
                      />
                    </Pressable>
                  ))}
                </View>

                <Text style={[styles.sectionLabel, { color: colors.text.primary, marginTop: 20 }]}>Comment (Optional)</Text>
                <BottomSheetTextInput
                  style={[styles.textInput, { color: colors.text.primary, borderColor: colors.border.default, backgroundColor: colors.background.subtle }]}
                  placeholder="How was the journey? Was the passenger on time?"
                  placeholderTextColor={colors.text.placeholder}
                  multiline
                  numberOfLines={4}
                  value={comment}
                  onChangeText={setComment}
                  textAlignVertical="top"
                />

                <Pressable 
                  style={[styles.submitButton, { backgroundColor: brandColors.electricViolet, opacity: isPending || rating === 0 ? 0.7 : 1 }]}
                  onPress={handleSubmit}
                  disabled={isPending || rating === 0}
                >
                  <Text style={styles.submitButtonText}>{isPending ? 'Submitting...' : 'Submit Review'}</Text>
                </Pressable>
              </View>
            )}
            
            <View style={{ height: 100 }} /> 
          </ScrollView>
        )}
      </View>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-500Medium',
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  sectionLabel: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-700Bold',
    marginBottom: 12,
  },
  usersList: {
    gap: 12,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 2,
    borderRadius: 16,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-700Bold',
  },
  userRole: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans-500Medium',
  },
  reviewSection: {
    marginTop: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  starBtn: {
    padding: 5,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    paddingTop: 16,
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-500Medium',
    minHeight: 120,
  },
  submitButton: {
    marginTop: 24,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-700Bold',
  }
});
