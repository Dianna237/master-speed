import { DefaultBodyType } from "@/types";
import { FC } from "react";
import { View } from "react-native";
import { styles } from "./styles";

const DefaultBody: FC<DefaultBodyType> = ({ extra_header, children }) => {
  return (
    <>
      {extra_header ? (
      <View style={styles.extra_header_style}>{children}</View>
      ) : (
        <View style={styles.container}>{children}</View>
      )}
    </>
  );
};

export default DefaultBody;
