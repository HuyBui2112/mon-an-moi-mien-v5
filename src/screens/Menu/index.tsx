import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Loading } from '../../components/shared';
import { MenuSearchBar } from './components/MenuSearchBar';
import { useMenuData } from './hooks/useMenuData';
import { useRecipeFilter, TabFilterOptions } from './hooks/useRecipeFilter';
import { RecipeList } from './components/RecipeList';
import { Ionicons } from '@expo/vector-icons';
import { useGridZoom } from './hooks/useGridZoom';
import { createStyles } from './styles';
import { ZoomControls } from './components/ZoomControls';
import { Typography } from '../../components/shared/Typography';
import { removeRecipe } from '../../utils/storage';
import { useToast } from '../../hooks/useToast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchHistoryService } from '../../services/searchHistoryService';
import { useAuth } from '../../context/AuthContext';
import { FilterModal } from './components/FilterModal';
import { FilterOptions } from './types';
import { RecipeGridListSkeleton } from '../../components/recipe/components/RecipeGridListSkeleton';
import { Recipe } from '../../types';
import { TabBar, TabType } from './components/TabBar';

export default function MenuScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets);
  const { showToast } = useToast();
  const { user } = useAuth();
  const { savedRecipes } = useMenuData();

  const {
    isRefreshing,
    isLoading,
    setIsLoading,
    refreshSavedRecipes,
    handleDeleteRecipe,
  } = useMenuData();

  const {
    regions,
    refreshFavorites,
    filterOptions,
    setFilterOptions,
    filteredRecipes,
    sections,
    searchQuery,
    updateSearchQuery,
    favoriteRecipes,
    addToCooking,
    isRecipeInCooking,
    removeFromCooking,
    activeTab,
    setActiveTab,
  } = useRecipeFilter(savedRecipes);

  const {
    currentConfig,
    calculateItemWidth,
    zoomIn,
    zoomOut,
    canZoomIn,
    canZoomOut,
  } = useGridZoom();

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(
    new Set()
  );
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempFilterOptions, setTempFilterOptions] =
    useState<FilterOptions>(filterOptions);

  const activeFiltersCount = [
    filterOptions.region,
    filterOptions.category,
    filterOptions.difficulty,
    filterOptions.cookingTime.min || filterOptions.cookingTime.max,
    filterOptions.servings.min || filterOptions.servings.max,
    filterOptions.mainIngredientTypes.length > 0,
  ].filter(Boolean).length;

  const hasActiveFilters = useMemo(() => {
    return (
      filterOptions.searchQuery ||
      filterOptions.region ||
      filterOptions.showFavorites ||
      filterOptions.category ||
      filterOptions.difficulty ||
      filterOptions.cookingTime.min ||
      filterOptions.cookingTime.max ||
      filterOptions.servings.min ||
      filterOptions.servings.max ||
      filterOptions.mainIngredientTypes.length > 0
    );
  }, [filterOptions, activeTab]);

  const cookingRecipesCount = useMemo(() => {
    return filteredRecipes.filter(
      (item) => item.visible && isRecipeInCooking(item.recipe.id)
    ).length;
  }, [filteredRecipes, isRecipeInCooking]);

  const savedRecipesCount = useMemo(() => {
    return filteredRecipes.filter((item) => item.visible).length;
  }, [filteredRecipes]);

  const visibleSections = useMemo(() => {
    return sections;
  }, [sections, activeTab]);

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    const history = await SearchHistoryService.getSearchHistory();
    setRecentSearches(history);
  };

  const handleSaveSearch = async (search: string) => {
    if (search.trim()) {
      await SearchHistoryService.saveSearch(search);
      await loadSearchHistory();
    }
  };

  const enterSelectionMode = useCallback((recipeId: string) => {
    console.log('Entering selection mode with recipe:', recipeId);
    setIsSelectionMode(true);
    setSelectedRecipes(new Set([recipeId]));
  }, []);

  const exitSelectionMode = useCallback(() => {
    console.log('Exiting selection mode');
    setIsSelectionMode(false);
    setSelectedRecipes(new Set());
  }, []);

  const toggleSelectRecipe = useCallback(
    (recipeId: string) => {
      console.log('Toggling recipe selection:', recipeId);
      setSelectedRecipes((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(recipeId)) {
          newSet.delete(recipeId);
          if (newSet.size === 0) {
            exitSelectionMode();
          }
        } else {
          newSet.add(recipeId);
        }
        return newSet;
      });
    },
    [exitSelectionMode]
  );

  const handleDeleteSelected = async () => {
    if (!user) {
      showToast('error', 'Bạn cần đăng nhập để xóa công thức');
      return;
    }

    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa ${selectedRecipes.size} công thức đã chọn?`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              for (const recipeId of selectedRecipes) {
                await removeRecipe(recipeId, user.uid);
              }
              await refreshSavedRecipes();
              showToast('success', 'Đã xóa các công thức đã chọn');
              exitSelectionMode();
            } catch (error) {
              console.error('Lỗi khi xóa công thức:', error);
              showToast('error', 'Không thể xóa một số công thức');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCloseFilterModal = () => {
    setTempFilterOptions(filterOptions);
    setShowFilterModal(false);
  };

  const handleApplyFilter = (newFilterOptions: FilterOptions) => {
    setFilterOptions(newFilterOptions);
  };

  const handleAddToCooking = useCallback(
    (recipe: Recipe) => {
      addToCooking(recipe);
    },
    [addToCooking]
  );

  const handleRemoveFromCooking = useCallback(
    (recipe: Recipe) => {
      removeFromCooking(recipe);
    },
    [removeFromCooking]
  );

  const handleZoomChange = useCallback(() => {
    setFilterOptions((prev) => ({
      cooking: { ...prev.cooking },
      saved: { ...prev.saved },
    }));
  }, [setFilterOptions]);

  console.log('Filtered recipes in MenuScreen:', filteredRecipes.length);
  console.log('Active filters:', hasActiveFilters);

  console.log('Rendering RecipeList with:', {
    totalRecipes: filteredRecipes.length,
    visibleRecipes: filteredRecipes.filter((item) => item.visible).length,
  });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background.default,
      }}
    >
      {user && (
        <>
          <View style={styles.headerControls}>
            <View style={styles.searchBarContainer}>
              <MenuSearchBar
                value={searchQuery}
                onChangeText={updateSearchQuery}
                placeholder="Tìm theo tên hoặc nguyên liệu..."
                onSubmitEditing={() => {}}
                recentSearches={[]}
              />
            </View>

            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilterModal(true)}
            >
              <Ionicons
                name="options-outline"
                size={24}
                color={theme.colors.text.primary}
              />
              {activeFiltersCount > 0 && (
                <View style={styles.filterBadge}>
                  <Typography variant="caption" style={styles.filterBadgeText}>
                    {activeFiltersCount}
                  </Typography>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <TabBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            cookingCount={cookingRecipesCount}
            savedCount={savedRecipesCount}
          />

          <FilterModal
            visible={showFilterModal}
            onClose={() => setShowFilterModal(false)}
            filterOptions={filterOptions}
            onFilterChange={setFilterOptions}
            onApply={handleApplyFilter}
            regions={regions}
            activeTab={activeTab}
          />
        </>
      )}

      {isSelectionMode && (
        <View style={styles.selectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={exitSelectionMode}
              style={styles.selectionButton}
            >
              <Ionicons
                name="close"
                size={20}
                color={theme.colors.error.main}
              />
            </TouchableOpacity>
            <Typography
              variant="h3"
              style={[styles.selectionText, { marginLeft: theme.spacing.md }]}
            >
              Đã chọn{' '}
              <Typography variant="h3" style={styles.selectionCount}>
                {selectedRecipes.size}
              </Typography>{' '}
              công thức
            </Typography>
          </View>
          <TouchableOpacity
            onPress={handleDeleteSelected}
            disabled={selectedRecipes.size === 0}
            style={[
              styles.deleteButton,
              selectedRecipes.size === 0 && { opacity: 0.5 },
            ]}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={theme.colors.background.paper}
            />
          </TouchableOpacity>
        </View>
      )}

      {isLoading && (
        <RecipeGridListSkeleton
          config={currentConfig}
          calculateItemWidth={calculateItemWidth}
        />
      )}

      {isLoading ? (
        <Loading text="Đang tải..." />
      ) : (
        <>
          <RecipeList
            isRefreshing={isRefreshing}
            isLoading={isLoading}
            filteredRecipes={filteredRecipes}
            savedRecipes={savedRecipes}
            onRefresh={refreshSavedRecipes}
            onDeleteRecipe={handleDeleteRecipe}
            currentConfig={currentConfig}
            calculateItemWidth={calculateItemWidth}
            onFavoriteChange={refreshFavorites}
            isSelectionMode={isSelectionMode}
            selectedRecipes={selectedRecipes}
            onLongPress={(recipeId) => enterSelectionMode(recipeId)}
            onToggleSelect={toggleSelectRecipe}
            isAuthenticated={!!user}
            isSaved={true}
            sections={visibleSections}
            onAddToCooking={handleAddToCooking}
            isRecipeInCooking={isRecipeInCooking}
            onRemoveFromCooking={handleRemoveFromCooking}
            activeTab={activeTab}
          />
          {user && (
            <ZoomControls
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              canZoomIn={canZoomIn}
              canZoomOut={canZoomOut}
              onZoomChange={handleZoomChange}
            />
          )}
        </>
      )}

      {hasActiveFilters && (
        <Typography
          variant="caption"
          style={{
            marginTop: theme.spacing.sm,
            color: theme.colors.text.secondary,
          }}
        >
          Tìm thấy {filteredRecipes.filter((item) => item.visible).length} công
          thức
        </Typography>
      )}
    </View>
  );
}
