'use client'
import { useEffect, useState } from "react"
import { format } from "date-fns"
import toast from "react-hot-toast"
import { DeleteIcon } from "lucide-react"
import { createCoupon, getActiveCoupons, deleteCoupon as deleteCouponApi } from "@/lib/api/couponApi"

export default function AdminCoupons() {

    const [coupons, setCoupons] = useState([])
    const [loading, setLoading] = useState(true)

    const [newCoupon, setNewCoupon] = useState({
        code: '',
        description: '',
        discount: '',
        forNewUser: false,
        forMember: false,
        isPublic: false,
        expiresAt: format(new Date(), 'yyyy-MM-dd')
    })

    const extractErrorMessage = (error, fallback) => {
        const data = error?.response?.data;
        if (typeof data === 'string') return data;
        if (data?.message) return data.message;
        return fallback;
    };

    const fetchCoupons = async () => {
        try {
            const data = await getActiveCoupons()
            setCoupons(data)
        } catch (error) {
            console.error('Error fetching coupons:', error)
            toast.error('Failed to fetch coupons')
        } finally {
            setLoading(false)
        }
    }

    const handleAddCoupon = async (e) => {
        e.preventDefault()
        try {
            // Convert date to ISO string for backend
            const couponData = {
                ...newCoupon,
                discount: parseFloat(newCoupon.discount),
                expiresAt: `${newCoupon.expiresAt}T23:59:59`
            }
            
            await createCoupon(couponData)
            toast.success('Coupon created successfully!')
            
            // Reset form
            setNewCoupon({
                code: '',
                description: '',
                discount: '',
                forNewUser: false,
                forMember: false,
                isPublic: false,
                expiresAt: format(new Date(), 'yyyy-MM-dd')
            })
            
            // Refresh coupons list
            await fetchCoupons()
        } catch (error) {
            console.error('Error creating coupon:', error)
            toast.error(extractErrorMessage(error, 'Failed to create coupon'))
            throw error
        }
    }

    const handleChange = (e) => {
        setNewCoupon({ ...newCoupon, [e.target.name]: e.target.value })
    }

    const deleteCoupon = async (code) => {
        try {
            await deleteCouponApi(code)
            toast.success('Coupon deleted successfully!')
            // Update local state
            setCoupons(coupons.filter(coupon => coupon.code !== code))
        } catch (error) {
            console.error('Error deleting coupon:', error)
            toast.error(extractErrorMessage(error, 'Failed to delete coupon'))
            throw error
        }
    }

    useEffect(() => {
        fetchCoupons();
    }, [])

    return (
        <div className="text-slate-500 mb-40">

            {/* Add Coupon */}
            <form onSubmit={(e) => toast.promise(handleAddCoupon(e), { loading: "Adding coupon..." })} className="max-w-sm text-sm">
                <h2 className="text-2xl">Add <span className="text-slate-800 font-medium">Coupons</span></h2>
                <div className="flex gap-2 max-sm:flex-col mt-2">
                    <input type="text" placeholder="Coupon Code" className="w-full mt-2 p-2 border border-slate-200 outline-slate-400 rounded-md"
                        name="code" value={newCoupon.code} onChange={handleChange} required
                    />
                    <input type="number" placeholder="Coupon Discount (%)" min={1} max={100} className="w-full mt-2 p-2 border border-slate-200 outline-slate-400 rounded-md"
                        name="discount" value={newCoupon.discount} onChange={handleChange} required
                    />
                </div>
                <input type="text" placeholder="Coupon Description" className="w-full mt-2 p-2 border border-slate-200 outline-slate-400 rounded-md"
                    name="description" value={newCoupon.description} onChange={handleChange} required
                />

                <label>
                    <p className="mt-3">Coupon Expiry Date</p>
                    <input 
                        type="date" 
                        placeholder="Coupon Expires At" 
                        className="w-full mt-1 p-2 border border-slate-200 outline-slate-400 rounded-md"
                        name="expiresAt" 
                        value={format(newCoupon.expiresAt, 'yyyy-MM-dd')} 
                        min={format(new Date(new Date().setDate(new Date().getDate() + 1)), 'yyyy-MM-dd')}
                        onChange={handleChange}
                    />
                </label>

                <div className="mt-5">
                    <div className="flex gap-2 mt-3">
                        <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                            <input type="checkbox" className="sr-only peer"
                                name="forNewUser" checked={newCoupon.forNewUser}
                                onChange={(e) => setNewCoupon({ ...newCoupon, forNewUser: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                            <span className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                        </label>
                        <p>For New User</p>
                    </div>
                    <div className="flex gap-2 mt-3">
                        <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                            <input type="checkbox" className="sr-only peer"
                                name="forMember" checked={newCoupon.forMember}
                                onChange={(e) => setNewCoupon({ ...newCoupon, forMember: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                            <span className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                        </label>
                        <p>For Member</p>
                    </div>
                    <div className="flex gap-2 mt-3">
                        <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                            <input type="checkbox" className="sr-only peer"
                                name="isPublic" checked={newCoupon.isPublic}
                                onChange={(e) => setNewCoupon({ ...newCoupon, isPublic: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                            <span className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                        </label>
                        <p>Public Coupon</p>
                    </div>
                </div>
                <button className="mt-4 p-2 px-10 rounded bg-slate-700 text-white active:scale-95 transition">Add Coupon</button>
            </form>

            {/* List Coupons */}
            <div className="mt-14">
                <h2 className="text-2xl">List <span className="text-slate-800 font-medium">Coupons</span></h2>
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <p className="text-slate-400">Loading coupons...</p>
                    </div>
                ) : coupons.length > 0 ? (
                    <div className="overflow-x-auto mt-4 rounded-lg border border-slate-200 max-w-4xl">
                        <table className="min-w-full bg-white text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">Code</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">Description</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">Discount</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">Expires At</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">New User</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">For Member</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">Public</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {coupons.map((coupon) => (
                                    <tr key={coupon.code} className="hover:bg-slate-50">
                                        <td className="py-3 px-4 font-medium text-slate-800">{coupon.code}</td>
                                        <td className="py-3 px-4 text-slate-800">{coupon.description}</td>
                                        <td className="py-3 px-4 text-slate-800">{coupon.discount}%</td>
                                        <td className="py-3 px-4 text-slate-800">
                                            {coupon.expiresAt ? format(new Date(coupon.expiresAt), 'yyyy-MM-dd') : 'N/A'}
                                        </td>
                                        <td className="py-3 px-4 text-slate-800">{coupon.forNewUser ? 'Yes' : 'No'}</td>
                                        <td className="py-3 px-4 text-slate-800">{coupon.forMember ? 'Yes' : 'No'}</td>
                                        <td className="py-3 px-4 text-slate-800">{coupon.isPublic ? 'Yes' : 'No'}</td>
                                        <td className="py-3 px-4 text-slate-800">
                                            <DeleteIcon 
                                                onClick={() => toast.promise(
                                                    deleteCoupon(coupon.code), 
                                                    { 
                                                        loading: "Deleting coupon...",
                                                        success: 'Coupon deleted!',
                                                        error: 'Failed to delete'
                                                    }
                                                )} 
                                                className="w-5 h-5 text-red-500 hover:text-red-800 cursor-pointer" 
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-40 mt-4">
                        <p className="text-slate-400">No coupons available</p>
                    </div>
                )}
            </div>
        </div>
    )
}