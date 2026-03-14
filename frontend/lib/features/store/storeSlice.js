import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getMyStore } from '@/lib/api/storeApi';
import { logout } from '../auth/authSlice';

// Async thunk for fetching user's store
export const fetchMyStore = createAsyncThunk(
    'store/fetchMyStore',
    async (_, { rejectWithValue }) => {
        try {
            const storeData = await getMyStore();
            return storeData;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch store');
        }
    }
);

const storeSlice = createSlice({
    name: 'store',
    initialState: {
        storeInfo: null,
        loading: false,
        error: null,
        hasStore: false,
        isApproved: false,
    },
    reducers: {
        clearStore: (state) => {
            state.storeInfo = null;
            state.hasStore = false;
            state.isApproved = false;
            state.error = null;
        },
        updateStoreStatus: (state, action) => {
            if (state.storeInfo) {
                state.storeInfo.status = action.payload;
                state.isApproved = action.payload === 'approved';
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMyStore.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyStore.fulfilled, (state, action) => {
                state.loading = false;
                state.storeInfo = action.payload;
                state.hasStore = true;
                state.isApproved = action.payload?.status === 'approved';
            })
            .addCase(fetchMyStore.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.storeInfo = null;
                state.hasStore = false;
                state.isApproved = false;
            })
            // Clear store state when user logs out
            .addCase(logout, (state) => {
                state.storeInfo = null;
                state.hasStore = false;
                state.isApproved = false;
                state.error = null;
                state.loading = false;
            });
    },
});

export const { clearStore, updateStoreStatus } = storeSlice.actions;
export default storeSlice.reducer;
