import { useState, useCallback } from 'react';
import { urlService } from '../services/api';

export const useUrls = () => {
  const [urls, setUrls] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUrls = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await urlService.getAll(params);
      setUrls(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUrl = useCallback(async (data) => {
    const res = await urlService.create(data);
    return res.data.data;
  }, []);

  const deleteUrl = useCallback(async (id) => {
    await urlService.delete(id);
    setUrls((prev) => prev.filter((u) => u._id !== id));
  }, []);

  const toggleUrl = useCallback(async (id) => {
    const res = await urlService.toggle(id);
    setUrls((prev) =>
      prev.map((u) => (u._id === id ? { ...u, isActive: res.data.data.isActive } : u))
    );
  }, []);

  return { urls, pagination, loading, error, fetchUrls, createUrl, deleteUrl, toggleUrl };
};
