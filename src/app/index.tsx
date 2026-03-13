import { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, Pressable, Linking } from "react-native";
import * as AC from "@bacons/apple-colors";
import { Stack, Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DrumPicker } from "@/components/drum-picker";

const SHORTCUT_NAME = "Set Expo Alarm";

function formatCountdown(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatTime12h(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
}

function formatTime24h(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatDate(date: Date) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return date.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

function formatDuration(hours: number, minutes: number) {
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export default function AlarmScreen() {
  const insets = useSafeAreaInsets();
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [alarmFireTime, setAlarmFireTime] = useState<Date | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = hours * 3600 + minutes * 60;
  const isSet = alarmFireTime !== null;

  useEffect(() => {
    if (!alarmFireTime) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    const tick = () => {
      const diff = Math.max(0, Math.round((alarmFireTime.getTime() - Date.now()) / 1000));
      setSecondsLeft(diff);
      if (diff === 0) {
        setAlarmFireTime(null);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    };
    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [alarmFireTime]);

  const setAlarm = useCallback(async () => {
    if (totalSeconds === 0) return;
    const fireDate = new Date(Date.now() + totalSeconds * 1000);
    const timeString = formatTime24h(fireDate);
    const url = `shortcuts://run-shortcut?name=${encodeURIComponent(SHORTCUT_NAME)}&input=text&text=${encodeURIComponent(timeString)}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      setAlarmFireTime(fireDate);
      await Linking.openURL(url);
    } else {
      await Linking.openURL("shortcuts://");
    }
  }, [totalSeconds]);

  const cancelAlarm = useCallback(() => setAlarmFireTime(null), []);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Alarm",
          headerRight: () => (
            <Link href="/setup" asChild>
              <Pressable hitSlop={12}>
                <Text style={{ fontSize: 15, color: AC.systemBlue as any }}>Setup</Text>
              </Pressable>
            </Link>
          ),
        }}
      />

      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: insets.bottom + 24,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Countdown ring */}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <View
            style={{
              width: 200,
              height: 200,
              borderRadius: 100,
              borderCurve: "continuous",
              borderWidth: 6,
              borderColor: isSet ? (AC.systemBlue as any) : (AC.systemGray4 as any),
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isSet
                ? "rgba(0,122,255,0.08)"
                : (AC.secondarySystemBackground as any),
            }}
          >
            <Text
              style={{
                fontSize: 38,
                fontWeight: "700",
                color: isSet ? (AC.systemBlue as any) : (AC.label as any),
                fontVariant: ["tabular-nums"],
                letterSpacing: -1,
              }}
            >
              {isSet ? formatCountdown(secondsLeft) : formatDuration(hours, minutes)}
            </Text>
            <Text style={{ fontSize: 13, color: AC.secondaryLabel as any, marginTop: 2 }}>
              {isSet ? "remaining" : "duration"}
            </Text>
          </View>
        </View>

        {/* Middle section: pickers or fire-time card */}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          {isSet && alarmFireTime ? (
            <View
              style={{
                backgroundColor: AC.secondarySystemBackground as any,
                borderRadius: 20,
                borderCurve: "continuous",
                paddingVertical: 20,
                paddingHorizontal: 40,
                alignItems: "center",
                gap: 4,
              }}
            >
              <Text style={{ fontSize: 13, color: AC.secondaryLabel as any }}>Alarm set for</Text>
              <Text style={{ fontSize: 36, fontWeight: "700", color: AC.label as any, letterSpacing: -0.5 }}>
                {formatTime12h(alarmFireTime)}
              </Text>
              <Text style={{ fontSize: 14, color: AC.secondaryLabel as any }}>
                {formatDate(alarmFireTime)}
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: "row", gap: 24 }}>
              <DrumPicker label="Hours" value={hours} min={0} max={23} onChange={setHours} />
              <DrumPicker label="Minutes" value={minutes} min={0} max={59} onChange={setMinutes} />
            </View>
          )}
        </View>

        {/* Action button */}
        {isSet ? (
          <Pressable
            onPress={cancelAlarm}
            style={({ pressed }) => ({
              backgroundColor: AC.systemRed as any,
              paddingVertical: 16,
              borderRadius: 16,
              borderCurve: "continuous",
              opacity: pressed ? 0.7 : 1,
              boxShadow: "0 4px 16px rgba(255,59,48,0.3)",
              width: "100%",
              alignItems: "center",
              gap: 2,
            })}
          >
            <Text style={{ fontSize: 17, fontWeight: "700", color: "#fff" }}>Cancel</Text>
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
              Does not remove the Clock alarm
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={setAlarm}
            disabled={totalSeconds === 0}
            style={({ pressed }) => ({
              backgroundColor: AC.systemBlue as any,
              paddingVertical: 16,
              borderRadius: 16,
              borderCurve: "continuous",
              opacity: totalSeconds === 0 ? 0.4 : pressed ? 0.7 : 1,
              boxShadow: "0 4px 20px rgba(0,122,255,0.35)",
              width: "100%",
              alignItems: "center",
              gap: 2,
            })}
          >
            <Text style={{ fontSize: 17, fontWeight: "700", color: "#fff" }}>
              Set Alarm  ⚡
            </Text>
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
              {totalSeconds > 0
                ? `Creates a Clock alarm in ${formatDuration(hours, minutes)}`
                : "Set a duration above"}
            </Text>
          </Pressable>
        )}
      </View>
    </>
  );
}
