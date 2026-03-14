'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser } from '@/lib/features/auth/authSlice'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

const Register = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    
    const dispatch = useDispatch()
    const router = useRouter()
    const { loading, error } = useSelector(state => state.auth)

    const handleSubmit = async (e) => {
        e.preventDefault()
        const result = await dispatch(registerUser({ name, email, password }))
        if (!result.error) {
            router.push('/')
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
             <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center">
                    <h2 className="mt-2 text-4xl font-bold text-slate-800 tracking-tight">Create Account</h2>
                    <p className="mt-2 text-sm text-slate-500">Join us and start shopping in minutes</p>
                </div>
                
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                         <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                                Full Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="email-address" className="block text-sm font-medium text-slate-700 mb-1">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm"
                                    placeholder="Create a strong password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="terms"
                            name="terms"
                            type="checkbox"
                            required
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="terms" className="ml-2 block text-sm text-slate-600">
                            I agree to the <Link href="#" className="font-medium text-indigo-600 hover:text-indigo-500">Terms of Service</Link> and <Link href="#" className="font-medium text-indigo-600 hover:text-indigo-500">Privacy Policy</Link>
                        </label>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                             className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                             {loading ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </div>

                     <div className="text-center">
                         <p className="text-sm text-gray-500">
                            Already have an account?{' '}
                            <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition">
                                Sign in
                            </Link>
                        </p>
                    </div>

                </form>
            </div>
        </div>
    )
}

export default Register
