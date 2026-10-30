export type Reminder = {
  enabled: boolean;
  hour: number;
  minute: number;
  days: number[];
};
export const defaultReminder: Reminder = {
  enabled: false,
  hour: 9,
  minute: 0,
  days: [1, 2, 3, 4, 5],
};
export function validateReminder(value: Reminder) {
  if (
    !Number.isInteger(value.hour) ||
    value.hour < 0 ||
    value.hour > 23 ||
    !Number.isInteger(value.minute) ||
    value.minute < 0 ||
    value.minute > 59 ||
    value.days.some((d) => !Number.isInteger(d) || d < 0 || d > 6) ||
    new Set(value.days).size !== value.days.length ||
    (value.enabled && !value.days.length)
  )
    throw Error('Choose a time from 00:00 to 23:59 and at least one day.');
  return value;
}
export function reminderRequests(value: Reminder) {
  validateReminder(value);
  return value.enabled
    ? value.days.map((day) => ({
        id: 'grovia-daily-' + day,
        weekday: day + 1,
        hour: value.hour,
        minute: value.minute,
      }))
    : [];
}
