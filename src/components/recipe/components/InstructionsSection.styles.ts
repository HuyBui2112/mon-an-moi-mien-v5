import { StyleSheet } from 'react-native';
import { Theme } from '../../../theme/ThemeContext';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    instructionsContainer: {
      backgroundColor: theme.colors.background.paper,
      borderRadius: theme.spacing.md,
      padding: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
    sectionTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    sectionIcon: {
      marginRight: theme.spacing.sm,
    },
    instructionSection: {
      borderRadius: theme.spacing.md,
      overflow: 'hidden',
      backgroundColor: theme.colors.background.default,
      ...theme.shadows.sm,
    },
    instructionSectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderTopLeftRadius: theme.spacing.md,
      borderTopRightRadius: theme.spacing.md,
    },
    instructionSectionIcon: {
      marginRight: theme.spacing.sm,
    },
    instructionSectionTitle: {
      ...theme.typography.subtitle1,
      color: theme.colors.primary.main,
      fontWeight: '600',
    },
    instructionSteps: {
      backgroundColor: theme.colors.background.default,
    },
    instructionItem: {
      flexDirection: 'row',
      padding: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    instructionNumber: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.primary.main,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.sm,
      ...theme.shadows.xs,
    },
    instructionNumberText: {
      color: theme.colors.primary.contrast,
      fontSize: 12,
      fontWeight: 'bold',
    },
    instructionContent: {
      flex: 1,
    },
    instructionText: {
      flex: 1,
      color: theme.colors.text.secondary,
      fontSize: 14,
      lineHeight: 20,
    },
  });