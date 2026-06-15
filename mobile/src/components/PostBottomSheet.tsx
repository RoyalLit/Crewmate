import React, { useCallback, useMemo, forwardRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../design/theme';
import { spacing, brandColors } from '../design/tokens';
import { useCreateRideMutation } from '../api/ridesHooks';
import { CityAutocomplete } from './CityAutocomplete';

export type PostBottomSheetRef = BottomSheet;

export const PostBottomSheet = forwardRef<PostBottomSheetRef>((_props, ref) => {
  const { colors, isDark } = useTheme();

  const [step, setStep] = useState(1);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:30');
  const [seats, setSeats] = useState(3);
  const [fare, setFare] = useState('150');
  const [cabType, setCabType] = useState<'Uber Go' | 'Uber XL' | 'Ola Mini' | 'Ola Prime Sedan' | 'Other'>('Other');

  const createRideMutation = useCreateRideMutation();

  const snapPoints = useMemo(() => ['50%', '85%'], []);

  const renderBackdrop = useCallback(
    (backdropProps: any) => (
      <BottomSheetBackdrop
        {...backdropProps}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={isDark ? 0.8 : 0.5}
      />
    ),
    [isDark]
  );

  const handleNext = async () => {
    if (step < 3) {
      if (step === 1 && (!from || !to)) {
        Alert.alert('Missing Fields', 'Please select departure and arrival cities.');
        return;
      }
      if (step === 2) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
           Alert.alert('Invalid Date', 'Date must be in YYYY-MM-DD format (e.g. 2024-05-20)');
           return;
        }
        if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
           Alert.alert('Invalid Time', 'Time must be in 24-hour HH:mm format (e.g. 14:30)');
           return;
        }
      }
      setStep(step + 1);
    } else {
      try {
        await createRideMutation.mutateAsync({
          fromCity: from,
          toCity: to,
          departureDate: date,
          departureTime: time,
          totalSeats: seats,
          farePerSeat: parseInt(fare) || 0,
          cabType: cabType,
        });

        Alert.alert('Success', 'Ride Posted Successfully!');
        // @ts-ignore
        ref?.current?.close();
        setTimeout(() => {
          setStep(1);
          setFrom('');
          setTo('');
          setDate('');
          setTime('');
        }, 500);
      } catch (e: any) {
        Alert.alert('Error', e.response?.data?.error?.message || 'Failed to post ride');
      }
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <View style={{ zIndex: 10 }}>
            <Text style={[styles.title, { color: colors.text.primary }]}>Where are you heading?</Text>
            <View style={{ marginBottom: spacing.md, zIndex: 20 }}>
              <CityAutocomplete
                value={from}
                onChange={setFrom}
                placeholder="Leaving from..."
                iconName="location-outline"
              />
            </View>
            <View style={{ marginBottom: spacing.md, zIndex: 10 }}>
              <CityAutocomplete
                value={to}
                onChange={setTo}
                placeholder="Going to..."
                iconName="flag-outline"
              />
            </View>
          </View>
        );
      case 2:
        return (
          <>
            <Text style={[styles.title, { color: colors.text.primary }]}>When are you leaving?</Text>
            <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
              <Ionicons name="calendar-outline" size={20} color={colors.text.placeholder} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text.primary }]}
                placeholder="Date (e.g. Today)"
                placeholderTextColor={colors.text.placeholder}
                value={date}
                onChangeText={setDate}
              />
            </View>
            <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
              <Ionicons name="time-outline" size={20} color={colors.text.placeholder} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text.primary }]}
                placeholder="Time (e.g. 5:30 PM)"
                placeholderTextColor={colors.text.placeholder}
                value={time}
                onChangeText={setTime}
              />
            </View>
          </>
        );
      case 3:
        const totalEarnings = (parseInt(fare) || 0) * seats;
        return (
          <View style={{ zIndex: 10 }}>
            <Text style={[styles.title, { color: colors.text.primary }]}>Set your fare</Text>
            
            <View style={styles.stepperContainer}>
              <Text style={[styles.stepperLabel, { color: colors.text.secondary }]}>Available Seats</Text>
              <View style={styles.stepperControls}>
                <Pressable onPress={() => setSeats(Math.max(1, seats - 1))} style={[styles.stepperBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                  <Ionicons name="remove" size={20} color={colors.text.primary} />
                </Pressable>
                <Text style={[styles.stepperValue, { color: colors.text.primary }]}>{seats}</Text>
                <Pressable onPress={() => setSeats(Math.min(6, seats + 1))} style={[styles.stepperBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                  <Ionicons name="add" size={20} color={colors.text.primary} />
                </Pressable>
              </View>
            </View>

            <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
              <Text style={[styles.currencySymbol, { color: colors.text.primary }]}>₹</Text>
              <TextInput
                style={[styles.input, { color: colors.text.primary, fontSize: 20, fontFamily: 'PlusJakartaSans-700Bold' }]}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor={colors.text.placeholder}
                value={fare}
                onChangeText={setFare}
              />
              <Text style={[styles.perSeat, { color: colors.text.secondary }]}>/ seat</Text>
            </View>

            <View style={[styles.earningsBox, { backgroundColor: isDark ? 'rgba(123, 97, 255, 0.1)' : '#F3F0FF' }]}>
              <Ionicons name="car" size={24} color={brandColors.electricViolet} />
              <View style={styles.earningsTextCol}>
                <Text style={[styles.earningsLabel, { color: brandColors.electricViolet }]}>Total Shared Fare</Text>
                <Text style={[styles.earningsAmount, { color: brandColors.electricViolet }]}>₹{totalEarnings}</Text>
              </View>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.background.card }}
      handleIndicatorStyle={{ backgroundColor: colors.text.placeholder }}
      keyboardBehavior="extend" // Ensures sheet pushes up when keyboard opens
    >
      <BottomSheetScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
        {renderStepContent()}

        <View style={styles.footerRow}>
          {step > 1 && (
            <Pressable 
              style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} 
              onPress={() => setStep(step - 1)}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            </Pressable>
          )}
          <Pressable 
            style={[styles.nextButton, { flex: 1, backgroundColor: brandColors.electricViolet }]} 
            onPress={handleNext}
            disabled={createRideMutation.isPending}
          >
            {createRideMutation.isPending && step === 3 ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.nextText}>{step === 3 ? 'Post Ride' : 'Continue'}</Text>
            )}
          </Pressable>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  contentContainer: {
    padding: spacing.xl,
    paddingBottom: spacing['2xl'] * 2, // extra padding for keyboard
  },
  title: {
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    fontSize: 26,
    marginBottom: spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    height: 56,
    borderRadius: 16,
    marginBottom: spacing.md,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 16,
  },
  currencySymbol: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 20,
    marginRight: 4,
  },
  perSeat: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 14,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  stepperLabel: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 16,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperValue: {
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    fontSize: 20,
    width: 20,
    textAlign: 'center',
  },
  earningsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: 16,
    marginTop: spacing.md,
    gap: spacing.md,
  },
  earningsTextCol: {
    flex: 1,
  },
  earningsLabel: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 14,
  },
  earningsAmount: {
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    fontSize: 24,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  backButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextText: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
});
