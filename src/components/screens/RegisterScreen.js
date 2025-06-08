import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { colors, spacing, typography } from "../../theme";
import Input from "../common/Input";
import Button from "../common/Button";

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Full Name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setLoading(true);
    // TODO: Implement registration logic
    // This would typically use a Redux action or a hook like useAuth
    console.log("Registering with:", { name, email, password });
    // Giả lập gọi API
    const res = await authService.register(name, email, password);
    console.log("response from register", res);
    setLoading(false);
    // Nếu thành công, có thể điều hướng đến Login hoặc Feed
    // navigation.navigate('LoginForm');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sign Up</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Input
            // label="Full Name" // Thiết kế không có label riêng biệt bên trên
            value={name}
            onChangeText={setName}
            placeholder="Username"
            error={errors.name}
            autoCapitalize="words"
            inputStyle={styles.inputStyle}
            style={styles.inputContainer}
          />

          <Input
            // label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            keyboardType="email-address"
            error={errors.email}
            inputStyle={styles.inputStyle}
            style={styles.inputContainer}
          />

          <Input
            // label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            error={errors.password}
            inputStyle={styles.inputStyle}
            style={styles.inputContainer}
          />

          <Input
            // label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm Password"
            secureTextEntry
            error={errors.confirmPassword}
            inputStyle={styles.inputStyle}
            style={styles.inputContainer}
          />

          <Button
            title="Sign Up"
            onPress={handleRegister}
            loading={loading}
            style={styles.registerButton}
            textStyle={styles.registerButtonText}
            // type="outline" // Hoặc một type mới nếu cần cho style này
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("LoginForm")}>
          <Text style={styles.loginLink}>Log In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Thêm SafeAreaView vào đây nếu chưa có
import { SafeAreaView } from "react-native-safe-area-context";
import { authService } from "../../api/auth";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Để title ở giữa và có không gian cho nút back
    paddingHorizontal: spacing.md,
    paddingTop:
      Platform.OS === "android"
        ? StatusBar.currentHeight + spacing.sm
        : spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.white, // Nền header
    // borderBottomWidth: 1, // Nếu muốn có đường kẻ
    // borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.sm,
    width: 40, // Đảm bảo nút back có không gian đủ
    alignItems: "flex-start",
  },
  backButtonText: {
    fontSize: typography.fontSize.xxl, // Kích thước cho icon mũi tên
    color: colors.text,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg + 2, // Kích thước title
    fontWeight: "bold",
    color: colors.text,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg, // Thêm padding top cho scroll view
    paddingBottom: spacing.xl,
  },
  inputContainer: {
    marginBottom: spacing.md, // Khoảng cách giữa các input
  },
  inputStyle: {
    backgroundColor: colors.background, // Nền xám nhạt cho input
    borderColor: colors.background, // Viền cùng màu nền để không thấy viền
    // Hoặc nếu muốn có viền mờ:
    // borderColor: colors.border,
    // borderWidth: 1,
    fontSize: typography.fontSize.md,
    height: 56, // Chiều cao input
    paddingHorizontal: spacing.md,
  },
  registerButton: {
    marginTop: spacing.lg,
    backgroundColor: "#E5EAF0", // Màu nền xanh/xám rất nhạt cho nút Sign Up
    paddingVertical: spacing.md + 2,
    width: "100%",
    borderRadius: 8,
  },
  registerButtonText: {
    color: colors.black, // Chữ màu đen/xám đậm
    fontSize: typography.fontSize.md,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  loginText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  loginLink: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: "bold",
  },
});

export default RegisterScreen;
