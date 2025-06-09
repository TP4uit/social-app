import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import store from "./redux/store";
import AppNavigator from "./navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService } from "./api/auth";
import { LOGIN_SUCCESS } from "./redux/actions/types";
import { socketService } from "./api/socket";

export default function Main() {
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("auth_token");
        if (token) {
          const response = await authService.getProfile();
          store.dispatch({
            type: LOGIN_SUCCESS,
            payload: { user: response.data },
          });
          // Initialize Socket.IO after fetching user
          await socketService.connect();
        }
      } catch (error) {
        console.log("Auth check error:", error);
        await AsyncStorage.removeItem("auth_token");
        socketService.disconnect();
      }
    };

    checkAuth();
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}
