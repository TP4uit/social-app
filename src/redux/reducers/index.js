import { combineReducers } from "redux";
import authReducer from "./authReducer";
import postsReducer from "./postsReducer";
import commentsReducer from "./commentsReducer";

export default combineReducers({
  auth: authReducer,
  posts: postsReducer,
  comments: commentsReducer,
});
