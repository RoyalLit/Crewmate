import React, { forwardRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Switch } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useTheme } from '../design/theme';
import { spacing, brandColors } from '../design/tokens';

export interface FilterOptions {
  sortBy: 'earliest' | 'cheapest';
  onlyAvailableSeats: boolean;
}

interface FilterBottomSheetProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export type FilterBottomSheetRef = BottomSheetModal;

export const FilterBottomSheet = forwardRef<FilterBottomSheetRef, FilterBottomSheetProps>(
  ({ filters, onFiltersChange }, ref) => {
    const { colors, isDark } = useTheme();

    const snapPoints = useMemo(() => ['40%', '45%'], []);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={isDark ? 0.8 : 0.5}
        />
      ),
      [isDark]
    );

    const updateSort = (sort: 'earliest' | 'cheapest') => {
      onFiltersChange({ ...filters, sortBy: sort });
    };

    const toggleAvailableSeats = (val: boolean) => {
      onFiltersChange({ ...filters, onlyAvailableSeats: val });
    };

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.background.card }}
        handleIndicatorStyle={{ backgroundColor: colors.text.placeholder }}
      >
        <BottomSheetView style={styles.contentContainer}>
          <Text style={[styles.title, { color: colors.text.primary }]}>Sort & Filter</Text>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>Sort By</Text>
            <View style={[styles.segmentContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
              <Pressable
                style={[
                  styles.segmentButton,
                  filters.sortBy === 'earliest' && { backgroundColor: brandColors.electricViolet }
                ]}
                onPress={() => updateSort('earliest')}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: filters.sortBy === 'earliest' ? '#FFF' : colors.text.primary }
                  ]}
                >
                  Earliest
                </Text>
              </Pressable>
              
              <Pressable
                style={[
                  styles.segmentButton,
                  filters.sortBy === 'cheapest' && { backgroundColor: brandColors.electricViolet }
                ]}
                onPress={() => updateSort('cheapest')}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: filters.sortBy === 'cheapest' ? '#FFF' : colors.text.primary }
                  ]}
                >
                  Cheapest
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={[styles.section, styles.rowSection]}>
            <View style={styles.rowText}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary, marginBottom: 4 }]}>
                Only Available Seats
              </Text>
              <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
                Hide rides that are completely full
              </Text>
            </View>
            <Switch
              value={filters.onlyAvailableSeats}
              onValueChange={toggleAvailableSeats}
              trackColor={{ false: colors.border.default, true: brandColors.mintGreen }}
              thumbColor="#FFFFFF"
            />
          </View>
          
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  contentContainer: {
    padding: spacing.xl,
    paddingBottom: spacing['2xl'],
  },
  title: {
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    fontSize: 24,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 16,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 13,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 15,
  },
  rowSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowText: {
    flex: 1,
    paddingRight: spacing.lg,
  },
});
