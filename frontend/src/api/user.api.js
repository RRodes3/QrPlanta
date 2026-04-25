import api from './axios';

export const getUsersRequest = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const createUserRequest = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

export const deleteUserRequest = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};