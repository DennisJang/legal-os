import React, { useRef } from 'react';
import { Animated, Pressable, Text, StyleSheet, ViewStyle, Easing } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'pill' | 'ghost';
  style?: ViewStyle;
  disabled?: boolean;
}

export default function AppleButton({ label, onPress, variant = 'primary', style, disabled }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // 🛡️ 관제탑 패치: Easing.linear 강제 주입으로 헌법 100% 직역
  const onPressIn = () => Animated.parallel([
    Animated.timing(scale,   { toValue: 0.96, duration: 100, easing: Easing.linear, useNativeDriver: true }),
    Animated.timing(opacity, { toValue: 0.8,  duration: 100, easing: Easing.linear, useNativeDriver: true }),
  ]).start();

  const onPressOut = () => Animated.parallel([
    Animated.timing(scale,   { toValue: 1, duration: 100, easing: Easing.linear, useNativeDriver: true }),
    Animated.timing(opacity, { toValue: 1, duration: 100, easing: Easing.linear, useNativeDriver: true }),
  ]).start();

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} disabled={disabled}>
      <Animated.View style={[s.base, s[variant], style, { transform: [{ scale }], opacity }]}>
        <Text style={[s.label, variant === 'pill' && s.pillLabel]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  base:      { alignItems: 'center', justifyContent: 'center' },
  primary:   { width: '100%', height: 56, backgroundColor: '#0071E3', borderRadius: 14 },
  pill:      { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#0071E3', borderRadius: 9999 },
  ghost:     { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: 'transparent' },
  label:     { color: '#FFFFFF', fontSize: 17, fontWeight: '600', letterSpacing: -0.374 },
  pillLabel: { fontSize: 13, fontWeight: '600', letterSpacing: 0 },
});