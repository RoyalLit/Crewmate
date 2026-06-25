import { Toast } from '../../src/components/Toast';
import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../../src/design/theme';
import { useThemeStore } from '../../src/store/themeStore';
import { TAB_BAR_HEIGHT, spacing, brandColors } from '../../src/design/tokens';

import { useAuthStore } from '../../src/store/authStore';
import { useLogoutMutation } from '../../src/api/authHooks';
import { useMyStatsQuery } from '../../src/api/usersHooks';
import { useQueryClient } from '@tanstack/react-query';
import { Avatar } from '../../src/components/Avatar';
import { VerifiedBadge } from '../../src/components/VerifiedBadge';
import { StarRating } from '../../src/components/StarRating';

import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';

export default function ProfileScreen(): React.JSX.Element {
  const { colors, isDark } = useTheme();
  const preference = useThemeStore((state) => state.preference);
  const setPreference = useThemeStore((state) => state.setPreference);
  const user = useAuthStore((state) => state.user);
  const logoutAction = useAuthStore((state) => state.logout);
  const logoutMutation = useLogoutMutation();
  const insets = useSafeAreaInsets();

  const isLight = preference === 'light';
  const router = useRouter();

  const { data: myStatsData } = useMyStatsQuery();

  const postedCount = myStatsData?.data?.ridesGiven || 0;
  const joinedCount = myStatsData?.data?.ridesTaken || 0;

  const [refreshing, setRefreshing] = React.useState(false);
  const queryClient = useQueryClient();

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['users', 'me', 'stats'] });
    setRefreshing(false);
  }, [queryClient]);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (e) {
      // ignore
    } finally {
      logoutAction();
    }
  };
  
  // Custom bento box style
  const bentoBox = {
    backgroundColor: colors.background.card,
    borderRadius: 24,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0 : 0.04,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'transparent',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.xl,
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + spacing['3xl'] + spacing.lg,
          paddingHorizontal: spacing.lg,
          gap: spacing.md,
        }}
        contentInset={{ top: insets.top }}
        contentOffset={{ x: 0, y: -insets.top }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={colors.interactive.primary}
            progressViewOffset={insets.top}
          />
        }
      >
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Profile</Text>

        {/* Hero Card */}
        <View style={[bentoBox, styles.heroCard]}>
          <LinearGradient
            colors={isDark ? [colors.background.card, colors.background.primary] : [colors.background.subtle, colors.background.card]}
            style={[StyleSheet.absoluteFillObject, { borderRadius: 24 }]}
          />
          <View style={styles.avatarContainer}>
            <Avatar 
              size="xl" 
              name={user?.name || 'John Doe'} 
              imageUrl={user?.profilePhotoUrl}
              isVerified={(user as any)?.isVerified || user?.isEmailVerified}
            />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Text style={[styles.name, { color: colors.text.primary, marginBottom: 0 }]}>{user?.name || 'John Doe'}</Text>
            <VerifiedBadge isVerified={(user as any)?.isVerified || user?.isCollegeVerified} size="medium" />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.lg }}>
            <Text style={[styles.college, { color: colors.text.secondary, marginBottom: 0 }]}>{user?.college || 'University'}</Text>
            {user?.averageRating !== undefined && (
              <>
                <Text style={{ color: colors.text.placeholder, fontSize: 10 }}>•</Text>
                <StarRating rating={user.averageRating || 0} totalReviews={user.totalReviews || 0} size={14} />
              </>
            )}
          </View>
          
          <View style={[styles.locationChip, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
            <Ionicons name="location" size={14} color={colors.text.secondary} />
            <Text style={[styles.locationText, { color: colors.text.secondary }]}>{user?.homeCity || 'Location not set'}</Text>
          </View>
        </View>

        {/* Stats Bento Tiles */}
        <View style={styles.statsRow}>
          <View style={[bentoBox, styles.statBox]}>
            <Text style={[styles.statNumber, { color: brandColors.electricViolet }]}>{postedCount}</Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Posted</Text>
          </View>
          <View style={[bentoBox, styles.statBox]}>
            <Text style={[styles.statNumber, { color: brandColors.coralPink }]}>{joinedCount}</Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Joined</Text>
          </View>
        </View>

        {/* Verified Student Wide Tile */}
        <View style={[bentoBox, styles.verifiedTile, { backgroundColor: isDark ? 'rgba(0, 200, 150, 0.15)' : 'rgba(0, 200, 150, 0.12)', borderColor: isDark ? 'rgba(0, 200, 150, 0.3)' : 'rgba(0, 200, 150, 0.2)' }]}>
          <View style={styles.verifiedIconContainer}>
            <Ionicons name="shield-checkmark" size={24} color={brandColors.mintGreen} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.verifiedTitle, { color: isDark ? brandColors.mintGreen : brandColors.brandNavy }]}>Verified Student</Text>
            <Text style={[styles.verifiedSub, { color: isDark ? 'rgba(255,255,255,0.8)' : colors.text.secondary }]}>Active university email</Text>
          </View>
        </View>

        {/* Settings Bento */}
        <View style={[bentoBox, styles.settingsContainer, { padding: 0 }]}>
          <Pressable style={styles.settingRow} onPress={() => router.push('/edit-profile')}>
            <View style={styles.settingIcon}>
              <Ionicons name="person-outline" size={20} color={colors.text.primary} />
            </View>
            <Text style={[styles.settingLabel, { color: colors.text.primary }]}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.placeholder} />
          </Pressable>
          <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <Ionicons name={isLight ? "sunny" : "moon"} size={20} color={colors.text.primary} />
            </View>
            <Text style={[styles.settingLabel, { color: colors.text.primary }]}>Theme</Text>
            <View style={[styles.segmentedControl, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
              {(['system', 'light', 'dark'] as const).map((opt) => {
                const isActive = preference === opt;
                return (
                  <Pressable
                    key={opt}
                    onPress={() => setPreference(opt)}
                    style={[
                      styles.segmentButton,
                      isActive && { 
                        backgroundColor: colors.background.card,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: isDark ? 0 : 0.05,
                        shadowRadius: 4,
                        elevation: 1,
                        borderWidth: isDark ? 1 : 0,
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent',
                      }
                    ]}
                  >
                    <Text style={[
                      styles.segmentText,
                      { color: isActive ? colors.text.primary : colors.text.placeholder }
                    ]}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />
          
          <Pressable style={styles.settingRow} onPress={async () => {
            await handleLogout();
            router.replace('/(auth)/forgot-password');
          }}>
            <View style={styles.settingIcon}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.text.primary} />
            </View>
            <Text style={[styles.settingLabel, { color: colors.text.primary }]}>Security & Password</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.placeholder} />
          </Pressable>
          <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />

          <Pressable style={styles.settingRow} onPress={() => Linking.openURL('mailto:support@crewmute.com')}>
            <View style={styles.settingIcon}>
              <Ionicons name="help-buoy-outline" size={20} color={colors.text.primary} />
            </View>
            <Text style={[styles.settingLabel, { color: colors.text.primary }]}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.placeholder} />
          </Pressable>
          <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />

          <Pressable style={styles.settingRow} onPress={() => Toast.show({ title: 'Privacy Policy', message: 'This is a mock Privacy Policy for Crewmute MVP.', type: 'info' })}>
            <View style={styles.settingIcon}>
              <Ionicons name="document-text-outline" size={20} color={colors.text.primary} />
            </View>
            <Text style={[styles.settingLabel, { color: colors.text.primary }]}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.placeholder} />
          </Pressable>
          <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />

          <Pressable style={styles.settingRow} onPress={() => Toast.show({ title: 'Terms of Service', message: 'This is a mock Terms of Service for Crewmute MVP.', type: 'info' })}>
            <View style={styles.settingIcon}>
              <Ionicons name="information-circle-outline" size={20} color={colors.text.primary} />
            </View>
            <Text style={[styles.settingLabel, { color: colors.text.primary }]}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.placeholder} />
          </Pressable>
          <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />

          <Pressable style={styles.settingRow} onPress={handleLogout}>
            <View style={[styles.settingIcon, { backgroundColor: 'rgba(255, 107, 107, 0.1)' }]}>
              <Ionicons name="log-out" size={20} color={brandColors.coralPink} />
            </View>
            <Text style={[styles.settingLabel, { color: brandColors.coralPink }]}>Log Out</Text>
          </Pressable>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    fontSize: 28,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  heroCard: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: brandColors.electricViolet,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    fontSize: 28,
    color: '#FFFFFF',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: brandColors.mintGreen,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  name: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 22,
    marginBottom: 4,
  },
  college: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 15,
    marginBottom: spacing.lg,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    gap: 4,
  },
  locationText: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  statNumber: {
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    fontSize: 36,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 14,
  },
  verifiedTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  verifiedIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 200, 150, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedTitle: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 17,
  },
  verifiedSub: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 14,
    marginTop: 2,
  },
  settingsContainer: {
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    minHeight: 44,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(139, 143, 168, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingLabel: {
    flex: 1,
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginLeft: spacing.lg + 32 + spacing.md,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  segmentButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
  },
  segmentText: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 13,
  },
});
