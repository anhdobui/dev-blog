import { configureStore } from '@reduxjs/toolkit'
import blogReducer from './pages/blog/blog.reducer'
import { useDispatch } from 'react-redux'

export const store = configureStore({
    reducer: { blog: blogReducer },
})
const F = function () {
    return store.getState()
}
export type RootState = ReturnType<typeof F>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()
