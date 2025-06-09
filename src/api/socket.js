import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

let socket = null;

export const socketService = {
  connect: async () => {
    if (socket && socket.connected) return socket;

    const token = await AsyncStorage.getItem("auth_token");
    if (!token) {
      console.error("No auth token found in AsyncStorage");
      return null;
    }

    socket = io("http://localhost:3000", {
      auth: { token },
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return socket;
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  getSocket: () => socket,
};
