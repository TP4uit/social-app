// src/api/mockPosts.js
import { getFeed, getPostById, createPost, likePost, commentOnPost, getCurrentUser } from '../utils/dummyData';

export const mockPostsService = {
  getPosts: async (page = 1, limit = 10) => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const result = getFeed(page, limit);
      return { data: result };
    } catch (error) {
      throw { 
        response: { 
          data: { 
            message: error.message || 'Failed to fetch posts' 
          } 
        } 
      };
    }
  },
  
  getPostById: async (id) => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const post = getPostById(id);
      if (!post) {
        throw new Error('Post not found');
      }
      
      return { data: { post } };
    } catch (error) {
      throw { 
        response: { 
          data: { 
            message: error.message || 'Failed to fetch post' 
          } 
        } 
      };
    }
  },
  
  createPost: async (postData) => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      const newPost = createPost(user.id, postData.content, postData.image);
      return { data: { post: newPost } };
    } catch (error) {
      throw { 
        response: { 
          data: { 
            message: error.message || 'Failed to create post' 
          } 
        } 
      };
    }
  },
  
  updatePost: async (id, postData) => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const post = getPostById(id);
      if (!post) {
        throw new Error('Post not found');
      }
      
      // Update post content
      post.content = postData.content;
      if (postData.image) {
        post.image = postData.image;
      }
      
      return { data: { post } };
    } catch (error) {
      throw { 
        response: { 
          data: { 
            message: error.message || 'Failed to update post' 
          } 
        } 
      };
    }
  },
  
  deletePost: async (id) => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // In a real app, we would remove the post from the array
      // For this mock service, we'll just return success
      return { data: { success: true } };
    } catch (error) {
      throw { 
        response: { 
          data: { 
            message: error.message || 'Failed to delete post' 
          } 
        } 
      };
    }
  },
  
  likePost: async (id) => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      const updatedPost = likePost(id, user.id);
      return { data: { post: updatedPost } };
    } catch (error) {
      throw { 
        response: { 
          data: { 
            message: error.message || 'Failed to like post' 
          } 
        } 
      };
    }
  },
  
  commentOnPost: async (id, comment) => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 700));
      
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      const newComment = commentOnPost(id, user.id, comment.content);
      return { data: { comment: newComment } };
    } catch (error) {
      throw { 
        response: { 
          data: { 
            message: error.message || 'Failed to comment on post' 
          } 
        } 
      };
    }
  },
};