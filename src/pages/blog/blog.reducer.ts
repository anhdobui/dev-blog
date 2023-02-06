import { createAction, createReducer, createSlice, current, nanoid, PayloadAction } from '@reduxjs/toolkit'
import { initalPostList } from '../../constants/blog'
import { Post } from '../../types/blog.type'

interface BlogState {
    postList: Post[]
    editingPost: Post | null
}
const initialState: BlogState = {
    postList: initalPostList,
    editingPost: null,
}

const blogSlice = createSlice({
    name: 'AAAA',
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
        addPost: {
            reducer: (state, action: PayloadAction<Post>) => {
                const post = action.payload
                state.postList.push(post)
            },
            prepare: (post: Omit<Post, 'id'>) => ({
                payload: {
                    ...post,
                    id: nanoid(),
                },
            }),
        },
    },
    extraReducers(builder) {
        builder
            .addMatcher(
                (action) => action.type.includes('hihi'),
                (state, action) => {
                    console.log('matcher case')
                },
            )
            .addDefaultCase(() => {
                console.log('default case')
            })
    },
})

export const { deletePost, startEditingPost, cancelEditingPost, finishEditingPost, addPost } = blogSlice.actions
export default blogSlice.reducer
