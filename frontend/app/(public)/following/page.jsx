'use client'
import Loading from "@/components/Loading"
import PageTitle from "@/components/PageTitle"
import ProductCard from "@/components/ProductCard"
import { getProductsByStoreId } from "@/lib/api/productApi"
import { getStoreById } from "@/lib/api/storeApi"
import { getFollowedStores } from "@/lib/api/userApi"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function FollowingPage() {
    const [loading, setLoading] = useState(true)
    const [followedStores, setFollowedStores] = useState([])

    useEffect(() => {
        const fetchFollowing = async () => {
            setLoading(true)
            try {
                const followedStoreIds = await getFollowedStores()
                const safeStoreIds = Array.isArray(followedStoreIds) ? followedStoreIds : []

                const storesWithProducts = await Promise.all(safeStoreIds.map(async (storeId) => {
                    const [store, products] = await Promise.all([
                        getStoreById(storeId).catch(() => null),
                        getProductsByStoreId(storeId).catch(() => []),
                    ])

                    if (!store) {
                        return null
                    }

                    return {
                        ...store,
                        products: (products || []).filter((product) => product?.inStock !== false),
                    }
                }))

                setFollowedStores(storesWithProducts.filter(Boolean))
            } catch {
                setFollowedStores([])
            } finally {
                setLoading(false)
            }
        }

        fetchFollowing()
    }, [])

    if (loading) {
        return <Loading />
    }

    return (
        <div className="min-h-[70vh] mx-6 mb-24">
            <div className="max-w-7xl mx-auto">
                <PageTitle heading="Following" text={`You are following ${followedStores.length} store${followedStores.length === 1 ? '' : 's'}`} path="/shop" linkText="Explore stores" />

                {followedStores.length > 0 ? (
                    <div className="space-y-12">
                        {followedStores.map((store) => (
                            <section key={store.id} className="border border-slate-200 rounded-2xl p-6">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                                    <div>
                                        <h2 className="text-2xl font-semibold text-slate-800">{store.name}</h2>
                                        <p className="text-sm text-slate-500 mt-1">{store.description}</p>
                                    </div>
                                    <Link href={`/shop/${store.username}`} className="text-sm text-green-600 hover:text-green-700 font-medium">
                                        Visit Store
                                    </Link>
                                </div>

                                {store.products.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12">
                                        {store.products.map((product) => (
                                            <ProductCard key={product.id} product={product} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400">This store has no in-stock products right now.</p>
                                )}
                            </section>
                        ))}
                    </div>
                ) : (
                    <div className="min-h-[40vh] flex items-center justify-center text-center">
                        <div>
                            <h2 className="text-2xl font-semibold text-slate-700">No followed stores yet</h2>
                            <p className="text-slate-500 mt-2">Follow a store to see its latest products in one place.</p>
                            <Link href="/shop" className="inline-flex mt-5 px-6 py-3 rounded-full bg-green-600 hover:bg-green-700 text-white transition">
                                Browse products
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}