'use client'
import { useEffect, useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore } from '../lib/store'
import { hydrateCart } from '@/lib/features/cart/cartSlice'

export default function StoreProvider({ children }) {
  const storeRef = useRef(undefined)
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore()
  }

  useEffect(() => {
    const store = storeRef.current

    const readStoredCart = () => {
      try {
        const rawCart = localStorage.getItem('cart')
        return rawCart ? JSON.parse(rawCart) : { cartItems: {} }
      } catch {
        return { cartItems: {} }
      }
    }

    store.dispatch(hydrateCart(readStoredCart()))

    const unsubscribe = store.subscribe(() => {
      const state = store.getState()
      localStorage.setItem('cart', JSON.stringify({ cartItems: state.cart.cartItems }))
    })

    return unsubscribe
  }, [])

  return <Provider store={storeRef.current}>{children}</Provider>
}