/**
 * Explore tab — Home feed screen.
 *
 * Placeholder screen. The rides feed, filter UI, and ride cards are
 * implemented in the rides feature PR.
 *
 * Per AGENT_RULES.md §8.7: no data fetching here.
 * Per AGENT_RULES.md §8.4: screen components receive navigation props
 * and render UI — no business logic.
 *
 * // WIP(phase 1 of 6): Foundation scaffold — screen content added in rides feature PR
 */

import React from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../src/design/theme';
import { TAB_BAR_HEIGHT, spacing } from '../../src/design/tokens';
import { RideCard, RideCardData } from '../../src/components/RideCard';

const DUMMY_RIDES: RideCardData[] = [
  {
    id: '1',
    fromCity: 'Chandigarh',
    toCity: 'Amity University Punjab',
    date: 'Mon, 15 Jun',
    time: '08:30 AM',
    posterName: 'Rahul Verma',
    posterCollege: 'Amity University Punjab',
    posterIsVerified: true,
    seatsLeft: 3,
    fare: 150,
    status: 'Active',
  },
  {
    id: '2',
    fromCity: 'Ambala',
    toCity: 'Chandigarh',
    date: 'Tue, 16 Jun',
    time: '04:00 PM',
    posterName: 'Priya Singh',
    posterCollege: 'PEC Chandigarh',
    seatsLeft: 1,
    fare: 200,
    status: 'Pending',
  },
  {
    id: '3',
    fromCity: 'Delhi',
    toCity: 'Amity University Punjab',
    date: 'Fri, 19 Jun',
    time: '06:00 AM',
    posterName: 'Aditya Sharma',
    posterCollege: 'Amity University Punjab',
    posterIsVerified: true,
    seatsLeft: 0,
    fare: 800,
    status: 'Full',
  },
];

export default function ExploreScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* 
        Easter Egg hiding BEHIND the physical hardware!
        Placed absolutely inside the scrolled content at top: 15 (relative to screen top at rest).
        Because FlatList has paddingTop: insets.top, we negate the padding to place it at physical Y=15.
      */}
      {insets.top > 20 && (
        <View style={[styles.easterEggContainer, { top: -(Math.max(insets.top, spacing.xl)) + 15, zIndex: 999 }]} pointerEvents="none">
          <Text style={[styles.easterEggText, { color: colors.interactive.primary }]}>
            🚗 beep beep!
          </Text>
        </View>
      )}

      <View style={styles.headerTop}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Explore</Text>
        <Pressable 
          style={[styles.filterButton, { backgroundColor: colors.background.subtle }]}
          accessibilityLabel="Filter rides"
          accessibilityRole="button"
        >
          <Ionicons name="options-outline" size={24} color={colors.text.primary} />
        </Pressable>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.background.subtle, borderColor: colors.border.default }]}>
        <Ionicons name="search" size={20} color={colors.text.placeholder} style={styles.searchIcon} />
        <TextInput 
          style={[styles.searchInput, { color: colors.text.primary }]}
          placeholder="Where are you going?"
          placeholderTextColor={colors.text.placeholder}
          editable={false}
          pointerEvents="none"
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <FlatList
        data={DUMMY_RIDES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RideCard ride={item} />}
        ListHeaderComponent={renderHeader}
        style={[styles.container, { backgroundColor: 'transparent' }]}
        contentContainerStyle={{ 
          paddingBottom: TAB_BAR_HEIGHT + spacing.md, 
          paddingTop: Math.max(insets.top, spacing.xl),
          paddingHorizontal: spacing.md
        }}
        accessibilityRole="none"
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  easterEggContainer: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
  },
  easterEggText: {
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    fontSize: 14,
  },
  headerContainer: {
    marginBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 32,
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    letterSpacing: -0.3,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 16,
  },
});
