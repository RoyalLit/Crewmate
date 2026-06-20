import React, { useCallback, useMemo, forwardRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../design/theme';
import { spacing, brandColors } from '../design/tokens';
import { Alert } from './GlobalAlert';
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
  const [arrivalTime, setArrivalTime] = useState('18:30');
  const [stops, setStops] = useState<string[]>([]);
  const [seats, setSeats] = useState(3);
  const [fare, setFare] = useState('150');
  const [cabType, setCabType] = useState<string>('');

  const formatDateMask = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    let formatted = cleaned;
    if (cleaned.length > 4) formatted = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
    if (cleaned.length > 6) formatted = formatted.slice(0, 7) + '-' + cleaned.slice(6);
    setDate(formatted.slice(0, 10));
  };

  const formatTimeMask = (text: string, setter: (val: string) => void) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    let formatted = cleaned;
    if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + ':' + cleaned.slice(2);
    setter(formatted.slice(0, 5));
  };

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
           Alert.alert('Invalid Departure Time', 'Departure Time must be in 24-hour HH:mm format (e.g. 14:30)');
           return;
        }
        if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(arrivalTime)) {
           Alert.alert('Invalid Arrival Time', 'Arrival Time must be in 24-hour HH:mm format (e.g. 18:30)');
           return;
        }
        
        // Ensure departure time is not in the past
        const selectedDateTime = new Date(`${date}T${time}:00`);
        if (selectedDateTime.getTime() < Date.now()) {
          Alert.alert('Invalid Time', 'Departure time cannot be in the past.');
          return;
        }
      }
      if (step === 3) {
        if (!cabType) {
          Alert.alert('Missing Field', 'Please select a vehicle type.');
          return;
        }
      }
      setStep(step + 1);
    } else {
      if (!cabType) {
        Alert.alert('Missing Field', 'Please select a vehicle type.');
        return;
      }
      try {
        await createRideMutation.mutateAsync({
          fromCity: from,
          toCity: to,
          departureDate: date,
          departureTime: time,
          arrivalTime: arrivalTime,
          stops: stops.filter(s => s.trim() !== ''),
          totalSeats: seats,
          farePerSeat: parseInt(fare) || 0,
          // @ts-ignore
          cabType: cabType,
        });

        Alert.alert('Success', 'Ride Posted Successfully!');
        // @ts-ignore
        ref?.current?.close();
        setTimeout(() => {
          setStep(1);
          setFrom('');
          setTo('');
          setStops([]);
          setDate('');
          setTime('');
          setArrivalTime('');
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
          <>
            <Text style={[styles.stepperLabel, { color: colors.text.primary, marginBottom: spacing.md }]}>Route Details</Text>
            <View style={{ zIndex: 100 }}>
              <CityAutocomplete
                value={from}
                onChange={setFrom}
                placeholder="Leaving from"
                iconName="location-outline"
              />
            </View>
            
            <View style={{ marginTop: spacing.md, zIndex: 50 }}>
              <CityAutocomplete
                value={to}
                onChange={setTo}
                placeholder="Going to"
                iconName="flag-outline"
              />
            </View>

            {stops.map((stop, index) => (
              <View key={index} style={{ zIndex: 49 - index, marginTop: spacing.md, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <CityAutocomplete
                    value={stop}
                    onChange={(val) => {
                      const newStops = [...stops];
                      newStops[index] = val;
                      setStops(newStops);
                    }}
                    placeholder={`Stop ${index + 1} (optional)`}
                    iconName="pin-outline"
                  />
                </View>
                <Pressable 
                  onPress={() => {
                    const newStops = [...stops];
                    newStops.splice(index, 1);
                    setStops(newStops);
                  }}
                  style={{ padding: spacing.sm, marginLeft: spacing.xs, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={`Remove stop ${index + 1}`}
                >
                  <Ionicons name="close-circle" size={24} color={colors.text.placeholder} />
                </Pressable>
              </View>
            ))}

              <Pressable 
                onPress={() => setStops([...stops, ''])} 
                style={{ marginTop: spacing.md, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingVertical: spacing.xs, minHeight: 44 }}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Add intermediate stop"
            >
               <Ionicons name="add-circle-outline" size={20} color={brandColors.electricViolet} style={{ marginRight: 6 }} />
               <Text style={{ color: brandColors.electricViolet, fontFamily: 'PlusJakartaSans-600SemiBold' }}>Add intermediate stop</Text>
            </Pressable>
          </>
        );
      case 2:
        return (
          <>
            <Text style={[styles.title, { color: colors.text.primary }]}>When are you leaving?</Text>
            <Text style={[styles.stepperLabel, { color: colors.text.primary, marginBottom: spacing.sm }]}>Date of travel</Text>
            <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
              <Ionicons name="calendar-outline" size={20} color={colors.text.placeholder} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text.primary }]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.text.placeholder}
                value={date}
                onChangeText={formatDateMask}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            <Text style={[styles.stepperLabel, { color: colors.text.primary, marginTop: spacing.md, marginBottom: spacing.sm }]}>Departure Time</Text>
            <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
              <Ionicons name="time-outline" size={20} color={colors.text.placeholder} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text.primary }]}
                placeholder="HH:mm (24hr)"
                placeholderTextColor={colors.text.placeholder}
                value={time}
                onChangeText={(t) => formatTimeMask(t, setTime)}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>

            <Text style={[styles.stepperLabel, { color: colors.text.primary, marginTop: spacing.md, marginBottom: spacing.sm }]}>Estimated Arrival Time</Text>
            <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
              <Ionicons name="time-outline" size={20} color={colors.text.placeholder} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text.primary }]}
                placeholder="HH:mm (24hr)"
                placeholderTextColor={colors.text.placeholder}
                value={arrivalTime}
                onChangeText={(t) => formatTimeMask(t, setArrivalTime)}
                keyboardType="numeric"
                maxLength={5}
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
                <Pressable onPress={() => setSeats(Math.max(1, seats - 1))} style={[styles.stepperBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} accessible accessibilityRole="button" accessibilityLabel="Decrease seats">
                  <Ionicons name="remove" size={20} color={colors.text.primary} />
                </Pressable>
                <Text style={[styles.stepperValue, { color: colors.text.primary }]}>{seats}</Text>
                <Pressable onPress={() => setSeats(Math.min(6, seats + 1))} style={[styles.stepperBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} accessible accessibilityRole="button" accessibilityLabel="Increase seats">
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

            <Text style={[styles.stepperLabel, { color: colors.text.primary, marginTop: spacing.md, marginBottom: spacing.sm }]}>Vehicle Type</Text>
            <View style={{ marginBottom: spacing.md, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {['Hatchback', 'Sedan', 'SUV', 'MUV', 'Any'].map(type => (
                <Pressable
                  key={type}
                  onPress={() => setCabType(type)}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${type}`}
                  style={[
                    styles.cabChip,
                    cabType === type ? { backgroundColor: brandColors.electricViolet, borderColor: brandColors.electricViolet } : { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
                  ]}
                >
                  <Text style={[
                    styles.cabChipText,
                    cabType === type ? { color: '#FFF' } : { color: colors.text.secondary }
                  ]}>
                    {type}
                  </Text>
                </Pressable>
              ))}
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
              accessible
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            </Pressable>
          )}
          <Pressable 
            style={[styles.nextButton, { flex: 1, backgroundColor: brandColors.electricViolet }]} 
            onPress={handleNext}
            disabled={createRideMutation.isPending}
            accessible
            accessibilityRole="button"
            accessibilityLabel={step === 3 ? "Post ride" : "Continue to next step"}
          >
            {createRideMutation.isPending && step === 3 ? (
              <ActivityIndicator color={colors.background.card} />
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
    width: 44,
    height: 44,
    borderRadius: 22,
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
  cabChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1,
    minHeight: 44,
  },
  cabChipText: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 14,
  },
});
