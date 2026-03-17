import { useState, useMemo, useCallback } from 'react';
import { Pressable, View } from 'react-native';
import * as AC from '@bacons/apple-colors';
import { Stack, Link, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import {
  Host,
  List,
  Section,
  Toggle,
  Text,
  HStack,
  VStack,
  Spacer,
  Button,
  Stepper,
  LabeledContent,
  Divider,
} from '@expo/ui/swift-ui';
import {
  font,
  foregroundStyle,
  monospacedDigit,
  listRowInsets,
  tint,
  bold,
  frame,
  padding,
} from '@expo/ui/swift-ui/modifiers';
import {
  useAlarms,
  updateAlarm,
  addAlarm,
  formatAlarmTime,
  formatAmPm,
  formatRepeat,
  type Alarm,
} from '@/components/alarm-store';

/** Compute wake-up Date given sleep duration from now */
function computeWakeTime(hours: number, minutes: number): Date {
  const now = new Date();
  return new Date(now.getTime() + (hours * 60 + minutes) * 60 * 1000);
}

function formatTime(date: Date): string {
  const h = date.getHours() % 12 || 12;
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function formatAmPmDate(date: Date): string {
  return date.getHours() < 12 ? 'AM' : 'PM';
}

function AlarmRow({ alarm }: { alarm: Alarm }) {
  const router = useRouter();
  const timeStr = formatAlarmTime(alarm);
  const ampm = formatAmPm(alarm);
  const repeatStr = formatRepeat(alarm.repeatDays);

  return (
    <Toggle
      isOn={alarm.enabled}
      onIsOnChange={(on) => updateAlarm(alarm.id, { enabled: on })}
      modifiers={[listRowInsets({ top: 10, bottom: 10, leading: 16, trailing: 16 })]}
    >
      <HStack spacing={0} alignment="center">
        <Pressable onPress={() => router.push({ pathname: '/edit', params: { id: alarm.id } })}>
          <VStack spacing={1}>
            <HStack spacing={3} alignment="lastTextBaseline">
              <Text
                modifiers={[
                  font({ size: 46, weight: 'thin' }),
                  monospacedDigit(),
                  foregroundStyle(alarm.enabled ? 'primary' : 'secondary'),
                ]}
              >
                {timeStr}
              </Text>
              <Text
                modifiers={[
                  font({ size: 18, weight: 'regular' }),
                  foregroundStyle(alarm.enabled ? 'primary' : 'secondary'),
                ]}
              >
                {ampm}
              </Text>
            </HStack>
            <Text
              modifiers={[
                font({ size: 14 }),
                foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
              ]}
            >
              {alarm.label}
              {repeatStr !== 'Never' ? `  ·  ${repeatStr}` : ''}
            </Text>
          </VStack>
        </Pressable>
        <Spacer />
      </HStack>
    </Toggle>
  );
}

export default function AlarmListScreen() {
  const alarms = useAlarms();
  const sorted = [...alarms].sort(
    (a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute)
  );

  const [sleepHours, setSleepHours] = useState(7);
  const [sleepMins, setSleepMins] = useState(0);

  const wakeDate = useMemo(
    () => computeWakeTime(sleepHours, sleepMins),
    [sleepHours, sleepMins]
  );

  const setAlarm = useCallback(() => {
    addAlarm({
      hour: wakeDate.getHours(),
      minute: wakeDate.getMinutes(),
      label: 'Sleep Alarm',
      enabled: true,
      repeatDays: [],
      sound: 'Radar',
    });
  }, [wakeDate]);

  const sleepLabel =
    sleepMins > 0 ? `${sleepHours}h ${sleepMins}m` : `${sleepHours} hours`;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Next Alarm',
          headerLargeTitle: true,
          headerRight: () => (
            <Link href={{ pathname: '/edit' }} asChild>
              <Pressable hitSlop={12}>
                <Image
                  source="sf:plus"
                  style={{ width: 22, height: 22, color: AC.systemBlue as any }}
                />
              </Pressable>
            </Link>
          ),
        }}
      />

      <View style={{ flex: 1 }}>
        <Host useViewportSizeMeasurement style={{ flex: 1 }}>
          <List>
            {/* ── Sleep Timer ── */}
            <Section
              header={
                <Text modifiers={[font({ size: 13, weight: 'semibold' })]}>SLEEP TIMER</Text>
              }
            >
              <Stepper
                label="Hours"
                defaultValue={sleepHours}
                min={1}
                max={12}
                step={1}
                onValueChanged={setSleepHours}
              />
              <Stepper
                label="Minutes"
                defaultValue={sleepMins}
                min={0}
                max={45}
                step={15}
                onValueChanged={setSleepMins}
              />

              <LabeledContent label="Wake up at">
                <HStack spacing={4} alignment="lastTextBaseline">
                  <Text
                    modifiers={[
                      font({ size: 34, weight: 'light' }),
                      monospacedDigit(),
                      tint('#007AFF'),
                      foregroundStyle('#007AFF'),
                    ]}
                  >
                    {formatTime(wakeDate)}
                  </Text>
                  <Text
                    modifiers={[
                      font({ size: 16, weight: 'regular' }),
                      foregroundStyle('#007AFF'),
                    ]}
                  >
                    {formatAmPmDate(wakeDate)}
                  </Text>
                </HStack>
              </LabeledContent>

              <Button
                onPress={setAlarm}
                modifiers={[frame({ maxWidth: 9999 }), tint('#007AFF')]}
              >
                <HStack spacing={6}>
                  <Text modifiers={[foregroundStyle('#FFFFFF'), font({ weight: 'semibold' })]}>
                    {'alarm.fill'}
                  </Text>
                  <Text modifiers={[foregroundStyle('#FFFFFF'), font({ size: 16, weight: 'semibold' })]}>
                    Sleep for {sleepLabel}
                  </Text>
                </HStack>
              </Button>
            </Section>

            {/* ── Alarm List ── */}
            {sorted.length > 0 && (
              <Section
                header={
                  <Text modifiers={[font({ size: 13, weight: 'semibold' })]}>MY ALARMS</Text>
                }
              >
                {sorted.map((alarm) => (
                  <AlarmRow key={alarm.id} alarm={alarm} />
                ))}
              </Section>
            )}
          </List>
        </Host>
      </View>
    </>
  );
}
