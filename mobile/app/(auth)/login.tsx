import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/design/theme';
import { Ionicons } from '@expo/vector-icons';
import { spacing, brandColors } from '../../src/design/tokens';
import { useAuthStore } from '../../src/store/authStore';

import { useLoginMutation } from '../../src/api/authHooks';
import { storage } from '../../src/lib/storage';

export default function LoginScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const loginAction = useAuthStore((state) => state.login);
  const loginMutation = useLoginMutation();
  const loading = loginMutation.isPending;

  const handleLogin = async () => {
    setError('');
    // Basic validation
    if (!email || !password) return;

    try {
      const response = await loginMutation.mutateAsync({ email, password });
      
      const { user, tokens } = response.data.data || response.data;
      
      if (tokens?.accessToken) {
        await storage.setAccessToken(tokens.accessToken);
        if (tokens?.refreshToken) {
          await storage.setRefreshToken(tokens.refreshToken);
        }
        if (user?.id) {
          await storage.setUserId(user.id);
        }
      }
      
      // Update store and the Auth Guard in _layout.tsx will redirect us
      loginAction(user);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid email or password');
    }
  };

  const isFormValid = email.length > 0 && password.length > 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable 
              onPress={() => {
                router.replace('/(auth)');
              }} 
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            </Pressable>
            <Text style={[styles.title, { color: colors.text.primary }]}>Welcome back</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
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

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>Password</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.background.subtle, borderColor: colors.border.default }]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.text.placeholder} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text.primary }]}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.text.placeholder}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  keyboardAppearance={isDark ? 'dark' : 'light'}
                  value={password}
                  onChangeText={setPassword}
                  textContentType="password"
                  autoComplete="password"
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={colors.text.placeholder} 
                  />
                </Pressable>
              </View>
              <View style={styles.forgotPasswordContainer}>
                <Pressable onPress={() => router.push('/(auth)/forgot-password')} style={{ minHeight: 44, justifyContent: 'center' }}>
                  <Text style={[styles.forgotPasswordText, { color: colors.interactive.primary }]}>Forgot Password?</Text>
                </Pressable>
              </View>
            </View>
            {error ? <Text style={[styles.errorText, { color: brandColors.coralPink }]}>{error}</Text> : null}
          </View>

          {/* Footer CTAs */}
          <View style={styles.footer}>
            <Pressable 
              style={[
                styles.primaryButton, 
                { backgroundColor: isFormValid ? colors.interactive.primary : colors.border.default }
              ]}
              disabled={!isFormValid || loading}
              onPress={handleLogin}
            >
              {loading ? (
                <ActivityIndicator color={isFormValid ? colors.interactive.primaryText : colors.text.placeholder} />
              ) : (
                <Text style={[
                  styles.primaryButtonText, 
                  { color: isFormValid ? colors.interactive.primaryText : colors.text.placeholder }
                ]}>
                  Log In
                </Text>
              )}
            </Pressable>

            <Pressable 
              style={styles.ghostButton}
              onPress={() => router.replace('/(auth)/register')}
            >
              <Text style={[styles.ghostButtonText, { color: colors.text.secondary }]}>
                Don't have an account? <Text style={{ color: colors.interactive.primary, fontFamily: 'PlusJakartaSans-700Bold' }}>Sign up</Text>
              </Text>
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
    paddingHorizontal: spacing.md,
  },
  header: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  backButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    marginLeft: -8,
  },
  title: {
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    fontSize: 28,
    letterSpacing: -0.5,
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 4,
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
  eyeIcon: {
    padding: spacing.sm,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: spacing.sm,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  footer: {
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  primaryButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  primaryButtonText: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 16,
  },
  ghostButton: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ghostButtonText: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 14,
  },
});
