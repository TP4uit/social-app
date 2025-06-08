import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { colors, spacing, typography } from "../../theme";
import { useAuth } from "../../hooks/useAuth";
import Input from "../common/Input"; // Sử dụng Input component
import Button from "../common/Button"; // Sử dụng Button component

const LoginFormScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState(""); // Username, email, or phone
  const [password, setPassword] = useState("");
  // Giữ lại state cho lỗi từng trường nếu Input component không tự xử lý hoàn toàn
  const [identifierError, setIdentifierError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { login, loading, error: authError } = useAuth(); // Đổi tên error để tránh trùng lặp

  const validateForm = () => {
    let isValid = true;
    setIdentifierError("");
    setPasswordError("");

    if (!identifier.trim()) {
      setIdentifierError("Username/Email/Phone is required");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    }
    return isValid;
  };

  const handleLogin = async () => {
    console.log("Login button clicked", { identifier, password });
    if (!validateForm()) {
      console.log("Validation failed");
      return;
    }

    try {
      console.log("Calling login with:", { identifier, password });
      await login(identifier, password);
      console.log("Login successful");
    } catch (err) {
      console.error("Login error:", err.message, err.stack);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => {
              /* Xử lý sự kiện nhấn nút trợ giúp */
            }}
          >
            <Text style={styles.helpIcon}>?</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Log in to Drama Social</Text>

          {authError && ( // Hiển thị lỗi chung từ API (nếu có)
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{authError}</Text>
            </View>
          )}

          <Input
            label="Username/Email/Phone"
            value={identifier}
            onChangeText={setIdentifier}
            placeholder="Enter your username, email, or phone"
            autoCapitalize="none"
            keyboardType="email-address" // Phù hợp chung
            error={identifierError} // Lỗi của trường này
            // style={styles.inputContainer} // Thêm style nếu cần
            inputStyle={styles.inputStyle}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            error={passwordError} // Lỗi của trường này
            // style={styles.inputContainer}
            inputStyle={styles.inputStyle}
          />

          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={() => {
              /* Xử lý sự kiện quên mật khẩu */
            }}
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          <Button
            title="Log In"
            onPress={handleLogin}
            loading={loading}
            disabled={loading} // || !identifier || !password ; có thể bỏ vì đã có validateForm
            style={styles.loginButton}
            textStyle={styles.loginButtonText}
          />

          <Text style={styles.orLoginWithText}>Or log in with</Text>

          <View style={styles.socialLoginContainer}>
            <TouchableOpacity style={styles.socialButtonPlaceholder}>
              {/* <Text>Social 1</Text> */}
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButtonPlaceholder}>
              {/* <Text>Social 2</Text> */}
            </TouchableOpacity>
          </View>

          <Text style={styles.termsText}>
            By continuing, you agree to our{" "}
            <Text
              style={styles.linkText}
              onPress={() => {
                /* Điều hướng đến Terms of Service */
              }}
            >
              Terms of Service
            </Text>{" "}
            to learn how we collect, use and share your data.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={styles.footer}>
        <Text style={styles.noAccountText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.signupText}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg, // Để có không gian cuộn
  },
  helpButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? spacing.md : spacing.lg + 5, // Điều chỉnh vị trí cho SafeAreaView
    left: spacing.lg,
    zIndex: 1,
    backgroundColor: colors.border, // Màu nền cho icon
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  helpIcon: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    fontWeight: "bold",
  },
  title: {
    fontSize: typography.fontSize.xxl - 2, // Điều chỉnh kích thước
    fontWeight: "bold",
    color: colors.black,
    marginTop: 80, // Khoảng cách từ top sau khi có help icon
    marginBottom: spacing.xl,
    textAlign: "left", // Căn lề trái
  },
  errorContainer: {
    backgroundColor: "#fef1f3", // Màu nền cho box lỗi chung
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    // marginBottom: spacing.xs, // Bỏ nếu Input component đã có error text riêng
  },
  // inputContainer: { // Nếu muốn thêm style cho container của Input component
  //   marginBottom: spacing.md,
  // },
  inputStyle: {
    backgroundColor: colors.background, // Màu nền cho input field
    // borderColor: colors.border, // Đã có trong Input.js
    // borderWidth: 1, // Đã có trong Input.js
    // borderRadius: 8, // Đã có trong Input.js
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end", // Căn phải
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: "500",
  },
  loginButton: {
    // Kế thừa từ Button.js, chỉ ghi đè nếu cần
    // backgroundColor: colors.primary, // Đã có trong Button.js type primary
    width: "100%", // Chiều rộng tối đa
    paddingVertical: 14, // Tăng padding cho nút to hơn
    marginTop: spacing.sm, // Khoảng cách nhỏ
  },
  loginButtonText: {
    // Kế thừa từ Button.js
    fontSize: typography.fontSize.md + 2, // Chữ to hơn
    // color: colors.white, // Đã có
    // fontWeight: 'bold', // Đã có
  },
  orLoginWithText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
    marginVertical: spacing.xl,
  },
  socialLoginContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  socialButtonPlaceholder: {
    backgroundColor: colors.border, // Màu nền placeholder
    height: 50,
    width: "48%", // Chia đôi không gian
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  termsText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: typography.fontSize.xs * 1.5,
    marginTop: spacing.lg,
    marginBottom: 100, // Để có không gian cho footer cố định
  },
  linkText: {
    color: colors.primary,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white, // Đảm bảo footer có nền
  },
  noAccountText: {
    fontSize: typography.fontSize.sm,
    color: colors.text, // Thay đổi màu cho phù hợp với thiết kế
  },
  signupText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: "bold",
  },
});

export default LoginFormScreen;
