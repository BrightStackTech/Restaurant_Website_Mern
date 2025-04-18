import api from './config';

export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getUserGrowthStats = async (period: string = 'month') => {
  const response = await api.get(`/admin/user-growth?period=${period}`);
  return response.data;
};