import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../src/design/theme';
import { Ionicons } from '@expo/vector-icons';
import { spacing, brandColors } from '../../src/design/tokens';
import { useResetPasswordMutation } from '../../src/api/authHooks';
import { Alert } from '../../src/components/GlobalAlert';

export default function ResetPasswordScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  
  const resetPasswordMutation = useResetPasswordMutation();
  const loading = resetPasswordMutation.isPending;

  const handleReset = async () => {
    setError('');
    
    if (otp.length !== 6) {
      setError('OTP must be exactly 6 digits');
      return;
    }
    
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError('Please ensure your password meets all constraints');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({ 
        email,
        otp,
        newPassword
      });
      
      Alert.alert('Success', 'Your password has been reset successfully!');
      router.replace('/(auth)/login');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to reset password');
    }
  };

  const isFormValid = otp.length === 6 && newPassword.length >= 8 && /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) && /[0-9]/.test(newPassword) && confirmPassword.length > 0 && newPassword === confirmPassword;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
          <Pressable 
            onPress={() => router.back()} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </Pressable>
          <Text style={[styles.title, { color: colors.text.primary }]}>Create New Password</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={[styles.subtitle, { color: colors.text.secondary, marginBottom: spacing.xl }]}>
            Enter the 6-digit OTP sent to {email} and your new password.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text.secondary }]}>OTP Code</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.background.subtle, borderColor: colors.border.default }]}>
              <Ionicons name="keypad-outline" size={20} color={colors.text.placeholder} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text.primary }]}
                placeholder="123456"
                placeholderTextColor={colors.text.placeholder}
                keyboardType="number-pad"
                maxLength={6}
                keyboardAppearance={isDark ? 'dark' : 'light'}
                value={otp}
                onChangeText={setOtp}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text.secondary }]}>New Password</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.background.subtle, borderColor: colors.border.default }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.text.placeholder} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text.primary }]}
                placeholder="At least 6 characters"
                placeholderTextColor={colors.text.placeholder}
                secureTextEntry={!showPassword}
                keyboardAppearance={isDark ? 'dark' : 'light'}
                value={newPassword}
                onChangeText={setNewPassword}
                textContentType="newPassword"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.text.placeholder} />
              </Pressable>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text.secondary }]}>Confirm Password</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.background.subtle, borderColor: colors.border.default }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.text.placeholder} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text.primary }]}
                placeholder="Must match new password"
                placeholderTextColor={colors.text.placeholder}
                secureTextEntry={!showConfirmPassword}
                keyboardAppearance={isDark ? 'dark' : 'light'}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                textContentType="newPassword"
              />
              <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.text.placeholder} />
              </Pressable>
            </View>
          </View>

          {/* Password constraints checklist */}
          <View style={{ marginTop: spacing.xs, marginBottom: spacing.md, paddingHorizontal: spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
              {newPassword.length >= 8 ? (
                <Ionicons name="checkmark" size={16} color={brandColors.mintGreen} />
              ) : (
                <View style={{ width: 16, alignItems: 'center' }}>
                  <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB' }} />
                </View>
              )}
              <Text style={{ marginLeft: spacing.sm, fontFamily: 'PlusJakartaSans-500Medium', fontSize: 13, color: newPassword.length >= 8 ? brandColors.mintGreen : colors.text.placeholder }}>
                At least 8 characters
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
              {/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? (
                <Ionicons name="checkmark" size={16} color={brandColors.mintGreen} />
              ) : (
                <View style={{ width: 16, alignItems: 'center' }}>
                  <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB' }} />
                </View>
              )}
              <Text style={{ marginLeft: spacing.sm, fontFamily: 'PlusJakartaSans-500Medium', fontSize: 13, color: /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? brandColors.mintGreen : colors.text.placeholder }}>
                Uppercase and lowercase letters
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
              {/[0-9]/.test(newPassword) ? (
                <Ionicons name="checkmark" size={16} color={brandColors.mintGreen} />
              ) : (
                <View style={{ width: 16, alignItems: 'center' }}>
                  <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB' }} />
                </View>
              )}
              <Text style={{ marginLeft: spacing.sm, fontFamily: 'PlusJakartaSans-500Medium', fontSize: 13, color: /[0-9]/.test(newPassword) ? brandColors.mintGreen : colors.text.placeholder }}>
                At least one number
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {newPassword === confirmPassword && confirmPassword.length > 0 ? (
                <Ionicons name="checkmark" size={16} color={brandColors.mintGreen} />
              ) : (
                <View style={{ width: 16, alignItems: 'center' }}>
                  <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB' }} />
                </View>
              )}
              <Text style={{ marginLeft: spacing.sm, fontFamily: 'PlusJakartaSans-500Medium', fontSize: 13, color: newPassword === confirmPassword && confirmPassword.length > 0 ? brandColors.mintGreen : colors.text.placeholder }}>
                Passwords match
              </Text>
            </View>
          </View>
          
          
          {error ? <Text style={[styles.errorText, { color: brandColors.coralPink }]}>{error}</Text> : null}
        </View>

        <View style={styles.footer}>
          <Pressable 
            style={[
              styles.primaryButton, 
              { backgroundColor: colors.interactive.primary },
              (!isFormValid || loading) && { opacity: 0.5 }
            ]}
            onPress={handleReset}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.background.card} />
            ) : (
              <Text style={styles.primaryButtonText}>Reset Password</Text>
            )}
          </Pressable>
        </View>
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    marginRight: spacing.md,
    padding: spacing.xs,
  },
  title: {
    fontFamily: 'Outfit-700Bold',
    fontSize: 28,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 15,
    lineHeight: 22,
  },
  formContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    height: 56,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 16,
    height: '100%',
  },
  eyeIcon: {
    padding: spacing.sm,
  },
  errorText: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 14,
    marginTop: spacing.xs,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
    paddingTop: spacing.md,
  },
  primaryButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
