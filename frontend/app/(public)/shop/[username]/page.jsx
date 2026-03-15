'use client'
import ProductCard from "@/components/ProductCard"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { MailIcon, MapPinIcon } from "lucide-react"
import Loading from "@/components/Loading"
import Image from "next/image"
import { getStoreByUsername } from "@/lib/api/storeApi"
import { getProductsByStoreId } from "@/lib/api/productApi"
import { followStore, getCurrentUser, unfollowStore } from "@/lib/api/userApi"
import toast from "react-hot-toast"

export default function StoreShop() {

    const { username } = useParams()
    const [products, setProducts] = useState([])
    const [storeInfo, setStoreInfo] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isFollowing, setIsFollowing] = useState(false)
    const [followLoading, setFollowLoading] = useState(false)

    const fetchStoreData = async () => {
        setLoading(true)
        try {
            const store = await getStoreByUsername(username)
            setStoreInfo(store)

            try {
                const user = await getCurrentUser()
                const followedStoreIds = Array.isArray(user?.followedStoreIds) ? user.followedStoreIds : []
                setIsFollowing(Boolean(store?.id) && followedStoreIds.includes(store.id))
            } catch {
                setIsFollowing(false)
            }

            if (store?.id) {
                const storeProducts = await getProductsByStoreId(store.id)
                setProducts((storeProducts || []).filter((product) => product?.inStock !== false))
            } else {
                setProducts([])
            }
        } catch (error) {
            setStoreInfo(null)
            setProducts([])
        } finally {
            setLoading(false)
        }
    }

    const handleFollowToggle = async () => {
        if (!storeInfo?.id) {
            return
        }

        setFollowLoading(true)
        try {
            if (isFollowing) {
                const updatedUser = await unfollowStore(storeInfo.id)
                setIsFollowing((updatedUser?.followedStoreIds || []).includes(storeInfo.id))
                toast.success('Store unfollowed')
            } else {
                const updatedUser = await followStore(storeInfo.id)
                setIsFollowing((updatedUser?.followedStoreIds || []).includes(storeInfo.id))
                toast.success('Store followed')
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Please login to follow stores')
        } finally {
            setFollowLoading(false)
        }
    }

    useEffect(() => {
        fetchStoreData()
    }, [username])

    return !loading ? (
        <div className="min-h-[70vh] mx-6">

            {/* Store Info Banner */}
            {storeInfo && (
                <div className="max-w-7xl mx-auto bg-slate-50 rounded-xl p-6 md:p-10 mt-6 flex flex-col md:flex-row items-center gap-6 shadow-xs">
                    <Image
                        src={storeInfo.logo}
                        alt={storeInfo.name}
                        className="size-32 sm:size-38 object-cover border-2 border-slate-100 rounded-md"
                        width={200}
                        height={200}
                    />
                    <div className="text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <h1 className="text-3xl font-semibold text-slate-800">{storeInfo.name}</h1>
                            <button
                                type="button"
                                onClick={handleFollowToggle}
                                disabled={followLoading}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition ${isFollowing ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-green-600 text-white hover:bg-green-700'} disabled:opacity-60 disabled:cursor-not-allowed`}
                            >
                                {followLoading ? 'Saving...' : isFollowing ? 'Following' : 'Follow Store'}
                            </button>
                        </div>
                        <p className="text-sm text-slate-600 mt-2 max-w-lg">{storeInfo.description}</p>
                        <div className="text-xs text-slate-500 mt-4 space-y-1"></div>
                        <div className="space-y-2 text-sm text-slate-500">
                            <div className="flex items-center">
                                <MapPinIcon className="w-4 h-4 text-gray-500 mr-2" />
                                <span>{storeInfo.address}</span>
                            </div>
                            <div className="flex items-center">
                                <MailIcon className="w-4 h-4 text-gray-500 mr-2" />
                                <span>{storeInfo.email}</span>
                            </div>
                           
                        </div>
                    </div>
                </div>
            )}

            {/* Products */}
            <div className=" max-w-7xl mx-auto mb-40">
                <h1 className="text-2xl mt-12">Shop <span className="text-slate-800 font-medium">Products</span></h1>
                <div className="mt-5 grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12 mx-auto">
                    {products.map((product) => <ProductCard key={product.id} product={product} />)}
                </div>
            </div>
        </div>
    ) : <Loading />
}