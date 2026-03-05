// apps/mobile/src/hooks/useLocalPush.ts
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

async function scheduleLocalPush() {
  // 실기기 아닌 에뮬레이터 방어
  if (!Device.isDevice) return;

  // 권한 요청
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  // Android 알림 채널 설정
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('wage-nudge', {
      name: '출퇴근 기록 알림',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  // 멱등성 헌법: 중복 알림 원천 차단
  await Notifications.cancelAllScheduledNotificationsAsync();

  // 매일 아침 9시
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '오늘 출근하셨나요? ☀️',
      body: '출퇴근 기록 1초 만에 남기고 내 월급을 보호하세요 💰',
      sound: true,
      ...(Platform.OS === 'android' && { channelId: 'wage-nudge' }),
    },
    trigger: {
  type: Notifications.SchedulableTriggerInputTypes.DAILY,
  hour: 9,
  minute: 0,
},
  });

  // 매일 저녁 18시
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '오늘 하루도 고생하셨습니다! 🌙',
      body: '퇴근 버튼 누르고 오늘의 합법 예상 급여를 확인하세요 💸',
      sound: true,
      ...(Platform.OS === 'android' && { channelId: 'wage-nudge' }),
    },
   trigger: {
  type: Notifications.SchedulableTriggerInputTypes.DAILY,
  hour: 18,
  minute: 0,
},
  });
}

export function useLocalPush() {
  useEffect(() => { scheduleLocalPush(); }, []);
}