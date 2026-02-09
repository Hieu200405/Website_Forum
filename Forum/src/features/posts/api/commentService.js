import axios from '@/lib/axios';

export const getPostDetail = async (id) => {
    const response = await axios.get(`/posts/${id}`);
    // Response after interceptor: { success: true, data: {...post} }
    return response;
};

export const getCommentsByPost = async (postId) => {
    // Updated to match new route: GET /api/posts/:postId/comments
    const response = await axios.get(`/posts/${postId}/comments`);
    // Response: { success: true, data: [...comments] }
    return response.data || [];
};

export const createComment = async ({ postId, content }) => {
    // POST /api/posts/:postId/comments
    const response = await axios.post(`/posts/${postId}/comments`, { content });
    // Response: { success: true, data: {...comment} }
    return response;
};

export const replyComment = async ({ parentId, content }) => {
    // POST /api/comments/reply
    const response = await axios.post(`/comments/reply`, { parent_id: parentId, content });
    // Response: { success: true, data: {...comment} }
    return response;
};
