'use client'
import PageTitle from "@/components/PageTitle"
import { useEffect, useState } from "react";
import OrderItem from "@/components/OrderItem";
import Loading from "@/components/Loading";
import { getCurrentUser } from "@/lib/api/userApi";
import { getOrdersByUserId } from "@/lib/api/orderApi";
import { getAddressById } from "@/lib/api/addressApi";
import { getProductById } from "@/lib/api/productApi";
import { getRatingsByUserId } from "@/lib/api/ratingApi";
import { useDispatch } from "react-redux";
import { setRatings } from "@/lib/features/rating/ratingSlice";

export default function Orders() {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();

    const parseCoupon = (couponValue) => {
        if (!couponValue) {
            return null;
        }

        if (typeof couponValue === 'object') {
            return Object.keys(couponValue).length > 0 ? couponValue : null;
        }

        try {
            const parsedCoupon = JSON.parse(couponValue);
            return Object.keys(parsedCoupon || {}).length > 0 ? parsedCoupon : null;
        } catch {
            return null;
        }
    };

    const fetchOrders = async () => {
        setLoading(true);

        try {
            const user = await getCurrentUser();
            const [userOrders, userRatings] = await Promise.all([
                getOrdersByUserId(user.id),
                getRatingsByUserId(user.id).catch(() => []),
            ]);

            dispatch(setRatings(userRatings || []));

            const hydratedOrders = await Promise.all((userOrders || []).map(async (order) => {
                const addressPromise = order?.addressId ? getAddressById(order.addressId).catch(() => null) : Promise.resolve(null);
                const productIds = (order?.orderItems || []).map((item) => item?.id?.productId).filter(Boolean);
                const uniqueProductIds = [...new Set(productIds)];
                const products = await Promise.all(uniqueProductIds.map((productId) => getProductById(productId).catch(() => null)));
                const productMap = new Map(products.filter(Boolean).map((product) => [product.id, product]));
                const address = await addressPromise;

                return {
                    ...order,
                    user,
                    address,
                    coupon: parseCoupon(order?.coupon),
                    orderItems: (order?.orderItems || []).map((item) => {
                        const productId = item?.id?.productId;
                        const product = productMap.get(productId) || {
                            id: productId,
                            name: 'Product unavailable',
                            images: ['/favicon.ico'],
                        };

                        return {
                            ...item,
                            productId,
                            product,
                        };
                    }),
                };
            }));

            setOrders(hydratedOrders);
        } catch {
            setOrders([]);
            dispatch(setRatings([]));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders()
    }, []);

    if (loading) {
        return <Loading />
    }

    return (
        <div className="min-h-[70vh] mx-6">
            {orders.length > 0 ? (
                (
                    <div className="my-20 max-w-7xl mx-auto">
                        <PageTitle heading="My Orders" text={`Showing total ${orders.length} orders`} linkText={'Go to home'} />

                        <table className="w-full max-w-5xl text-slate-500 table-auto border-separate border-spacing-y-12 border-spacing-x-4">
                            <thead>
                                <tr className="max-sm:text-sm text-slate-600 max-md:hidden">
                                    <th className="text-left">Product</th>
                                    <th className="text-center">Total Price</th>
                                    <th className="text-left">Address</th>
                                    <th className="text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <OrderItem order={order} key={order.id} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (
                <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400">
                    <h1 className="text-2xl sm:text-4xl font-semibold">You have no orders</h1>
                </div>
            )}
        </div>
    )
}