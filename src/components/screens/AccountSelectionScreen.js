// src/components/screens/AccountSelectionScreen.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { colors, spacing, typography } from '../../theme';

const AccountSelectionScreen = ({ navigation }) => {
  // Handle login with the selected account
  const handleLogin = () => {
    // Navigate to the regular login screen
    navigation.navigate('LoginForm');
  };
  
  // Handle switch accounts button
  const handleSwitchAccounts = () => {
    // This could navigate to a screen showing multiple accounts
    // For now, we'll just go to the regular login form too
    navigation.navigate('LoginForm');
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
        
        <View style={styles.profileContainer}>
          <Image 
            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
            style={styles.profileImage} 
          />
          <Text style={styles.username}>jacob_w</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={handleLogin}
        >
          <Text style={styles.loginButtonText}>Log in</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.switchAccountButton}
          onPress={handleSwitchAccounts}
        >
          <Text style={styles.switchAccountText}>Switch accounts</Text>
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
  profileContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 75,
    height: 75,
    borderRadius: 75/2,
    marginBottom: 12,
  },
  username: {
    fontSize: 14,
    color: '#262626',
    fontWeight: '600',
  },
  loginButton: {
    height: 44,
    backgroundColor: '#0095f6',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 18,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  switchAccountButton: {
    marginBottom: 30,
  },
  switchAccountText: {
    color: '#0095f6',
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

export default AccountSelectionScreen;