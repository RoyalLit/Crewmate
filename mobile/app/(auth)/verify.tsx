import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../src/design/theme';
import { Ionicons } from '@expo/vector-icons';
import { useVerifyOtpMutation } from '../../src/api/authHooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { brandColors } from '../../src/design/tokens';

export default function VerifyScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  
  const verifyMutation = useVerifyOtpMutation();
  const loading = verifyMutation.isPending;
  
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(cleaned);

    if (cleaned.length === 6) {
      inputRef.current?.blur();
      verifyOtp(cleaned);
    }
  };

  const verifyOtp = async (overrideOtp?: string) => {
    setError('');
    const fullOtp = overrideOtp || otp;
    
    try {
      const response = await verifyMutation.mutateAsync({ email, otp: fullOtp });
      // Save token
      if (response?.data?.tokens?.accessToken) {
        await AsyncStorage.setItem('crewmute_token', response.data.tokens.accessToken);
      }
      
      // Route to onboarding so the user can finish setting up their profile
      router.replace({ 
        pathname: '/(auth)/onboarding', 
        params: { 
          email: params.email,
          name: params.name,
          college: params.college
        } 
      });
    } catch (err: any) {
      const errorObj = err.response?.data?.error;
      if (errorObj?.code === 'VALIDATION_ERROR' && errorObj.details) {
        const firstError = Object.values(errorObj.details)[0];
        setError(firstError as string);
      } else {
        setError(errorObj?.message || 'Invalid OTP');
      }
    }
  };

  const resendOtp = async () => {
    if (countdown > 0) return;
    // Simulate resend
    setTimeout(() => {
      setCountdown(60);
    }, 1000);
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
          <Pressable 
            style={StyleSheet.absoluteFillObject}
            onPress={() => inputRef.current?.focus()}
          />
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const digit = otp[index] || '';
            const isActive = otp.length === index;
            return (
              <View
                key={index}
                style={[
                  styles.otpBox,
                  { 
                    backgroundColor: colors.background.subtle, 
                    borderColor: isActive ? colors.interactive.primary : (digit ? colors.interactive.primary : colors.border.default),
                  }
                ]}
              >
                <Text style={[styles.otpText, { color: colors.text.primary }]}>{digit}</Text>
              </View>
            );
          })}
          
          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            maxLength={6}
            value={otp}
            onChangeText={handleOtpChange}
            autoFocus
            caretHidden={true}
            autoCorrect={false}
          />
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
    position: 'relative',
  },
  otpBox: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpText: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 24,
  },
  hiddenInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
    color: 'transparent',
    backgroundColor: 'transparent',
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
