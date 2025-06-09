import { SET_MESSAGES, ADD_MESSAGE } from "../actions/chatActions";

const initialState = {
  messagesByChat: {}, // { [chatId]: [{ _id, from, to, content, type, createdAt }] }
};

const chatReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_MESSAGES: {
      const { chatId, messages } = action.payload;
      return {
        ...state,
        messagesByChat: {
          ...state.messagesByChat,
          [chatId]: messages,
        },
      };
    }
    case ADD_MESSAGE: {
      const { chatId, message } = action.payload;
      return {
        ...state,
        messagesByChat: {
          ...state.messagesByChat,
          [chatId]: [...(state.messagesByChat[chatId] || []), message],
        },
      };
    }
    default:
      return state;
  }
};

export default chatReducer;
