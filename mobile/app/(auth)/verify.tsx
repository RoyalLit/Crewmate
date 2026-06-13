import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../src/design/theme';
import { Ionicons } from '@expo/vector-icons';
import { brandColors } from '../../src/design/tokens';
import { apiClient } from '../../src/api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function VerifyScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = (text: string, index: number) => {
    // Basic array copy
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-advance
    if (text.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto-submit if last digit
    if (text.length === 1 && index === 5) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 6) {
        verifyOtp(fullOtp);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async (code: string) => {
    setError('');
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/verify-otp', { email, otp: code });
      const { accessToken } = response.data.data;
      
      // Save token
      await AsyncStorage.setItem('crewmute_token', accessToken);
      
      // Navigate to tabs
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (countdown > 0) return;
    try {
      // Actually need to hit a resend endpoint if one existed
      // For now, assume /auth/resend-otp
      await apiClient.post('/auth/resend-otp', { email });
      setCountdown(60);
    } catch (err: any) {
      setError('Failed to resend OTP');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </Pressable>
        </View>

        <Text style={[styles.title, { color: colors.text.primary }]}>Verify your email</Text>
        <Text style={[styles.subtext, { color: colors.text.secondary }]}>
          We sent a 6-digit code to {email || 'your email'}
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={[
                styles.otpBox,
                { 
                  backgroundColor: colors.background.subtle, 
                  color: colors.text.primary,
                  borderColor: digit ? colors.interactive.primary : colors.border.default,
                }
              ]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              selectTextOnFocus
            />
          ))}
        </View>

        {error ? <Text style={[styles.errorText, { color: brandColors.coralPink }]}>{error}</Text> : null}

        {loading && <ActivityIndicator color={colors.interactive.primary} style={styles.loader} />}

        <Pressable 
          onPress={resendOtp} 
          disabled={countdown > 0}
          style={styles.resendContainer}
        >
          <Text style={[
            styles.resendText, 
            { color: countdown > 0 ? colors.text.placeholder : colors.interactive.primary }
          ]}>
            {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    flex: 1,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 24,
    marginBottom: 8,
  },
  subtext: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    marginBottom: 40,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderRadius: 10,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 24,
  },
  errorText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  loader: {
    marginBottom: 16,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  resendText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 15,
  },
});
