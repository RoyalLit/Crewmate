import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/design/theme';
import { Ionicons } from '@expo/vector-icons';
import { spacing, brandColors } from '../../src/design/tokens';
import { useAuthStore } from '../../src/store/authStore';
import { useUpdateProfileMutation } from '../../src/api/authHooks';

export default function OnboardingScreen() {
  const { colors, isDark } = useTheme();
  const loginAction = useAuthStore((state) => state.login);

  const [city, setCity] = useState('');
  const [error, setError] = useState('');
  
  const updateProfileMutation = useUpdateProfileMutation();
  const loading = updateProfileMutation.isPending;

  const handleComplete = async () => {
    if (!city) return;
    setError('');

    try {
      const response = await updateProfileMutation.mutateAsync({ homeCity: city });
      
      // Firing login will trigger the Auth Guard to redirect to (tabs)
      loginAction(response.data.user);
    } catch (err: any) {
      setError('Failed to update profile');
    }
  };

  const isFormValid = city.length > 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text.primary }]}>Complete Profile</Text>
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
              Almost there! Where are you traveling to and from usually?
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            
            {/* Avatar Picker Mock */}
            <View style={styles.avatarContainer}>
              <View style={[styles.avatarCircle, { backgroundColor: colors.background.subtle, borderColor: colors.border.default }]}>
                <Ionicons name="camera-outline" size={32} color={colors.text.placeholder} />
              </View>
              <Text style={[styles.avatarLabel, { color: colors.text.secondary }]}>Add Photo (Optional)</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>Home City</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.background.subtle, borderColor: colors.border.default }]}>
                <Ionicons name="location-outline" size={20} color={colors.text.placeholder} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text.primary }]}
                  placeholder="e.g. New Delhi"
                  placeholderTextColor={colors.text.placeholder}
                  keyboardAppearance={isDark ? 'dark' : 'light'}
                  value={city}
                  onChangeText={setCity}
                />
              </View>
            </View>
          </View>
          {error ? <Text style={[styles.errorText, { color: brandColors.coralPink }]}>{error}</Text> : null}
        </ScrollView>

        {/* Footer CTAs */}
        <View style={styles.footer}>
          <Pressable 
            style={[
              styles.primaryButton, 
              { backgroundColor: isFormValid ? colors.interactive.primary : colors.border.default }
            ]}
            disabled={!isFormValid || loading}
            onPress={handleComplete}
          >
            {loading ? (
              <ActivityIndicator color={isFormValid ? colors.interactive.primaryText : colors.text.placeholder} />
            ) : (
              <Text style={[
                styles.primaryButtonText, 
                { color: isFormValid ? colors.interactive.primaryText : colors.text.placeholder }
              ]}>
                Let's Go!
              </Text>
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
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    flexGrow: 1,
  },
  header: {
    marginBottom: spacing['2xl'],
  },
  title: {
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    fontSize: 28,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 16,
    lineHeight: 24,
  },
  formContainer: {
    flex: 1,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderStyle: 'dashed',
  },
  avatarLabel: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 14,
    marginBottom: 8,
  },
  errorText: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
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
  input: {
    flex: 1,
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 16,
    height: '100%',
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  primaryButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 16,
  },
});
