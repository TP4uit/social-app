import {
    FETCH_POSTS_REQUEST,
    FETCH_POSTS_SUCCESS,
    FETCH_POSTS_FAILURE,
    CREATE_POST_REQUEST,
    CREATE_POST_SUCCESS,
    CREATE_POST_FAILURE
  } from '../actions/types';
  
  const initialState = {
    posts: [],
    loading: false,
    error: null,
    page: 1,
    hasMore: true,
    creating: false,
    createError: null
  };
  
  export default function postsReducer(state = initialState, action) {
    switch (action.type) {
      case FETCH_POSTS_REQUEST:
        return {
          ...state,
          loading: true,
          error: null
        };
      case FETCH_POSTS_SUCCESS:
        return {
          ...state,
          loading: false,
          posts: action.payload.page === 1 
            ? action.payload.posts 
            : [...state.posts, ...action.payload.posts],
          page: action.payload.page,
          hasMore: action.payload.hasMore,
          error: null
        };
      case FETCH_POSTS_FAILURE:
        return {
          ...state,
          loading: false,
          error: action.payload.error
        };
      case CREATE_POST_REQUEST:
        return {
          ...state,
          creating: true,
          createError: null
        };
      case CREATE_POST_SUCCESS:
        return {
          ...state,
          creating: false,
          posts: [action.payload.post, ...state.posts],
          createError: null
        };
      case CREATE_POST_FAILURE:
        return {
          ...state,
          creating: false,
          createError: action.payload.error
        };
      default:
        return state;
    }
  }