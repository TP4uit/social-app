import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView
} from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../../hooks/useAuth';

const LoginFormScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { login, loading, error } = useAuth();

  const validateForm = () => {
    let isValid = true;

    if (!username.trim()) {
      setUsernameError('Username is required');
      isValid = false;
    } else {
      setUsernameError('');
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await login(username, password);
      // Navigation is handled by the AppNavigator based on auth state
    } catch (error) {
      console.log('Login error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.appName}>Drama Social</Text>
        </View>

        <View style={styles.formContainer}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TextInput
            style={[styles.input, usernameError ? styles.inputError : null]}
            placeholder="Username, email or phone number"
            placeholderTextColor="#8e8e8e"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}

          <TextInput
            style={[styles.input, passwordError ? styles.inputError : null]}
            placeholder="Password"
            placeholderTextColor="#8e8e8e"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => {/* Handle forgot password */}}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.loginButton,
              (username && password) ? styles.loginButtonActive : {},
              loading ? styles.loginButtonLoading : {}
            ]}
            onPress={handleLogin}
            disabled={loading || !username || !password}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Logging in...' : 'Log in'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.orContainer}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.orLine} />
        </View>

        <TouchableOpacity style={styles.fbLoginButton}>
          <Text style={styles.fbLoginText}>Log in with Facebook</Text>
        </TouchableOpacity>

        <View style={styles.switchContainer}>
          <Text style={styles.noAccountText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.signupText}>Sign up.</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 35,
  },
  appName: {
    fontSize: 40,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Noteworthy' : 'normal',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 5,
    paddingHorizontal: 12,
    backgroundColor: '#fafafa',
    marginBottom: 12,
    fontSize: 14,
  },
  inputError: {
    borderColor: '#ed4956',
  },
  errorContainer: {
    backgroundColor: '#fef1f3',
    borderRadius: 5,
    padding: 10,
    marginBottom: 12,
  },
  errorText: {
    color: '#ed4956',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 2,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    color: '#00376b',
    fontSize: 12,
    fontWeight: '500',
  },
  loginButton: {
    height: 44,
    backgroundColor: '#b2dffc',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonActive: {
    backgroundColor: '#0095f6',
  },
  loginButtonLoading: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    width: '100%',
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#dbdbdb',
  },
  orText: {
    color: '#8e8e8e',
    fontSize: 12,
    fontWeight: '600',
    marginHorizontal: 18,
  },
  fbLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  fbLoginText: {
    color: '#00376b',
    fontSize: 14,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#dbdbdb',
    paddingTop: 15,
    width: '100%',
  },
  noAccountText: {
    color: '#262626',
    fontSize: 14,
  },
  signupText: {
    color: '#0095f6',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LoginFormScreen;