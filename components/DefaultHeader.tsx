import colors from "@/theme/colors";
import { StatusBar, View } from "react-native";

const DefaultHeader = () => {
  return (
    <View>
      <StatusBar
        backgroundColor={colors.darkPrimary}
        barStyle="light-content"
      />
    </View>
  );
};

export default DefaultHeader;
