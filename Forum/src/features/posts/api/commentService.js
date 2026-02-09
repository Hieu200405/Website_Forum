import axios from '@/lib/axios';

export const getPostDetail = async (id) => {
    const response = await axios.get(`/posts/${id}`);
    // Response after interceptor: { success: true, data: {...post} }
    return response;
};

export const getCommentsByPost = async (postId) => {
    // Backend: router.get('/post/:postId', CommentController.getByPost);
    // Assuming prefix is /comments
    const response = await axios.get(`/comments/post/${postId}`);
    return response.data;
};

export const createComment = async ({ postId, content }) => {
    // Backend: router.post('/:postId/comments', ...)
    const response = await axios.post(`/posts/${postId}/comments`, { content });
    return response.data;
};

export const replyComment = async ({ parentId, content }) => {
    // Backend: router.post('/reply', ...)
    const response = await axios.post(`/comments/reply`, { parent_id: parentId, content });
    return response.data;
};
