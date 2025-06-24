import { StatusBar, View, useColorScheme } from "react-native";
import { getColors } from "@/theme/colors";

const DefaultHeader = () => {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme === "dark" ? "dark" : "light");
  return (
    <View>
      <StatusBar
        backgroundColor={colors.primary}
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />
    </View>
  );
};

export default DefaultHeader;
