// app/signin.js
import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  SafeAreaView, ScrollView, StatusBar, KeyboardAvoidingView, Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

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

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    if (!email || !password) {
      alert("Enter both email and password.");
      return;
    }
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // If email is verified, go in. Otherwise, route to verification screen.
        if (user.emailVerified) {
          console.log("✅ Logged in:", user.email);
          router.replace('/(tabs)');
        } else {
          // navigate to verify screen; user can resend/check from there
          router.replace('/verify_email');
        }
      } catch (error) {
        console.error(error.message);
        alert(error.message);
      }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#1E232C" />
          </TouchableOpacity>
          <Text style={styles.title}>Sign In</Text>
          <CustomTextInput icon="mail" placeholder="Enter your email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <CustomTextInput icon="lock" placeholder="Enter your password" value={password} onChangeText={setPassword} secureTextEntry />
          <TouchableOpacity style={styles.forgotPassword}><Text style={styles.linkText}>Forgot password?</Text></TouchableOpacity>
          <PrimaryButton title="Sign In" onPress={handleSignIn} />
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don’t have an account? </Text>
            <TouchableOpacity onPress={() => router.navigate('/signup')}>
              <Text style={[styles.footerText, styles.linkText]}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Styles (same as before)...
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F8FA' },
  scrollContainer: { padding: 24, flexGrow: 1, justifyContent: 'center' },
  backButton: { marginBottom: 24, alignSelf: 'flex-start' },
  title: { fontSize: 30, fontWeight: 'bold', color: '#1E232C', marginBottom: 32 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E8ECF4', borderRadius: 8, paddingHorizontal: 16, marginBottom: 20, height: 56 },
  inputIcon: { marginRight: 12 },
  textInput: { flex: 1, fontSize: 16, color: '#1E232C' },
  passwordToggle: { paddingLeft: 10 },
  primaryButton: { backgroundColor: '#4A90E2', borderRadius: 8, height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  primaryButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { fontSize: 16, color: '#6A707C' },
  linkText: { color: '#4A90E2', fontWeight: '600', fontSize: 14 },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 24 },
});
