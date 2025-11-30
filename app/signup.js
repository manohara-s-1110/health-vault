// app/signup.js
import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  SafeAreaView, ScrollView, StatusBar, KeyboardAvoidingView, Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { auth } from '../firebaseConfig'; 
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';

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

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password || !agree) {
      alert("Please fill all fields and agree to Terms.");
      return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Update display name
        await updateProfile(userCredential.user, { displayName: name });

        // Send verification email
        await sendEmailVerification(userCredential.user);

        // Redirect to the verify screen instead of going into the app
        router.replace('/verify_email');

        console.log("✅ User registered (verification email sent):", userCredential.user.email);
      } catch (error) {
        console.error(error.message);
        alert(error.message);
      }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#1E232C" />
          </TouchableOpacity>

          <Text style={styles.title}>Sign Up</Text>

          <CustomTextInput icon="user" placeholder="Enter your name" value={name} onChangeText={setName} />
          <CustomTextInput icon="mail" placeholder="Enter your email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <CustomTextInput icon="lock" placeholder="Enter your password" value={password} onChangeText={setPassword} secureTextEntry />

          <View style={styles.checkboxContainer}>
            <TouchableOpacity onPress={() => setAgree(!agree)} style={[styles.checkbox, agree && styles.checkboxChecked]}>
              {agree && <Feather name="check" size={16} color="#fff" />}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>
              I agree to the healthcare <Text style={styles.linkText}>Terms</Text> and <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
          </View>

          <PrimaryButton title="Sign Up" onPress={handleSignUp} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.navigate('/signin')}>
              <Text style={[styles.footerText, styles.linkText]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  checkbox: { width: 20, height: 20, borderWidth: 1, borderColor: '#E8ECF4', borderRadius: 4, marginRight: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  checkboxChecked: { backgroundColor: '#4A90E2', borderColor: '#4A90E2' },
  checkboxLabel: { fontSize: 14, color: '#6A707C', flex: 1 },
});
