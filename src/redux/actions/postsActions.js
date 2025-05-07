import {
    FETCH_POSTS_REQUEST,
    FETCH_POSTS_SUCCESS,
    FETCH_POSTS_FAILURE,
    CREATE_POST_REQUEST,
    CREATE_POST_SUCCESS,
    CREATE_POST_FAILURE
  } from './types';
  import { postsService } from '../../api/posts';
  
  export const fetchPosts = (page = 1) => async (dispatch) => {
    dispatch({ type: FETCH_POSTS_REQUEST });
    
    try {
      const response = await postsService.getPosts(page);
      
      dispatch({
        type: FETCH_POSTS_SUCCESS,
        payload: {
          posts: response.data.posts,
          hasMore: response.data.hasMore,
          page
        }
      });
      
      return Promise.resolve(response.data);
    } catch (error) {
      dispatch({
        type: FETCH_POSTS_FAILURE,
        payload: { error: error.response?.data?.message || 'Failed to fetch posts' }
      });
      
      return Promise.reject(error);
    }
  };
  
  export const createPost = (postData) => async (dispatch) => {
    dispatch({ type: CREATE_POST_REQUEST });
    
    try {
      const response = await postsService.createPost(postData);
      
      dispatch({
        type: CREATE_POST_SUCCESS,
        payload: { post: response.data.post }
      });
      
      return Promise.resolve(response.data);
    } catch (error) {
      dispatch({
        type: CREATE_POST_FAILURE,
        payload: { error: error.response?.data?.message || 'Failed to create post' }
      });
      
      return Promise.reject(error);
    }
  };