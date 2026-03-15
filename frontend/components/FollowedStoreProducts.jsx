'use client'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ProductCard from './ProductCard'
import { getFollowedStores } from '@/lib/api/userApi'
import { getStoreById } from '@/lib/api/storeApi'
import { getProductsByStoreId } from '@/lib/api/productApi'

const FollowedStoreProducts = () => {
    const user = useSelector((state) => state.auth.user)
    const [sections, setSections] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!user) return

        const load = async () => {
            setLoading(true)
            try {
                const storeIds = await getFollowedStores()
                if (!storeIds || storeIds.length === 0) {
                    setSections([])
                    return
                }

                const results = await Promise.all(
                    storeIds.map(async (id) => {
                        const [store, products] = await Promise.all([
                            getStoreById(id).catch(() => null),
                            getProductsByStoreId(id).catch(() => []),
                        ])
                        return { store, products: (products || []).filter((p) => p.inStock) }
                    })
                )

                setSections(results.filter((s) => s.store && s.products.length > 0))
            } catch {
                setSections([])
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [user])

    if (!user || loading || sections.length === 0) return null

    return (
        <div className='px-6 my-30 max-w-6xl mx-auto'>
            <div className='flex flex-col items-center mb-10'>
                <h2 className='text-2xl font-semibold text-slate-800'>From Stores You Follow</h2>
                <div className='flex items-center gap-5 text-sm text-slate-600 mt-2'>
                    <p className='max-w-lg text-center'>
                        New arrivals from the stores you follow
                    </p>
                    <Link href='/following' className='text-green-500 flex items-center gap-1'>
                        View all <ArrowRight size={14} />
                    </Link>
                </div>
            </div>

            {sections.map(({ store, products }) => (
                <div key={store.id} className='mb-14'>
                    <div className='flex items-center justify-between mb-6'>
                        <div>
                            <h3 className='text-lg font-medium text-slate-700'>{store.name}</h3>
                            {store.description && (
                                <p className='text-sm text-slate-400 max-w-md truncate'>{store.description}</p>
                            )}
                        </div>
                        <Link
                            href={`/shop/${store.username || store.id}`}
                            className='text-sm text-green-500 flex items-center gap-1 shrink-0'
                        >
                            Visit store <ArrowRight size={13} />
                        </Link>
                    </div>
                    <div className='grid grid-cols-2 sm:flex flex-wrap gap-6'>
                        {products.slice(0, 4).map((product, index) => (
                            <ProductCard key={index} product={product} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default FollowedStoreProducts
