import { createSlice } from '@reduxjs/toolkit'

const calculateTotal = (cartItems = {}) => {
    return Object.values(cartItems).reduce((sum, quantity) => sum + Number(quantity || 0), 0)
}

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        total: 0,
        cartItems: {},
        hydrated: false,
    },
    reducers: {
        addToCart: (state, action) => {
            const { productId } = action.payload
            if (state.cartItems[productId]) {
                state.cartItems[productId]++
            } else {
                state.cartItems[productId] = 1
            }
            state.total += 1
        },
        removeFromCart: (state, action) => {
            const { productId } = action.payload
            if (state.cartItems[productId]) {
                state.cartItems[productId]--
                state.total = Math.max(0, state.total - 1)
                if (state.cartItems[productId] === 0) {
                    delete state.cartItems[productId]
                }
            }
        },
        deleteItemFromCart: (state, action) => {
            const { productId } = action.payload
            state.total -= state.cartItems[productId] ? state.cartItems[productId] : 0
            delete state.cartItems[productId]
        },
        clearCart: (state) => {
            state.cartItems = {}
            state.total = 0
        },
        hydrateCart: (state, action) => {
            const cartItems = action.payload?.cartItems && typeof action.payload.cartItems === 'object'
                ? action.payload.cartItems
                : {}

            state.cartItems = cartItems
            state.total = calculateTotal(cartItems)
            state.hydrated = true
        },
    }
})

export const { addToCart, removeFromCart, clearCart, deleteItemFromCart, hydrateCart } = cartSlice.actions

export default cartSlice.reducer
