'use client'

import { Bell } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
    getMyNotifications,
    getMyUnreadNotificationCount,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from '@/lib/api/notificationApi'

const NotificationBell = ({ isAuthenticated }) => {
    const [open, setOpen] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)

    const visibleNotifications = useMemo(() => notifications.slice(0, 8), [notifications])

    const loadNotifications = async () => {
        if (!isAuthenticated) {
            setNotifications([])
            setUnreadCount(0)
            return
        }

        try {
            const [list, unread] = await Promise.all([
                getMyNotifications(),
                getMyUnreadNotificationCount(),
            ])
            setNotifications(Array.isArray(list) ? list : [])
            setUnreadCount(Number(unread) || 0)
        } catch {
            setNotifications([])
            setUnreadCount(0)
        }
    }

    useEffect(() => {
        loadNotifications()
    }, [isAuthenticated])

    useEffect(() => {
        if (!isAuthenticated) return

        const intervalId = setInterval(() => {
            loadNotifications()
        }, 5000)

        return () => clearInterval(intervalId)
    }, [isAuthenticated])

    const handleItemClick = async (notificationId) => {
        try {
            await markNotificationAsRead(notificationId)
            await loadNotifications()
        } catch {
            // ignore transient errors
        }
    }

    const handleReadAll = async () => {
        try {
            await markAllNotificationsAsRead()
            await loadNotifications()
        } catch {
            // ignore transient errors
        }
    }

    if (!isAuthenticated) {
        return null
    }

    return (
        <div className='relative'>
            <button
                type='button'
                onClick={() => setOpen((prev) => !prev)}
                className='relative p-2 rounded-full hover:bg-slate-100 transition'
            >
                <Bell size={20} className='text-slate-600' />
                {unreadCount > 0 && (
                    <span className='absolute -top-1 -right-1 flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-semibold'>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className='absolute right-0 mt-2 w-80 bg-white border border-slate-200 shadow-xl rounded-xl z-50'>
                    <div className='flex items-center justify-between px-4 py-3 border-b border-slate-100'>
                        <p className='font-semibold text-slate-700'>Notifications</p>
                        <button
                            type='button'
                            onClick={handleReadAll}
                            className='text-xs text-green-600 font-medium hover:text-green-700'
                        >
                            Mark all read
                        </button>
                    </div>

                    <div className='max-h-96 overflow-y-auto'>
                        {visibleNotifications.length === 0 ? (
                            <p className='px-4 py-6 text-sm text-slate-500 text-center'>No notifications yet</p>
                        ) : (
                            visibleNotifications.map((notification) => (
                                <button
                                    key={notification.id}
                                    type='button'
                                    onClick={() => handleItemClick(notification.id)}
                                    className='w-full text-left px-4 py-3 border-b last:border-b-0 border-slate-100 hover:bg-slate-50 transition'
                                >
                                    <p className='text-sm font-semibold text-slate-700'>{notification.title}</p>
                                    <p className='text-xs text-slate-500 mt-1'>{notification.message}</p>
                                    {!notification.isRead && (
                                        <span className='inline-block mt-2 text-[10px] font-semibold text-red-500'>Unread</span>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default NotificationBell
