import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/design/theme';
import { WebView } from 'react-native-webview';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

const { height } = Dimensions.get('window');

// A premium interactive 3D scene from Spline
// The user can swipe to rotate the spheres, creating a high-end feel!
const SPLINE_URL = 'https://my.spline.design/interactivespheres-83b5ed770a84e60b2dcfce1bca0447fa/';

export default function LandingScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [webViewLoaded, setWebViewLoaded] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* 3D Interactive Hero Section via WebView */}
      <View style={styles.webviewContainer}>
        <WebView
          source={{ uri: SPLINE_URL }}
          style={styles.webview}
          scrollEnabled={false}
          onLoad={() => setWebViewLoaded(true)}
          // Disable bouncing on iOS to make it feel like a native view, not a webpage
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Glassmorphic UI Overlay (mounts after 3D scene loads for performance) */}
      {webViewLoaded && (
        <View style={styles.overlayContainer} pointerEvents="box-none">
          <Animated.View entering={FadeIn.delay(300).duration(1000)} pointerEvents="box-none">
             <BlurView 
               intensity={80} 
               tint={isDark ? 'dark' : 'light'} 
               style={styles.glassCard}
             >
               <Animated.Text entering={FadeInDown.delay(500)} style={[styles.title, { color: colors.text.primary }]}>
                 Find your crew.
               </Animated.Text>
               <Animated.Text entering={FadeInDown.delay(700)} style={[styles.subtitle, { color: colors.text.secondary }]}>
                 Carpool with verified college students. Split the fare, meet new people, and ride safely.
               </Animated.Text>

               <Animated.View entering={FadeInDown.delay(900)} style={styles.buttonContainer}>
                 <Pressable 
                   style={[styles.button, { backgroundColor: colors.interactive.primary }]}
                   onPress={() => router.push('/(auth)/register')}
                 >
                   <Text style={[styles.buttonText, { color: colors.interactive.primaryText }]}>Get Started</Text>
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
                     onPress={() => router.push('/(tabs)')}
                   >
                     <Text style={[styles.subtitle, { color: colors.text.placeholder, marginBottom: 0 }]}>
                       Skip to App (Dev Only)
                     </Text>
                   </Pressable>
                 )}
               </Animated.View>
             </BlurView>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webviewContainer: {
    ...StyleSheet.absoluteFillObject,
    // Add 100px to height and translate up to hide Spline's bottom watermark badge
    height: height + 100,
    top: -50,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
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
});
