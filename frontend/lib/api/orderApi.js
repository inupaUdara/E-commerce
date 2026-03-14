import client from './client';

export const getAllOrders = async () => {
    const response = await client.get('/orders');
    return response.data;
};

export const createOrder = async (orderData) => {
    const response = await client.post('/orders', orderData);
    return response.data;
};

export const getOrdersByUserId = async (userId) => {
    const response = await client.get(`/orders/user/${userId}`);
    return response.data;
};

export const getOrdersByStoreId = async (storeId) => {
    const response = await client.get(`/orders/store/${storeId}`);
    return response.data;
};

export const updateOrder = async (orderId, updateData) => {
    const response = await client.patch(`/orders/${orderId}`, updateData);
    return response.data;
};

export const getOrderById = async (orderId) => {
    const response = await client.get(`/orders/${orderId}`);
    return response.data;
};

export default {
    getAllOrders,
    createOrder,
    getOrdersByUserId,
    getOrdersByStoreId,
    updateOrder,
    getOrderById,
};