'use client'
import { StarIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { getRatingsByProductId } from '@/lib/api/ratingApi'

const ProductCard = ({ product }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
    const [ratingValue, setRatingValue] = useState(0)

    // Support mixed product payloads and keep route generation safe.
    const productId = product?.id || product?._id || product?.productId
    const productHref = productId ? `/product/${encodeURIComponent(productId)}` : '/shop'

    useEffect(() => {
        let isMounted = true

        const hydrateRating = async () => {
            const ratings = Array.isArray(product?.rating) ? product.rating : []

            if (ratings.length > 0) {
                const average = Math.round(ratings.reduce((acc, curr) => acc + Number(curr?.rating || 0), 0) / ratings.length)
                if (isMounted) {
                    setRatingValue(average)
                }
                return
            }

            if (typeof product?.rating === 'number') {
                if (isMounted) {
                    setRatingValue(Math.round(product.rating))
                }
                return
            }

            if (typeof product?.averageRating === 'number') {
                if (isMounted) {
                    setRatingValue(Math.round(product.averageRating))
                }
                return
            }

            if (!productId) {
                if (isMounted) {
                    setRatingValue(0)
                }
                return
            }

            try {
                const backendRatings = await getRatingsByProductId(productId)
                const safeRatings = Array.isArray(backendRatings) ? backendRatings : []
                const average = safeRatings.length > 0
                    ? Math.round(safeRatings.reduce((acc, curr) => acc + Number(curr?.rating || 0), 0) / safeRatings.length)
                    : 0

                if (isMounted) {
                    setRatingValue(average)
                }
            } catch {
                if (isMounted) {
                    setRatingValue(0)
                }
            }
        }

        hydrateRating()

        return () => {
            isMounted = false
        }
    }, [product?.rating, product?.averageRating, productId])

    return (
        <Link href={productHref} className=' group max-xl:mx-auto'>
            <div className='bg-[#F5F5F5] h-40  sm:w-60 sm:h-68 rounded-lg flex items-center justify-center'>
                <Image width={500} height={500} className='max-h-30 sm:max-h-40 w-auto group-hover:scale-115 transition duration-300' src={product.images?.[0] || '/favicon.ico'} alt="" />
            </div>
            <div className='flex justify-between gap-3 text-sm text-slate-800 pt-2 max-w-60'>
                <div>
                    <p>{product.name}</p>
                    <div className='flex'>
                        {Array(5).fill('').map((_, index) => (
                            <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={ratingValue >= index + 1 ? "#00C950" : "#D1D5DB"} />
                        ))}
                    </div>
                </div>
                <p>{currency}{product.price}</p>
            </div>
        </Link>
    )
}

export default ProductCard