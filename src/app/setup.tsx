import { View, Text, Pressable, ScrollView, Linking } from "react-native";
import * as AC from "@bacons/apple-colors";
import { Stack } from "expo-router";

const SHORTCUT_NAME = "Set Expo Alarm";

const STEPS = [
  { num: "1", text: 'Open the Shortcuts app and tap "+" to create a new shortcut.' },
  { num: "2", text: 'Search for and add the "Set Alarm" action. Set the time source to "Shortcut Input".' },
  { num: "3", text: `Name the shortcut exactly: "${SHORTCUT_NAME}" — spelling and capitalization must match.` },
  { num: "4", text: 'Tap "Done". Go back and tap "Set Alarm" to create real Clock app alarms.' },
];

export default function SetupScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Shortcut Setup", presentation: "modal" }} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: 20, gap: 16 }}
      >
        <Text style={{ fontSize: 15, color: AC.secondaryLabel as any, lineHeight: 22 }}>
          This app uses an iOS Shortcut to create real system alarms in the Clock app.
          Complete the one-time setup below to get started.
        </Text>

        <View
          style={{
            backgroundColor: AC.secondarySystemBackground as any,
            borderRadius: 16,
            borderCurve: "continuous",
            overflow: "hidden",
          }}
        >
          {STEPS.map((step, i) => (
            <View key={step.num}>
              {i > 0 && (
                <View style={{ height: 0.5, backgroundColor: AC.separator as any, marginLeft: 56 }} />
              )}
              <View style={{ flexDirection: "row", gap: 12, padding: 16, alignItems: "flex-start" }}>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: AC.systemBlue as any,
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}>{step.num}</Text>
                </View>
                <Text style={{ fontSize: 15, color: AC.label as any, flex: 1, lineHeight: 22 }}>
                  {step.text}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Pressable
          onPress={() => Linking.openURL("shortcuts://")}
          style={({ pressed }) => ({
            backgroundColor: AC.systemBlue as any,
            paddingVertical: 16,
            borderRadius: 16,
            borderCurve: "continuous",
            alignItems: "center",
            opacity: pressed ? 0.7 : 1,
            boxShadow: "0 4px 20px rgba(0,122,255,0.3)",
          })}
        >
          <Text style={{ fontSize: 17, fontWeight: "600", color: "#fff" }}>
            Open Shortcuts App
          </Text>
        </Pressable>

        <Text style={{ fontSize: 13, color: AC.tertiaryLabel as any, textAlign: "center", lineHeight: 18 }}>
          The shortcut name must match exactly — the app passes the alarm time as text input.
        </Text>
      </ScrollView>
    </>
  );
}
