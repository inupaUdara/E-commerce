import client from './client';

export const createAddress = async (addressData) => {
    const response = await client.post('/addresses', addressData);
    return response.data;
};

export const getMyAddresses = async () => {
    const response = await client.get('/addresses/user');
    return response.data;
};

export const getAddressById = async (addressId) => {
    const response = await client.get(`/addresses/${addressId}`);
    return response.data;
};

export default {
    createAddress,
    getMyAddresses,
    getAddressById,
};