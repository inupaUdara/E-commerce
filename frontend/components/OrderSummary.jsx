import { PlusIcon, SquarePenIcon, XIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import AddressModal from './AddressModal';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { clearCart } from '@/lib/features/cart/cartSlice';
import { createOrder } from '@/lib/api/orderApi';
import { getMyAddresses } from '@/lib/api/addressApi';
import { getCurrentUser } from '@/lib/api/userApi';
import { getCouponByCode, validateCoupon } from '@/lib/api/couponApi';

const OrderSummary = ({ totalPrice, items }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';

    const router = useRouter();
    const dispatch = useDispatch();

    const authUser = useSelector(state => state.auth.user);

    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [currentUser, setCurrentUser] = useState(authUser);
    const [addressList, setAddressList] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [coupon, setCoupon] = useState(null);

    const extractErrorMessage = (error, fallback) => {
        const responseData = error?.response?.data;

        if (typeof responseData === 'string' && responseData.trim()) {
            return responseData;
        }

        if (typeof responseData?.message === 'string' && responseData.message.trim()) {
            return responseData.message;
        }

        if (typeof responseData?.error === 'string' && responseData.error.trim()) {
            return responseData.error;
        }

        if (typeof error?.message === 'string' && error.message.trim()) {
            return error.message;
        }

        return fallback;
    };

    const loadCheckoutData = async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        if (!token) {
            setCurrentUser(null);
            setAddressList([]);
            setSelectedAddress(null);
            return;
        }

        const [user, addresses] = await Promise.all([
            authUser ? Promise.resolve(authUser) : getCurrentUser(),
            getMyAddresses(),
        ]);

        setCurrentUser(user);
        setAddressList(addresses || []);
        setSelectedAddress((previousAddress) => {
            if (previousAddress?.id) {
                const matchedAddress = (addresses || []).find((address) => address.id === previousAddress.id);
                if (matchedAddress) {
                    return matchedAddress;
                }
            }

            return (addresses || [])[0] || null;
        });
    };

    useEffect(() => {
        loadCheckoutData().catch(() => {
            setAddressList([]);
            setSelectedAddress(null);
        });
    }, [authUser]);

    const handleCouponCode = async (event) => {
        event.preventDefault();

        const normalizedCode = couponCodeInput.trim();

        if (!normalizedCode) {
            throw new Error('Enter a coupon code');
        }

        const isValid = await validateCoupon(normalizedCode);

        if (!isValid) {
            throw new Error('Coupon is invalid or expired');
        }

        const couponDetails = await getCouponByCode(normalizedCode);
        setCoupon(couponDetails);
        setCouponCodeInput('');
    }

    const handleAddressCreated = async (savedAddress) => {
        if (!savedAddress) {
            return;
        }

        setAddressList((previousList) => [...previousList, savedAddress]);
        setSelectedAddress(savedAddress);
        toast.success('Address saved');
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        if (!token) {
            router.push('/auth/login');
            throw new Error('Please login to place an order');
        }

        if (!items?.length) {
            throw new Error('Your cart is empty');
        }

        if (!selectedAddress?.id) {
            throw new Error('Please select an address');
        }

        const user = currentUser || await getCurrentUser();
        setCurrentUser(user);

        if (!user?.id) {
            throw new Error('Unable to identify the current user');
        }

        const uniqueStoreIds = [...new Set(items.map((item) => item?.storeId).filter(Boolean))];

        if (uniqueStoreIds.length !== 1) {
            throw new Error('All cart items must belong to the same store to place one order');
        }

        if (uniqueStoreIds.length === 0) {
            throw new Error('Store information is missing for one or more cart items');
        }

        const orderPayload = {
            userId: user.id,
            storeId: uniqueStoreIds[0],
            addressId: selectedAddress.id,
            paymentMethod,
            couponCode: coupon?.code || '',
            items: items.map((item) => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.price,
            })),
        };

        await createOrder(orderPayload);
        dispatch(clearCart());

        toast.success('Order placed successfully');
        router.push('/orders')
    }

    return (
        <div className='w-full max-w-lg lg:max-w-[340px] bg-slate-50/30 border border-slate-200 text-slate-500 text-sm rounded-xl p-7'>
            <h2 className='text-xl font-medium text-slate-600'>Payment Summary</h2>
            <p className='text-slate-400 text-xs my-4'>Payment Method</p>
            <div className='flex gap-2 items-center'>
                <input type="radio" id="COD" onChange={() => setPaymentMethod('COD')} checked={paymentMethod === 'COD'} className='accent-gray-500' />
                <label htmlFor="COD" className='cursor-pointer'>COD</label>
            </div>
            <div className='flex gap-2 items-center mt-1'>
                <input type="radio" id="STRIPE" name='payment' onChange={() => setPaymentMethod('STRIPE')} checked={paymentMethod === 'STRIPE'} className='accent-gray-500' />
                <label htmlFor="STRIPE" className='cursor-pointer'>Stripe Payment</label>
            </div>
            <div className='my-4 py-4 border-y border-slate-200 text-slate-400'>
                <p>Address</p>
                {
                    selectedAddress ? (
                        <div className='flex gap-2 items-center'>
                            <p>{selectedAddress.name}, {selectedAddress.city}, {selectedAddress.state}, {selectedAddress.zip}</p>
                            <SquarePenIcon onClick={() => setSelectedAddress(null)} className='cursor-pointer' size={18} />
                        </div>
                    ) : (
                        <div>
                            {
                                addressList.length > 0 && (
                                    <select className='border border-slate-400 p-2 w-full my-3 outline-none rounded' value={selectedAddress?.id || ''} onChange={(e) => setSelectedAddress(addressList.find((address) => address.id === e.target.value) || null)} >
                                        <option value="">Select Address</option>
                                        {
                                            addressList.map((address, index) => (
                                                <option key={address.id || index} value={address.id}>{address.name}, {address.city}, {address.state}, {address.zip}</option>
                                            ))
                                        }
                                    </select>
                                )
                            }
                            <button className='flex items-center gap-1 text-slate-600 mt-1' onClick={() => setShowAddressModal(true)} >Add Address <PlusIcon size={18} /></button>
                        </div>
                    )
                }
            </div>
            <div className='pb-4 border-b border-slate-200'>
                <div className='flex justify-between'>
                    <div className='flex flex-col gap-1 text-slate-400'>
                        <p>Subtotal:</p>
                        <p>Shipping:</p>
                        {coupon && <p>Coupon:</p>}
                    </div>
                    <div className='flex flex-col gap-1 font-medium text-right'>
                        <p>{currency}{totalPrice.toLocaleString()}</p>
                        <p>Free</p>
                        {coupon && <p>{`-${currency}${(coupon.discount / 100 * totalPrice).toFixed(2)}`}</p>}
                    </div>
                </div>
                {
                    !coupon ? (
                        <form onSubmit={e => toast.promise(handleCouponCode(e), { loading: 'Checking Coupon...', error: (error) => extractErrorMessage(error, 'Failed to apply coupon') })} className='flex justify-center gap-3 mt-3'>
                            <input onChange={(e) => setCouponCodeInput(e.target.value)} value={couponCodeInput} type="text" placeholder='Coupon Code' className='border border-slate-400 p-1.5 rounded w-full outline-none' />
                            <button className='bg-slate-600 text-white px-3 rounded hover:bg-slate-800 active:scale-95 transition-all'>Apply</button>
                        </form>
                    ) : (
                        <div className='w-full flex items-center justify-center gap-2 text-xs mt-2'>
                            <p>Code: <span className='font-semibold ml-1'>{coupon.code.toUpperCase()}</span></p>
                            <p>{coupon.description}</p>
                            <XIcon size={18} onClick={() => setCoupon(null)} className='hover:text-red-700 transition cursor-pointer' />
                        </div>
                    )
                }
            </div>
            <div className='flex justify-between py-4'>
                <p>Total:</p>
                <p className='font-medium text-right'>{currency}{coupon ? (totalPrice - (coupon.discount / 100 * totalPrice)).toFixed(2) : totalPrice.toLocaleString()}</p>
            </div>
            <button onClick={e => toast.promise(handlePlaceOrder(e), { loading: 'placing Order...', error: (error) => extractErrorMessage(error, 'Failed to place order') })} className='w-full bg-slate-700 text-white py-2.5 rounded hover:bg-slate-900 active:scale-95 transition-all'>Place Order</button>

            {showAddressModal && <AddressModal setShowAddressModal={setShowAddressModal} onAddressCreated={handleAddressCreated} />}

        </div>
    )
}

export default OrderSummary