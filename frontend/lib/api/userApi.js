import client from './client';

/**
 * User API functions
 */

// Get current user
export const getCurrentUser = async () => {
    const response = await client.get('/users/me');
    return response.data;
};

export const getUserById = async (userId) => {
    const response = await client.get(`/users/${userId}`);
    return response.data;
};

export const getFollowedStores = async () => {
    const response = await client.get('/users/me/followed-stores');
    return response.data;
};

export const followStore = async (storeId) => {
    const response = await client.post(`/users/me/followed-stores/${storeId}`);
    return response.data;
};

export const unfollowStore = async (storeId) => {
    const response = await client.delete(`/users/me/followed-stores/${storeId}`);
    return response.data;
};

export default {
    getCurrentUser,
    getUserById,
    getFollowedStores,
    followStore,
    unfollowStore,
};
