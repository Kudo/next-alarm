import { useRef, useCallback, useEffect } from "react";
import { ScrollView, View, Text, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import * as AC from "@bacons/apple-colors";

const ITEM_HEIGHT = 52;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const PADDING = ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2);

interface DrumPickerProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}

export function DrumPicker({ label, value, min, max, onChange }: DrumPickerProps) {
  const scrollRef = useRef<ScrollView>(null);
  const isMounted = useRef(false);
  const items = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  useEffect(() => {
    const t = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: (value - min) * ITEM_HEIGHT, animated: false });
      isMounted.current = true;
    }, 80);
    return () => clearTimeout(t);
  }, []);

  const onMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(items.length - 1, index));
      onChange(min + clamped);
    },
    [min, items.length, onChange]
  );

  return (
    <View style={{ alignItems: "center", gap: 10 }}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: AC.secondaryLabel as any,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Text>

      <View
        style={{
          height: PICKER_HEIGHT,
          width: 90,
          borderRadius: 16,
          borderCurve: "continuous",
          backgroundColor: AC.secondarySystemBackground as any,
          overflow: "hidden",
        }}
      >
        {/* Selection highlight */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: PADDING,
            left: 8,
            right: 8,
            height: ITEM_HEIGHT,
            borderRadius: 10,
            borderCurve: "continuous",
            backgroundColor: AC.tertiarySystemBackground as any,
            zIndex: 1,
          }}
        />

        {/* Top fade */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: PADDING,
            zIndex: 2,
            overflow: "hidden",
          }}
        >
          {[0.9, 0.65, 0.4, 0.2, 0.05].map((opacity, i) => (
            <View
              key={i}
              style={{ flex: 1, backgroundColor: AC.secondarySystemBackground as any, opacity }}
            />
          ))}
        </View>

        {/* Bottom fade */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: PADDING,
            zIndex: 2,
            overflow: "hidden",
            flexDirection: "column-reverse",
          }}
        >
          {[0.9, 0.65, 0.4, 0.2, 0.05].map((opacity, i) => (
            <View
              key={i}
              style={{ flex: 1, backgroundColor: AC.secondarySystemBackground as any, opacity }}
            />
          ))}
        </View>

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onMomentumScrollEnd={onMomentumEnd}
          contentContainerStyle={{ paddingVertical: PADDING }}
          scrollEventThrottle={16}
        >
          {items.map((item) => (
            <View
              key={item}
              style={{ height: ITEM_HEIGHT, alignItems: "center", justifyContent: "center" }}
            >
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: item === value ? "700" : "400",
                  color: item === value ? (AC.label as any) : (AC.tertiaryLabel as any),
                  fontVariant: ["tabular-nums"],
                }}
              >
                {String(item).padStart(2, "0")}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
