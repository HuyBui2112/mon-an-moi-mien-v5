import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PinnedFiltersMap, QuickFilterType } from '../types';
import { useToast } from '../../../hooks/useToast';

// Key để lưu settings vào AsyncStorage
const PINNED_FILTERS_STORAGE_KEY = '@menu_pinned_filters';

// Default settings cho các filter
const defaultPinnedFilters: PinnedFiltersMap = {
  region: { enabled: true, order: 0 }, // Region filter mặc định được ghim
  difficulty: { enabled: false, order: 1 },
  cookTime: { enabled: false, order: 2 },
  servings: { enabled: false, order: 3 },
  dietType: { enabled: false, order: 4 },
};

// Thêm constant cho số lượng filter tối đa được phép ghim
const MAX_PINNED_FILTERS = 2;

interface PinnedFiltersContextType {
  // Settings của các filter
  pinnedFilters: PinnedFiltersMap;
  // Toggle pin/unpin một filter
  togglePinnedFilter: (type: QuickFilterType['type']) => void;
  // Thay đổi thứ tự hiển thị của các filter
  updateFilterOrder: (type: QuickFilterType['type'], newOrder: number) => void;
  // Reset về settings mặc định
  resetToDefault: () => void;
  // Thêm prop mới
  canPinMore: boolean;
}

const PinnedFiltersContext = createContext<
  PinnedFiltersContextType | undefined
>(undefined);

export const PinnedFiltersProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { showToast } = useToast();
  const [pinnedFilters, setPinnedFilters] =
    useState<PinnedFiltersMap>(defaultPinnedFilters);

  // Load settings từ storage khi component mount
  useEffect(() => {
    const loadPinnedFilters = async () => {
      try {
        const stored = await AsyncStorage.getItem(PINNED_FILTERS_STORAGE_KEY);
        if (stored) {
          setPinnedFilters(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading pinned filters:', error);
      }
    };
    loadPinnedFilters();
  }, []);

  // Lưu settings vào storage mỗi khi có thay đổi
  useEffect(() => {
    const savePinnedFilters = async () => {
      try {
        await AsyncStorage.setItem(
          PINNED_FILTERS_STORAGE_KEY,
          JSON.stringify(pinnedFilters)
        );
      } catch (error) {
        console.error('Error saving pinned filters:', error);
      }
    };
    savePinnedFilters();
  }, [pinnedFilters]);

  // Thêm hàm kiểm tra số lượng filter đang được ghim
  const getEnabledFiltersCount = () => {
    return Object.values(pinnedFilters).filter((filter) => filter.enabled)
      .length;
  };

  // Thêm computed value để kiểm tra có thể ghim thêm không
  const canPinMore = getEnabledFiltersCount() < MAX_PINNED_FILTERS;

  // Sửa lại hàm togglePinnedFilter để kiểm tra điều kiện
  const togglePinnedFilter = (type: QuickFilterType['type']) => {
    const isCurrentlyEnabled = pinnedFilters[type].enabled;

    // Nếu đang tắt và muốn bật, kiểm tra số lượng
    if (!isCurrentlyEnabled && !canPinMore) {
      showToast(
        'error',
        `Bạn chỉ được ghim tối đa ${MAX_PINNED_FILTERS} bộ lọc`
      );
      return;
    }

    setPinnedFilters((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        enabled: !prev[type].enabled,
      },
    }));
  };

  const updateFilterOrder = (
    type: QuickFilterType['type'],
    newOrder: number
  ) => {
    setPinnedFilters((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        order: newOrder,
      },
    }));
  };

  const resetToDefault = () => {
    setPinnedFilters(defaultPinnedFilters);
  };

  return (
    <PinnedFiltersContext.Provider
      value={{
        pinnedFilters,
        togglePinnedFilter,
        updateFilterOrder,
        resetToDefault,
        canPinMore,
      }}
    >
      {children}
    </PinnedFiltersContext.Provider>
  );
};

// Custom hook để sử dụng context
export const usePinnedFilters = () => {
  const context = useContext(PinnedFiltersContext);
  if (context === undefined) {
    throw new Error(
      'usePinnedFilters must be used within a PinnedFiltersProvider'
    );
  }
  return context;
};