import {
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_FAILURE,
    LOGOUT
  } from '../actions/types';
  
  const initialState = {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false
  };
  
  export default function authReducer(state = initialState, action) {
    switch (action.type) {
      case LOGIN_REQUEST:
        return {
          ...state,
          loading: true,
          error: null
        };
      case LOGIN_SUCCESS:
        return {
          ...state,
          loading: false,
          user: action.payload.user,
          isAuthenticated: true,
          error: null
        };
      case LOGIN_FAILURE:
        return {
          ...state,
          loading: false,
          error: action.payload.error,
          isAuthenticated: false
        };
      case LOGOUT:
        return {
          ...initialState
        };
      default:
        return state;
    }
  }