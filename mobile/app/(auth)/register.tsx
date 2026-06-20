import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/design/theme';
import { Ionicons } from '@expo/vector-icons';
import { brandColors } from '../../src/design/tokens';
import { CityAutocomplete } from '../../src/components/CityAutocomplete';

import { useRegisterMutation } from '../../src/api/authHooks';

export default function RegisterScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    college: '',
    homeCity: '',
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const registerMutation = useRegisterMutation();
  const loading = registerMutation.isPending;

  const isFormValid = !!(form.name && form.email && form.college && form.homeCity && form.password.length >= 8 && /[A-Z]/.test(form.password) && /[a-z]/.test(form.password) && /[0-9]/.test(form.password));

  const handleRegister = async () => {
    setError('');
    
    if (!form.name || !form.email || !form.college || !form.homeCity || !form.password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (!isFormValid) {
      setError('Please ensure your password meets all constraints');
      return;
    }

    try {
      await registerMutation.mutateAsync(form);
      // Pass email to the verify screen so it knows who to verify
      router.push({ pathname: '/(auth)/verify', params: { email: form.email, name: form.name, college: form.college } });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Registration failed');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
          <Pressable 
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(auth)');
              }
            }} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </Pressable>
          <Text style={[styles.title, { color: colors.text.primary }]}>Join Crewmute</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text.secondary }]}>Full Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background.subtle, color: colors.text.primary, borderColor: colors.border.default }]}
              placeholder="Aditi Sharma"
              placeholderTextColor={colors.text.placeholder}
              value={form.name}
              onChangeText={(t) => setForm({ ...form, name: t })}
              textContentType="name"
              autoComplete="name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text.secondary }]}>College Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background.subtle, color: colors.text.primary, borderColor: colors.border.default }]}
              placeholder="aditi@stu.amity.edu"
              placeholderTextColor={colors.text.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(t) => setForm({ ...form, email: t })}
              textContentType="username"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text.secondary }]}>College Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background.subtle, color: colors.text.primary, borderColor: colors.border.default }]}
              placeholder="Amity University Punjab"
              placeholderTextColor={colors.text.placeholder}
              value={form.college}
              onChangeText={(t) => setForm({ ...form, college: t })}
              textContentType="organizationName"
              autoComplete="off"
            />
          </View>

          <View style={[styles.inputGroup, { zIndex: 10 }]}>
            <Text style={[styles.label, { color: colors.text.secondary }]}>Home City</Text>
            <CityAutocomplete
              value={form.homeCity}
              onChange={(t) => setForm({ ...form, homeCity: t })}
              placeholder="E.g., Delhi, Mumbai"
              iconName="location-outline"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text.secondary }]}>Password</Text>
            <View style={[styles.passwordContainer, { backgroundColor: colors.background.subtle, borderColor: colors.border.default }]}>
              <TextInput
                style={[styles.passwordInput, { color: colors.text.primary }]}
                placeholder="Create a password"
                placeholderTextColor={colors.text.placeholder}
                secureTextEntry={!showPassword}
                value={form.password}
                onChangeText={(t) => setForm({ ...form, password: t })}
                textContentType="newPassword"
                autoComplete="new-password"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.text.secondary} />
              </Pressable>
            </View>
          </View>

          {/* Password constraints checklist */}
          <View style={{ marginTop: 4, paddingHorizontal: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              {form.password.length >= 8 ? (
                <Ionicons name="checkmark" size={16} color={brandColors.mintGreen} />
              ) : (
                <View style={{ width: 16, alignItems: 'center' }}>
                  <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB' }} />
                </View>
              )}
              <Text style={{ marginLeft: 8, fontFamily: 'PlusJakartaSans-Medium', fontSize: 13, color: form.password.length >= 8 ? brandColors.mintGreen : colors.text.placeholder }}>
                At least 8 characters
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              {/[A-Z]/.test(form.password) && /[a-z]/.test(form.password) ? (
                <Ionicons name="checkmark" size={16} color={brandColors.mintGreen} />
              ) : (
                <View style={{ width: 16, alignItems: 'center' }}>
                  <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB' }} />
                </View>
              )}
              <Text style={{ marginLeft: 8, fontFamily: 'PlusJakartaSans-Medium', fontSize: 13, color: /[A-Z]/.test(form.password) && /[a-z]/.test(form.password) ? brandColors.mintGreen : colors.text.placeholder }}>
                Uppercase and lowercase letters
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {/[0-9]/.test(form.password) ? (
                <Ionicons name="checkmark" size={16} color={brandColors.mintGreen} />
              ) : (
                <View style={{ width: 16, alignItems: 'center' }}>
                  <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB' }} />
                </View>
              )}
              <Text style={{ marginLeft: 8, fontFamily: 'PlusJakartaSans-Medium', fontSize: 13, color: /[0-9]/.test(form.password) ? brandColors.mintGreen : colors.text.placeholder }}>
                At least one number
              </Text>
            </View>
          </View>

          {error ? <Text style={[styles.errorText, { color: brandColors.coralPink }]}>{error}</Text> : null}

          <Pressable 
            style={[styles.button, { backgroundColor: colors.interactive.primary, opacity: (!isFormValid || loading) ? 0.7 : 1 }]}
            onPress={handleRegister}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.interactive.primaryText} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.interactive.primaryText }]}>Send OTP</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    marginRight: 16,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 24,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 12,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 15,
  },
});
