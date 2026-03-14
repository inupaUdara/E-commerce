'use client'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { setAuthFromStorage } from "@/lib/features/auth/authSlice"
import { fetchMyStore } from "@/lib/features/store/storeSlice"
import Loading from "../Loading"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import SellerNavbar from "./StoreNavbar"
import SellerSidebar from "./StoreSidebar"
import toast from "react-hot-toast"

const StoreLayout = ({ children }) => {

    const router = useRouter()
    const dispatch = useDispatch()
    const { isAuthenticated } = useSelector((state) => state.auth)
    const { storeInfo, loading: storeLoading, hasStore, isApproved } = useSelector((state) => state.store)
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("You don't have an approved store")

    useEffect(() => {
        const initStore = async () => {
            try {
                // Check if user is authenticated
                dispatch(setAuthFromStorage())
                const token = localStorage.getItem('token')
                
                if (!token) {
                    setMessage("Please login to access this page")
                    setLoading(false)
                    return
                }

                // Fetch user's store
                const result = await dispatch(fetchMyStore()).unwrap()
                
                // Messages will be set based on Redux state
                setLoading(false)
            } catch (error) {
                console.error('Error fetching store info:', error)
                if (error.response?.status === 404 || error === 'Failed to fetch store') {
                    setMessage("You don't have a store yet. Please create one.")
                } else if (error.response?.status === 401) {
                    setMessage("Please login to access this page")
                    toast.error("Authentication failed. Please login again.")
                    router.push('/auth/login')
                } else {
                    setMessage("Unable to load store information")
                }
                setLoading(false)
            }
        }

        initStore()
    }, [dispatch, router])

    // Update message based on store status
    useEffect(() => {
        if (storeInfo) {
            if (storeInfo.status === 'pending') {
                setMessage("Your store application is pending approval")
            } else if (storeInfo.status === 'rejected') {
                setMessage("Your store application was rejected. Please contact support.")
            } else if (storeInfo.status !== 'approved') {
                setMessage("You don't have an approved store")
            }
        }
    }, [storeInfo])

    return (loading || storeLoading) ? (
        <Loading />
    ) : isApproved ? (
        <div className="flex flex-col h-screen">
            <SellerNavbar />
            <div className="flex flex-1 items-start h-full overflow-y-scroll no-scrollbar">
                <SellerSidebar />
                <div className="flex-1 h-full p-5 lg:pl-12 lg:pt-12 overflow-y-scroll">
                    {children}
                </div>
            </div>
        </div>
    ) : (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-2xl sm:text-4xl font-semibold text-slate-400">{message}</h1>
            <div className="flex gap-4 mt-8">
                {!isAuthenticated ? (
                    <Link href="/auth/login" className="bg-slate-700 text-white flex items-center gap-2 p-2 px-6 max-sm:text-sm rounded-full">
                        Login <ArrowRightIcon size={18} />
                    </Link>
                ) : !storeInfo ? (
                    <Link href="/create-store" className="bg-slate-700 text-white flex items-center gap-2 p-2 px-6 max-sm:text-sm rounded-full">
                        Create Store <ArrowRightIcon size={18} />
                    </Link>
                ) : null}
                <Link href="/" className="bg-slate-300 text-slate-700 flex items-center gap-2 p-2 px-6 max-sm:text-sm rounded-full">
                    Go to home <ArrowRightIcon size={18} />
                </Link>
            </div>
        </div>
    )
}

export default StoreLayout