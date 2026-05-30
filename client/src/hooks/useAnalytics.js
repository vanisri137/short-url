import { useState, useEffect } from 'react';
import { urlService } from '../services/api';

export const useAnalytics = (refreshTrigger) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await urlService.getAnalytics();
        setAnalytics(res.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [refreshTrigger]);

  return { analytics, loading, error };
};
