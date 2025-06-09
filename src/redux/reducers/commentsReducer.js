const initialState = {
  commentsByPost: {}, // { postId: [comment, ...] }
};

export default function commentsReducer(state = initialState, action) {
  switch (action.type) {
    case "SET_COMMENTS":
      return {
        ...state,
        commentsByPost: {
          ...state.commentsByPost,
          [action.payload.postId]: action.payload.comments,
        },
      };
    case "ADD_COMMENT":
      return {
        ...state,
        commentsByPost: {
          ...state.commentsByPost,
          [action.payload.postId]: [
            ...(state.commentsByPost[action.payload.postId] || []),
            action.payload.comment,
          ],
        },
      };
    default:
      return state;
  }
}
