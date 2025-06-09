import apiClient from "./client";

export const postsService = {
  getPosts: () => apiClient.get(`/posts`),

  getPostById: (id) => apiClient.get(`/posts/${id}`),

  createPost: (postData) => apiClient.post("/posts", postData),

  updatePost: (id, postData) => apiClient.put(`/posts/${id}`, postData),

  deletePost: (id) => apiClient.delete(`/posts/${id}`),

  likePost: (id) => apiClient.post(`/posts/${id}/like`),

  commentOnPost: (id, comment) =>
    apiClient.post(`/posts/${id}/comments`, { content: comment }),

  fetchCommentOfPost: (id) => {
    return apiClient.get(`/comments/post/${id}`);
  },
};
