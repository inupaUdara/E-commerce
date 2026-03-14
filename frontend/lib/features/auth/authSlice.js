import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '@/lib/api/client';
import { getCurrentUser } from '@/lib/api/userApi';
import { toast } from 'react-hot-toast';

// Async thunk for fetching current user
export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const userData = await getCurrentUser();
            return userData;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch user');
        }
    }
);

// Async thunk for login
export const loginUser = createAsyncThunk(
    'auth/login',
    async ({ email, password }, { rejectWithValue, dispatch }) => {
        try {
            const response = await client.post('/auth/authenticate', { email, password });
            localStorage.setItem('token', response.data.token);
            // Fetch user data after login
            await dispatch(fetchCurrentUser());
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
            return rejectWithValue(error.response?.data || 'Login failed');
        }
    }
);

// Async thunk for register
export const registerUser = createAsyncThunk(
    'auth/register',
    async ({ name, email, password }, { rejectWithValue, dispatch }) => {
        try {
            const response = await client.post('/auth/register', { name, email, password });
            localStorage.setItem('token', response.data.token);
            toast.success('Registration successful!');
            // Fetch user data after registration
            await dispatch(fetchCurrentUser());
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
            return rejectWithValue(error.response?.data || 'Registration failed');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: null,
        loading: false,
        error: null,
        isAuthenticated: false,
        role: null,
    },
    reducers: {
        logout: (state) => {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
            }
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.role = null;
            toast.success('Logged out successfully');
        },
        checkAuth: (state) => {
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('token');
                state.token = token;
                state.isAuthenticated = !!token;
            }
        },
        setAuthFromStorage: (state) => {
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('token');
                state.token = token;
                state.isAuthenticated = !!token;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch current user cases
            .addCase(fetchCurrentUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.role = action.payload.role;
            })
            .addCase(fetchCurrentUser.rejected, (state) => {
                state.loading = false;
                state.user = null;
                state.role = null;
            })
            // Login cases
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Register cases
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout, checkAuth, setAuthFromStorage } = authSlice.actions;
export default authSlice.reducer;
