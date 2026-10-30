import type { Reminder } from './model';
export const supported = false;
export async function applySchedule(value: Reminder, _askPermission = false) {
  if (value.enabled)
    throw Error(
      'Scheduled reminders are available in the Android and iOS app.',
    );
}
