import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';

interface Props {
  width: number;
  height?: number;
  showTitle?: boolean;
  showRating?: boolean;
  minTitleHeight?: number;
  minRatingHeight?: number;
}

export const RecipeGridItemSkeleton = ({
  width,
  height = width * 1.2,
  showTitle = true,
  showRating = true,
  minTitleHeight = 40,
  minRatingHeight = 25,
}: Props) => {
  const { theme } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const styles = createStyles(theme, width, height);

  return (
    <View style={[styles.container, { width }]}>
      <Animated.View style={[styles.image, { opacity, height: width }]} />

      {showTitle && (
        <View style={[styles.content, { minHeight: minTitleHeight }]}>
          <Animated.View style={[styles.title, { opacity }]} />
        </View>
      )}

      {showRating && (
        <View style={[styles.ratingContainer, { minHeight: minRatingHeight }]}>
          <Animated.View style={[styles.rating, { opacity }]} />
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: any, width: number, height: number) =>
  StyleSheet.create({
    container: {
      width,
      height,
      backgroundColor: theme.colors.background.paper,
      borderRadius: theme.spacing.md,
      overflow: 'hidden',
      ...theme.shadows.sm,
    },
    image: {
      width: '100%',
      height: width,
      backgroundColor: theme.isDark ? '#2A2A2A' : '#E1E9EE',
    },
    content: {
      padding: theme.spacing.sm,
    },
    title: {
      height: 16,
      backgroundColor: theme.isDark ? '#2A2A2A' : '#E1E9EE',
      borderRadius: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
    },
    region: {
      height: 12,
      backgroundColor: theme.isDark ? '#2A2A2A' : '#E1E9EE',
      borderRadius: theme.spacing.xs,
      width: '60%',
      marginBottom: theme.spacing.xs,
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    rating: {
      height: 16,
      width: '30%',
      backgroundColor: theme.isDark ? '#2A2A2A' : '#E1E9EE',
      borderRadius: theme.spacing.xs,
    },
    time: {
      height: 16,
      width: '25%',
      backgroundColor: theme.isDark ? '#2A2A2A' : '#E1E9EE',
      borderRadius: theme.spacing.xs,
    },
    ratingContainer: {
      padding: theme.spacing.sm,
      minHeight: 25,
    },
  });
