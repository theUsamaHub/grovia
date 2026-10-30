import {
  AndroidImportance,
  setNotificationChannelAsync,
  requestPermissionsAsync,
  cancelScheduledNotificationAsync,
  scheduleNotificationAsync,
  SchedulableTriggerInputTypes,
} from 'expo-notifications';
import { Platform } from 'react-native';
import { elapsed, type FocusState } from './engine';
const identifier = 'grovia-focus-completion';
export async function requestReminderPermission() {
  if (Platform.OS === 'android')
    await setNotificationChannelAsync('focus', {
      name: 'Focus completion',
      importance: AndroidImportance.DEFAULT,
    });
  const permission = await requestPermissionsAsync();
  return permission.granted;
}
export async function syncReminder(state: FocusState) {
  await cancelScheduledNotificationAsync(identifier);
  const s = state.active;
  if (!state.reminders || !s || s.anchorMs === null || s.mode === 'stopwatch')
    return;
  const remaining = s.durationMs - elapsed(s, Date.now());
  if (remaining <= 0) return;
  await scheduleNotificationAsync({
    identifier,
    content: {
      title:
        s.kind === 'break' ? 'Your break is complete' : 'A little more growth',
      body:
        s.kind === 'break'
          ? 'Ready for another moment of focus?'
          : 'Your focus session is complete. Time for a gentle break.',
      sound: 'default',
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DATE,
      date: new Date(Date.now() + remaining),
      channelId: 'focus',
    },
  });
}
