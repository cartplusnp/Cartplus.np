import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CategoryBrowsingRecord } from '../types';
import { CATEGORIES } from '../data/categories';
import { useToast } from './ToastContext';

interface BrowsingHistoryContextType {
  history: CategoryBrowsingRecord[];
  topCategories: CategoryBrowsingRecord[];
  recordCategoryVisit: (categorySlug: string, categoryName?: string) => void;
  removeCategory: (categorySlug: string) => void;
  clearHistory: () => void;
  addCategoryInterest: (categorySlug: string) => void;
  hasHistory: boolean;
}

const STORAGE_KEY = 'cartplus-category-history';

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

  const { success, info } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  const recordCategoryVisit = (categorySlug: string, categoryName?: string) => {
    if (!categorySlug) return;
    const normalizedSlug = categorySlug.toLowerCase().trim();

    // Look up proper category name if not provided
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
        // Sort by last viewed
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
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } catch {
      // ignore
    }
    info('Browsing history cleared. Recommendations reset.');
  };

  // Compute top categories ranked by a combination of viewCount and recency
  const topCategories = [...history].sort((a, b) => {
    const timeA = new Date(a.lastViewedAt).getTime();
    const timeB = new Date(b.lastViewedAt).getTime();
    // Scoring: 1 view = 100 points, recency decay over 24 hrs
    const scoreA = a.viewCount * 100 + timeA / 1000000;
    const scoreB = b.viewCount * 100 + timeB / 1000000;
    return scoreB - scoreA;
  });

  return (
    <BrowsingHistoryContext.Provider
      value={{
        history,
        topCategories,
        recordCategoryVisit,
        removeCategory,
        clearHistory,
        addCategoryInterest,
        hasHistory: history.length > 0,
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
