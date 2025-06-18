import colors from '@/theme/colors';
import spacing from '@/theme/spacing';
import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.white,
    flex: 1,
  },
  extra_header_style: {
    flex: 1,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
  },
});
