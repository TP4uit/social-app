import {
  FETCH_POSTS_REQUEST,
  FETCH_POSTS_SUCCESS,
  FETCH_POSTS_FAILURE,
  CREATE_POST_REQUEST,
  CREATE_POST_SUCCESS,
  CREATE_POST_FAILURE,
  LIKE_POST_REQUEST,
  LIKE_POST_SUCCESS,
  LIKE_POST_FAILURE,
} from "../actions/types";

const initialState = {
  allPosts: [],
  displayedPosts: [],
  displayedCount: 0,
  loading: false,
  error: null,
  creating: false,
  createError: null,
};

export default function postsReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_POSTS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_POSTS_SUCCESS:
      return {
        ...state,
        loading: false,
        allPosts: action.payload.allPosts,
        displayedPosts: action.payload.displayedPosts,
        displayedCount: action.payload.displayedCount,
        error: null,
      };
    case FETCH_POSTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };
    case CREATE_POST_REQUEST:
      return {
        ...state,
        creating: true,
        createError: null,
      };
    case CREATE_POST_SUCCESS:
      return {
        ...state,
        creating: false,
        allPosts: [action.payload.post, ...state.allPosts],
        displayedPosts: [action.payload.post, ...state.displayedPosts].slice(
          0,
          state.displayedCount + 1
        ),
        displayedCount: Math.min(
          state.displayedCount + 1,
          state.allPosts.length + 1
        ),
        createError: null,
      };
    case CREATE_POST_FAILURE:
      return {
        ...state,
        creating: false,
        createError: action.payload.error,
      };
    case LIKE_POST_REQUEST:
    case LIKE_POST_SUCCESS:
      return {
        ...state,
        allPosts: state.allPosts.map((post) =>
          post._id === action.payload.postId
            ? {
                ...post,
                likes: action.payload.isLiking
                  ? [...(post.likes ?? []), action.payload.userId]
                  : (post.likes ?? []).filter(
                      (id) => id !== action.payload.userId
                    ),
              }
            : post
        ),
        displayedPosts: state.displayedPosts.map((post) =>
          post._id === action.payload.postId
            ? {
                ...post,
                likes: action.payload.isLiking
                  ? [...(post.likes ?? []), action.payload.userId]
                  : (post.likes ?? []).filter(
                      (id) => id !== action.payload.userId
                    ),
              }
            : post
        ),
      };
    case LIKE_POST_FAILURE:
      return {
        ...state,
        error: action.payload.error,
      };
    default:
      return state;
  }
}
