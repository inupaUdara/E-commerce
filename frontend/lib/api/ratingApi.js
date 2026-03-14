import client from './client';

export const createRating = async (ratingData) => {
    const response = await client.post('/ratings', ratingData);
    return response.data;
};

export const getRatingsByProductId = async (productId) => {
    const response = await client.get(`/ratings/product/${productId}`);
    return response.data;
};

export const getRatingsByUserId = async (userId) => {
    const response = await client.get(`/ratings/user/${userId}`);
    return response.data;
};

export default {
    createRating,
    getRatingsByProductId,
    getRatingsByUserId,
};