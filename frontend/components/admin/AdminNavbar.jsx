'use client'
import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { fetchCurrentUser, logout, setAuthFromStorage } from "@/lib/features/auth/authSlice"

const AdminNavbar = () => {
    const dispatch = useDispatch()
    const router = useRouter()
    const user = useSelector((state) => state.auth.user)

    useEffect(() => {
        dispatch(setAuthFromStorage())

        const token = localStorage.getItem('token')
        if (token && !user) {
            dispatch(fetchCurrentUser())
        }
    }, [dispatch, user])

    const handleLogout = () => {
        dispatch(logout())
        router.push('/auth/login')
    }


    return (
        <div className="flex items-center justify-between px-12 py-3 border-b border-slate-200 transition-all">
            <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                <span className="text-green-600">go</span>cart<span className="text-green-600 text-5xl leading-0">.</span>
                <p className="absolute text-xs font-semibold -top-1 -right-13 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                    Admin
                </p>
            </Link>
            <div className="flex items-center gap-3">
                <p className="text-slate-700">Hi, {user?.name || 'Admin'}</p>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition"
                >
                    Logout
                </button>
            </div>
        </div>
    )
}

export default AdminNavbar