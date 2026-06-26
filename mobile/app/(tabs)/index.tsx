/**
 * Explore tab — Home feed screen.
 */
import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../src/design/theme';
import { TAB_BAR_HEIGHT, spacing, brandColors } from '../../src/design/tokens';
import { RideCard } from '../../src/components/RideCard';
import { useBrowseRidesQuery } from '../../src/api/ridesHooks';
import { CityAutocomplete } from '../../src/components/CityAutocomplete';
import { EmptyState } from '../../src/components/EmptyState';
import { FilterBottomSheet, FilterBottomSheetRef, FilterOptions } from '../../src/components/FilterBottomSheet';
import { useRouter } from 'expo-router';

export default function ExploreScreen(): React.JSX.Element {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [fromCityFilter, setFromCityFilter] = useState('');
  const [toCityFilter, setToCityFilter] = useState('');
  const [isPulling, setIsPulling] = useState(false);
  const filterSheetRef = React.useRef<FilterBottomSheetRef>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'earliest',
    onlyAvailableSeats: false,
  });
  
  // Real API Query
  const { data, isLoading, isError, refetch } = useBrowseRidesQuery({
    fromCity: fromCityFilter,
    toCity: toCityFilter,
    page: 1,
    limit: 20,
    sortBy: filters.sortBy,
    onlyAvailableSeats: filters.onlyAvailableSeats,
  });

  const rides = data?.data?.data || [];

  const renderItem = useCallback(({ item }: { item: any }) => (
    <RideCard 
      ride={item} 
      onPress={() => {
        const id = item._id || item.id;
        if (id) {
          router.push(`/ride/${id}`);
        }
      }}
    />
  ), [router]);

  const handleRefresh = async () => {
    setIsPulling(true);
    await refetch();
    setIsPulling(false);
  };

  const shadowStyle = isDark
    ? { borderWidth: 1, borderColor: '#2E2E4A' }
    : {
        borderWidth: 1,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
      };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Rides List with Header integrated */}
      <View style={{ flex: 1, zIndex: 1 }}>
        <FlatList
          data={isLoading ? [] : rides}
          keyExtractor={(item: any) => item.id || item._id || Math.random().toString()}
          renderItem={renderItem}
          ListHeaderComponent={
            <View style={{ paddingTop: spacing.xl, paddingHorizontal: spacing.md, zIndex: 10, paddingBottom: spacing.lg }}>
              {Platform.OS === 'ios' && insets.top > 20 && (
                <View style={[styles.easterEggContainer, { top: 15 }]} pointerEvents="none">
                  <Text style={[styles.easterEggText, { color: colors.interactive.primary }]}>🚗 beep beep!</Text>
                </View>
              )}

              <View style={styles.headerTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, { color: colors.text.primary }]}>Find your crew.</Text>
                  <Text style={[styles.subtitle, { color: colors.text.secondary }]}>Where are you heading today?</Text>
                </View>
                <Pressable 
                  onPress={() => filterSheetRef.current?.present()}
                  style={[styles.themeToggle, { backgroundColor: colors.background.subtle }]}
                >
                  <Ionicons name="options-outline" size={22} color={colors.text.primary} />
                </Pressable>
              </View>

              {/* Search Card */}
              <View style={[styles.searchCard, { backgroundColor: colors.background.card, zIndex: 20 }, shadowStyle]}>
                <View style={styles.searchTimelineContainer}>
                  <View style={styles.searchTimeline}>
                    <Ionicons name="location" size={16} color={brandColors.electricViolet} />
                    <View style={[styles.searchTimelineLine, { backgroundColor: colors.border.default }]} />
                    <Ionicons name="location-outline" size={16} color={brandColors.coralPink} />
                  </View>
                  
                  <View style={styles.searchInputs}>
                    <View style={{ zIndex: 2 }}>
                      <CityAutocomplete 
                        value={fromCityFilter}
                        onChange={setFromCityFilter}
                        placeholder="Leaving from..."
                        iconName="car-outline"
                      />
                    </View>
                    <View style={{ marginTop: spacing.sm, zIndex: 1 }}>
                      <CityAutocomplete 
                        value={toCityFilter}
                        onChange={setToCityFilter}
                        placeholder="Going to..."
                        iconName="flag-outline"
                      />
                    </View>
                  </View>
                </View>
              </View>
              
              <Text style={[styles.sectionTitle, { color: colors.text.primary, marginBottom: 0 }]}>Active Rides</Text>
            </View>
          }
          ListEmptyComponent={
            isLoading ? (
              <ActivityIndicator size="large" color={colors.interactive.primary} style={{ marginTop: 40 }} />
            ) : isError ? (
              <Text style={{ textAlign: 'center', marginTop: 40, color: colors.text.secondary }}>Failed to load rides.</Text>
            ) : (
              <EmptyState icon="car-outline" title="No rides found" subtitle="Check back later for new rides near you" />
            )
          }
          style={[styles.container, { backgroundColor: 'transparent' }]}
          contentContainerStyle={{ 
            paddingBottom: TAB_BAR_HEIGHT + spacing.md, 
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
      <FilterBottomSheet ref={filterSheetRef} filters={filters} onFiltersChange={setFilters} />
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
    zIndex: 999,
  },
  easterEggText: {
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    fontSize: 14,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  themeToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  title: {
    fontSize: 32,
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-400Regular',
  },
  searchCard: {
    borderRadius: 20,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  searchTimelineContainer: {
    flexDirection: 'row',
  },
  searchTimeline: {
    alignItems: 'center',
    width: 24,
    marginRight: spacing.sm,
    paddingVertical: 14,
  },
  searchTimelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  searchInputs: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'PlusJakartaSans-700Bold',
    marginBottom: spacing.xs,
  },
});
