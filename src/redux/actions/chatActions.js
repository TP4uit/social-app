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

export const fetchChatHistory = (partnerId) => async (dispatch) => {
  try {
    const messages = await chatApi.getChatHistory(partnerId);
    dispatch(setMessages(partnerId, messages));
  } catch (error) {
    console.error("Fetch chat history error:", error);
    throw error;
  }
};
