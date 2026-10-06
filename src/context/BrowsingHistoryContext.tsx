import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CategoryBrowsingRecord } from '../types';
import { CATEGORIES } from '../data/categories';
import { useToast } from './ToastContext';

interface BrowsingHistoryContextType {
  history: CategoryBrowsingRecord[];
  topCategories: CategoryBrowsingRecord[];
  recentProductIds: string[];
  recordCategoryVisit: (categorySlug: string, categoryName?: string) => void;
  recordProductVisit: (productId: string) => void;
  removeCategory: (categorySlug: string) => void;
  clearHistory: () => void;
  addCategoryInterest: (categorySlug: string) => void;
  hasHistory: boolean;
}

const STORAGE_KEY = 'cartplus-category-history';
const RECENT_PRODUCTS_KEY = 'cartplus-recent-product-ids';

const BrowsingHistoryContext = createContext<BrowsingHistoryContextType | undefined>(undefined);

export const BrowsingHistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<CategoryBrowsingRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [recentProductIds, setRecentProductIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_PRODUCTS_KEY);
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [];
  });

  const { info } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem(RECENT_PRODUCTS_KEY, JSON.stringify(recentProductIds));
    } catch {
      // ignore
    }
  }, [recentProductIds]);

  const recordCategoryVisit = (categorySlug: string, categoryName?: string) => {
    if (!categorySlug) return;
    const normalizedSlug = categorySlug.toLowerCase().trim();

    const resolvedName =
      categoryName ||
      CATEGORIES.find((c) => c.slug.toLowerCase() === normalizedSlug)?.name ||
      normalizedSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    setHistory((prev) => {
      const existingIndex = prev.findIndex((item) => item.categorySlug.toLowerCase() === normalizedSlug);
      const now = new Date().toISOString();

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          categoryName: resolvedName,
          viewCount: updated[existingIndex].viewCount + 1,
          lastViewedAt: now,
        };
        return updated.sort((a, b) => new Date(b.lastViewedAt).getTime() - new Date(a.lastViewedAt).getTime());
      } else {
        const newRecord: CategoryBrowsingRecord = {
          categorySlug: normalizedSlug,
          categoryName: resolvedName,
          viewCount: 1,
          lastViewedAt: now,
        };
        return [newRecord, ...prev];
      }
    });
  };

  const recordProductVisit = (productId: string) => {
    if (!productId) return;
    setRecentProductIds((prev) => {
      const filtered = prev.filter((id) => id !== productId);
      return [productId, ...filtered].slice(0, 12);
    });
  };

  const addCategoryInterest = (categorySlug: string) => {
    const matchedCategory = CATEGORIES.find((c) => c.slug.toLowerCase() === categorySlug.toLowerCase());
    recordCategoryVisit(categorySlug, matchedCategory?.name);
    info(`Added "${matchedCategory?.name || categorySlug}" to your interest feed.`);
  };

  const removeCategory = (categorySlug: string) => {
    const normalizedSlug = categorySlug.toLowerCase();
    setHistory((prev) => prev.filter((item) => item.categorySlug.toLowerCase() !== normalizedSlug));
    info('Category removed from your recommendation preferences.');
  };

  const clearHistory = () => {
    setHistory([]);
    setRecentProductIds([]);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      localStorage.setItem(RECENT_PRODUCTS_KEY, JSON.stringify([]));
    } catch {
      // ignore
    }
    info('Browsing history cleared. Recommendations reset.');
  };

  const topCategories = [...history].sort((a, b) => {
    const timeA = new Date(a.lastViewedAt).getTime();
    const timeB = new Date(b.lastViewedAt).getTime();
    const scoreA = a.viewCount * 100 + timeA / 1000000;
    const scoreB = b.viewCount * 100 + timeB / 1000000;
    return scoreB - scoreA;
  });

  return (
    <BrowsingHistoryContext.Provider
      value={{
        history,
        topCategories,
        recentProductIds,
        recordCategoryVisit,
        recordProductVisit,
        removeCategory,
        clearHistory,
        addCategoryInterest,
        hasHistory: history.length > 0 || recentProductIds.length > 0,
      }}
    >
      {children}
    </BrowsingHistoryContext.Provider>
  );
};

export const useBrowsingHistory = () => {
  const context = useContext(BrowsingHistoryContext);
  if (!context) {
    throw new Error('useBrowsingHistory must be used within a BrowsingHistoryProvider');
  }
  return context;
};
