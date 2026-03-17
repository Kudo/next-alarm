import { useState, useEffect } from 'react';

export type Alarm = {
  id: string;
  hour: number;
  minute: number;
  label: string;
  enabled: boolean;
  repeatDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  sound: string;
};

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const SOUNDS = ['Radar', 'Apex', 'Bulletin', 'By the Seaside', 'Chimes', 'Circuit', 'Constellation', 'Hillside', 'Night Owl', 'Opening', 'Playtime', 'Presto', 'Ripples', 'Sencha', 'Signal', 'Silk', 'Slow Rise', 'Stargaze', 'Summit', 'Twinkle', 'Uplift', 'Xylophone'];

let alarms: Alarm[] = [
  {
    id: '1',
    hour: 6,
    minute: 30,
    label: 'Wake Up',
    enabled: true,
    repeatDays: [1, 2, 3, 4, 5],
    sound: 'Radar',
  },
  {
    id: '2',
    hour: 8,
    minute: 0,
    label: 'Morning',
    enabled: false,
    repeatDays: [],
    sound: 'Radar',
  },
  {
    id: '3',
    hour: 22,
    minute: 45,
    label: 'Sleep Reminder',
    enabled: true,
    repeatDays: [0, 1, 2, 3, 4, 5, 6],
    sound: 'Slow Rise',
  },
];

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

export function subscribeAlarms(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAlarms(): Alarm[] {
  return alarms;
}

export function getAlarm(id: string): Alarm | undefined {
  return alarms.find((a) => a.id === id);
}

export function addAlarm(alarm: Omit<Alarm, 'id'>) {
  alarms = [...alarms, { ...alarm, id: Date.now().toString() }];
  notify();
}

export function updateAlarm(id: string, updates: Partial<Alarm>) {
  alarms = alarms.map((a) => (a.id === id ? { ...a, ...updates } : a));
  notify();
}

export function deleteAlarm(id: string) {
  alarms = alarms.filter((a) => a.id !== id);
  notify();
}

export function useAlarms(): Alarm[] {
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    return subscribeAlarms(() => forceUpdate((n) => n + 1));
  }, []);
  return alarms;
}

export function formatAlarmTime(alarm: Pick<Alarm, 'hour' | 'minute'>): string {
  const h = alarm.hour % 12 || 12;
  const m = String(alarm.minute).padStart(2, '0');
  return `${h}:${m}`;
}

export function formatAmPm(alarm: Pick<Alarm, 'hour'>): string {
  return alarm.hour < 12 ? 'AM' : 'PM';
}

export function formatRepeat(repeatDays: number[]): string {
  if (repeatDays.length === 0) return 'Never';
  if (repeatDays.length === 7) return 'Every Day';
  const weekdays = [1, 2, 3, 4, 5];
  const weekend = [0, 6];
  if (weekdays.every((d) => repeatDays.includes(d)) && repeatDays.length === 5) return 'Weekdays';
  if (weekend.every((d) => repeatDays.includes(d)) && repeatDays.length === 2) return 'Weekends';
  return repeatDays
    .sort()
    .map((d) => DAY_NAMES[d])
    .join(', ');
}
