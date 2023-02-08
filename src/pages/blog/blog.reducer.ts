import {
    AsyncThunk,
    createAction,
    createAsyncThunk,
    createReducer,
    createSlice,
    current,
    nanoid,
    PayloadAction,
} from '@reduxjs/toolkit'
import { initalPostList } from '../../constants/blog'
import { Post } from '../../types/blog.type'
import http from '../../utils/http'

type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>

type PendingAction = ReturnType<GenericAsyncThunk['pending']>
type RejectedAction = ReturnType<GenericAsyncThunk['rejected']>
type FulfilledAction = ReturnType<GenericAsyncThunk['fulfilled']>

interface BlogState {
    postList: Post[]
    editingPost: Post | null
    loading: boolean
    currentRequestId: undefined | string
}
const initialState: BlogState = {
    postList: [],
    editingPost: null,
    loading: false,
    currentRequestId: undefined,
}
export const getPostList = createAsyncThunk('blog/getPostList', async (_, thunkAPI) => {
    const response = await http.get<Post[]>('posts', {
        signal: thunkAPI.signal,
    })
    return response.data
})
export const addPost = createAsyncThunk('blog/addPost', async (body: Omit<Post, 'id'>, thunkAPI) => {
    try {
        const response = await http.post<Post>('posts', body, {
            signal: thunkAPI.signal,
        })
        return response.data
    } catch (error: any) {
        if (error.name === 'AxiosError' && error.response.status === 422) {
            return thunkAPI.rejectWithValue(error.response.data)
        }
        throw error
    }
})
export const updatePost = createAsyncThunk(
    'blog/updatePost',
    async ({ postId, body }: { postId: string; body: Post }, thunkAPI) => {
        try {
            const response = await http.put<Post>(`posts/${postId}`, body, {
                signal: thunkAPI.signal,
            })
            return response.data
        } catch (error: any) {
            if (error.name === 'AxiosError' && error.response.status === 422) {
                return thunkAPI.rejectWithValue(error.response.data)
            }
            throw error
        }
    },
)
export const deletePost = createAsyncThunk('blog/deletePost', async (postId: string, thunkAPI) => {
    const response = await http.delete(`posts/${postId}`, {
        signal: thunkAPI.signal,
    })
    return response.data
})
const blogSlice = createSlice({
    name: 'blog',
    initialState,
    reducers: {
        deletePost: (state, action: PayloadAction<string>) => {
            const foundPostIndex = state.postList.findIndex((post) => post.id === action.payload)
            if (foundPostIndex !== -1) {
                state.postList.splice(foundPostIndex, 1)
            }
        },
        startEditingPost: (state, action: PayloadAction<string>) => {
            const foundPost = state.postList.find((post) => post.id === action.payload) || null
            state.editingPost = foundPost
        },
        cancelEditingPost: (state) => {
            state.editingPost = null
        },
        finishEditingPost: (state, action: PayloadAction<Post>) => {
            const postId = action.payload.id
            state.postList.some((post, index) => {
                if (post.id === postId) {
                    state.postList[index] = action.payload
                    return true
                }
                return false
            })
            state.editingPost = null
        },
    },
    extraReducers(builder) {
        builder
            .addCase(getPostList.fulfilled, (state, action) => {
                state.postList = action.payload
            })
            .addCase(addPost.fulfilled, (state, action) => {
                state.postList.push(action.payload)
            })
            .addCase(updatePost.fulfilled, (state, action) => {
                state.postList.some((post, index) => {
                    if (post.id === action.payload.id) {
                        state.postList[index] = action.payload
                        return true
                    }
                    return false
                })
                state.editingPost = null
            })
            .addCase(deletePost.fulfilled, (state, action) => {
                const postId = action.meta.arg
                const deletePostIndex = state.postList.findIndex((post) => post.id === postId)
                state.postList.splice(deletePostIndex, 1)
            })
            .addMatcher<PendingAction>(
                (action) => action.type.endsWith('/pending'),
                (state, action) => {
                    state.loading = true
                    state.currentRequestId = action.meta.requestId
                },
            )
            .addMatcher<RejectedAction | FulfilledAction>(
                (action) => action.type.endsWith('/rejected') || action.type.endsWith('/fulfilled'),
                (state, action) => {
                    if (state.currentRequestId && state.currentRequestId === action.meta.requestId) {
                        state.loading = false
                        state.currentRequestId = undefined
                    }
                },
            )
            .addDefaultCase(() => {})
    },
})

export const { startEditingPost, cancelEditingPost, finishEditingPost } = blogSlice.actions
export default blogSlice.reducer
