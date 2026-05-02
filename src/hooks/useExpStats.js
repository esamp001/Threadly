/**
 * Custom hook for fetching and managing user EXP statistics
 * This is used to provide EXP data to components throughout the application
 */
import { useCallback, useEffect, useState } from 'react';
import apiRequest from '../config/api';
import eventEmitter from '../utils/eventEmitter';
import { getExpProgress } from '../utils/rankingHelpers';

/**
 * Hook for fetching and managing user EXP statistics
 * Wrapped in useCallback to memoize the refresh function,
 * preventing unnecessary re-creation on every render.
 *
 * Useful when:
 * - Components need current EXP data
 * - Real-time updates after user actions
 * - Calculating progress to next level
 *
 * Behavior:
 * - Fetches EXP stats from backend API
 * - Calculates progress using utility functions
 * - Provides loading and error states
 * - Caches data to minimize API calls
 *
 * Dependencies:
 * - apiRequest: For making authenticated API calls
 * - getExpProgress: For calculating level progression
 *
 * Hooks used:
 * - useState, useEffect, useCallback
 */
const useExpStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch EXP statistics from backend
   * This is used to get current user EXP, level, and daily progress
   */
  const fetchExpStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiRequest('/api/exp/stats');
      const result = await response.json();

      if (response.ok && result.success) {
        const expData = result.stats;

        // Calculate progress to next level
        const progress = getExpProgress(expData.currentLevel, expData.currentExp);

        setStats({
          ...expData,
          progress
        });
      } else {
        setError(result.error || 'Failed to fetch EXP stats');
      }
    } catch (err) {
      console.error('Error fetching EXP stats:', err);
      setError('Failed to fetch EXP stats');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch stats on component mount
  useEffect(() => {
    fetchExpStats();
  }, [fetchExpStats]);

  // Listen for real-time EXP updates
  useEffect(() => {
    const unsubscribe = eventEmitter.on('exp-updated', () => {
      fetchExpStats();
    });

    return unsubscribe;
  }, [fetchExpStats]);

  return {
    stats,
    loading,
    error,
    refreshStats: fetchExpStats
  };
};

export default useExpStats;
