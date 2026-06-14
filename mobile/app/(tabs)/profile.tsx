import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../../src/design/theme';
import { useThemeStore } from '../../src/store/themeStore';
import { TAB_BAR_HEIGHT, spacing, brandColors } from '../../src/design/tokens';

import { useAuthStore } from '../../src/store/authStore';
import { useLogoutMutation } from '../../src/api/authHooks';

export default function ProfileScreen(): React.JSX.Element {
  const { colors, isDark } = useTheme();
  const preference = useThemeStore((state) => state.preference);
  const setPreference = useThemeStore((state) => state.setPreference);
  const user = useAuthStore((state) => state.user);
  const logoutAction = useAuthStore((state) => state.logout);
  const logoutMutation = useLogoutMutation();
  const insets = useSafeAreaInsets();

  const isLight = preference === 'light';
  const initials = user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'JD';
  
  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync({});
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
          paddingTop: Math.max(insets.top, spacing.xl),
          paddingBottom: TAB_BAR_HEIGHT + spacing['2xl'],
          paddingHorizontal: spacing.lg,
          gap: spacing.md,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Profile</Text>

        {/* Hero Card */}
        <View style={[bentoBox, styles.heroCard]}>
          <LinearGradient
            colors={isDark ? ['#2E2E4A', '#1C1C2E'] : ['#F7F7FC', '#FFFFFF']}
            style={[StyleSheet.absoluteFillObject, { borderRadius: 24 }]}
          />
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            {user?.isEmailVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              </View>
            )}
          </View>
          <Text style={[styles.name, { color: colors.text.primary }]}>{user?.name || 'John Doe'}</Text>
          <Text style={[styles.college, { color: colors.text.secondary }]}>{user?.college || 'University'}</Text>
          
          <View style={[styles.locationChip, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
            <Ionicons name="location" size={14} color={colors.text.secondary} />
            <Text style={[styles.locationText, { color: colors.text.secondary }]}>{user?.homeCity || 'Location not set'}</Text>
          </View>
        </View>

        {/* Stats Bento Tiles */}
        <View style={styles.statsRow}>
          <View style={[bentoBox, styles.statBox]}>
            <Text style={[styles.statNumber, { color: brandColors.electricViolet }]}>12</Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Posted</Text>
          </View>
          <View style={[bentoBox, styles.statBox]}>
            <Text style={[styles.statNumber, { color: brandColors.coralPink }]}>8</Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Joined</Text>
          </View>
        </View>

        {/* Verified Student Wide Tile */}
        <View style={[bentoBox, styles.verifiedTile, { backgroundColor: isDark ? 'rgba(0, 200, 150, 0.1)' : '#E8F5F0', borderColor: isDark ? 'rgba(0, 200, 150, 0.2)' : 'transparent' }]}>
          <View style={styles.verifiedIconContainer}>
            <Ionicons name="shield-checkmark" size={24} color={brandColors.mintGreen} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.verifiedTitle, { color: isDark ? '#FFFFFF' : '#0F0F1A' }]}>Verified Student</Text>
            <Text style={[styles.verifiedSub, { color: isDark ? 'rgba(255,255,255,0.7)' : '#4B5563' }]}>Active university email</Text>
          </View>
        </View>

        {/* Settings Bento */}
        <View style={[bentoBox, styles.settingsContainer, { padding: 0 }]}>
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
          
          <Pressable style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <Ionicons name="notifications" size={20} color={colors.text.primary} />
            </View>
            <Text style={[styles.settingLabel, { color: colors.text.primary }]}>Notifications</Text>
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
    borderColor: '#FFFFFF', // This will blend with dark mode because of the LinearGradient background.
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
  },
  segmentText: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 13,
  },
});
