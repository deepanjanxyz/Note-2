import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import { Logo } from '@/components/Logo';
import Colors from '@/constants/colors';

interface BiometricLockProps {
  onUnlock: () => void;
}

export function BiometricLock({ onUnlock }: BiometricLockProps) {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [hasBiometric, setHasBiometric] = useState(true);
  const pulseAnim = useSharedValue(0);
  const ringScale = useSharedValue(1);
  const logoScale = useSharedValue(0);
  const fadeIn = useSharedValue(0);

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 800 });
    logoScale.value = withDelay(200, withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.5)) }));

    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    checkBiometric();
  }, []);

  async function checkBiometric() {
    if (Platform.OS === 'web') {
      setHasBiometric(false);
      return;
    }
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setHasBiometric(compatible && enrolled);
    } catch {
      setHasBiometric(false);
    }
  }

  async function handleAuth() {
    setStatus('scanning');
    ringScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 600 }),
        withTiming(1, { duration: 600 })
      ),
      3,
      false
    );

    if (Platform.OS === 'web' || !hasBiometric) {
      await new Promise(r => setTimeout(r, 1500));
      setStatus('success');
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setTimeout(onUnlock, 600);
      return;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock NeuronPad',
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setStatus('success');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(onUnlock, 600);
      } else {
        setStatus('failed');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch {
      setStatus('failed');
    }
  }

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulseAnim.value, [0, 1], [0.3, 0.8]),
    transform: [{ scale: interpolate(pulseAnim.value, [0, 1], [1, 1.3]) }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoScale.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.View style={logoStyle}>
        <Logo size={56} glowOpacity={0.8} />
      </Animated.View>

      <Text style={styles.brand}>NeuronPad</Text>
      <Text style={styles.subtitle}>AI-Powered Smart Notes</Text>

      <View style={styles.biometricWrap}>
        <Animated.View style={[styles.pulseRing, pulseStyle]} />
        <Animated.View style={[styles.scanRing, ringStyle]}>
          <Pressable onPress={handleAuth} style={styles.scanButton}>
            <Ionicons
              name={
                status === 'success'
                  ? 'checkmark'
                  : status === 'failed'
                  ? 'close'
                  : 'finger-print'
              }
              size={40}
              color={
                status === 'success'
                  ? Colors.dark.success
                  : status === 'failed'
                  ? Colors.dark.error
                  : Colors.dark.accent
              }
            />
          </Pressable>
        </Animated.View>
      </View>

      <Text style={styles.instruction}>
        {status === 'scanning'
          ? 'Authenticating...'
          : status === 'success'
          ? 'Authenticated'
          : status === 'failed'
          ? 'Try again'
          : hasBiometric
          ? 'Tap to unlock'
          : 'Tap to continue'}
      </Text>

      {status === 'failed' && (
        <Pressable onPress={handleAuth} style={styles.retryBtn}>
          <Ionicons name="refresh" size={18} color={Colors.dark.accent} />
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  brand: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: Colors.dark.text,
    marginTop: 20,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
    marginBottom: 48,
  },
  biometricWrap: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: Colors.dark.accent,
  },
  scanRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: Colors.dark.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.glass,
  },
  scanButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instruction: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.dark.textSecondary,
    marginTop: 24,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.dark.accentDim,
  },
  retryText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.dark.accent,
  },
});
