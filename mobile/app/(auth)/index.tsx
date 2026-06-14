import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/design/theme';
import { brandColors } from '../../src/design/tokens';
import { useAuthStore } from '../../src/store/authStore';
import Animated, { 
  FadeInDown, 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

function AuroraBackground() {
  const rotation1 = useSharedValue(0);
  const rotation2 = useSharedValue(0);
  const rotation3 = useSharedValue(0);

  useEffect(() => {
    rotation1.value = withRepeat(withTiming(360, { duration: 20000, easing: Easing.linear }), -1, false);
    rotation2.value = withRepeat(withTiming(-360, { duration: 25000, easing: Easing.linear }), -1, false);
    rotation3.value = withRepeat(withTiming(360, { duration: 30000, easing: Easing.linear }), -1, false);
  }, []);

  const style1 = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation1.value}deg` }] }));
  const style2 = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation2.value}deg` }] }));
  const style3 = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation3.value}deg` }] }));

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0A0A12' }]}>
      <Animated.View style={[style1, { position: 'absolute', top: -height*0.2, left: -width*0.5, width: width*1.5, height: width*1.5, borderRadius: width, backgroundColor: brandColors.electricViolet, opacity: 0.6 }]} />
      <Animated.View style={[style2, { position: 'absolute', top: height*0.3, right: -width*0.5, width: width*1.2, height: width*1.2, borderRadius: width, backgroundColor: brandColors.coralPink, opacity: 0.5 }]} />
      <Animated.View style={[style3, { position: 'absolute', bottom: -height*0.2, left: -width*0.2, width: width*1.4, height: width*1.4, borderRadius: width, backgroundColor: '#00FFFF', opacity: 0.4 }]} />
      {/* Maximum blur intensity to blend the solid circles into a liquid mesh */}
      <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
    </View>
  );
}

export default function LandingScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <AuroraBackground />

      <View style={styles.overlayContainer} pointerEvents="box-none">
        <Animated.View entering={FadeInDown.springify().damping(15).stiffness(100).delay(400)} pointerEvents="box-none">
          <BlurView 
            intensity={90} 
            tint={isDark ? 'dark' : 'light'} 
            style={styles.glassCard}
          >
            <Animated.Text entering={FadeInDown.delay(600)} style={[styles.title, { color: colors.text.primary }]}>
              Find your crew 🚀
            </Animated.Text>
            <Animated.Text entering={FadeInDown.delay(700)} style={[styles.subtitle, { color: colors.text.secondary }]}>
              Carpool with verified college students. Split fares. Vibe check passed.
            </Animated.Text>

            <Animated.View entering={FadeInDown.delay(800)} style={styles.buttonContainer}>
              <Pressable 
                style={[styles.button, { backgroundColor: colors.interactive.primary }]}
                onPress={() => router.push('/(auth)/register')}
              >
                <Text style={[styles.buttonText, { color: colors.interactive.primaryText }]}>Let's Ride</Text>
              </Pressable>

              <Pressable 
                style={[styles.button, styles.secondaryButton, { borderColor: colors.border.default }]}
                onPress={() => router.push('/(auth)/login')}
              >
                <Text style={[styles.buttonText, { color: colors.text.primary }]}>Log In</Text>
              </Pressable>

              {__DEV__ && (
                <Pressable 
                  style={{ alignItems: 'center', marginTop: 12 }}
                  onPress={() => {
                    useAuthStore.getState().login({
                      id: 'dev-user',
                      name: 'Dev User',
                      email: 'dev@college.edu',
                      college: 'Dev College',
                      homeCity: 'Dev City',
                      isEmailVerified: true,
                      status: 'active',
                      profilePhotoUrl: '',
                      createdAt: new Date(),
                    });
                  }}
                >
                  <Text style={[styles.devText, { color: colors.text.placeholder }]}>
                    Skip to App (Dev Only)
                  </Text>
                </Pressable>
              )}
            </Animated.View>
          </BlurView>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 24,
    paddingBottom: 48,
  },
  glassCard: {
    borderRadius: 32,
    padding: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    fontSize: 36,
    marginBottom: 12,
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  buttonText: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 16,
  },
  devText: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 14,
  },
});
