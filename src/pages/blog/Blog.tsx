import CreatePost from './component/CreatePost'
import PostList from './component/PostList/PostList'

function Blog() {
    return (
        <div className="p-5">
            <CreatePost />
            <PostList />
        </div>
    )
}

export default Blog
