import { combineReducers } from "redux";
import authReducer from "./authReducer";
import postsReducer from "./postsReducer";
import commentsReducer from "./commentsReducer";
import chatReducer from "./chatReducer";

export default combineReducers({
  auth: authReducer,
  posts: postsReducer,
  comments: commentsReducer,
  chat: chatReducer,
});
