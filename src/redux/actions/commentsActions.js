import { postsService } from "../../api/posts";

export const fetchComments = (postId) => async (dispatch) => {
  try {
    const response = await postsService.fetchCommentOfPost(postId);
    dispatch({
      type: "SET_COMMENTS",
      payload: { postId, comments: response.data },
    });
  } catch (error) {
    console.error("Fetch comments error:", error);
    throw error;
  }
};

export const addComment = (postId, comment) => ({
  type: "ADD_COMMENT",
  payload: { postId, comment },
});
