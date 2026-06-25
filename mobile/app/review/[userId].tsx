import { Toast } from '../../src/components/Toast';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/design/theme';
import { spacing } from '../../src/design/tokens';
import { useCreateReviewMutation } from '../../src/api/usersHooks';

export default function ReviewScreen() {
  const { userId, rideId } = useLocalSearchParams<{ userId: string; rideId: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const createReviewMutation = useCreateReviewMutation();

  const handleSubmit = async () => {
    if (rating === 0) {
      Toast.show({ title: 'Rating Required', message: 'Please select a rating from 1 to 5 stars.', type: 'error' });
      return;
    }

    try {
      await createReviewMutation.mutateAsync({
        userId,
        rideId,
        rating,
        comment: comment.trim(),
      });
      Toast.show({ title: 'Review Submitted', message: 'Thank you for your feedback!', type: 'success' });
      router.back();
    } catch (error: any) {
      Toast.show({ title: 'Error', message: error.response?.data?.error?.message || 'Failed to submit review', type: 'error' });
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]} edges={['top']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Leave a Review</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            How was your experience with this user?
          </Text>

          {/* Stars */}
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => setRating(star)} style={styles.starButton}>
                <Ionicons 
                  name={star <= rating ? "star" : "star-outline"} 
                  size={40} 
                  color={star <= rating ? "#FFD700" : colors.border.default} 
                />
              </Pressable>
            ))}
          </View>

          {/* Comment */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text.primary }]}>Comment (Optional)</Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: colors.background.subtle, 
                  color: colors.text.primary, 
                  borderColor: colors.border.default 
                }
              ]}
              placeholder="Write about your experience..."
              placeholderTextColor={colors.text.placeholder}
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
              textAlignVertical="top"
            />
          </View>

        </ScrollView>

        {/* Bottom Actions */}
        <View style={[styles.footer, { backgroundColor: colors.background.primary, borderTopColor: colors.border.default }]}>
          <Pressable 
            style={[
              styles.submitButton, 
              { backgroundColor: rating > 0 ? colors.interactive.primary : colors.border.default }
            ]} 
            onPress={handleSubmit}
            disabled={createReviewMutation.isPending || rating === 0}
          >
            {createReviewMutation.isPending ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Review</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 18,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
  },
  starButton: {
    padding: 4,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 15,
    minHeight: 120,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
    borderTopWidth: 1,
  },
  submitButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 16,
    color: '#FFF',
  },
});
