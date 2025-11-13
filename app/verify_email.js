// app/verify_email.js
import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  sendEmailVerification,
  reload,
  signOut,
} from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function VerifyEmailScreen() {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    // If there's no signed-in user, take them to sign in
    if (!auth.currentUser) {
      router.replace('/signin');
      return;
    }
    // Optional: start a short cooldown only if we detect a recent send
    setCooldown(0);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCooldown = (secs = 30) => {
    setCooldown(secs);
    timerRef.current = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (!auth.currentUser) return router.replace('/signin');
    try {
      setSending(true);
      await sendEmailVerification(auth.currentUser);
      Alert.alert('Verification email sent', `Check the inbox for ${auth.currentUser.email}`);
      startCooldown(30);
    } catch (err) {
      console.error('sendEmailVerification error', err);
      Alert.alert('Error', err.message || 'Could not send verification email.');
    } finally {
      setSending(false);
    }
  };

  const handleCheckVerified = async () => {
    if (!auth.currentUser) return router.replace('/signin');
    setLoading(true);
    try {
      await reload(auth.currentUser);
      if (auth.currentUser.emailVerified) {
        Alert.alert('Email verified', 'Thanks — your email is verified now.');
        router.replace('/(tabs)');
      } else {
        Alert.alert('Not verified yet', 'Please open the verification link in your email and then tap "I have verified".');
      }
    } catch (err) {
      console.error('reload error', err);
      Alert.alert('Error', err.message || 'Could not check verification.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace('/signin');
    } catch (err) {
      console.error('signOut error', err);
      Alert.alert('Error', err.message || 'Could not sign out.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Feather name="mail" size={48} color="#4A90E2" style={{ marginBottom: 12 }} />
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.subtitle}>
          We've sent a verification link to:
        </Text>
        <Text style={styles.emailText}>{auth.currentUser?.email}</Text>

        <Text style={styles.note}>
          Open the link in your email to verify. Then come back and tap "I have verified".
        </Text>

        <TouchableOpacity
          style={[styles.button, cooldown > 0 && styles.buttonDisabled]}
          onPress={handleResend}
          disabled={sending || cooldown > 0}
        >
          {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{cooldown > 0 ? `Resend (${cooldown}s)` : 'Resend verification email'}</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleCheckVerified}>
          {loading ? <ActivityIndicator /> : <Text style={styles.secondaryButtonText}>I have verified — Check</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.link} onPress={handleSignOut}>
          <Text style={styles.linkText}>Sign out / Use different account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F8FA' },
  container: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#1E232C', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6A707C' },
  emailText: { marginTop: 8, fontSize: 16, color: '#4A90E2', fontWeight: '600', textAlign: 'center' },
  note: { textAlign: 'center', color: '#6A707C', marginVertical: 18, paddingHorizontal: 10 },
  button: { width: '85%', paddingVertical: 14, borderRadius: 8, backgroundColor: '#4A90E2', alignItems: 'center', marginTop: 8 },
  buttonDisabled: { backgroundColor: '#A9C5E3' },
  buttonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: { marginTop: 12, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, borderColor: '#E8ECF4', borderRadius: 8 },
  secondaryButtonText: { color: '#1E232C', fontWeight: '600' },
  link: { marginTop: 18 },
  linkText: { color: '#4A90E2' },
});
