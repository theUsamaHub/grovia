import {
  AndroidImportance,
  setNotificationChannelAsync,
  getPermissionsAsync,
  requestPermissionsAsync,
  cancelScheduledNotificationAsync,
  scheduleNotificationAsync,
  SchedulableTriggerInputTypes,
} from 'expo-notifications';
import { Platform } from 'react-native';
import { reminderRequests, type Reminder } from './model';
export const supported = true;
export async function applySchedule(value: Reminder, askPermission = false) {
  const requests = reminderRequests(value);
  if (requests.length) {
    if (Platform.OS === 'android')
      await setNotificationChannelAsync('daily-focus', {
        name: 'Gentle focus reminders',
        importance: AndroidImportance.DEFAULT,
      });
    let permission = await getPermissionsAsync();
    if (!permission.granted && askPermission)
      permission = await requestPermissionsAsync();
    if (!permission.granted)
      throw Error(
        'Notifications are disabled. Allow Grovia notifications in device settings, then retry.',
      );
  }
  for (let day = 0; day < 7; day++)
    await cancelScheduledNotificationAsync('grovia-daily-' + day);
  for (const r of requests)
    await scheduleNotificationAsync({
      identifier: r.id,
      content: {
        title: 'A little room for focus',
        body: 'Choose one small intention when you are ready.',
        sound: 'default',
      },
      trigger: {
        type: SchedulableTriggerInputTypes.WEEKLY,
        weekday: r.weekday,
        hour: r.hour,
        minute: r.minute,
        channelId: 'daily-focus',
      },
    });
}
