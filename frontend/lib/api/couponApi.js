import client from './client';

/**
 * Coupon API functions
 */

// Create a new coupon
export const createCoupon = async (couponData) => {
    const response = await client.post('/coupons', couponData);
    return response.data;
};

// Get all coupons
export const getAllCoupons = async () => {
    const response = await client.get('/coupons');
    return response.data;
};

// Get coupon by code
export const getCouponByCode = async (code) => {
    const response = await client.get(`/coupons/${code}`);
    return response.data;
};

// Get all public coupons
export const getPublicCoupons = async () => {
    const response = await client.get('/coupons/public');
    return response.data;
};

// Get all active coupons
export const getActiveCoupons = async () => {
    const coupons = await getAllCoupons();
    const now = new Date();
    return coupons.filter((coupon) => new Date(coupon.expiresAt) > now);
};

// Validate a coupon
export const validateCoupon = async (code, isNewUser = false) => {
    const response = await client.get(`/coupons/${code}/validate`);
    return response.data;
};

// Update coupon
export const updateCoupon = async (code, couponData) => {
    const response = await client.patch(`/coupons/${code}`, couponData);
    return response.data;
};

// Delete coupon
export const deleteCoupon = async (code) => {
    const response = await client.delete(`/coupons/${code}`);
    return response.data;
};

export default {
    createCoupon,
    getAllCoupons,
    getCouponByCode,
    getPublicCoupons,
    getActiveCoupons,
    validateCoupon,
    updateCoupon,
    deleteCoupon,
};
