import client from './client';

/**
 * Store API functions
 */

// Create a new store
export const createStore = async (storeData) => {
    const response = await client.post('/stores', storeData);
    return response.data;
};

// Get store by user ID
export const getStoreByUserId = async (userId) => {
    const response = await client.get(`/stores/user/${userId}`);
    return response.data;
};

// Get current user's store
export const getMyStore = async () => {
    const response = await client.get('/stores/my-store');
    return response.data;
};

// Get store by ID
export const getStoreById = async (storeId) => {
    const response = await client.get(`/stores/${storeId}`);
    return response.data;
};

// Get store by username
export const getStoreByUsername = async (username) => {
    const response = await client.get(`/stores/username/${username}`);
    return response.data;
};

// Get all stores
export const getAllStores = async () => {
    const response = await client.get('/stores');
    return response.data;
};

// Get stores by status
export const getStoresByStatus = async (status) => {
    const response = await client.get(`/stores/status/${status}`);
    return response.data;
};

// Update store
export const updateStore = async (storeId, storeData) => {
    const response = await client.put(`/stores/${storeId}`, storeData);
    return response.data;
};

// Update store status (admin only)
export const updateStoreStatus = async (storeId, status) => {
    const response = await client.patch(`/stores/${storeId}/status?status=${status}`);
    return response.data;
};

// Update store activation (admin only)
export const updateStoreActivation = async (storeId, isActive) => {
    const response = await client.patch(`/stores/${storeId}/activate?isActive=${isActive}`);
    return response.data;
};

// Delete store
export const deleteStore = async (storeId) => {
    const response = await client.delete(`/stores/${storeId}`);
    return response.data;
};

export default {
    createStore,
    getStoreByUserId,
    getMyStore,
    getStoreById,
    getStoreByUsername,
    getAllStores,
    getStoresByStatus,
    updateStore,
    updateStoreStatus,
    updateStoreActivation,
    deleteStore,
};
