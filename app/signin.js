// app/signin.js
import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  StatusBar,
  KeyboardAvoidingView, // Added for better keyboard handling
  Platform, // Added for platform-specific KeyboardAvoidingView behavior
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router'; // Correct expo-router import

// Ensure you have these installed:
// npx expo install @expo/vector-icons

// --- Reusable Components (can be moved to a separate /components folder if preferred) ---

const CustomTextInput = ({ icon, placeholder, value, onChangeText, secureTextEntry = false, keyboardType = 'default' }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  return (
    <View style={styles.inputContainer}>
      <Feather name={icon} size={20} color="#8391A1" style={styles.inputIcon} />
      <TextInput
        style={styles.textInput}
        placeholder={placeholder}
        placeholderTextColor="#8391A1"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!isPasswordVisible}
        autoCapitalize="none"
        keyboardType={keyboardType}
      />
      {secureTextEntry && (
        <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.passwordToggle}>
          <Feather name={isPasswordVisible ? 'eye-off' : 'eye'} size={20} color="#8391A1" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const PrimaryButton = ({ title, onPress }) => (
  <TouchableOpacity style={styles.primaryButton} onPress={onPress}>
    <Text style={styles.primaryButtonText}>{title}</Text>
  </TouchableOpacity>
);

const SocialButton = ({ service, iconName, iconColor }) => (
    <TouchableOpacity style={styles.socialButton}>
        <Ionicons name={iconName} size={22} color={iconColor} />
        <Text style={styles.socialButtonText}>Sign in with {service}</Text>
    </TouchableOpacity>
);

// --- Main SignIn Screen Component ---

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    console.log('Attempting to sign in:', { email, password });

    // --- Dummy Login Logic ---
    // For now, any non-empty email and password will be considered a success
    if (email.trim() !== '' && password.trim() !== '') {
      console.log('Dummy login successful!');
      // In a real app, you'd set isLoggedIn to true in a global state (e.g., Context API)
      // and then redirect. For this example, we directly redirect to the tabs.
      router.replace('/(tabs)'); // Redirect to the main tab navigator
    } else {
      alert('Please enter a dummy email and password.');
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} // Adjust as needed
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color="#1E232C" />
          </TouchableOpacity>
          
          <Text style={styles.title}>Sign In</Text>

          <CustomTextInput 
            icon="mail" 
            placeholder="Enter your email/mobile no" 
            value={email} 
            onChangeText={setEmail} 
            keyboardType="email-address" 
          />
          <CustomTextInput 
            icon="lock" 
            placeholder="Enter your password" 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry 
          />

          <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.linkText}>Forgot password?</Text>
          </TouchableOpacity>
          
          <PrimaryButton title="Sign In" onPress={handleSignIn} />

          <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.navigate('/signup')}>
                  <Text style={[styles.footerText, styles.linkText]}>Sign up</Text>
              </TouchableOpacity>
          </View>

          <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
          </View>

          <SocialButton service="Google" iconName="logo-google" iconColor="#DB4437" />
          <SocialButton service="Facebook" iconName="logo-facebook" iconColor="#4267B2" />

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FA', // Match UI background
  },
  scrollContainer: {
    padding: 24,
    flexGrow: 1, // Ensure scroll view can grow
    justifyContent: 'center', // Center content vertically
  },
  backButton: {
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 30, // Adjusted to match image
    fontWeight: 'bold',
    color: '#1E232C',
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8ECF4',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E232C',
  },
  passwordToggle: {
    paddingLeft: 10,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  linkText: {
    color: '#4A90E2', // Blue from image
    fontWeight: '600',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: '#4A90E2', // Blue from image
    borderRadius: 8,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 16,
    color: '#6A707C',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8ECF4',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#6A707C',
    fontSize: 14,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8ECF4',
    borderRadius: 8,
    height: 56,
    marginBottom: 16,
  },
  socialButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});