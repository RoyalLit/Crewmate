import { Toast } from '../../src/components/Toast';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/design/theme';
import { Ionicons } from '@expo/vector-icons';
import { spacing, brandColors } from '../../src/design/tokens';
import { useForgotPasswordMutation } from '../../src/api/authHooks';


export default function ForgotPasswordScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  
  const forgotPasswordMutation = useForgotPasswordMutation();
  const loading = forgotPasswordMutation.isPending;

  const handleSendOTP = async () => {
    setError('');
    if (!email) return;

    try {
      await forgotPasswordMutation.mutateAsync({ email });
      Toast.show({ title: 'Success', message: 'If an account exists, an OTP has been sent to your email.', type: 'success' });
      router.push({
        pathname: '/(auth)/reset-password',
        params: { email }
      });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to send OTP');
    }
  };

  const isFormValid = email.length > 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Pressable 
            onPress={() => router.back()} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </Pressable>
          <Text style={[styles.title, { color: colors.text.primary }]}>Reset Password</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={[styles.subtitle, { color: colors.text.secondary, marginBottom: spacing.xl }]}>
            Enter the email associated with your account and we'll send you a 6-digit code to reset your password.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text.secondary }]}>College Email</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.background.subtle, borderColor: colors.border.default }]}>
              <Ionicons name="mail-outline" size={20} color={colors.text.placeholder} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text.primary }]}
                placeholder="you@college.edu"
                placeholderTextColor={colors.text.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                keyboardAppearance={isDark ? 'dark' : 'light'}
                value={email}
                onChangeText={setEmail}
                textContentType="username"
                autoComplete="email"
              />
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
            onPress={handleSendOTP}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.background.card} />
            ) : (
              <Text style={styles.primaryButtonText}>Send OTP</Text>
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
    flex: 1,
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
