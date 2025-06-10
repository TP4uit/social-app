import chatApi from "../../api/chat";

export const SET_MESSAGES = "SET_MESSAGES";
export const ADD_MESSAGE = "ADD_MESSAGE";

export const setMessages = (chatId, messages) => ({
  type: SET_MESSAGES,
  payload: { chatId, messages },
});

export const addMessage = (chatId, message) => ({
  type: ADD_MESSAGE,
  payload: { chatId, message },
});

export const fetchChatHistory = (chatId, userId) => async (dispatch) => {
  try {
    const messages = await chatApi.getChatHistory(chatId, userId);
    // Map messages to include type field
    const mappedMessages = messages.map((msg) => ({
      ...msg,
      type: msg.imageUrl ? "image" : "text",
    }));
    dispatch(setMessages(chatId, mappedMessages));
  } catch (error) {
    console.error("Fetch chat history error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};
