import { StatusBar, View } from "react-native";
import { useTheme } from "./ThemeProvider";

const DefaultHeader = () => {
  const { isDark, colors } = useTheme();

  return (
    <View>
      <StatusBar
        backgroundColor={colors.primary}
        barStyle={isDark ? "light-content" : "dark-content"}
      />
    </View>
  );
};

export default DefaultHeader;
