'use client'
import { assets } from "@/assets/assets"
import { useEffect, useState } from "react"
import Image from "next/image"
import toast from "react-hot-toast"
import Loading from "@/components/Loading"
import { createStore, getMyStore } from "@/lib/api/storeApi"
import { useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { setAuthFromStorage } from "@/lib/features/auth/authSlice"

export default function CreateStore() {

    const router = useRouter()
    const dispatch = useDispatch()
    const { isAuthenticated } = useSelector((state) => state.auth)
    const [alreadySubmitted, setAlreadySubmitted] = useState(false)
    const [status, setStatus] = useState("")
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState("")
    const [authInitialized, setAuthInitialized] = useState(false)

    const [storeInfo, setStoreInfo] = useState({
        name: "",
        username: "",
        description: "",
        email: "",
        contact: "",
        address: "",
        logo: "",
        image: null
    })

    const onChangeHandler = (e) => {
        setStoreInfo({ ...storeInfo, [e.target.name]: e.target.value })
    }

    const imageChangeHandler = (e) => {
        const file = e.target.files[0]
        if (file) {
            setStoreInfo({ ...storeInfo, image: file })
        }
    }

    const fetchSellerStatus = async () => {
        setLoading(true)
        try {
            // Check if user is authenticated
            if (!isAuthenticated) {
                setLoading(false)
                return
            }

            // Check if the user already has a store
            const store = await getMyStore()
            if (store) {
                setAlreadySubmitted(true)
                setStatus(store.status)
                
                if (store.status === "pending") {
                    setMessage("Your store application is under review. We'll notify you once it's approved.")
                } else if (store.status === "approved" && store.isActive) {
                    setMessage("Your store has been approved and is now active! Redirecting to dashboard...")
                    setTimeout(() => {
                        router.push("/store")
                    }, 5000)
                } else if (store.status === "approved" && !store.isActive) {
                    setMessage("Your store has been approved but is currently inactive. Please contact support.")
                } else if (store.status === "rejected") {
                    setMessage("Your store application was rejected. Please contact support for more information.")
                }
            }
        } catch (error) {
            // If error is 404, user doesn't have a store yet
            if (error.response?.status === 404) {
                setAlreadySubmitted(false)
            } else {
                console.error("Error fetching store status:", error)
            }
        } finally {
            setLoading(false)
        }
    }

    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        
        // Validation
        if (!storeInfo.name || !storeInfo.username || !storeInfo.description || 
            !storeInfo.email || !storeInfo.contact || !storeInfo.address) {
            toast.error("Please fill in all required fields")
            throw new Error("Please fill in all required fields")
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(storeInfo.email)) {
            toast.error("Please enter a valid email address")
            throw new Error("Please enter a valid email address")
        }

        // Username validation (no spaces, special characters)
        const usernameRegex = /^[a-zA-Z0-9_-]+$/
        if (!usernameRegex.test(storeInfo.username)) {
            toast.error("Username can only contain letters, numbers, hyphens, and underscores")
            throw new Error("Username can only contain letters, numbers, hyphens, and underscores")
        }

        setSubmitting(true)
        try {
            // Convert image to base64 if provided
            let logoUrl = "https://via.placeholder.com/150" // Default logo
            if (storeInfo.image) {
                logoUrl = await convertFileToBase64(storeInfo.image)
            }

            const storeData = {
                name: storeInfo.name,
                username: storeInfo.username,
                description: storeInfo.description,
                email: storeInfo.email,
                contact: storeInfo.contact,
                address: storeInfo.address,
                logo: logoUrl
            }

            const response = await createStore(storeData)
            
            toast.success("Store application submitted successfully!")
            setAlreadySubmitted(true)
            setStatus("pending")
            setMessage("Your store application is under review. We'll notify you once it's approved.")
            
            // Optionally refresh the page or fetch status again
            await fetchSellerStatus()
        } catch (error) {
            console.error("Error creating store:", error)
            const errorMessage = error.response?.data?.message || 
                               error.response?.data || 
                               "Failed to submit store application. Please try again."
            toast.error(errorMessage)
            throw error
        } finally {
            setSubmitting(false)
        }
    }

    useEffect(() => {
        // Load auth state from localStorage on mount
        dispatch(setAuthFromStorage())
        // Mark auth as initialized after loading from storage
        setTimeout(() => {
            setAuthInitialized(true)
        }, 0)
    }, [dispatch])

    useEffect(() => {
        // Only run once after auth has been initialized from localStorage
        if (authInitialized) {
            fetchSellerStatus()
        }
    }, [authInitialized])

    // Cleanup object URL to prevent memory leaks
    useEffect(() => {
        return () => {
            if (storeInfo.image) {
                URL.revokeObjectURL(URL.createObjectURL(storeInfo.image))
            }
        }
    }, [storeInfo.image])

    return !loading ? (
        <>
            {!isAuthenticated ? (
                <div className="min-h-[80vh] flex flex-col items-center justify-center">
                    <div className="text-center max-w-md mx-6">
                        <h2 className="text-3xl font-bold text-slate-800 mb-4">Login Required</h2>
                        <p className="text-lg text-slate-600 mb-8">Please login to create your store and start selling on GoCart.</p>
                        <button 
                            onClick={() => router.push("/auth/login")}
                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 text-white rounded-full font-semibold text-base"
                        >
                            Login to Continue
                        </button>
                    </div>
                </div>
            ) : !alreadySubmitted ? (
                <div className="mx-6 min-h-[70vh] my-16">
                    <form onSubmit={e => toast.promise(onSubmitHandler(e), { loading: "Submitting data..." })} className="max-w-7xl mx-auto flex flex-col items-start gap-3 text-slate-500">
                        {/* Title */}
                        <div>
                            <h1 className="text-3xl ">Add Your <span className="text-slate-800 font-medium">Store</span></h1>
                            <p className="max-w-lg">To become a seller on GoCart, submit your store details for review. Your store will be activated after admin verification.</p>
                        </div>

                        <div className="w-full max-w-lg">
                            <p className="mb-2">Store Logo (optional)</p>
                            <label htmlFor="logo-upload" className="cursor-pointer">
                                <Image 
                                    src={storeInfo.image ? URL.createObjectURL(storeInfo.image) : assets.upload_area} 
                                    alt="Store logo" 
                                    width={120} 
                                    height={120} 
                                    className="rounded border border-slate-300"
                                />
                            </label>
                            <input 
                                id="logo-upload"
                                type="file" 
                                accept="image/*" 
                                onChange={imageChangeHandler}
                                className="hidden"
                            />
                        </div>

                        <p>Store Name <span className="text-red-500">*</span></p>
                        <input 
                            name="name" 
                            onChange={onChangeHandler} 
                            value={storeInfo.name} 
                            type="text" 
                            placeholder="Enter your store name" 
                            className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded" 
                            required 
                        />

                        <p>Username <span className="text-red-500">*</span></p>
                        <input 
                            name="username" 
                            onChange={onChangeHandler} 
                            value={storeInfo.username} 
                            type="text" 
                            placeholder="Enter your store username (e.g., my-store)" 
                            className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded" 
                            required 
                        />

                        <p>Description <span className="text-red-500">*</span></p>
                        <textarea 
                            name="description" 
                            onChange={onChangeHandler} 
                            value={storeInfo.description} 
                            rows={5} 
                            placeholder="Enter your store description" 
                            className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded resize-none" 
                            required 
                        />

                        <p>Email <span className="text-red-500">*</span></p>
                        <input 
                            name="email" 
                            onChange={onChangeHandler} 
                            value={storeInfo.email} 
                            type="email" 
                            placeholder="Enter your store email" 
                            className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded" 
                            required 
                        />

                        <p>Contact Number <span className="text-red-500">*</span></p>
                        <input 
                            name="contact" 
                            onChange={onChangeHandler} 
                            value={storeInfo.contact} 
                            type="tel" 
                            placeholder="Enter your store contact number" 
                            className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded" 
                            required 
                        />

                        <p>Address <span className="text-red-500">*</span></p>
                        <textarea 
                            name="address" 
                            onChange={onChangeHandler} 
                            value={storeInfo.address} 
                            rows={5} 
                            placeholder="Enter your store address" 
                            className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded resize-none" 
                            required 
                        />

                        <button 
                            type="submit"
                            disabled={submitting}
                            className="bg-slate-800 text-white px-12 py-2 rounded mt-10 mb-40 active:scale-95 hover:bg-slate-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? "Submitting..." : "Submit"}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="min-h-[80vh] flex flex-col items-center justify-center">
                    <div className="text-center max-w-2xl mx-6">
                        {status === "pending" && (
                            <>
                                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-bold text-slate-800 mb-4">Application Under Review</h2>
                                <p className="text-lg text-slate-600 mb-4">{message}</p>
                                <p className="text-slate-500">Please wait for admin approval. This may take up to 48 hours.</p>
                            </>
                        )}
                        
                        {status === "approved" && (
                            <>
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-bold text-slate-800 mb-4">Store Approved!</h2>
                                <p className="text-lg text-slate-600 mb-4">{message}</p>
                                <p className="text-slate-500">Redirecting to dashboard in <span className="font-semibold">5 seconds</span></p>
                            </>
                        )}
                        
                        {status === "rejected" && (
                            <>
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-bold text-slate-800 mb-4">Application Rejected</h2>
                                <p className="text-lg text-slate-600 mb-4">{message}</p>
                                <button 
                                    onClick={() => router.push("/pricing")}
                                    className="mt-4 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 text-white rounded-full font-semibold"
                                >
                                    Contact Support
                                </button>
                            </>
                        )}

                        {!status && (
                            <>
                                <h2 className="text-3xl font-bold text-slate-800 mb-4">Store Application Status</h2>
                                <p className="text-lg text-slate-600">{message || "Loading your store information..."}</p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    ) : (<Loading />) 
}