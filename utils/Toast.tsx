import Toast from 'react-native-toast-message';
import { fonts, fontWeight } from '../theme/fonts';

type ToastProp = {
  type: string;
  text1: string;
  text2: string;
};

export const showToast = (props: ToastProp) => {
  Toast.show({
    type: props.type,
    text1: props.text1,
    text2: props.text2,
    text1Style: {
      fontSize: fonts.md,
      fontWeight: fontWeight.bold,
    },
    text2Style: {
      fontSize: fonts.sm,
      fontWeight: fontWeight.regular,
    },
  });
};
