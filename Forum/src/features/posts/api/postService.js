import api from '@/lib/axios';

// Lấy danh sách bài viết
export const getPosts = async ({ page = 1, limit = 10, sort = 'newest' }) => {
  // Backend trả về: { data: [...], page, limit, total }
  // Endpoint: GET /posts?page=1&limit=10&sort=newest
  return await api.get(`/posts?page=${page}&limit=${limit}&sort=${sort}`);
};

// Tạo bài viết mới
export const createPost = async (postData) => {
  // postData: { title, content, categoryId }
  return await api.post('/posts', postData);
};

// Xóa bài viết
export const deletePost = async (id) => {
  return await api.delete(`/posts/${id}`);
};

// Cập nhật bài viết
export const updatePost = async ({ id, data }) => {
  return await api.put(`/posts/${id}`, data);
};

export const likePost = async (postId) => {
  return await api.post(`/posts/${postId}/like`);
};

export const unlikePost = async (postId) => {
  return await api.delete(`/posts/${postId}/like`);
};
