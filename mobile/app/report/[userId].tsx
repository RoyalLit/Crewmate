import { Toast } from '../../src/components/Toast';
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/design/theme';
import { brandColors, spacing } from '../../src/design/tokens';
import { useReportUserMutation } from '../../src/api/safetyHooks';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from '../../src/components/GlobalAlert';

export default function ReportScreen() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  
  const [reason, setReason] = useState('');
  
  const reportMutation = useReportUserMutation();

  const handleReport = () => {
    if (reason.trim().length < 5) {
      Toast.show({ title: 'Error', message: 'Please provide a valid reason (at least 5 characters).', type: 'error' });
      return;
    }

    reportMutation.mutate({ reportedUserId: userId as string, reason: reason.trim() }, {
      onSuccess: () => {
        Alert.alert('Report Submitted', 'Thank you. Our safety team will review this report shortly.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      },
      onError: (err: any) => {
        Toast.show({ title: 'Error', message: err.response?.data?.message || 'Failed to submit report. Please try again.', type: 'error' });
      }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border.default }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Report User</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.label, { color: colors.text.primary }]}>Reason for reporting:</Text>
        <TextInput
          style={[styles.input, { 
            color: colors.text.primary,
            backgroundColor: isDark ? colors.background.subtle : '#F2F3F5',
            borderColor: colors.border.default 
          }]}
          placeholder="Please describe why you are reporting this user..."
          placeholderTextColor={colors.text.placeholder}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          value={reason}
          onChangeText={setReason}
        />
        
        <Text style={[styles.disclaimer, { color: colors.text.secondary }]}>
          Your report is strictly confidential. In emergencies, please contact local authorities immediately.
        </Text>

        <Pressable 
          style={[styles.submitButton, { backgroundColor: brandColors.coralPink }]}
          onPress={handleReport}
          disabled={reportMutation.isPending}
        >
          {reportMutation.isPending ? (
            <ActivityIndicator color={colors.background.card} />
          ) : (
            <Text style={styles.submitButtonText}>Submit Report</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 18,
  },
  content: {
    padding: spacing.lg,
  },
  label: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 15,
    minHeight: 120,
    marginBottom: spacing.md,
  },
  disclaimer: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 13,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  submitButton: {
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 16,
  },
});
