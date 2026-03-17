import { useState, useCallback } from 'react';
import { Pressable } from 'react-native';
import * as AC from '@bacons/apple-colors';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  Host,
  Form,
  Section,
  DatePicker,
  TextField,
  Picker,
  Text,
  Button,
  Toggle,
  HStack,
  Spacer,
  Image,
} from '@expo/ui/swift-ui';
import {
  datePickerStyle,
  pickerStyle,
  font,
  foregroundStyle,
  labelsHidden,
  frame,
  opacity,
  tint,
} from '@expo/ui/swift-ui/modifiers';
import { tag } from '@expo/ui/swift-ui/modifiers';
import {
  getAlarm,
  addAlarm,
  updateAlarm,
  deleteAlarm,
  DAY_NAMES,
  SOUNDS,
} from '@/components/alarm-store';

function timeToDate(hour: number, minute: number): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

export default function EditAlarmScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const existing = id ? getAlarm(id) : undefined;
  const isNew = !existing;

  const [selectedDate, setSelectedDate] = useState<Date>(
    timeToDate(existing?.hour ?? 8, existing?.minute ?? 0)
  );
  const [label, setLabel] = useState(existing?.label ?? 'Alarm');
  const [repeatDays, setRepeatDays] = useState<number[]>(existing?.repeatDays ?? []);
  const [sound, setSound] = useState(existing?.sound ?? 'Radar');
  const [snooze, setSnooze] = useState(true);

  const save = useCallback(() => {
    const hour = selectedDate.getHours();
    const minute = selectedDate.getMinutes();
    if (isNew) {
      addAlarm({ hour, minute, label, repeatDays, sound, enabled: true });
    } else {
      updateAlarm(id!, { hour, minute, label, repeatDays, sound });
    }
    router.back();
  }, [selectedDate, label, repeatDays, sound, isNew, id]);

  const remove = useCallback(() => {
    if (id) deleteAlarm(id);
    router.back();
  }, [id]);

  const toggleDay = useCallback((day: number) => {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          title: isNew ? 'Add Alarm' : 'Edit Alarm',
          presentation: 'modal',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Text style={{ fontSize: 17, color: AC.systemBlue as any }}>Cancel</Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={save} hitSlop={12}>
              <Text style={{ fontSize: 17, fontWeight: '600', color: AC.systemBlue as any }}>
                Save
              </Text>
            </Pressable>
          ),
        }}
      />

      <Host useViewportSizeMeasurement style={{ flex: 1 }}>
        <Form>
          {/* Time picker */}
          <Section>
            <DatePicker
              selection={selectedDate}
              displayedComponents={['hourAndMinute']}
              onDateChange={setSelectedDate}
              modifiers={[datePickerStyle('wheel'), labelsHidden(), frame({ maxWidth: 9999 })]}
            />
          </Section>

          {/* Label */}
          <Section title="Label">
            <TextField defaultValue={label} placeholder="Alarm" onChangeText={setLabel} />
          </Section>

          {/* Repeat — checkmark rows for each day */}
          <Section title="Repeat">
            {DAY_NAMES.map((name, day) => {
              const selected = repeatDays.includes(day);
              return (
                <Button key={day} onPress={() => toggleDay(day)}>
                  <HStack>
                    <Text>{name}</Text>
                    <Spacer />
                    <Image
                      systemName="checkmark"
                      color="#007AFF"
                      modifiers={[opacity(selected ? 1 : 0), tint('#007AFF')]}
                    />
                  </HStack>
                </Button>
              );
            })}
          </Section>

          {/* Sound */}
          <Section title="Sound">
            <Picker
              label="Sound"
              selection={sound}
              onSelectionChange={(s) => setSound(s as string)}
              modifiers={[pickerStyle('navigationLink')]}
            >
              {SOUNDS.map((s) => (
                <Text key={s} modifiers={[tag(s)]}>
                  {s}
                </Text>
              ))}
            </Picker>
          </Section>

          {/* Snooze */}
          <Section>
            <Toggle label="Snooze" isOn={snooze} onIsOnChange={setSnooze} />
          </Section>

          {/* Delete (edit only) */}
          {!isNew && (
            <Section>
              <Button
                label="Delete Alarm"
                role="destructive"
                onPress={remove}
                modifiers={[frame({ maxWidth: 9999 })]}
              />
            </Section>
          )}
        </Form>
      </Host>
    </>
  );
}
