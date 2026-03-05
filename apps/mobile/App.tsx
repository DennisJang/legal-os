// apps/mobile/App.tsx
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import ContractScanner from './src/components/ContractScanner';
import { useLocalPush } from './src/hooks/useLocalPush';

// 🛡️ 패치: shouldShowBanner + shouldShowList 필드 추가 (신형 SDK 필수)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  useLocalPush();
  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="light" />
      <ContractScanner />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
});