import api from './axios';

export const importCarsFromFileRequest = async (file, onProgress) => {
    if(!file) {
        throw new Error('Debes seleccionar un archivo para importar.');
    }

    const formData = new FormData();

    formData.append('file', file);

    const response = await api.post('/import/cars', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
            if (!progressEvent.total || onProgress){
                return;
            }

            const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
            );

            onProgress(progress);
        },
    });

    return response.data;
};