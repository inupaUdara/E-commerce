import { createSlice } from '@reduxjs/toolkit'


const ratingSlice = createSlice({
    name: 'rating',
    initialState: {
        ratings: [],
    },
    reducers: {
        setRatings: (state, action) => {
            state.ratings = action.payload || []
        },
        addRating: (state, action) => {
            state.ratings.push(action.payload)
        },
    }
})

export const { setRatings, addRating } = ratingSlice.actions

export default ratingSlice.reducer