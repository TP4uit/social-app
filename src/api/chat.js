import apiClient from "./client";

const chatApi = {
  async getChatHistory(partnerId) {
    try {
      const response = await apiClient.get(`/chat/history/${partnerId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch chat history"
      );
    }
  },
};

export default chatApi;
