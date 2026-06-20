import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/design/theme';
import { spacing, TAB_BAR_HEIGHT } from '../../src/design/tokens';
import { Ionicons } from '@expo/vector-icons';
import { CityAutocomplete } from '../../src/components/CityAutocomplete';
import { useCreateRideMutation } from '../../src/api/ridesHooks';
import { useRouter } from 'expo-router';
import { Alert } from '../../src/components/GlobalAlert';

export default function PostScreen(): React.JSX.Element {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [seats, setSeats] = useState('3');
  const [fare, setFare] = useState('');
  const [cabType, setCabType] = useState<'Uber Go' | 'Uber XL' | 'Ola Mini' | 'Ola Prime Sedan' | 'Other'>('Uber Go');

  const createRideMutation = useCreateRideMutation();
  const loading = createRideMutation.isPending;

  const CAB_TYPES = ['Uber Go', 'Uber XL', 'Ola Mini', 'Ola Prime Sedan', 'Other'];

  const handlePost = async () => {
    // Basic validation
    if (!fromCity || !toCity || !date || !time || !seats || !fare) {
      Alert.alert('Missing Fields', 'Please fill in all fields to post a ride.');
      return;
    }

    // Date validation simple regex YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Alert.alert('Invalid Date', 'Please use YYYY-MM-DD format (e.g. 2026-10-25)');
      return;
    }

    // Time validation HH:mm
    if (!/^\d{2}:\d{2}$/.test(time)) {
      Alert.alert('Invalid Time', 'Please use HH:MM format (e.g. 14:30)');
      return;
    }

    try {
      await createRideMutation.mutateAsync({
        fromCity,
        toCity,
        departureDate: date,
        departureTime: time,
        totalSeats: parseInt(seats, 10),
        farePerSeat: parseInt(fare, 10),
        cabType,
      });

      Alert.alert('Success', 'Ride posted successfully!');
      
      // Reset form
      setFromCity('');
      setToCity('');
      setDate('');
      setTime('');
      setSeats('3');
      setFare('');
      
      // Navigate to Home Feed
      router.push('/(tabs)');
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || 'Failed to post ride';
      Alert.alert('Error', msg);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]} edges={['top']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.title, { color: colors.text.primary }]}>Post a Ride</Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            Share your cab and split the fare!
          </Text>

          <View style={styles.formCard}>
            {/* Route */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text.primary }]}>Leaving from</Text>
              <CityAutocomplete
                value={fromCity}
                onChange={setFromCity}
                placeholder="e.g. Amity University"
                iconName="location-outline"
              />
            </View>

            <View style={styles.swapIconContainer}>
              <View style={[styles.swapIcon, { backgroundColor: colors.background.subtle }]}>
                <Ionicons name="arrow-down" size={16} color={colors.text.secondary} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text.primary }]}>Going to</Text>
              <CityAutocomplete
                value={toCity}
                onChange={setToCity}
                placeholder="e.g. New Delhi"
                iconName="flag-outline"
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.background.card }]} />

            {/* Date & Time */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
                <Text style={[styles.label, { color: colors.text.primary }]}>Date</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.background.subtle, borderColor: colors.border.default }]}>
                  <Ionicons name="calendar-outline" size={20} color={colors.text.placeholder} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text.primary }]}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.text.placeholder}
                    keyboardAppearance={isDark ? 'dark' : 'light'}
                    value={date}
                    onChangeText={setDate}
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing.sm }]}>
                <Text style={[styles.label, { color: colors.text.primary }]}>Time</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.background.subtle, borderColor: colors.border.default }]}>
                  <Ionicons name="time-outline" size={20} color={colors.text.placeholder} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text.primary }]}
                    placeholder="HH:MM (24h)"
                    placeholderTextColor={colors.text.placeholder}
                    keyboardAppearance={isDark ? 'dark' : 'light'}
                    value={time}
                    onChangeText={setTime}
                  />
                </View>
              </View>
            </View>

            {/* Seats & Fare */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
                <Text style={[styles.label, { color: colors.text.primary }]}>Total Seats</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.background.subtle, borderColor: colors.border.default }]}>
                  <Ionicons name="people-outline" size={20} color={colors.text.placeholder} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text.primary }]}
                    placeholder="3"
                    keyboardType="number-pad"
                    placeholderTextColor={colors.text.placeholder}
                    keyboardAppearance={isDark ? 'dark' : 'light'}
                    value={seats}
                    onChangeText={setSeats}
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing.sm }]}>
                <Text style={[styles.label, { color: colors.text.primary }]}>Fare per Seat</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.background.subtle, borderColor: colors.border.default }]}>
                  <Text style={[styles.rupeeSign, { color: colors.text.primary }]}>₹</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text.primary }]}
                    placeholder="350"
                    keyboardType="number-pad"
                    placeholderTextColor={colors.text.placeholder}
                    keyboardAppearance={isDark ? 'dark' : 'light'}
                    value={fare}
                    onChangeText={setFare}
                  />
                </View>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.background.card }]} />

            {/* Cab Type Selection */}
            <Text style={[styles.label, { color: colors.text.primary, marginBottom: spacing.sm }]}>Cab Type</Text>
            <View style={styles.cabTypeContainer}>
              {CAB_TYPES.map((type) => (
                <Pressable
                  key={type}
                  onPress={() => setCabType(type as any)}
                  style={[
                    styles.cabTypeChip,
                    { backgroundColor: colors.background.subtle, borderColor: colors.border.default },
                    cabType === type && { backgroundColor: colors.interactive.primary, borderColor: colors.interactive.primary }
                  ]}
                >
                  <Text style={[
                    styles.cabTypeText,
                    { color: colors.text.secondary },
                    cabType === type && { color: colors.interactive.primaryText }
                  ]}>
                    {type}
                  </Text>
                </Pressable>
              ))}
            </View>

          </View>

          <Pressable 
            style={[
              styles.primaryButton, 
              { backgroundColor: colors.interactive.primary, marginBottom: TAB_BAR_HEIGHT + spacing.xl }
            ]}
            onPress={handlePost}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.interactive.primaryText} />
            ) : (
              <Text style={[styles.primaryButtonText, { color: colors.interactive.primaryText }]}>
                Post Ride
              </Text>
            )}
          </Pressable>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
  },
  title: {
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    fontSize: 28,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 16,
    marginBottom: spacing['2xl'],
  },
  formCard: {
    marginBottom: spacing.xl,
    position: 'relative',
  },
  inputGroup: {
    marginBottom: spacing.md,
    position: 'relative',
    zIndex: 1,
  },
  label: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 14,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    height: 56,
    paddingHorizontal: spacing.md,
  },
  inputIcon: {
    marginRight: 12,
  },
  rupeeSign: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 18,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 16,
    height: '100%',
  },
  swapIconContainer: {
    alignItems: 'center',
    marginVertical: -16,
    zIndex: 10,
  },
  swapIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent', // Will be overridden or rely on subtle bg to stand out
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
  },
  cabTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cabTypeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 44,
  },
  cabTypeText: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 14,
  },
  primaryButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  primaryButtonText: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 16,
  },
});
