import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../constants';
import { Recipe } from '../types';
import { CacheService } from './cacheService';
import { RecipeService } from './recipeService';
import { Timestamp } from 'firebase/firestore';
import NetInfo from '@react-native-community/netinfo';
import { SyncQueueService } from './syncQueueService';

const COOKING_RECIPES_KEY = (userId: string) => `cooking_recipes_${userId}`;

export const CookingRecipesService = {
  // Lưu danh sách công thức đang nấu
  saveCookingRecipes: async (
    userId: string,
    recipes: Recipe[]
  ): Promise<boolean> => {
    try {
      // Lưu vào AsyncStorage
      await AsyncStorage.setItem(
        COOKING_RECIPES_KEY(userId),
        JSON.stringify(recipes)
      );

      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected) {
        await SyncQueueService.addToQueue({
          type: 'COOKING_RECIPES',
          userId,
          data: recipes,
          timestamp: Date.now(),
        });
        return true;
      }

      // Sync lên cloud
      const recipeIds = recipes.map((r) => r.id);
      const docRef = doc(db, COLLECTIONS.USER_SAVED_RECIPES, userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        await setDoc(
          docRef,
          {
            ...data,
            cookingRecipeIds: recipeIds,
            updatedAt: Timestamp.now(),
            version: (data.version || 0) + 1,
          },
          { merge: true }
        );
      } else {
        // Tạo document mới nếu chưa tồn tại
        await setDoc(docRef, {
          userId,
          recipeIds: [],
          cookingRecipeIds: recipeIds,
          updatedAt: Timestamp.now(),
          version: 1,
          lastSyncedAt: Timestamp.now(),
        });
      }

      return true;
    } catch (error) {
      console.error('Lỗi khi lưu công thức đang nấu:', error);
      return false;
    }
  },

  // Lấy danh sách công thức đang nấu
  getCookingRecipes: async (userId: string): Promise<Recipe[]> => {
    try {
      // Lấy cả local và cloud data
      const localData = await AsyncStorage.getItem(COOKING_RECIPES_KEY(userId));
      const localRecipes = localData ? JSON.parse(localData) : [];

      const docRef = doc(db, COLLECTIONS.USER_SAVED_RECIPES, userId);
      const docSnap = await getDoc(docRef);

      let cloudRecipes: Recipe[] = [];
      if (docSnap.exists() && docSnap.data().cookingRecipeIds) {
        const recipeIds = docSnap.data().cookingRecipeIds;
        const recipes = await Promise.all(
          recipeIds.map((id: string) => RecipeService.getRecipeById(id))
        );
        cloudRecipes = recipes.filter((r) => r !== null) as Recipe[];
      }

      // Merge recipes từ cả 2 nguồn
      const mergedRecipes = [...localRecipes];
      cloudRecipes.forEach((cloudRecipe) => {
        if (
          !mergedRecipes.some(
            (localRecipe) => localRecipe.id === cloudRecipe.id
          )
        ) {
          mergedRecipes.push(cloudRecipe);
        }
      });

      // Lưu merged data vào local
      await AsyncStorage.setItem(
        COOKING_RECIPES_KEY(userId),
        JSON.stringify(mergedRecipes)
      );

      return mergedRecipes;
    } catch (error) {
      console.error('Lỗi khi lấy công thức đang nấu:', error);
      return [];
    }
  },

  removeCookingRecipe: async (
    userId: string,
    recipeId: string
  ): Promise<boolean> => {
    try {
      // 1. Xóa local
      const localData = await AsyncStorage.getItem(COOKING_RECIPES_KEY(userId));
      const recipes = localData ? JSON.parse(localData) : [];
      const updatedRecipes = recipes.filter((r: Recipe) => r.id !== recipeId);

      await AsyncStorage.setItem(
        COOKING_RECIPES_KEY(userId),
        JSON.stringify(updatedRecipes)
      );

      // 2. Kiểm tra kết nối
      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected) {
        await SyncQueueService.addToQueue({
          type: 'REMOVE_COOKING_RECIPE',
          userId,
          data: { recipeId },
          timestamp: Date.now(),
        });
        return true;
      }

      // 3. Sync với cloud
      const docRef = doc(db, COLLECTIONS.USER_SAVED_RECIPES, userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const cookingRecipeIds = data.cookingRecipeIds || [];

        await setDoc(
          docRef,
          {
            ...data,
            cookingRecipeIds: cookingRecipeIds.filter(
              (id: string) => id !== recipeId
            ),
            updatedAt: Timestamp.now(),
            version: (data.version || 0) + 1,
          },
          { merge: true }
        );
      }

      return true;
    } catch (error) {
      console.error('Lỗi khi xóa công thức đang nấu:', error);
      return false;
    }
  },
};
