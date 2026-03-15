import client from './client';

export const getMyNotifications = async () => {
    const response = await client.get('/notifications/me');
    return response.data;
};

export const getMyUnreadNotificationCount = async () => {
    const response = await client.get('/notifications/me/unread-count');
    return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
    const response = await client.patch(`/notifications/${notificationId}/read`);
    return response.data;
};

export const markAllNotificationsAsRead = async () => {
    const response = await client.patch('/notifications/me/read-all');
    return response.data;
};

export default {
    getMyNotifications,
    getMyUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
};
