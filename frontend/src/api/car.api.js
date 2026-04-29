import api from './axios';

export const getCarsRequest = async () => {
    const response = await api.get('/cars');
    return response.data;
};

export const getCarByIdRequest = async (id) => {
    const response = await api.get(`/cars/${id}`);
    return response.data;
};

export const getCarByQrValueRequest = async (qrValue) => {
    const response = await api.get(`/cars/qr/${qrValue}`);
    return response.data;
};