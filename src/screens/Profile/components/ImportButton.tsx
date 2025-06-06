import React, { useState } from 'react';
import {
  TouchableOpacity,
  Modal,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Typography } from '../../../components/shared';
import { useTheme } from '../../../theme/ThemeContext';
import { db } from '../../../config/firebase';
import {
  doc,
  writeBatch,
  Timestamp,
  collection,
  getDocs,
} from 'firebase/firestore';
import { COLLECTIONS } from '../../../constants';
import { regions } from '../../../data/regions/index';
import { useToast } from '../../../hooks/useToast';

export function ImportButton() {
  const { theme } = useTheme();
  const [isImporting, setIsImporting] = useState(false);
  const { showToast } = useToast();

  // Dialog xác nhận đầu tiên
  const showFirstConfirmation = () => {
    Alert.alert(
      'Cảnh báo Reset Database',
      'Hành động này sẽ xóa toàn bộ dữ liệu recipes và hình ảnh hiện tại, sau đó import lại từ đầu. Bạn có chắc chắn muốn tiếp tục?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Tiếp tục',
          style: 'destructive',
          onPress: showSecondConfirmation,
        },
      ]
    );
  };

  // Dialog xác nhận lần cuối
  const showSecondConfirmation = () => {
    Alert.alert(
      'Xác nhận lần cuối',
      'Đây là thao tác không thể hoàn tác. Tất cả dữ liệu recipes và hình ảnh sẽ bị reset. Bạn thực sự muốn tiếp tục?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Reset & Import',
          style: 'destructive',
          onPress: handleImportData,
        },
      ]
    );
  };

  // Xử lý import dữ liệu
  const handleImportData = async () => {
    setIsImporting(true);
    try {
      const batch = writeBatch(db);

      // 1. Lấy danh sách tất cả recipeStats hiện tại
      const statsSnapshot = await getDocs(
        collection(db, COLLECTIONS.RECIPE_STATS)
      );
      const existingStatsIds = new Set(statsSnapshot.docs.map((doc) => doc.id));

      // 2. Tạo Set chứa ID của tất cả recipes sẽ import
      const newRecipeIds = new Set();

      // 3. Import regions và recipes
      for (const region of regions) {
        const { recipes: regionRecipes, ...regionData } = region;

        // Tạo document cho region với timestamp
        const regionRef = doc(db, COLLECTIONS.REGIONS, region.id);
        batch.set(regionRef, {
          ...regionData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        // Import từng recipe của region
        for (const recipe of regionRecipes) {
          newRecipeIds.add(recipe.id);

          // Chuẩn bị dữ liệu recipe với các trường mới
          const recipeData = {
            ...recipe,
            regionId: region.id,
            cookingTime: recipe.cookingTime || 0,
            difficulty: recipe.difficulty || 0,
            servings: recipe.servings || 0,
            category: recipe.category || 'non-vegetarian', // Thêm phân loại chay/mặn
            ingredients: recipe.ingredients.map((ingredient) => ({
              ...ingredient,
              type: ingredient.type || 'other', // Đảm bảo có type cho ingredient
            })),
            instructions: {
              preparation: recipe.instructions.preparation || [],
              processing: recipe.instructions.processing || [],
              marinating: recipe.instructions.marinating || [],
              broth: recipe.instructions.broth || [],
              sauce: recipe.instructions.sauce || [],
              cooking: recipe.instructions.cooking || [],
              steaming: recipe.instructions.steaming || [],
              filling: recipe.instructions.filling || [],
              dough: recipe.instructions.dough || [],
              assembly: recipe.instructions.assembly || [],
              serving: recipe.instructions.serving || [],
              tips: recipe.instructions.tips || [],
              storage: recipe.instructions.storage || [],
            },
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          };

          // Tạo recipe document
          const recipeRef = doc(db, COLLECTIONS.RECIPES, recipe.id);
          batch.set(recipeRef, recipeData);

          // Chỉ tạo mới recipeStats nếu chưa tồn tại
          if (!existingStatsIds.has(recipe.id)) {
            const recipeStatsRef = doc(db, COLLECTIONS.RECIPE_STATS, recipe.id);
            batch.set(recipeStatsRef, {
              recipeId: recipe.id,
              averageRating: 0,
              totalReviews: 0,
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
            });
          }
        }
      }

      // 4. Xóa recipeStats của những recipe không còn tồn tại
      for (const statsId of existingStatsIds) {
        if (!newRecipeIds.has(statsId)) {
          const statsRef = doc(db, COLLECTIONS.RECIPE_STATS, statsId);
          batch.delete(statsRef);
        }
      }

      await batch.commit();
      showToast('success', 'Import dữ liệu thành công', {
        duration: 2000,
        position: 'bottom',
        immediate: true,
      });
    } catch (error) {
      console.error('Lỗi khi import dữ liệu:', error);
      showToast('error', 'Lỗi khi import dữ liệu', {
        duration: 3000,
        position: 'bottom',
        immediate: true,
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[
          {
            backgroundColor: theme.colors.primary.main,
            padding: theme.spacing.md,
            borderRadius: theme.spacing.sm,
            alignItems: 'center',
            ...theme.shadows.sm,
          },
        ]}
        onPress={showFirstConfirmation}
        disabled={isImporting}
      >
        <Typography
          variant="body1"
          style={{ color: theme.colors.primary.contrast }}
        >
          Import Dữ Liệu
        </Typography>
      </TouchableOpacity>

      <Modal transparent={true} visible={isImporting} animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.background.paper,
              padding: theme.spacing.lg,
              borderRadius: theme.spacing.md,
              alignItems: 'center',
              ...theme.shadows.md,
            }}
          >
            <ActivityIndicator size="large" color={theme.colors.primary.main} />
            <Typography variant="body1" style={{ marginTop: theme.spacing.md }}>
              Đang import dữ liệu...
            </Typography>
          </View>
        </View>
      </Modal>
    </>
  );
}
