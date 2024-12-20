import React from 'react';
import { View, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Typography } from '../shared';
import { useTheme } from '../../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { createStyles } from './ReviewsList.styles';
import { Review } from '../../types';

// Props interface cho ReviewsList
interface ReviewsListProps {
  recipeId: string;
  reviews: Review[];
  averageRating?: number;
  totalReviews?: number;
}

// ReviewsList component
export const ReviewsList = ({
  recipeId,
  reviews,
  averageRating,
  totalReviews,
}: ReviewsListProps) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  // Hàm render sao đánh giá
  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Ionicons
        key={index}
        name={index < rating ? 'star' : 'star-outline'}
        size={16}
        color={theme.colors.warning.main}
        style={{ marginRight: theme.spacing.xs }}
      />
    ));
  };

  // Nếu không có đánh giá nào, hiển thị thông báo
  if (reviews.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="chatbubble-outline"
          size={64}
          color={theme.colors.text.secondary}
        />
        <Typography variant="subtitle1" style={{ marginTop: theme.spacing.md }}>
          Chưa có đánh giá nào
        </Typography>
        <Typography
          variant="body2"
          color="secondary"
          style={{ marginTop: theme.spacing.sm }}
        >
          Hãy là người đầu tiên đánh giá món ăn này!
        </Typography>
      </View>
    );
  }

  // Nếu có đánh giá, hiển thị danh sách đánh giá
  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= (averageRating || 0) ? 'star' : 'star-outline'}
              size={20}
              color={theme.colors.warning.main}
              style={{ marginRight: 4 }}
            />
          ))}
          <Typography
            variant="subtitle1"
            style={{ marginLeft: 8, fontWeight: 'bold' }}
          >
            {averageRating?.toFixed(1) || '0.0'} ({totalReviews} đánh giá)
          </Typography>
        </View>
      </View>

      {reviews.map((review) => (
        <View key={review.id} style={styles.reviewContainer}>
          <View style={styles.userInfoContainer}>
            {review.userInfo?.photoURL ? (
              <Image
                source={{ uri: review.userInfo.photoURL }}
                style={styles.userAvatar}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <Ionicons
                name="person-circle"
                size={40}
                color={theme.colors.primary.main}
                style={{ marginRight: theme.spacing.sm }}
              />
            )}
            <View>
              <Typography variant="subtitle2">
                {review.userInfo?.displayName || 'Người dùng'}
              </Typography>
              <Typography variant="caption" color="secondary">
                {review.userInfo?.email}
              </Typography>
            </View>
          </View>

          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {renderStars(review.rating)}
            </View>
            <Typography
              variant="caption"
              color="secondary"
              style={styles.dateText}
            >
              {new Date(review.createdAt.seconds * 1000).toLocaleDateString(
                'vi-VN'
              )}
            </Typography>
          </View>

          <Typography variant="body2">{review.comment}</Typography>
        </View>
      ))}
    </ScrollView>
  );
};
