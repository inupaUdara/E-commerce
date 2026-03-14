'use client'
import Loading from "@/components/Loading"
import OrdersAreaChart from "@/components/OrdersAreaChart"
import { CircleDollarSignIcon, ShoppingBasketIcon, StoreIcon, TagsIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { getAllProducts } from "@/lib/api/productApi"
import { getAllOrders } from "@/lib/api/orderApi"
import { getAllStores } from "@/lib/api/storeApi"
import toast from "react-hot-toast"

export default function AdminDashboard() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        products: 0,
        revenue: 0,
        orders: 0,
        stores: 0,
        allOrders: [],
    })

    const dashboardCardsData = [
        { title: 'Total Products', value: dashboardData.products, icon: ShoppingBasketIcon },
        { title: 'Total Revenue', value: currency + dashboardData.revenue, icon: CircleDollarSignIcon },
        { title: 'Total Orders', value: dashboardData.orders, icon: TagsIcon },
        { title: 'Total Stores', value: dashboardData.stores, icon: StoreIcon },
    ]

    const fetchDashboardData = async () => {
        setLoading(true)
        try {
            const [products, orders, stores] = await Promise.all([
                getAllProducts(),
                getAllOrders(),
                getAllStores(),
            ])

            const safeProducts = Array.isArray(products) ? products : []
            const safeOrders = Array.isArray(orders) ? orders : []
            const safeStores = Array.isArray(stores) ? stores : []

            const revenue = safeOrders.reduce((sum, order) => {
                const paid = order?.isPaid === true || String(order?.status || '').toUpperCase() === 'DELIVERED'
                return paid ? sum + Number(order?.total || 0) : sum
            }, 0)

            setDashboardData({
                products: safeProducts.length,
                revenue: Number(revenue.toFixed(2)),
                orders: safeOrders.length,
                stores: safeStores.length,
                allOrders: safeOrders,
            })
        } catch (error) {
            setDashboardData({
                products: 0,
                revenue: 0,
                orders: 0,
                stores: 0,
                allOrders: [],
            })
            toast.error(error?.response?.data?.message || 'Failed to load admin dashboard')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="text-slate-500">
            <h1 className="text-2xl">Admin <span className="text-slate-800 font-medium">Dashboard</span></h1>

            {/* Cards */}
            <div className="flex flex-wrap gap-5 my-10 mt-4">
                {
                    dashboardCardsData.map((card, index) => (
                        <div key={index} className="flex items-center gap-10 border border-slate-200 p-3 px-6 rounded-lg">
                            <div className="flex flex-col gap-3 text-xs">
                                <p>{card.title}</p>
                                <b className="text-2xl font-medium text-slate-700">{card.value}</b>
                            </div>
                            <card.icon size={50} className=" w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full" />
                        </div>
                    ))
                }
            </div>

            {/* Area Chart */}
            <OrdersAreaChart allOrders={dashboardData.allOrders} />
        </div>
    )
}