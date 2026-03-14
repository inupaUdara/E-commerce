import client from './client';

/**
 * Product API functions
 */

// Create a new product
export const createProduct = async (productData) => {
    const response = await client.post('/products', productData);
    return response.data;
};

// Get all products for a store
export const getProductsByStoreId = async (storeId) => {
    const response = await client.get(`/products/store/${storeId}`);
    return response.data;
};

// Update product
export const updateProduct = async (productId, productData) => {
    const response = await client.put(`/products/${productId}`, productData);
    return response.data;
};

// Toggle product stock with minimal payload
export const toggleProductStock = async (product) => {
    const response = await client.put(`/products/${product.id}`, {
        inStock: !product.inStock,
    });
    return response.data;
};

// Delete product
export const deleteProduct = async (productId) => {
    const response = await client.delete(`/products/${productId}`);
    return response.data;
};

export default {
    createProduct,
    getProductsByStoreId,
    updateProduct,
    toggleProductStock,
    deleteProduct,
};
