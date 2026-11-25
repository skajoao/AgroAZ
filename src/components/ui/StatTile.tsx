import { Colors, Radius, Spacing } from "@/constants/theme";
import { Image, ImageSourcePropType, StyleSheet, Text, View } from "react-native";

type Props = {
  label: string;
  value: string | number;
  icon?: ImageSourcePropType;
};

export default function StatTile({ label, value, icon }: Props) {
  return (
    <View style={styles.tile}>
      {icon ? (
        <View style={styles.iconWrap}>
          <Image source={icon} style={styles.icon} />
        </View>
      ) : null}
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexGrow: 1,
    flexBasis: "45%",
    minWidth: 140,
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: "flex-start",
    gap: 4,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  icon: {
    width: 18,
    height: 18,
    resizeMode: "contain",
  },
  value: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.primary,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textMuted,
  },
});
