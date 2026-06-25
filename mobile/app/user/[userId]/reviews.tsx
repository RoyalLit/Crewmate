import React from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../../src/design/theme';
import { spacing, brandColors } from '../../../src/design/tokens';
import { useUserReviewsQuery, usePublicProfileQuery } from '../../../src/api/usersHooks';
import { EmptyState } from '../../../src/components/EmptyState';
import { Avatar } from '../../../src/components/Avatar';
import type { Review } from '../../../src/shared/types';

export default function ReviewsScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();

  const { data: profileData, isLoading: profileLoading } = usePublicProfileQuery(userId);
  const { data: reviewsData, isLoading: reviewsLoading } = useUserReviewsQuery(userId);

  const profile = profileData?.data;
  const reviews = reviewsData?.data || [];
  const isLoading = profileLoading || reviewsLoading;

  const renderReview = ({ item }: { item: Review }) => (
    <View style={[styles.reviewCard, { backgroundColor: isDark ? colors.background.card : '#FFF', borderColor: colors.border.default }]}>
      <View style={styles.reviewHeader}>
        <Avatar size="sm" name={item.reviewer?.name || 'User'} imageUrl={item.reviewer?.profilePhoto} />
        <View style={styles.reviewerInfo}>
          <Text style={[styles.reviewerName, { color: colors.text.primary }]}>{item.reviewer?.name || 'User'}</Text>
          <Text style={[styles.reviewDate, { color: colors.text.placeholder }]}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.ratingBadge}>
          <Text style={[styles.ratingText, { color: brandColors.electricViolet }]}>★ {item.rating}</Text>
        </View>
      </View>
      {item.comment ? (
        <Text style={[styles.commentText, { color: colors.text.secondary }]}>{item.comment}</Text>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={[styles.header, { paddingTop: insets.top, borderBottomColor: colors.border.default }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          {profile ? `${profile.name}'s Reviews` : 'Reviews'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={brandColors.electricViolet} />
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          renderItem={renderReview}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + spacing.xl }]}
          ListEmptyComponent={<EmptyState icon="star-outline" title="No reviews yet" subtitle="This user hasn't received any reviews." />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.lg,
  },
  reviewCard: {
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  reviewerInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  reviewerName: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 15,
  },
  reviewDate: {
    fontFamily: 'PlusJakartaSans-400Regular',
    fontSize: 12,
    marginTop: 2,
  },
  ratingBadge: {
    backgroundColor: `${brandColors.electricViolet}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 14,
  },
  commentText: {
    fontFamily: 'PlusJakartaSans-400Regular',
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
});
