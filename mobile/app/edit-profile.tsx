import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { useTheme } from '../src/design/theme';
import { spacing, brandColors } from '../src/design/tokens';
import { useAuthStore } from '../src/store/authStore';
import { Avatar } from '../src/components/Avatar';
import { Alert } from '../src/components/GlobalAlert';
import { CityAutocomplete } from '../src/components/CityAutocomplete';
import { useUpdateProfileMutation, useUpdateAvatarMutation } from '../src/api/usersHooks';

export default function EditProfileScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  
  const user = useAuthStore(state => state.user);
  
  const [name, setName] = useState(user?.name || '');
  const [homeCity, setHomeCity] = useState(user?.homeCity || '');
  const [college, setCollege] = useState(user?.college || '');
  
  const updateProfileMutation = useUpdateProfileMutation();
  const updateAvatarMutation = useUpdateAvatarMutation();

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }
    
    try {
      await updateProfileMutation.mutateAsync({
        name: name.trim(),
        homeCity: homeCity.trim(),
        college: college.trim(),
      });
      Alert.alert('Success', 'Profile updated successfully!');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error?.message || 'Failed to update profile.');
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission to access camera roll is required!");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (pickerResult.canceled) {
      return;
    }

    try {
      await updateAvatarMutation.mutateAsync(pickerResult.assets[0].uri);
      Alert.alert('Success', 'Profile photo updated!');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error?.message || 'Failed to upload photo.');
    }
  };

  const isSaving = updateProfileMutation.isPending || updateAvatarMutation.isPending;

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
              hitSlop={8}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Edit Profile</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.formContainer}>
            <View style={styles.avatarSection}>
              <View style={styles.avatarWrapper}>
                <Avatar 
                  size="xl" 
                  name={user?.name || 'User'} 
                  imageUrl={user?.profilePhotoUrl}
                  isVerified={(user as any)?.isVerified || user?.isEmailVerified}
                />
                <Pressable style={[styles.editBadge, { backgroundColor: brandColors.mintGreen, borderColor: colors.background.primary }]} onPress={handlePickImage}>
                  <Ionicons name="camera" size={16} color="#0F0F1A" />
                </Pressable>
              </View>
              {updateAvatarMutation.isPending && (
                <Text style={{ marginTop: spacing.sm, color: colors.text.secondary }}>Uploading...</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>Full Name</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.background.card,
                    color: colors.text.primary,
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent',
                    borderWidth: isDark ? 1 : 0,
                  }
                ]}
                placeholderTextColor={colors.text.placeholder}
                value={name}
                onChangeText={setName}
                placeholder="Your full name"
              />
            </View>

            <View style={[styles.inputGroup, { zIndex: 10 }]}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>Home City</Text>
              <CityAutocomplete
                value={homeCity}
                onChange={setHomeCity}
                placeholder="E.g., Delhi, Mumbai"
                iconName="location-outline"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>College / University</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.background.card,
                    color: colors.text.primary,
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent',
                    borderWidth: isDark ? 1 : 0,
                  }
                ]}
                placeholderTextColor={colors.text.placeholder}
                value={college}
                onChangeText={setCollege}
                placeholder="Your college name"
              />
            </View>

            <Pressable 
              style={[
                styles.saveButton,
                { backgroundColor: colors.interactive.primary },
                isSaving ? { opacity: 0.7 } : {}
              ]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color={colors.interactive.primaryText} />
              ) : (
                <Text style={[styles.saveButtonText, { color: colors.interactive.primaryText }]}>Save Changes</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 18,
  },
  formContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  avatarWrapper: {
    position: 'relative',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    minWidth: 44,
    minHeight: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 14,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  input: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 16,
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    height: 56,
  },
  saveButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
