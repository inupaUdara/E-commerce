'use client'
import { Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import { fetchCurrentUser, logout, setAuthFromStorage } from "@/lib/features/auth/authSlice";
import { useDispatch } from "react-redux";
import NotificationBell from "./NotificationBell";

const Navbar = () => {

    const router = useRouter();
    const dispatch = useDispatch();

    const [search, setSearch] = useState('')
    const [mounted, setMounted] = useState(false)
    const cartCount = useSelector(state => state.cart.total)
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated)
    const user = useSelector(state => state.auth.user)

    useEffect(() => {
        // Load auth state from localStorage on client-side mount
        dispatch(setAuthFromStorage())

        const token = localStorage.getItem('token')
        if (token) {
            dispatch(fetchCurrentUser())
        }

        setMounted(true)
    }, [dispatch])

    const handleSearch = (e) => {
        e.preventDefault()
        router.push(`/shop?search=${search}`)
    }

    const handleLogout = () => {
        dispatch(logout())
        router.push('/')
    }

    return (
        <nav className="relative bg-white shadow-sm z-50">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4  transition-all">

                    <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                        <span className="text-green-600">go</span>cart<span className="text-green-600 text-5xl leading-0">.</span>
                        <p className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                            plus
                        </p>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600 font-medium">
                        <Link href="/" className="hover:text-green-600 transition">Home</Link>
                        <Link href="/shop" className="hover:text-green-600 transition">Shop</Link>
                        {/* <Link href="/" className="hover:text-green-600 transition">About</Link> */}
                        {isAuthenticated && (
                            <Link href="/orders" className="hover:text-green-600 transition">Orders</Link>
                        )}
                        {isAuthenticated && (
                            <Link href="/following" className="hover:text-green-600 transition">Following</Link>
                        )}
                        <form onSubmit={handleSearch} className="hidden xl:flex items-center w-80 text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full focus-within:ring-2 ring-green-500/20 transition">
                            <Search size={18} className="text-slate-500" />
                            <input className="w-full bg-transparent outline-none placeholder-slate-500 text-slate-700" type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} required />
                        </form>

                        {isAuthenticated && (
                            <Link href="/cart" className="relative flex items-center gap-2 text-slate-600 hover:text-green-600 transition">
                                <ShoppingCart size={22} />
                                <span className="hidden lg:block">Cart</span>
                                <span className="absolute -top-1.5 left-3.5 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 size-5 rounded-full shadow-sm">{cartCount}</span>
                            </Link>
                        )}

                        <NotificationBell isAuthenticated={isAuthenticated} />

                        {mounted ? (
                            isAuthenticated ? (
                                <div className="flex items-center gap-3">
                                    <p className="text-sm text-slate-700">Hi, {user?.name || 'User'}</p>
                                    <button onClick={handleLogout} className="px-6 py-2.5 bg-red-500 hover:bg-red-600 transition shadow-lg shadow-red-500/30 text-white rounded-full font-semibold text-sm">
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <Link href="/auth/login">
                                    <button className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 text-white rounded-full font-semibold text-sm">
                                        Login
                                    </button>
                                </Link>
                            )
                        ) : (
                            <div className="w-24 h-10" />
                        )}

                    </div>

                    {/* Mobile User Button  */}
                    <div className="sm:hidden">
                        {mounted ? (
                            isAuthenticated ? (
                                <div className="flex items-center gap-2">
                                    <p className="text-sm text-slate-700 max-w-20 truncate">{user?.name || 'User'}</p>
                                    <button onClick={handleLogout} className="px-7 py-1.5 bg-red-500 hover:bg-red-600 text-sm transition text-white rounded-full">
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <Link href="/auth/login">
                                    <button className="px-7 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-sm transition text-white rounded-full">
                                        Login
                                    </button>
                                </Link>
                            )
                        ) : (
                            <div className="w-20 h-8" />
                        )}
                    </div>
                </div>
            </div>
            <hr className="border-gray-300" />
        </nav>
    )
}

export default Navbar