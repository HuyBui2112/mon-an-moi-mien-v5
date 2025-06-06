import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../constants';
import { UserSavedRecipes } from '../types/savedRecipes';
import { SyncService } from './syncService';
import NetInfo from '@react-native-community/netinfo';
import { SyncQueueService } from './syncQueueService';

export const UserSavedRecipesService = {
  /**
   * Sync danh sách recipe IDs lên cloud
   */
  syncToCloud: async (
    userId: string,
    recipeIds: string[]
  ): Promise<boolean> => {
    try {
      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected) {
        await SyncQueueService.addToQueue({
          type: 'RECIPES',
          userId,
          data: recipeIds,
          timestamp: Date.now(),
        });
        return false;
      }

      const docRef = doc(db, COLLECTIONS.USER_SAVED_RECIPES, userId);
      const docSnap = await getDoc(docRef);
      const currentVersion = docSnap.exists() ? docSnap.data().version : 0;
      const currentData = docSnap.exists() ? docSnap.data() : {};

      await setDoc(
        docRef,
        {
          ...currentData,
          userId,
          recipeIds,
          updatedAt: Timestamp.now(),
          version: currentVersion + 1,
          lastSyncedAt: Timestamp.now(),
        },
        { merge: true }
      );

      return true;
    } catch (error) {
      console.error('Lỗi khi sync lên cloud:', error);
      return false;
    }
  },

  /**
   * Lấy danh sách recipe IDs từ cloud
   */
  getFromCloud: async (
    userId: string
  ): Promise<{
    recipeIds: string[];
    version: number;
  }> => {
    try {
      const docRef = doc(db, COLLECTIONS.USER_SAVED_RECIPES, userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserSavedRecipes;
        return {
          recipeIds: data.recipeIds,
          version: data.version,
        };
      }
      return {
        recipeIds: [],
        version: 0,
      };
    } catch (error) {
      console.error('Lỗi khi lấy data từ cloud:', error);
      return {
        recipeIds: [],
        version: 0,
      };
    }
  },

  /**
   * Kiểm tra xem user đã có document trên cloud chưa
   */
  checkCloudDocument: async (userId: string): Promise<boolean> => {
    try {
      const docRef = doc(db, COLLECTIONS.USER_SAVED_RECIPES, userId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (error) {
      console.error('Lỗi khi check cloud document:', error);
      return false;
    }
  },
};
