import client from './client';

/**
 * User API functions
 */

// Get current user
export const getCurrentUser = async () => {
    const response = await client.get('/users/me');
    return response.data;
};

export default {
    getCurrentUser,
};
