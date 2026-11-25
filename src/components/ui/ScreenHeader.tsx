import { Colors, Spacing } from "@/constants/theme";
import { ReactNode } from "react";
import { Image, ImageSourcePropType, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  subtitle?: string;
  icon?: ImageSourcePropType;
  left?: ReactNode;
  right?: ReactNode;
};

export default function ScreenHeader({
  title,
  subtitle,
  icon,
  left,
  right,
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.titleRow}>
        {left}
        {icon ? <Image source={icon} style={styles.icon} /> : null}
        <View style={styles.texts}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Spacing.lg,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  texts: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 14,
    color: Colors.textMuted,
  },
  icon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
});
