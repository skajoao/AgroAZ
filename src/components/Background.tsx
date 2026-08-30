import { ImageBackground, StyleSheet, View } from "react-native";

export default function Background({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ImageBackground
      source={require("../assets/wallpaper.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(26, 25, 25, 0.14)",
  },
});
