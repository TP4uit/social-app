import { io } from "socket.io-client";
import { getAuthToken } from "../utils/auth";

const SOCKET_URL = "http://192.168.79.239:3000";

const socketService = {
  socket: null,
  isConnecting: false,

  connect: async () => {
    if (socketService.socket?.connected) {
      console.log(
        "Reusing existing socket connection:",
        socketService.socket.id
      );
      return socketService.socket;
    }

    if (socketService.isConnecting) {
      console.log("Connection in progress, waiting...");
      return new Promise((resolve) => {
        const checkConnection = setInterval(() => {
          if (socketService.socket?.connected) {
            clearInterval(checkConnection);
            resolve(socketService.socket);
          }
        }, 100);
      });
    }

    try {
      socketService.isConnecting = true;
      const token = await getAuthToken();
      if (!token) {
        console.error("No auth token found");
        socketService.isConnecting = false;
        return null;
      }

      socketService.socket = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
      });

      return new Promise((resolve, reject) => {
        socketService.socket.on("connect", () => {
          console.log("Socket connected:", socketService.socket.id);
          socketService.isConnecting = false;
          resolve(socketService.socket);
        });

        socketService.socket.on("connect_error", (error) => {
          console.error("Socket connection error:", error.message);
          socketService.isConnecting = false;
          socketService.socket = null;
          reject(error);
        });

        socketService.socket.on("disconnect", (reason) => {
          console.log("Socket disconnected:", reason);
          socketService.isConnecting = false;
          socketService.socket = null;
        });
      });
    } catch (error) {
      console.error("Socket connect error:", error.message);
      socketService.isConnecting = false;
      return null;
    }
  },

  on: (event, callback) => {
    if (socketService.socket) {
      socketService.socket.on(event, callback);
    } else {
      console.error(`Cannot listen to ${event}: Socket not initialized`);
    }
  },

  off: (event, callback) => {
    if (socketService.socket) {
      socketService.socket.off(event, callback);
    }
  },

  emit: (event, data) => {
    if (socketService.socket) {
      socketService.socket.emit(event, data);
    } else {
      console.error(`Cannot emit ${event}: Socket not initialized`);
    }
  },

  disconnect: () => {
    if (socketService.socket) {
      socketService.socket.disconnect();
      socketService.socket = null;
      socketService.isConnecting = false;
      console.log("Socket manually disconnected");
    }
  },
};

export { socketService };
