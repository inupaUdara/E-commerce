'use client'
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getProductById } from "@/lib/api/productApi";
import Loading from "@/components/Loading";

export default function Product() {

    const { productId } = useParams();
    const [product, setProduct] = useState();
    const [loading, setLoading] = useState(true)

    const normalizedProductId = Array.isArray(productId) ? productId[0] : productId
    const safeProductId = normalizedProductId ? decodeURIComponent(normalizedProductId) : ''

    const fetchProduct = async () => {
        setLoading(true)
        try {
            if (!safeProductId || safeProductId === '<id>' || safeProductId === 'undefined' || safeProductId === 'null') {
                setProduct(null)
                return
            }

            const data = await getProductById(safeProductId)
            setProduct(data)
        } catch (error) {
            setProduct(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProduct()
        scrollTo(0, 0)
    }, [safeProductId]);

    if (loading) {
        return <Loading />
    }

    return (
        <div className="mx-6">
            <div className="max-w-7xl mx-auto">

                {/* Breadcrums */}
                <div className="  text-gray-600 text-sm mt-8 mb-5">
                    Home / Products / {product?.category}
                </div>

                {/* Product Details */}
                {product && (<ProductDetails product={product} />)}

                {/* Description & Reviews */}
                {product && (<ProductDescription product={product} />)}
            </div>
        </div>
    );
}