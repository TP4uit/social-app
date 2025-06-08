import { postsService } from "../../api/posts";
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
} from "./types";

export const fetchPosts = () => async (dispatch, getState) => {
  dispatch({ type: FETCH_POSTS_REQUEST });

  try {
    const response = await postsService.getPosts();
    console.log("API Response:", response.data);
    const allPosts = Array.isArray(response.data.posts)
      ? response.data.posts
      : Array.isArray(response.data)
      ? response.data
      : [];

    const filteredPosts = allPosts.filter((post) => !post.isDeleted);
    const postsPerPage = 10;
    const initialDisplayedPosts = filteredPosts.slice(0, postsPerPage);

    dispatch({
      type: FETCH_POSTS_SUCCESS,
      payload: {
        allPosts: filteredPosts,
        displayedPosts: initialDisplayedPosts,
        displayedCount: initialDisplayedPosts.length,
      },
    });

    return Promise.resolve(response.data);
  } catch (error) {
    console.error("Fetch Posts Error:", error);
    dispatch({
      type: FETCH_POSTS_FAILURE,
      payload: {
        error: error.response?.data?.message || "Failed to fetch posts",
      },
    });

    return Promise.reject(error);
  }
};

export const loadMorePosts = () => (dispatch, getState) => {
  const { allPosts, displayedCount } = getState().posts;
  const postsPerPage = 10;
  const nextPosts = allPosts.slice(
    displayedCount,
    displayedCount + postsPerPage
  );

  if (nextPosts.length > 0) {
    dispatch({
      type: FETCH_POSTS_SUCCESS,
      payload: {
        allPosts,
        displayedPosts: [...getState().posts.displayedPosts, ...nextPosts],
        displayedCount: displayedCount + nextPosts.length,
      },
    });
  }
};

export const createPost = (postData) => async (dispatch) => {
  dispatch({ type: CREATE_POST_REQUEST });

  try {
    const response = await postsService.createPost(postData);

    dispatch({
      type: CREATE_POST_SUCCESS,
      payload: { post: response.data.post },
    });

    return Promise.resolve(response.data);
  } catch (error) {
    dispatch({
      type: CREATE_POST_FAILURE,
      payload: {
        error: error.response?.data?.message || "Failed to create post",
      },
    });

    return Promise.reject(error);
  }
};

export const likePost = (postId, userId, isLiking) => async (dispatch) => {
  dispatch({
    type: LIKE_POST_REQUEST,
    payload: { postId, userId, isLiking },
  });

  try {
    const response = await postsService.likePost(postId);
    dispatch({
      type: LIKE_POST_SUCCESS,
      payload: { postId, userId, isLiking },
    });
    return response.data;
  } catch (error) {
    dispatch({
      type: LIKE_POST_FAILURE,
      payload: {
        postId,
        error: error.response?.data?.message || "Failed to like post",
      },
    });
    throw error;
  }
};
