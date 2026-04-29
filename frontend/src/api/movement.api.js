import api from './axios';

export const registerMovementRequest = async (movementData) => {
    const response = await api.post('/movements/register', movementData);
    return response.data;
};

export const getMovementRequest = async () => {
    const response = await api.get('/movements');
    return response.data;
};

export const getMovementsByCarIdRequest = async (carId) => {
    const response = await api.get(`/movements/car/${carId}`);
    return response.data;
};