import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Recipe } from '../../types';
import { createStyles } from './RecipeCard.styles';
import { useTheme } from '../../theme/ThemeContext';
import { ImageViewerModal } from '../shared';
import { ImageCacheService } from '../../services/imageCacheService';
import { Typography } from '../shared';
import {
  InstructionsSection,
  RecipeHeader,
  RecipeMeta,
  RecipeIngredients,
  RecipeActions,
  RecipeReviews,
} from './components';

interface Props {
  recipe: Recipe;
  onSave?: () => Promise<boolean>;
  onDelete?: (recipe: Recipe) => void;
  showActions?: boolean;
  showReviews?: boolean;
  mode?: 'compact' | 'detailed';
}

export function RecipeCard({
  recipe,
  onSave,
  onDelete,
  showActions = false,
  showReviews = false,
  mode = 'compact',
}: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [showDetails, setShowDetails] = useState(mode === 'detailed');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showImageViewer, setShowImageViewer] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      if (recipe.image) {
        const url = await ImageCacheService.getImageUrl(recipe.image);
        setImageUrl(url);
      }
    };
    loadImage();
  }, [recipe.image]);

  const getCategoryInfo = () => {
    if (recipe.category === 'vegetarian') {
      return {
        icon: 'leaf-outline' as const,
        color: '#4CAF50',
        text: 'Chay',
        bgColor: 'rgba(76, 175, 80, 0.9)',
      };
    }
    return {
      icon: 'restaurant-outline' as const,
      color: '#FF5722',
      text: 'Mặn',
      bgColor: 'rgba(255, 87, 34, 0.9)',
    };
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => setShowImageViewer(true)}>
        <Image
          source={imageUrl || require('../../../assets/default-avatar.png')}
          style={styles.image}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />

        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: getCategoryInfo().bgColor },
          ]}
        >
          <View style={styles.categoryIcon}>
            <Ionicons name={getCategoryInfo().icon} size={16} color="#FFFFFF" />
          </View>
          <Typography style={styles.categoryText}>
            {getCategoryInfo().text}
          </Typography>
        </View>
      </TouchableOpacity>

      <ImageViewerModal
        visible={showImageViewer}
        imageUrl={imageUrl}
        onClose={() => setShowImageViewer(false)}
      />

      <View style={styles.content}>
        <RecipeHeader
          recipe={recipe}
          showDetails={showDetails}
          onToggleDetails={() => setShowDetails(!showDetails)}
          mode={mode}
        />

        <View style={styles.metaContainer}>
          <RecipeMeta recipe={recipe} />
        </View>

        {showActions && (
          <View
            style={[
              styles.actionsContainer,
              { marginBottom: theme.spacing.md },
            ]}
          >
            <RecipeActions
              recipe={recipe}
              onSave={onSave}
              onDelete={onDelete}
            />
          </View>
        )}

        {showDetails && (
          <View style={styles.details}>
            <RecipeIngredients ingredients={recipe.ingredients} />
            <InstructionsSection
              instructions={recipe.instructions}
              defaultExpanded={mode === 'detailed'}
            />
          </View>
        )}
        {showReviews && (
          <View style={styles.reviewsContainer}>
            <RecipeReviews recipe={recipe} />
          </View>
        )}
      </View>
    </View>
  );
}
