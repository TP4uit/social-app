import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT,
} from "../actions/types";

const initialState = {
  user: null,
  privacy: null, // Add privacy to initial state
  loading: false,
  error: null,
  isAuthenticated: false,
};

export default function authReducer(state = initialState, action) {
  switch (action.type) {
    case LOGIN_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        privacy: action.payload.privacy || null, // Store privacy, fallback to null
        isAuthenticated: true,
        error: null,
      };
    case LOGIN_FAILURE:
      return {
        ...state,
        loading: false,
        user: null,
        privacy: null, // Clear privacy on failure
        error: action.payload.error,
        isAuthenticated: false,
      };
    case LOGOUT:
      return {
        ...initialState, // Reset to initial state, including privacy: null
      };
    default:
      return state;
  }
}
