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

export const searchCarsForQrExportRequest = async (search = '') => {
  const response = await api.get('/cars/export/search', {
    params: {
      search,
    },
  });

  return response.data;
};

export const exportCarQrsPdfRequest = async ({ mode, carIds = [] }) => {
  const response = await api.post(
    '/cars/export-qrs',
    {
      mode,
      carIds,
    },
    {
      responseType: 'blob',
    }
  );

    return response.data;
};